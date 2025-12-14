const express = require("express");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

const router = express.Router();

// Multer middleware for handling file uploads in memory
const storage = multer.memoryStorage();

// ✅ NEW: File Filter function to restrict uploads to only images
const fileFilter = (req, file, cb) => {
  // Only allow files starting with 'image/' (e.g., image/jpeg, image/png)
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    // Error message for unsupported file types
    cb(
      new Error(
        "File type not supported. Please upload an image (JPEG, PNG, GIF, WebP)."
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  // ✅ NEW: Set file size limit to 5MB (5 * 1024 * 1024 bytes)
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  // ✅ Apply the file filter
  fileFilter: fileFilter,
});

// Configure Cloudinary with your credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =============================
// Cloudinary Image Upload/Deletion Routes
// =============================

// POST /api/images/upload - Upload an image to Cloudinary
router.post(
  "/upload",
  (req, res, next) => {
    // ✅ IMPROVED ERROR HANDLING: Multer errors ko yahan capture kiya gaya hai
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // For example, FILE_TOO_LARGE error
        return res
          .status(400)
          .json({
            error: `Upload Error: ${err.message}. Maximum size is 5MB.`,
          });
      } else if (err) {
        // Custom errors from fileFilter
        return res.status(400).json({ error: err.message });
      }
      // Agar koi error nahi hai, toh next middleware (Cloudinary upload logic) par proceed karein
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "No file uploaded or file type not supported." });
      }

      const streamUpload = (request) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              // Optional: files ko Cloudinary par organize karne ke liye folder use karein
              folder: "stackfellows_uploads",
            },
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          stream.end(request.file.buffer);
        });
      };

      const result = await streamUpload(req);
      res.json({ imageUrl: result.secure_url, public_id: result.public_id });
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      res
        .status(500)
        .json({
          error:
            error.message || "Image upload failed during Cloudinary transfer.",
        });
    }
  }
);

// POST /api/images/delete-image - Delete an image from Cloudinary
router.post("/delete-image", async (req, res) => {
  const { public_id } = req.body;
  if (!public_id) {
    return res.status(400).json({ error: "Missing public_id for deletion." });
  }
  try {
    const result = await cloudinary.uploader.destroy(public_id);

    // Deletion confirmation check
    if (result.result === "not found") {
      return res
        .status(404)
        .json({ success: false, msg: "Image not found on Cloudinary." });
    }

    // ✅ Successful deletion response
    res.json({ success: true, msg: "Image deleted successfully.", result });
  } catch (error) {
    console.error("Cloudinary Deletion Error:", error);
    res.status(500).json({ error: error.message || "Image deletion failed." });
  }
});

module.exports = router;
