import { userSocketMap } from "../server.js";
import { Group } from "../models/Group.model.js";

export default function chatSocket(io) {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    console.log(`⚡ User connected: ${userId}`);

    // Broadcast online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // 🟢 One-to-One Message
    socket.on("sendMessage", ({ to, message }) => {
      const receiverSocketId = userSocketMap[to];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
      }
    });

    // 🟢 Group Message
    socket.on("sendGroupMessage", async ({ groupId, message }) => {
      const group = await Group.findById(groupId).select("members");
      if (group) {
        group.members.forEach(memberId => {
          const memberSocketId = userSocketMap[memberId];
          if (memberSocketId) {
            io.to(memberSocketId).emit("group:message", { groupId, message });
          }
        });
      }
    });

    // 🟡 User Disconnect
    socket.on("disconnect", () => {
      if (userId) delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      console.log(`🔴 User disconnected: ${userId}`);
    });
  });
}
