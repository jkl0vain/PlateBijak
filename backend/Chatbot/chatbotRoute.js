import express from "express";
import { getGeminiResponse, getChatbotResponse } from "./chatbotService.js";

const router = express.Router();

router.post("/chatbot", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "Invalid message format" });
    }

    // Rule-based response first
    let reply = getChatbotResponse(userMessage);

    // If rule-based returns the "not sure" line, then use Gemini
    if (!reply || reply.includes("🤖 I’m not sure")) {
      console.log("Rule-based unsure, asking Gemini...");
      reply = await getGeminiResponse(userMessage);
    }

    res.json({ response: reply });
  } catch (err) {
    console.error("Error in /chatbot route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
