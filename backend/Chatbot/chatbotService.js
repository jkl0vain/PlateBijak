import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



// Keep a persistent chat session so the system prompt is always used
let chatSession = null;

export async function getGeminiResponse(userMessage) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    if (!chatSession) {
      chatSession = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "You are PlateBijak AI assistant. Answer based on the prompt and correct" }],
          },
        ],
        generationConfig: { temperature: 0.7 },
      });
    }

    const result = await chatSession.sendMessage(userMessage);
    return result.response.text();
  } catch (err) {
    console.error("Error in Gemini API call:", err);
    return null;
  }
}


// Rule-based fallback
export function getChatbotResponse(userInput) {
  if (!userInput) {
    return "Hi there! How can I assist you today? You can ask me anything about PlateBijak.";
  }

  const input = userInput.toLowerCase();

  if (input.includes("plate") || input.includes("number")) {
    return "🔎 PlateBijak checks and validates license plate numbers in real-time. You can scan your plate number using your camera or upload a photo for instant recognition!";
  }

  if (input.includes("voice") || input.includes("mic") || input.includes("speak")) {
    return "🎙️ With PlateBijak, you can use voice input to fill in car details like make, model, or color. Just tap the mic and speak instead of typing!";
  }

  if (input.includes("typo") || input.includes("spelling") || input.includes("wrong word")) {
    return "🤖 Don’t worry if you type 'Toyta' instead of 'Toyota' — PlateBijak uses AI to auto-correct vehicle makes and models.";
  }

  if (input.includes("model") && input.includes("year")) {
    return "📅 PlateBijak cross-checks make + model + year. Example: If you enter Myvi 2025, it will suggest the nearest valid year instead ✅.";
  }

  if (input.includes("camera") || input.includes("ocr") || input.includes("scan")) {
    return "📸 You can scan your car plate using the camera. PlateBijak will extract and validate it instantly using OCR.";
  }

  if (input.includes("fraud") || input.includes("suspicious") || input.includes("block")) {
    return "🛡️ PlateBijak has AI that detects suspicious user behavior and blocks repeated fake or spammy inputs.";
  }

  if (input.includes("what is") || input.includes("platebijak")) {
    return "🚘 PlateBijak is a smart vehicle data validation assistant. It helps users enter details faster and more accurately using camera, AI, and voice input — reducing errors before data is submitted.";
  }

  return "🤖 I’m not sure how to help with that. Try asking about plate validation, camera scan, voice input, typo correction, or suspicious activity detection.";
}



// Validation helper
/*export function isGeminiReplyCorrect(reply) {
  const c = reply.toLowerCase();
  return (
    c.includes("plate") ||
    c.includes("number") ||
    c.includes("voice") ||
    c.includes("mic") ||
    c.includes("speak") ||
    c.includes("typo") ||
    c.includes("spelling") ||
    c.includes("wrong word") ||
    c.includes("model") ||
    c.includes("year") ||
    c.includes("camera") ||
    c.includes("ocr") ||
    c.includes("scan") ||
    c.includes("fraud") ||
    c.includes("suspicious") ||
    c.includes("block") ||
    c.includes("what is") ||
    c.includes("platebijak")
  );
}*/

/*module.exports = {
    getGeminiResponse,
    getChatbotResponse,
    isGeminiReplyCorrect
}*/
