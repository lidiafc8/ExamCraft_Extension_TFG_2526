import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi, describe, it, expect, beforeEach } from "vitest"
import "@testing-library/jest-dom"
import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import { SuccessModal } from "./SuccessModal"

expect.extend(jestDomMatchers)

const defaultProps = {
  title: "¡Operación Exitosa!",
  message: "Los cambios se han guardado correctamente en tu cuenta.",
  actions: [
    { label: "Aceptar", onClick: vi.fn(), variant: "primary" as const },
    { label: "Cancelar", onClick: vi.fn(), variant: "secondary" as const }
  ]
}

describe("Integración: SuccessModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================
  // CASOS POSITIVOS
  // =========================================================
  describe("Casos Positivos", () => {
    it("renderiza correctamente el título, el mensaje y el icono de éxito", () => {
      render(<SuccessModal {...defaultProps} />)

      expect(screen.getByRole("heading", { name: "¡Operación Exitosa!", level: 3 })).toBeInTheDocument()
      expect(screen.getByText("Los cambios se han guardado correctamente en tu cuenta.")).toBeInTheDocument()
      expect(screen.getByText("✅")).toBeInTheDocument()
    })

    it("renderiza dinámicamente todos los botones de acción provistos", () => {
      render(<SuccessModal {...defaultProps} />)

      const botones = screen.getAllByRole("button")
      expect(botones).toHaveLength(2)
      expect(screen.getByRole("button", { name: "Aceptar" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument()
    })

    it("aplica la clase 'secondary' u asigna 'primary' por defecto según la variante", () => {
      const accionesMixtas = [
        { label: "Boton Secundario", onClick: vi.fn(), variant: "secondary" as const },
        { label: "Boton Primario Explicito", onClick: vi.fn(), variant: "primary" as const },
        { label: "Boton Primario Por Defecto", onClick: vi.fn() } // Sin variante asignada
      ]

      render(<SuccessModal {...defaultProps} actions={accionesMixtas} />)

      expect(screen.getByRole("button", { name: "Boton Secundario" })).toHaveClass("secondary")
      expect(screen.getByRole("button", { name: "Boton Primario Explicito" })).toHaveClass("primary")
      expect(screen.getByRole("button", { name: "Boton Primario Por Defecto" })).toHaveClass("primary")
    })

    it("ejecuta el callback onClick correspondiente al hacer clic en un botón", async () => {
      render(<SuccessModal {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Aceptar" }))
      expect(defaultProps.actions[0].onClick).toHaveBeenCalledTimes(1)
      expect(defaultProps.actions[1].onClick).not.toHaveBeenCalled()
    })
  })

  // =========================================================
  // CASOS LÍMITE
  // =========================================================
  describe("Casos Límite", () => {
    it("funciona perfectamente y no se rompe si la lista de acciones viene vacía", () => {
      const { container } = render(<SuccessModal {...defaultProps} actions={[]} />)

      expect(screen.queryByRole("button")).not.toBeInTheDocument()
      expect(container.querySelector(".success-modal-actions")).toBeEmptyDOMElement()
    })

    it("renderiza múltiples botones con la misma variante sin conflictos", () => {
      const accionesRepetidas = [
        { label: "Accion 1", onClick: vi.fn(), variant: "secondary" as const },
        { label: "Accion 2", onClick: vi.fn(), variant: "secondary" as const }
      ]

      render(<SuccessModal {...defaultProps} actions={accionesRepetidas} />)

      const botonesSecundarios = screen.getAllByRole("button")
      expect(botonesSecundarios[0]).toHaveClass("secondary")
      expect(botonesSecundarios[1]).toHaveClass("secondary")
    })
  })
})