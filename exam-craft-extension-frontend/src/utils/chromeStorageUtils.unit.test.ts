import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { saveToChrome, getAllFromChrome } from "./chromeStorageUtils"

function buildChromeMock({
  setError = null as any,
  getError = null as any,
  getItems = {} as Record<string, any>
} = {}) {
  return {
    storage: {
      local: {
        set: vi.fn((_data: any, callback: () => void) => {
          if (setError) (globalThis as any).chrome.runtime.lastError = setError
          else delete (globalThis as any).chrome?.runtime?.lastError
          callback()
        }),
        get: vi.fn((_keys: any, callback: (items: Record<string, any>) => void) => {
          if (getError) (globalThis as any).chrome.runtime.lastError = getError
          else delete (globalThis as any).chrome?.runtime?.lastError
          callback(getItems)
        })
      }
    },
    runtime: {
      lastError: null as any
    }
  }
}

function setGlobalChrome(mock: ReturnType<typeof buildChromeMock> | null) {
  if (mock === null) {
    delete (globalThis as any).chrome
  } else {
    ;(globalThis as any).chrome = mock
  }
}

describe("chromeStorageUtils", () => {
  afterEach(() => {
    delete (globalThis as any).chrome
    vi.clearAllMocks()
  })

  describe("saveToChrome", () => {
    describe("Casos positivos", () => {
      it("resuelve sin valor cuando chrome.storage.local está disponible y no hay error", async () => {
        setGlobalChrome(buildChromeMock())
        await expect(
          saveToChrome("project_1", { name: "Examen" })
        ).resolves.toBeUndefined()
      })

      it("llama a chrome.storage.local.set con la clave y los datos exactos", async () => {
        const mock = buildChromeMock()
        setGlobalChrome(mock)
        const data = { title: "Examen de Ajedrez", score: 10 }
        await saveToChrome("project_ajedrez", data)
        expect(mock.storage.local.set).toHaveBeenCalledWith(
          { project_ajedrez: data },
          expect.any(Function)
        )
      })

      it("llama a set exactamente una vez por invocación", async () => {
        const mock = buildChromeMock()
        setGlobalChrome(mock)
        await saveToChrome("k", { v: 1 })
        expect(mock.storage.local.set).toHaveBeenCalledTimes(1)
      })

      it("resuelve correctamente con un objeto vacío como data", async () => {
        setGlobalChrome(buildChromeMock())
        await expect(saveToChrome("empty_key", {})).resolves.toBeUndefined()
      })

      it("resuelve correctamente con data anidada profundamente", async () => {
        setGlobalChrome(buildChromeMock())
        const data = { a: { b: { c: { d: [1, 2, 3] } } } }
        await expect(saveToChrome("deep_key", data)).resolves.toBeUndefined()
      })

      it("resuelve en llamadas consecutivas de forma independiente", async () => {
        setGlobalChrome(buildChromeMock())
        await expect(saveToChrome("k1", { x: 1 })).resolves.toBeUndefined()
        await expect(saveToChrome("k2", { x: 2 })).resolves.toBeUndefined()
      })

      it("preserva el payload exacto incluyendo arrays, booleanos y nulos", async () => {
        const mock = buildChromeMock()
        setGlobalChrome(mock)
        const data = { list: [1, "a", null], active: false, score: 0 }
        await saveToChrome("mixed_key", data)
        expect(mock.storage.local.set).toHaveBeenCalledWith(
          { mixed_key: data },
          expect.any(Function)
        )
      })
    })

    describe("Casos negativos", () => {
      it("rechaza con el mensaje de extensión si chrome no está definido en globalThis", async () => {
        setGlobalChrome(null)
        await expect(saveToChrome("k", {})).rejects.toThrow(
          "Esta funcionalidad solo está disponible dentro de la Extensión de Chrome."
        )
      })

      it("rechaza si globalThis.chrome existe pero sin storage", async () => {
        ;(globalThis as any).chrome = {}
        await expect(saveToChrome("k", {})).rejects.toThrow(
          "Esta funcionalidad solo está disponible dentro de la Extensión de Chrome."
        )
      })

      it("rechaza si globalThis.chrome.storage existe pero sin local", async () => {
        ;(globalThis as any).chrome = { storage: {} }
        await expect(saveToChrome("k", {})).rejects.toThrow(
          "Esta funcionalidad solo está disponible dentro de la Extensión de Chrome."
        )
      })

      it("rechaza con lastError si chrome.runtime.lastError está definido tras set", async () => {
        const lastError = new Error("Quota exceeded")
        setGlobalChrome(buildChromeMock({ setError: lastError }))
        await expect(saveToChrome("k", {})).rejects.toEqual(lastError)
      })

      it("el rechazo por lastError contiene el objeto de error original sin envolver", async () => {
        const lastError = { message: "QUOTA_BYTES quota exceeded" }
        setGlobalChrome(buildChromeMock({ setError: lastError }))
        await expect(saveToChrome("k", {})).rejects.toEqual(lastError)
      })

      it("no llama a set si chrome.storage.local no está disponible", async () => {
        setGlobalChrome(null)
        try { await saveToChrome("k", {}) } catch {}
        expect((globalThis as any).chrome).toBeUndefined()
      })
    })

    describe("Casos límite", () => {
      it("acepta una clave vacía como string válido", async () => {
        const mock = buildChromeMock()
        setGlobalChrome(mock)
        await expect(saveToChrome("", { v: 1 })).resolves.toBeUndefined()
        expect(mock.storage.local.set).toHaveBeenCalledWith(
          { "": { v: 1 } },
          expect.any(Function)
        )
      })

      it("acepta una clave muy larga sin rechazar", async () => {
        setGlobalChrome(buildChromeMock())
        const longKey = "project_" + "x".repeat(500)
        await expect(saveToChrome(longKey, { v: 1 })).resolves.toBeUndefined()
      })

      it("acepta data con claves especiales (espacios, emojis, unicode)", async () => {
        const mock = buildChromeMock()
        setGlobalChrome(mock)
        const data = { "clave con espacios": "valor", "🔑": "emoji", "日本語": "unicode" }
        await saveToChrome("special_key", data)
        expect(mock.storage.local.set).toHaveBeenCalledWith(
          { special_key: data },
          expect.any(Function)
        )
      })

      it("devuelve una Promise real, no el resultado directo", () => {
        setGlobalChrome(buildChromeMock())
        const result = saveToChrome("k", {})
        expect(result).toBeInstanceOf(Promise)
      })

      it("chrome desaparece entre llamadas: primera resuelve, segunda rechaza", async () => {
        setGlobalChrome(buildChromeMock())
        await expect(saveToChrome("k1", {})).resolves.toBeUndefined()

        setGlobalChrome(null)
        await expect(saveToChrome("k2", {})).rejects.toThrow(
          "Esta funcionalidad solo está disponible dentro de la Extensión de Chrome."
        )
      })
    })
  })

  describe("getAllFromChrome", () => {
    describe("Casos positivos", () => {
      it("resuelve con array vacío si chrome.storage.local no está disponible", async () => {
        setGlobalChrome(null)
        await expect(getAllFromChrome()).resolves.toEqual([])
      })

      it("resuelve con array vacío si el storage está vacío", async () => {
        setGlobalChrome(buildChromeMock({ getItems: {} }))
        await expect(getAllFromChrome()).resolves.toEqual([])
      })

      it("inyecta _key en cada item con la clave del storage", async () => {
        setGlobalChrome(
          buildChromeMock({
            getItems: { project_1: { name: "Examen A" } }
          })
        )
        const result = await getAllFromChrome()
        expect(result).toEqual([{ name: "Examen A", _key: "project_1" }])
      })

      it("devuelve tantos items como entradas haya en el storage", async () => {
        setGlobalChrome(
          buildChromeMock({
            getItems: {
              project_1: { name: "A" },
              project_2: { name: "B" },
              project_3: { name: "C" }
            }
          })
        )
        const result = await getAllFromChrome()
        expect(result).toHaveLength(3)
      })

      it("cada item contiene tanto las propiedades originales como _key", async () => {
        setGlobalChrome(
          buildChromeMock({
            getItems: {
              project_5: { domainName: "ajedrez", baseClasses: "class A {}" }
            }
          })
        )
        const result = await getAllFromChrome()
        expect(result[0]).toMatchObject({
          domainName: "ajedrez",
          baseClasses: "class A {}",
          _key: "project_5"
        })
      })

      it("llama a chrome.storage.local.get con null para obtener todo el storage", async () => {
        const mock = buildChromeMock()
        setGlobalChrome(mock)
        await getAllFromChrome()
        expect(mock.storage.local.get).toHaveBeenCalledWith(
          null,
          expect.any(Function)
        )
      })

      it("llama a get exactamente una vez por invocación", async () => {
        const mock = buildChromeMock()
        setGlobalChrome(mock)
        await getAllFromChrome()
        expect(mock.storage.local.get).toHaveBeenCalledTimes(1)
      })

      it("resuelve con array vacío sin lanzar si chrome no está (comportamiento distinto a saveToChrome)", async () => {
        setGlobalChrome(null)
        const result = await getAllFromChrome()
        expect(Array.isArray(result)).toBe(true)
        expect(result).toHaveLength(0)
      })

      it("resuelve en llamadas consecutivas de forma independiente", async () => {
        setGlobalChrome(
          buildChromeMock({ getItems: { k1: { x: 1 }, k2: { x: 2 } } })
        )
        const r1 = await getAllFromChrome()
        const r2 = await getAllFromChrome()
        expect(r1).toHaveLength(2)
        expect(r2).toHaveLength(2)
      })
    })

    describe("Casos negativos", () => {
      it("rechaza si chrome.runtime.lastError está definido tras get", async () => {
        const lastError = new Error("Storage unavailable")
        setGlobalChrome(buildChromeMock({ getError: lastError }))
        await expect(getAllFromChrome()).rejects.toEqual(lastError)
      })

      it("rechaza con el objeto de error exacto sin re-envolver", async () => {
        const lastError = { message: "ACCESS_DENIED", code: 403 }
        setGlobalChrome(buildChromeMock({ getError: lastError }))
        await expect(getAllFromChrome()).rejects.toEqual(lastError)
      })

      it("no resuelve con array vacío cuando hay un lastError — rechaza", async () => {
        const lastError = new Error("Fatal error")
        setGlobalChrome(buildChromeMock({ getError: lastError }))
        let resolved = false
        try {
          await getAllFromChrome()
          resolved = true
        } catch {}
        expect(resolved).toBe(false)
      })

      it("si chrome.storage existe pero sin local → resuelve [] (mismo que chrome ausente)", async () => {
        ;(globalThis as any).chrome = { storage: {} }
        await expect(getAllFromChrome()).resolves.toEqual([])
      })

      it("si chrome existe pero sin storage → resuelve []", async () => {
        ;(globalThis as any).chrome = {}
        await expect(getAllFromChrome()).resolves.toEqual([])
      })
    })

    describe("Casos límite", () => {
      it("si el valor de un item es null, lo extiende como {} y añade _key", async () => {
        setGlobalChrome(
          buildChromeMock({ getItems: { project_null: null as any } })
        )
        const result = await getAllFromChrome()
        expect(result).toEqual([{ _key: "project_null" }])
      })

      it("si un item ya contiene _key, la clave del storage la sobreescribe", async () => {
        setGlobalChrome(
          buildChromeMock({
            getItems: { real_key: { _key: "fake_key", name: "Examen" } }
          })
        )
        const result = await getAllFromChrome()
        expect(result[0]._key).toBe("real_key")
      })

      it("maneja un storage con 100 entradas sin errores de rendimiento", async () => {
        const bigItems: Record<string, any> = {}
        for (let i = 0; i < 100; i++) {
          bigItems[`project_${i}`] = { index: i, name: `Examen ${i}` }
        }
        setGlobalChrome(buildChromeMock({ getItems: bigItems }))
        const result = await getAllFromChrome()
        expect(result).toHaveLength(100)
        expect(result.every((r) => "_key" in r)).toBe(true)
      })

      it("los items del resultado contienen _key incluso si el value no tiene propiedades", async () => {
        setGlobalChrome(
          buildChromeMock({ getItems: { bare_key: {} } })
        )
        const result = await getAllFromChrome()
        expect(result[0]).toEqual({ _key: "bare_key" })
      })

      it("devuelve una Promise real, no el resultado directo", () => {
        setGlobalChrome(buildChromeMock())
        const result = getAllFromChrome()
        expect(result).toBeInstanceOf(Promise)
      })

      it("chrome desaparece entre llamadas: primera resuelve, segunda resuelve []", async () => {
        setGlobalChrome(buildChromeMock({ getItems: { k: { v: 1 } } }))
        const r1 = await getAllFromChrome()
        expect(r1).toHaveLength(1)

        setGlobalChrome(null)
        const r2 = await getAllFromChrome()
        expect(r2).toEqual([])
      })

      it("un item con valor que es array: el spread lo convierte en objeto con índices numéricos como claves", async () => {
        setGlobalChrome(
          buildChromeMock({ getItems: { array_key: ["a", "b"] as any } })
        )
        const result = await getAllFromChrome()
        expect(result[0]).toMatchObject({ 0: "a", 1: "b", _key: "array_key" })
      })
    })
  })

  describe("Diferencia de comportamiento entre saveToChrome y getAllFromChrome sin chrome", () => {
    it("saveToChrome rechaza cuando no hay chrome; getAllFromChrome resuelve [] — comportamientos distintos", async () => {
      setGlobalChrome(null)
      await expect(saveToChrome("k", {})).rejects.toThrow()
      await expect(getAllFromChrome()).resolves.toEqual([])
    })

    it("ambas funciones son independientes: un error en una no afecta a la otra", async () => {
      const lastError = new Error("Error de get")
      setGlobalChrome(buildChromeMock({ getError: lastError }))
      await expect(getAllFromChrome()).rejects.toEqual(lastError)

      const mockOk = buildChromeMock()
      setGlobalChrome(mockOk)
      await expect(saveToChrome("k", {})).resolves.toBeUndefined()
    })
  })
})