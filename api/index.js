import express from "express";
import * as dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const app = express();

// Setel Header CORS Manual secara eksplisit
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send({ message: "Hello from CodeX Vercel!" });
});

app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).send({ error: "Prompt tidak boleh kosong" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 2000,
    });

    // PENTING: Perbaikan pengecekan kondisi response agar tidak memicu crash
    if (response && response.choices && response.choices[0]) {
      res.status(200).send({
        bot: response.choices[0].message.content,
      });
    } else {
      res.status(500).send({ error: "Respon dari OpenAI tidak valid" });
    }
  } catch (error) {
    console.error("OpenAI Error Details:", error);
    res.status(500).send({ error: error.message || "Something went wrong" });
  }
});

// WAJIB DI VERCEL SERVERLESS: Ekspor app Express Anda
export default app;
