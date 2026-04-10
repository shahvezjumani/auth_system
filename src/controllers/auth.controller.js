import User from "../models/user.model.js";
import { asyncHandler, ApiResponse, ApiError } from "../utils/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/index.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "userame, email and password are required");
  }

  const isAlreadyRegistered = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (isAlreadyRegistered) {
    throw new ApiError(409, "User with this email or userame already exists");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ username, email, password: hashPassword });
  user.password = undefined;

  const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: "1d",
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, "User registered successfully", { user, token }),
    );
});

const getMe = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Token not found");
  }

  const decoded = jwt.verify(token, config.JWT_SECRET);

  const user = await User.findById(decoded.id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetected successfully!"));
});

export { registerUser, getMe };
