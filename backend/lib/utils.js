import jwt from "jsonwebtoken";

//Genrate a token
export const genrateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  return token
};
