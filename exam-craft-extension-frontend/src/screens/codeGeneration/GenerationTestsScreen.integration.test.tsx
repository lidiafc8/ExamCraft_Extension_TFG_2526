import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi, describe, it, expect, beforeEach } from "vitest"
import "@testing-library/jest-dom"
import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import GenerationTestScreen from "./GenerationTestsScreen"

expect.extend(jestDomMatchers)

// =========================================================
// MOCKS GLOBALES Y DE ENTORNO EXTENSIÓN CHROME
// =========================================================
const mockGetChrome = vi.fn()
vi.stubGlobal("chrome", {
  storage: {
    local: {
      get: mockGetChrome
    }
  }
})

// Mocks de los módulos de utilidades
vi.mock("~src/utils/chromeStorageUtils", () => ({
  saveToChrome: vi.fn()
}))

vi.mock("~src/utils/downloadUtils", () => ({
  downloadMarkdown: vi.fn()
}))

vi.mock("~src/utils/promptParser", () => ({
  parseMasterPrompt: vi.fn(() => ({
    visibleText: "Prompt base para el dominio {{DOMAIN}}",
    hiddenContext: "Contexto oculto parseado"
  }))
}))

// Mock de hook personalizado de IA
const mockGenerate = vi.fn()
const mockSetResponseText = vi.fn()
let mockResponseText = ""
let mockIsLoading = false

vi.mock("~src/components/GeminiGeneration", () => ({
  useGeminiGeneration: () => ({
    responseText: mockResponseText,
    isLoading: mockIsLoading,
    setResponseText: mockSetResponseText,
    generate: mockGenerate
  })
}))

// Mocks de Subcomponentes visuales
vi.mock("~src/components/Header", () => ({
  Header: ({ onWelcome, breadcrumbItems, currentStep }: any) => (
    <header data-testid="header-mock">
      <span data-testid="current-step">{currentStep}</span>
      <button onClick={onWelcome}>Logo Inicio</button>
      <div data-testid="breadcrumbs">
        {breadcrumbItems.map((item: any) => (
          <button key={item.label} onClick={item.action}>
            {item.label}
          </button>
        ))}
      </div>
    </header>
  )
}))

vi.mock("~src/components/WorkflowComponents", () => ({
  PromptEditor: ({ title, promptText, generateLabel, onPromptChange, onGenerate, onBack }: any) => (
    <div data-testid="prompt-editor-mock">
      <h2>{title}</h2>
      <textarea 
        data-testid="prompt-textarea" 
        value={promptText} 
        onChange={(e) => onPromptChange(e.target.value)} 
      />
      <button onClick={onGenerate}>{generateLabel}</button>
      <button onClick={onBack}>Atrás Editor</button>
    </div>
  ),
  SplitResultView: ({ promptText, responseText, onRegenerate, footer }: any) => (
    <div data-testid="split-result-mock">
      <div data-testid="result-prompt">{promptText}</div>
      <div data-testid="result-code">{responseText}</div>
      <button onClick={onRegenerate}>Regenerar Split</button>
      <div data-testid="footer-container">{footer}</div>
    </div>
  )
}))

vi.mock("~src/components/modals/DownloadConfirmModal", () => ({
  DownloadConfirmModal: ({ isOpen, defaultFileName, onConfirm, onCancel }: any) => isOpen ? (
    <div data-testid="download-modal-mock">
      <span>{defaultFileName}</span>
      <button onClick={() => onConfirm("CustomFile.java")}>Confirmar Descarga</button>
      <button onClick={onCancel}>Cancelar Descarga</button>
    </div>
  ) : null
}))

vi.mock("~src/components/modals/SuccessModal", () => ({
  SuccessModal: ({ title, actions }: any) => (
    <div data-testid="success-modal-mock">
      <h3>{title}</h3>
      {actions.map((act: any) => (
        <button key={act.label} onClick={act.onClick}>{act.label}</button>
      ))}
    </div>
  )
}))

vi.mock("~src/components/modals/ConfirmModal", () => ({
  ConfirmModal: ({ title, message, onConfirm, onCancel }: any) => (
    <div data-testid="confirm-error-modal-mock">
      <h3>{title}</h3>
      <p>{message}</p>
      <button onClick={onConfirm}>Aceptar Error</button>
      <button onClick={onCancel}>Cancelar Error</button>
    </div>
  )
}))

// =========================================================
// CONFIGURACIÓN DE PROPS BASE
// =========================================================
const defaultProps = {
  initialData: {
    project: {
      id: "proj_123",
      domainName: "Ajedrez Torneo",
      extensionFinish: "Enunciado del examen final de ajedrez",
      baseClasses: "```java\npackage es.us.dp1.chess.tournament.model;\npublic class Partida {}\n```"
    },
    constraints: "Restricción de atributos: edad > 18",
    entityRelationships: "Relación: Torneo 1->* Partida",
    baseClass: "",
    targetType: undefined
  },
  source: "attributes" as const,
  onBack: vi.fn(),
  onCreateExamByParts: vi.fn(),
  onWelcome: vi.fn(),
  onCreateExam: vi.fn(),
  onCodeGeneration: vi.fn(),
  onComponents: vi.fn()
}

describe("Integración: GenerationTestScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResponseText = ""
    mockIsLoading = false
  })

  // =========================================================
  // CASOS POSITIVOS: RENDERIZADO VISUAL E INICIALIZACIÓN
  // =========================================================
  describe("Casos Positivos: Renderizado e Inicialización", () => {
    it("inicializa en el paso 'input' y procesa el prompt inyectando el dominio", () => {
      render(<GenerationTestScreen {...defaultProps} />)

      expect(screen.getByTestId("prompt-editor-mock")).toBeInTheDocument()
      expect(screen.getByText("Configuración del Test")).toBeInTheDocument()
      
      const textarea = screen.getByTestId("prompt-textarea")
      expect(textarea).toHaveValue("Prompt base para el dominio ajedrez torneo")
    })

    it("pasa la configuración correcta de migas de pan y el título correspondiente a Restricciones (Test1)", () => {
      render(<GenerationTestScreen {...defaultProps} source="attributes" />)

      expect(screen.getByTestId("current-step")).toHaveTextContent("TESTS DE RESTRICCIONES")
      
      const breadcrumbs = screen.getByTestId("breadcrumbs")
      expect(breadcrumbs).toHaveTextContent("INICIO")
      expect(breadcrumbs).toHaveTextContent("CREAR EXAMEN")
      expect(breadcrumbs).toHaveTextContent("POR PARTES")
      expect(breadcrumbs).toHaveTextContent("ENUNCIADO")
      expect(breadcrumbs).toHaveTextContent("RESTRICCIONES")
    })

    it("conmuta las etiquetas de migas de pan y título cuando el origen es Relaciones (Test2)", () => {
      render(<GenerationTestScreen {...defaultProps} source="entityRelationships" />)

      expect(screen.getByTestId("current-step")).toHaveTextContent("TESTS DE RELACIONES")
      expect(screen.getByText("RELACIONES ENTRE ENTIDADES")).toBeInTheDocument()
    })
  })

  // =========================================================
  // CASOS POSITIVOS: FLUJOS DE ACCIONES Y CICLO DE VIDA
  // =========================================================
  describe("Casos Positivos: Flujos de Generación, Guardado y Descarga", () => {
    it("realiza la llamada a la IA, limpia los bloques markdown de la respuesta y avanza al paso de resultados", async () => {
      mockResponseText = "```java\npublic class Test1 { /* test */ }\n```"
      mockGenerate.mockResolvedValue("```java\npublic class Test1 { /* test */ }\n```")

      render(<GenerationTestScreen {...defaultProps} />)

      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      expect(mockGenerate).toHaveBeenCalled()
      expect(mockSetResponseText).toHaveBeenCalledWith("public class Test1 { /* test */ }")
      
      // Forzamos actualización simulando el cambio de estado del hook para la vista de resultados
      mockResponseText = "public class Test1 { /* test */ }"
      render(<GenerationTestScreen {...defaultProps} />)
      
      expect(screen.getByTestId("split-result-mock")).toBeInTheDocument()
      expect(screen.getByText("Código generado para Test1.java")).toBeInTheDocument()
    })

    it("ejecuta el guardado en el almacenamiento local de Chrome unificándolo con los datos previos", async () => {
      const { saveToChrome } = await import("~src/utils/chromeStorageUtils")
      
      // 1. Configuramos el mock de la respuesta de la IA y el almacenamiento de Chrome
      mockResponseText = "public class Test1 {}"
      mockGenerate.mockResolvedValue("public class Test1 {}")
      
      mockGetChrome.mockImplementation((keys, callback) => {
        callback({ proj_123: { testPartsMap: {}, customName: "Preexistente" } })
      })

      render(<GenerationTestScreen {...defaultProps} />)
      
      // 2. Ejecutamos la generación para forzar la transición al estado "result"
      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      // 3. Buscamos de forma asíncrona el botón Guardar una vez cambie el paso
      const btnGuardar = await screen.findByRole("button", { name: "Guardar" })
      await userEvent.click(btnGuardar)

      // 4. Verificaciones finales del guardado y éxito
      expect(mockGetChrome).toHaveBeenCalledWith(["proj_123"], expect.any(Function))
      expect(saveToChrome).toHaveBeenCalledWith("proj_123", expect.objectContaining({
        customName: "Preexistente",
        testPartsMap: {
          test1_attributes: { fileName: "Test1.java", code: "public class Test1 {}" }
        }
      }))
      
      expect(screen.getByTestId("success-modal-mock")).toBeInTheDocument()
    })

    it("abre el modal de descarga de archivos, permite confirmar y dispara la utilidad de descarga", async () => {
      const { downloadMarkdown } = await import("~src/utils/downloadUtils")
      
      // 1. Preparamos el mock de la IA para que devuelva código válido
      mockResponseText = "public class Test1 {}"
      mockGenerate.mockResolvedValue("public class Test1 {}")

      render(<GenerationTestScreen {...defaultProps} />)

      // 2. Disparamos la generación para pasar a la pantalla de resultados
      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      // 3. Esperamos asíncronamente a que el botón "Descargar (.md)" aparezca en el DOM
      const btnDescargar = await screen.findByRole("button", { name: "Descargar (.md)" })
      await userEvent.click(btnDescargar)

      // 4. El modal debe estar abierto en este punto
      expect(screen.getByTestId("download-modal-mock")).toBeInTheDocument()

      // 5. Confirmamos la descarga en el modal mockeado
      const btnConfirmar = screen.getByRole("button", { name: "Confirmar Descarga" })
      await userEvent.click(btnConfirmar)

      // 6. Verificamos que se ejecute la descarga física y se cierre el modal
      expect(downloadMarkdown).toHaveBeenCalledWith("public class Test1 {}", "CustomFile.java")
      expect(screen.queryByTestId("download-modal-mock")).not.toBeInTheDocument()
    })
  })

  // =========================================================
  // CASOS NEGATIVOS Y MANEJO DE ERRORES
  // =========================================================
  describe("Casos Negativos: Errores e Interrupciones", () => {
    it("cancela el avance si la respuesta del motor de IA resulta vacía", async () => {
      mockGenerate.mockResolvedValue("") // Falla la generación

      render(<GenerationTestScreen {...defaultProps} />)
      
      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      expect(mockSetResponseText).not.toHaveBeenCalled()
      expect(screen.queryByTestId("split-result-mock")).not.toBeInTheDocument()
    })

    it("muestra el diálogo de error si el método de guardado en Chrome es rechazado", async () => {
      const { saveToChrome } = await import("~src/utils/chromeStorageUtils")
      
      // 1. Preparamos los mocks para que la IA devuelva algo válido y falle el guardado
      mockResponseText = "public class Test1 {}"
      mockGenerate.mockResolvedValue("public class Test1 {}")
      mockGetChrome.mockImplementation((keys, callback) => callback({ proj_123: {} }))
      vi.mocked(saveToChrome).mockRejectedValue(new Error("Error de Cuota Excedida"))

      render(<GenerationTestScreen {...defaultProps} />)

      // 2. Transicionamos de la pantalla 'input' a la de 'result' ejecutando la generación
      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      // 3. Esperamos a que el botón "Guardar" aparezca en el DOM gracias a la respuesta de la IA
      const btnGuardar = await screen.findByRole("button", { name: "Guardar" })
      await userEvent.click(btnGuardar)

      // 4. Verificamos que aparezca el modal de error con el mensaje capturado
      await waitFor(() => {
        expect(screen.getByTestId("confirm-error-modal-mock")).toBeInTheDocument()
        expect(screen.getByText("Error de Cuota Excedida")).toBeInTheDocument()
      })
    })
  })

  // =========================================================
  // CASOS LÍMITE (EDGE CASES)
  // =========================================================
  describe("Casos Límite", () => {
    it("evita el colapso del sistema si 'initialData' o el proyecto se encuentran ausentes", () => {
      const corruptProps = { ...defaultProps, initialData: null }

      expect(() => {
        render(<GenerationTestScreen {...corruptProps} />)
      }).not.toThrow()

      expect(screen.getByTestId("prompt-editor-mock")).toBeInTheDocument()
    })

    it("utiliza la configuración del dominio de veterinaria si el nombre del dominio incluye palabras clave", async () => {
      const vetProps = {
        ...defaultProps,
        initialData: {
          ...defaultProps.initialData,
          project: {
            ...defaultProps.initialData.project,
            domainName: "Sistema de clínica veterinaria"
          }
        }
      }

      render(<GenerationTestScreen {...vetProps} />)
      
      // 1. Agregamos el 'await' correspondiente al click del usuario
      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      // 2. Envolvemos en un waitFor para esperar que se resuelva la lógica asíncrona del componente
      await waitFor(() => {
        expect(mockGenerate).toHaveBeenCalledWith(
          expect.stringContaining("org.springframework.samples.petclinic")
        )
      })
    })
  })
})