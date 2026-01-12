const express = require("express");
const router = express.Router();
const Blog = require("../models/blogModel");

// @route   POST /api/blogs
// @desc    Create a new blog post
router.post("/", async (req, res) => {
  try {
    console.log("Creating new blog post:", req.body);
    const { title, excerpt, content, coverImage, author, tags, status } =
      req.body;

    const newBlog = new Blog({
      title,
      excerpt,
      content,
      coverImage,
      author,
      tags,
      status,
    });

    const savedBlog = await newBlog.save();
    console.log("Blog created successfully:", savedBlog._id);
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error("Error creating blog:", error); // Console log for error handling
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/blogs
// @desc    Get all blog posts
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all blogs...");
    const blogs = await Blog.find().sort({ createdAt: -1 });
    console.log(`Found ${blogs.length} blogs.`);
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/blogs/:id
// @desc    Get single blog by ID
router.get("/:id", async (req, res) => {
  try {
    console.log(`Fetching blog with ID: ${req.params.id}`);
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      console.log("Blog not found for ID:", req.params.id);
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(blog);
  } catch (error) {
    console.error(`Error fetching blog ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/blogs/:id
// @desc    Update a blog post
router.put("/:id", async (req, res) => {
  try {
    console.log(`Updating blog ID: ${req.params.id}`, req.body);
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      console.log("Blog not found for update:", req.params.id);
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log("Blog updated successfully:", updatedBlog._id);
    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error(`Error updating blog ${req.params.id}:`, error);
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog post
router.delete("/:id", async (req, res) => {
  try {
    console.log(`Deleting blog ID: ${req.params.id}`);
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

    if (!deletedBlog) {
      console.log("Blog not found for deletion:", req.params.id);
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log("Blog deleted successfully:", req.params.id);
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error(`Error deleting blog ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
