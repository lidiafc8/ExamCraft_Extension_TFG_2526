export const generateWithAI = async (prompt: string): Promise<string> => {
  const BACKEND_URL = "http://localhost:3000/generate"

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.details ||
          errorData.error ||
          "Error en el servidor backend al intentar generar el examen."
      )
    }

    const data = await response.json()

    if (!data.text) {
      throw new Error("El backend no devolvió ninguna respuesta válida.")
    }

    return data.text
  } catch (error: any) {
    console.error("[AI Service] Fetch error:", error)

    throw new Error(
      error.message ||
        "No se pudo conectar con el servidor backend. Verifica que esté encendido."
    )
  }
}
