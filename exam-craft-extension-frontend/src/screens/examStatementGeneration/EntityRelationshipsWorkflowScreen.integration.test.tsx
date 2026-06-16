import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, test, expect, beforeEach, vi } from "vitest"
import "@testing-library/jest-dom"
import EntityRelationshipsWorkflowScreen from "./EntityRelationshipsWorkflowScreen" // Ajusta la ruta si es necesario

// ==========================================
// 1. MOCKS DE MÓDULOS E IMPORTS ESTÁTICOS
// ==========================================

vi.mock(
  "bundle-text:../../prompts/generation-entity-relationships/generation_relationships_between_entities_from_statement.md",
  () => ({
    default: "Texto base del prompt de relaciones con {{DOMAIN}}"
  })
)

vi.mock("~src/utils/promptParser", () => ({
  parseMasterPrompt: () => ({
    visibleText: "Prompt visible de relaciones",
    hiddenContext: "Contexto oculto mockeado"
  })
}))

vi.mock("~src/components/Header", () => ({
  Header: ({ currentStep }: any) => <div data-testid="header">{currentStep}</div>
}))

vi.mock("~src/utils/chromeStorageUtils", () => ({
  saveToChrome: vi.fn(() => Promise.resolve())
}))

vi.mock("~src/utils/downloadUtils", () => ({
  downloadMarkdown: vi.fn()
}))

vi.mock("~src/components/FolderExamsSelector", () => ({
  FolderExamSelector: ({ projects, onSelectProject }: any) => (
    <div data-testid="folder-selector">
      {projects.map((p: any) => (
        <button key={p.id} data-testid={`project-btn-${p.id}`} onClick={() => onSelectProject(p)}>
          {p.domainName}
        </button>
      ))}
    </div>
  )
}))

vi.mock("~src/components/WorkflowComponents", () => ({
  PromptEditor: ({ onGenerate, onPromptChange, promptText }: any) => (
    <div data-testid="prompt-editor">
      <textarea
        data-testid="prompt-input"
        value={promptText}
        onChange={(e) => onPromptChange(e.target.value)}
      />
      <button onClick={onGenerate}>Generar</button>
    </div>
  ),
  SplitResultView: ({ responseText, footer }: any) => (
    <div data-testid="split-view">
      <span data-testid="response-view">{responseText}</span>
      {footer}
    </div>
  )
}))

// ==========================================
// 2. CONFIGURACIÓN DEL ENTORNO Y HOOKS
// ==========================================

const mockGenerate = vi.fn()
const mockSetResponseText = vi.fn()

vi.mock("~src/components/GeminiGeneration", () => ({
  useGeminiGeneration: () => ({
    responseText: "Relaciones generadas por la IA",
    isLoading: false,
    generate: mockGenerate,
    setResponseText: mockSetResponseText
  })
}))

const mockGetStorage = vi.fn()
declare var globalThis: any

globalThis.chrome = {
  storage: {
    local: {
      get: mockGetStorage
    }
  }
}

const defaultProps = {
  onBack: vi.fn(),
  onWelcome: vi.fn(),
  onCreateExam: vi.fn(),
  onCreateTest: vi.fn(),
  onGoToBaseClass: vi.fn(),
  onCreateExamByParts: vi.fn()
}

// ==========================================
// 3. SUITE DE PRUEBAS DE INTEGRACIÓN
// ==========================================

describe("EntityRelationshipsWorkflowScreen - Integration Tests Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.chrome = {
      storage: {
        local: {
          get: mockGetStorage
        }
      }
    }
  })

  // ------------------------------------------
  // A. FLUJO POSITIVO (HAPPY PATH)
  // ------------------------------------------
  describe("Flujos Positivos", () => {
    test("Debería seleccionar un proyecto, generar relaciones, guardar y avanzar a la creación de tests", async () => {
      const fakeStorage = {
        "project_1": { domainName: "Ajedrez", extensionFinish: "Enunciado base", baseClasses: "Clases base existentes" }
      }
      mockGetStorage.mockImplementation((fields: any, callback: Function) => callback(fakeStorage))
      mockGenerate.mockResolvedValueOnce("Relaciones generadas por la IA")

      render(<EntityRelationshipsWorkflowScreen {...defaultProps} />)

      // 1. Esperar y seleccionar el examen en la pantalla inicial
      await waitFor(() => {
        expect(screen.getByTestId("project-btn-project_1")).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId("project-btn-project_1"))

      // 2. Confirmar el uso del contexto en el Modal
      expect(screen.getByText(/¿Deseas utilizar Examen de Ajedrez como base/i)).toBeInTheDocument()
      fireEvent.click(screen.getByRole("button", { name: "Confirmar" }))

      // 3. Modificar u observar el editor del prompt y gatillar la generación
      expect(screen.getByTestId("prompt-editor")).toBeInTheDocument()
      fireEvent.click(screen.getByRole("button", { name: "Generar" }))

      expect(mockGenerate).toHaveBeenCalled()

      // 4. Verificar que se renderiza el SplitResultView con el output de la IA
      await waitFor(() => {
        expect(screen.getByTestId("split-view")).toBeInTheDocument()
      })

      // 5. Presionar en Guardar para persistir en Chrome Storage
      fireEvent.click(screen.getByRole("button", { name: "Guardar" }))

      // 6. Validar que aparece el Modal de éxito y presionar "Sí" para avanzar a los tests
      await waitFor(() => {
        expect(screen.getByText(/¡Guardado correctamente!/i)).toBeInTheDocument()
      })
      fireEvent.click(screen.getByRole("button", { name: "Sí" }))

      // 7. Verificar llamada al callback externo con la configuración estructurada
      expect(defaultProps.onCreateTest).toHaveBeenCalledWith({
        project: expect.objectContaining({ id: "project_1", domainName: "Ajedrez" }),
        constraints: "",
        entityRelationships: "Relaciones generadas por la IA",
        baseClass: "Clases base existentes",
        targetPart: "test2_relationships"
      })
    })
  })

  // ------------------------------------------
  // B. FLUJO NEGATIVO / CONTROL DE ERRORES
  // ------------------------------------------
  describe("Flujos Negativos y Alertas", () => {
    test("Debería permanecer en el editor de inputs si Gemini devuelve un resultado inválido o null", async () => {
      const fakeStorage = {
        "project_1": { domainName: "Veterinaria", extensionFinish: "Enunciado base" }
      }
      mockGetStorage.mockImplementation((fields: any, callback: Function) => callback(fakeStorage))
      mockGenerate.mockResolvedValueOnce(null) // Simula fallo o cancelación de la IA

      render(<EntityRelationshipsWorkflowScreen {...defaultProps} />)

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("project-btn-project_1"))
      })
      fireEvent.click(screen.getByRole("button", { name: "Confirmar" }))

      fireEvent.click(screen.getByRole("button", { name: "Generar" }))

      // Forzar aserción asíncrona y verificar que el flujo no avanzó al SplitResultView
      await waitFor(() => {
        expect(mockGenerate).toHaveBeenCalled()
      })
      expect(screen.queryByTestId("split-view")).not.toBeInTheDocument()
      expect(screen.getByTestId("prompt-editor")).toBeInTheDocument()
    })

    test("Debería mostrar un WarningModal e interrumpir el flujo si el proyecto no posee Clases Base generadas", async () => {
      const fakeStorage = {
        "project_1": { domainName: "Ajedrez", extensionFinish: "Enunciado base" } // Sin la propiedad baseClasses
      }
      mockGetStorage.mockImplementation((fields: any, callback: Function) => callback(fakeStorage))
      mockGenerate.mockResolvedValueOnce("Relaciones completas")

      render(<EntityRelationshipsWorkflowScreen {...defaultProps} />)

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("project-btn-project_1"))
      })
      fireEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      fireEvent.click(screen.getByRole("button", { name: "Generar" }))

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: "Guardar" }))
      })

      // Al confirmarse el guardado...
      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: "Sí" }))
      })

      // Debería interrumpir pidiendo que se generen primero las clases base redirigiendo al docente
      expect(screen.getByText(/Faltan las Clases Base/i)).toBeInTheDocument()
      fireEvent.click(screen.getByRole("button", { name: "Ir a crear Clases Base" }))
      
      expect(defaultProps.onGoToBaseClass).toHaveBeenCalled()
    })
  })
})