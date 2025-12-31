const express = require("express");
const router = express.Router();
const Newsletter = require("../models/newsModel");
const nodemailer = require("nodemailer");

// --- Stabilized Transporter for Render ---
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS ke liye false
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Render/Hosting issues se bachne ke liye
  },
  connectionTimeout: 20000, // 20 seconds tak wait karega
});

// --- 1. SUBSCRIBE ROUTE ---
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    const mailOptions = {
      from: `"Stack Fellows" <${process.env.ADMIN_EMAIL}>`,
      to: email,
      subject: "Welcome to Stack Fellows Newsletter!",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <img src="https://res.cloudinary.com/dpskpjjmy/image/upload/v1756652273/Stackfellows_jfukyj.jpg" alt="Stack Fellows" style="width: 100%; max-width: 600px; border-radius: 8px;">
          </div>
          <h2 style="color: #6B46C1; text-align: center;">Welcome to the Club!</h2>
          <p>Thank you for subscribing to <strong>Stack Fellows</strong>. We're excited to have you!</p>
          <p style="text-align: center; font-size: 11px; color: #999; margin-top: 30px;">© 2025 Stack Fellows. All rights reserved.</p>
        </div>
      `,
    };

    // Confirm email bhejte waqt error catch karein
    transporter
      .sendMail(mailOptions)
      .catch((err) => console.error("Welcome Email Error:", err));

    res
      .status(201)
      .json({ success: true, message: "Success! Check your inbox." });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(400)
        .json({ success: false, message: "Already subscribed." });
    res.status(500).json({ success: false, message: "Server Error." });
  }
});

// --- 2. BROADCAST ROUTE ---
router.post("/broadcast", async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Subject and message are required." });
    }

    const subscribers = await Newsletter.find({}, "email");
    const emailList = subscribers.map((s) => s.email);

    if (emailList.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No subscribers found." });
    }

    const mailOptions = {
      from: `"Stack Fellows" <${process.env.ADMIN_EMAIL}>`,
      bcc: emailList,
      subject: subject,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <img src="https://res.cloudinary.com/dpskpjjmy/image/upload/v1756652273/Stackfellows_jfukyj.jpg" alt="Update" style="width: 100%; border-radius: 8px;">
          </div>
          <h2 style="color: #6B46C1; text-align: center;">New Update!</h2>
          <p>${message}</p>
          <div style="text-align: center; margin-top: 20px;">
             <a href="https://stackfellows.com" style="color: #6B46C1; font-weight: bold;">Visit Our Website</a>
          </div>
        </div>
      `,
    };

    // Wait for email sending
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: `Broadcast sent to ${emailList.length} subscribers.`,
    });
  } catch (error) {
    console.error("DETAILED BROADCAST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Connection Timeout. Please try again.",
    });
  }
});

module.exports = router;
