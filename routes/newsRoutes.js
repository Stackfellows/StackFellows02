const express = require("express");
const router = express.Router();
const Newsletter = require("../models/newsModel");
const nodemailer = require("nodemailer");

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD,
  },
});

// --- 1. SUBSCRIBE ROUTE (Same as your original for consistency) ---
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
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <img src="https://res.cloudinary.com/dpskpjjmy/image/upload/v1756652273/Stackfellows_jfukyj.jpg" 
                 alt="Stack Fellows" 
                 style="width: 100%; max-width: 600px; height: auto; border-radius: 8px;">
          </div>
          <h2 style="color: #6B46C1; text-align: center;">Welcome to the Club!</h2>
          <p>Hi there,</p>
          <p>Thank you for subscribing to the <strong>Stack Fellows</strong> newsletter. We are thrilled to have you with us!</p>
          <ul style="color: #555;">
            <li>Latest tech insights and trends.</li>
            <li>Exclusive updates on our digital solutions.</li>
            <li>Special offers and project showcases.</li>
          </ul>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #6B46C1; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">"Empowering businesses with cutting-edge digital solutions."</p>
          </div>
          <p>If you have any questions, feel free to reply to this email.</p>
          <p style="margin-top: 30px;">Best regards,<br>
          <strong style="color: #6B46C1;">The Stack Fellows Team</strong></p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="text-align: center; font-size: 11px; color: #999;">
            Johar Town, Lahore, Pakistan <br>
            © 2025 Stack Fellows. All rights reserved.
          </p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions);
    res
      .status(201)
      .json({ success: true, message: "Success! Please check your inbox." });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(400)
        .json({ success: false, message: "Already subscribed." });
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});

// --- 2. BROADCAST ROUTE (Ab design bilkul Subscribe jaisa hai) ---
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
        .json({ success: false, message: "No active subscribers found." });
    }

    const mailOptions = {
      from: `"Stack Fellows" <${process.env.ADMIN_EMAIL}>`,
      bcc: emailList, // Privacy ke liye BCC use kiya
      subject: subject,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <img src="https://res.cloudinary.com/dpskpjjmy/image/upload/v1756652273/Stackfellows_jfukyj.jpg" 
                 alt="Stack Fellows Update" 
                 style="width: 100%; max-width: 600px; height: auto; border-radius: 8px;">
          </div>
          
          <h2 style="color: #6B46C1; text-align: center;">New Update for You!</h2>
          
          <p>Dear Subscriber,</p>
          
          <div style="background-color: #ffffff; padding: 10px 0;">
            <p>${message}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #6B46C1; margin: 20px 0; text-align: center;">
             <a href="https://stackfellows.com" style="color: #6B46C1; text-decoration: none; font-weight: bold;">Visit Our Official Website</a>
          </div>
          
          <p>Thank you for being a part of our journey.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>
          <strong style="color: #6B46C1;">The Stack Fellows Team</strong></p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="text-align: center; font-size: 11px; color: #999;">
            Johar Town, Lahore, Pakistan <br>
            © 2025 Stack Fellows. All rights reserved. <br>
            <a href="#" style="color: #6B46C1; text-decoration: none;">Unsubscribe</a>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: `Broadcast delivered successfully to ${emailList.length} subscribers.`,
    });
  } catch (error) {
    console.error("Broadcast Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error processing broadcast." });
  }
});

module.exports = router;
