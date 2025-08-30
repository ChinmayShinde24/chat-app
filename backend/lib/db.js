import mongoose from "mongoose";

//Function to connect with th edatabase

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database connected succesfully")
    );
    await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
  } catch (err) {
    console.log("Error while connecting the database : ", err);
  }
};


