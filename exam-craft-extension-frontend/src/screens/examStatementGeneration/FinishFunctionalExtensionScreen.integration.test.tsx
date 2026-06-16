import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, test, expect, beforeEach, vi } from "vitest"
import "@testing-library/jest-dom"
import FinishFunctionalExtensionScreen from "./FinishFunctionalExtensionScreen" 

vi.mock("~src/components/Header", () => ({
  Header: ({ currentStep }: any) => <div data-testid="header">{currentStep}</div>
}))

vi.mock("../../components/WorkflowComponents", () => ({
  StepperHeader: ({ currentStep }: any) => <div data-testid="stepper-header">Paso: {currentStep}</div>
}))

vi.mock("../../components/MermaidViewer", () => ({
  MermaidViewer: ({ chartCode }: any) => <div data-testid="mermaid-viewer">{chartCode}</div>
}))

vi.mock("~src/components/modals/DownloadConfirmModal", () => ({
  DownloadConfirmModal: ({ isOpen, onConfirm, onCancel, defaultFileName }: any) =>
    isOpen ? (
      <div data-testid="download-modal">
        <span>{defaultFileName}</span>
        <button onClick={() => onConfirm("archivo_personalizado.md")}>Confirmar Descarga</button>
        <button onClick={onCancel}>Cancelar</button>
      </div>
    ) : null
}))

vi.mock("~src/components/modals/SaveModal", () => ({
  SaveModal: ({ onSuccess, onClose, buildPayload }: any) => (
    <div data-testid="save-modal">
      <button
        onClick={() => {
          buildPayload("Mi Examen Custom")
          onSuccess()
        }}
      >
        Confirmar Guardado
      </button>
      <button onClick={onClose}>Cerrar</button>
    </div>
  )
}))

const mockDownloadMarkdown = vi.fn()
vi.mock("~src/utils/downloadUtils", () => ({
  downloadMarkdown: (...args: any[]) => mockDownloadMarkdown(...args)
}))

const defaultProps = {
  domainName: "Ajedrez",
  extensionStatement: "Enunciado extendido sobre el juego de ajedrez.",
  extensionMermaid: "classDiagram\nClass01 <|-- AveryLongClass",
  onBack: vi.fn(),
  onWelcome: vi.fn(),
  onCreateExam: vi.fn(),
  onCreateExamByParts: vi.fn(),
  onFunctionalExtension: vi.fn(),
  onStatementStep1: vi.fn(),
  onComponents: vi.fn()
}


describe("FinishFunctionalExtensionScreen - Integration Tests Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Renderizado Inicial", () => {
    test("Debería renderizar la información de la extensión de forma correcta (Enunciado y Diagrama)", () => {
      render(<FinishFunctionalExtensionScreen {...defaultProps} />)

      expect(screen.getByTestId("header")).toHaveTextContent("PROPUESTA FINAL")
      expect(screen.getByTestId("stepper-header")).toHaveTextContent("Paso: 3")

      expect(screen.getByText("AJEDREZ: Resultado Final")).toBeInTheDocument()

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement
      expect(textarea.value).toBe("Enunciado extendido sobre el juego de ajedrez.")
      expect(textarea).toHaveAttribute("readOnly")
      expect(screen.getByTestId("mermaid-viewer")).toHaveTextContent(/classDiagram\s+Class01\s+<\|--\s+AveryLongClass/)
    })

    test("Debería mostrar un mensaje de contingencia si no se proporciona código Mermaid", () => {
      render(<FinishFunctionalExtensionScreen {...defaultProps} extensionMermaid="" />)

      expect(screen.queryByTestId("mermaid-viewer")).not.toBeInTheDocument()
      expect(screen.getByText("No se pudo extraer el diagrama del texto.")).toBeInTheDocument()
    })
  })

  describe("Interacciones y Flujos de Modales", () => {
    test("Debería permitir regresar a la pantalla anterior mediante el botón 'Volver a UML'", () => {
      render(<FinishFunctionalExtensionScreen {...defaultProps} />)

      const backBtn = screen.getByRole("button", { name: /Volver a UML/i })
      fireEvent.click(backBtn)

      expect(defaultProps.onBack).toHaveBeenCalledTimes(1)
    })

    test("Debería abrir el modal de descarga, generar el contenido Markdown estructurado y cerrarse al confirmar", () => {
      render(<FinishFunctionalExtensionScreen {...defaultProps} />)

      const downloadBtn = screen.getByRole("button", { name: /Descargar \(.md\)/i })
      fireEvent.click(downloadBtn)

      expect(screen.getByTestId("download-modal")).toBeInTheDocument()
      expect(screen.getByText("Extension_Funcional_Ajedrez")).toBeInTheDocument()

      const confirmDownloadBtn = screen.getByRole("button", { name: /Confirmar Descarga/i })
      fireEvent.click(confirmDownloadBtn)

      expect(mockDownloadMarkdown).toHaveBeenCalledWith(
        expect.stringContaining("# Extensión Funcional - Ajedrez\n\n## Enunciado\nEnunciado extendido sobre el juego de ajedrez."),
        "archivo_personalizado.md"
      )
      expect(mockDownloadMarkdown).toHaveBeenCalledWith(
        expect.stringContaining("```mermaid\nclassDiagram\nClass01 <|-- AveryLongClass\n```"),
        "archivo_personalizado.md"
      )

      expect(screen.queryByTestId("download-modal")).not.toBeInTheDocument()
    })

    test("Debería abrir el modal de guardado y redirigir al inicio mediante onWelcome tras una confirmación exitosa", async () => {
      render(<FinishFunctionalExtensionScreen {...defaultProps} />)

      const saveBtn = screen.getByRole("button", { name: /Guardar/i })
      fireEvent.click(saveBtn)

      expect(screen.getByTestId("save-modal")).toBeInTheDocument()

      const confirmSaveBtn = screen.getByRole("button", { name: /Confirmar Guardado/i })
      fireEvent.click(confirmSaveBtn)

      expect(defaultProps.onWelcome).toHaveBeenCalledTimes(1)
    })
  })
})