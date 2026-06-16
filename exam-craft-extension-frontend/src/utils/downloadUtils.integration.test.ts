import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { downloadMarkdown } from "./downloadUtils" 

describe("downloadMarkdown Utility Tests", () => {
  
  beforeEach(() => {
    vi.clearAllMocks()

    globalThis.URL.createObjectURL = vi.fn().mockReturnValue("blob:http://localhost/mock-uuid")
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("debería añadir la extensión .md automáticamente si el nombre del archivo no la tiene", () => {
    const linkMock = {
      href: "",
      download: "",
      click: vi.fn(),
      remove: vi.fn()
    } as any

    const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue(linkMock)
    const appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => linkMock)

    downloadMarkdown("# Mi Examen", " examen_patrones   ")

    
    expect(createElementSpy).toHaveBeenCalledWith("a")
    expect(linkMock.download).toBe("examen_patrones.md") 
  })

  it("no debería duplicar la extensión si el nombre del archivo ya termina en .md", () => {
    const linkMock = {
      href: "",
      download: "",
      click: vi.fn(),
      remove: vi.fn()
    } as any

    vi.spyOn(document, "createElement").mockReturnValue(linkMock)
    vi.spyOn(document.body, "appendChild").mockImplementation(() => linkMock)

    downloadMarkdown("# Enunciado", "final_PROYECTO.MD")

    expect(linkMock.download).toBe("final_PROYECTO.MD") 
  })

  it("debería realizar el flujo completo: crear el Blob, simular el click y limpiar el DOM", () => {
    const linkMock = {
      href: "",
      download: "",
      click: vi.fn(),
      remove: vi.fn()
    } as any

    const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue(linkMock)
    const appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => linkMock)

    downloadMarkdown("Contenido Markdown", "test.md")

    expect(createElementSpy).toHaveBeenCalledWith("a")
    expect(linkMock.href).toBe("blob:http://localhost/mock-uuid")

    expect(appendChildSpy).toHaveBeenCalledWith(linkMock)
    expect(linkMock.click).toHaveBeenCalledTimes(1)

    expect(linkMock.remove).toHaveBeenCalledTimes(1)
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/mock-uuid")
  })
})