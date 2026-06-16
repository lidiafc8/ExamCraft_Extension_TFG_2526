import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import React from "react"
import "@testing-library/jest-dom"

import { ExamDetailScreen } from "./ExamDetailScreen"
import { generateWithAI } from "../../services/geminiService"

vi.mock("../../services/geminiService", () => ({
  generateWithAI: vi.fn()
}))

vi.mock("../../components/Header", () => ({
  Header: ({ currentStep, breadcrumbItems }: any) => (
    <header data-testid="mock-header">
      <h1>{currentStep}</h1>
      {breadcrumbItems.map((item: any, idx: number) => (
        <button key={idx} data-testid={`breadcrumb-btn-${idx}`} onClick={item.action}>
          {item.label}
        </button>
      ))}
    </header>
  )
}))

vi.mock("../../components/MermaidCodeCleaner", () => ({
  cleanMermaidCode: vi.fn((text) => `clean-${text || ""}`)
}))

vi.mock("../../components/MermaidViewer", () => ({
  MermaidViewer: ({ chartCode }: { chartCode: string }) => (
    <div data-testid="mermaid-viewer">{chartCode}</div>
  )
}))

vi.mock("~src/components/modals/DeleteConfirmationModal", () => ({
  DeleteConfirmationModal: ({ isOpen, itemName, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid="delete-modal">
        <p>Eliminar {itemName}?</p>
        <button onClick={onConfirm}>Confirmar Borrado</button>
        <button onClick={onCancel}>Cancelar Borrado</button>
      </div>
    ) : null
}))

vi.mock("~src/components/modals/DownloadConfirmModal", () => ({
  DownloadConfirmModal: ({ isOpen, defaultFileName, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid="download-modal">
        <p>Descargar {defaultFileName}</p>
        <button onClick={() => onConfirm("archivo-final.md")}>Confirmar Descarga</button>
        <button onClick={onCancel}>Cancelar Descarga</button>
      </div>
    ) : null
}))

vi.mock("~src/components/modals/GitHubDeployModal", () => ({
  GitHubDeployModal: ({ domainName, onConfirm, onClose }: any) => (
    <div data-testid="github-modal">
      <p>Deploy para {domainName}</p>
      <button onClick={() => onConfirm("fake-token-123")}>Hacer Deploy</button>
      <button onClick={onClose}>Cerrar Deploy</button>
    </div>
  )
}))

describe("Integration Test - ExamDetailScreen", () => {
  const mockProject = {
    id: "proj_001",
    customName: "Examen Final de Prueba",
    domainName: "Clínica Veterinaria",
    extensionStatement: "Enunciado inicial del problema.",
    extensionMermaid: "classDiagram\nAnimal <|-- Perro",
    attributeConstraints: "Edad debe ser > 0",
    entityRelationships: "Perro tiene un Dueño",
    baseClasses: "class Animal {}",
    testPartsMap: { part1: "testCode" },
    fullSolution: "solucion completa aqui"
  }

  const defaultProps = {
    selectedProject: mockProject,
    selectedDomainFolder: "veterinaria-folder",
    isCreating: false,
    onWelcome: vi.fn(),
    onBack: vi.fn(),
    onGoToFolders: vi.fn(),
    onDownload: vi.fn(),
    onGitHubDeploy: vi.fn(() => Promise.resolve("success")),
    onShowGeneratedCode: vi.fn(),
    onDeleteProject: vi.fn(),
    onShowSolutionGeneratedCode: vi.fn(),
    onDeleteSection: vi.fn(),
    onUpdateProject: vi.fn(() => Promise.resolve())
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.useRealTimers()
  })

  it("debería montar la vista inicial, reflejar los datos del proyecto y navegar por breadcrumbs", () => {
    render(<ExamDetailScreen {...defaultProps} />)

    expect(screen.getByTestId("mock-header")).toHaveTextContent("Examen Final de Prueba")
    expect(screen.getByText("Extensión Funcional")).toBeInTheDocument()

    const textareas = screen.getAllByRole("textbox") as HTMLTextAreaElement[]
    expect(textareas[0].value).toContain("Enunciado inicial del problema.")
    expect(textareas[1].value).toBe("Edad debe ser > 0")

    expect(screen.getByTestId("mermaid-viewer").textContent).toMatch(/clean-classDiagram\s*Animal\s*<\|--\s*Perro/)

    fireEvent.click(screen.getByTestId("breadcrumb-btn-0"))
    expect(defaultProps.onWelcome).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTestId("breadcrumb-btn-1"))
    expect(defaultProps.onGoToFolders).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTestId("breadcrumb-btn-2"))
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole("button", { name: "Volver" }))
    expect(defaultProps.onBack).toHaveBeenCalledTimes(2)
  })

  it("debería activar la edición de campos, procesar el debounce de la IA para regenerar el diagrama y guardar los cambios", async () => {
    vi.useFakeTimers()
    vi.mocked(generateWithAI).mockResolvedValue({ result: "classDiagram\nAnimal <|-- Gato", provider: "gemini" })

    render(<ExamDetailScreen {...defaultProps} />)

    const btnLockCombined = screen.getAllByRole("button", { name: "🔒 No editable" })[0]
    fireEvent.click(btnLockCombined)

    const textareaCombined = screen.getAllByRole("textbox")[0]
    fireEvent.change(textareaCombined, { target: { value: "Nuevo enunciado modificado." } })

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    vi.useRealTimers()

    await waitFor(() => {
      expect(generateWithAI).toHaveBeenCalledWith(expect.stringContaining("Nuevo enunciado modificado."))
    })

    const btnGuardar = await screen.findByRole("button", { name: "Guardar cambios" })
    fireEvent.click(btnGuardar)

    await waitFor(() => {
      expect(defaultProps.onUpdateProject).toHaveBeenCalledTimes(1)
    })
  })

  it("debería interactuar adecuadamente con el menú desplegable vertical de tres puntos y abrir modales de previsualización, descarga y deploy", async () => {
    render(<ExamDetailScreen {...defaultProps} />)

    const menuBtn = screen.getByText("⋮")
    fireEvent.click(menuBtn)

    const btnPreview = screen.getByText("Previsualizar")
    fireEvent.click(btnPreview)
    expect(screen.getByText("Previsualización del Examen")).toBeInTheDocument()

    const closePreviewBtn = document.querySelector(".preview-close-btn") || screen.getAllByText("✕")[0]
    fireEvent.click(closePreviewBtn)
    
    await waitFor(() => {
      expect(screen.queryByText("Previsualización del Examen")).not.toBeInTheDocument()
    })

    fireEvent.click(menuBtn)
    const btnDownload = screen.getByText("Descargar (.md)")
    fireEvent.click(btnDownload)
    expect(screen.getByTestId("download-modal")).toBeInTheDocument()
    fireEvent.click(screen.getByText("Confirmar Descarga"))
    expect(defaultProps.onDownload).toHaveBeenCalledWith("archivo-final.md")

    fireEvent.click(menuBtn)
    const btnDeploy = screen.getByText("Crear repositorio GitHub")
    fireEvent.click(btnDeploy)
    expect(screen.getByTestId("github-modal")).toBeInTheDocument()
    fireEvent.click(screen.getByText("Hacer Deploy"))
    expect(defaultProps.onGitHubDeploy).toHaveBeenCalledWith("fake-token-123", expect.any(Object), expect.any(String))
  })

  it("debería abrir el modal de borrado de secciones y confirmar su eliminación", () => {
    render(<ExamDetailScreen {...defaultProps} />)

    const deleteButtons = document.querySelectorAll(".storage-delete-btn")
    fireEvent.click(deleteButtons[0])

    expect(screen.getByTestId("delete-modal")).toBeInTheDocument()
    expect(screen.getByText("Eliminar Restricciones de Atributos?")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Confirmar Borrado"))
    expect(defaultProps.onDeleteSection).toHaveBeenCalledWith("attributeConstraints")
  })

  it("debería llamar a las callbacks correspondientes para visualizar el código generado de examen y de la solución", () => {
    render(<ExamDetailScreen {...defaultProps} />)

    const btnVerExamen = screen.getByRole("button", { name: "Ver Código Examen" })
    fireEvent.click(btnVerExamen)
    expect(defaultProps.onShowGeneratedCode).toHaveBeenCalledTimes(1)

    const btnVerSolucion = screen.getByRole("button", { name: "Ver Código Solución" })
    fireEvent.click(btnVerSolucion)
    expect(defaultProps.onShowSolutionGeneratedCode).toHaveBeenCalledTimes(1)
  })

  it("debería renderizar un estado vacío cuando el proyecto no cuenta con restricciones ni relaciones opcionales", () => {
    const emptySectionProject = {
      ...mockProject,
      attributeConstraints: "",
      entityRelationships: ""
    }

    render(<ExamDetailScreen {...defaultProps} selectedProject={emptySectionProject} />)

    expect(screen.getByText("Aún no se han creado las restricciones de atributos.")).toBeInTheDocument()
    expect(screen.getByText("Aún no se han creado las relaciones entre entidades.")).toBeInTheDocument()
  })
})