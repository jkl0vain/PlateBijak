import "dotenv/config";
import express from "express";
import cors from "cors";
import chatbotRoute from "./chatbotRoute.js";

const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());
app.use("/api", chatbotRoute);

app.get("/", (req, res) => {
  res.send("Hello from backend, ChatBot server is running! :D");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
