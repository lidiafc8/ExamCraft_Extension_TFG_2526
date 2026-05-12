import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { geminiManager, openaiManager } from './keyManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================================
// 1. IA CONFIGURATION
// ============================================================================

// Centralized configuration (Parameterization)

const FALLBACK_ORDER = ['gemini', 'openai']; 

const PROVIDERS = {
  gemini: {
    model: "gemini-2.5-flash",
    manager: geminiManager, 
    callApi: async (prompt, key, modelName) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Error desconocido al contactar con Gemini");
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Respuesta vacía de Gemini");
      return text;
    }
  },

  openai: {
    model: "gpt-4o-mini",     
    manager: openaiManager,
    callApi: async (prompt, key, modelName) => {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Error desconocido al contactar con OpenAI");
      
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("Respuesta vacía de OpenAI");
      return text;
    }
  }
};

// Execution function with rotation and fallback logic

async function executeProvider(providerId, prompt) {
  const provider = PROVIDERS[providerId];
  const maxAttempts = provider.manager.count(); 

  if (maxAttempts === 0) {
    throw new Error(`No hay API keys configuradas para el proveedor ${providerId}`);
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = provider.manager.getKey(); 

    try {
      return await provider.callApi(prompt, key, provider.model);
    } catch (err) {
      console.warn(`[${providerId.toUpperCase()}] Key failed, attempting the next...`);
    }
  }

  throw new Error(`Todas las claves de ${providerId} han fallado.`);
}

// ============================================================================
// 2. ENDPOINTS
// ============================================================================

// En tu backend (server.js o app.js)

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "El prompt es obligatorio." });

  for (const providerId of FALLBACK_ORDER) {
    try {
      const text = await executeProvider(providerId, prompt);

      console.log(`[AI Service] Part successfully generated using provider: ${providerId.toUpperCase()}`);
      
      return res.json({ provider: providerId, text });
    } catch (err) {
      console.error(`=> Fallback: Provider '${providerId}' failed. Moving to the next...`);
    }
  }
  return res.status(500).json({ error: "Todos los servicios de IA están saturados." });
});


function formatTitle(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().replace(/^\w/, c => c.toUpperCase());
}

app.post('/save-log', (req, res) => {
  try {
    const { ejercicio, dominio, ...dynamicFields } = req.body;

    const domainTranslations = { "clínica veterinaria": "petClinic", "ajedrez": "chess" };
    const rawDomain = dominio ? dominio.toLowerCase().trim() : 'unknown';
    const englishDomain = domainTranslations[rawDomain] || rawDomain.replace(/\s+/g, '_');
    const safeExercise = ejercicio ? ejercicio.toLowerCase().replace(/\s+/g, '_') : 'general_exercise';

    const folderPath = path.join(__dirname, 'logs', safeExercise, englishDomain);
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`[Log Service] Created directory: ${folderPath}`);
    }

    const now = new Date();
    const timestamp = 
            `${String(now.getDate()).padStart(2, '0')}-` +
            `${String(now.getMonth() + 1).padStart(2, '0')}-` +
            `${now.getFullYear()}_` +
            `${String(now.getHours()).padStart(2, '0')}-` +
            `${String(now.getMinutes()).padStart(2, '0')}-` +
            `${String(now.getSeconds()).padStart(2, '0')}`;
    const filePath = path.join(folderPath, `ejecucion_${timestamp}.md`);
    const fieldOrder = Object.keys(dynamicFields);

    const indexLines = fieldOrder.map((key, i) => {
      const anchor = key.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/_/g, '-');          
      return `- [${i + 1}. ${formatTitle(key)}](#${i + 1}-${anchor})`;
    }).join("\n");

    const sections = fieldOrder.map((key, i) =>
      `## ${i + 1}. ${formatTitle(key)}\n${dynamicFields[key] || "_vacío_"}`
    ).join("\n\n---\n\n");

    const fileContent = `# Evaluación de Prompt\n\n**Ejercicio:** ${(ejercicio || 'sin_nombre').toUpperCase()}\n**Dominio:** ${englishDomain.toUpperCase()}\n**Fecha:** ${new Date().toLocaleString()}\n\n## Índice\n${indexLines}\n\n---\n\n${sections}`.trim();

    fs.writeFileSync(filePath, fileContent);
    console.log(`[Log Service] Successfully saved log at: ${filePath}`);
    res.status(200).json({ message: "Log guardado correctamente en el servidor." });

  } catch (error) {
    console.error(`[Log Service] Failed to save log:`, error);
    res.status(500).json({ error: "Error interno al intentar guardar el archivo de log." });
  }
});


// ============================================================================
// 3. SERVER START
// ============================================================================

function printEndpoints(app) {
  console.log('\n=== REGISTERED ENDPOINTS ===');

  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods)
        .map(method => method.toUpperCase())
        .join(', ');

      console.log(`${methods.padEnd(10)} ${middleware.route.path}`);
    } 
    else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        const route = handler.route;
        if (route) {
          const methods = Object.keys(route.methods)
            .map(method => method.toUpperCase())
            .join(', ');

          console.log(`${methods.padEnd(10)} ${route.path}`);
        }
      });
    }
  });

  console.log('============================\n');
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  console.log(`Fallback order: ${FALLBACK_ORDER.join(' -> ')}`);
  
  Object.keys(PROVIDERS).forEach(providerId => {
    const provider = PROVIDERS[providerId];
    const numKeys = provider.manager.count();
    
    console.log(`- ${providerId.toUpperCase()}: ${numKeys} keys available (Model: ${provider.model})`);
  });

  printEndpoints(app);
  
});