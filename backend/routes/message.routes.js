import express from "express";
import { protactedRoute } from "../middleware/auth.js";
import {
  deleteForAll,
  deleteForMe,
  getMessage,
  getUsersForSidebar,
  markAsDelivered,
  marksMessageAsSeen,
  sendMessage,
} from "../controllers/Message.controller.js";

const messageRouter = express.Router();

//get user 
messageRouter.get("/users", protactedRoute, getUsersForSidebar);

//get message
messageRouter.get("/:id", protactedRoute, getMessage);

//mark as seen
messageRouter.patch("/mark/:id", protactedRoute, marksMessageAsSeen);

//send message
messageRouter.post('/send/:id',protactedRoute,sendMessage)

//delivery status
messageRouter.patch('/delivered/:id',protactedRoute,markAsDelivered)

//delete all
messageRouter.delete('/delete/all/:id',protactedRoute,deleteForAll)

//delete for me
messageRouter.delete('/delete/me/:id', protactedRoute,deleteForMe)

export default messageRouter;
