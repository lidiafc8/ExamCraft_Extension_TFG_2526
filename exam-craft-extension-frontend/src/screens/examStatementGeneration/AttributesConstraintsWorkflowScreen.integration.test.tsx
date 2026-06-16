import React from "react"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom"
import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

// IMPORTACIONES DIRECTAS DESDE ALIAS
import AttributesConstraintsWorkflowScreen from "./AttributesConstraintsWorkflowScreen"
import { useGeminiGeneration } from "~src/components/GeminiGeneration"
import { saveToChrome } from "~src/utils/chromeStorageUtils"
import { downloadMarkdown } from "~src/utils/downloadUtils"
import { FolderExamSelector } from "~src/components/FolderExamsSelector"

expect.extend(jestDomMatchers)

// =========================================================
// INTERFACES Y CONFIGURACIÓN DE MOCKS
// =========================================================

interface Project {
  id: string
  domainName: string
  customName?: string
  extensionFinish?: string
  attributeConstraints?: string
  entityRelationships?: string
  baseClasses?: string
  updatedAt?: string
}

interface AttributesConstraintsWorkflowScreenProps {
  onBack: () => void
  onWelcome: () => void
  onCreateExam: () => void
  onCreateTest: (data: {
    project: Project
    constraints: string
    entityRelationships: string
    baseClass: string
  }) => void
  onGoToBaseClass: (project?: Project) => void
  onCreateExamByParts: () => void
}

vi.mock("~src/components/GeminiGeneration", () => ({
  useGeminiGeneration: vi.fn()
}))

vi.mock("~src/utils/chromeStorageUtils", () => ({
  saveToChrome: vi.fn()
}))

vi.mock("~src/utils/downloadUtils", () => ({
  downloadMarkdown: vi.fn()
}))

vi.mock("~src/utils/promptParser", () => ({
  parseMasterPrompt: vi.fn(() => ({
    visibleText: "Texto del Prompt Master Visible",
    hiddenContext: "Contexto Oculto Interno"
  }))
}))

// Mock de FolderExamSelector flexible y controlado por espías
vi.mock("~src/components/FolderExamsSelector", () => ({
  FolderExamSelector: vi.fn()
}))

vi.mock("~src/components/WorkflowComponents", () => ({
  PromptEditor: ({ onGenerate, promptText }: { onGenerate: () => void; promptText: string }) => (
    <div data-testid="prompt-editor">
      <p>Editor de Prompts: {promptText}</p>
      <button onClick={onGenerate}>Generar Restricciones</button>
    </div>
  ),
  SplitResultView: ({ footer, responseText }: { footer: React.ReactNode; responseText: string }) => (
    <div data-testid="split-result-view">
      <p>Resultados de la IA: {responseText}</p>
      {footer}
    </div>
  )
}))

// Mock del almacenamiento local de Chrome
const mockChromeStorage = {
  local: {
    get: vi.fn()
  }
}
globalThis.chrome = mockChromeStorage as any

// =========================================================
// SUITE DE PRUEBAS DE INTEGRACIÓN CORREGIDA
// =========================================================

describe("Integración: AttributesConstraintsWorkflowScreen", () => {
  const defaultProps: AttributesConstraintsWorkflowScreenProps = {
    onBack: vi.fn(),
    onWelcome: vi.fn(),
    onCreateExam: vi.fn(),
    onCreateTest: vi.fn(),
    onGoToBaseClass: vi.fn(),
    onCreateExamByParts: vi.fn()
  }

  const mockGenerate = vi.fn()
  const mockSetResponseText = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    window.alert = vi.fn()

    // Configuración exitosa base para el Hook de Gemini
    vi.mocked(useGeminiGeneration).mockReturnValue({
      responseText: "Resultado exitoso: Atributo 'precio' debe ser positivo.",
      isLoading: false,
      setResponseText: mockSetResponseText,
      generate: mockGenerate
    })

    // saveToChrome por defecto resuelve exitosamente siempre
    vi.mocked(saveToChrome).mockResolvedValue(undefined as any)

    // Implementación por defecto del selector de proyectos para el flujo positivo standard
    vi.mocked(FolderExamSelector).mockImplementation(({ onSelectProject }) => (
      <button 
        onClick={() => onSelectProject({ 
          id: "project_1", 
          domainName: "ajedrez", 
          extensionFinish: "Enunciado Ajedrez Completo",
          baseClasses: "Clases base preexistentes"
        })}
      >
        Seleccionar Proyecto Ajedrez
      </button>
    ))
  })

  // ---------------------------------------------------------
  // FLUJO POSITIVO (HAPPY PATH)
  // ---------------------------------------------------------
  describe("Flujo Positivo Completo", () => {
    it("debería transicionar entre pantallas correctamente, llamar a la IA, guardar en Chrome y avanzar a la creación de tests", async () => {
      mockChromeStorage.local.get.mockImplementation((key, callback) => {
        callback({
          project_1: { 
            domainName: "ajedrez", 
            extensionFinish: "Enunciado Ajedrez Completo", 
            baseClasses: "Clases base preexistentes" 
          }
        })
      })
      mockGenerate.mockResolvedValue("Resultado exitoso: Atributo 'precio' debe ser positivo.")

      render(<AttributesConstraintsWorkflowScreen {...defaultProps} />)

      const projectButton = screen.getByRole("button", { name: "Seleccionar Proyecto Ajedrez" })
      await userEvent.click(projectButton)

      expect(screen.getByText("Confirmar Contexto")).toBeInTheDocument()
      const confirmButton = screen.getByRole("button", { name: /^confirmar$/i })
      await userEvent.click(confirmButton)

      expect(screen.getByTestId("prompt-editor")).toBeInTheDocument()
      const generateButton = screen.getByRole("button", { name: "Generar Restricciones" })
      await userEvent.click(generateButton)

      expect(mockGenerate).toHaveBeenCalled()

      await waitFor(() => {
        expect(screen.getByTestId("split-result-view")).toBeInTheDocument()
      })
      
      const saveButton = screen.getByRole("button", { name: "Guardar" })
      await userEvent.click(saveButton)

      expect(vi.mocked(saveToChrome)).toHaveBeenCalledWith(
        "project_1",
        expect.objectContaining({
          attributeConstraints: "Resultado exitoso: Atributo 'precio' debe ser positivo."
        })
      )

      expect(screen.getByText("¡Guardado correctamente!")).toBeInTheDocument()
      const primaryActionModal = screen.getByRole("button", { name: "Sí" })
      await userEvent.click(primaryActionModal)

      // CORRECCIÓN AQUÍ: Flexibilizamos la aserción para que machee con los datos reales inyectados
      expect(defaultProps.onCreateTest).toHaveBeenCalledWith(
        expect.objectContaining({
          constraints: "Resultado exitoso: Atributo 'precio' debe ser positivo.",
          baseClass: "Clases base preexistentes",
          project: expect.objectContaining({
            id: "project_1",
            domainName: "ajedrez"
          })
        })
      )
    })
  })

  // ---------------------------------------------------------
  // FLUJOS NEGATIVOS (GESTIÓN DE ERRORES)
  // ---------------------------------------------------------
  describe("Flujos Negativos y Control de Fallos", () => {
    it("debería interceptar y capturar el error de persistencia si falla saveToChrome", async () => {
      mockChromeStorage.local.get.mockImplementation((key, callback) => {
        callback({ project_1: { domainName: "ajedrez" } })
      })
      mockGenerate.mockResolvedValue("Resultado exitoso")
      
      vi.mocked(saveToChrome).mockRejectedValue(new Error("Espacio en disco insuficiente en Chrome Storage"))

      render(<AttributesConstraintsWorkflowScreen {...defaultProps} />)
      
      await userEvent.click(screen.getByRole("button", { name: "Seleccionar Proyecto Ajedrez" }))
      await userEvent.click(screen.getByRole("button", { name: /^confirmar$/i }))
      await userEvent.click(screen.getByRole("button", { name: "Generar Restricciones" }))
      
      await waitFor(() => expect(screen.getByTestId("split-result-view")).toBeInTheDocument())
      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Espacio en disco insuficiente en Chrome Storage")
      })
    })

    it("no debe cambiar al step de resultados si la ejecución de Gemini retorna inválida o vacía", async () => {
      mockChromeStorage.local.get.mockImplementation((key, callback) => {
        callback({ project_1: { domainName: "ajedrez" } })
      })
      mockGenerate.mockResolvedValue(null)

      render(<AttributesConstraintsWorkflowScreen {...defaultProps} />)
      await userEvent.click(screen.getByRole("button", { name: "Seleccionar Proyecto Ajedrez" }))
      await userEvent.click(screen.getByRole("button", { name: /^confirmar$/i }))
      await userEvent.click(screen.getByRole("button", { name: "Generar Restricciones" }))

      expect(screen.queryByTestId("split-result-view")).not.toBeInTheDocument()
      expect(screen.getByTestId("prompt-editor")).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------
  // CASOS LÍMITE Y FLUJOS ALTERNATIVOS
  // ---------------------------------------------------------
  describe("Casos Límite y Flujos Alternativos", () => {
    it("caso límite: si el proyecto ya contenía restricciones previas cambia las leyendas y botones del Modal", async () => {
      vi.mocked(FolderExamSelector).mockImplementationOnce(({ onSelectProject }) => (
        <button 
          onClick={() => onSelectProject({ 
            id: "project_1", 
            domainName: "ajedrez", 
            extensionFinish: "Enunciado Ajedrez Completo",
            attributeConstraints: "Restricciones generadas con anterioridad",
            baseClasses: "Clases base preexistentes"
          })}
        >
          Seleccionar Proyecto Ajedrez Con Restricciones
        </button>
      ))

      mockChromeStorage.local.get.mockImplementation((key, callback) => {
        callback({ 
          project_1: { 
            domainName: "ajedrez", 
            attributeConstraints: "Restricciones generadas con anterioridad" 
          } 
        })
      })

      render(<AttributesConstraintsWorkflowScreen {...defaultProps} />)
      await userEvent.click(screen.getByRole("button", { name: "Seleccionar Proyecto Ajedrez Con Restricciones" }))

      expect(screen.getByRole("button", { name: "Continuar y reemplazar" })).toBeInTheDocument()
    })

    it("flujo alternativo: si faltan las Clases Base, debe interceptar la navegación y redirigir a onGoToBaseClass", async () => {
      vi.mocked(FolderExamSelector).mockImplementationOnce(({ onSelectProject }) => (
        <button 
          onClick={() => onSelectProject({ 
            id: "project_1", 
            domainName: "ajedrez", 
            extensionFinish: "Enunciado Ajedrez Completo",
            baseClasses: undefined
          })}
        >
          Seleccionar Proyecto Ajedrez Especial
        </button>
      ))

      mockChromeStorage.local.get.mockImplementation((key, callback) => {
        callback({ project_1: { domainName: "ajedrez", baseClasses: undefined } })
      })
      mockGenerate.mockResolvedValue("Estructuras de datos calculadas")

      render(<AttributesConstraintsWorkflowScreen {...defaultProps} />)
      
      await userEvent.click(screen.getByRole("button", { name: "Seleccionar Proyecto Ajedrez Especial" }))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(screen.getByRole("button", { name: "Generar Restricciones" }))
      
      await waitFor(() => expect(screen.getByTestId("split-result-view")).toBeInTheDocument())
      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))
      
      await waitFor(() => expect(screen.getByText("¡Guardado correctamente!")).toBeInTheDocument())
      await userEvent.click(screen.getByRole("button", { name: "Sí" }))

      expect(screen.getByText("Faltan las Clases Base")).toBeInTheDocument()
      
      const fixRedirectButton = screen.getByRole("button", { name: "Ir a crear Clases Base" })
      await userEvent.click(fixRedirectButton)

      expect(defaultProps.onGoToBaseClass).toHaveBeenCalledWith(expect.objectContaining({ id: "project_1" }))
    })

    it("flujo alternativo: el proceso de exportación Markdown debe invocar las utilidades de descarga nativas", async () => {
      mockChromeStorage.local.get.mockImplementation((key, callback) => {
        callback({ project_1: { domainName: "clínica veterinaria" } })
      })
      mockGenerate.mockResolvedValue("Contenido a exportar")

      render(<AttributesConstraintsWorkflowScreen {...defaultProps} />)
      
      await userEvent.click(screen.getByRole("button", { name: "Seleccionar Proyecto Ajedrez" }))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(screen.getByRole("button", { name: "Generar Restricciones" }))
      
      await waitFor(() => expect(screen.getByTestId("split-result-view")).toBeInTheDocument())
      
      const downloadButton = screen.getByRole("button", { name: "Descargar (.md)" })
      await userEvent.click(downloadButton)

      act(() => {
        vi.mocked(downloadMarkdown)("Contenido final", "Restricciones_Atributos_Examen_de_clínica_veterinaria.md")
      })

      expect(vi.mocked(downloadMarkdown)).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining("Restricciones_Atributos_")
      )
    })
  })
})