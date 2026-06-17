import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import { ConfirmModal } from "./ConfirmModal"

expect.extend(jestDomMatchers)

const defaultProps = {
  title: "¿Estás seguro?",
  message: "Esta acción no se puede deshacer.",
  onConfirm: vi.fn(),
  onCancel: vi.fn()
}

describe("Integración: ConfirmModal", () => {
  beforeEach(() => vi.clearAllMocks())
  describe("Casos Positivos", () => {
    it("renderiza el título, mensaje e icono por defecto correctamente", () => {
      render(<ConfirmModal {...defaultProps} />)

      expect(
        screen.getByRole("heading", { name: "¿Estás seguro?", level: 3 })
      ).toBeInTheDocument()
      expect(
        screen.getByText("Esta acción no se puede deshacer.")
      ).toBeInTheDocument()
      expect(screen.getByText("⚠️")).toBeInTheDocument()
    })

    it("renderiza los botones con sus etiquetas por defecto", () => {
      render(<ConfirmModal {...defaultProps} />)

      expect(
        screen.getByRole("button", { name: "Cancelar" })
      ).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "Confirmar" })
      ).toBeInTheDocument()
    })

    it("llama a onConfirm al pulsar el botón de confirmar", async () => {
      render(<ConfirmModal {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
      expect(defaultProps.onCancel).not.toHaveBeenCalled()
    })

    it("llama a onCancel al pulsar el botón de cancelar", async () => {
      render(<ConfirmModal {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
    })
  })

  describe("Casos Negativos", () => {
    it("no renderiza la sección de advertencia (warning) si no se pasa la prop", () => {
      const { container } = render(
        <ConfirmModal {...defaultProps} warning={undefined} />
      )

      expect(
        container.querySelector(".confirm-modal-warning")
      ).not.toBeInTheDocument()
    })

    it("no aplica la clase 'warning' al contenedor de descripción si la prop warning no existe", () => {
      const { container } = render(
        <ConfirmModal {...defaultProps} warning={undefined} />
      )

      const descriptionContainer = container.querySelector(
        ".sucess-modal-description"
      )
      expect(descriptionContainer).not.toHaveClass("warning")
    })

    it("no ejecuta las funciones de callback si no se interactúa con los botones", () => {
      render(<ConfirmModal {...defaultProps} />)

      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
      expect(defaultProps.onCancel).not.toHaveBeenCalled()
    })
  })

  describe("Casos Límite", () => {
    it("renderiza correctamente etiquetas personalizadas en los botones", () => {
      render(
        <ConfirmModal
          {...defaultProps}
          confirmLabel="Sí, eliminar"
          cancelLabel="No, volver"
        />
      )

      expect(
        screen.getByRole("button", { name: "Sí, eliminar" })
      ).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "No, volver" })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole("button", { name: "Confirmar" })
      ).not.toBeInTheDocument()
    })

    it("renderiza un nodo React complejo tanto en el mensaje como en el warning", () => {
      render(
        <ConfirmModal
          {...defaultProps}
          message={<span data-testid="custom-msg">Mensaje **negrita**</span>}
          warning={
            <strong data-testid="custom-warning">Peligro inminente</strong>
          }
        />
      )

      expect(screen.getByTestId("custom-msg")).toBeInTheDocument()
      expect(screen.getByTestId("custom-warning")).toBeInTheDocument()
    })

    it("aplica la clase modificadora '--plain' correctamente cuando plainWarning es true", () => {
      const { container } = render(
        <ConfirmModal {...defaultProps} warning="Cuidado" plainWarning={true} />
      )

      const warningContainer = container.querySelector(".confirm-modal-warning")
      expect(warningContainer).toHaveClass("confirm-modal-warning--plain")
    })

    it("no aplica la clase modificadora '--plain' si plainWarning es false", () => {
      const { container } = render(
        <ConfirmModal
          {...defaultProps}
          warning="Cuidado"
          plainWarning={false}
        />
      )

      const warningContainer = container.querySelector(".confirm-modal-warning")
      expect(warningContainer).not.toHaveClass("confirm-modal-warning--plain")
    })
  })

  describe("Flujo Completo", () => {
    it("flujo completo: renderiza advertencia especial, evalúa estilos dinámicos y dispara confirmación", async () => {
      const { container } = render(
        <ConfirmModal
          {...defaultProps}
          warning="Se borrarán 50 archivos vinculados"
        />
      )

      const descriptionContainer = container.querySelector(
        ".sucess-modal-description"
      )
      expect(descriptionContainer).toHaveClass("warning")

      expect(
        screen.getByText("Se borrarán 50 archivos vinculados")
      ).toBeInTheDocument()

      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))

      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
      expect(defaultProps.onCancel).not.toHaveBeenCalled()
    })
  })
})
