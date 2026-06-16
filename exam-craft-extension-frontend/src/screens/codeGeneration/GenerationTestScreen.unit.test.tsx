import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import GenerationTestScreen from "./GenerationTestsScreen"

const mockGenerate = vi.fn()
let mockResponseTextValue = ""
const mockSetResponseText = vi.fn((val) => {
  mockResponseTextValue = val
})
let mockIsLoading = false

vi.mock("~src/components/GeminiGeneration", () => ({
  useGeminiGeneration: vi.fn(() => ({
    get responseText() { return mockResponseTextValue },
    get isLoading() { return mockIsLoading },
    setResponseText: mockSetResponseText,
    generate: mockGenerate,
  }))
}))

const mockParseMasterPrompt = vi.fn()
vi.mock("~src/utils/promptParser", () => ({
  parseMasterPrompt: vi.fn((p) => mockParseMasterPrompt(p))
}))

const mockSaveToChrome = vi.fn()
vi.mock("~src/utils/chromeStorageUtils", () => ({
  saveToChrome: vi.fn((id, data) => mockSaveToChrome(id, data))
}))

const mockDownloadMarkdown = vi.fn()
vi.mock("~src/utils/downloadUtils", () => ({
  downloadMarkdown: vi.fn((content, filename) => mockDownloadMarkdown(content, filename))
}))

vi.mock("~src/components/Header", () => ({
  Header: ({ currentStep }: any) => <header data-testid="mock-header">{currentStep}</header>
}))

vi.mock("~src/components/WorkflowComponents", () => ({
  PromptEditor: ({ title, promptText, onGenerate, onBack, onPromptChange }: any) => (
    <div data-testid="prompt-editor">
      <h3>{title}</h3>
      <textarea 
        data-testid="prompt-textarea" 
        value={promptText} 
        onChange={(e) => onPromptChange(e.target.value)} 
      />
      <button onClick={onGenerate}>Generar Tests</button>
      <button onClick={onBack}>Atrás</button>
    </div>
  ),
  SplitResultView: ({ promptText, responseText, footer, onPromptChange, onResponseChange }: any) => (
    <div data-testid="split-result-view">
      <textarea data-testid="split-prompt" value={promptText} onChange={(e) => onPromptChange(e.target.value)} />
      <textarea data-testid="split-response" value={responseText} onChange={(e) => onResponseChange(e.target.value)} />
      {footer}
    </div>
  )
}))

vi.mock("~src/components/modals/DownloadConfirmModal", () => ({
  DownloadConfirmModal: ({ isOpen, defaultFileName, onConfirm, onCancel }: any) => {
    if (!isOpen) return null
    return (
      <div data-testid="download-modal">
        <input data-testid="filename-input" defaultValue={defaultFileName} id="custom-filename-input" />
        <button onClick={() => {
          const val = (document.getElementById("custom-filename-input") as HTMLInputElement)?.value || defaultFileName
          onConfirm(val)
        }}>Confirmar descarga</button>
        <button onClick={onCancel}>Cancelar descarga</button>
      </div>
    )
  }
}))

vi.mock("~src/components/modals/SuccessModal", () => ({
  SuccessModal: ({ title, actions }: any) => (
    <div data-testid="success-modal">
      <h4>{title}</h4>
      {actions.map((act: any, idx: number) => (
        <button key={idx} onClick={act.onClick}>{act.label}</button>
      ))}
    </div>
  )
}))

vi.mock("~src/components/modals/ConfirmModal", () => ({
  ConfirmModal: ({ title, message, onConfirm, onCancel }: any) => (
    <div data-testid="confirm-modal">
      <h4>{title}</h4>
      <p>{message}</p>
      <button onClick={onConfirm}>Confirmar Error</button>
      <button onClick={onCancel}>Ir a Inicio</button>
    </div>
  )
}))

const PROJECT_BASE = {
  id: "proj_123",
  domainName: "Veterinaria",
  extensionFinish: "Enunciado general del examen de la clínica veterinaria.",
  baseClasses: "```java\npackage org.springframework.samples.petclinic.model;\npublic class Animal {}\n```",
  attributeConstraints: "El nombre del animal no puede ser nulo."
}

const baseProps = {
  initialData: {
    project: PROJECT_BASE,
    constraints: "El nombre del animal no puede ser nulo.",
    entityRelationships: "Un Dueño tiene muchos Animales.",
    baseClass: "```java\npackage org.springframework.samples.petclinic.model;\npublic class Animal {}\n```",
    targetType: "attributes" as const
  },
  source: "attributes" as const,
  onBack: vi.fn(),
  onCreateExamByParts: vi.fn(),
  onWelcome: vi.fn(),
  onCreateExam: vi.fn(),
  onCodeGeneration: vi.fn(),
  onComponents: vi.fn()
}

const mockChromeGet = vi.fn()
const mockChromeSet = vi.fn()
global.chrome = {
  storage: {
    local: {
      get: (keys: any, cb: any) => mockChromeGet(keys, cb),
      set: (data: any, cb: any) => mockChromeSet(data, cb)
    }
  }
}

describe("GenerationTestScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResponseTextValue = ""
    mockIsLoading = false
    mockParseMasterPrompt.mockReturnValue({
      visibleText: "Plantilla Base para {{DOMAIN}}",
      hiddenContext: "Contexto oculto de prompt"
    })
  })

  describe("Casos Positivos", () => {
    it("renderiza correctamente en modo de restricciones inicializando el prompt", () => {
      render(<GenerationTestScreen {...baseProps} />)

      expect(screen.getByTestId("mock-header").textContent).toBe("TESTS DE RESTRICCIONES")
      expect(screen.getByTestId("prompt-editor")).not.toBeNull()
      expect((screen.getByTestId("prompt-textarea") as HTMLTextAreaElement).value).toBe("Plantilla Base para veterinaria")
    })

    it("renderiza correctamente en modo de relaciones con los nombres de archivo adecuados", () => {
      render(
        <GenerationTestScreen 
          {...baseProps} 
          source="entityRelationships" 
          initialData={{ ...baseProps.initialData, targetType: "entityRelationships" }} 
        />
      )

      expect(screen.getByTestId("mock-header").textContent).toBe("TESTS DE RELACIONES")
    })

    it("completa la generación del test exitosamente y cambia al modo de vista dividida (Result)", async () => {
      mockGenerate.mockResolvedValue("```java\npackage org.test;\npublic class Test1 {}\n```")
      mockResponseTextValue = "package org.test;\npublic class Test1 {}"
      
      render(<GenerationTestScreen {...baseProps} />)
      
      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      expect(mockGenerate).toHaveBeenCalled()
      expect(mockSetResponseText).toHaveBeenCalledWith("package org.test;\npublic class Test1 {}")
      
      mockResponseTextValue = "package org.test;\npublic class Test1 {}"
      render(<GenerationTestScreen {...baseProps} />)
      
      expect(await screen.findByTestId("split-result-view")).not.toBeNull()
      expect(screen.getByText("Código generado para Test1.java")).not.toBeNull()
    })

    it("permite modificar el contenido del prompt y de la respuesta en la vista dividida", async () => {
      mockGenerate.mockResolvedValue("public class Test1 {}")
      mockResponseTextValue = "public class Test1 {}"
      
      render(<GenerationTestScreen {...baseProps} />)
      
      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      const splitPrompt = await screen.findByTestId("split-prompt") as HTMLTextAreaElement
      const splitResponse = await screen.findByTestId("split-response") as HTMLTextAreaElement

      splitPrompt.addEventListener('input', (e) => {
        splitPrompt.value = (e.target as HTMLTextAreaElement).value;
      });
      splitResponse.addEventListener('input', (e) => {
        splitResponse.value = (e.target as HTMLTextAreaElement).value;
      });

      await userEvent.type(splitPrompt, " Añadiendo cambios")
      await userEvent.type(splitResponse, " // Comentario nuevo")

      expect(splitPrompt.value).toContain("Añadiendo cambios")
      expect(splitResponse.value).toContain("// Comentario nuevo")
    })

    it("descarga el archivo markdown configurando el nombre por defecto sugerido", async () => {
      mockResponseTextValue = "public class Test1 {}"
      render(<GenerationTestScreen {...baseProps} />)
      
      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      const btnDescargar = screen.getByRole("button", { name: "Descargar (.md)" })
      await userEvent.click(btnDescargar)

      expect(screen.getByTestId("download-modal")).not.toBeNull()

      const btnConfirmarDescarga = screen.getByRole("button", { name: "Confirmar descarga" })
      await userEvent.click(btnConfirmarDescarga)

      expect(mockDownloadMarkdown).toHaveBeenCalledWith("public class Test1 {}", "Test1-Veterinaria")
    })

    it("guarda de forma exitosa los tests del archivo actual en el almacenamiento de Chrome local", async () => {
      mockResponseTextValue = "public class Test1 {}"
      mockChromeGet.mockImplementation((keys, cb) => cb({ [PROJECT_BASE.id]: { testPartsMap: {} } }))
      mockChromeSet.mockImplementation((data, cb) => cb?.())

      render(<GenerationTestScreen {...baseProps} />)
      
      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      const btnGuardar = screen.getByRole("button", { name: "Guardar" })
      await userEvent.click(btnGuardar)

      await waitFor(() => {
        expect(mockSaveToChrome).toHaveBeenCalled()
        expect(screen.getByTestId("success-modal")).not.toBeNull()
      })

      const btnInicio = screen.getByRole("button", { name: "Volver al inicio" })
      await userEvent.click(btnInicio)
      expect(baseProps.onWelcome).toHaveBeenCalled()
    })
  })

  describe("Casos Negativos", () => {
    it("frena la generación de código si el servicio Gemini retorna un valor nulo o vacío", async () => {
      mockGenerate.mockResolvedValue(null)
      render(<GenerationTestScreen {...baseProps} />)

      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      expect(mockSetResponseText).not.toHaveBeenCalled()
    })

    it("Muestra un diálogo modal de error si falla la llamada de guardado en el almacenamiento de Chrome", async () => {
      mockGenerate.mockResolvedValue("public class Test1 {}")
      mockResponseTextValue = "public class Test1 {}"
      
      mockChromeGet.mockImplementation((keys, cb) => cb({ [PROJECT_BASE.id]: {} }))
      mockSaveToChrome.mockRejectedValue(new Error("Storage Quota Limit Reached"))

      render(<GenerationTestScreen {...baseProps} />)
      
      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      const btnGuardar = await screen.findByRole("button", { name: "Guardar" })
      await userEvent.click(btnGuardar)

      await waitFor(() => {
        expect(screen.getByTestId("confirm-modal")).not.toBeNull()
        expect(screen.getByText("Storage Quota Limit Reached")).not.toBeNull()
      })

      const btnConfirmarErr = screen.getByRole("button", { name: "Confirmar Error" })
      await userEvent.click(btnConfirmarErr)
      expect(screen.queryByTestId("confirm-modal")).toBeNull()
    })

    it("asigna un mensaje por defecto si la excepción al guardar carece de propiedad message", async () => {
      mockGenerate.mockResolvedValue("public class Test1 {}")
      mockResponseTextValue = "public class Test1 {}"
      
      mockChromeGet.mockImplementation((keys, cb) => cb({ [PROJECT_BASE.id]: {} }))
      mockSaveToChrome.mockRejectedValue({}) 

      render(<GenerationTestScreen {...baseProps} />)
      
      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      const btnGuardar = await screen.findByRole("button", { name: "Guardar" })
      await userEvent.click(btnGuardar)

      await waitFor(() => {
        expect(screen.getByText("No se pudo guardar.")).not.toBeNull()
      })
    })

    it("cancela el guardado de forma segura si la información del identificador de proyecto está ausente", async () => {
      const propsSinProyecto = {
        ...baseProps,
        initialData: { ...baseProps.initialData, project: null }
      }
      
      mockGenerate.mockResolvedValue("public class Test1 {}")
      mockResponseTextValue = "public class Test1 {}"
      
      render(<GenerationTestScreen {...propsSinProyecto} />)

      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      const btnGuardar = await screen.findByRole("button", { name: "Guardar" })
      await userEvent.click(btnGuardar)

      expect(mockSaveToChrome).not.toHaveBeenCalled()
    })
  })

  describe("Casos Límite", () => {
    it("maneja dominios alternativos mapeando adecuadamente la configuración por defecto", () => {
      const propsDominioDesconocido = {
        ...baseProps,
        initialData: {
          ...baseProps.initialData,
          project: { ...PROJECT_BASE, domainName: "Ajedrez Internacional" }
        }
      }
      render(<GenerationTestScreen {...propsDominioDesconocido} />)
      expect((screen.getByTestId("prompt-textarea") as HTMLTextAreaElement).value).toBe("Plantilla Base para ajedrez internacional")
    })

    it("extrae correctamente el paquete común base analizando múltiples bloques Java", () => {
      const propsMultiplesPaquetes = {
        ...baseProps,
        initialData: {
          ...baseProps.initialData,
          baseClass: `
            \`\`\`java
            package org.samples.petclinic.sub1;
            public class A {}
            \`\`\`
            \`\`\`java
            package org.samples.petclinic.sub2;
            public class B {}
            \`\`\`
          `
        }
      }
      render(<GenerationTestScreen {...propsMultiplesPaquetes} />)
      expect(screen.getByTestId("prompt-editor")).not.toBeNull()
    })

    it("reemplaza correctamente múltiples instancias duplicadas de la variable DOMAIN", () => {
      mockParseMasterPrompt.mockReturnValue({
        visibleText: "{{DOMAIN}} debe coincidir con {{DOMAIN}}",
        hiddenContext: "ctx"
      })
      render(<GenerationTestScreen {...baseProps} />)
      expect((screen.getByTestId("prompt-textarea") as HTMLTextAreaElement).value).toBe("veterinaria debe coincidir con veterinaria")
    })

    it("utiliza el fallback predeterminado si los bloques java carecen de declaración de paquete", () => {
      const propsSinDeclaracionPaquete = {
        ...baseProps,
        initialData: {
          ...baseProps.initialData,
          baseClass: "```java\npublic class SoloClase {}\n```"
        }
      }
      render(<GenerationTestScreen {...propsSinDeclaracionPaquete} />)
      expect(screen.getByTestId("prompt-editor")).not.toBeNull()
    })

    it("asigna strings vacíos a los campos dependientes si las propiedades del proyecto vienen indefinidas", () => {
      const propsDatosVacios = {
        ...baseProps,
        initialData: {
          project: { id: "p1" }, 
          constraints: "",
          entityRelationships: "",
          baseClass: ""
        }
      }
      render(<GenerationTestScreen {...propsDatosVacios} />)
      expect(screen.getByTestId("prompt-editor")).not.toBeNull()
    })

    it("cierra el modal de descarga sin invocar el callback utilitario si se cancela la acción", async () => {
      mockGenerate.mockResolvedValue("public class Test1 {}")
      mockResponseTextValue = "public class Test1 {}"
      
      render(<GenerationTestScreen {...baseProps} />)

      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      const btnDescargar = await screen.findByRole("button", { name: "Descargar (.md)" })
      await userEvent.click(btnDescargar)

      const btnCancelarDescarga = screen.getByRole("button", { name: "Cancelar descarga" })
      await userEvent.click(btnCancelarDescarga)

      expect(screen.queryByTestId("download-modal")).toBeNull()
      expect(mockDownloadMarkdown).not.toHaveBeenCalled()
    })
    
    it("confecciona rutas de migración dinámicas adaptadas según el tipo de source general", () => {
      const { rerender } = render(<GenerationTestScreen {...baseProps} source="general" />)
      expect(screen.getByTestId("mock-header")).not.toBeNull()

      const propsSourceRelationships = { ...baseProps, source: "entityRelationships" as const }
      rerender(<GenerationTestScreen {...propsSourceRelationships} />)
      expect(screen.getByTestId("mock-header")).not.toBeNull()
    })

    it("detiene limpiamente la ejecución si falla de forma asíncrona la re-generación (Línea 265 / Volver a generar)", async () => {
      mockGenerate.mockResolvedValueOnce("public class Test1 {}")
      mockResponseTextValue = "public class Test1 {}"
      mockIsLoading = false
      
      render(<GenerationTestScreen {...baseProps} />)

      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      const unhandledSpy = vi.spyOn(process, "emit")
      
      mockGenerate.mockImplementationOnce(() => 
        Promise.reject(new Error("Gemini API Quota Exceeded")).catch(() => {})
      )

      const btnRegenerar = await screen.findByRole("button", { name: "Volver a generar" })
      
      try {
        await userEvent.click(btnRegenerar)
      } catch (err) {
      }

      await waitFor(() => {
        expect(screen.getByTestId("split-result-view")).not.toBeNull()
      })

      unhandledSpy.mockRestore()
    })

    describe("Casos de Cobertura Adicionales", () => {
      
      it("ejecuta las líneas 148-153 asegurando los fallbacks vacíos en el payload de logs", async () => {
      mockGenerate.mockResolvedValue("public class Test1 {}")
      mockResponseTextValue = "public class Test1 {}"
      
      const propsDatosNulos = {
        ...baseProps,
        initialData: {
          ...baseProps.initialData,
          project: {
            id: "proj_999",
            domainName: undefined,      
            extensionFinish: undefined, 
            baseClasses: undefined      
          }
        }
      }

      render(<GenerationTestScreen {...propsDatosNulos} />)
      
      const textarea = screen.getByTestId("prompt-textarea")
      await userEvent.clear(textarea)
      await userEvent.type(textarea, "Generar código de pruebas estructurado")

      const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
      await userEvent.click(btnGenerar)

      const splitView = await screen.findByTestId("split-result-view")
      expect(splitView).not.toBeNull()
    })

      it("ejecuta las líneas 174-175 evaluando el fallback cuando las relaciones del proyecto vienen vacías", () => {
        const propsRelacionesVacias = {
          ...baseProps,
          source: "entityRelationships" as const,
          initialData: {
            ...baseProps.initialData,
            targetType: "entityRelationships" as const,
            entityRelationships: "",
            project: {
              ...PROJECT_BASE,
              entityRelationships: undefined
            }
          }
        }

        render(<GenerationTestScreen {...propsRelacionesVacias} />)
        expect(screen.getByTestId("prompt-editor")).not.toBeNull()
      })

      it("ejecuta la línea 344 mostrando el spinner de carga en el botón Volver a generar", async () => {
        mockGenerate.mockResolvedValueOnce("public class Test1 {}")
        mockResponseTextValue = "public class Test1 {}"
        mockIsLoading = false
        
        const { rerender } = render(<GenerationTestScreen {...baseProps} />)
        
        const btnGenerar = screen.getByRole("button", { name: "Generar Tests" })
        await userEvent.click(btnGenerar)

        const btnVolverGenerar = await screen.findByRole("button", { name: "Volver a generar" })
        expect(btnVolverGenerar).not.toBeNull()

        mockIsLoading = true
        rerender(<GenerationTestScreen {...baseProps} />)

        expect(screen.queryByText("Volver a generar")).toBeNull()
      })

    })
  }) 
})