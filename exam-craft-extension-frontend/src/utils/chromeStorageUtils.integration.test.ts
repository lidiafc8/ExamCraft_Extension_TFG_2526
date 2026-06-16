import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { saveToChrome, getAllFromChrome } from "./chromeStorageUtils" // Ajusta la ruta a tu archivo real

describe("Chrome Storage Service Tests", () => {
  // Guardamos el entorno original para restaurarlo después
  const originalChrome = globalThis.chrome

  beforeEach(() => {
    vi.clearAllMocks()
    // Empezamos cada test con un entorno limpio (sin la extensión instalada)
    globalThis.chrome = undefined as any
  })

  afterEach(() => {
    // Restauramos el objeto global al terminar la suite
    globalThis.chrome = originalChrome
  })

  // Función auxiliar para mockear Chrome de forma sencilla sin "Object.defineProperty"
  const mockChromeStorage = (method: "set" | "get", implementation: (...args: any[]) => any) => {
    globalThis.chrome = {
      storage: {
        local: {
          [method]: vi.fn().mockImplementation(implementation)
        }
      },
      runtime: {
        lastError: undefined // Por defecto no hay error en el navegador
      }
    } as any
  }

  // =========================================================================
  // 1. PRUEBAS PARA LA FUNCIÓN: saveToChrome
  // =========================================================================
  describe("saveToChrome", () => {
    it("debería rechazar con un error si la API de Chrome Storage no está disponible", async () => {
      // globalThis.chrome ya es undefined gracias al beforeEach
      await expect(saveToChrome("mi_examen", { id: 1 })).rejects.toThrow(
        "Esta funcionalidad solo está disponible dentro de la Extensión de Chrome."
      )
    })

    it("debería guardar los datos correctamente si la API responde con éxito", async () => {
      // Simulamos que el método set ejecuta su callback con éxito
      mockChromeStorage("set", (data: any, callback: () => void) => callback())

      const dataToSave = { name: "Examen Patrones de Diseño", version: 1 }
      
      await expect(saveToChrome("exam_001", dataToSave)).resolves.toBeUndefined()
      expect(globalThis.chrome.storage.local.set).toHaveBeenCalledWith(
        { exam_001: dataToSave },
        expect.any(Function)
      )
    })

    it("debería rechazar la promesa si chrome.runtime.lastError contiene un fallo", async () => {
      const mockError = new Error("Quota exceeded")
      
      // Cuando se ejecute set, simulamos que el navegador asienta un error en runtime
      mockChromeStorage("set", (data: any, callback: () => void) => {
        globalThis.chrome.runtime.lastError = mockError
        callback()
      })

      await expect(saveToChrome("exam_fail", { data: "test" })).rejects.toThrow("Quota exceeded")
    })
  })

  // =========================================================================
  // 2. PRUEBAS PARA LA FUNCIÓN: getAllFromChrome
  // =========================================================================
  describe("getAllFromChrome", () => {
    it("debería retornar un array vacío [] si no está en el entorno de la extensión", async () => {
      // Al ser undefined, debe retornar el fallback seguro de tu código
      const result = await getAllFromChrome()
      expect(result).toEqual([])
    })

    it("debería recuperar los elementos mapeándolos con su estructura '_key'", async () => {
      const mockItems = {
        "key_1": { id: "1", titulo: "Examen de JS" },
        "key_2": { id: "2", titulo: "Examen de Java" }
      }

      // Simulamos que el método get devuelve el objeto mockItems al callback
      mockChromeStorage("get", (target: any, callback: (items: any) => void) => callback(mockItems))

      const itemsResult = await getAllFromChrome()

      expect(globalThis.chrome.storage.local.get).toHaveBeenCalledWith(null, expect.any(Function))
      expect(itemsResult).toEqual([
        { id: "1", titulo: "Examen de JS", _key: "key_1" },
        { id: "2", titulo: "Examen de Java", _key: "key_2" }
      ])
    })

    it("debería rechazar la promesa si ocurre un error leyendo el almacenamiento", async () => {
      const mockError = new Error("Error de lectura")

      mockChromeStorage("get", (target: any, callback: (items: any) => void) => {
        globalThis.chrome.runtime.lastError = mockError
        callback({})
      })

      await expect(getAllFromChrome()).rejects.toThrow("Error de lectura")
    })
  })
})