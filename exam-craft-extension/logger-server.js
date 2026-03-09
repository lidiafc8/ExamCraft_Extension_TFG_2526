const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/save-log', (req, res) => {
  const { exercise, domain, hiddenContext, visiblePrompt, response } = req.body;
  
  const domainTranslations = {
    "clínica veterinaria": "petClinic",
    "ajedrez": "chess"
  };

  const rawDomain = domain ? domain.toLowerCase().trim() : 'unknown';
  const englishDomain = domainTranslations[rawDomain] || rawDomain.replace(/\s+/g, '_');

  const safeExercise = exercise ? exercise.toLowerCase().replace(/\s+/g, '_') : 'general_exercise';

  const folderPath = path.join(__dirname, 'logs', safeExercise, englishDomain);
  
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace('T', '_').substring(0, 19).replace(/:/g, '-');  const fileName = `ejecucion_${timestamp}.md`;
  const filePath = path.join(folderPath, fileName);

  const fileContent = `
# Evaluación de Prompt

**Ejercicio:** ${exercise.toUpperCase()}
**Dominio:** ${englishDomain.toUpperCase()}
**Fecha:** ${new Date().toLocaleString()}

## Índice
- [1. Recursos y Contexto](#1-recursos-y-contexto-oculto-al-usuario)
- [2. Prompt Enviado por el Usuario](#2-prompt-enviado-por-el-usuario-visible-y-editable)
- [3. Propuesta del Modelo](#3-propuesta-del-modelo)

---

## 1. RECURSOS Y CONTEXTO (Oculto al usuario)
${hiddenContext}

---

## 2. PROMPT ENVIADO POR EL USUARIO (Visible y editable)
${visiblePrompt}

---

## 3. PROPUESTA DEL MODELO
${response}
`;

    fs.writeFileSync(filePath, fileContent.trim());
    console.log(`Log guardado en: ${filePath}`);
    
    res.sendStatus(200);
});

app.listen(3001, () => {
  console.log('Servidor de Logs escuchando en http://localhost:3001');
});