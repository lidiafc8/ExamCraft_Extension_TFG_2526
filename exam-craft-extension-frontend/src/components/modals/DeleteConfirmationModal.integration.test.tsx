import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi, describe, it, expect, beforeEach } from "vitest"
import "@testing-library/jest-dom"
import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

// Ajusta la importación según la ruta de tu componente
import { DeleteConfirmationModal } from "./DeleteConfirmationModal"

expect.extend(jestDomMatchers)

const defaultProps = {
  isOpen: true,
  itemName: "Examen Final de Álgebra",
  isExam: true,
  onConfirm: vi.fn(),
  onCancel: vi.fn()
}

describe("Integración: DeleteConfirmationModal", () => {
  beforeEach(() => vi.clearAllMocks())

  // =========================================================
  // CASOS POSITIVOS
  // =========================================================
  describe("Casos Positivos", () => {
    it("renderiza el título, icono de advertencia y mensaje de peligro cuando está abierto", () => {
      render(<DeleteConfirmationModal {...defaultProps} />)

      expect(screen.getByRole("heading", { name: "Confirmar Acción", level: 2 })).toBeInTheDocument()
      expect(screen.getByText("!")).toBeInTheDocument()
      expect(screen.getByText("Esta acción no se puede deshacer.")).toBeInTheDocument()
    })

    it("renderiza el texto adaptado para un examen cuando isExam es true", () => {
      render(<DeleteConfirmationModal {...defaultProps} isExam={true} itemName="Parcial 1" />)

      // Evaluamos fragmentos de texto ya que la etiqueta <strong> fragmenta el nodo de texto
      expect(screen.getByText(/¿Deseas eliminar el examen/i)).toBeInTheDocument()
      expect(screen.getByText(/"Parcial 1"/i)).toBeInTheDocument()
    })

    it("llama a onConfirm al pulsar el botón 'Sí, eliminar'", async () => {
      render(<DeleteConfirmationModal {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Sí, eliminar" }))
      
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
      expect(defaultProps.onCancel).not.toHaveBeenCalled()
    })

    it("llama a onCancel al pulsar el botón 'Cancelar'", async () => {
      render(<DeleteConfirmationModal {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
      
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
    })
  })

  // =========================================================
  // CASOS NEGATIVOS
  // =========================================================
  describe("Casos Negativos", () => {
    it("no renderiza absolutamente nada si isOpen es false", () => {
      const { container } = render(<DeleteConfirmationModal {...defaultProps} isOpen={false} />)

      expect(container.firstChild).toBeNull()
      expect(screen.queryByRole("heading", { name: "Confirmar Acción" })).not.toBeInTheDocument()
    })

    it("no ejecuta ninguna acción si el usuario no interactúa con los botones", () => {
      render(<DeleteConfirmationModal {...defaultProps} />)

      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
      expect(defaultProps.onCancel).not.toHaveBeenCalled()
    })
  })

  // =========================================================
  // CASOS LÍMITE
  // =========================================================
  describe("Casos Límite", () => {
    it("renderiza el texto adaptado para una sección cuando isExam es false", () => {
      render(<DeleteConfirmationModal {...defaultProps} isExam={false} itemName="Bloque de Introducción" />)

      expect(screen.getByText(/¿Deseas eliminar la sección/i)).toBeInTheDocument()
      expect(screen.getByText(/"Bloque de Introducción"/i)).toBeInTheDocument()
    })

    it("renderiza el texto adaptado para una sección por defecto si isExam es undefined", () => {
      render(<DeleteConfirmationModal {...defaultProps} isExam={undefined} itemName="Tema 3" />)

      expect(screen.getByText(/¿Deseas eliminar la sección/i)).toBeInTheDocument()
      expect(screen.getByText(/"Tema 3"/i)).toBeInTheDocument()
    })

    it("maneja correctamente nombres de ítems vacíos sin romper la maquetación", () => {
      render(<DeleteConfirmationModal {...defaultProps} itemName="" />)

      expect(screen.getByText(/¿Deseas eliminar el examen/i)).toBeInTheDocument()
      expect(screen.getByText(/""/i)).toBeInTheDocument() // Comprueba las comillas vacías
    })
  })

  // =========================================================
  // FLUJO COMPLETO
  // =========================================================
  describe("Flujo Completo", () => {
    it("flujo completo: renderiza el modal con alcance de sección, el usuario cancela y luego confirma en un segundo renderizado", async () => {
      // 1. Primer render: El usuario va a borrar una sección pero se arrepiente y cancela
      const { rerender } = render(
        <DeleteConfirmationModal 
          {...defaultProps} 
          isExam={false} 
          itemName="Sección Crítica" 
        />
      )

      expect(screen.getByText(/¿Deseas eliminar la sección/i)).toBeInTheDocument()
      
      await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
      expect(defaultProps.onConfirm).not.toHaveBeenCalled()

      // 2. Simulamos que la app actualiza el estado y cierra el modal (isOpen = false)
      rerender(
        <DeleteConfirmationModal 
          {...defaultProps} 
          isOpen={false} 
          isExam={false} 
          itemName="Sección Crítica" 
        />
      )
      expect(screen.queryByRole("heading", { name: "Confirmar Acción" })).not.toBeInTheDocument()

      // 3. Simulamos que vuelve a abrir el modal y esta vez sí decide confirmar la eliminación
      rerender(
        <DeleteConfirmationModal 
          {...defaultProps} 
          isOpen={true} 
          isExam={false} 
          itemName="Sección Crítica" 
        />
      )
      
      await userEvent.click(screen.getByRole("button", { name: "Sí, eliminar" }))
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    })
  })
})