const express = require("express");
const router = express.Router();
const Expense = require("../models/Expenses.js");
const nodemailer = require("nodemailer");

// Nodemailer transporter setup (like in ClientAgreementRouter.js)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD,
  },
});

// ✅ Route to get all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ New: Route to add a new expense
router.post("/", async (req, res) => {
  const expense = new Expense({
    name: req.body.name,
    email: req.body.email,
    description: req.body.description,
    amount: req.body.amount,
    type: req.body.type,
    date: req.body.date,
    imageUrl: req.body.imageUrl, // ✅ New: Image URL ko yahan shamil kiya gaya hai
  });

  try {
    const newExpense = await expense.save();

    // Expense details ke liye email bhej rahe hain
    const companyImageUrl =
      "https://res.cloudinary.com/dpskpjjmy/image/upload/v1756652273/Stackfellows_jfukyj.jpg";

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: newExpense.email,
      subject: `Expense Confirmation from Stack Fellows`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="margin-bottom: 20px; text-align: center;">
            <img src="${companyImageUrl}" alt="Stack Fellows" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px;">
          </div>
          <h2 style="color: #6B46C1;">Dear ${newExpense.name},</h2>
          <p>This email is to confirm that an expense has been added for you with the following details:</p>
          <ul style="list-style-type: none; padding: 0;">
            <li><strong>Type:</strong> ${newExpense.type} Expense</li>
            <li><strong>Description:</strong> ${newExpense.description}</li>
            <li><strong>Amount:</strong> PKR ${newExpense.amount.toLocaleString()}</li>
            <li><strong>Date:</strong> ${new Date(
              newExpense.date
            ).toLocaleDateString()}</li>
          </ul>
          ${
            newExpense.imageUrl
              ? `<p><strong>Attachment:</strong></p><img src="${newExpense.imageUrl}" alt="Expense Receipt" style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 10px;">`
              : ""
          }
          <p>If you have any questions, please feel free to contact us.</p>
          <p>Best regards,</p>
          <p>The Stack Fellows Team</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending expense email:", error);
      } else {
        console.log("Expense email sent:", info.response);
      }
    });

    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ New: Route to update an expense
router.put("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ New: Route to delete an expense
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
