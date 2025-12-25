const mongoose = require("mongoose");

const IntrnProfileSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  position: { type: String, required: true },
  bio: { type: String, required: true },
  imageUrl: { type: String, default: "" }, // Store Cloudinary or local path
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("IntrnProfile", IntrnProfileSchema);
