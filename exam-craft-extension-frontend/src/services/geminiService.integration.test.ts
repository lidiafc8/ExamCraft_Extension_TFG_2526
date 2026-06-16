import { describe, it, expect, vi, beforeEach } from "vitest"
import { generateWithAI } from "./geminiService" // Ajusta la ruta según donde tengas este método

describe("generateWithAI Service Tests", () => {
  
  beforeEach(() => {
    vi.clearAllMocks()
    // Aseguramos el mock global de fetch antes de cada test
    vi.stubGlobal("fetch", vi.fn())
    // Ocultamos temporalmente los console.error en los tests para mantener limpia la consola
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  // -------------------------------------------------------------------------
  // 1. FLUJO EXITOSO
  // -------------------------------------------------------------------------
  it("debería retornar el resultado y el proveedor cuando la respuesta del backend es correcta", async () => {
    const mockResponseData = {
      text: "public class Examen {}",
      provider: "openai"
    }

    // Simulamos que fetch resuelve una respuesta HTTP 200 OK con el JSON correspondiente
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponseData)
    } as unknown as Response)

    const prompt = "Crear examen de Java"
    const finalResult = await generateWithAI(prompt)

    // Verificaciones
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
      // provider está ausente deliberadamente
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponseData)
    } as unknown as Response)

    const finalResult = await generateWithAI("Dame una solución")
    
    expect(finalResult.provider).toBe("unknown")
  })

  // -------------------------------------------------------------------------
  // 2. ERRORES DE VALIDACIÓN DE DATOS (HTTP OK PERO MALOS DATOS)
  // -------------------------------------------------------------------------
  it("debería lanzar un error si la respuesta del backend no contiene la propiedad 'text'", async () => {
    const mockResponseData = {
      provider: "anthropic" // Falta el string 'text' indispensable
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponseData)
    } as unknown as Response)

    await expect(generateWithAI("Test de prompt")).rejects.toThrow(
      "El backend no devolvió ninguna respuesta válida."
    )
  })

  // -------------------------------------------------------------------------
  // 3. ERRORES DEL SERVIDOR (HTTP NO OK)
  // -------------------------------------------------------------------------
  it("debería extraer y lanzar el mensaje del campo 'details' si el estado HTTP es erróneo", async () => {
    const mockErrorData = {
      details: "Límite de tokens de la API excedido por el cliente."
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false, // Forzamos !response.ok
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
      // Provocamos un rechazo en el parseo del .json() simulando que no vino un JSON legible
      json: vi.fn().mockRejectedValueOnce(new Error("Crash al parsear JSON"))
    } as unknown as Response)

    await expect(generateWithAI("Falla crítica")).rejects.toThrow(
      "Error en el servidor backend al intentar generar el examen."
    )
  })

  // -------------------------------------------------------------------------
  // 4. ERRORES DE CONEXIÓN / RED INTERRUMPIDA
  // -------------------------------------------------------------------------
  it("debería lanzar un mensaje amigable indicando que el backend está apagado ante un fallo de red", async () => {
    // Simulamos un rechazo de red directo de la API fetch (ej. servidor caído o sin red)
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Failed to fetch"))

    await expect(generateWithAI("Prueba apagado")).rejects.toThrow(
      "Failed to fetch"
    )
    
    // Verificamos que se haya registrado el error en el catch general
    expect(console.error).toHaveBeenCalled()
  })
})