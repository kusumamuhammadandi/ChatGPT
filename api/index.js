import express from "express";
import * as dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// 1. ATUR HEADER CORS SECARA MANUAL AGAR VERCEL TIDAK MEMBLOKIR
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

  // Tangani preflight request (OPTIONS) langsung di sini
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send({
    message: "Hello from CodeX Vercel!",
  });
});

app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    res.status(200).send({
      bot: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).send({ error: error.message || "Something went wrong" });
  }
});

// WAJIB UNTUK VERCEL SERVERLESS: jangan gunakan app.listen()
export default app;
