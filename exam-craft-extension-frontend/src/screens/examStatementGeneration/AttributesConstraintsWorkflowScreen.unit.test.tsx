import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, cleanup, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AttributesConstraintsWorkflowScreen from "./AttributesConstraintsWorkflowScreen"

const geminiMockControl = {
  responseText: "Propuesta de restricciones simuladas por Gemini IA",
  isLoading: false
}

const mockGenerate = vi.fn()
const mockSetResponseText = vi.fn()

vi.mock("~src/components/GeminiGeneration", () => ({
  useGeminiGeneration: () => ({
    responseText: geminiMockControl.responseText,
    isLoading: geminiMockControl.isLoading,
    setResponseText: mockSetResponseText,
    generate: mockGenerate
  })
}))

vi.mock("~src/components/Header", () => ({
  Header: ({ onWelcome, breadcrumbItems, currentStep }: any) => (
    <header className="app-header" data-testid="real-header">
      <button onClick={onWelcome} aria-label="Ir a inicio">Logo</button>
      <nav>
        {breadcrumbItems.map((item: any) => (
          <button key={item.label} onClick={item.action}>{item.label}</button>
        ))}
        <span>{currentStep}</span>
      </nav>
    </header>
  )
}))

vi.mock("~src/components/FolderExamsSelector", () => ({
  FolderExamSelector: ({
    projects,
    allowedFolders,
    selectedFolder,
    onSelectFolder,
    onSelectProject,
    onBack,
    displayName
  }: any) => {
    if (!selectedFolder) {
      return (
        <div data-testid="selector-folders-view">
          {allowedFolders.map((f: string) => (
            <button key={f} onClick={() => onSelectFolder(f)}>
              {f.toUpperCase()}
            </button>
          ))}
          <button onClick={onBack}>Volver Root</button>
        </div>
      )
    }
    const filtered = projects.filter((p: any) => p.domainName?.toLowerCase() === selectedFolder.toLowerCase())
    return (
      <div data-testid="selector-projects-view">
        <span>Exámenes de {selectedFolder.toUpperCase()}</span>
        {filtered.map((proj: any) => (
          <button key={proj.id} title="Abrir examen" onClick={() => onSelectProject(proj)}>
            {displayName(proj)}
          </button>
        ))}
        <button onClick={() => onSelectFolder("")}>Volver Carpetas</button>
      </div>
    )
  }
}))

vi.mock("~src/components/WorkflowComponents", () => ({
  PromptEditor: ({ title, description, promptText, onPromptChange, onGenerate, onBack }: any) => (
    <div data-testid="real-prompt-editor">
      <h2>{title}</h2>
      <div>{description}</div>
      <textarea
        data-testid="prompt-textarea"
        value={promptText}
        onChange={(e) => onPromptChange(e.target.value)}
      />
      <button onClick={onGenerate}>Generar</button>
      {onBack && <button onClick={onBack}>Volver Editor</button>}
    </div>
  ),
  SplitResultView: ({ promptText, responseText, onPromptChange, onResponseChange, footer }: any) => (
    <div data-testid="real-split-view">
      <textarea data-testid="split-left-prompt" value={promptText} onChange={(e) => onPromptChange(e.target.value)} />
      <textarea data-testid="split-right-response" value={responseText} onChange={(e) => onResponseChange(e.target.value)} />
      {footer && <div data-testid="split-footer">{footer}</div>}
    </div>
  )
}))

vi.mock("~src/components/modals/ConfirmModal", () => ({
  ConfirmModal: ({ title, message, warning, onConfirm, onCancel, confirmLabel }: any) => (
    <div data-testid="real-confirm-modal">
      <h3>{title}</h3>
      <div>{message}</div>
      {warning && <div data-testid="modal-warning">{warning}</div>}
      <button onClick={onCancel}>Cancelar</button>
      <button onClick={onConfirm}>{confirmLabel || "Confirmar"}</button>
    </div>
  )
}))

vi.mock("~src/components/modals/SuccessModal", () => ({
  SuccessModal: ({ title, message, actions }: any) => (
    <div data-testid="real-success-modal">
      <h3>{title}</h3>
      <p>{message}</p>
      {actions.map((act: any) => (
        <button key={act.label} onClick={act.onClick}>{act.label}</button>
      ))}
    </div>
  )
}))

vi.mock("~src/components/modals/DownloadConfirmModal", () => ({
  DownloadConfirmModal: ({ isOpen, onConfirm, onCancel, defaultFileName }: any) => {
    if (!isOpen) return null
    return (
      <div data-testid="real-download-modal">
        <input
          data-testid="download-name-input"
          defaultValue={defaultFileName}
          onChange={() => {}} 
        />
        <button onClick={onCancel}>Cancelar</button>
        <button onClick={() => onConfirm("archivo_test.md")}>Descargar (.md)</button>
      </div>
    )
  }
}))

vi.mock("~src/components/modals/WarningModal", () => ({
  WarningModal: ({ title, message, confirmLabel, onConfirm, onCancel }: any) => (
    <div data-testid="real-warning-modal">
      <h3>{title}</h3>
      <div>{message}</div>
      <button onClick={onCancel}>Cancelar</button>
      <button onClick={onConfirm}>{confirmLabel}</button>
    </div>
  )
}))

const mockSaveToChrome = vi.fn()
vi.mock("~src/utils/chromeStorageUtils", () => ({
  saveToChrome: (...args: any[]) => mockSaveToChrome(...args)
}))

const mockDownloadMarkdown = vi.fn()
vi.mock("~src/utils/downloadUtils", () => ({
  downloadMarkdown: (...args: any[]) => mockDownloadMarkdown(...args)
}))

vi.mock("~src/utils/promptParser", () => ({
  parseMasterPrompt: () => ({
    visibleText: "Prompt base de restricciones",
    hiddenContext: "Contexto estático interno"
  })
}))

vi.mock("~src/components/GeminiGeneration", () => ({
  useGeminiGeneration: () => ({
    responseText: "Propuesta de restricciones simuladas por Gemini IA",
    isLoading: false,
    setResponseText: mockSetResponseText,
    generate: mockGenerate
  })
}))

vi.mock("bundle-text:../../prompts/generation-constraints-attributes/generation_attribute_constraints_from_statement.md", () => ({
  default: "markdown-raw-content"
}))
vi.mock("~src/utils/logUtils", () => ({ getLogConfig: () => ({}) }))
vi.mock("../../css/Cards.css", () => ({}))
vi.mock("../storage/css/FoldersGridScreen.css", () => ({}))

const PRUEBA_PROYECTO_NUEVO = {
  id: "project_veterinaria",
  domainName: "clínica veterinaria",
  customName: "Examen Perros y Gatos",
  extensionFinish: "Enunciado del flujo de la clínica veterinaria",
  attributeConstraints: "" 
}

const PRUEBA_PROYECTO_EXISTENTE = {
  id: "project_ajedrez",
  domainName: "ajedrez",
  customName: "Final Ajedrez Magnvs",
  extensionFinish: "Enunciado completo de ajedrez",
  attributeConstraints: "Restricciones de fichas existentes en el sistema",
  baseClasses: "class Tablero {}"
}

const baseProps = {
  onBack: vi.fn(),
  onWelcome: vi.fn(),
  onCreateExam: vi.fn(),
  onCreateTest: vi.fn(),
  onGoToBaseClass: vi.fn(),
  onCreateExamByParts: vi.fn()
}

const mockGetChromeStorage = vi.fn()
globalThis.chrome = {
  storage: {
    local: {
      get: mockGetChromeStorage
    }
  }
} as any

describe("AttributesConstraintsWorkflowScreen", () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
    
    mockGetChromeStorage.mockImplementation((_keys, callback) => {
      callback({
        project_vet: PRUEBA_PROYECTO_NUEVO,
        project_aje: PRUEBA_PROYECTO_EXISTENTE,
        config_key: { de: "otra cosa que no inicia con project_" }
      })
    })
  })

  describe("Casos Positivos", () => {
    it("carga y filtra los proyectos del Chrome Storage mostrando la vista de carpetas", async () => {
      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      expect(screen.getByTestId("real-header")).toHaveTextContent("RESTRICCIONES DE ATRIBUTOS")
      
      await waitFor(() => {
        expect(screen.getByTestId("selector-folders-view")).toBeInTheDocument()
      })
    })

    it("navega correctamente a la vista de proyectos dentro de una carpeta", async () => {
      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      const folderBtn = await screen.findByRole("button", { name: "CLÍNICA VETERINARIA" })
      await userEvent.click(folderBtn)

      expect(screen.getByTestId("selector-projects-view")).toBeInTheDocument()
      expect(screen.getByText("Exámenes de CLÍNICA VETERINARIA")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Examen Perros y Gatos" })).toBeInTheDocument()
    })

    it("abre el ConfirmModal de forma transparente al elegir un proyecto sin restricciones previas", async () => {
      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      await userEvent.click(await screen.findByRole("button", { name: "CLÍNICA VETERINARIA" }))
      await userEvent.click(screen.getByRole("button", { name: "Examen Perros y Gatos" }))

      expect(screen.getByTestId("real-confirm-modal")).toBeInTheDocument()
      expect(screen.queryByTestId("modal-warning")).not.toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Confirmar" })).toBeInTheDocument()
    })

    it("renderiza el PromptEditor con los textos parseados tras confirmar el proyecto", async () => {
      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      await userEvent.click(await screen.findByRole("button", { name: "CLÍNICA VETERINARIA" }))
      await userEvent.click(screen.getByRole("button", { name: "Examen Perros y Gatos" }))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))

      expect(screen.getByTestId("real-prompt-editor")).toBeInTheDocument()
      expect(screen.getByTestId("prompt-textarea")).toHaveValue("Prompt base de restricciones")
    })

    it("transiciona a la vista SplitResultView de manera exitosa tras invocar la generación con la IA", async () => {
      mockGenerate.mockResolvedValue("Propuesta de restricciones simuladas por Gemini IA")
      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      
      await userEvent.click(await screen.findByRole("button", { name: "CLÍNICA VETERINARIA" }))
      await userEvent.click(screen.getByRole("button", { name: "Examen Perros y Gatos" }))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(screen.getByRole("button", { name: "Generar" }))

      expect(mockGenerate).toHaveBeenCalled()
      expect(screen.getByTestId("real-split-view")).toBeInTheDocument()
      expect(screen.getByTestId("split-right-response")).toHaveValue("Propuesta de restricciones simuladas por Gemini IA")
    })

    it("abre el modal de éxito tras guardar de forma persistente en Chrome Storage", async () => {
      mockGenerate.mockResolvedValue("Propuesta de restricciones simuladas por Gemini IA")
      mockSaveToChrome.mockResolvedValue(true)
      
      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      await userEvent.click(await screen.findByRole("button", { name: "CLÍNICA VETERINARIA" }))
      await userEvent.click(screen.getByRole("button", { name: "Examen Perros y Gatos" }))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(screen.getByRole("button", { name: "Generar" }))

      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))
      
      expect(mockSaveToChrome).toHaveBeenCalledWith("project_veterinaria", expect.any(Object))
      expect(await screen.findByTestId("real-success-modal")).toBeInTheDocument()
    })

    it("procesa la descarga del archivo Markdown disparando los utils nativos", async () => {
      mockGenerate.mockResolvedValue("Resultado")
      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      
      await userEvent.click(await screen.findByRole("button", { name: "CLÍNICA VETERINARIA" }))
      await userEvent.click(screen.getByRole("button", { name: "Examen Perros y Gatos" }))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(screen.getByRole("button", { name: "Generar" }))

      const footerContainer = screen.getByTestId("split-footer")
      const openModalBtn = within(footerContainer).getByRole("button", { name: "Descargar (.md)" })
      await userEvent.click(openModalBtn)

      const downloadModal = screen.getByTestId("real-download-modal")
      expect(downloadModal).toBeInTheDocument()

      const confirmDownloadBtn = within(downloadModal).getByRole("button", { name: "Descargar (.md)" })
      await userEvent.click(confirmDownloadBtn)

      expect(mockDownloadMarkdown).toHaveBeenCalledWith(
        expect.stringContaining("# Restricciones de Atributos - Examen Perros y Gatos"),
        "archivo_test.md"
      )
    })
  })
    describe("Casos Negativos", () => {
    it("cancela el flujo de trabajo y limpia la selección si se declina el ConfirmModal", async () => {
      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      await userEvent.click(await screen.findByRole("button", { name: "CLÍNICA VETERINARIA" }))
      await userEvent.click(screen.getByRole("button", { name: "Examen Perros y Gatos" }))

      expect(screen.getByTestId("real-confirm-modal")).toBeInTheDocument()
      await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))

      expect(screen.queryByTestId("real-confirm-modal")).not.toBeInTheDocument()
      expect(screen.queryByTestId("real-prompt-editor")).not.toBeInTheDocument()
    })

    it("no avanza al layout de resultados si el hook de la IA falla devolviendo un valor vacío o nulo", async () => {
      mockGenerate.mockResolvedValue(null)
      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)

      await userEvent.click(await screen.findByRole("button", { name: "CLÍNICA VETERINARIA" }))
      await userEvent.click(screen.getByRole("button", { name: "Examen Perros y Gatos" }))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(screen.getByRole("button", { name: "Generar" }))

      expect(screen.queryByTestId("real-split-view")).not.toBeInTheDocument()
      expect(screen.getByTestId("real-prompt-editor")).toBeInTheDocument()
    })

    it("captura y lanza una alerta controlada si la llamada de guardado a saveToChrome es rechazada", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
      mockGenerate.mockResolvedValue("Resultado")
      mockSaveToChrome.mockRejectedValue(new Error("Error crítico de cuota de almacenamiento"))

      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      await userEvent.click(await screen.findByRole("button", { name: "CLÍNICA VETERINARIA" }))
      await userEvent.click(screen.getByRole("button", { name: "Examen Perros y Gatos" }))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(screen.getByRole("button", { name: "Generar" }))
      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      expect(alertSpy).toHaveBeenCalledWith("Error crítico de cuota de almacenamiento")
      alertSpy.mockRestore()
    })
  })

  describe("Casos de Límite y Reglas de Negocio", () => {
    it("inyecta la advertencia de reemplazo si el examen ya cuenta con restricciones de atributos registradas", async () => {
      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      await userEvent.click(await screen.findByRole("button", { name: "AJEDREZ" }))
      await userEvent.click(screen.getByRole("button", { name: "Final Ajedrez Magnvs" }))

      const msgRegex = /Este examen ya tiene restricciones de atributos generadas\..*Si continúas, las restricciones anteriores serán reemplazadas por las nuevas\./i
      
      expect(screen.getByTestId("modal-warning")).toHaveTextContent(msgRegex)
      expect(screen.getByRole("button", { name: "Continuar y reemplazar" })).toBeInTheDocument()
    })

    it("dispara un WarningModal al presionar 'Sí' en el SuccessModal si el proyecto carece de clases base", async () => {
      mockGenerate.mockResolvedValue("Resultado")
      mockSaveToChrome.mockResolvedValue(true)

      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      await userEvent.click(await screen.findByRole("button", { name: "CLÍNICA VETERINARIA" }))
      await userEvent.click(screen.getByRole("button", { name: "Examen Perros y Gatos" }))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(screen.getByRole("button", { name: "Generar" }))
      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      await userEvent.click(screen.getByRole("button", { name: "Sí" }))

      expect(screen.getByTestId("real-warning-modal")).toBeInTheDocument()
      expect(screen.getByText("Faltan las Clases Base")).toBeInTheDocument()
    })

    it("llama de manera directa a onCreateTest si el examen posee sus Clases Base tras la confirmación", async () => {
      mockGenerate.mockResolvedValue("Propuesta de restricciones simuladas por Gemini IA")
      mockSaveToChrome.mockResolvedValue(true)

      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      await userEvent.click(await screen.findByRole("button", { name: "AJEDREZ" }))
      await userEvent.click(screen.getByRole("button", { name: "Final Ajedrez Magnvs" }))
      await userEvent.click(screen.getByRole("button", { name: "Continuar y reemplazar" }))
      await userEvent.click(screen.getByRole("button", { name: "Generar" }))
      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      await userEvent.click(screen.getByRole("button", { name: "Sí" }))

      expect(baseProps.onCreateTest).toHaveBeenCalledWith(
        expect.objectContaining({
          baseClass: "class Tablero {}",
          entityRelationships: "",
          constraints: "Propuesta de restricciones simuladas por Gemini IA",
          project: expect.objectContaining({
            id: "project_ajedrez",
            domainName: "ajedrez",
            customName: "Final Ajedrez Magnvs",
            attributeConstraints: "Propuesta de restricciones simuladas por Gemini IA"
          })
        })
      )
    })

    it("ejecuta de manera exitosa los ruteos configurados en el sistema de Breadcrumbs", async () => {
      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      
      await userEvent.click(screen.getByRole("button", { name: "INICIO" }))
      expect(baseProps.onWelcome).toHaveBeenCalled()

      await userEvent.click(screen.getByRole("button", { name: "CREAR EXAMEN" }))
      expect(baseProps.onCreateExam).toHaveBeenCalled()

      await userEvent.click(screen.getByRole("button", { name: "POR PARTES" }))
      expect(baseProps.onCreateExamByParts).toHaveBeenCalled()

      await userEvent.click(screen.getByRole("button", { name: "ENUNCIADO" }))
      expect(baseProps.onBack).toHaveBeenCalled()
    })
  })

  describe("Cobertura de Ramas y Líneas Específicas", () => {
    
    beforeEach(() => {
      geminiMockControl.responseText = "Propuesta de restricciones simuladas por Gemini IA"
      geminiMockControl.isLoading = false
    })

    it("líneas 138-140: detiene el guardado si selectedProject se vuelve inválido inesperadamente", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
      mockGenerate.mockResolvedValue("Resultado")

      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      await userEvent.click(await screen.findByRole("button", { name: "CLÍNICA VETERINARIA" }))
      await userEvent.click(screen.getByRole("button", { name: "Examen Perros y Gatos" }))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(screen.getByRole("button", { name: "Generar" }))

      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      alertSpy.mockRestore()
    })

    it("línea 155: muestra el mensaje por defecto en el alert si el error capturado no es una instancia de Error", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
      mockGenerate.mockResolvedValue("Resultado válido")
      
      mockSaveToChrome.mockRejectedValue("Error de Texto Plano Crítico")

      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      await userEvent.click(await screen.findByRole("button", { name: "CLÍNICA VETERINARIA" }))
      await userEvent.click(screen.getByRole("button", { name: "Examen Perros y Gatos" }))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(screen.getByRole("button", { name: "Generar" }))
      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      expect(alertSpy).toHaveBeenCalledWith("No se pudo actualizar el examen.")
      alertSpy.mockRestore()
    })

    it("líneas 217-219: cierra el SuccessModal y redirige a onWelcome al pulsar 'No'", async () => {
      mockGenerate.mockResolvedValue("Resultado")
      mockSaveToChrome.mockResolvedValue(true)

      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      await userEvent.click(await screen.findByRole("button", { name: "CLÍNICA VETERINARIA" }))
      await userEvent.click(screen.getByRole("button", { name: "Examen Perros y Gatos" }))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(screen.getByRole("button", { name: "Generar" }))
      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      const noButton = screen.getByRole("button", { name: "No" })
      await userEvent.click(noButton)

      expect(baseProps.onWelcome).toHaveBeenCalled()
    })

    it("línea 291: renderiza el estado de carga cuando la IA está generando", async () => {
      geminiMockControl.isLoading = true

      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      await userEvent.click(await screen.findByRole("button", { name: "CLÍNICA VETERINARIA" }))
      await userEvent.click(screen.getByRole("button", { name: "Examen Perros y Gatos" }))
      
      expect(screen.getByTestId("real-confirm-modal")).toBeInTheDocument()
    })

    it("líneas 334-337: redirige a onGoToBaseClass con el proyecto pendiente al confirmar en el WarningModal", async () => {
      mockGenerate.mockResolvedValue("Resultado")
      mockSaveToChrome.mockResolvedValue(true)

      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      await userEvent.click(await screen.findByRole("button", { name: "CLÍNICA VETERINARIA" }))
      await userEvent.click(screen.getByRole("button", { name: "Examen Perros y Gatos" }))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(screen.getByRole("button", { name: "Generar" }))
      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      await userEvent.click(screen.getByRole("button", { name: "Sí" }))

      const confirmWarningBtn = screen.getByRole("button", { name: "Ir a crear Clases Base" })
      await userEvent.click(confirmWarningBtn)

      expect(baseProps.onGoToBaseClass).toHaveBeenCalledWith(
        expect.objectContaining({ id: "project_veterinaria" })
      )
    })

    it("líneas 339-341: limpia el estado y redirige a la pantalla de Inicio al cancelar el WarningModal", async () => {
      mockGenerate.mockResolvedValue("Resultado")
      mockSaveToChrome.mockResolvedValue(true)

      render(<AttributesConstraintsWorkflowScreen {...baseProps} />)
      await userEvent.click(await screen.findByRole("button", { name: "CLÍNICA VETERINARIA" }))
      await userEvent.click(screen.getByRole("button", { name: "Examen Perros y Gatos" }))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(screen.getByRole("button", { name: "Generar" }))
      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      await userEvent.click(screen.getByRole("button", { name: "Sí" }))

      const cancelWarningBtn = screen.getByRole("button", { name: "Cancelar" })
      await userEvent.click(cancelWarningBtn)

      expect(baseProps.onWelcome).toHaveBeenCalled()
    })
  })
})