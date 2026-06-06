import express from "express";
import * as dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // Mencegah crash jika key kosong
});

const app = express();

// Setel Header CORS Manual
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
      return res.status(400).send({ error: "Prompt is required" });
    }

    // Menggunakan model gpt-3.5-turbo standar
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 2000,
    });

    // Validasi apakah respon dari openai ada isinya sebelum dikirim ke frontend
    if (response && response.choices && response.choices[0]) {
      res.status(200).send({
        bot: response.choices[0].message.content,
      });
    } else {
      res.status(500).send({ error: "Invalid response from OpenAI" });
    }
  } catch (error) {
    console.error("OpenAI Error Details:", error);
    // Mengembalikan pesan error asli dari OpenAI ke frontend agar kita tahu penyebabnya
    res.status(500).send({ error: error.message || "Something went wrong" });
  }
});

export default app;
