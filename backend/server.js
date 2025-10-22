import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./lib/db.js";

import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import groupRouter from "./routes/Group.routes.js";

// ✅ Import socket handler
import chatSocket from "./socket/chat.socket.js";

const app = express();
const server = http.createServer(app);

// ✅ Initialize socket.io
export const io = new Server(server, {
  cors: { origin: "*" },
});

// ✅ Global user socket map
export const userSocketMap = {};

// ✅ Initialize socket handling
chatSocket(io);

// ✅ Middlewares
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// ✅ Routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/group", groupRouter);

// ✅ Connect to MongoDB
await connectDB();

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
