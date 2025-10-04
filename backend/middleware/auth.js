import jwt from "jsonwebtoken";
import User from "../models/Users.model.js";

export const protactedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'jwt must be provided' });
  }
  const token = authHeader.split(' ')[1];
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
