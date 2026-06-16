import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest"

const mockAddListener = vi.fn()
const mockCreate = vi.fn()

vi.stubGlobal("chrome", {
  action: {
    onClicked: {
      addListener: mockAddListener
    }
  },
  tabs: {
    create: mockCreate
  }
})

describe("Integración: background script - chrome.action.onClicked", () => {
  let registeredListener: () => void

  beforeAll(async () => {
    await import("./background")
    // Guardamos el listener ANTES de que clearAllMocks lo borre
    registeredListener = mockAddListener.mock.calls[0][0]
  })

  beforeEach(() => {
    mockCreate.mockClear() // solo limpiamos el create, no el addListener
  })

  it("registra un listener en chrome.action.onClicked al cargar el script", () => {
    expect(registeredListener).toBeDefined()
    expect(typeof registeredListener).toBe("function")
  })

  it("abre una nueva pestaña con la URL correcta al disparar el listener", () => {
    registeredListener()

    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledWith({ url: "tabs/index.html" })
  })

  it("no abre ninguna pestaña si el listener no se ha disparado", () => {
    expect(mockCreate).not.toHaveBeenCalled()
  })
})