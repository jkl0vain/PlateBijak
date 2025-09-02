import express from "express";
import { getGeminiResponse, getChatbotResponse } from "./chatbotService.js";

const router = express.Router();

router.post("/chatbot", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "Invalid message format" });
    }

    // Call Gemini first
    let reply = await getGeminiResponse(userMessage);

    // Fallback to rule-based if API fails
    if (!reply) {
      console.warn("Gemini reply failed, using fallback.");
      reply = getChatbotResponse(userMessage);
    }

    res.json({ response: reply });
  } catch (err) {
    console.error("Error in /chatbot route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
