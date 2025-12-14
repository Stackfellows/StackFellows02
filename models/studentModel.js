const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  className: { type: String, required: true },
  feeAmount: { type: Number, required: true },
  feeStatus: { type: String, default: "Unpaid" },

  // ✅ FIX IS HERE: attendance ko Array of Objects define karein
  attendance: [
    {
      date: {
        type: Date,
        required: true,
      },
      present: {
        type: Boolean,
        default: false,
      },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Student", studentSchema);
