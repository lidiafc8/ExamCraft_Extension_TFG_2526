import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import GenerationBaseClassesScreen from "./GenerationBaseClassesScreen"

let promptVisibleSimulado = "Genera las clases base en Java para el dominio clínica veterinaria. Clases a incluir: "

vi.mock("~src/utils/promptParser", () => ({
  parseMasterPrompt: vi.fn(() => ({
    visibleText: promptVisibleSimulado,
    hiddenContext: "Contexto oculto de backend",
  })),
}))

const mockGetStorage = vi.fn((keys, callback) => {
  if (callback) callback({})
  return Promise.resolve({})
})

const mockSetStorage = vi.fn((data, callback) => {
  if (callback) callback()
  return Promise.resolve()
})

globalThis.chrome = {
  storage: {
    local: {
      get: mockGetStorage,
      set: mockSetStorage,
      remove: vi.fn((keys, callback) => { if (callback) callback(); return Promise.resolve(); }),
      clear: vi.fn((callback) => { if (callback) callback(); return Promise.resolve(); }),
    },
  },
  runtime: {
    lastError: null,
  },
} as any

const mockGenerate = vi.fn()
const mockSetResponseText = vi.fn()
let capturedHookOptions: any = null

vi.mock("~src/components/GeminiGeneration", () => ({
  useGeminiGeneration: (options: any) => {
    capturedHookOptions = options 
    return {
      responseText: "public class BaseEntity { ... }",
      isLoading: false,
      setResponseText: mockSetResponseText,
      generate: mockGenerate,
    }
  },
}))

const spyDownloadMarkdown = vi.fn()
vi.mock("~src/utils/downloadUtils", () => ({
  downloadMarkdown: (...args: any[]) => spyDownloadMarkdown(...args),
}))

let capturedBreadcrumbs: any = null
vi.mock("~src/components/Header", () => ({
  Header: (props: any) => {
    capturedBreadcrumbs = props.breadcrumbs || props.breadcrumbItems || props.items
    return (
      <header data-testid="mock-header">
        <span>{props.currentStep}</span>
      </header>
    )
  },
}))

const mockProjects = {
  project_1: {
    id: "project_1",
    domainName: "clínica veterinaria",
    customName: "Examen Mascotas",
    extensionFinish: "Enunciado oficial de veterinaria...",
  },
  project_2: {
    id: "project_2",
    domainName: "ajedrez",
    customName: "Torneo Ajedrez",
    extensionFinish: "Enunciado oficial de ajedrez...",
    baseClasses: "Clases previas existentes",
  },
}

const defaultProps = {
  initialProject: undefined,
  fromAttributes: false,
  onGoToTests: vi.fn(),
  onBack: vi.fn(),
  onWelcome: vi.fn(),
  onCreateExam: vi.fn(),
  onCreateExamByParts: vi.fn(),
  onCodeGeneration: vi.fn(),
}

describe("GenerationBaseClassesScreen - Pruebas Integrales", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    spyDownloadMarkdown.mockClear()
    capturedHookOptions = null
    capturedBreadcrumbs = null
    
    promptVisibleSimulado = "Genera las clases base en Java para el dominio clínica veterinaria. Clases a incluir: "

    mockGetStorage.mockImplementation((key, callback) => {
      if (callback) callback(mockProjects)
      return Promise.resolve(mockProjects)
    })
  })

  it("Debe iniciar en la selección de carpetas si no se le pasa un proyecto inicial", async () => {
    render(<GenerationBaseClassesScreen {...defaultProps} />)
    expect(mockGetStorage).toHaveBeenCalled()
    const header = screen.getByTestId("mock-header")
    expect(header).toBeDefined()
    expect(header.textContent).toContain("CLASES BASE")
  })

  it("Debe saltar directamente al flujo de trabajo si se provee un 'initialProject'", async () => {
    render(<GenerationBaseClassesScreen {...defaultProps} initialProject={mockProjects.project_1} />)
    const promptDescription = screen.getByText(/este es el prompt que se usará/i)
    expect(promptDescription).toBeDefined()
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement
    expect(textarea.value).toMatch(/clínica veterinaria/i)
  })

  it("Flujo Completo: Seleccionar Carpeta -> Seleccionar Examen -> Confirmar -> Generar código", async () => {
    render(<GenerationBaseClassesScreen {...defaultProps} />)

    const folderButton = await screen.findByText(/clínica veterinaria/i)
    fireEvent.click(folderButton)

    const openExamBtn = await screen.findByRole("button", { name: /abrir examen/i })
    fireEvent.click(openExamBtn)

    await waitFor(() => {
      const modalMessage = screen.getByText(/¿Deseas utilizar Examen Mascotas como base/i)
      expect(modalMessage).toBeDefined()
    })

    const confirmBtn = screen.getByRole("button", { name: /confirmar/i })
    fireEvent.click(confirmBtn)

    expect(screen.getByText(/este es el prompt que se usará/i)).toBeDefined()

    mockGenerate.mockResolvedValueOnce(true)
    const generateBtn = screen.getByRole("button", { name: /generar/i })
    fireEvent.click(generateBtn)

    expect(mockGenerate).toHaveBeenCalled()

    await waitFor(() => {
      const resultTitle = screen.getByText(/propuesta del código de las clases bases/i)
      expect(resultTitle).toBeDefined()
    })

    expect(screen.getByRole("button", { name: /descargar \(.md\)/i })).toBeDefined()
    expect(screen.getByRole("button", { name: /guardar/i })).toBeDefined()
  })

  it("Debe cerrar el modal de confirmación y limpiar el proyecto seleccionado al hacer click en Cancelar", async () => {
    render(<GenerationBaseClassesScreen {...defaultProps} />)

    const folderButton = await screen.findByText(/clínica veterinaria/i)
    fireEvent.click(folderButton)

    const openExamBtn = await screen.findByRole("button", { name: /abrir examen/i })
    fireEvent.click(openExamBtn)

    await waitFor(() => {
      expect(screen.getByText(/¿Deseas utilizar Examen Mascotas como base/i)).toBeDefined()
    })

    const cancelBtn = screen.getByRole("button", { name: /cancelar/i })
    fireEvent.click(cancelBtn)

    await waitFor(() => {
      expect(screen.queryByText(/¿Deseas utilizar Examen Mascotas como base/i)).toBeNull()
      expect(screen.queryByText(/este es el prompt que se usará/i)).toBeNull()
    })
    
    expect(screen.getByRole("button", { name: /abrir examen/i })).toBeDefined()
  })

  it("Debe mostrar un mensaje de advertencia si el examen ya cuenta con clases base guardadas", async () => {
    render(<GenerationBaseClassesScreen {...defaultProps} />)

    const folderButton = await screen.findByText(/ajedrez/i)
    fireEvent.click(folderButton)

    const openExamBtn = await screen.findByRole("button", { name: /abrir examen/i })
    fireEvent.click(openExamBtn)

    await waitFor(() => {
      const warningText = screen.getByText(/este examen ya tiene clases base generadas/i)
      expect(warningText).toBeDefined()
    })
  })

  it("Debe abrir el modal de guardado al hacer click en 'Guardar' desde la vista de resultados", async () => {
    mockGenerate.mockResolvedValueOnce(true)
    render(<GenerationBaseClassesScreen {...defaultProps} initialProject={mockProjects.project_1} />)
    
    fireEvent.click(screen.getByRole("button", { name: /generar/i }))
    
    const saveButton = await screen.findByRole("button", { name: /guardar/i })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      const errorModalTitle = screen.queryByText(/error al guardar/i)
      expect(errorModalTitle).toBeNull() 
      
      const successTitle = screen.getByText(/¡Guardado con éxito!/i)
      const successDescription = screen.getByText(/Las clases base se han guardado correctamente/i)
      
      expect(successTitle).toBeDefined()
      expect(successDescription).toBeDefined()
    })
  })

  it("Debe procesar la lógica de retroceso hacia Atributos cuando fromAttributes es verdadero", async () => {
    render(<GenerationBaseClassesScreen {...defaultProps} fromAttributes={true} initialProject={mockProjects.project_1} />)
    const backBtn = screen.getByRole("button", { name: "Volver" })
    expect(backBtn).toBeDefined()
    fireEvent.click(backBtn)
    expect(defaultProps.onBack).toHaveBeenCalled()
  })

  it("Debe capturar el error en buildPrompt e inyectar el texto de error por defecto si el proyecto está corrupto", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const corruptProject = { id: "project_corrupt", domainName: 12345 as any, customName: "Proyecto Corrupto" }

    render(<GenerationBaseClassesScreen {...defaultProps} initialProject={corruptProject} />)
    const errorTextarea = await screen.findByRole("textbox") as HTMLTextAreaElement
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Error en buildPrompt:"), expect.any(Error))
    expect(errorTextarea.value).toBe("Error al preparar el prompt.")
    consoleSpy.mockRestore()
  })

  it("Debe inyectar el texto por defecto en el prompt si el dominio del proyecto no está registrado en el diccionario", async () => {
    promptVisibleSimulado = "   "

    const unmappedProject = { id: "project_unmapped", domainName: "astronomía avanzada", customName: "Examen de Estrellas" }
    render(<GenerationBaseClassesScreen {...defaultProps} initialProject={unmappedProject} />)
    
    const textarea = await screen.findByRole("textbox") as HTMLTextAreaElement
    expect(textarea.value).toContain("No hay clases base registradas para este dominio.")
  })

  it("Debe construir el prompt estructurado por defecto si visibleText viene vacío", async () => {
    promptVisibleSimulado = "   " 

    render(<GenerationBaseClassesScreen {...defaultProps} initialProject={mockProjects.project_1} />)
    
    const textarea = await screen.findByRole("textbox") as HTMLTextAreaElement
    expect(textarea.value).toContain("Genera las clases base en Java para el dominio clínica veterinaria.")
  })

  it("Debe estructurar correctamente el log payload mediante buildLogPayload al resolverse la generación", async () => {
    render(<GenerationBaseClassesScreen {...defaultProps} initialProject={mockProjects.project_1} />)

    expect(capturedHookOptions).not.toBeNull()
    expect(capturedHookOptions.logExerciseName).toBe("base-classes-code-generation")
    expect(typeof capturedHookOptions.buildLogPayload).toBe("function")

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: "Prompt modificado por el usuario" } })

    const fakeResult = "Resultado de código de IA"
    const payload = capturedHookOptions.buildLogPayload(fakeResult)

    expect(payload).toEqual({
      dominio: "clínica veterinaria",
      contextoOculto: expect.any(String), 
      examenSeleccionado: "Enunciado oficial de veterinaria...",
      promptVisible: "Prompt modificado por el usuario",
      respuesta: "Resultado de código de IA"
    })
  })

  it("Debe generar breadcrumbs diferentes dependiendo de la propiedad fromAttributes", async () => {
    const { unmount } = render(
      <GenerationBaseClassesScreen {...defaultProps} fromAttributes={true} initialProject={mockProjects.project_1} />
    )
    
    await waitFor(() => {
      expect(capturedBreadcrumbs).toBeDefined()
      expect(capturedBreadcrumbs).not.toBeNull()
      expect(capturedBreadcrumbs[3].label).toBe("ATRIBUTOS") 
    })
    unmount()

    render(
      <GenerationBaseClassesScreen {...defaultProps} fromAttributes={false} initialProject={mockProjects.project_1} />
    )
    
    await waitFor(() => {
      expect(capturedBreadcrumbs).toBeDefined()
      expect(capturedBreadcrumbs).not.toBeNull()
      expect(capturedBreadcrumbs[3].label).toBe("CÓDIGO") 
    })
  })
})