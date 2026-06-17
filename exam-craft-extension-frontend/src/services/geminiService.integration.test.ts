import { beforeEach, describe, expect, it, vi } from "vitest"

import { generateWithAI } from "./geminiService"

describe("generateWithAI Service Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("fetch", vi.fn())
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  it("debería retornar el resultado y el proveedor cuando la respuesta del backend es correcta", async () => {
    const mockResponseData = {
      text: "public class Examen {}",
      provider: "openai"
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponseData)
    } as unknown as Response)

    const prompt = "Crear examen de Java"
    const finalResult = await generateWithAI(prompt)

    expect(fetch).toHaveBeenCalledWith("http://localhost:3000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    })
    expect(finalResult).toEqual({
      result: "public class Examen {}",
      provider: "openai"
    })
  })

  it("debería asignar 'unknown' como proveedor si el backend no lo envía en el payload", async () => {
    const mockResponseData = {
      text: "public class Solucion {}"
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponseData)
    } as unknown as Response)

    const finalResult = await generateWithAI("Dame una solución")

    expect(finalResult.provider).toBe("unknown")
  })

  it("debería lanzar un error si la respuesta del backend no contiene la propiedad 'text'", async () => {
    const mockResponseData = {
      provider: "anthropic"
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponseData)
    } as unknown as Response)

    await expect(generateWithAI("Test de prompt")).rejects.toThrow(
      "El backend no devolvió ninguna respuesta válida."
    )
  })

  it("debería extraer y lanzar el mensaje del campo 'details' si el estado HTTP es erróneo", async () => {
    const mockErrorData = {
      details: "Límite de tokens de la API excedido por el cliente."
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: vi.fn().mockResolvedValueOnce(mockErrorData)
    } as unknown as Response)

    await expect(generateWithAI("Falla de tokens")).rejects.toThrow(
      "Límite de tokens de la API excedido por el cliente."
    )
  })

  it("debería extraer y lanzar el mensaje del campo 'error' si 'details' no existe en la respuesta de error", async () => {
    const mockErrorData = {
      error: "Modelo no disponible temporalmente."
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: vi.fn().mockResolvedValueOnce(mockErrorData)
    } as unknown as Response)

    await expect(generateWithAI("Falla de modelo")).rejects.toThrow(
      "Modelo no disponible temporalmente."
    )
  })

  it("debería usar un texto genérico por defecto si el backend falla (!ok) y el JSON está vacío o mal formado", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: vi.fn().mockRejectedValueOnce(new Error("Crash al parsear JSON"))
    } as unknown as Response)

    await expect(generateWithAI("Falla crítica")).rejects.toThrow(
      "Error en el servidor backend al intentar generar el examen."
    )
  })

  it("debería lanzar un mensaje amigable indicando que el backend está apagado ante un fallo de red", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Failed to fetch"))

    await expect(generateWithAI("Prueba apagado")).rejects.toThrow(
      "Failed to fetch"
    )

    expect(console.error).toHaveBeenCalled()
  })
})
