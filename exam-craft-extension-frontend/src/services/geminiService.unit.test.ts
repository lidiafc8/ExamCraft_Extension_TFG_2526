import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { generateWithAI } from "./geminiService"

describe("generateWithAI - AI Service Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.fetch = vi.fn()
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("Casos Positivos (Flujos Felices)", () => {
    it("debe retornar el resultado y el proveedor correctamente cuando el backend responde de forma exitosa", async () => {
      const mockResponseData = {
        text: "Contenido del examen generado",
        provider: "openai"
      }

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponseData)
      } as any)

      const payload = "Genera un examen de arquitectura de software"
      const result = await generateWithAI(payload)

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: payload })
        }
      )

      expect(result).toEqual({
        result: "Contenido del examen generado",
        provider: "openai"
      })
    })

    it("debe asignar 'unknown' como proveedor por defecto si el payload del backend no lo incluye", async () => {
      const mockResponseData = {
        text: "Solo texto de respuesta"
      }

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponseData)
      } as any)

      const result = await generateWithAI("Test prompt")
      expect(result.provider).toBe("unknown")
    })
  })

  describe("Casos Negativos y Manejo de Errores", () => {
    it("debe extraer el mensaje desde 'details' si la respuesta http no es ok (response.ok === false)", async () => {
      const mockErrorData = {
        details: "Límite de tokens excedido en el backend"
      }

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValueOnce(mockErrorData)
      } as any)

      await expect(generateWithAI("Prompt")).rejects.toThrow(
        "Límite de tokens excedido en el backend"
      )
    })

    it("debe extraer el mensaje desde 'error' si 'details' no existe cuando response.ok es falso", async () => {
      const mockErrorData = { error: "Error de autenticación con la API de IA" }

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValueOnce(mockErrorData)
      } as any)

      await expect(generateWithAI("Prompt")).rejects.toThrow(
        "Error de autenticación con la API de IA"
      )
    })

    it("debe usar el mensaje genérico de servidor si el json de error falla o viene vacío", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockRejectedValueOnce(new Error("JSON inválido"))
      } as any)

      await expect(generateWithAI("Prompt")).rejects.toThrow(
        "Error en el servidor backend al intentar generar el examen."
      )
    })

    it("debe lanzar un error si la respuesta del backend tiene status ok pero carece de la propiedad 'text'", async () => {
      const mockPayloadInvalido = { sinText: "datos extraños" }

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockPayloadInvalido)
      } as any)

      await expect(generateWithAI("Prompt")).rejects.toThrow(
        "El backend no devolvió ninguna respuesta válida."
      )
    })

    it("debe capturar fallos de red físicos o caídas del servidor local e informar que se verifique la conexión", async () => {
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(
        new Error("Failed to fetch")
      )

      await expect(generateWithAI("Prompt")).rejects.toThrow("Failed to fetch")

      expect(console.error).toHaveBeenCalled()
    })

    it("debe usar un texto alternativo en el bloque catch si el error lanzado no contiene un mensaje definido", async () => {
      vi.mocked(globalThis.fetch).mockRejectedValueOnce({})

      await expect(generateWithAI("Prompt")).rejects.toThrow(
        "No se pudo conectar con el servidor backend. Verifica que esté encendido."
      )
    })
  })
})
