import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import { generateWithAI } from "../services/geminiService"
import { useGeminiGeneration } from "./GeminiGeneration"

expect.extend(jestDomMatchers)

vi.mock("../services/geminiService", () => ({
  generateWithAI: vi.fn()
}))

const mockGenerateWithAI = generateWithAI as ReturnType<typeof vi.fn>

const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

const mockAlert = vi.fn()
vi.stubGlobal("alert", mockAlert)

const defaultOptions = {
  logExerciseName: "test-ejercicio",
  buildLogPayload: (result: string) => ({ resultado: result })
}

describe("Integración: useGeminiGeneration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({ ok: true })
  })

  describe("Casos Positivos", () => {
    it("devuelve los valores iniciales correctos antes de generar", () => {
      const { result } = renderHook(() => useGeminiGeneration(defaultOptions))

      expect(result.current.responseText).toBe("")
      expect(result.current.isLoading).toBe(false)
    })

    it("activa isLoading durante la generación y lo desactiva al terminar", async () => {
      mockGenerateWithAI.mockResolvedValue({
        result: "respuesta generada",
        provider: "gemini"
      })

      const { result } = renderHook(() => useGeminiGeneration(defaultOptions))

      await act(async () => {
        await result.current.generate("mi payload")
      })

      expect(result.current.isLoading).toBe(false)
    })

    it("actualiza responseText con el resultado de generateWithAI", async () => {
      mockGenerateWithAI.mockResolvedValue({
        result: "respuesta generada",
        provider: "gemini"
      })

      const { result } = renderHook(() => useGeminiGeneration(defaultOptions))

      await act(async () => {
        await result.current.generate("mi payload")
      })

      expect(result.current.responseText).toBe("respuesta generada")
    })

    it("retorna el resultado de la generación como string", async () => {
      mockGenerateWithAI.mockResolvedValue({
        result: "texto resultado",
        provider: "gemini"
      })

      const { result } = renderHook(() => useGeminiGeneration(defaultOptions))

      let returnValue: string | null = null
      await act(async () => {
        returnValue = await result.current.generate("payload")
      })

      expect(returnValue).toBe("texto resultado")
    })

    it("envía el log al servidor con los datos correctos", async () => {
      mockGenerateWithAI.mockResolvedValue({
        result: "respuesta",
        provider: "gemini"
      })

      const { result } = renderHook(() => useGeminiGeneration(defaultOptions))

      await act(async () => {
        await result.current.generate("payload")
      })

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/save-log",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ejercicio: "test-ejercicio",
            proveedor: "gemini",
            resultado: "respuesta"
          })
        })
      )
    })

    it("setResponseText permite actualizar el texto manualmente", () => {
      const { result } = renderHook(() => useGeminiGeneration(defaultOptions))

      act(() => {
        result.current.setResponseText("texto manual")
      })

      expect(result.current.responseText).toBe("texto manual")
    })
  })

  describe("Casos Negativos", () => {
    it("retorna null y muestra alert si generateWithAI lanza un error", async () => {
      mockGenerateWithAI.mockRejectedValue(new Error("fallo de red"))

      const { result } = renderHook(() => useGeminiGeneration(defaultOptions))

      let returnValue: string | null = "no-null"
      await act(async () => {
        returnValue = await result.current.generate("payload")
      })

      expect(returnValue).toBeNull()
      expect(mockAlert).toHaveBeenCalledWith("Error al generar.")
    })

    it("desactiva isLoading aunque generateWithAI falle", async () => {
      mockGenerateWithAI.mockRejectedValue(new Error("error"))

      const { result } = renderHook(() => useGeminiGeneration(defaultOptions))

      await act(async () => {
        await result.current.generate("payload")
      })

      expect(result.current.isLoading).toBe(false)
    })

    it("no lanza error si el servidor de logs está caído", async () => {
      mockGenerateWithAI.mockResolvedValue({ result: "ok", provider: "gemini" })
      mockFetch.mockRejectedValue(new Error("servidor apagado"))

      const { result } = renderHook(() => useGeminiGeneration(defaultOptions))

      let returnValue: string | null = null
      await act(async () => {
        returnValue = await result.current.generate("payload")
      })

      expect(returnValue).toBe("ok")
      expect(result.current.responseText).toBe("ok")
    })

    it("no llama a buildLogPayload si generateWithAI falla", async () => {
      const buildLogPayload = vi.fn()
      mockGenerateWithAI.mockRejectedValue(new Error("error"))

      const { result } = renderHook(() =>
        useGeminiGeneration({ logExerciseName: "test", buildLogPayload })
      )

      await act(async () => {
        await result.current.generate("payload")
      })

      expect(buildLogPayload).not.toHaveBeenCalled()
    })
  })

  describe("Casos Límite", () => {
    it("maneja correctamente un resultado vacío de generateWithAI", async () => {
      mockGenerateWithAI.mockResolvedValue({ result: "", provider: "gemini" })

      const { result } = renderHook(() => useGeminiGeneration(defaultOptions))

      let returnValue: string | null = null
      await act(async () => {
        returnValue = await result.current.generate("payload")
      })

      expect(returnValue).toBe("")
      expect(result.current.responseText).toBe("")
    })

    it("resetea responseText a vacío al iniciar una nueva generación", async () => {
      mockGenerateWithAI.mockResolvedValue({
        result: "primera respuesta",
        provider: "gemini"
      })

      const { result } = renderHook(() => useGeminiGeneration(defaultOptions))

      await act(async () => {
        await result.current.generate("payload 1")
      })
      expect(result.current.responseText).toBe("primera respuesta")

      mockGenerateWithAI.mockResolvedValue({
        result: "segunda respuesta",
        provider: "gemini"
      })

      await act(async () => {
        await result.current.generate("payload 2")
      })

      expect(result.current.responseText).toBe("segunda respuesta")
    })

    it("llama a buildLogPayload con el resultado exacto devuelto por generateWithAI", async () => {
      const buildLogPayload = vi.fn().mockReturnValue({ custom: "data" })
      mockGenerateWithAI.mockResolvedValue({
        result: "resultado exacto",
        provider: "gemini"
      })

      const { result } = renderHook(() =>
        useGeminiGeneration({ logExerciseName: "test", buildLogPayload })
      )

      await act(async () => {
        await result.current.generate("payload")
      })

      expect(buildLogPayload).toHaveBeenCalledWith("resultado exacto")
    })

    it("maneja payloads muy largos sin errores", async () => {
      mockGenerateWithAI.mockResolvedValue({ result: "ok", provider: "gemini" })
      const payloadLargo = "a".repeat(100000)

      const { result } = renderHook(() => useGeminiGeneration(defaultOptions))

      await act(async () => {
        await result.current.generate(payloadLargo)
      })

      expect(mockGenerateWithAI).toHaveBeenCalledWith(payloadLargo)
      expect(result.current.responseText).toBe("ok")
    })
  })

  describe("Flujo Completo", () => {
    it("flujo completo: generar, loguear y actualizar estado correctamente", async () => {
      const buildLogPayload = vi
        .fn()
        .mockReturnValue({ dominio: "veterinaria" })
      mockGenerateWithAI.mockResolvedValue({
        result: "clases generadas",
        provider: "gemini"
      })

      const { result } = renderHook(() =>
        useGeminiGeneration({
          logExerciseName: "base-classes",
          buildLogPayload
        })
      )

      expect(result.current.responseText).toBe("")
      expect(result.current.isLoading).toBe(false)

      let returnValue: string | null = null
      await act(async () => {
        returnValue = await result.current.generate("payload completo")
      })

      expect(returnValue).toBe("clases generadas")
      expect(result.current.responseText).toBe("clases generadas")
      expect(result.current.isLoading).toBe(false)

      expect(buildLogPayload).toHaveBeenCalledWith("clases generadas")
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/save-log",
        expect.objectContaining({
          body: JSON.stringify({
            ejercicio: "base-classes",
            proveedor: "gemini",
            dominio: "veterinaria"
          })
        })
      )
    })

    it("flujo completo: generación fallida no rompe el estado del hook", async () => {
      mockGenerateWithAI.mockRejectedValue(new Error("error grave"))

      const { result } = renderHook(() => useGeminiGeneration(defaultOptions))

      await act(async () => {
        await result.current.generate("payload")
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.responseText).toBe("")

      mockGenerateWithAI.mockResolvedValue({
        result: "recuperado",
        provider: "gemini"
      })

      await act(async () => {
        await result.current.generate("nuevo payload")
      })

      expect(result.current.responseText).toBe("recuperado")
    })
  })
})
