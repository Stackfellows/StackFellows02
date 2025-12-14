const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["Company", "Team"], required: true },
  date: { type: Date, default: Date.now },
  imageUrl: { type: String, required: false }, // ✅ New field for the image URL
});

module.exports = mongoose.model("Expense", expenseSchema);
