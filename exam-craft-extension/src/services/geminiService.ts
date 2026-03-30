export const sendToGemini = async (prompt: string): Promise<string> => {
  // La URL de tu servidor backend local
  const BACKEND_URL = "http://localhost:3000/generate";

  try {

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Enviamos el prompt al servidor. 
      // El servidor se encargará de poner la API KEY y llamar a Google.
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || errorData.error || "Error en el servidor backend");
    }

    const data = await response.json();

    if (!data.text) {
      throw new Error("El backend no devolvió ninguna respuesta.");
    }

    return data.text;

  } catch (error: any) {
    console.error("Error en geminiService:", error);
    // Este mensaje es el que saldrá en tu 'alert' de la extensión
    throw new Error(error.message || "No se pudo conectar con el servidor backend");
  }
};