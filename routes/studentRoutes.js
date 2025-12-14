const express = require("express");
const router = express.Router();
const Student = require("../models/studentModel"); // Path adjust karein agar zaroorat ho
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD,
  },
});

// ✅ Utility function to generate PDF receipt as a buffer (ADDED ROBUSTNESS FOR feeAmount)
const generateReceiptPdf = (student, classTime) => {
  return new Promise((resolve, reject) => {
    // PDF Document initialization
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      resolve(Buffer.concat(buffers)); // Stream ko buffer mein convert kiya
    });
    doc.on("error", reject);

    const isPaid = student.feeStatus === "Paid";
    const dateString = new Date().toLocaleDateString(); // --- 1. Top Banner/Header Area (Y: 50)

    doc
      .fillColor("#6B46C1")
      .rect(50, 50, 500, 70)
      .fill()
      .fillColor("white")
      .fontSize(28)
      .text("STACK FELLOWS", 0, 70, { align: "center" })
      .fontSize(12)
      .text("Professional IT Training & Consulting", 0, 98, {
        align: "center",
      }); // --- 2. Receipt Title (Y: 150)

    doc
      .fillColor("#333")
      .fontSize(22)
      .text("FEE & ENROLLMENT RECEIPT", 50, 150);
    doc
      .fontSize(10)
      .fillColor("#555")
      .text(`Date Issued: ${dateString}`, 50, 180, { align: "right" }); // --- 3. Paid/Unpaid Stamp Tag (Rotated)

    doc
      .save()
      .translate(450, 150)
      .rotate(-20, { origin: [0, 0] })
      .fillColor(isPaid ? "#4CAF50" : "#F44336")
      .rect(-10, -10, 130, 35)
      .fill()
      .fillColor("white")
      .fontSize(14)
      .text(student.feeStatus.toUpperCase(), -5, 5, {
        align: "center",
        width: 120,
      })
      .restore(); // --- 4. Student Details Section

    let currentY = 250;
    doc.fillColor("#6B46C1").fontSize(16).text("Student Details", 50, currentY);
    doc
      .strokeColor("#ddd")
      .lineWidth(1)
      .moveTo(50, currentY + 2)
      .lineTo(550, currentY + 2)
      .stroke();
    currentY += 20; // Move Y after title and line

    const labelX = 60;
    const valueX = 220;
    const labelWidth = 150;
    const valueWidth = 330;

    const detailRow = (label, value) => {
      const startY = currentY; // Calculate height needed for the value (in case of wrapping)
      const valueHeight = doc.heightOfString(value, {
        width: valueWidth,
      });
      const rowHeight = Math.max(valueHeight, 18);

      doc
        .fillColor("#555")
        .fontSize(12)
        .text(label, labelX, startY, { width: labelWidth });

      doc.fillColor("#333").text(value, valueX, startY, { width: valueWidth });

      currentY += rowHeight + 2; // Update cursor position
    };

    detailRow("Student Name:", student.name || "N/A");
    detailRow("Email:", student.email || "N/A");
    detailRow("Phone:", student.phone || "N/A");
    detailRow("Course Enrolled:", student.className || "N/A");
    detailRow("Expected Class Time:", classTime || "N/A");

    currentY += 15; // Space after details section // --- 5. Financial Summary Section

    currentY += 10;
    doc
      .fillColor("#6B46C1")
      .fontSize(16)
      .text("Financial Summary", 50, currentY);
    doc
      .strokeColor("#ddd")
      .lineWidth(1)
      .moveTo(50, currentY + 2)
      .lineTo(550, currentY + 2)
      .stroke();
    currentY += 20; // --- Total Amount Row (Table Structure) ---

    const totalFeeY = currentY;
    // ✅ ROBUSTNESS FIX: Ensure feeAmount is a number for toLocaleString
    const safeFeeAmount = Number(student.feeAmount) || 0;
    const formattedFee = safeFeeAmount.toLocaleString();

    doc.fillColor("#333").fontSize(14).text("Total Course Fee:", 60, totalFeeY);
    doc.fillColor("#000").text(`PKR ${formattedFee}`, 400, totalFeeY, {
      align: "right",
      width: 150,
    });
    currentY += 30; // --- Status Row (Highlighted and Fixed Position) ---

    const statusY = currentY; // Background highlight

    doc
      .fillColor("#F0F0F0")
      .rect(50, statusY - 5, 500, 30)
      .fill(); // Label

    doc.fillColor("#000").fontSize(16).text("CURRENT STATUS:", 60, statusY); // Status Value

    doc
      .fillColor(isPaid ? "#4CAF50" : "#F44336")
      .text(student.feeStatus.toUpperCase(), 400, statusY, {
        align: "right",
        width: 150,
        fontWeight: "bold",
      });

    currentY += 40; // Space after status section // --- 6. Key Course Policy & Benefits Section (NEW SECTION ADDED HERE)

    currentY += 10;
    doc
      .fillColor("#6B46C1")
      .fontSize(16)
      .text("Key Course Policies & Benefits", 50, currentY);
    doc
      .strokeColor("#ddd")
      .lineWidth(1)
      .moveTo(50, currentY + 2)
      .lineTo(550, currentY + 2)
      .stroke();
    currentY += 25; // Space after title and line

    const policyList = [
      "2 Free Demo Classes: You are entitled to 2 free demo classes before committing to the full course.",
      "Advance Fee Policy: The advance fee is only required after you complete and are satisfied with the two free demo classes.",
      "Free E-Certificate: You will receive an E-Certificate upon successful completion of the course, free of cost.",
      "Free Portfolio Website: We will help you build your professional portfolio website from the start of the course, completely free of cost.",
    ];

    doc.fillColor("#333").fontSize(10);

    policyList.forEach((policy) => {
      // Check if new page is needed
      if (currentY + 30 > 750) {
        doc.addPage();
        currentY = 50;
      }

      doc.fillColor("#333").text(`• ${policy}`, 60, currentY, {
        width: 490,
        align: "left",
      }); // Calculate the height taken by the text, plus a small gap (5 points)
      currentY += doc.heightOfString(`• ${policy}`, { width: 490 }) + 5;
    });

    currentY += 20; // Space after policies // --- 7. Signature Line (Flow continues from the policies section)

    doc
      .fillColor("#333")
      .fontSize(10)
      .text("Authorized Signature", 400, currentY, { align: "left" })
      .text("--------------------------------", 400, currentY + 10, {
        align: "left",
      });
    currentY += 40; // --- 8. Footer (Gmail) - Fixed to bottom

    doc.fillColor("#777").fontSize(9).text(
      "For support and queries, please email us: stackfellows@gmail.com",
      50,
      780, // Fixed position near bottom
      { align: "center", width: 500 }
    );

    doc.end();
  });
};

// @route   POST /api/students
// @desc    Add a new student (with PDF and Admin Reminder)
// @access  Private (Admin only)
router.post("/", async (req, res) => {
  const { name, email, phone, className, feeAmount, feeStatus, attendance } =
    req.body; // Basic validation

  if (!name || !email || !className || !feeAmount) {
    return res
      .status(400)
      .json({ message: "Please enter all required fields" });
  }

  try {
    const student = new Student({
      name,
      email,
      phone,
      className,
      feeAmount,
      feeStatus,
      attendance,
    });

    const createdStudent = await student.save(); // --- Email Logic with PDF Attachment ---

    const classTime =
      "Flexible / To be Scheduled (Please contact Admin for timing)"; // 1. Generate PDF Receipt (Awaiting PDF Buffer)

    const pdfBuffer = await generateReceiptPdf(createdStudent, classTime); // 2. Email to Student (with PDF Attachment and Professional HTML Body)

    const studentMailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: createdStudent.email,
      subject: `Welcome to Stack Fellows - Enrollment Confirmed! (Fee Receipt Attached)`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dpskpjjmy/image/upload/v1756652273/Stackfellows_jfukyj.jpg" alt="Company Image" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px;">
          </div>
          <h2 style="color: #6B46C1;">Dear ${createdStudent.name},</h2>
          <p>Congratulations! Your enrollment for the <strong>${
        createdStudent.className
      }</strong> course has been successfully processed by Stack Fellows.</p>
          <p>A detailed Fee Receipt (with all course, fee, and status information) has been attached to this email in PDF format.</p>
          
          <div style="margin-top: 20px; padding: 10px; background-color: #f4f4f4; border-left: 4px solid #6B46C1;">
              <p><strong>Course:</strong> ${createdStudent.className}</p>
              <p><strong>Fee Status:</strong> <span style="font-weight: bold; color: ${
        createdStudent.feeStatus === "Paid" ? "#4CAF50" : "#F44336"
      };">${createdStudent.feeStatus}</span></p>
          </div>

          <h3 style="color: #6B46C1; margin-top: 30px;">Key Course Benefits & Policies:</h3>
          <ul style="list-style-type: square; padding-left: 20px; margin-top: 10px; color: #555;">
              <li style="margin-bottom: 8px;">You are entitled to **2 Free Demo Classes** before committing to the full course.</li>
              <li style="margin-bottom: 8px;">The **Advance Fee** is only required after you complete and are satisfied with the two free demo classes.</li>
              <li style="margin-bottom: 8px;">You will receive an **E-Certificate** upon successful completion of the course.</li>
              <li style="margin-bottom: 8px;">We will help you **build your professional portfolio website** from the start of the course, completely free of cost.</li>
          </ul>
          <p style="margin-top: 20px;">We are excited to help you achieve your goals!</p>
          <p>Best regards,</p>
          <p>The Stack Fellows Team</p>
          
          <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px; text-align: center; font-size: 12px; color: #777;">
              <p style="margin-top: 5px;"><a href="mailto:stackfellows684@gmail.com" style="color: #6B46C1; font-weight: bold; text-decoration: none;">stackfellows@gmail.com</a></p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Fee_Receipt_${createdStudent.name.replace(
            /\s/g,
            "_"
          )}.pdf`,
          content: pdfBuffer, // ✅ This will send the generated PDF
          contentType: "application/pdf",
        },
      ],
    };

    transporter.sendMail(studentMailOptions, (error, info) => {
      if (error) {
        console.error("Error sending enrollment email to student:", error);
      } else {
        console.log("Enrollment email sent to student:", info.response);
      }
    }); // 3. Email to Admin (Reminder/Notification)

    const adminMailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `NEW STUDENT ALERT: ${createdStudent.name} Enrolled`,
      html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #6B46C1; border-radius: 8px;">
                <h3 style="color: #6B46C1;">New Student Enrollment Notification</h3>
                <p>A new student has been added to the system:</p>
                <ul style="list-style: disc; margin-left: 20px;">
                    <li><strong>Name:</strong> ${createdStudent.name}</li>
                    <li><strong>Email:</strong> ${createdStudent.email}</li>
                    <li><strong>Course:</strong> ${
        createdStudent.className
      }</li>
                    <li><strong>Fee Amount:</strong> PKR ${createdStudent.feeAmount.toLocaleString()}</li>
                    <li><strong>Fee Status:</strong> <span style="font-weight: bold; color: ${
        createdStudent.feeStatus === "Paid" ? "#4CAF50" : "#F44336"
      };">${createdStudent.feeStatus}</span></li>
                </ul>
                <p>Please verify details and schedule the class time. (Fee Receipt PDF was sent to the student.)</p>
                <p style="font-style: italic; font-size: 11px; color: #888;">Note: Student was informed about the 2 Free Demo Classes, Advance Fee Policy, E-Certificate, and the free Portfolio Website benefits.</p>
                <p style="font-size: 12px; color: #777;">System Reminder</p>
            </div>
        `,
    };

    transporter.sendMail(adminMailOptions, (error, info) => {
      if (error) {
        console.error("Error sending admin notification email:", error);
      } else {
        console.log("Admin notification email sent:", info.response);
      }
    }); // --- End Email Logic ---
    res.status(201).json(createdStudent);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Student with this email already exists" });
    }
    // ✅ CRITICAL LOGGING: Log the full error object for better debugging
    console.error("============================================");
    console.error("CRITICAL ERROR: New Student POST Route Failed");
    console.error("Error Details:", error);
    console.error("============================================");

    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/students
// @desc    Fetch all students
// @access  Private (Admin only)
router.get("/", async (req, res) => {
  try {
    const students = await Student.find({});
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student details (e.g., attendance/feeStatus)
// @access  Private (Admin only)
router.put("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (student) {
      const oldFeeStatus = student.feeStatus; // Update student fields

      student.name = req.body.name || student.name;
      student.email = req.body.email || student.email;
      student.phone = req.body.phone || student.phone;
      student.className = req.body.className || student.className;
      student.feeAmount = req.body.feeAmount || student.feeAmount;
      student.feeStatus = req.body.feeStatus || student.feeStatus;
      student.attendance = req.body.attendance || student.attendance;

      const updatedStudent = await student.save(); // Update Confirmation Email Logic (Only if Fee Status changes)

      if (oldFeeStatus !== updatedStudent.feeStatus) {
        // Agar fee status change hua hai, to student ko update email bhejo (simple HTML)
        const mailOptions = {
          from: process.env.ADMIN_EMAIL,
          to: updatedStudent.email,
          subject: `Fee Status Updated - Stack Fellows`,
          html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                  <div style="text-align: center; margin-bottom: 20px;">
                      <img src="https://res.cloudinary.com/dpskpjjmy/image/upload/v1756652273/Stackfellows_jfukyj.jpg" alt="Company Image" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px;">
                  </div>
                  <h2 style="color: #6B46C1;">Dear ${updatedStudent.name},</h2>
                  <p>Your fee status for the <strong>${
            updatedStudent.className
          }</strong> course has been updated by the admin team.</p>
                  <p><strong>New Fee Status:</strong> <span style="font-weight: bold; color: ${
            updatedStudent.feeStatus === "Paid" ? "#4CAF50" : "#F44336"
          };">${updatedStudent.feeStatus}</span></p>
                  <p>If the status is 'Paid', please consider this your payment confirmation.</p>
                  <p>Best regards,</p>
                  <p>The Stack Fellows Team</p>
              </div>
          `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending student update email:", error);
          } else {
            console.log("Student update email sent:", info.response);
          }
        });
      }

      res.json(updatedStudent);
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete a student
// @access  Private (Admin only)
router.delete("/:id", async (req, res) => {
  try {
    const result = await Student.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
