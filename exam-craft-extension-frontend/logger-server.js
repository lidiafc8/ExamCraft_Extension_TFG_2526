const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

function formatTitle(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/^\w/, c => c.toUpperCase());
}

app.post('/save-log', (req, res) => {
  const { ejercicio, dominio, ...dynamicFields } = req.body;

  const domainTranslations = {
    "clínica veterinaria": "petClinic",
    "ajedrez": "chess"
  };

  const rawDomain = dominio ? dominio.toLowerCase().trim() : 'unknown';
  const englishDomain = domainTranslations[rawDomain] || rawDomain.replace(/\s+/g, '_');
  const safeExercise = ejercicio ? ejercicio.toLowerCase().replace(/\s+/g, '_') : 'general_exercise';

  const folderPath = path.join(__dirname, 'logs', safeExercise, englishDomain);
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

  const timestamp = new Date().toISOString().replace('T', '_').substring(0, 19).replace(/:/g, '-');
  const filePath = path.join(folderPath, `ejecucion_${timestamp}.md`);

  const fieldOrder = Object.keys(dynamicFields);

  const indexLines = fieldOrder.map((key, i) => {
    const anchor = key
      .replace(/([A-Z])/g, '-$1')  
      .toLowerCase()                
      .replace(/_/g, '-');          
    
    return `- [${i + 1}. ${formatTitle(key)}](#${i + 1}-${anchor})`;
  }).join("\n");

  const sections = fieldOrder.map((key, i) =>
    `## ${i + 1}. ${formatTitle(key)}\n${dynamicFields[key] || "_vacío_"}`
  ).join("\n\n---\n\n");

  const fileContent = `# Evaluación de Prompt

**Ejercicio:** ${(ejercicio || 'sin_nombre').toUpperCase()}
**Dominio:** ${englishDomain.toUpperCase()}
**Fecha:** ${new Date().toLocaleString()}

## Índice
${indexLines}

---

${sections}
`.trim();

  fs.writeFileSync(filePath, fileContent);
  console.log(`Log guardado en: ${filePath}`);
  res.sendStatus(200);
});

app.listen(3001, () => {
  console.log('Servidor de Logs escuchando en http://localhost:3001');
});