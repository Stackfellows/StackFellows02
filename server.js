const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./database/connect");

dotenv.config();

const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const clientAgreementRoutes = require("./routes/ClientAgreementRouter");
const expensesRoutes = require("./routes/expensesRoutes");
const chatRoutes = require("./routes/chatRoutes");
const imageRoutes = require("./routes/imageRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const studentRoutes = require("./routes/studentRoutes");

// ✅ Internship Routes ka naya import
const intrnProfileRoutes = require("./routes/intrnprofileRoutes");
const newsletterRoutes = require("./routes/newsRoutes");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Root Route: Ye check karne ke liye ke API live hai
app.get("/", (req, res) => {
  res.send("Stack Fellows API is running...");
});

app.use("/api/users", userRoutes);
app.use("/api/messages", contactRoutes);
app.use("/api/agreements", clientAgreementRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/reviews", reviewRoutes);

app.use("/api/newsletter", newsletterRoutes);

// ✅ Internship Profiles ka API endpoint
app.use("/api/admin/internal-profiles", intrnProfileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
