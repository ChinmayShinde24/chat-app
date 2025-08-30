import Message from "../models/Message.model.js";
import User from "../models/Users.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

//get all users except logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    //Count num of msg not seen
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (err) {
    console.log("Error in get all users", err);
    res.json({ success: false, message: err.message });
  }
};

//Get all mesg for selecetd user
export const getMessage = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );
    res.json({ success: true, messages });

  } catch (err) {
    console.log("Error in all msg ", err);
    res.json({ success: false, message: err.messages });
  }
};

//Mark msg as seen
export const marksMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (err) {
    console.log("Error while seeing the marked message : ", err);
    res.json({ success: false, message: err.message });
  }
};

// export const marksMessageAsSeen = async (req, res) => {
//     try {
//       const { id } = req.params; // message id
//       const myId = req.user._id; // current logged in user

//       // Check if message exists
//       const message = await Message.findById(id);
//       if (!message) {
//         return res.json({ success: false, message: "Message not found" });
//       }

//       // (Optional but good) check if user is authorized to see this message
//       if (message.receiver.toString() !== myId.toString()) {
//         return res.json({ success: false, message: "Not authorized to mark this message" });
//       }

//       // Update seen flag
//       await Message.findByIdAndUpdate(id, { seen: true });

//       res.json({ success: true });
//     } catch (err) {
//       console.log("Error while seeing the marked message : ", err);
//       res.json({ success: false, message: err.message });
//     }
//   };

//Send msg to selecetd user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;
    
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    //Emit new msg to the receiver socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.json({ success: true, newMessage });
  } catch (err) {
    console.log("Error in sending a message :", err);
    res.json({ success: false, message: err.message });
  }
};
