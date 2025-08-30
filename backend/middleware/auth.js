import jwt from "jsonwebtoken";
import User from "../models/Users.model.js";

export const protactedRoute = async (req, res, next) => {
  try {
    const token = req.headers.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password ");
    if (!user) return res.json({ success: false, message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    console.log("Error in auth :", err);
    res.json({ success: false, message: err.message });
  }
};
