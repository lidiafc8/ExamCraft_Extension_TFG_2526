import React from "react"
import { render, screen, act, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest"
import "@testing-library/jest-dom"
import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import { MermaidViewer, sanitizeForRender } from "./MermaidViewer"

expect.extend(jestDomMatchers)

vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn()
  }
}))

import mermaid from "mermaid"
const mockMermaid = mermaid as unknown as {
  initialize: ReturnType<typeof vi.fn>
  render: ReturnType<typeof vi.fn>
}

let forceEmptySvgMock = false

describe("Integración: MermaidViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    forceEmptySvgMock = false

    vi.stubGlobal("DOMParser", class {
      parseFromString() {
        if (forceEmptySvgMock) {
          return { querySelector: () => null } 
        }
        const svgEl = {
          getAttribute: (attr: string) => attr === "width" ? "100" : attr === "height" ? "100" : null,
          setAttribute: vi.fn(function(this: any, attr, val) {
            this[attr] = val
          }),
          removeAttribute: vi.fn(),
          style: { maxWidth: "", display: "" },
          querySelector: (sel: string) => sel === "svg" ? svgEl : null
        }
        return { querySelector: () => svgEl }
      }
    })

    vi.stubGlobal("XMLSerializer", class {
      serializeToString(el: any) {
        if (!el) return ""
        const width = el.width || "100%"
        const height = el.height || "auto"
        const maxWidth = el.style.maxWidth || "none"
        const display = el.style.display || "block"
        return `<svg width="${width}" height="${height}" style="max-width: ${maxWidth}; display: ${display};"><g></g></svg>`
      }
    })

    mockMermaid.render.mockResolvedValue({
      svg: '<svg width="100" height="100"><g></g></svg>'
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe("sanitizeForRender — Casos Positivos", () => {
    it("devuelve string vacío si la entrada es vacía", () => {
      expect(sanitizeForRender("")).toBe("")
    })

    it("reemplaza \\n literales por saltos de línea reales", () => {
      const result = sanitizeForRender("classDiagram\\nA-->B")
      expect(result).toContain("\n")
      expect(result).not.toContain("\\n")
    })

    it("reemplaza \\\" por comillas dobles reales", () => {
      const result = sanitizeForRender(`classDiagram\\n  A : \\"nombre\\"`)
      expect(result).toContain('"nombre"')
    })

    it("elimina llaves vacías {}", () => {
      const result = sanitizeForRender("classDiagram\n  class A {}")
      expect(result).not.toContain("{}")
    })

    it("normaliza --> con espacios", () => {
      const result = sanitizeForRender("classDiagram\n  A-->B")
      expect(result).toContain(" --> ")
    })

    it("normaliza <|-- con espacios", () => {
      const result = sanitizeForRender("classDiagram\n  Animal<|--Dog")
      expect(result).toContain(" <|-- ")
    })

    it("normaliza <-- con espacios", () => {
      const result = sanitizeForRender("classDiagram\n  B<--A")
      expect(result).toContain(" <-- ")
    })

    it("elimina líneas vacías", () => {
      const result = sanitizeForRender("classDiagram\n\n\nA-->B\n\n")
      const emptyLines = result.split("\n").filter((l) => l === "")
      expect(emptyLines).toHaveLength(0)
    })

    it("elimina líneas que empiezan con %%", () => {
      const result = sanitizeForRender("classDiagram\n%% comentario\nA-->B")
      expect(result).not.toContain("%%")
    })

    it("hace trim de cada línea individualmente", () => {
      const result = sanitizeForRender("classDiagram\n    A-->B   ")
      expect(result).toContain("A")
      expect(result).not.toMatch(/^ +A/m)
    })
  })

  describe("sanitizeForRender — Casos Negativos", () => {
    it("devuelve vacío si la entrada es null casteado", () => {
      expect(sanitizeForRender(null as unknown as string)).toBe("")
    })

    it("devuelve vacío si solo hay espacios en blanco", () => {
      expect(sanitizeForRender("   ")).toBe("")
    })

    it("devuelve vacío si solo hay comentarios %%", () => {
      const result = sanitizeForRender("%% solo comentario\n%% otro")
      expect(result).toBe("")
    })
  })

  describe("sanitizeForRender — Casos Límite", () => {
    it("maneja texto muy largo sin romperse", () => {
      const longInput = Array(1000).fill("A-->B").join("\n")
      const result = sanitizeForRender("classDiagram\n" + longInput)
      expect(result).toContain(" --> ")
    })

    it("maneja caracteres especiales sin romperse", () => {
      const result = sanitizeForRender("classDiagram\n  A : <>&\"'")
      expect(result).toBeTruthy()
    })

    it("abre llaves con salto de línea correctamente cuando hay contenido", () => {
      const result = sanitizeForRender("classDiagram\n  class A {\n  String name\n}")
      expect(result).toContain("{")
      expect(result).toContain("}")
    })
  })

  describe("MermaidViewer — Casos Positivos", () => {
    it("muestra 'Renderizando...' mientras espera el SVG", () => {
      mockMermaid.render.mockImplementation(() => new Promise(() => {}))

      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)

      expect(screen.getByText("Renderizando...")).toBeInTheDocument()
    })

    it("deja de mostrar 'Renderizando...' cuando mermaid.render resuelve", async () => {
      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)

      await act(async () => {})

      expect(screen.queryByText("Renderizando...")).not.toBeInTheDocument()
    })

    it("no muestra error cuando mermaid.render resuelve correctamente", async () => {
      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)

      await act(async () => {})

      expect(screen.queryByText(/Error renderizando/)).not.toBeInTheDocument()
    })

    it("aplica dimensiones responsivas al SVG (width 100%, height auto y estilos reseteados)", async () => {
      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)
      
      await act(async () => {})

      const innerContent = document.querySelector(".mermaid-inner-content")
      const svgEl = innerContent?.querySelector("svg")

      expect(svgEl).toBeTruthy()
      expect(svgEl).toHaveAttribute("width", "100%")
      expect(svgEl).toHaveAttribute("height", "auto")
      expect(svgEl?.getAttribute("style")).toContain("max-width: none")
      expect(svgEl?.getAttribute("style")).toContain("display: block")
    })

    it("retorna el string crudo en fixSvgDimensions si el parser no localiza el nodo svg", async () => {
      forceEmptySvgMock = true 

      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)
      await act(async () => {})

      const innerContent = document.querySelector(".mermaid-inner-content")
      expect(innerContent).toBeInTheDocument()
    })

    it("renderiza la barra de herramientas con botones de zoom y reset", () => {
      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)

      expect(screen.getByText("− Zoom")).toBeInTheDocument()
      expect(screen.getByText("+ Zoom")).toBeInTheDocument()
      expect(screen.getByText("⟳ Reset")).toBeInTheDocument()
    })

    it("muestra el porcentaje de zoom inicial al 100%", () => {
      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)

      expect(screen.getByText("100%")).toBeInTheDocument()
    })

    it("incrementa el zoom al pulsar + Zoom", async () => {
      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)

      await userEvent.click(screen.getByText("+ Zoom"))

      expect(screen.getByText("120%")).toBeInTheDocument()
    })

    it("decrementa el zoom al pulsar − Zoom", async () => {
      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)

      await userEvent.click(screen.getByText("− Zoom"))

      expect(screen.getByText("80%")).toBeInTheDocument()
    })

    it("resetea el zoom a 100% al pulsar ⟳ Reset", async () => {
      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)

      await userEvent.click(screen.getByText("+ Zoom"))
      expect(screen.getByText("120%")).toBeInTheDocument()

      await userEvent.click(screen.getByText("⟳ Reset"))
      expect(screen.getByText("100%")).toBeInTheDocument()
    })

    it("activa el panning al hacer mousedown y mousemove", async () => {
      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)
      await act(async () => {})

      const container = document.querySelector(".mermaid-outer-container") as HTMLElement

      fireEvent.mouseDown(container, { clientX: 100, clientY: 100 })
      fireEvent.mouseMove(container, { clientX: 150, clientY: 120 })
      fireEvent.mouseUp(container)

      expect(screen.getByText("100%")).toBeInTheDocument()
    })

    it("detiene el panning al hacer mouseup", async () => {
      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)
      await act(async () => {})

      const container = document.querySelector(".mermaid-outer-container") as HTMLElement

      fireEvent.mouseDown(container, { clientX: 100, clientY: 100 })
      fireEvent.mouseUp(container)
      fireEvent.mouseMove(container, { clientX: 200, clientY: 200 })

      expect(screen.getByText("100%")).toBeInTheDocument()
    })

    it("detiene el panning al salir del contenedor con mouseLeave", async () => {
      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)
      await act(async () => {})

      const container = document.querySelector(".mermaid-outer-container") as HTMLElement

      fireEvent.mouseDown(container, { clientX: 100, clientY: 100 })
      vi.spyOn(console, "error").mockImplementation(() => {})
      fireEvent.mouseLeave(container)
      fireEvent.mouseMove(container, { clientX: 200, clientY: 200 })

      expect(screen.getByText("100%")).toBeInTheDocument()
    })

    it("hace zoom con la rueda del ratón hacia arriba", async () => {
      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)
      await act(async () => {})

      const container = document.querySelector(".mermaid-outer-container") as HTMLElement

      fireEvent.wheel(container, { deltaY: -100, preventDefault: vi.fn() })

      expect(screen.getByText("110%")).toBeInTheDocument()
    })

    it("hace zoom con la rueda del ratón hacia abajo", async () => {
      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)
      await act(async () => {})

      const container = document.querySelector(".mermaid-outer-container") as HTMLElement

      fireEvent.wheel(container, { deltaY: 100, preventDefault: vi.fn() })

      expect(screen.getByText("90%")).toBeInTheDocument()
    })
  })

  describe("MermaidViewer — Casos Negativos", () => {
    it("muestra error si mermaid.render lanza una excepción", async () => {
      mockMermaid.render.mockRejectedValue(new Error("sintaxis inválida"))

      render(<MermaidViewer chartCode="diagrama inválido" />)

      await act(async () => {})

      expect(screen.getByText(/Error renderizando/)).toBeInTheDocument()
    })

    it("maneja correctamente excepciones extrañas sin propiedad message en el bloque catch", async () => {
      mockMermaid.render.mockRejectedValue("Error crítico fatal crudo")

      render(<MermaidViewer chartCode="diagrama roto" />)
      await act(async () => {})

      expect(screen.getByText("Error renderizando: Error crítico fatal crudo")).toBeInTheDocument()
    })

    it("muestra el código que falló en un details al producirse error", async () => {
      mockMermaid.render.mockRejectedValue(new Error("fallo"))

      render(<MermaidViewer chartCode="código inválido" />)

      await act(async () => {})

      expect(screen.getByText("Ver código que falló")).toBeInTheDocument()
    })

    it("no llama a mermaid.render si chartCode está vacío", () => {
      render(<MermaidViewer chartCode="" />)

      expect(mockMermaid.render).not.toHaveBeenCalled()
    })

    it("no muestra SVG y muestra error si mermaid.render devuelve svg vacío", async () => {
      mockMermaid.render.mockResolvedValue({ svg: "" })

      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)

      await act(async () => {})

      expect(screen.getByText(/Error renderizando/)).toBeInTheDocument()
    })
  })

  describe("MermaidViewer — Casos Límite", () => {
    it("el zoom no baja de 15% aunque se pulse muchas veces − Zoom", async () => {
      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)

      for (let i = 0; i < 30; i++) {
        await userEvent.click(screen.getByText("− Zoom"))
      }

      expect(screen.getByText("15%")).toBeInTheDocument()
    })

    it("el zoom no supera 500% aunque se pulse muchas veces + Zoom", async () => {
      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)

      for (let i = 0; i < 30; i++) {
        await userEvent.click(screen.getByText("+ Zoom"))
      }

      expect(screen.getByText("500%")).toBeInTheDocument()
    })

    it("re-renderiza el SVG cuando cambia chartCode", async () => {
      const { rerender } = render(<MermaidViewer chartCode="classDiagram\nA-->B" />)
      await act(async () => {})

      expect(mockMermaid.render).toHaveBeenCalledTimes(1)

      rerender(<MermaidViewer chartCode="classDiagram\nC-->D" />)
      await act(async () => {})

      expect(mockMermaid.render).toHaveBeenCalledTimes(2)
    })
  })

  describe("Flujo Completo", () => {
    it("flujo completo: carga → renderiza SVG → zoom in → zoom out → reset", async () => {
      render(<MermaidViewer chartCode="classDiagram\nA-->B" />)

      expect(screen.getByText("Renderizando...")).toBeInTheDocument()

      await act(async () => {})
      expect(screen.queryByText("Renderizando...")).not.toBeInTheDocument()
      expect(screen.queryByText(/Error renderizando/)).not.toBeInTheDocument()
      expect(screen.getByText("100%")).toBeInTheDocument()

      await userEvent.click(screen.getByText("+ Zoom"))
      expect(screen.getByText("120%")).toBeInTheDocument()

      await userEvent.click(screen.getByText("− Zoom"))
      await userEvent.click(screen.getByText("− Zoom"))
      expect(screen.getByText("80%")).toBeInTheDocument()

      await userEvent.click(screen.getByText("⟳ Reset"))
      expect(screen.getByText("100%")).toBeInTheDocument()
    })

    it("flujo completo: error de render → muestra mensaje → código visible en details", async () => {
      mockMermaid.render.mockRejectedValue(new Error("diagrama inválido"))

      render(<MermaidViewer chartCode="código roto" />)

      expect(screen.getByText("Renderizando...")).toBeInTheDocument()

      await act(async () => {})
      expect(screen.getByText(/Error renderizando/)).toBeInTheDocument()

      expect(screen.getByText("Ver código que falló")).toBeInTheDocument()
    })
  })
})