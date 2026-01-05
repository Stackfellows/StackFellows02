const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./database/connect");

dotenv.config();

// Imports
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const clientAgreementRoutes = require("./routes/ClientAgreementRouter");
const expensesRoutes = require("./routes/expensesRoutes");
const chatRoutes = require("./routes/chatRoutes");
const imageRoutes = require("./routes/imageRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const studentRoutes = require("./routes/studentRoutes");
const intrnProfileRoutes = require("./routes/intrnprofileRoutes");
const newsletterRoutes = require("./routes/newsRoutes");

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("Stack Fellows API is running..."));

app.use("/api/users", userRoutes);
app.use("/api/messages", contactRoutes);
app.use("/api/agreements", clientAgreementRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/newsletter", newsletterRoutes); // ✅ Newsletter API
app.use("/api/admin/internal-profiles", intrnProfileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
