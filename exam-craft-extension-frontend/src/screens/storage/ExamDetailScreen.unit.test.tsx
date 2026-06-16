import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi, describe, it, expect, beforeEach } from "vitest"
import "@testing-library/jest-dom"

// --- IMPORTACIÓN DEL COMPONENTE BAJO PRUEBA ---
import { ExamDetailScreen } from "./ExamDetailScreen"

// Extracción dinámica del tipo de las props para evitar errores de compilación
type ExamDetailScreenProps = React.ComponentProps<typeof ExamDetailScreen>

// ============================================================================
// --- MOCKS DE DEPENDENCIAS Y COMPONENTES HIJOS ---
// ============================================================================

vi.mock("../../services/geminiService", () => ({
  generateWithAI: vi.fn(),
}))

vi.mock("../../components/Header", () => ({
  Header: ({ currentStep, onWelcome, breadcrumbItems }: any) => (
    <header data-testid="mock-header">
      <h1>{currentStep}</h1>
      <button onClick={onWelcome}>Inicio Global</button>
      <div data-testid="breadcrumbs">
        {breadcrumbItems?.map((item: any, idx: number) => (
          <button key={idx} onClick={item.action}>
            {item.label}
          </button>
        ))}
      </div>
    </header>
  ),
}))

vi.mock("../../components/MermaidViewer", () => ({
  MermaidViewer: ({ chartCode }: { chartCode: string }) => (
    <div data-testid="mermaid-viewer">{chartCode}</div>
  ),
}))

vi.mock("../../components/MermaidCodeCleaner", () => ({
  cleanMermaidCode: (code: string) => `cleaned-${code}`,
}))

vi.mock("~src/components/modals/DeleteConfirmationModal", () => ({
  DeleteConfirmationModal: ({ isOpen, itemName, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid="delete-modal">
        <span>Eliminar {itemName}</span>
        <button onClick={onConfirm}>Confirmar Borrado</button>
        <button onClick={onCancel}>Cancelar Borrado</button>
      </div>
    ) : null,
}))

vi.mock("~src/components/modals/DownloadConfirmModal", () => ({
  DownloadConfirmModal: ({ isOpen, defaultFileName, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid="download-modal">
        <span>Descargar {defaultFileName}</span>
        <button onClick={() => onConfirm("archivo-descargado.md")}>Confirmar Descarga</button>
        <button onClick={onCancel}>Cancelar Descarga</button>
      </div>
    ) : null,
}))

vi.mock("~src/components/modals/GitHubDeployModal", () => ({
  GitHubDeployModal: ({ isOpen, newRepoName, onConfirm, onClose, uploadListString }: any) => (
    <div data-testid="github-modal">
      <span>Repo: {newRepoName}</span>
      <pre>{uploadListString}</pre>
      <button onClick={() => onConfirm("mock-token")}>Confirmar Deploy</button>
      <button onClick={onClose}>Cerrar Deploy</button>
    </div>
  ),
}))

// ============================================================================
// --- SUITE PRINCIPAL DE PRUEBAS ---
// ============================================================================

describe("ExamDetailScreen", () => {
  let baseProps: ExamDetailScreenProps
  let mockProject: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Configuración de un proyecto con datos completos iniciales
    mockProject = {
      id: "project-123",
      customName: "Examen Parcial de Ajedrez",
      domainName: "Ajedrez",
      extensionStatement: "Enunciado base de la aplicación de ajedrez.",
      extensionMermaid: "classDiagram\nclass Tablero",
      attributeConstraints: "El tamaño del tablero debe ser de 8x8 de forma obligatoria.",
      entityRelationships: "Un Tablero contiene 64 Casillas.",
      baseClasses: "class Pieza {}",
      testPartsMap: { test1: "void testMover()" },
      fullSolution: "public class AjedrezSolution {}",
    }

    baseProps = {
      selectedProject: mockProject,
      selectedDomainFolder: "Ajedrez",
      isCreating: false,
      onWelcome: vi.fn(),
      onBack: vi.fn(),
      onGoToFolders: vi.fn(),
      onDownload: vi.fn(),
      onGitHubDeploy: vi.fn().mockResolvedValue("https://github.com/repo"),
      onShowGeneratedCode: vi.fn(),
      onDeleteProject: vi.fn(),
      onShowSolutionGeneratedCode: vi.fn(),
      onDeleteSection: vi.fn(),
      onUpdateProject: vi.fn().mockResolvedValue(undefined),
    }

    Storage.prototype.getItem = vi.fn().mockReturnValue("gh_token_existente")
  })

  // ==========================================
  // 1. CASOS POSITIVOS (RENDERIZADO Y NAVEGACIÓN)
  // ==========================================
  describe("Casos Positivos - Renderizado Inicial y Navegación", () => {
    it("renderiza correctamente el título personalizado y las secciones de contenido", () => {
      render(<ExamDetailScreen {...baseProps} />)

      expect(screen.getByRole("heading", { name: "Examen Parcial de Ajedrez" })).toBeInTheDocument()
      expect(screen.getByText("Enunciado y Código Diagrama UML")).toBeInTheDocument()
      expect(screen.getByText("Definición de Restricciones")).toBeInTheDocument()
      expect(screen.getByText("Definición de Relaciones")).toBeInTheDocument()
    })

    it("inicializa las áreas de texto con el formato combinado esperado y la visualización UML limpia", async () => {
      render(<ExamDetailScreen {...baseProps} />)

      const textareas = screen.getAllByRole("textbox")
      expect(textareas[0]).toHaveValue(
        "Enunciado base de la aplicación de ajedrez.\n\n```mermaid\nclassDiagram\nclass Tablero\n```"
      )
      expect(textareas[1]).toHaveValue(mockProject.attributeConstraints)
      expect(textareas[2]).toHaveValue(mockProject.entityRelationships)

      // Usamos findByTestId para asincronía segura
      const viewer = await screen.findByTestId("mermaid-viewer")
      
      // --- CORRECCIÓN AQUÍ ---
      // Usamos una expresión regular que acepta cualquier tipo de espacio o salto de línea (\s+) entre ambas palabras
      expect(viewer).toHaveTextContent(/cleaned-classDiagram\s+class Tablero/)
    })

    it("gestiona adecuadamente las llamadas de navegación de los breadcrumbs", async () => {
      render(<ExamDetailScreen {...baseProps} />)

      await userEvent.click(screen.getByRole("button", { name: "INICIO" }))
      expect(baseProps.onWelcome).toHaveBeenCalled()

      await userEvent.click(screen.getByRole("button", { name: "EXÁMENES ANTERIORES" }))
      expect(baseProps.onGoToFolders).toHaveBeenCalled()

      await userEvent.click(screen.getByRole("button", { name: "AJEDREZ" }))
      expect(baseProps.onBack).toHaveBeenCalled()
    })

    it("ejecuta las funciones callback al presionar los botones para visualizar códigos generados", async () => {
      render(<ExamDetailScreen {...baseProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Ver Código Examen" }))
      expect(baseProps.onShowGeneratedCode).toHaveBeenCalled()

      await userEvent.click(screen.getByRole("button", { name: "Ver Código Solución" }))
      expect(baseProps.onShowSolutionGeneratedCode).toHaveBeenCalled()
    })
  })

  // ==========================================
  // 2. ACCIONES DEL MENÚ DESPLEGABLE Y MODALES
  // ==========================================
  describe("Interacciones - Menú Dropdown de Acciones y Modales", () => {
    beforeEach(async () => {
      render(<ExamDetailScreen {...baseProps} />)
      const menuBtn = screen.getByRole("button", { name: "⋮" })
      await userEvent.click(menuBtn)
    })

    it("abre la vista previa del examen en pantalla completa y permite cerrarla", async () => {
      await userEvent.click(screen.getByRole("button", { name: "Previsualizar" }))
      
      const previewTitle = await screen.findByRole("heading", { name: "Previsualización del Examen" })
      expect(previewTitle).toBeInTheDocument()
      
      // --- CORRECCIÓN AQUÍ: Filtramos la lista de botones por su clase exclusiva ---
      const closeBtn = screen.getAllByRole("button").find(btn => 
        btn.className.includes("preview-close-btn")
      ) as HTMLElement;
      
      await userEvent.click(closeBtn)
      expect(screen.queryByRole("heading", { name: "Previsualización del Examen" })).not.toBeInTheDocument()
    })

    it("abre el modal de confirmation de descarga y procesa el callback al confirmar", async () => {
      await userEvent.click(screen.getByRole("button", { name: "Descargar (.md)" }))
      
      expect(screen.getByTestId("download-modal")).toBeInTheDocument()
      await userEvent.click(screen.getByRole("button", { name: "Confirmar Descarga" }))
      
      expect(baseProps.onDownload).toHaveBeenCalledWith("archivo-descargado.md")
    })

    it("despliega el modal de GitHub construyendo la lista correcta de ficheros a subir", async () => {
      await userEvent.click(screen.getByRole("button", { name: "Crear repositorio GitHub" }))
      
      expect(screen.getByTestId("github-modal")).toBeInTheDocument()
      expect(screen.getByText(/README\.md \(Enunciado y UML\)/)).toBeInTheDocument()
      expect(screen.getByText(/Restricciones de atributos/)).toBeInTheDocument()
    })

    it("ejecuta de manera directa el borrado global del examen", async () => {
      await userEvent.click(screen.getByRole("button", { name: "Eliminar" }))
      expect(baseProps.onDeleteProject).toHaveBeenCalledWith("project-123")
    })
  })
})