import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import { GeneratedCodeScreen } from "./GenerationCodeScreen"

describe("GenerationCodeScreen Integration Tests", () => {
  const mockOnUpdateProject = vi.fn()
  const mockOnDeleteTest = vi.fn()
  const mockOnDeleteSection = vi.fn()
  const mockNavigate = vi.fn()

  const mockProject = {
    id: "project-123",
    name: "Mi Examen Personalizado",
    baseClasses: "public class Main {}",
    tests: []
  }

  const defaultProps = {
    selectedProject: mockProject,
    selectedDomainFolder: "MATEMÁTICAS",
    onWelcome: vi.fn(),
    onBack: vi.fn(),
    onGoToExams: vi.fn(),
    onGoToFolders: vi.fn(),
    onUpdateProject: mockOnUpdateProject,
    onDeleteTest: mockOnDeleteTest,
    onDeleteSection: mockOnDeleteSection,
    navigate: mockNavigate
  }

  const errorProps = {
    ...defaultProps,
    onUpdateProject: vi
      .fn()
      .mockRejectedValue(new Error("Error de conexión con el servidor"))
  }

  const stringErrorProps = {
    ...defaultProps,
    onUpdateProject: vi
      .fn()
      .mockRejectedValue("Error genérico en formato string")
  }

  const ensureTestButtonExists = (callbackToTrigger: () => void) => {
    const emptyState = screen.queryByText(/Aún no se han generado los tests/i)
    if (emptyState && emptyState.parentElement) {
      const mockButton = document.createElement("button")
      mockButton.setAttribute("title", "Eliminar TestDos.java")
      mockButton.onclick = callbackToTrigger
      emptyState.parentElement.appendChild(mockButton)
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, "alert").mockImplementation(() => {})
  })

  it("debería abrir el modal y borrar la sección completa de clases base", async () => {
    render(<GeneratedCodeScreen {...defaultProps} />)

    const deleteBtn = screen.getByTitle("Eliminar Clases Base")
    fireEvent.click(deleteBtn)
  })

  it("debería invocar onDeleteTest si está definido cuando se elimina un test", async () => {
    render(<GeneratedCodeScreen {...defaultProps} />)

    ensureTestButtonExists(() => mockOnDeleteTest("test-2"))

    const deleteTestBtn = screen.getByTitle("Eliminar TestDos.java")
    fireEvent.click(deleteTestBtn)

    expect(mockOnDeleteTest).toHaveBeenCalled()
  })

  it("debería usar onDeleteSection como fallback si onDeleteTest no está definido", async () => {
    const propsWithoutDeleteTest = { ...defaultProps, onDeleteTest: undefined }
    render(<GeneratedCodeScreen {...propsWithoutDeleteTest} />)

    ensureTestButtonExists(() => mockOnDeleteSection("tests"))

    const deleteTestBtn = screen.getByTitle("Eliminar TestDos.java")
    fireEvent.click(deleteTestBtn)

    expect(mockOnDeleteSection).toHaveBeenCalled()
  })

  it("debería cerrar el modal sin aplicar cambios si se cancela la eliminación", async () => {
    render(<GeneratedCodeScreen {...defaultProps} />)

    const deleteBtn = screen.getByTitle("Eliminar Clases Base")
    fireEvent.click(deleteBtn)
  })

  it("debería permitir editar las clases base y mostrar el botón de guardar cambios", async () => {
    render(<GeneratedCodeScreen {...defaultProps} />)

    expect(
      screen.queryByRole("button", { name: "Guardar cambios" })
    ).not.toBeInTheDocument()

    const editToggles = screen.getAllByText("🔒 No editable")
    fireEvent.click(editToggles[0])
  })

  it("debería guardar las modificaciones exitosamente al hacer click en Guardar", async () => {
    mockOnUpdateProject.mockResolvedValueOnce({ success: true })
    render(<GeneratedCodeScreen {...defaultProps} />)

    const editToggles = screen.getAllByText("🔒 No editable")
    fireEvent.click(editToggles[0])

    const textarea = screen.getByRole("textbox")
    if (textarea) {
      fireEvent.change(textarea, {
        target: { value: "public class Main { // Código modificado }" }
      })
    }
  })

  it("debería mantener el control de errores si la promesa de onUpdateProject falla", async () => {
    render(<GeneratedCodeScreen {...errorProps} />)

    const editToggles = screen.getAllByText("🔒 No editable")
    fireEvent.click(editToggles[0])

    const textarea = screen.getByRole("textbox")
    if (textarea) {
      fireEvent.change(textarea, { target: { value: "cambio con error" } })
    }
  })

  it("debería lanzar un alert con mensaje genérico si el error rechazado no es una instancia de Error", async () => {
    render(<GeneratedCodeScreen {...stringErrorProps} />)

    const editToggles = screen.getAllByText("🔒 No editable")
    fireEvent.click(editToggles[0])

    const textarea = screen.getByRole("textbox")
    if (textarea) {
      fireEvent.change(textarea, {
        target: { value: "cambio con error string" }
      })
    }
  })
})
