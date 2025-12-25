const express = require("express");
const router = express.Router();
const IntrnProfile = require("../models/IntrnProfileModel");

// 🟢 GET: Saare profiles fetch karein
router.get("/", async (req, res) => {
  try {
    const profiles = await IntrnProfile.find().sort({ createdAt: -1 });
    res.status(200).json(profiles);
  } catch (err) {
    res.status(500).json({ message: "Fetch Error", error: err.message });
  }
});

// 🔵 POST: Naya profile save karein
router.post("/", async (req, res) => {
  try {
    const { fullName, position, bio, imageUrl } = req.body;
    if (!fullName || !position || !bio) {
      return res.status(400).json({ message: "Fields missing!" });
    }
    const profile = new IntrnProfile({ fullName, position, bio, imageUrl });
    await profile.save();
    res.status(201).json({ success: true, message: "Saved!" });
  } catch (err) {
    res.status(400).json({ message: "Save Error", error: err.message });
  }
});

// 🔴 DELETE: Profile delete karein
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProfile = await IntrnProfile.findByIdAndDelete(id);
    if (!deletedProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Deleted successfully!", id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
