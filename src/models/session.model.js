import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      rref: "User",
      required: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
