import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import ContextWorkflowScreen from "./ContextWorkflowScreen"

vi.mock(
  "bundle-text:../../prompts/functional-extension-generation/generation_statement_functional_extension.md",
  () => ({
    default:
      "Texto del Prompt base para {{DOMAIN}}\n---\nContexto Oculto de Plantilla"
  })
)

vi.mock("../../utils/promptParser", () => ({
  parseMasterPrompt: (markdown: string) => ({
    visibleText: markdown.split("\n---\n")[0],
    hiddenContext: markdown.split("\n---\n")[1] || ""
  })
}))

const geminiMockControl = {
  responseText: "Propuesta de enunciado generado por Gemini para pruebas",
  isLoading: false
}

const mockGenerate = vi.fn()
const mockSetResponseText = vi.fn()

vi.mock("../../components/GeminiGeneration", () => ({
  useGeminiGeneration: (config: any) => {
    if (config?.buildLogPayload) {
      config.buildLogPayload("Respuesta Simulada de Log")
    }
    return {
      responseText: geminiMockControl.responseText,
      isLoading: geminiMockControl.isLoading,
      setResponseText: mockSetResponseText,
      generate: mockGenerate
    }
  }
}))

vi.mock("~src/components/Header", () => ({
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
  )
}))

vi.mock("../../components/WorkflowComponents", () => ({
  StepperHeader: ({ steps, currentStep }: any) => (
    <div data-testid="mock-stepper">
      <span>Paso Actual: {currentStep}</span>
      {steps?.map((s: any, i: number) => <span key={i}>{s.label}</span>)}
    </div>
  ),
  PromptEditor: ({
    title,
    description,
    promptText,
    onPromptChange,
    onGenerate,
    onBack,
    isLoading,
    generateLabel
  }: any) => (
    <div data-testid="prompt-editor">
      <h2>{title}</h2>
      <div>{description}</div>
      {/* CORRECCIÓN: El editor ahora renderiza el spinner si está cargando */}
      {isLoading && (
        <div className="loading-spinner" data-testid="spinner-loading" />
      )}
      <textarea
        data-testid="prompt-textarea"
        value={promptText}
        onChange={(e) => onPromptChange(e.target.value)}
      />
      <button onClick={onBack}>Atrás Editor</button>
      <button onClick={onGenerate} disabled={isLoading}>
        {generateLabel || "Generar"}
      </button>
    </div>
  ),
  SplitResultView: ({
    promptText,
    responseText,
    rightTitle,
    onPromptChange,
    onResponseChange,
    onRegenerate,
    isLoading
  }: any) => (
    <div data-testid="split-result-view">
      <h3>{rightTitle}</h3>
      {/* CORRECCIÓN: La vista dividida ahora renderiza el spinner si está cargando */}
      {isLoading && (
        <div className="loading-spinner" data-testid="spinner-loading" />
      )}
      <textarea
        data-testid="prompt-split-input"
        value={promptText}
        onChange={(e) => onPromptChange(e.target.value)}
      />
      <textarea
        data-testid="response-split-input"
        value={responseText}
        onChange={(e) => onResponseChange(e.target.value)}
      />
    </div>
  )
}))

describe("ContextWorkflowScreen", () => {
  const baseProps = {
    domainName: "Veterinaria",
    onBack: vi.fn(),
    onWelcome: vi.fn(),
    onCreateExam: vi.fn(),
    onCreateExamByParts: vi.fn(),
    onFunctionalExtension: vi.fn(),
    onCreateDiagram: vi.fn(),
    onComponents: vi.fn()
  }

  const mockStorageData = {
    project_1: {
      domainName: "Veterinaria",
      extensionFinish: "Contenido de extensión previa guardada",
      customName: "Clínica de Mascotas"
    },
    project_2: {
      domainName: "Ajedrez",
      extensionFinish: "Contenido ajeno"
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    geminiMockControl.isLoading = false
    geminiMockControl.responseText =
      "Propuesta de enunciado generado por Gemini para pruebas"

    globalThis.chrome = {
      storage: {
        local: {
          get: vi.fn((key, callback) => callback(mockStorageData))
        }
      }
    } as any
  })

  afterEach(() => {
    delete (globalThis as any).chrome
  })

  describe("Flujos de Carga, Almacenamiento e Interfaz", () => {
    it("inicializa el componente, procesa el almacenamiento local y formatea extensiones previas", async () => {
      render(<ContextWorkflowScreen {...baseProps} />)

      expect(screen.getByTestId("mock-header")).toBeInTheDocument()
      expect(screen.getByText("VETERINARIA")).toBeInTheDocument()
      expect(globalThis.chrome.storage.local.get).toHaveBeenCalled()
    })

    it("evalúa y procesa el prompt dinámico reemplazando el comodín del dominio", () => {
      render(<ContextWorkflowScreen {...baseProps} />)
      const textarea = screen.getByTestId(
        "prompt-textarea"
      ) as HTMLTextAreaElement
      expect(textarea.value).toContain("Texto del Prompt base para Veterinaria")
    })
  })

  describe("Flujo Principal de Asistente (Wizards y Pasos)", () => {
    it("ejecuta la generación de la IA y transiciona al subpaso de resultados", async () => {
      mockGenerate.mockResolvedValue("Enunciado generado OK")
      render(<ContextWorkflowScreen {...baseProps} />)

      const generateBtn = screen.getByRole("button", {
        name: "Generar Enunciado"
      })
      await userEvent.click(generateBtn)

      expect(mockGenerate).toHaveBeenCalled()
      expect(await screen.findByTestId("split-result-view")).toBeInTheDocument()
      expect(
        screen.getByText("Propuesta de texto de enunciado")
      ).toBeInTheDocument()
    })

    it("ejecuta la acción de retorno (onBack) al pulsar el botón 'Volver' desde la pantalla de resultados", async () => {
      mockGenerate.mockResolvedValue("Enunciado generado OK")
      render(<ContextWorkflowScreen {...baseProps} />)

      const generateBtn = screen.getByRole("button", {
        name: "Generar Enunciado"
      })
      await userEvent.click(generateBtn)
      expect(await screen.findByTestId("split-result-view")).toBeInTheDocument()

      const volverBtn = screen.getByRole("button", { name: "Volver" })
      await userEvent.click(volverBtn)

      expect(baseProps.onBack).toHaveBeenCalledTimes(1)
    })

    it("permite volver a gatillar la generación de la IA desde el panel de resultados", async () => {
      mockGenerate.mockResolvedValue("Enunciado generado OK")
      render(<ContextWorkflowScreen {...baseProps} />)

      await userEvent.click(
        screen.getByRole("button", { name: "Generar Enunciado" })
      )
      expect(await screen.findByTestId("split-result-view")).toBeInTheDocument()

      await userEvent.click(
        screen.getByRole("button", { name: "Volver a generar" })
      )
      expect(mockGenerate).toHaveBeenCalledTimes(2)
    })

    it("avanza al Paso 2 (Confirmación final del diagrama) al pulsar 'Confirmar y Continuar'", async () => {
      mockGenerate.mockResolvedValue("Enunciado generado OK")
      render(<ContextWorkflowScreen {...baseProps} />)

      await userEvent.click(
        screen.getByRole("button", { name: "Generar Enunciado" })
      )
      expect(await screen.findByTestId("split-result-view")).toBeInTheDocument()

      await userEvent.click(
        screen.getByRole("button", { name: "Confirmar y Continuar" })
      )

      expect(await screen.findByText("Confirmación")).toBeInTheDocument()
      expect(
        screen.getByText(
          /¿Está seguro que desea usar el texto de enunciado generado?/i
        )
      ).toBeInTheDocument()
    })

    it("retrocede del paso 2 al paso 1 al cancelar desde la vista de confirmación", async () => {
      mockGenerate.mockResolvedValue("Enunciado generado OK")
      render(<ContextWorkflowScreen {...baseProps} />)

      await userEvent.click(
        screen.getByRole("button", { name: "Generar Enunciado" })
      )
      expect(await screen.findByTestId("split-result-view")).toBeInTheDocument()

      await userEvent.click(
        screen.getByRole("button", { name: "Confirmar y Continuar" })
      )
      await userEvent.click(
        screen.getByRole("button", {
          name: "Cancelar y seguir editando enunciado"
        })
      )

      expect(await screen.findByTestId("split-result-view")).toBeInTheDocument()
    })

    it("finaliza exitosamente el workflow llamando a onCreateDiagram en el paso final", async () => {
      mockGenerate.mockResolvedValue("Texto Final Enunciado")
      render(<ContextWorkflowScreen {...baseProps} />)

      await userEvent.click(
        screen.getByRole("button", { name: "Generar Enunciado" })
      )
      expect(await screen.findByTestId("split-result-view")).toBeInTheDocument()

      await userEvent.click(
        screen.getByRole("button", { name: "Confirmar y Continuar" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: /Confirmar y pasar al paso 2/i })
      )

      expect(baseProps.onCreateDiagram).toHaveBeenCalledWith(
        geminiMockControl.responseText
      )
    })
  })

  describe("Navegación por Breadcrumbs", () => {
    it("mapea y dispara todas las rutas y callbacks de navegación superiores", async () => {
      render(<ContextWorkflowScreen {...baseProps} />)

      await userEvent.click(screen.getByRole("button", { name: "INICIO" }))
      expect(baseProps.onWelcome).toHaveBeenCalled()

      await userEvent.click(
        screen.getByRole("button", { name: "CREAR EXAMEN" })
      )
      expect(baseProps.onCreateExam).toHaveBeenCalled()

      await userEvent.click(screen.getByRole("button", { name: "POR PARTES" }))
      expect(baseProps.onCreateExamByParts).toHaveBeenCalled()

      await userEvent.click(screen.getByRole("button", { name: "ENUNCIADO" }))
      expect(baseProps.onComponents).toHaveBeenCalled()

      await userEvent.click(
        screen.getByRole("button", { name: "EXTENSIÓN FUNCIONAL" })
      )
      expect(baseProps.onFunctionalExtension).toHaveBeenCalled()
    })
  })

  describe("Cobertura Completa de Ramas y Líneas Condicionales", () => {
    it("líneas 261 y 291: renderiza el spinner de carga en el workflow completo cuando la IA está generando", async () => {
      let resolverPromesa: (value: any) => void = () => {}

      mockGenerate.mockImplementation(() => {
        geminiMockControl.isLoading = true
        return new Promise((resolve) => {
          resolverPromesa = resolve
        })
      })

      const { rerender } = render(<ContextWorkflowScreen {...baseProps} />)

      const generateBtn = screen.getByRole("button", {
        name: "Generar Enunciado"
      })
      await userEvent.click(generateBtn)

      rerender(<ContextWorkflowScreen {...baseProps} />)

      let spinner = document.querySelector(".loading-spinner")
      expect(spinner).toBeInTheDocument()

      geminiMockControl.isLoading = false
      resolverPromesa("Enunciado generado OK")

      rerender(<ContextWorkflowScreen {...baseProps} />)
      expect(await screen.findByTestId("split-result-view")).toBeInTheDocument()

      mockGenerate.mockImplementation(() => {
        geminiMockControl.isLoading = true
        return new Promise((resolve) => {
          resolverPromesa = resolve
        })
      })

      const volverGenerarBtn = document.querySelector(".btn-step.generate")
      expect(volverGenerarBtn).toBeTruthy()
      await userEvent.click(volverGenerarBtn!)

      rerender(<ContextWorkflowScreen {...baseProps} />)

      spinner = document.querySelector(".loading-spinner")
      expect(spinner).toBeInTheDocument()

      geminiMockControl.isLoading = false
      resolverPromesa("OK")
    })

    it("línea 69: interrumpe el efecto de inicialización si el prompt base de markdown está vacío o indefinido", async () => {
      const promptMock = vi.mocked(
        await vi.importMock(
          "bundle-text:../../prompts/functional-extension-generation/generation_statement_functional_extension.md"
        )
      )
      const originalDefault = promptMock.default
      promptMock.default = ""

      render(<ContextWorkflowScreen {...baseProps} />)

      const textarea = screen.getByTestId(
        "prompt-textarea"
      ) as HTMLTextAreaElement
      expect(textarea.value).toBe("")

      promptMock.default = originalDefault
    })

    it("cubre la rama alternativa cuando no existe almacenamiento local en la ventana global", () => {
      const originalChrome = globalThis.chrome
      delete (globalThis as any).chrome

      render(<ContextWorkflowScreen {...baseProps} />)
      expect(screen.getByTestId("prompt-editor")).toBeInTheDocument()

      globalThis.chrome = originalChrome
    })

    it("cubre la rama alternativa cuando previousExtensions está vacío o no contiene coincidencias de dominio", async () => {
      globalThis.chrome.storage.local.get = vi.fn((key, callback) =>
        callback({})
      )
      mockGenerate.mockResolvedValue("Resultado")

      render(<ContextWorkflowScreen {...baseProps} />)
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Enunciado" })
      )

      expect(mockGenerate).toHaveBeenCalled()
      expect(screen.getByTestId("split-result-view")).toBeInTheDocument()
    })

    it("permite la edición e interactividad de los campos textarea en el panel SplitResultView", async () => {
      mockGenerate.mockResolvedValue("Resultado")
      render(<ContextWorkflowScreen {...baseProps} />)

      await userEvent.click(
        screen.getByRole("button", { name: "Generar Enunciado" })
      )

      const promptInput = screen.getByTestId("prompt-split-input")
      const responseInput = screen.getByTestId("response-split-input")

      await userEvent.type(promptInput, " Modificado")
      await userEvent.type(responseInput, " Modificado")

      expect(mockSetResponseText).toHaveBeenCalled()
    })
  })
})
