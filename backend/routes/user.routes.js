import express from "express";
import {
  checkAuth,
  login,
  signup,
  updateProfile,
} from "../controllers/User.controllers.js";
import { protactedRoute } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protactedRoute, updateProfile);
userRouter.get("/check", protactedRoute, checkAuth);

export default userRouter;
