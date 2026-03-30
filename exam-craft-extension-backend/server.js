import express from 'express';
import cors from 'cors';
import fs from 'fs';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const MODEL = "gemini-2.5-flash"; 

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
].filter(Boolean);

let currentKeyIndex = 0; 

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "El prompt es obligatorio" });
  }

  if (API_KEYS.length === 0) {
    return res.status(500).json({ error: "No hay API Keys configuradas" });
  }

  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    const keyToUse = API_KEYS[currentKeyIndex];
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${keyToUse}`;

    try {
      const googleResponse = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
      });

      const data = await googleResponse.json();

      if (!googleResponse.ok) {
        const errorMessage = data.error?.message || "";
        
        if (googleResponse.status === 429 || errorMessage.includes("Quota exceeded")) {
          currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
          continue; 
        } else {
          throw new Error(errorMessage || `Error ${googleResponse.status}`);
        }
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Respuesta de Gemini vacía");
      }

      return res.json({ text }); 

    } catch (error) {
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    }
  }

  return res.status(500).json({ 
    error: "Servicio sobrecargado. Todas las llaves están sin cuota, intenta de nuevo más tarde." 
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Llaves cargadas en el sistema: ${API_KEYS.length}`);
});