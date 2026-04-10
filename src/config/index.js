import dotenv from "dotenv";

dotenv.config();

if (!process.env.DB_URI) {
  throw new Error("DB_URI is not defined in environment variables");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const config = {
  DB_URI: process.env.DB_URI,
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET,
};

export default config;
