import express from "express";
import { protactedRoute } from "../middleware/auth.js";
import {
  getMessage,
  getUsersForSidebar,
  marksMessageAsSeen,
  sendMessage,
} from "../controllers/Message.controller.js";

const messageRouter = express.Router();

messageRouter.get("/users", protactedRoute, getUsersForSidebar);
messageRouter.get("/:id", protactedRoute, getMessage);
messageRouter.get("/mark/:id", protactedRoute, marksMessageAsSeen);
messageRouter.post('/send/:id',protactedRoute,sendMessage)

export default messageRouter;
