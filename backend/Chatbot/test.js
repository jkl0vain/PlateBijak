import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  // Start chat with first message as "user"
  const chat = model.startChat({
    history: [
      {
        role: "user", // MUST be "user"
        parts: [{ text: "You are PlateBijak AI assistant. Answer concisely." }],
      },
    ],
  });

  const result = await chat.sendMessage("YOU ARE NOOBBBB");
  console.log(result.response.text());
}

test();
