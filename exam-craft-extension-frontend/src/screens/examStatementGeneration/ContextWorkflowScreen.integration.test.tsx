import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, test, expect, beforeEach, vi } from "vitest"
import "@testing-library/jest-dom"
import ContextWorkflowScreen from "./ContextWorkflowScreen" // Ajusta la ruta según tu estructura de carpetas

// ==========================================
// 1. MOCKS DE MÓDULOS E IMPORTS ESTÁTICOS
// ==========================================

// Mock de la importación del archivo Markdown
vi.mock(
  "bundle-text:../../prompts/functional-extension-generation/generation_statement_functional_extension.md",
  () => {
    return {
      default: "Texto base del prompt con {{DOMAIN}}"
    }
  }
)

// Mock de las utilidades de parseo de prompts
vi.mock("../../utils/promptParser", () => ({
  parseMasterPrompt: () => ({
    visibleText: "Prompt visible para {{DOMAIN}}",
    hiddenContext: "Contexto oculto mockeado"
  })
}))

// Mocks de componentes de presentación para aislar la lógica del flujo
vi.mock("~src/components/Header", () => ({
  Header: () => <div data-testid="header" />
}))

vi.mock("../../components/WorkflowComponents", () => ({
  StepperHeader: ({ currentStep }: { currentStep: number }) => (
    <div data-testid="stepper">Paso: {currentStep}</div>
  ),
  PromptEditor: ({ onGenerate, onPromptChange, promptText }: any) => (
    <div data-testid="prompt-editor">
      <textarea
        data-testid="prompt-input"
        value={promptText}
        onChange={(e) => onPromptChange(e.target.value)}
      />
      <button onClick={onGenerate}>Generar Enunciado</button>
    </div>
  ),
  SplitResultView: ({ responseText, onPromptChange, promptText }: any) => (
    <div data-testid="split-view">
      <span data-testid="response-text-view">{responseText}</span>
      <textarea
        data-testid="prompt-result-input"
        value={promptText}
        onChange={(e) => onPromptChange(e.target.value)}
      />
    </div>
  )
}))

// ==========================================
// 2. CONFIGURACIÓN DEL HOOK Y ENTORNO CHROME
// ==========================================

const mockGenerate = vi.fn()
const mockSetResponseText = vi.fn()

vi.mock("../../components/GeminiGeneration", () => ({
  useGeminiGeneration: () => ({
    responseText: "Resultado exitoso de la IA",
    isLoading: false,
    generate: mockGenerate,
    setResponseText: mockSetResponseText
  })
}))

// Mock global de la API de Chrome
const mockGetStorage = vi.fn()
declare var globalThis: any

globalThis.chrome = {
  storage: {
    local: {
      get: mockGetStorage
    }
  }
}

// Props por defecto compartidas entre pruebas
const defaultProps = {
  domainName: "Veterinaria",
  onBack: vi.fn(),
  onWelcome: vi.fn(),
  onCreateExam: vi.fn(),
  onCreateExamByParts: vi.fn(),
  onFunctionalExtension: vi.fn(),
  onCreateDiagram: vi.fn(),
  onComponents: vi.fn()
}

// ==========================================
// 3. SUITES DE PRUEBAS DE INTEGRACIÓN
// ==========================================

describe("ContextWorkflowScreen - Integration Tests Suite (Vitest)", () => {
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
    beforeEach(() => {
      mockGetStorage.mockImplementation((fields: any, callback: Function) => callback({}))
    })

    test("Debería completar el flujo completo desde el input hasta la confirmación final y paso al diagrama UML", async () => {
      mockGenerate.mockResolvedValueOnce("Enunciado Generado Exitosamente")

      render(<ContextWorkflowScreen {...defaultProps} />)

      // 1. Comprobar renderizado en Paso 1 (Modo Input)
      expect(screen.getByTestId("stepper")).toHaveTextContent("Paso: 1")
      const input = screen.getByTestId("prompt-input") as HTMLTextAreaElement
      expect(input.value).toContain("Veterinaria")

      // 2. Simular click en Generar Enunciado
      const generateBtn = screen.getByRole("button", { name: /Generar Enunciado/i })
      fireEvent.click(generateBtn)

      expect(mockGenerate).toHaveBeenCalled()

      // 3. Verificar que cambia a la vista de resultados (Paso 1 - result)
      await waitFor(() => {
        expect(screen.getByTestId("split-view")).toBeInTheDocument()
      })

      // 4. Hacer click en Confirmar y Continuar para pasar al Paso 2
      const confirmBtn = screen.getByRole("button", { name: /Confirmar y Continuar/i })
      fireEvent.click(confirmBtn)

      // 5. Verificar que nos encontramos en la pantalla de confirmación (Paso 2)
      expect(screen.getByTestId("stepper")).toHaveTextContent("Paso: 2")
      expect(screen.getByText(/¿Está seguro que desea usar el texto de enunciado generado?/i)).toBeInTheDocument()

      // 6. Confirmar definitivamente para gatillar el callback de creación de diagrama UML
      const finalConfirmBtn = screen.getByRole("button", { name: /Confirmar y pasar al paso 2/i })
      fireEvent.click(finalConfirmBtn)

      expect(defaultProps.onCreateDiagram).toHaveBeenCalledWith("Resultado exitoso de la IA")
    })
  })

  // ------------------------------------------
  // B. FLUJO NEGATIVO / MANEJO DE ERRORES
  // ------------------------------------------
  describe("Flujos Negativos", () => {
    beforeEach(() => {
      mockGetStorage.mockImplementation((fields: any, callback: Function) => callback({}))
    })

    test("Debería mantenerse en la vista 'input' si la llamada a Gemini falla y devuelve null", async () => {
      mockGenerate.mockResolvedValueOnce(null)

      render(<ContextWorkflowScreen {...defaultProps} />)

      const generateBtn = screen.getByRole("button", { name: /Generar Enunciado/i })
      fireEvent.click(generateBtn)

      await waitFor(() => {
        expect(mockGenerate).toHaveBeenCalled()
      })

      // Verificamos que NO avanzó a la vista split-view de resultados
      expect(screen.queryByTestId("split-view")).not.toBeInTheDocument()
      expect(screen.getByTestId("prompt-editor")).toBeInTheDocument()
    })
  })

  // ------------------------------------------
  // C. CASOS LÍMITE (BOUNDARY / EDGE CASES)
  // ------------------------------------------
  describe("Casos Límite", () => {
    test("Debería mapear, filtrar e inyectar múltiples extensiones previas correctas del storage ignorando otros dominios", async () => {
      const fakeStorage = {
        "project_1": { domainName: "veterinaria", extensionFinish: "Texto Extensión 1" },
        "project_2": { domainName: "arquitectura", extensionFinish: "Texto Extensión 2" },
        "project_3": { domainName: "VETERINARIA", customName: "Proyecto Custom", extensionFinish: "Texto Extensión 3" }
      }
      mockGetStorage.mockImplementation((fields: any, callback: Function) => callback(fakeStorage))
      mockGenerate.mockResolvedValueOnce("OK")

      render(<ContextWorkflowScreen {...defaultProps} domainName="Veterinaria" />)

      await waitFor(() => {
        const generateBtn = screen.getByRole("button", { name: /Generar Enunciado/i })
        fireEvent.click(generateBtn)
      })

      // Corregido: Se busca 'veterinaria' en minúsculas coincidiendo con la transformación real del componente
      expect(mockGenerate).toHaveBeenCalledWith(expect.stringContaining("EXTENSIÓN FUNCIONAL PREVIA 1 (veterinaria)"))
      expect(mockGenerate).toHaveBeenCalledWith(expect.stringContaining("Texto Extensión 1"))
      expect(mockGenerate).toHaveBeenCalledWith(expect.stringContaining("EXTENSIÓN FUNCIONAL PREVIA 2 (Proyecto Custom)"))
      expect(mockGenerate).toHaveBeenCalledWith(expect.stringContaining("Texto Extensión 3"))
      
      expect(mockGenerate).not.toHaveBeenCalledWith(expect.stringContaining("Texto Extensión 2"))
    })

    test("No debería romper la aplicación ni lanzar excepciones si chrome.storage es undefined (Entorno Web/No Extensión)", () => {
      globalThis.chrome = undefined

      expect(() => {
        render(<ContextWorkflowScreen {...defaultProps} />)
      }).not.toThrow()

      expect(screen.getByTestId("prompt-editor")).toBeInTheDocument()
    })
  })

  // ------------------------------------------
  // D. FLUJOS ALTERNATIVOS Y NAVEGACIÓN
  // ------------------------------------------
  describe("Variaciones de Flujo y Cancelaciones", () => {
    beforeEach(() => {
      mockGetStorage.mockImplementation((fields: any, callback: Function) => callback({}))
    })

    test("Debería permitir al usuario cancelar en el Paso 2, regresar al Paso 1 y conservar las modificaciones manuales del prompt", async () => {
      mockGenerate.mockResolvedValue("Resultado Correcto")

      render(<ContextWorkflowScreen {...defaultProps} />)

      const inputPaso1 = screen.getByTestId("prompt-input") as HTMLTextAreaElement
      fireEvent.change(inputPaso1, { target: { value: "Prompt modificado manualmente por el docente" } })

      fireEvent.click(screen.getByRole("button", { name: /Generar Enunciado/i }))

      await waitFor(() => {
        expect(screen.getByTestId("split-view")).toBeInTheDocument()
      })

      const inputResult = screen.getByTestId("prompt-result-input") as HTMLTextAreaElement
      fireEvent.change(inputResult, { target: { value: "Prompt modificado por segunda vez" } })

      fireEvent.click(screen.getByRole("button", { name: /Confirmar y Continuar/i }))
      expect(screen.getByTestId("stepper")).toHaveTextContent("Paso: 2")

      const cancelBtn = screen.getByRole("button", { name: /Cancelar y seguir editando enunciado/i })
      fireEvent.click(cancelBtn)

      // Corregido: Tras la cancelación vuelve al Paso 1 pero se mantiene en la split-view de resultados
      expect(screen.getByTestId("stepper")).toHaveTextContent("Paso: 1")
      const inputRegreso = screen.getByTestId("prompt-result-input") as HTMLTextAreaElement
      expect(inputRegreso.value).toBe("Prompt modificado por segunda vez")
    })
  })
})