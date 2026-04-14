import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_MODEL = "gemini-2.5-flash";
const OPENAI_MODEL = "gpt-4o-mini";

const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6
].filter(Boolean);

const OPENAI_KEYS = [
  process.env.OPENAI_API_KEY_1,
  process.env.OPENAI_API_KEY_2
].filter(Boolean);

let geminiIndex = 0;
let openaiIndex = 0;

async function callGemini(prompt) {
  for (let attempt = 0; attempt < GEMINI_KEYS.length; attempt++) {
    const key = GEMINI_KEYS[geminiIndex];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error?.message || "";

        if (res.status === 429 || msg.includes("Quota")) {
          geminiIndex = (geminiIndex + 1) % GEMINI_KEYS.length;
          continue;
        }

        throw new Error(msg);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error("Respuesta vacía Gemini");

      return text;

    } catch (err) {
      geminiIndex = (geminiIndex + 1) % GEMINI_KEYS.length;
    }
  }

  throw new Error("Gemini no disponible");
}


async function callOpenAI(prompt) {
  for (let attempt = 0; attempt < OPENAI_KEYS.length; attempt++) {
    const key = OPENAI_KEYS[openaiIndex];

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            { role: "user", content: prompt }
          ]
        })
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error?.message || "";

        if (res.status === 429 || msg.includes("quota")) {
          openaiIndex = (openaiIndex + 1) % OPENAI_KEYS.length;
          continue;
        }

        throw new Error(msg);
      }

      const text = data.choices?.[0]?.message?.content;

      if (!text) throw new Error("Respuesta vacía OpenAI");

      return text;

    } catch (err) {
      openaiIndex = (openaiIndex + 1) % OPENAI_KEYS.length;
    }
  }

  throw new Error("OpenAI no disponible");
}

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "El prompt es obligatorio" });
  }

  try {
    const text = await callGemini(prompt);
    return res.json({ provider: "gemini", text });
  } catch (err) {
    console.warn("Gemini falló, usando OpenAI...");
  }

  try {
    const text = await callOpenAI(prompt);
    return res.json({ provider: "openai", text });
  } catch (err) {
    return res.status(500).json({
      error: "Todos los servicios están saturados"
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Gemini keys: ${GEMINI_KEYS.length}`);
  console.log(`OpenAI keys: ${OPENAI_KEYS.length}`);
});