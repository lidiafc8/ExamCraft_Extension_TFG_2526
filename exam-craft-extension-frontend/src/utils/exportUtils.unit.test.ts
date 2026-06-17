import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { downloadMarkdown } from "./downloadUtils"

function buildDomMocks() {
  const createdLinks: any[] = []

  const appendChildSpy = vi
    .spyOn(document.body, "appendChild")
    .mockImplementation((node) => node as any)

  const createElementSpy = vi
    .spyOn(document, "createElement")
    .mockImplementation((tagName) => {
      if (tagName === "a") {
        const linkEl = {
          href: "",
          download: "",
          click: vi.fn(),
          remove: vi.fn()
        }
        createdLinks.push(linkEl)
        return linkEl as any
      }
      return {} as any
    })

  const createObjectURLSpy = vi
    .spyOn(URL, "createObjectURL")
    .mockReturnValue("blob:mock-url-1234")
  const revokeObjectURLSpy = vi
    .spyOn(URL, "revokeObjectURL")
    .mockImplementation(() => {})

  return {
    createdLinks,
    appendChildSpy,
    createElementSpy,
    createObjectURLSpy,
    revokeObjectURLSpy
  }
}

describe("exportUtils", () => {
  let mocks: ReturnType<typeof buildDomMocks>

  beforeEach(() => {
    mocks = buildDomMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("Casos positivos", () => {
    it("crea un elemento <a> usando document.createElement", () => {
      downloadMarkdown("# Hola", "examen")
      expect(mocks.createElementSpy).toHaveBeenCalledWith("a")
    })

    it("añade la extensión .md si el fileName no la tiene", () => {
      downloadMarkdown("# Test", "mi-examen")
      expect(mocks.createdLinks[0].download).toBe("mi-examen.md")
    })

    it("no duplica la extensión .md si el fileName ya la incluye", () => {
      downloadMarkdown("# Test", "mi-examen.md")
      expect(mocks.createdLinks[0].download).toBe("mi-examen.md")
    })

    it("asigna la URL del blob al href del enlace", () => {
      downloadMarkdown("# Test", "archivo")
      expect(mocks.createdLinks[0].href).toBe("blob:mock-url-1234")
    })

    it("llama a URL.createObjectURL con un Blob del tipo correcto", () => {
      downloadMarkdown("contenido", "file")
      const blob = mocks.createObjectURLSpy.mock.calls[0][0] as Blob
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe("text/markdown;charset=utf-8")
    })

    it("el Blob contiene exactamente el contenido pasado como argumento", async () => {
      const content = "# Título\n\nPárrafo de prueba."
      downloadMarkdown(content, "doc")
      const blob = mocks.createObjectURLSpy.mock.calls[0][0] as Blob
      const text = await blob.text()
      expect(text).toBe(content)
    })

    it("añade el enlace al body antes de hacer click", () => {
      const callOrder: string[] = []

      mocks.createElementSpy.mockImplementation(() => {
        const linkEl = {
          href: "",
          download: "",
          click: vi.fn(() => callOrder.push("click")),
          remove: vi.fn()
        }
        mocks.createdLinks.push(linkEl)
        return linkEl as any
      })

      mocks.appendChildSpy.mockImplementation(() => {
        callOrder.push("appendChild")
        return {} as any
      })

      downloadMarkdown("# Test", "orden")
      expect(callOrder.indexOf("appendChild")).toBeLessThan(
        callOrder.indexOf("click")
      )
    })

    it("llama a link.click() exactamente una vez", () => {
      downloadMarkdown("# Test", "click-test")
      expect(mocks.createdLinks[0].click).toHaveBeenCalledTimes(1)
    })

    it("llama a link.remove() después de hacer click", () => {
      const callOrder: string[] = []

      mocks.createElementSpy.mockImplementation(() => {
        const linkEl = {
          href: "",
          download: "",
          click: vi.fn(() => callOrder.push("click")),
          remove: vi.fn(() => callOrder.push("remove"))
        }
        mocks.createdLinks.push(linkEl)
        return linkEl as any
      })

      downloadMarkdown("# Test", "remove-test")
      expect(callOrder.indexOf("click")).toBeLessThan(
        callOrder.indexOf("remove")
      )
    })

    it("llama a URL.revokeObjectURL con la URL creada para liberar memoria", () => {
      downloadMarkdown("# Test", "revoke-test")
      expect(mocks.revokeObjectURLSpy).toHaveBeenCalledWith(
        "blob:mock-url-1234"
      )
    })

    it("revoca la URL después de hacer click y remove", () => {
      const callOrder: string[] = []

      mocks.createElementSpy.mockImplementation(() => {
        const linkEl = {
          href: "",
          download: "",
          click: vi.fn(() => callOrder.push("click")),
          remove: vi.fn(() => callOrder.push("remove"))
        }
        mocks.createdLinks.push(linkEl)
        return linkEl as any
      })
      mocks.revokeObjectURLSpy.mockImplementation(() =>
        callOrder.push("revoke")
      )

      downloadMarkdown("# Test", "orden-completo")
      expect(callOrder).toEqual(["click", "remove", "revoke"])
    })

    it("la extensión .md se compara en minúsculas (.MD también se reconoce)", () => {
      downloadMarkdown("# Test", "archivo.MD")
      expect(mocks.createdLinks[0].download).toBe("archivo.MD")
    })

    it("funciona correctamente con contenido vacío como string vacío", () => {
      downloadMarkdown("", "vacio")
      expect(mocks.createdLinks[0].click).toHaveBeenCalledTimes(1)
      expect(mocks.createdLinks[0].download).toBe("vacio.md")
    })

    it("funciona con contenido markdown extenso (múltiples secciones)", async () => {
      const content = Array.from(
        { length: 100 },
        (_, i) => `## Sección ${i}\n\nContenido del apartado ${i}.\n`
      ).join("\n")
      downloadMarkdown(content, "extenso")
      const blob = mocks.createObjectURLSpy.mock.calls[0][0] as Blob
      const text = await blob.text()
      expect(text).toBe(content)
    })
  })

  describe("Casos negativos", () => {
    it("trim del fileName elimina espacios al inicio y al final antes de añadir .md", () => {
      downloadMarkdown("# Test", "  examen  ")
      expect(mocks.createdLinks[0].download).toBe("examen.md")
    })

    it("trim del fileName elimina tabulaciones y saltos de línea", () => {
      downloadMarkdown("# Test", "\texamen\n")
      expect(mocks.createdLinks[0].download).toBe("examen.md")
    })

    it("un fileName de solo espacios queda como '.md' tras trim + extensión", () => {
      downloadMarkdown("# Test", "   ")
      expect(mocks.createdLinks[0].download).toBe(".md")
    })

    it("un fileName vacío queda como '.md'", () => {
      downloadMarkdown("# Test", "")
      expect(mocks.createdLinks[0].download).toBe(".md")
    })

    it("no lanza excepción si el contenido tiene caracteres especiales (unicode, emojis)", () => {
      expect(() =>
        downloadMarkdown("# 日本語 🎉 àéîõü", "unicode-file")
      ).not.toThrow()
    })

    it("no lanza excepción si el fileName contiene caracteres especiales", () => {
      expect(() =>
        downloadMarkdown("contenido", "examen-2025_v2 (final).md")
      ).not.toThrow()
      expect(mocks.createdLinks[0].download).toBe("examen-2025_v2 (final).md")
    })

    it("siempre llama a revokeObjectURL aunque el contenido sea vacío", () => {
      downloadMarkdown("", "vacio")
      expect(mocks.revokeObjectURLSpy).toHaveBeenCalledTimes(1)
    })

    it("siempre llama a remove aunque el contenido sea vacío", () => {
      downloadMarkdown("", "vacio")
      expect(mocks.createdLinks[0].remove).toHaveBeenCalledTimes(1)
    })
  })

  describe("Casos límite", () => {
    it("extensión .md en mitad del nombre NO cuenta como sufijo (.md.bak añade .md)", () => {
      downloadMarkdown("# Test", "archivo.md.bak")
      expect(mocks.createdLinks[0].download).toBe("archivo.md.bak.md")
    })

    it("fileName que termina en .MD (mayúsculas) no duplica la extensión", () => {
      downloadMarkdown("# Test", "EXAMEN.MD")
      expect(mocks.createdLinks[0].download).toBe("EXAMEN.MD")
    })

    it("fileName que termina en .Md (mixto) no duplica la extensión", () => {
      downloadMarkdown("# Test", "examen.Md")
      expect(mocks.createdLinks[0].download).toBe("examen.Md")
    })

    it("fileName con ruta de directorios: solo añade .md al final sin modificar la ruta", () => {
      downloadMarkdown("# Test", "carpeta/subcarpeta/archivo")
      expect(mocks.createdLinks[0].download).toBe(
        "carpeta/subcarpeta/archivo.md"
      )
    })

    it("createObjectURL se llama exactamente una vez por invocación", () => {
      downloadMarkdown("# Test", "uno")
      expect(mocks.createObjectURLSpy).toHaveBeenCalledTimes(1)
    })

    it("revokeObjectURL se llama exactamente una vez por invocación", () => {
      downloadMarkdown("# Test", "uno")
      expect(mocks.revokeObjectURLSpy).toHaveBeenCalledTimes(1)
    })

    it("en llamadas consecutivas cada una crea su propio enlace y revoca su propia URL", () => {
      mocks.createObjectURLSpy
        .mockReturnValueOnce("blob:url-A")
        .mockReturnValueOnce("blob:url-B")

      downloadMarkdown("# A", "archivoA")
      downloadMarkdown("# B", "archivoB")

      expect(mocks.revokeObjectURLSpy).toHaveBeenNthCalledWith(1, "blob:url-A")
      expect(mocks.revokeObjectURLSpy).toHaveBeenNthCalledWith(2, "blob:url-B")
    })

    it("el tipo del Blob es siempre 'text/markdown;charset=utf-8' independientemente del contenido", () => {
      const inputs = ["", "  ", "# Título", "<html>no markdown</html>", "{}"]
      inputs.forEach((content) => {
        vi.clearAllMocks()
        mocks = buildDomMocks()
        downloadMarkdown(content, "test")
        const blob = mocks.createObjectURLSpy.mock.calls[0][0] as Blob
        expect(blob.type).toBe("text/markdown;charset=utf-8")
      })
    })

    it("fileName con punto al inicio (.hidden) añade .md correctamente", () => {
      downloadMarkdown("# Test", ".hidden")
      expect(mocks.createdLinks[0].download).toBe(".hidden.md")
    })

    it("fileName que es solo '.md' no añade extensión adicional", () => {
      downloadMarkdown("# Test", ".md")
      expect(mocks.createdLinks[0].download).toBe(".md")
    })

    it("el orden de operaciones completo: createObjectURL → createElement → appendChild → click → remove → revokeObjectURL", () => {
      const callOrder: string[] = []

      mocks.createObjectURLSpy.mockImplementation(() => {
        callOrder.push("createObjectURL")
        return "blob:ordered-url"
      })
      mocks.createElementSpy.mockImplementation((tagName) => {
        callOrder.push("createElement")
        const linkEl = {
          href: "",
          download: "",
          click: vi.fn(() => callOrder.push("click")),
          remove: vi.fn(() => callOrder.push("remove"))
        }
        mocks.createdLinks.push(linkEl)
        return linkEl as any
      })
      mocks.appendChildSpy.mockImplementation(() => {
        callOrder.push("appendChild")
        return {} as any
      })
      mocks.revokeObjectURLSpy.mockImplementation(() =>
        callOrder.push("revokeObjectURL")
      )

      downloadMarkdown("# Test", "orden-total")

      expect(callOrder).toEqual([
        "createObjectURL",
        "createElement",
        "appendChild",
        "click",
        "remove",
        "revokeObjectURL"
      ])
    })
  })

  describe("Flujo máximo", () => {
    it("descarga un documento markdown complejo con todas las llamadas correctas y en orden", async () => {
      const content = [
        "# Examen de Programación Orientada a Objetos",
        "",
        "## Dominio: Clínica Veterinaria",
        "",
        "### Restricciones de Atributos",
        "- La edad del animal debe ser mayor que 0",
        "- El nombre no puede estar vacío",
        "",
        "### Relaciones entre Entidades",
        "- Un veterinario puede atender a many animales",
        "- Un animal pertenece a un único dueño",
        "",
        "```java",
        "public class Animal {",
        "    private String nombre;",
        "    private int edad;",
        "}",
        "```",
        "",
        "---",
        "_Generado automáticamente por ExamCraft_"
      ].join("\n")

      const fileName = "  examen-veterinaria-2025  "

      downloadMarkdown(content, fileName)

      expect(mocks.createdLinks[0].download).toBe("examen-veterinaria-2025.md")
      expect(mocks.createdLinks[0].href).toBe("blob:mock-url-1234")

      const blob = mocks.createObjectURLSpy.mock.calls[0][0] as Blob
      expect(blob.type).toBe("text/markdown;charset=utf-8")

      const text = await blob.text()
      expect(text).toBe(content)

      expect(mocks.appendChildSpy).toHaveBeenCalledWith(mocks.createdLinks[0])
      expect(mocks.createdLinks[0].click).toHaveBeenCalledTimes(1)
      expect(mocks.createdLinks[0].remove).toHaveBeenCalledTimes(1)
      expect(mocks.revokeObjectURLSpy).toHaveBeenCalledWith(
        "blob:mock-url-1234"
      )
    })

    it("dos descargas simultáneas (consecutivas) no se interfieren entre sí", async () => {
      mocks.createObjectURLSpy
        .mockReturnValueOnce("blob:url-examen-A")
        .mockReturnValueOnce("blob:url-examen-B")

      downloadMarkdown("# Examen A", "examen-a")
      downloadMarkdown("# Examen B", "examen-b.md")

      expect(mocks.createObjectURLSpy).toHaveBeenCalledTimes(2)
      expect(mocks.revokeObjectURLSpy).toHaveBeenCalledTimes(2)
      expect(mocks.revokeObjectURLSpy).toHaveBeenNthCalledWith(
        1,
        "blob:url-examen-A"
      )
      expect(mocks.revokeObjectURLSpy).toHaveBeenNthCalledWith(
        2,
        "blob:url-examen-B"
      )

      expect(mocks.createdLinks).toHaveLength(2)
      expect(mocks.createdLinks[0].download).toBe("examen-a.md")
      expect(mocks.createdLinks[1].download).toBe("examen-b.md")

      expect(mocks.createdLinks[0].click).toHaveBeenCalledTimes(1)
      expect(mocks.createdLinks[1].click).toHaveBeenCalledTimes(1)
    })
  })
})
