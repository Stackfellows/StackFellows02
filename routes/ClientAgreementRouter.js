const express = require("express");
const ClientAgreement = require("../models/ClientAgreement");
const nodemailer = require("nodemailer"); // Nodemailer ko import kar liya

const router = express.Router();

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD,
  },
});

// @route   GET /api/agreements
// @desc    Get all client agreements
// @access  Public
router.get("/", async (req, res) => {
  try {
    const agreements = await ClientAgreement.find();
    res.json(agreements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   POST /api/agreements
// @desc    Submit a new client agreement
// @access  Public
router.post("/", async (req, res) => {
  try {
    const newAgreement = new ClientAgreement(req.body);

    await newAgreement.save();

    // Client ko email bhej rahe hain
    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: newAgreement.clientEmail,
      subject: `New Agreement Confirmation from Stack Fellows`,
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://res.cloudinary.com/dpskpjjmy/image/upload/v1756652273/Stackfellows_jfukyj.jpg" alt="Company Image" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px;">
      </div>
      <h2 style="color: #6B46C1;">Dear ${newAgreement.clientName},</h2>
      <p>This email is to confirm that a new agreement for the project <strong>${
        newAgreement.project
      }</strong> has been created with us.</p>
      <p><strong>Total Amount:</strong> ${newAgreement.totalAmount} PKR</p>
      <p><strong>Deadline:</strong> ${newAgreement.agreementEnd.toLocaleDateString()}</p>
      <p>We are excited to start working with you!</p>
      <p>Best regards,</p>
      <p>The Stack Fellows Team</p>
    </div>
  `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending agreement email:", error);
      } else {
        console.log("Agreement email sent:", info.response);
      }
    });

    res.status(201).json({ msg: "Agreement submitted successfully!" });
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ msg: "Error submitting agreement", error: err.message });
  }
});

// @route   PUT /api/agreements/:id
// @desc    Update a client agreement
// @access  Public
router.put("/:id", async (req, res) => {
  try {
    const agreement = await ClientAgreement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!agreement) {
      return res.status(404).json({ msg: "Agreement not found" });
    }

    // Client ko email bhej rahe hain
    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: agreement.clientEmail,
      subject: `Update on Your Agreement from Stack Fellows`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #6B46C1;">Dear ${agreement.clientName},</h2>
          <p>This is to inform you that your agreement for the project <strong>${agreement.project}</strong> has been updated.</p>
          <p><strong>New Status:</strong> ${agreement.status}</p>
          <p>You can check the updated details on our portal.</p>
          <p>Best regards,</p>
          <p>The Stack Fellows Team</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending update email:", error);
      } else {
        console.log("Update email sent:", info.response);
      }
    });

    res.json({ msg: "Agreement updated successfully!", agreement });
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ msg: "Error updating agreement", error: err.message });
  }
});

// @route   DELETE /api/agreements/:id
// @desc    Delete a client agreement
// @access  Public
router.delete("/:id", async (req, res) => {
  try {
    const agreement = await ClientAgreement.findByIdAndDelete(req.params.id);
    if (!agreement) {
      return res.status(404).json({ msg: "Agreement not found" });
    }
    res.json({ msg: "Agreement removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
