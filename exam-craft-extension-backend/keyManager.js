import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargamos el archivo .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

let index = 0;

export function getKey() {
  // Intentamos leer las llaves que DOTENV ya debería haber inyectado
  const keys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3
  ].filter(Boolean);

  if (keys.length === 0) {
    console.error("❌ ERROR: Dotenv dice que inyectó variables, pero GEMINI_KEY_1 está vacía.");
    return null;
  }

  const key = keys[index];
  
  index = (index + 1) % keys.length;
  return key;
}