import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import "@testing-library/jest-dom"
import { VisualSolutionCodeScreen } from "./VisualSolutionCodeScreen"
import { parseJavaFiles } from "~src/utils/codeUtils"

vi.mock("~src/utils/codeUtils", () => ({
  parseJavaFiles: vi.fn((rawCode) => {
    if (!rawCode) return []
    return [{ filename: "Solucion.java", code: rawCode }]
  })
}))

vi.mock("~src/components/Header", () => ({
  Header: () => <div data-testid="mock-header">Mock Header</div>
}))

vi.mock("~src/components/JavaCodeBlock", () => ({
  JavaCodeBlock: ({ filename, code }: any) => (
    <div data-testid="java-code-block">
      <span>{filename}</span>
      <pre>{code}</pre>
    </div>
  )
}))

vi.mock("~src/components/modals/DeleteConfirmationModal", () => ({
  DeleteConfirmationModal: ({ isOpen, itemName, onConfirm, onCancel }: any) => {
    if (!isOpen) return null
    return (
      <div data-testid="delete-modal">
        <p>¿Eliminar {itemName}?</p>
        <button onClick={onConfirm}>Confirmar Borrado</button>
        <button onClick={onCancel}>Cancelar Borrado</button>
      </div>
    )
  }
}))


describe("VisualSolutionCodeScreen Integration Tests", () => {
  const mockOnBack = vi.fn()
  const mockOnWelcome = vi.fn()
  const mockOnGoToExams = vi.fn()
  const mockOnGoToFolders = vi.fn()
  const mockOnDeleteSection = vi.fn()
  const mockOnUpdateProject = vi.fn()

  const mockProjectWithSolution = {
    id: "proj-abc",
    customName: "Examen Patrones de Diseño",
    domainName: "Ajedrez",
    fullSolution: "public class Solucion {}"
  }

  const defaultProps = {
    selectedProject: mockProjectWithSolution,
    selectedDomainFolder: "Ajedrez",
    onWelcome: mockOnWelcome,
    onBack: mockOnBack,
    onGoToExams: mockOnGoToExams,
    onGoToFolders: mockOnGoToFolders,
    onDeleteSection: mockOnDeleteSection,
    onUpdateProject: mockOnUpdateProject
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, "alert").mockImplementation(() => {})
  })

  
  it("debería mostrar el estado vacío si el proyecto no contiene solución", () => {
    vi.mocked(parseJavaFiles).mockReturnValueOnce([])

    const emptyProps = {
      ...defaultProps,
      selectedProject: { ...mockProjectWithSolution, fullSolution: "" }
    }
    render(<VisualSolutionCodeScreen {...emptyProps} />)

    expect(screen.getByText(/Aún no se ha generado una solución completa/i)).toBeInTheDocument()
    expect(screen.queryByText("🔒 No editable")).not.toBeInTheDocument()
  })

  it("debería renderizar los bloques de código si la solución existe y está parseada", () => {
    render(<VisualSolutionCodeScreen {...defaultProps} />)

    expect(screen.getByTestId("java-code-block")).toBeInTheDocument()
    expect(screen.getByText("Solucion.java")).toBeInTheDocument()
    expect(screen.getByText("🔒 No editable")).toBeInTheDocument()
  })

  it("debería conmutar a modo edición mostrando el textarea con el código crudo", () => {
    render(<VisualSolutionCodeScreen {...defaultProps} />)

    const editToggle = screen.getByText("🔒 No editable")
    fireEvent.click(editToggle)

    expect(screen.getByText("✎ Editando")).toBeInTheDocument()
    const textarea = screen.getByRole("textbox")
    expect(textarea).toHaveValue("public class Solucion {}")
  })

  it("debería activar el botón de guardar al modificar el contenido y salvar exitosamente", async () => {
    mockOnUpdateProject.mockResolvedValueOnce(undefined)
    render(<VisualSolutionCodeScreen {...defaultProps} />)

    fireEvent.click(screen.getByText("🔒 No editable"))

    const textarea = screen.getByRole("textbox")
    fireEvent.change(textarea, { target: { value: "public class SolucionModificada {}" } })

    const saveBtn = screen.getByRole("button", { name: "Guardar cambios" })
    fireEvent.click(saveBtn)

    expect(saveBtn).toHaveTextContent("Guardando...")

    await waitFor(() => {
      expect(mockOnUpdateProject).toHaveBeenCalledWith(expect.objectContaining({
        id: "proj-abc",
        fullSolution: "public class SolucionModificada {}",
        updatedAt: expect.any(String)
      }))
    })

    expect(screen.getByText("🔒 No editable")).toBeInTheDocument()
  })

  it("debería lanzar un alert informativo si la promesa de onUpdateProject es rechazada", async () => {
    const errorServidor = new Error("Error de red en el Storage")
    mockOnUpdateProject.mockRejectedValueOnce(errorServidor)

    render(<VisualSolutionCodeScreen {...defaultProps} />)

    fireEvent.click(screen.getByText("🔒 No editable"))
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Cambio erróneo" } })
    
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Error de red en el Storage")
    })
  })
  
  it("debería abrir el modal de confirmación, confirmar y llamar a onDeleteSection", () => {
    render(<VisualSolutionCodeScreen {...defaultProps} />)

    const deleteBtn = screen.getByTitle("Eliminar Solución Completa")
    fireEvent.click(deleteBtn)

    expect(screen.getByTestId("delete-modal")).toBeInTheDocument()
    expect(screen.getByText("¿Eliminar Solución Completa?")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Confirmar Borrado"))

    expect(mockOnDeleteSection).toHaveBeenCalledWith("fullSolution")
    expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument()
  })

  it("debería cerrar el modal sin aplicar ninguna acción si el usuario cancela", () => {
    render(<VisualSolutionCodeScreen {...defaultProps} />)

    fireEvent.click(screen.getByTitle("Eliminar Solución Completa"))
    expect(screen.getByTestId("delete-modal")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Cancelar Borrado"))

    expect(mockOnDeleteSection).not.toHaveBeenCalled()
    expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument()
  })

  it("debería invocar la función onBack al pulsar el botón Volver", () => {
    render(<VisualSolutionCodeScreen {...defaultProps} />)

    const backBtn = screen.getByRole("button", { name: "Volver" })
    fireEvent.click(backBtn)

    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })
})