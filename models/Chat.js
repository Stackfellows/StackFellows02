const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    userEmail: { type: String, default: "anonymous" },
    messages: [
      {
        role: { type: String, enum: ["user", "model"], required: true },
        parts: [{ text: { type: String, required: true } }],
        timestamp: { type: Date, default: Date.now },
      },
    ],
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
