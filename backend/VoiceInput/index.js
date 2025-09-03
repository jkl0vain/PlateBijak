import "dotenv/config";
import express from "express";
import multer from "multer";
import { SpeechClient } from "@google-cloud/speech";
import cors from "cors";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import tmp from "tmp";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const client = new SpeechClient();

console.log("🔑 GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

app.use(
  cors({
    origin: "http://localhost:5173", // your frontend
    methods: ["GET", "POST"],
  })
);

app.use((req, res, next) => {
  console.log("📥 Incoming request:", req.method, req.url);
  next();
});

// ✅ Root test route
app.get("/", (req, res) => {
  console.log("📥 Root (/) route hit!");
  res.send("Hello from backend 👋");
});

// ✅ Health check
app.get("/ping", (req, res) => {
  console.log("✅ /ping was called");
  res.json({ msg: "pong" });
});

// 🔧 Helper: convert audio buffer to mono wav file at 16kHz
function convertToMono(buffer) {
  return new Promise((resolve, reject) => {
    const inputTmp = tmp.fileSync({ postfix: ".wav" });
    const outputTmp = tmp.fileSync({ postfix: ".wav" });

    fs.writeFileSync(inputTmp.name, buffer);

    ffmpeg(inputTmp.name)
      .audioChannels(1)
      .audioFrequency(16000)
      .toFormat("wav")
      .on("end", () => {
        const converted = fs.readFileSync(outputTmp.name);
        inputTmp.removeCallback();
        outputTmp.removeCallback();
        resolve(converted);
      })
      .on("error", (err) => reject(err))
      .save(outputTmp.name);
  });
}

// 🎤 Speech-to-Text route
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      console.log("❌ No file received at backend");
      return res.status(400).json({ text: null, error: "No audio uploaded" });
    }

    console.log("📂 File received:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    console.log("🔄 Converting to mono/16kHz...");
    const convertedBuffer = await convertToMono(req.file.buffer);
    console.log("✅ Conversion done, sending to Google...");

    const audioBytes = convertedBuffer.toString("base64");

    const [response] = await client.recognize({
      audio: { content: audioBytes },
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "en-US",
      },
    });

    const transcription =
      response.results?.map((r) => r.alternatives[0].transcript).join(" ") || "";

    console.log("📝 Transcription:", transcription || "(empty)");
    res.json({ text: transcription });
  } catch (err) {
    console.error("❌ Transcription error:", err);
    res.status(500).json({ text: null, error: err.message || String(err) });
  }
});

// 🚀 Start backend on port 5000 sbb localhost 4000 ain dh guna dlm index.ts
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`)
);
