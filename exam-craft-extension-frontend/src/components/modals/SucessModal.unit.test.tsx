import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { SuccessModal } from "./SuccessModal"

const baseProps = {
  title: "¡Operación completada!",
  message: "Los datos se han procesado correctamente de forma segura.",
  actions: [
    { label: "Aceptar", onClick: vi.fn(), variant: "primary" as const },
    { label: "Cancelar", onClick: vi.fn(), variant: "secondary" as const }
  ]
}

beforeEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("SuccessModal – Renderizado e Interfaz", () => {
  it("renderiza el título, el mensaje descriptivo y el icono de éxito", () => {
    render(<SuccessModal {...baseProps} />)

    expect(screen.getByText("¡Operación completada!")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Los datos se han procesado correctamente de forma segura."
      )
    ).toBeInTheDocument()
    expect(screen.getByText("✅")).toBeInTheDocument()
  })

  it("mapea dinámicamente y renderiza todos los botones pasados en el array de acciones", () => {
    render(<SuccessModal {...baseProps} />)

    const botones = screen.getAllByRole("button")
    expect(botones).toHaveLength(2)
    expect(screen.getByRole("button", { name: "Aceptar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument()
  })

  it("aplica la clase CSS correcta según el atributo variant de la acción (Cubre ramas condicionales)", () => {
    render(<SuccessModal {...baseProps} />)

    const btnAceptar = screen.getByRole("button", { name: "Aceptar" })
    const btnCancelar = screen.getByRole("button", { name: "Cancelar" })

    expect(btnAceptar).toHaveClass("primary")
    expect(btnAceptar).not.toHaveClass("secondary")

    expect(btnCancelar).toHaveClass("secondary")
    expect(btnCancelar).not.toHaveClass("primary")
  })

  it("asigna la clase 'primary' por defecto si el atributo variant no viene informado en la acción", () => {
    const propsSinVariant = {
      ...baseProps,
      actions: [{ label: "Botón Simple", onClick: vi.fn() }]
    }

    render(<SuccessModal {...propsSinVariant} />)
    const boton = screen.getByRole("button", { name: "Botón Simple" })

    expect(boton).toHaveClass("primary")
    expect(boton).not.toHaveClass("secondary")
  })
})

describe("SuccessModal – Comportamiento e Interacciones", () => {
  it("ejecuta el callback onClick correspondiente de forma individual cuando se pulsa un botón", async () => {
    render(<SuccessModal {...baseProps} />)

    const btnAceptar = screen.getByRole("button", { name: "Aceptar" })
    const btnCancelar = screen.getByRole("button", { name: "Cancelar" })

    await userEvent.click(btnAceptar)
    expect(baseProps.actions[0].onClick).toHaveBeenCalledTimes(1)
    expect(baseProps.actions[1].onClick).not.toHaveBeenCalled()

    await userEvent.click(btnCancelar)
    expect(baseProps.actions[1].onClick).toHaveBeenCalledTimes(1)
  })
})
