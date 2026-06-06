import { useState } from "react"

import { generateWithAI } from "../services/geminiService"

interface UseGeminiGenerationOptions {
  logExerciseName: string
  buildLogPayload: (result: string) => Record<string, unknown>
}

interface UseGeminiGenerationReturn {
  responseText: string
  isLoading: boolean
  setResponseText: (text: string) => void
  generate: (payload: string) => Promise<string | null>
}

export function useGeminiGeneration({
  logExerciseName,
  buildLogPayload
}: UseGeminiGenerationOptions): UseGeminiGenerationReturn {
  const [responseText, setResponseText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const generate = async (payload: string): Promise<string | null> => {
    setIsLoading(true)
    setResponseText("")
    try {
      const { result, provider } = await generateWithAI(payload);
      setResponseText(result)

      try {
        await fetch("http://localhost:3000/save-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ejercicio: logExerciseName,
            proveedor: provider,
            ...buildLogPayload(result,)
          })
        })
      } catch {
        console.warn(
          "Servidor de logs apagado. El log no se guardó en el repo."
        )
      }

      return result
    } catch (error) {
      console.error(error)
      alert("Error al generar.")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { responseText, isLoading, setResponseText, generate }
}
