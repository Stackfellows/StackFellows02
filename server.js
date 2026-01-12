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

const path = require("path");
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
app.use("/api/blogs", require("./routes/blogRoutes"));

// Serve sitemap.xml and robots.txt from frontend `public/` so they are available at site root
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(__dirname, '..', 'public', 'sitemap.xml'), (err) => {
    if (err) {
      console.error('sitemap not found:', err.message);
      res.status(404).send('Not found');
    }
  });
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, '..', 'public', 'robots.txt'), (err) => {
    if (err) {
      console.error('robots.txt not found:', err.message);
      res.status(404).send('Not found');
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
