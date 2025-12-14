const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./database/connect");

// Dotenv ko sabse pehle call karein, taaki environment variables load ho jaayen.
dotenv.config();

// Ab, routes files ko import karein.
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const clientAgreementRoutes = require("./routes/ClientAgreementRouter");
const expensesRoutes = require("./routes/expensesRoutes");
const chatRoutes = require("./routes/chatRoutes");
const imageRoutes = require("./routes/imageRoutes");
// ✅ Student Routes ka naya import
const studentRoutes = require("./routes/studentRoutes");

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/messages", contactRoutes);
app.use("/api/agreements", clientAgreementRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/images", imageRoutes);
// ✅ Students ka naya API endpoint
app.use("/api/students", studentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
