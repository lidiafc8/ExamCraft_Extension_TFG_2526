import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

const mockCreate = vi.fn()
const mockAddListener = vi.fn()

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

let registeredCallback: () => void

beforeAll(async () => {
  await import("./background")
  registeredCallback = mockAddListener.mock.calls[0][0]
})

beforeEach(() => {
  mockCreate.mockClear()
})

describe("background.ts – registro del listener", () => {
  it("registra exactamente un listener en chrome.action.onClicked", () => {
    expect(mockAddListener).toHaveBeenCalledTimes(1)
  })

  it("NO llama a tabs.create al registrar el listener", () => {
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("el listener llama a chrome.tabs.create con la URL correcta", () => {
    registeredCallback()
    expect(mockCreate).toHaveBeenCalledWith({ url: "tabs/index.html" })
  })

  it("el listener solo abre una pestaña por click", () => {
    registeredCallback()
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })

  it("llamar el listener dos veces abre dos pestañas", () => {
    registeredCallback()
    registeredCallback()
    expect(mockCreate).toHaveBeenCalledTimes(2)
  })
})
