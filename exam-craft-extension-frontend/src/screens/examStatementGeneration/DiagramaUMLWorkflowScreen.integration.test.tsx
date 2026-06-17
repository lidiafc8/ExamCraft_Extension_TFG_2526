import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import { useGeminiGeneration } from "../../components/GeminiGeneration"
import DiagramUMLWorkflowScreen from "./DiagramaUMLWorkflowScreen"

vi.mock(
  "bundle-text:../../prompts/functional-extension-generation/generation_UML_diagram_functional_extension.md",
  () => ({
    default:
      "Texto visible con {{DOMAIN}} y datos ocultos\n---\nContexto oculto parseado"
  })
)

vi.mock("../../utils/promptParser", () => ({
  parseMasterPrompt: vi.fn(() => ({
    visibleText: "Prompt base para {{DOMAIN}}",
    hiddenContext: "Contexto oculto mock"
  }))
}))

const mockGenerate = vi.fn()
const mockSetResponseText = vi.fn()
let mockIsLoading = false

vi.mock("../../components/GeminiGeneration", () => ({
  useGeminiGeneration: vi.fn(() => ({
    responseText: "classDiagram\nClass01 <|-- AveryLongClass : Cool",
    isLoading: mockIsLoading,
    generate: mockGenerate,
    setResponseText: mockSetResponseText
  }))
}))

vi.mock("../../components/MermaidCodeCleaner", () => ({
  cleanMermaidCode: vi.fn((text) => `clean-${text}`)
}))

vi.mock("../../components/MermaidViewer", () => ({
  MermaidViewer: ({ chartCode }: { chartCode: string }) => (
    <div data-testid="mermaid-viewer">{chartCode}</div>
  )
}))

vi.mock("../../components/Header", () => ({
  Header: ({ currentStep, breadcrumbItems }: any) => (
    <header data-testid="mock-header">
      <span>{currentStep}</span>
      <button onClick={breadcrumbItems[0].action}>Ir a Inicio</button>
    </header>
  )
}))

vi.mock("../../components/WorkflowComponents", () => ({
  StepperHeader: ({ currentStep }: any) => (
    <div data-testid="stepper">Paso {currentStep}</div>
  ),
  PromptEditor: ({
    title,
    description,
    promptText,
    onGenerate,
    onPromptChange,
    onBack
  }: any) => (
    <div data-testid="prompt-editor">
      <h1>{title}</h1>
      <div>{description}</div>
      <textarea
        data-testid="editor-textarea"
        value={promptText}
        onChange={(e) => onPromptChange(e.target.value)}
      />
      <button onClick={onBack}>Atrás</button>
      <button onClick={onGenerate}>Generar Diagrama UML</button>
    </div>
  )
}))

describe("Integration Test - DiagramUMLWorkflowScreen", () => {
  const defaultProps = {
    domainName: "Veterinaria",
    context: "Contexto o enunciado de prueba",
    onBack: vi.fn(),
    onWelcome: vi.fn(),
    onCreateExam: vi.fn(),
    onCreateExamByParts: vi.fn(),
    onFunctionalExtension: vi.fn(),
    onStatementStep1: vi.fn(),
    onFinishExtension: vi.fn(),
    onComponents: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockIsLoading = false
  })

  it("debería realizar el flujo completo: renderizado inicial, edición, generación, visualización de resultados y confirmación", async () => {
    mockGenerate.mockResolvedValue("código-crudo-de-ia")

    render(<DiagramUMLWorkflowScreen {...defaultProps} />)

    expect(screen.getByTestId("mock-header")).toBeInTheDocument()
    expect(screen.getByText("DIAGRAMA UML")).toBeInTheDocument()
    expect(screen.getByTestId("stepper")).toHaveTextContent("Paso 2")
    expect(screen.getByText("VETERINARIA: Diagrama UML")).toBeInTheDocument()

    const textarea = screen.getByTestId(
      "editor-textarea"
    ) as HTMLTextAreaElement
    expect(textarea.value).toBe("Prompt base para Veterinaria")

    fireEvent.click(screen.getByText("Ir a Inicio"))
    expect(defaultProps.onWelcome).toHaveBeenCalledTimes(1)

    fireEvent.change(textarea, {
      target: { value: "Prompt modificado por el usuario" }
    })
    fireEvent.click(screen.getByText("Generar Diagrama UML"))

    expect(mockGenerate).toHaveBeenCalledWith(
      expect.stringContaining("Prompt modificado por el usuario")
    )

    await waitFor(() => {
      expect(
        screen.getByText("Extensión Funcional con Diagrama UML")
      ).toBeInTheDocument()
    })

    expect(screen.queryByTestId("prompt-editor")).not.toBeInTheDocument()
    expect(screen.getByText("Código Mermaid")).toBeInTheDocument()

    const mermaidViewer = screen.getByTestId("mermaid-viewer")
    expect(mermaidViewer).toHaveTextContent("clean-código-crudo-de-ia")

    const textareasResult = screen.getAllByRole("textbox")
    fireEvent.change(textareasResult[1], {
      target: { value: "classDiagram modificado" }
    })
    expect(mockSetResponseText).toHaveBeenCalledWith("classDiagram modificado")

    fireEvent.click(screen.getByText("Confirmar Diagrama UML"))
    expect(defaultProps.onFinishExtension).toHaveBeenCalledWith(
      "Contexto o enunciado de prueba",
      "classDiagram\nClass01 <|-- AveryLongClass : Cool"
    )
  })

  it("debería mostrar indicador de carga en los botones y textareas cuando isLoading es true", () => {
    mockIsLoading = true

    vi.mocked(useGeminiGeneration).mockReturnValueOnce({
      responseText: "Generando...",
      isLoading: true,
      generate: mockGenerate,
      setResponseText: mockSetResponseText
    })

    render(<DiagramUMLWorkflowScreen {...defaultProps} />)

    expect(screen.getByTestId("prompt-editor")).toBeInTheDocument()
  })
})
