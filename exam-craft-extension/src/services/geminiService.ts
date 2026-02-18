const API_KEY = process.env.PLASMO_PUBLIC_GEMINI_API_KEY;

const MODEL = "gemini-2.5-flash"; 

const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export const sendToGemini = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("Falta la API Key de Gemini en el archivo .env");
  }

  const finalUrl = `${BASE_URL}?key=${API_KEY}`;

  try {
    const response = await fetch(finalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) return "Gemini respondió pero la respuesta estaba vacía.";
    
    return text;

  } catch (error) {
    console.error("Error conectando con Gemini:", error);
    throw error;
  }
};