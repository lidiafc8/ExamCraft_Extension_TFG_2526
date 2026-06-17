import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { DownloadConfirmModal } from "./DownloadConfirmModal"

const baseProps = {
  isOpen: true,
  defaultFileName: "mi examen final",
  onConfirm: vi.fn(),
  onCancel: vi.fn()
}

beforeEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("DownloadConfirmModal – renderizado", () => {
  it("no renderiza nada cuando isOpen es false", () => {
    const { container } = render(
      <DownloadConfirmModal {...baseProps} isOpen={false} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("renderiza el modal cuando isOpen es true", () => {
    render(<DownloadConfirmModal {...baseProps} />)
    expect(
      screen.getByRole("heading", { name: /nombre del archivo/i })
    ).toBeInTheDocument()
  })

  it("muestra el overlay y la tarjeta", () => {
    const { container } = render(<DownloadConfirmModal {...baseProps} />)
    expect(
      container.querySelector(".confirm-modal-overlay")
    ).toBeInTheDocument()
    expect(container.querySelector(".confirm-modal-card")).toBeInTheDocument()
  })

  it("muestra el icono 📥", () => {
    render(<DownloadConfirmModal {...baseProps} />)
    expect(screen.getByText("📥")).toBeInTheDocument()
  })

  it("muestra el texto descriptivo", () => {
    render(<DownloadConfirmModal {...baseProps} />)
    expect(
      screen.getByText(/cómo quieres llamar al archivo/i)
    ).toBeInTheDocument()
  })

  it("muestra el aviso de extensión .md", () => {
    render(<DownloadConfirmModal {...baseProps} />)
    expect(screen.getByText(/extensión/i)).toBeInTheDocument()
    expect(screen.getByText(".md")).toBeInTheDocument()
  })

  it("solo hay un heading visible", () => {
    render(<DownloadConfirmModal {...baseProps} />)
    expect(screen.getAllByRole("heading")).toHaveLength(1)
  })
})

describe("DownloadConfirmModal – input valor inicial", () => {
  it("el input muestra el defaultFileName con espacios reemplazados por _", () => {
    render(
      <DownloadConfirmModal {...baseProps} defaultFileName="mi examen final" />
    )
    expect(screen.getByRole("textbox")).toHaveValue("mi_examen_final")
  })

  it("el input muestra el defaultFileName sin modificar si no tiene espacios", () => {
    render(
      <DownloadConfirmModal {...baseProps} defaultFileName="examen_final" />
    )
    expect(screen.getByRole("textbox")).toHaveValue("examen_final")
  })

  it("el input tiene el placeholder correcto", () => {
    render(<DownloadConfirmModal {...baseProps} />)
    expect(screen.getByPlaceholderText("nombre_archivo")).toBeInTheDocument()
  })

  it("el input se resetea al defaultFileName cuando isOpen pasa de false a true", () => {
    const { rerender } = render(
      <DownloadConfirmModal {...baseProps} isOpen={false} />
    )
    rerender(
      <DownloadConfirmModal
        {...baseProps}
        isOpen={true}
        defaultFileName="nuevo nombre"
      />
    )
    expect(screen.getByRole("textbox")).toHaveValue("nuevo_nombre")
  })
})

describe("DownloadConfirmModal – input edición", () => {
  it("el usuario puede escribir en el input", async () => {
    render(<DownloadConfirmModal {...baseProps} />)
    const input = screen.getByRole("textbox")
    await userEvent.clear(input)
    await userEvent.type(input, "nuevo_nombre")
    expect(input).toHaveValue("nuevo_nombre")
  })

  it("el usuario puede borrar el contenido del input", async () => {
    render(<DownloadConfirmModal {...baseProps} />)
    const input = screen.getByRole("textbox")
    await userEvent.clear(input)
    expect(input).toHaveValue("")
  })

  it("el usuario puede reemplazar el valor por defecto", async () => {
    render(
      <DownloadConfirmModal {...baseProps} defaultFileName="viejo_nombre" />
    )
    const input = screen.getByRole("textbox")
    await userEvent.clear(input)
    await userEvent.type(input, "nombre_nuevo")
    expect(input).toHaveValue("nombre_nuevo")
  })
})

describe("DownloadConfirmModal – botones", () => {
  it("muestra el botón 'Cancelar'", () => {
    render(<DownloadConfirmModal {...baseProps} />)
    expect(
      screen.getByRole("button", { name: /cancelar/i })
    ).toBeInTheDocument()
  })

  it("muestra el botón 'Descargar (.md)'", () => {
    render(<DownloadConfirmModal {...baseProps} />)
    expect(
      screen.getByRole("button", { name: /descargar/i })
    ).toBeInTheDocument()
  })

  it("no renderiza más de 2 botones", () => {
    render(<DownloadConfirmModal {...baseProps} />)
    expect(screen.getAllByRole("button")).toHaveLength(2)
  })
})

describe("DownloadConfirmModal – callbacks", () => {
  it("llama a onConfirm con el nombre del input al hacer click en 'Descargar'", async () => {
    const onConfirm = vi.fn()
    render(
      <DownloadConfirmModal
        {...baseProps}
        onConfirm={onConfirm}
        defaultFileName="examen"
      />
    )
    await userEvent.click(screen.getByRole("button", { name: /descargar/i }))
    expect(onConfirm).toHaveBeenCalledWith("examen")
  })

  it("llama a onConfirm con el nombre editado por el usuario", async () => {
    const onConfirm = vi.fn()
    render(<DownloadConfirmModal {...baseProps} onConfirm={onConfirm} />)
    const input = screen.getByRole("textbox")
    await userEvent.clear(input)
    await userEvent.type(input, "nombre_personalizado")
    await userEvent.click(screen.getByRole("button", { name: /descargar/i }))
    expect(onConfirm).toHaveBeenCalledWith("nombre_personalizado")
  })

  it("llama a onConfirm con defaultFileName si el input está vacío", async () => {
    const onConfirm = vi.fn()
    render(
      <DownloadConfirmModal
        {...baseProps}
        onConfirm={onConfirm}
        defaultFileName="fallback"
      />
    )
    const input = screen.getByRole("textbox")
    await userEvent.clear(input)
    await userEvent.click(screen.getByRole("button", { name: /descargar/i }))
    expect(onConfirm).toHaveBeenCalledWith("fallback")
  })

  it("llama a onConfirm con el nombre sin espacios al inicio/final", async () => {
    const onConfirm = vi.fn()
    render(<DownloadConfirmModal {...baseProps} onConfirm={onConfirm} />)
    const input = screen.getByRole("textbox")
    await userEvent.clear(input)
    await userEvent.type(input, "  nombre  ")
    await userEvent.click(screen.getByRole("button", { name: /descargar/i }))
    expect(onConfirm).toHaveBeenCalledWith("nombre")
  })

  it("llama a onCancel al hacer click en 'Cancelar'", async () => {
    const onCancel = vi.fn()
    render(<DownloadConfirmModal {...baseProps} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it("NO llama a onConfirm al cancelar", async () => {
    const onConfirm = vi.fn()
    render(<DownloadConfirmModal {...baseProps} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("NO llama a onCancel al confirmar", async () => {
    const onCancel = vi.fn()
    render(<DownloadConfirmModal {...baseProps} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole("button", { name: /descargar/i }))
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("NO llama a ningún callback al solo renderizar", () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <DownloadConfirmModal
        {...baseProps}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })
})

describe("DownloadConfirmModal – accesibilidad", () => {
  it("el botón 'Descargar' es focusable", () => {
    render(<DownloadConfirmModal {...baseProps} />)
    const btn = screen.getByRole("button", { name: /descargar/i })
    btn.focus()
    expect(btn).toHaveFocus()
  })

  it("el botón 'Cancelar' es focusable", () => {
    render(<DownloadConfirmModal {...baseProps} />)
    const btn = screen.getByRole("button", { name: /cancelar/i })
    btn.focus()
    expect(btn).toHaveFocus()
  })

  it("el input es focusable", () => {
    render(<DownloadConfirmModal {...baseProps} />)
    const input = screen.getByRole("textbox")
    input.focus()
    expect(input).toHaveFocus()
  })

  it("puede confirmar con Enter desde el botón de descarga", async () => {
    const onConfirm = vi.fn()
    render(<DownloadConfirmModal {...baseProps} onConfirm={onConfirm} />)
    const btn = screen.getByRole("button", { name: /descargar/i })
    btn.focus()
    await userEvent.keyboard("{Enter}")
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})

describe("DownloadConfirmModal – casos límite: props vacías", () => {
  it("no rompe con defaultFileName vacío", () => {
    render(<DownloadConfirmModal {...baseProps} defaultFileName="" />)
    expect(screen.getByRole("textbox")).toHaveValue("")
  })

  it("no rompe con defaultFileName muy largo", () => {
    const { container } = render(
      <DownloadConfirmModal {...baseProps} defaultFileName={"A".repeat(300)} />
    )
    expect(container.querySelector(".confirm-modal-card")).toBeInTheDocument()
  })

  it("reemplaza múltiples espacios consecutivos por un solo _ en el valor inicial", () => {
    render(
      <DownloadConfirmModal {...baseProps} defaultFileName="hola   mundo" />
    )
    expect(screen.getByRole("textbox")).toHaveValue("hola_mundo")
  })

  it("isOpen pasando de false a true muestra el modal", () => {
    const { rerender } = render(
      <DownloadConfirmModal {...baseProps} isOpen={false} />
    )
    expect(screen.queryByRole("heading")).not.toBeInTheDocument()
    rerender(<DownloadConfirmModal {...baseProps} isOpen={true} />)
    expect(
      screen.getByRole("heading", { name: /nombre del archivo/i })
    ).toBeInTheDocument()
  })

  it("isOpen pasando de true a false oculta el modal", () => {
    const { rerender } = render(
      <DownloadConfirmModal {...baseProps} isOpen={true} />
    )
    expect(screen.getByRole("heading")).toBeInTheDocument()
    rerender(<DownloadConfirmModal {...baseProps} isOpen={false} />)
    expect(screen.queryByRole("heading")).not.toBeInTheDocument()
  })
})

describe("DownloadConfirmModal – casos límite: clicks múltiples", () => {
  it("onConfirm se llama 3 veces si se hace click 3 veces en Descargar", async () => {
    const onConfirm = vi.fn()
    render(<DownloadConfirmModal {...baseProps} onConfirm={onConfirm} />)
    const btn = screen.getByRole("button", { name: /descargar/i })
    await userEvent.click(btn)
    await userEvent.click(btn)
    await userEvent.click(btn)
    expect(onConfirm).toHaveBeenCalledTimes(3)
  })

  it("onCancel se llama 3 veces si se hace click 3 veces en Cancelar", async () => {
    const onCancel = vi.fn()
    render(<DownloadConfirmModal {...baseProps} onCancel={onCancel} />)
    const btn = screen.getByRole("button", { name: /cancelar/i })
    await userEvent.click(btn)
    await userEvent.click(btn)
    await userEvent.click(btn)
    expect(onCancel).toHaveBeenCalledTimes(3)
  })
})

describe("DownloadConfirmModal – casos negativos", () => {
  it("no renderiza el overlay cuando isOpen es false", () => {
    const { container } = render(
      <DownloadConfirmModal {...baseProps} isOpen={false} />
    )
    expect(
      container.querySelector(".confirm-modal-overlay")
    ).not.toBeInTheDocument()
  })

  it("no renderiza la tarjeta cuando isOpen es false", () => {
    const { container } = render(
      <DownloadConfirmModal {...baseProps} isOpen={false} />
    )
    expect(
      container.querySelector(".confirm-modal-card")
    ).not.toBeInTheDocument()
  })

  it("no muestra el input cuando isOpen es false", () => {
    render(<DownloadConfirmModal {...baseProps} isOpen={false} />)
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
  })
})
