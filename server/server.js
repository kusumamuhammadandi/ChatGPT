import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai"; // Perubahan di sini

dotenv.config();

// Menggunakan inisialisasi SDK baru
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// CORS diletakkan paling atas setelah inisialisasi app
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from CodeX!",
  });
});

app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    // Menggunakan chat.completions dan model gpt-3.5-turbo (lebih baru & murah)
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
      bot: response.choices[0].message.content, // Cara ambil teks di SDK baru
    });
  } catch (error) {
    console.error(error);
    // Pastikan selalu mengirim respon JSON meskipun error agar CORS tidak terblokir
    res.status(500).send({ error: error.message || "Something went wrong" });
  }
});

// Gunakan process.env.PORT agar Render bisa menentukan port sendiri secara otomatis
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`AI server started on port ${PORT}`));
