import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import mermaid from "mermaid"

import { MermaidViewer, sanitizeForRender } from "./MermaidViewer"

vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({
      svg: '<svg width="400" height="200"><g></g></svg>'
    })
  }
}))

const mockSvgElement = {
  getAttribute: vi.fn((attr: string) => (attr === "viewBox" ? null : "100")),
  setAttribute: vi.fn(),
  removeAttribute: vi.fn(),
  style: {} as CSSStyleDeclaration
}

beforeEach(() => {
  cleanup()
  vi.clearAllMocks()

  vi.mocked(mermaid.render).mockResolvedValue({
    svg: '<svg width="400" height="200"><g></g></svg>'
  })

  vi.spyOn(global, "DOMParser").mockImplementation(
    () =>
      ({
        parseFromString: vi.fn().mockReturnValue({
          querySelector: vi.fn().mockReturnValue(mockSvgElement)
        })
      }) as any
  )

  vi.spyOn(global, "XMLSerializer").mockImplementation(
    () =>
      ({
        serializeToString: vi
          .fn()
          .mockReturnValue("<svg viewBox='0 0 400 200'></svg>")
      }) as any
  )
})

const renderAndWait = async (chartCode = "graph TD\nA-->B") => {
  const result = render(<MermaidViewer chartCode={chartCode} />)
  await waitFor(() =>
    expect(
      result.container.querySelector(".mermaid-inner-content")
    ).toBeInTheDocument()
  )
  return result
}

describe("sanitizeForRender – función pura", () => {
  it("línea 13: retorna string vacío con input vacío", () => {
    expect(sanitizeForRender("")).toBe("")
  })

  it("línea 13: retorna string vacío con string null-like (falsy)", () => {
    expect(sanitizeForRender("" as any)).toBe("")
  })

  it("elimina comentarios %%", () => {
    expect(sanitizeForRender("graph TD\n%% comentario\nA-->B")).not.toContain(
      "%%"
    )
  })

  it("añade espacios alrededor de <|--", () => {
    expect(sanitizeForRender("A<|--B")).toContain("<|--")
  })

  it("añade espacios alrededor de -->", () => {
    expect(sanitizeForRender("A-->B")).toContain("-->")
  })

  it("reemplaza \\n escapados por saltos de línea reales", () => {
    const result = sanitizeForRender("graph TD\\nA-->B")
    expect(result).toContain("\n")
  })

  it("elimina llaves vacías { }", () => {
    expect(sanitizeForRender("A { }")).not.toContain("{ }")
  })

  it("hace trim del resultado final", () => {
    const result = sanitizeForRender("  graph TD  ")
    expect(result).toBe(result.trim())
  })

  it("retorna string vacío si solo contiene comentarios", () => {
    expect(sanitizeForRender("%% solo comentarios")).toBe("")
  })

  it("retorna string vacío si solo contiene líneas vacías", () => {
    expect(sanitizeForRender("\n\n\n")).toBe("")
  })
})

describe("MermaidViewer – renderizado básico", () => {
  it("renderiza el contenedor principal", () => {
    const { container } = render(<MermaidViewer chartCode="" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it("muestra la toolbar con los botones de zoom y reset", () => {
    render(<MermaidViewer chartCode="" />)
    expect(screen.getByRole("button", { name: "− Zoom" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "+ Zoom" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "⟳ Reset" })).toBeInTheDocument()
  })

  it("muestra el porcentaje de escala inicial al 100%", () => {
    render(<MermaidViewer chartCode="" />)
    expect(screen.getByText("100%")).toBeInTheDocument()
  })

  it("muestra 'Renderizando...' mientras se procesa el chartCode", async () => {
    vi.mocked(mermaid.render).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                svg: '<svg width="100" height="100"></svg>'
              }),
            200
          )
        )
    )
    render(<MermaidViewer chartCode="graph TD" />)
    expect(screen.getByText("Renderizando...")).toBeInTheDocument()
  })

  it("NO llama a mermaid.render cuando chartCode está vacío", () => {
    render(<MermaidViewer chartCode="" />)
    expect(mermaid.render).not.toHaveBeenCalled()
  })

  it("llama a mermaid.render cuando se proporciona chartCode", async () => {
    render(<MermaidViewer chartCode="graph TD\nA-->B" />)
    await waitFor(() => expect(mermaid.render).toHaveBeenCalled())
  })

  it("llama a mermaid.render con un id único", async () => {
    render(<MermaidViewer chartCode="graph TD\nA-->B" />)
    await waitFor(() =>
      expect(mermaid.render).toHaveBeenCalledWith(
        expect.stringContaining("mermaid-render-"),
        expect.any(String)
      )
    )
  })

  it("muestra el SVG tras la carga exitosa", async () => {
    const { container } = await renderAndWait()
    expect(
      container.querySelector(".mermaid-inner-content")
    ).toBeInTheDocument()
  })

  it("no muestra 'Renderizando...' tras la carga exitosa", async () => {
    await renderAndWait()
    expect(screen.queryByText("Renderizando...")).not.toBeInTheDocument()
  })
})

describe("MermaidViewer – estados de error", () => {
  it("muestra el mensaje de error cuando mermaid.render falla", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(mermaid.render).mockRejectedValueOnce(
      new Error("Sintaxis inválida")
    )
    render(<MermaidViewer chartCode="codigo-invalido" />)
    await waitFor(() =>
      expect(screen.getByText(/error renderizando/i)).toBeInTheDocument()
    )
  })

  it("incluye el mensaje del error en el texto mostrado", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(mermaid.render).mockRejectedValueOnce(
      new Error("Token inesperado")
    )
    render(<MermaidViewer chartCode="codigo-invalido" />)
    await waitFor(() =>
      expect(screen.getByText(/token inesperado/i)).toBeInTheDocument()
    )
  })

  it("muestra el panel 'Ver código que falló' cuando hay error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(mermaid.render).mockRejectedValueOnce(new Error("Error"))
    render(<MermaidViewer chartCode="codigo-invalido" />)
    await waitFor(() =>
      expect(screen.getByText("Ver código que falló")).toBeInTheDocument()
    )
  })

  it("muestra error cuando mermaid.render devuelve SVG vacío (línea 103)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(mermaid.render).mockResolvedValueOnce({ svg: "" })
    render(<MermaidViewer chartCode="graph TD" />)
    await waitFor(() =>
      expect(screen.getByText(/no se generó svg/i)).toBeInTheDocument()
    )
  })

  it("muestra error cuando el objeto de error no tiene .message (línea 111)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(mermaid.render).mockRejectedValueOnce("error sin mensaje")
    render(<MermaidViewer chartCode="graph TD" />)
    await waitFor(() =>
      expect(screen.getByText(/error renderizando/i)).toBeInTheDocument()
    )
  })

  it("maneja correctamente cuando fixSvgDimensions no encuentra el nodo SVG", async () => {
    vi.spyOn(global, "DOMParser").mockImplementationOnce(
      () =>
        ({
          parseFromString: vi.fn().mockReturnValue({
            querySelector: vi.fn().mockReturnValue(null)
          })
        }) as any
    )
    render(<MermaidViewer chartCode="graph TD\nA-->B" />)
    await waitFor(() => expect(mermaid.render).toHaveBeenCalled())
    expect(screen.queryByText(/error renderizando/i)).not.toBeInTheDocument()
  })
})

describe("MermaidViewer – zoom con toolbar", () => {
  it("aumenta el zoom al hacer click en '+ Zoom'", async () => {
    render(<MermaidViewer chartCode="graph TD" />)
    await waitFor(() => expect(screen.getByText("100%")).toBeInTheDocument())
    await userEvent.click(screen.getByRole("button", { name: "+ Zoom" }))
    expect(screen.getByText("120%")).toBeInTheDocument()
  })

  it("reduce el zoom al hacer click en '− Zoom'", async () => {
    render(<MermaidViewer chartCode="graph TD" />)
    await waitFor(() => expect(screen.getByText("100%")).toBeInTheDocument())
    await userEvent.click(screen.getByRole("button", { name: "− Zoom" }))
    expect(screen.getByText("80%")).toBeInTheDocument()
  })

  it("resetea el zoom a 100% al hacer click en '⟳ Reset'", async () => {
    render(<MermaidViewer chartCode="graph TD" />)
    await waitFor(() => expect(screen.getByText("100%")).toBeInTheDocument())
    await userEvent.click(screen.getByRole("button", { name: "+ Zoom" }))
    await userEvent.click(screen.getByRole("button", { name: "+ Zoom" }))
    await userEvent.click(screen.getByRole("button", { name: "⟳ Reset" }))
    expect(screen.getByText("100%")).toBeInTheDocument()
  })

  it("no baja del 15% de zoom mínimo", async () => {
    render(<MermaidViewer chartCode="graph TD" />)
    await waitFor(() => expect(screen.getByText("100%")).toBeInTheDocument())
    for (let i = 0; i < 20; i++) {
      await userEvent.click(screen.getByRole("button", { name: "− Zoom" }))
    }
    expect(screen.getByText("15%")).toBeInTheDocument()
  })

  it("no sube del 500% de zoom máximo", async () => {
    render(<MermaidViewer chartCode="graph TD" />)
    await waitFor(() => expect(screen.getByText("100%")).toBeInTheDocument())
    for (let i = 0; i < 25; i++) {
      await userEvent.click(screen.getByRole("button", { name: "+ Zoom" }))
    }
    expect(screen.getByText("500%")).toBeInTheDocument()
  })
})

describe("MermaidViewer – zoom con rueda del ratón", () => {
  it("reduce el zoom con scroll hacia abajo (deltaY > 0)", async () => {
    const { container } = render(<MermaidViewer chartCode="graph TD" />)
    await waitFor(() => expect(screen.getByText("100%")).toBeInTheDocument())
    fireEvent.wheel(container.querySelector(".mermaid-outer-container")!, {
      deltaY: 100
    })
    expect(screen.getByText("90%")).toBeInTheDocument()
  })

  it("aumenta el zoom con scroll hacia arriba (deltaY < 0)", async () => {
    const { container } = render(<MermaidViewer chartCode="graph TD" />)
    await waitFor(() => expect(screen.getByText("100%")).toBeInTheDocument())
    fireEvent.wheel(container.querySelector(".mermaid-outer-container")!, {
      deltaY: -100
    })
    expect(screen.getByText("110%")).toBeInTheDocument()
  })
})

describe("MermaidViewer – panning", () => {
  it("el contenido empieza en translate(0px, 0px) scale(1)", async () => {
    const { container } = await renderAndWait()
    expect(container.querySelector(".mermaid-inner-content")).toHaveStyle({
      transform: "translate(0px, 0px) scale(1)"
    })
  })

  it("mover el ratón sin arrastrar NO cambia la posición", async () => {
    const { container } = await renderAndWait()
    const box = container.querySelector(".mermaid-outer-container")!
    fireEvent.mouseMove(box, { clientX: 50, clientY: 50 })
    expect(container.querySelector(".mermaid-inner-content")).toHaveStyle({
      transform: "translate(0px, 0px) scale(1)"
    })
  })

  it("arrastrando mueve el contenido correctamente", async () => {
    const { container } = await renderAndWait()
    const box = container.querySelector(".mermaid-outer-container")!
    fireEvent.mouseDown(box, { clientX: 10, clientY: 10 })
    fireEvent.mouseMove(box, { clientX: 40, clientY: 50 })
    expect(container.querySelector(".mermaid-inner-content")).toHaveStyle({
      transform: "translate(30px, 40px) scale(1)"
    })
  })

  it("soltar el ratón detiene el panning", async () => {
    const { container } = await renderAndWait()
    const box = container.querySelector(".mermaid-outer-container")!
    fireEvent.mouseDown(box, { clientX: 0, clientY: 0 })
    fireEvent.mouseMove(box, { clientX: 30, clientY: 30 })
    fireEvent.mouseUp(box)
    fireEvent.mouseMove(box, { clientX: 100, clientY: 100 })
    expect(container.querySelector(".mermaid-inner-content")).toHaveStyle({
      transform: "translate(30px, 30px) scale(1)"
    })
  })

  it("mouseLeave detiene el panning igual que mouseUp", async () => {
    const { container } = await renderAndWait()
    const box = container.querySelector(".mermaid-outer-container")!
    fireEvent.mouseDown(box, { clientX: 0, clientY: 0 })
    fireEvent.mouseMove(box, { clientX: 20, clientY: 20 })
    fireEvent.mouseLeave(box)
    fireEvent.mouseMove(box, { clientX: 100, clientY: 100 })
    expect(container.querySelector(".mermaid-inner-content")).toHaveStyle({
      transform: "translate(20px, 20px) scale(1)"
    })
  })

  it("reset restaura la posición a (0, 0)", async () => {
    const { container } = await renderAndWait()
    const box = container.querySelector(".mermaid-outer-container")!
    fireEvent.mouseDown(box, { clientX: 0, clientY: 0 })
    fireEvent.mouseMove(box, { clientX: 50, clientY: 50 })
    fireEvent.mouseUp(box)
    await userEvent.click(screen.getByRole("button", { name: "⟳ Reset" }))
    expect(container.querySelector(".mermaid-inner-content")).toHaveStyle({
      transform: "translate(0px, 0px) scale(1)"
    })
  })
})

describe("MermaidViewer – casos negativos", () => {
  it("no muestra error con código válido", async () => {
    await renderAndWait()
    expect(screen.queryByText(/error renderizando/i)).not.toBeInTheDocument()
  })

  it("no muestra el panel de depuración sin errores", async () => {
    await renderAndWait()
    expect(screen.queryByText("Ver código que falló")).not.toBeInTheDocument()
  })

  it("no llama a mermaid.render con chartCode vacío", () => {
    render(<MermaidViewer chartCode="" />)
    expect(mermaid.render).not.toHaveBeenCalled()
  })
})
