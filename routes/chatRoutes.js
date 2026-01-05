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

    // --- ENHANCED KNOWLEDGE BASE WITH COMMON TECH FAQs ---
    const systemPrompt = `
    You are the "Stack Fellows AI Concierge". Communicate EXCLUSIVELY in Professional English.

    CORE IDENTITY:
    - Stack Fellows is a premium Digital Agency & Academy in Johar Town, Lahore.
    - Tagline: "Fellows Stack It, Grow It."

    COMMON TECH & BUSINESS FAQs (Use these for answers):
    1. PROJECT TIMELINE: Small projects take 2-4 weeks. Enterprise solutions take 3-6 months.
    2. TECH STACK: We specialize in MERN (MongoDB, Express, React, Node.js), Next.js, TypeScript, and Python for AI integration.
    3. PRICING: We offer custom quotes based on project complexity. We focus on ROI-driven development.
    4. ACADEMY JOB GUARANTEE: We don't just teach; we provide career support, resume building, and direct referrals to top firms.
    5. INTERNSHIP CERTIFICATION: Yes, all interns receive a verifiable digital certificate upon successful completion.
    6. WHY US?: We use an "Architecture First" approach, ensuring 99.9% code quality and SEO optimization from Day 1.

    LEADERSHIP:
    - CEO: Zeeshan Haider.
    - Co-Founder: Muhammad Asad Ullah.
    - MD: Farukh Amir | HR: Tania Kumari.
    - Marketing: Ayesha Batool & Usman Haider.

    STRICT GUIDELINES:
    - Do not mention pricing figures; ask the user to "Consult our Experts" for a custom quote.
    - If asked about a service not listed (like Graphic Design), mention that we focus on "Engineering Growth through Code" but can discuss custom digital strategies.
    - Always stay professional and never use Urdu/Roman Urdu.
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
