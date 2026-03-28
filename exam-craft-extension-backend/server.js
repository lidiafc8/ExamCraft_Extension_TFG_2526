import express from 'express';
import cors from 'cors';
import fs from 'fs';
import 'dotenv/config'; // Esto asegura que lea tu archivo .env automáticamente

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURACIÓN DEL MODELO ---
const MODEL = "gemini-2.5-flash"; 

// 1. Cargamos TODAS tus llaves del .env en una lista (array)
const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
].filter(Boolean); // .filter(Boolean) elimina las que estén vacías o no existan

let currentKeyIndex = 0; // Para saber qué llave nos toca usar

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "El prompt es obligatorio" });
  }

  if (API_KEYS.length === 0) {
    return res.status(500).json({ error: "No hay API Keys configuradas" });
  }

  // 2. BUCLE MÁGICO: Intentamos con cada llave hasta que una funcione
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
        
        // 3. ¿Se gastó la cuota? (Error 429)
        if (googleResponse.status === 429 || errorMessage.includes("Quota exceeded")) {
          // Cambiamos a la siguiente llave
          currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
          // Volvemos a empezar el bucle con la nueva llave
          continue; 
        } else {
          throw new Error(errorMessage || `Error ${googleResponse.status}`);
        }
      }

      // Si llegamos aquí, ¡la petición ha triunfado!
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Respuesta de Gemini vacía");
      }

      return res.json({ text }); // Enviamos a la extensión y terminamos la función

    } catch (error) {
      // Por si acaso fue un fallo de red, rotamos la llave para el próximo intento
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    }
  }

  return res.status(500).json({ 
    error: "Servicio sobrecargado. Todas las llaves están sin cuota, intenta de nuevo más tarde." 
  });
});

// --- RUTA PARA GUARDAR LOGS ---
app.post('/save-log', (req, res) => {
  const { exercise, domain, response } = req.body;
  const logEntry = `\n--- LOG ${new Date().toLocaleString()} ---\nEjercicio: ${exercise}\nDominio: ${domain}\n------------------\n`;

  fs.appendFile('historial.txt', logEntry, (err) => {
    if (err) return res.status(500).send("Error al guardar log");
    res.send("Log guardado");
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ExamCraft corriendo en http://localhost:${PORT}`);
  console.log(`🔑 Llaves cargadas en el sistema: ${API_KEYS.length}`);
});