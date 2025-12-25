const express = require("express");
const router = express.Router();
const Review = require("../models/reviewModel"); // Path check karlein

// @route   POST /api/reviews
// @desc    Add a new review
router.post("/", async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;

    const newReview = new Review({
      name,
      email,
      rating,
      comment,
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/reviews
// @desc    Get all reviews (Latest first)
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
