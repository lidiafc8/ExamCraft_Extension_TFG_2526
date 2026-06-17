import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import { WarningModal } from "./WarningModal"

expect.extend(jestDomMatchers)

const defaultProps = {
  title: "¡ATENCIÓN: ACCIÓN IRREVERSIBLE!",
  message: "Si continúas, perderás todos los datos guardados de este examen.",
  confirmLabel: "Eliminar de todas formas",
  cancelLabel: "Volver atrás",
  onConfirm: vi.fn(),
  onCancel: vi.fn()
}

describe("Integración: WarningModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================
  // CASOS POSITIVOS
  // =========================================================
  describe("Casos Positivos", () => {
    it("renderiza correctamente el título, el mensaje de advertencia y el icono de peligro ⚠️", () => {
      render(<WarningModal {...defaultProps} />)

      expect(
        screen.getByRole("heading", {
          name: "¡ATENCIÓN: ACCIÓN IRREVERSIBLE!",
          level: 3
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          "Si continúas, perderás todos los datos guardados de este examen."
        )
      ).toBeInTheDocument()
      expect(screen.getByText("⚠️")).toBeInTheDocument()
    })

    it("ejecuta el callback onCancel al hacer clic en el botón de cancelar", async () => {
      render(<WarningModal {...defaultProps} />)

      await userEvent.click(
        screen.getByRole("button", { name: "Volver atrás" })
      )

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
    })

    it("ejecuta el callback onConfirm al hacer clic en el botón de confirmación", async () => {
      render(<WarningModal {...defaultProps} />)

      await userEvent.click(
        screen.getByRole("button", { name: "Eliminar de todas formas" })
      )

      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
      expect(defaultProps.onCancel).not.toHaveBeenCalled()
    })
  })

  // =========================================================
  // CASOS LÍMITE (PROPIEDADES POR DEFECTO Y NODOS COMPLEJOS)
  // =========================================================
  describe("Casos Límite", () => {
    it("asigna 'Cancelar' como etiqueta por defecto si cancelLabel no es provisto (Línea 12)", () => {
      const { cancelLabel, ...propsSinCancelLabel } = defaultProps

      render(<WarningModal {...propsSinCancelLabel} />)

      // Valida que el fallback asignado en la desestructuración funcione perfectamente
      expect(
        screen.getByRole("button", { name: "Cancelar" })
      ).toBeInTheDocument()
    })

    it("soporta e interactúa correctamente con estructuras HTML complejas pasadas en la propiedad message (React.ReactNode)", () => {
      const mensajeEstructurado = (
        <div data-testid="mensaje-complejo">
          <p>¿Estás seguro de que deseas realizar esta acción?</p>
          <ul>
            <li>Se borrará la caché local</li>
            <li>Se cerrará tu sesión activa</li>
          </ul>
        </div>
      )

      render(<WarningModal {...defaultProps} message={mensajeEstructurado} />)

      // Verificamos que todo el árbol JSX anidado se pinte en el DOM sin romperse
      expect(screen.getByTestId("mensaje-complejo")).toBeInTheDocument()
      expect(screen.getByText("Se borrará la caché local")).toBeInTheDocument()
      expect(
        screen.getByText("Se cerrará tu sesión activa")
      ).toBeInTheDocument()
    })
  })
})
