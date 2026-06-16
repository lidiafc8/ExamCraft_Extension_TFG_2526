import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
// Corrección de la importación: Usamos llaves explicítas para el export nombrado
import { downloadProjectAsMarkdown } from "./exportUtils" 
import { sanitizeMermaidForModal } from "./mermaidUtils"

// Mockeamos la dependencia de utilidades de Mermaid
vi.mock("./mermaidUtils", () => ({
  sanitizeMermaidForModal: vi.fn((text) => text) // Retorna el texto tal cual para simplificar
}))

describe("downloadProjectAsMarkdown Utility Tests", () => {
  let linkMock: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Configuración de mocks globales de URL para el entorno de pruebas
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue("blob:http://localhost/mock-uuid")
    globalThis.URL.revokeObjectURL = vi.fn()

    // Mock del elemento de enlace simulado
    linkMock = {
      href: "",
      download: "",
      click: vi.fn(),
      remove: vi.fn()
    }

    vi.spyOn(document, "createElement").mockReturnValue(linkMock as any)
    vi.spyOn(document.body, "appendChild").mockImplementation(() => linkMock as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("debería retornar inmediatamente y no hacer nada si el proyecto es nulo o indefinido", () => {
    downloadProjectAsMarkdown(null, "examen.md")
    expect(document.createElement).not.toHaveBeenCalled()
  })

  it("debería estructurar correctamente el título usando customName si existe", () => {
    const fakeProject = {
      customName: "Patrones Estructurales",
      extensionFinish: "Enunciado de la extensión"
    }

    // Usamos un mock para inspeccionar qué se está guardando dentro del Blob
    const blobSpy = vi.spyOn(globalThis, "Blob").mockImplementation((chunks) => {
      const text = chunks[0] as string
      expect(text).toContain("# Examen: Patrones Estructurales")
      return {} as Blob
    })

    downloadProjectAsMarkdown(fakeProject, "test")
    expect(blobSpy).toHaveBeenCalled()
  })

  it("debería usar domainName en el título si customName no está presente", () => {
    const fakeProject = {
      domainName: "Matemáticas",
      extensionFinish: "Enunciado de la extensión"
    }

    const blobSpy = vi.spyOn(globalThis, "Blob").mockImplementation((chunks) => {
      const text = chunks[0] as string
      expect(text).toContain("# Examen de Matemáticas")
      return {} as Blob
    })

    downloadProjectAsMarkdown(fakeProject, "test")
    expect(blobSpy).toHaveBeenCalled()
  })

  it("debería procesar y aislar el bloque de código Mermaid si se detecta un diagrama", () => {
    const fakeProject = {
      customName: "Examen con Diagrama",
      extensionFinish: "Texto introductorio\nclassDiagram\nclass Persona {\n  +String nombre\n}"
    }

    vi.mocked(sanitizeMermaidForModal).mockReturnValueOnce("classDiagram\nclass Persona {\n  +String nombre\n}")

    const blobSpy = vi.spyOn(globalThis, "Blob").mockImplementation((chunks) => {
      const text = chunks[0] as string
      expect(text).toContain("## 1. Extensión Funcional\nTexto introductorio")
      expect(text).toContain("### Diagrama de Clases\n```mermaid\nclassDiagram\nclass Persona {\n  +String nombre\n}\n```")
      return {} as Blob
    })

    downloadProjectAsMarkdown(fakeProject, "test")
    expect(sanitizeMermaidForModal).toHaveBeenCalled()
    expect(blobSpy).toHaveBeenCalled()
  })

  it("debería formatear y ordenar alfabéticamente las partes de los tests en JUnit", () => {
    const fakeProject = {
      customName: "Examen Tests",
      testPartsMap: {
        "B_Test.java": { fileName: "B_Test.java", code: "```java\npublic class B {}\n```" },
        "A_Test.java": { fileName: "A_Test.java", code: "public class A {}" }
      }
    }

    const blobSpy = vi.spyOn(globalThis, "Blob").mockImplementation((chunks) => {
      const text = chunks[0] as string
      // Comprobamos que el código se limpia de backticks adicionales
      expect(text).toContain("### 📄 A_Test.java\n```java\npublic class A {}\n```")
      expect(text).toContain("### 📄 B_Test.java\n```java\npublic class B {}\n```")
      
      // Comprobamos el orden alfabético: A_Test debe aparecer antes que B_Test en el cuerpo del Markdown
      expect(text.indexOf("A_Test.java")).toBeLessThan(text.indexOf("B_Test.java"))
      return {} as Blob
    })

    downloadProjectAsMarkdown(fakeProject, "test")
    expect(blobSpy).toHaveBeenCalled()
  })

  it("debería envolver en formato ```java secciones como clases base mediante formatCodeSection si no tienen backticks", () => {
    const fakeProject = {
      customName: "Examen Clases Base",
      baseClasses: "public class Base {}" // Texto plano sin bloques markdown
    }

    const blobSpy = vi.spyOn(globalThis, "Blob").mockImplementation((chunks) => {
      const text = chunks[0] as string
      // Valida que formatCodeSection lo envolvió con triple acento automáticamente
      expect(text).toContain("## 4. Clases Base\n```java\npublic class Base {}\n```")
      return {} as Blob
    })

    downloadProjectAsMarkdown(fakeProject, "test")
    expect(blobSpy).toHaveBeenCalled()
  })

  it("debería cerrar los backticks impares en formatCodeSection para evitar romper la estética del Markdown", () => {
    const fakeProject = {
      customName: "Examen Backticks Impares",
      baseClasses: "```java\npublic class Incompleta {" // Solo 1 set de triple acento
    }

    const blobSpy = vi.spyOn(globalThis, "Blob").mockImplementation((chunks) => {
      const text = chunks[0] as string
      // Valida que el código añade el cierre de backticks al final
      expect(text).toContain("```java\npublic class Incompleta {\n```")
      return {} as Blob
    })

    downloadProjectAsMarkdown(fakeProject, "test")
    expect(blobSpy).toHaveBeenCalled()
  })

  it("debería ejecutar todo el flujo del ciclo de vida de descarga y añadir la extensión .md al nombre", () => {
    const fakeProject = { customName: "Descarga Final" }

    downloadProjectAsMarkdown(fakeProject, "  mi_archivo_de_examen  ")

    // Verificación del limpiado del nombre del archivo y guardado
    expect(linkMock.download).toBe("mi_archivo_de_examen.md")
    expect(linkMock.href).toBe("blob:http://localhost/mock-uuid")
    expect(document.body.appendChild).toHaveBeenCalledWith(linkMock)
    expect(linkMock.click).toHaveBeenCalledTimes(1)
    
    // Verificación de la recolección de basura de memoria y DOM
    expect(linkMock.remove).toHaveBeenCalledTimes(1)
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/mock-uuid")
  })
})