const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Google Gemini library import kiya

const router = express.Router();

// Initialize the Generative AI client with your new API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Local knowledge base for Stack Fellows info (wahi rahega)
const stackFellowsKB = {
  about: `Stack Fellows ek passionate team hai developers aur digital marketing experts ki jo businesses ko digital duniya mein aage badhne mein madad karte hain. Hum technical expertise ko creative vision ke saath jod kar aise solutions dete hain jo na sirf behtareen dikhte hain, balki result-driven bhi hain.`,
  services: `Hum nimnlikhit services provide karte hain:
- Web Development: Custom websites aur web applications modern technologies ke saath.
- Mobile App Development: iOS aur Android ke liye native aur cross-platform apps.
- Digital Marketing: Online presence badhane ke liye comprehensive strategies.
- Analytics & Insights: Data-driven insights se performance ko optimize karte hain.
- UI/UX Design: Behtareen user-centered designs.
- E-commerce Solutions: Payment integration aur inventory management ke saath complete platforms.`,
  team: `Hamari team mein ye experts hain:
- M Asad Ullah: Project Manager & Developer.
- Zeeshan Haider: Full Stack Developer.
- Khansha Rana: Frontend Developer.
- Soma Khalil: Digital Marketing Expert.
- Rameen Meer: Full Stack Developer.
- Aman Fatima: Full Stack Developer.`,
  technologies: `Hum in technologies ka upyog karte hain:
- Frontend: React.js, Bootstrap, Tailwind CSS, daisyui, HTML, CSS, Framer Motion.
- Backend: Node.js, Express.js, Postman, Thunder Client, Npm.
- Database: MongoDB.
- Tools & Platforms: Git, GitHub, Figma, Vercel, Render, Netlify.`,
  contact: `Aap humse in methods se contact kar sakte hain:
- Email: stackfellows684@gmail.com
- Phone: +92 309 1499394
- Address: Johar Town, Lahore
Hum 24/7 support provide karte hain.`,
};

// Function to check if user's message matches local KB keywords (wahi rahega)
const getLocalResponse = (message) => {
  const lowerCaseMessage = message.toLowerCase();
  if (
    lowerCaseMessage.includes("about") ||
    lowerCaseMessage.includes("hum kaun hain")
  ) {
    return stackFellowsKB.about;
  }
  if (
    lowerCaseMessage.includes("services") ||
    lowerCaseMessage.includes("kya karte hain")
  ) {
    return stackFellowsKB.services;
  }
  if (
    lowerCaseMessage.includes("team") ||
    lowerCaseMessage.includes("members") ||
    lowerCaseMessage.includes("employees")
  ) {
    return stackFellowsKB.team;
  }
  if (
    lowerCaseMessage.includes("technologies") ||
    lowerCaseMessage.includes("tech stack")
  ) {
    return stackFellowsKB.technologies;
  }
  if (
    lowerCaseMessage.includes("contact") ||
    lowerCaseMessage.includes("support") ||
    lowerCaseMessage.includes("address") ||
    lowerCaseMessage.includes("email") ||
    lowerCaseMessage.includes("phone")
  ) {
    return stackFellowsKB.contact;
  }
  return null;
};

// API route for chatbot interaction
router.post("/", async (req, res) => {
  try {
    const { history, message } = req.body;

    if (!message) {
      return res.status(400).json({ msg: "Message is required" });
    }

    // Check for local response first
    const localResponse = getLocalResponse(message);
    if (localResponse) {
      return res.json({ text: localResponse });
    }

    // Ab Gemini API call
    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const text = response.text();

    res.json({ text });
  } catch (err) {
    console.error("Gemini API Error:", err);
    res
      .status(500)
      .json({ msg: "Error from chatbot. Please try again later." });
  }
});

module.exports = router;
