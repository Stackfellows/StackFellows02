const express = require("express");
const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");

const router = express.Router();

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD,
  },
});

// ✅ Route to get all contact messages
router.get("/", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// ✅ Route to submit a new contact message
router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ msg: "Please fill in all fields." });
  }

  try {
    const newContact = new Contact({
      name,
      email,
      subject,
      message,
    });

    await newContact.save();

    // Admin ko email bhej rahe hain
    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Message from ${name} - ${subject || "No Subject"}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #6B46C1;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || "N/A"}</p>
          <p><strong>Message:</strong></p>
          <p style="background-color: #f4f4f4; padding: 15px; border-radius: 8px;">${message}</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(201).json({ msg: "Message sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
});

// ✅ New: Route to update a message's status and send a reply
router.put("/:id", async (req, res) => {
  try {
    const { status, reply, clientEmail } = req.body;
    const { id } = req.params;

    const updatedMessage = await Contact.findByIdAndUpdate(
      id,
      { status, reply },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ msg: "Message not found" });
    }

    const companyImageUrl =
      "https://res.cloudinary.com/dpskpjjmy/image/upload/v1756652273/Stackfellows_jfukyj.jpg";

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: clientEmail,
      subject: `Re: ${
        updatedMessage.subject || "Your Message to Stack Fellows"
      }`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="margin-bottom: 20px; text-align: center;">
            <img src="${companyImageUrl}" alt="Stack Fellows" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px;">
          </div>
          <h2 style="color: #6B46C1;">Dear ${updatedMessage.name},</h2>
          <p>Thank you for reaching out to us. Here is our reply to your message:</p>
          <div style="border-left: 3px solid #6B46C1; padding-left: 15px; margin-bottom: 20px;">
            <p><strong>Admin's Reply:</strong></p>
            <p>${reply}</p>
          </div>
          <hr style="border-top: 1px dashed #ddd; margin: 20px 0;">
          <p style="color: #666;"><strong>--- Original Message ---</strong></p>
          <p><strong>Subject:</strong> ${updatedMessage.subject || "N/A"}</p>
          <p>${updatedMessage.message}</p>
          <p>Best regards,</p>
          <p>The Stack Fellows Team</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending reply email:", error);
      } else {
        console.log("Reply email sent:", info.response);
      }
    });

    res.json({ msg: "Reply sent successfully!", updatedMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
