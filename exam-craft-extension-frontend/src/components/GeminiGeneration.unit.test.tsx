import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useGeminiGeneration } from "./GeminiGeneration"

const mockGenerateWithAI = vi.fn()
vi.mock("../services/geminiService", () => ({
  generateWithAI: (payload: string) => mockGenerateWithAI(payload)
}))

const baseOptions = {
  logExerciseName: "Ejercicio de Álgebra",
  buildLogPayload: vi.fn().mockReturnValue({ customData: "payload-de-prueba" })
}

beforeEach(() => {
  vi.clearAllMocks()

  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true })
  } as unknown as Response)

  vi.spyOn(window, "alert").mockImplementation(() => {})
  vi.spyOn(console, "error").mockImplementation(() => {})
  vi.spyOn(console, "warn").mockImplementation(() => {})
})

describe("useGeminiGeneration – Configuración Básica", () => {
  it("inicializa el hook con los valores por defecto correctos", () => {
    const { result } = renderHook(() => useGeminiGeneration(baseOptions))
    expect(result.current.responseText).toBe("")
    expect(result.current.isLoading).toBe(false)
  })

  it("permite actualizar el texto de respuesta manualmente mediante setResponseText", () => {
    const { result } = renderHook(() => useGeminiGeneration(baseOptions))
    act(() => {
      result.current.setResponseText("Texto manual")
    })
    expect(result.current.responseText).toBe("Texto manual")
  })
})

describe("useGeminiGeneration – Flujos de Ejecución (Cobertura 100%)", () => {
  it("gestiona los estados de carga, retorna el resultado y guarda el log con éxito", async () => {
    mockGenerateWithAI.mockResolvedValue({
      result: "Respuesta de la IA",
      provider: "gemini"
    })
    const { result } = renderHook(() => useGeminiGeneration(baseOptions))

    let promesa
    await act(async () => {
      promesa = result.current.generate("Pregunta")
    })

    const respuestaFinal = await promesa
    expect(respuestaFinal).toBe("Respuesta de la IA")

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.responseText).toBe("Respuesta de la IA")
  })

  it("continúa la ejecución con éxito si el servidor de logs está apagado", async () => {
    mockGenerateWithAI.mockResolvedValue({
      result: "Respuesta de la IA",
      provider: "gemini"
    })
    global.fetch = vi.fn().mockRejectedValue(new Error("Logs caídos"))

    const { result } = renderHook(() => useGeminiGeneration(baseOptions))

    let promesa
    await act(async () => {
      promesa = result.current.generate("Pregunta con logs caídos")
    })

    const respuestaFinal = await promesa
    expect(respuestaFinal).toBe("Respuesta de la IA")

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("Servidor de logs apagado")
    )
  })

  it("captura los fallos del servicio de IA, muestra alert y apaga la carga", async () => {
    mockGenerateWithAI.mockRejectedValue(new Error("Error de Gemini"))
    const { result } = renderHook(() => useGeminiGeneration(baseOptions))

    let respuestaError
    await act(async () => {
      respuestaError = await result.current.generate("Payload inválido")
    })

    expect(respuestaError).toBeNull()

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(window.alert).toHaveBeenCalledWith("Error al generar.")
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
