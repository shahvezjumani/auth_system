import User from "../models/user.model.js";
import { asyncHandler, ApiResponse, ApiError } from "../utils/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import Session from "../models/session.model.js";

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

  const refreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: "7d",
  });

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const session = await Session.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user agent"],
  });

  const accessToken = jwt.sign(
    { id: user._id, session: session._id },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  res
    .status(201)
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json(
      new ApiResponse(201, "User registered successfully", {
        user,
        accessToken,
      }),
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

const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const session = await Session.findOne({ refreshTokenHash, revoked: false });
  if (!session) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded.id);

  const newAccessToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: "15m",
  });

  const newRefreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: "7d",
  });

  session.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
  await session.save();

  res
    .cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json(
      new ApiResponse(200, "Token refreshed successfully", {
        accessToken: newAccessToken,
      }),
    );
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await Session.findOneAndUpdate(
    { refreshTokenHash, revoked: false },
    { revoked: true },
  );

  res
    .clearCookie("refreshToken")
    .status(200)
    .json(new ApiResponse(200, "Logged out successfully"));
});

export { registerUser, getMe, refreshToken, logout };
