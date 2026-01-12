const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    content: {
      type: String, // Rich text HTML from Tiptap
      required: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    author: {
      type: String, // Can be extended to ref User if needed, but keeping simple as per request
      default: "Admin",
    },
    tags: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Published",
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate slug
blogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

module.exports = mongoose.model("Blog", blogSchema);
