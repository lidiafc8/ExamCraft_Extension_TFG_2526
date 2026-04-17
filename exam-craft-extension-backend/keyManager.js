import dotenv from 'dotenv';
dotenv.config();

function createKeyManager(keysArray, name = "API") {
  const keys = keysArray.filter(Boolean);

  if (keys.length === 0) {
    console.error(`❌ No hay keys configuradas para ${name}`);
  }

  let index = 0;

  return {
    getKey() {
      if (keys.length === 0) return null;

      const key = keys[index];
      index = (index + 1) % keys.length;
      return key;
    },

    nextKey() {
      index = (index + 1) % keys.length;
    },

    getCurrentKey() {
      return keys[index];
    },

    count() {
      return keys.length;
    }
  };
}

export const geminiManager = createKeyManager([
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6
], "GEMINI");

export const openaiManager = createKeyManager([
  process.env.OPENAI_API_KEY_1,
  process.env.OPENAI_API_KEY_2
], "OPENAI");