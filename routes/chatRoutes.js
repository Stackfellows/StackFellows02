const express = require("express");
const router = require("express").Router();
const Groq = require("groq-sdk");
const Chat = require("../models/Chat");

const groq = new Groq({
  apiKey: process.env.GROK_API_KEY,
});

router.post("/ask", async (req, res) => {
  const { message, chatId } = req.body;

  try {
    let chat;
    let history = [];

    if (chatId && chatId !== "null") {
      chat = await Chat.findById(chatId);
      if (chat) {
        history = chat.messages.map((m) => ({
          role: m.role === "model" ? "assistant" : "user",
          content: m.parts[0].text,
        }));
      }
    }

    if (!chat) {
      chat = new Chat({ messages: [] });
    }

    // --- MEGA KNOWLEDGE BASE: LEADERSHIP, PARTNERSHIPS, INTERNS & FAQS ---
    const systemPrompt = `
    You are the "Stack Fellows AI Concierge". Communicate EXCLUSIVELY in Professional English.
    Location: Johar Town, Lahore. Tagline: "Fellows Stack It, Grow It."

    ***NEW OFFICIAL ANNOUNCEMENT (2026)***
    - STRATEGIC PARTNERSHIP: Stack Fellows (Ecosystem Leader) has partnered with LM BITS (Software Specialists).
    - GOAL: Merging industry-leading engineering with creative software development.
    - FOCUS: Unified Software Development, Advanced AI Ops, and Global Scalability.
    - MANTRA: "Innovation x Precision."

    LEADERSHIP:
    - CEO: Zeeshan Haider | Co-Founder: Muhammad Asad Ullah.
    - MD: Farukh Amir | HR: Tania Kumari.
    - Marketing: Ayesha Batool & Usman Haider.

    OUR INTERNSHIP STARS:
    - Bushra Maskeen: Full Stack (BS IT). Expert in HTML/CSS/JS.
    - Alisha Babar: MERN Stack & Next.js. Expert in Technical Writing.
    - Jaweria Khan: Web Dev & Sales Executive. Expert in Lead Generation.
    - Sehrish Zarin: MERN & UI/UX (Figma). Expert in API Testing.
    - Sumbul Jawed: Frontend & AI Agents. Specialist in Tailwind & Sanity CMS.

    CLIENT & PROJECT FAQS:
    - SERVICES: MERN Stack, Next.js, AI Integration, Scalable Enterprise Solutions.
    - WHY STACK FELLOWS?: We use an "Architecture First" approach ensuring 99.9% code quality.
    - TIMELINE: MVPs 2-4 weeks. Large scale systems 3-6 months.
    - PRICING: "We provide custom ROI-driven quotes. Please consult our experts for a detailed proposal."
    - AI OPS: We integrate Advanced AI Ops for business automation via the LM BITS partnership.

    STUDENT & ACADEMY FAQS:
    - COURSES: Full Stack Development (MERN), Next.js, AI Agent Construction, UI/UX.
    - INTERNSHIPS: We offer hands-on experience on live global projects.
    - JOB ASSISTANCE: We offer career support, resume building, and direct referrals to top firms.
    - CERTIFICATES: All graduates receive verifiable digital certificates.
    - ADMISSION: Apply if you are passionate about engineering growth through code.

    STRICT GUIDELINES:
    - ALWAYS remain professional. 
    - NEVER use Urdu or Roman Urdu.
    - If asked about the partnership, highlight that we now offer "Global Scalability" and "Advanced AI Ops" through the LM BITS collaboration.
    `;

    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 800,
    });

    const botResponse = response.choices[0].message.content;

    chat.messages.push({ role: "user", parts: [{ text: message }] });
    chat.messages.push({ role: "model", parts: [{ text: botResponse }] });
    await chat.save();

    res.status(200).json({
      success: true,
      reply: botResponse,
      chatId: chat._id,
    });
  } catch (error) {
    console.error("Stack Fellows Bot Error:", error.message);
    res.status(500).json({
      success: false,
      message:
        "The assistant is currently unavailable. Please try again later.",
    });
  }
});

module.exports = router;
