import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { DeleteConfirmationModal } from "./DeleteConfirmationModal"

const baseProps = {
  isOpen: true,
  itemName: "Examen Final",
  onConfirm: vi.fn(),
  onCancel: vi.fn()
}

beforeEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("DeleteConfirmationModal – renderizado", () => {
  it("no renderiza nada cuando isOpen es false", () => {
    const { container } = render(
      <DeleteConfirmationModal {...baseProps} isOpen={false} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("renderiza el modal cuando isOpen es true", () => {
    render(<DeleteConfirmationModal {...baseProps} />)
    expect(
      screen.getByRole("heading", { name: /confirmar acción/i })
    ).toBeInTheDocument()
  })

  it("muestra el overlay y la tarjeta", () => {
    const { container } = render(<DeleteConfirmationModal {...baseProps} />)
    expect(container.querySelector(".delete-modal-overlay")).toBeInTheDocument()
    expect(container.querySelector(".delete-modal-card")).toBeInTheDocument()
  })

  it("muestra el icono '!'", () => {
    render(<DeleteConfirmationModal {...baseProps} />)
    expect(screen.getByText("!")).toBeInTheDocument()
  })

  it("muestra el nombre del item en el mensaje", () => {
    render(<DeleteConfirmationModal {...baseProps} />)
    expect(screen.getByText(/examen final/i)).toBeInTheDocument()
  })

  it("muestra el aviso de acción irreversible", () => {
    render(<DeleteConfirmationModal {...baseProps} />)
    expect(
      screen.getByText(/esta acción no se puede deshacer/i)
    ).toBeInTheDocument()
  })
})

describe("DeleteConfirmationModal – prop isExam", () => {
  it("muestra 'el examen' cuando isExam es true", () => {
    render(<DeleteConfirmationModal {...baseProps} isExam={true} />)
    expect(screen.getByText(/el examen/i)).toBeInTheDocument()
  })

  it("muestra 'la sección' cuando isExam es false", () => {
    render(<DeleteConfirmationModal {...baseProps} isExam={false} />)
    expect(screen.getByText(/la sección/i)).toBeInTheDocument()
  })

  it("muestra 'la sección' cuando isExam no se pasa (valor por defecto)", () => {
    render(<DeleteConfirmationModal {...baseProps} />)
    expect(screen.getByText(/la sección/i)).toBeInTheDocument()
  })

  it("no muestra 'el examen' cuando isExam es false", () => {
    render(<DeleteConfirmationModal {...baseProps} isExam={false} />)
    expect(screen.queryByText(/el examen/i)).not.toBeInTheDocument()
  })

  it("no muestra 'la sección' cuando isExam es true", () => {
    render(<DeleteConfirmationModal {...baseProps} isExam={true} />)
    expect(screen.queryByText(/la sección/i)).not.toBeInTheDocument()
  })
})

describe("DeleteConfirmationModal – botones", () => {
  it("muestra el botón 'Cancelar'", () => {
    render(<DeleteConfirmationModal {...baseProps} />)
    expect(
      screen.getByRole("button", { name: /cancelar/i })
    ).toBeInTheDocument()
  })

  it("muestra el botón 'Sí, eliminar'", () => {
    render(<DeleteConfirmationModal {...baseProps} />)
    expect(
      screen.getByRole("button", { name: /sí, eliminar/i })
    ).toBeInTheDocument()
  })

  it("ambos botones tienen type='button'", () => {
    render(<DeleteConfirmationModal {...baseProps} />)
    const btns = screen.getAllByRole("button")
    btns.forEach((btn) => expect(btn).toHaveAttribute("type", "button"))
  })

  it("no renderiza más de 2 botones", () => {
    render(<DeleteConfirmationModal {...baseProps} />)
    expect(screen.getAllByRole("button")).toHaveLength(2)
  })
})

describe("DeleteConfirmationModal – callbacks", () => {
  it("llama a onConfirm al hacer click en 'Sí, eliminar'", async () => {
    const onConfirm = vi.fn()
    render(<DeleteConfirmationModal {...baseProps} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole("button", { name: /sí, eliminar/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it("llama a onCancel al hacer click en 'Cancelar'", async () => {
    const onCancel = vi.fn()
    render(<DeleteConfirmationModal {...baseProps} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it("NO llama a onConfirm al cancelar", async () => {
    const onConfirm = vi.fn()
    render(<DeleteConfirmationModal {...baseProps} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("NO llama a onCancel al confirmar", async () => {
    const onCancel = vi.fn()
    render(<DeleteConfirmationModal {...baseProps} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole("button", { name: /sí, eliminar/i }))
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("NO llama a ningún callback al solo renderizar", () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <DeleteConfirmationModal
        {...baseProps}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })
})

describe("DeleteConfirmationModal – accesibilidad", () => {
  it("el botón 'Sí, eliminar' es focusable", () => {
    render(<DeleteConfirmationModal {...baseProps} />)
    const btn = screen.getByRole("button", { name: /sí, eliminar/i })
    btn.focus()
    expect(btn).toHaveFocus()
  })

  it("el botón 'Cancelar' es focusable", () => {
    render(<DeleteConfirmationModal {...baseProps} />)
    const btn = screen.getByRole("button", { name: /cancelar/i })
    btn.focus()
    expect(btn).toHaveFocus()
  })

  it("puede confirmar con la tecla Enter", async () => {
    const onConfirm = vi.fn()
    render(<DeleteConfirmationModal {...baseProps} onConfirm={onConfirm} />)
    const btn = screen.getByRole("button", { name: /sí, eliminar/i })
    btn.focus()
    await userEvent.keyboard("{Enter}")
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it("solo hay un heading visible", () => {
    render(<DeleteConfirmationModal {...baseProps} />)
    expect(screen.getAllByRole("heading")).toHaveLength(1)
  })
})

describe("DeleteConfirmationModal – casos límite: props vacías", () => {
  it("no rompe con itemName vacío", () => {
    render(<DeleteConfirmationModal {...baseProps} itemName="" />)
    expect(
      screen.getByRole("heading", { name: /confirmar acción/i })
    ).toBeInTheDocument()
  })

  it("no rompe con itemName muy largo", () => {
    const { container } = render(
      <DeleteConfirmationModal {...baseProps} itemName={"A".repeat(300)} />
    )
    expect(container.querySelector(".delete-modal-card")).toBeInTheDocument()
  })

  it("no rompe con itemName con caracteres especiales", () => {
    render(
      <DeleteConfirmationModal
        {...baseProps}
        itemName='Examen "Final" <2024>'
      />
    )
    expect(screen.getByRole("heading")).toBeInTheDocument()
  })

  it("isOpen pasando de false a true muestra el modal", () => {
    const { rerender } = render(
      <DeleteConfirmationModal {...baseProps} isOpen={false} />
    )
    expect(screen.queryByRole("heading")).not.toBeInTheDocument()

    rerender(<DeleteConfirmationModal {...baseProps} isOpen={true} />)
    expect(
      screen.getByRole("heading", { name: /confirmar acción/i })
    ).toBeInTheDocument()
  })

  it("isOpen pasando de true a false oculta el modal", () => {
    const { rerender } = render(
      <DeleteConfirmationModal {...baseProps} isOpen={true} />
    )
    expect(screen.getByRole("heading")).toBeInTheDocument()

    rerender(<DeleteConfirmationModal {...baseProps} isOpen={false} />)
    expect(screen.queryByRole("heading")).not.toBeInTheDocument()
  })
})

describe("DeleteConfirmationModal – casos límite: clicks múltiples", () => {
  it("onConfirm se llama 3 veces si se hace click 3 veces", async () => {
    const onConfirm = vi.fn()
    render(<DeleteConfirmationModal {...baseProps} onConfirm={onConfirm} />)
    const btn = screen.getByRole("button", { name: /sí, eliminar/i })
    await userEvent.click(btn)
    await userEvent.click(btn)
    await userEvent.click(btn)
    expect(onConfirm).toHaveBeenCalledTimes(3)
  })

  it("onCancel se llama 3 veces si se hace click 3 veces", async () => {
    const onCancel = vi.fn()
    render(<DeleteConfirmationModal {...baseProps} onCancel={onCancel} />)
    const btn = screen.getByRole("button", { name: /cancelar/i })
    await userEvent.click(btn)
    await userEvent.click(btn)
    await userEvent.click(btn)
    expect(onCancel).toHaveBeenCalledTimes(3)
  })
})

describe("DeleteConfirmationModal – casos negativos", () => {
  it("no renderiza el overlay cuando isOpen es false", () => {
    const { container } = render(
      <DeleteConfirmationModal {...baseProps} isOpen={false} />
    )
    expect(
      container.querySelector(".delete-modal-overlay")
    ).not.toBeInTheDocument()
  })

  it("no renderiza la tarjeta cuando isOpen es false", () => {
    const { container } = render(
      <DeleteConfirmationModal {...baseProps} isOpen={false} />
    )
    expect(
      container.querySelector(".delete-modal-card")
    ).not.toBeInTheDocument()
  })

  it("no muestra el heading cuando isOpen es false", () => {
    render(<DeleteConfirmationModal {...baseProps} isOpen={false} />)
    expect(screen.queryByRole("heading")).not.toBeInTheDocument()
  })
})
