import mongoose from "mongoose";
import config from "./index.js";

const connectDB = async () => {
  try {
    await mongoose.connect(config.DB_URI);
    console.log("Connected to DB");
  } catch (err) {
    console.log("Error connecting to DB", err);
  }
};

export default connectDB;
