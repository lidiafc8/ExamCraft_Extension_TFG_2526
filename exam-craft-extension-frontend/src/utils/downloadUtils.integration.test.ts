import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { downloadMarkdown } from "./downloadUtils" // Ajusta la ruta a tu archivo real

describe("downloadMarkdown Utility Tests", () => {
  
  beforeEach(() => {
    vi.clearAllMocks()

    // Mockeamos las funciones globales de URL para que no lancen errores en el entorno de test
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue("blob:http://localhost/mock-uuid")
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("debería añadir la extensión .md automáticamente si el nombre del archivo no la tiene", () => {
    // Espiamos la creación de elementos en el documento
    const linkMock = {
      href: "",
      download: "",
      click: vi.fn(),
      remove: vi.fn()
    } as any

    const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue(linkMock)
    const appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => linkMock)

    // Ejecutamos pasándole un nombre sin extensión y con espacios
    downloadMarkdown("# Mi Examen", " examen_patrones   ")

    // Verificaciones de formato de nombre
    expect(createElementSpy).toHaveBeenCalledWith("a")
    expect(linkMock.download).toBe("examen_patrones.md") // Trim + extensión añadida
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

    // Ejecutamos pasándole un nombre que ya incluye .md (incluso en mayúsculas para comprobar el toLowerCase)
    downloadMarkdown("# Enunciado", "final_PROYECTO.MD")

    expect(linkMock.download).toBe("final_PROYECTO.MD") // No le añade ".md.md"
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

    // 1. Verifica que crea el enlace temporal con el objeto URL ficticio
    expect(createElementSpy).toHaveBeenCalledWith("a")
    expect(linkMock.href).toBe("blob:http://localhost/mock-uuid")

    // 2. Verifica que se añade al documento y se dispara la descarga nativa
    expect(appendChildSpy).toHaveBeenCalledWith(linkMock)
    expect(linkMock.click).toHaveBeenCalledTimes(1)

    // 3. Verifica la limpieza absoluta del DOM y la memoria del navegador
    expect(linkMock.remove).toHaveBeenCalledTimes(1)
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/mock-uuid")
  })
})