import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import { useGeminiGeneration } from "~src/components/GeminiGeneration"
import { getAllFromChrome, saveToChrome } from "~src/utils/chromeStorageUtils"
import { downloadMarkdown } from "~src/utils/downloadUtils"

import GenerationSolutionCodeScreen from "./GenerationSolutionCodeScreen"

expect.extend(jestDomMatchers)

vi.mock(
  "bundle-text:../../prompts/generation-exam-repository/solution/generation_code_solution.md",
  () => ({
    default: "Visible text section\n---\nHidden context section"
  })
)

vi.mock("~src/utils/chromeStorageUtils", () => ({
  getAllFromChrome: vi.fn(),
  saveToChrome: vi.fn()
}))

vi.mock("~src/utils/downloadUtils", () => ({
  downloadMarkdown: vi.fn()
}))

vi.mock("~src/utils/promptParser", () => ({
  parseMasterPrompt: vi.fn(() => ({
    visibleText:
      "Prompt: {enunciado_restricciones} | {enunciado_relaciones} | {codigo_tests_restricciones} | {codigo_tests_relaciones} | {codigo_base_localstorage}",
    hiddenContext: "Contexto base"
  }))
}))

let capturedHookOptions: any = null

vi.mock("~src/components/GeminiGeneration", () => ({
  useGeminiGeneration: vi.fn((options) => {
    capturedHookOptions = options
    return mockGeminiMock
  })
}))

vi.mock("~src/components/Header", () => ({
  Header: ({ onWelcome, breadcrumbItems, currentStep }: any) => (
    <header data-testid="header-mock">
      <span>{currentStep}</span>
      <button onClick={onWelcome}>Logo Inicio</button>
      {breadcrumbItems?.map((bi: any) => (
        <button key={bi.label} onClick={bi.action}>
          {bi.label}
        </button>
      ))}
    </header>
  )
}))

vi.mock("~src/components/FolderExamsSelector", () => ({
  FolderExamSelector: ({ projects, onSelectProject, onBack }: any) => (
    <div data-testid="folder-selector">
      <button onClick={onBack}>Volver Atras</button>
      {projects.map((p: any) => (
        <button key={p.id} onClick={() => onSelectProject(p)}>
          Seleccionar {p.customName || p.domainName}
        </button>
      ))}
    </div>
  )
}))

vi.mock("~src/components/WorkflowComponents", () => ({
  PromptEditor: ({ onGenerate, onBack, description, isLoading }: any) => (
    <div data-testid="prompt-editor">
      <div data-testid="instruction-wrapper">{description}</div>
      {isLoading && (
        <span data-testid="loading-spinner">Generando solución...</span>
      )}
      <button onClick={onBack}>Atrás Selección</button>
      <button onClick={onGenerate}>Generar Solución</button>
    </div>
  ),
  SplitResultView: ({ footer, onResponseChange, responseText }: any) => (
    <div data-testid="split-view">
      <textarea
        data-testid="response-input"
        value={responseText || ""}
        onChange={(e) => onResponseChange(e.target.value)}
      />
      {footer}
    </div>
  )
}))

vi.mock("~src/components/modals/ConfirmModal", () => ({
  ConfirmModal: ({
    title,
    message,
    warning,
    onConfirm,
    onCancel,
    confirmLabel,
    cancelLabel
  }: any) => (
    <div data-testid="confirm-modal">
      <h3>{title}</h3>
      <p>{message}</p>
      {warning && <span>{warning}</span>}
      <button onClick={onCancel}>{cancelLabel || "Cancelar Accion"}</button>
      <button onClick={onConfirm}>{confirmLabel || "Confirmar"}</button>
    </div>
  )
}))

vi.mock("~src/components/modals/SuccessModal", () => ({
  SuccessModal: ({ title, actions }: any) => (
    <div data-testid="success-modal">
      <h3>{title}</h3>
      {actions?.map((act: any) => (
        <button key={act.label} onClick={act.onClick}>
          {act.label}
        </button>
      ))}
    </div>
  )
}))

const defaultProps = {
  onBack: vi.fn(),
  onWelcome: vi.fn(),
  onCreateExam: vi.fn(),
  onCreateExamByParts: vi.fn(),
  onCodeGeneration: vi.fn()
}

const mockValidProject = {
  _key: "project_1",
  id: "project_1",
  domainName: "ajedrez",
  customName: "Examen Ajedrez Pro",
  baseClasses: "class Tablero {}",
  attributeConstraints: "Restricciones de fichas",
  extensionFinish: "Ajedrez_Finalizado",
  testPartsMap: {
    test1_attributes: { code: "testAtributos()" }
  }
}

let mockGeminiMock: any

describe("Integración Completa: GenerationSolutionCodeScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedHookOptions = null

    mockGeminiMock = {
      responseText: "",
      isLoading: false,
      setResponseText: vi.fn(),
      generate: vi.fn().mockImplementation(async () => {
        const resultText = "Código solución de la IA"
        mockGeminiMock.responseText = resultText

        if (
          capturedHookOptions &&
          typeof capturedHookOptions.buildLogPayload === "function"
        ) {
          capturedHookOptions.buildLogPayload(resultText)
        }

        return resultText
      })
    }

    vi.mocked(getAllFromChrome).mockResolvedValue([mockValidProject])
    vi.mocked(useGeminiGeneration).mockReturnValue(mockGeminiMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("Casos Positivos y Navegación", () => {
    it("carga los proyectos al montar y renderiza la pantalla de selección inicial", async () => {
      render(<GenerationSolutionCodeScreen {...defaultProps} />)

      expect(screen.getByTestId("header-mock")).toBeInTheDocument()
      expect(screen.getByText("SOLUCIÓN")).toBeInTheDocument()

      await waitFor(() => {
        expect(getAllFromChrome).toHaveBeenCalledTimes(1)
        expect(screen.getByTestId("folder-selector")).toBeInTheDocument()
      })
    })

    it("abre el modal de confirmación al seleccionar un proyecto y permite avanzar al workflow", async () => {
      render(<GenerationSolutionCodeScreen {...defaultProps} />)

      const btnProyecto = await screen.findByRole("button", {
        name: /Seleccionar Examen Ajedrez Pro/i
      })
      await userEvent.click(btnProyecto)

      expect(screen.getByTestId("confirm-modal")).toBeInTheDocument()
      expect(
        screen.getByText(
          /¿Deseas generar el código solución para el examen Examen Ajedrez Pro?/i
        )
      ).toBeInTheDocument()

      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument()
      expect(screen.getByTestId("prompt-editor")).toBeInTheDocument()
    })

    it("comporta el flujo completo de generación de IA hasta visualizar el resultado", async () => {
      render(<GenerationSolutionCodeScreen {...defaultProps} />)

      await userEvent.click(
        await screen.findByRole("button", {
          name: /Seleccionar Examen Ajedrez Pro/i
        })
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))

      expect(
        screen.getByText("Enunciado de Restricciones de Atributos")
      ).toBeInTheDocument()

      await userEvent.click(
        screen.getByRole("button", { name: "Generar Solución" })
      )
      expect(mockGeminiMock.generate).toHaveBeenCalled()

      await waitFor(() => {
        expect(screen.getByTestId("split-view")).toBeInTheDocument()
      })
    })

    it("permite guardar la solución exitosamente en Chrome Storage y transicionar al éxito", async () => {
      vi.mocked(saveToChrome).mockResolvedValue(undefined)
      render(<GenerationSolutionCodeScreen {...defaultProps} />)

      await userEvent.click(
        await screen.findByRole("button", {
          name: /Seleccionar Examen Ajedrez Pro/i
        })
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Solución" })
      )

      const btnGuardar = await screen.findByRole("button", { name: "Guardar" })
      await userEvent.click(btnGuardar)

      await waitFor(() => {
        expect(saveToChrome).toHaveBeenCalledWith(
          "project_1",
          expect.objectContaining({
            fullSolution: "Código solución de la IA"
          })
        )
        expect(screen.getByTestId("success-modal")).toBeInTheDocument()
      })

      await userEvent.click(
        screen.getByRole("button", { name: "Volver al inicio" })
      )
      expect(defaultProps.onWelcome).toHaveBeenCalled()
    })

    it("interactúa correctamente con las migas de pan y disparadores del Header", async () => {
      render(<GenerationSolutionCodeScreen {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Logo Inicio" }))
      expect(defaultProps.onWelcome).toHaveBeenCalledTimes(1)

      await userEvent.click(
        screen.getByRole("button", { name: "CREAR EXAMEN" })
      )
      expect(defaultProps.onCreateExam).toHaveBeenCalled()

      await userEvent.click(screen.getByRole("button", { name: "POR PARTES" }))
      expect(defaultProps.onCreateExamByParts).toHaveBeenCalled()

      await userEvent.click(screen.getByRole("button", { name: "CÓDIGO" }))
      expect(defaultProps.onCodeGeneration).toHaveBeenCalled()
    })

    it("ejecuta la descarga del Markdown interactuando con DownloadConfirmModal", async () => {
      render(<GenerationSolutionCodeScreen {...defaultProps} />)

      await userEvent.click(
        await screen.findByRole("button", {
          name: /Seleccionar Examen Ajedrez Pro/i
        })
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Solución" })
      )

      const botonesDescargar = await screen.findAllByRole("button", {
        name: "Descargar (.md)"
      })
      await userEvent.click(botonesDescargar[0])

      const botonConfirmarModal = (
        await screen.findAllByRole("button", { name: "Descargar (.md)" })
      )[1]
      await userEvent.click(botonConfirmarModal)

      expect(downloadMarkdown).toHaveBeenCalledWith(
        expect.stringContaining("# Solución Completa - Examen Ajedrez Pro"),
        expect.any(String)
      )
    })

    it("permite retroceder en los distintos pasos de la interfaz", async () => {
      render(<GenerationSolutionCodeScreen {...defaultProps} />)

      await userEvent.click(
        await screen.findByRole("button", { name: "Volver Atras" })
      )
      expect(defaultProps.onBack).toHaveBeenCalled()

      await userEvent.click(
        await screen.findByRole("button", {
          name: /Seleccionar Examen Ajedrez Pro/i
        })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Cancelar Accion" })
      )
      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument()

      await userEvent.click(
        await screen.findByRole("button", {
          name: /Seleccionar Examen Ajedrez Pro/i
        })
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Atrás Selección" })
      )
      expect(screen.getByTestId("folder-selector")).toBeInTheDocument()
    })
  })

  describe("Casos Negativos y Ramas de Excepciones", () => {
    it("utiliza el fallback de texto de error por defecto si la excepción de saveToChrome no trae un message (Línea 146)", async () => {
      vi.mocked(saveToChrome).mockRejectedValue({})

      render(<GenerationSolutionCodeScreen {...defaultProps} />)
      await userEvent.click(
        await screen.findByRole("button", {
          name: /Seleccionar Examen Ajedrez Pro/i
        })
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Solución" })
      )

      const btnGuardar = await screen.findByRole("button", { name: "Guardar" })
      await userEvent.click(btnGuardar)

      await waitFor(() => {
        expect(screen.getByTestId("confirm-modal")).toBeInTheDocument()
        expect(screen.getByText("No se pudo guardar.")).toBeInTheDocument()
      })

      await userEvent.click(
        screen.getByRole("button", { name: "Volver al inicio" })
      )
      expect(defaultProps.onWelcome).toHaveBeenCalled()
    })

    it("renderiza el estado de carga mientras se genera la solución (Línea 265)", async () => {
      let resolvePromise: any
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      mockGeminiMock.isLoading = true
      mockGeminiMock.generate.mockReturnValueOnce(delayedPromise)

      render(<GenerationSolutionCodeScreen {...defaultProps} />)

      await userEvent.click(
        await screen.findByRole("button", {
          name: /Seleccionar Examen Ajedrez Pro/i
        })
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Solución" })
      )

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()

      await act(async () => {
        resolvePromise("Solución")
      })
    })

    it("ejecuta por completo la estructura de excepción al fallar el guardado (Líneas 125-130)", async () => {
      vi.mocked(saveToChrome).mockRejectedValue({
        message: "Error de consistencia"
      })

      render(<GenerationSolutionCodeScreen {...defaultProps} />)

      await userEvent.click(
        await screen.findByRole("button", {
          name: /Seleccionar Examen Ajedrez Pro/i
        })
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Solución" })
      )

      const botonGuardar = await screen.findByRole("button", {
        name: "Guardar"
      })
      await userEvent.click(botonGuardar)

      await waitFor(() => {
        expect(screen.getByTestId("confirm-modal")).toBeInTheDocument()
      })

      await userEvent.click(
        screen.getByRole("button", { name: "Volver al inicio" })
      )
    })

    it("renderiza el error explícito con su mensaje si la excepción de guardado lo incluye", async () => {
      vi.mocked(saveToChrome).mockRejectedValueOnce({
        message: "Storage lleno"
      })

      render(<GenerationSolutionCodeScreen {...defaultProps} />)
      await userEvent.click(
        await screen.findByRole("button", {
          name: /Seleccionar Examen Ajedrez Pro/i
        })
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Solución" })
      )

      const btnGuardar = await screen.findByRole("button", { name: "Guardar" })
      await userEvent.click(btnGuardar)

      await waitFor(() => {
        expect(screen.getByText("Storage lleno")).toBeInTheDocument()
      })

      vi.mocked(saveToChrome).mockResolvedValue(undefined)
      await userEvent.click(screen.getByRole("button", { name: "Reintentar" }))
      await waitFor(() => {
        expect(screen.getByTestId("success-modal")).toBeInTheDocument()
      })
    })

    it("asigna un arreglo vacío a los proyectos si la promesa getAllFromChrome falla", async () => {
      vi.mocked(getAllFromChrome).mockRejectedValue(
        new Error("Fallo de lectura")
      )
      render(<GenerationSolutionCodeScreen {...defaultProps} />)

      await waitFor(() => {
        expect(getAllFromChrome).toHaveBeenCalledTimes(1)
        expect(screen.getByTestId("folder-selector")).toBeInTheDocument()
      })
    })
  })

  describe("Casos Límite y Ramas de Lógica", () => {
    it("valida el filtro de proyectos combinando múltiples estados incompletos (Función filterProject)", async () => {
      const proyectosInvalidos = [
        { _key: "project_A", baseClasses: "" },
        {
          _key: "project_B",
          baseClasses: "class A {}",
          attributeConstraints: "",
          entityRelationships: ""
        },
        {
          _key: "project_C",
          baseClasses: "class A {}",
          attributeConstraints: "Tengo restricciones",
          testPartsMap: {}
        }
      ]
      vi.mocked(getAllFromChrome).mockResolvedValue(proyectosInvalidos)

      render(<GenerationSolutionCodeScreen {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId("folder-selector")).toBeInTheDocument()
        expect(
          screen.queryByRole("button", { name: /Seleccionar/i })
        ).not.toBeInTheDocument()
      })
    })

    it("aplica los reemplazos alternativos en buildPrompt si las propiedades opcionales del proyecto vienen vacías", async () => {
      const mockProjectAlternativo = {
        _key: "project_2",
        id: "project_2",
        domainName: "clínica veterinaria",
        baseClasses: "class Veterinaria {}",
        entityRelationships: "Relaciones Veterinaria",
        testPartsMap: {
          test2_relationships: { code: "testRelaciones()" }
        }
      }
      vi.mocked(getAllFromChrome).mockResolvedValue([mockProjectAlternativo])

      render(<GenerationSolutionCodeScreen {...defaultProps} />)

      await userEvent.click(
        await screen.findByRole("button", {
          name: /Seleccionar clínica veterinaria/i
        })
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))

      expect(
        screen.getByText("Enunciado de Relaciones entre Entidades")
      ).toBeInTheDocument()
      expect(
        screen.queryByText("Enunciado de Restricciones de Atributos")
      ).not.toBeInTheDocument()
    })

    it("incluye el warning de sobreescritura si el proyecto seleccionado ya contenía una solución previa", async () => {
      const mockProjectConSolucion = {
        ...mockValidProject,
        fullSolution: "Solución arcaica existente"
      }
      vi.mocked(getAllFromChrome).mockResolvedValue([mockProjectConSolucion])

      render(<GenerationSolutionCodeScreen {...defaultProps} />)
      await userEvent.click(
        await screen.findByRole("button", {
          name: /Seleccionar Examen Ajedrez Pro/i
        })
      )

      expect(
        screen.getByText(
          "Este examen ya tiene un código solución. Si continúas, se reemplazará por la nueva versión."
        )
      ).toBeInTheDocument()
    })

    it("cancela el guardado de forma segura si selectedProject no posee id válido", async () => {
      const mockProjectSinId = { ...mockValidProject, id: undefined }
      vi.mocked(getAllFromChrome).mockResolvedValue([mockProjectSinId])

      render(<GenerationSolutionCodeScreen {...defaultProps} />)
      await userEvent.click(
        await screen.findByRole("button", {
          name: /Seleccionar Examen Ajedrez Pro/i
        })
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Solución" })
      )

      const btnGuardar = await screen.findByRole("button", { name: "Guardar" })
      await userEvent.click(btnGuardar)
      expect(saveToChrome).not.toHaveBeenCalled()
    })

    it("cancela la descarga de forma segura si no se confirma en el DownloadConfirmModal", async () => {
      render(<GenerationSolutionCodeScreen {...defaultProps} />)

      await userEvent.click(
        await screen.findByRole("button", {
          name: /Seleccionar Examen Ajedrez Pro/i
        })
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Solución" })
      )

      const botonesDescargar = await screen.findAllByRole("button", {
        name: "Descargar (.md)"
      })
      await userEvent.click(botonesDescargar[0])

      await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
      expect(downloadMarkdown).not.toHaveBeenCalled()
    })

    it("cancela la descarga si de alguna manera responseText o selectedProject quedan nulos", async () => {
      render(<GenerationSolutionCodeScreen {...defaultProps} />)

      await userEvent.click(
        await screen.findByRole("button", {
          name: /Seleccionar Examen Ajedrez Pro/i
        })
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Solución" })
      )

      mockGeminiMock.responseText = ""

      const botonesDescargar = await screen.findAllByRole("button", {
        name: "Descargar (.md)"
      })
      await userEvent.click(botonesDescargar[0])

      const botonConfirmarModal = (
        await screen.findAllByRole("button", { name: "Descargar (.md)" })
      )[1]
      await userEvent.click(botonConfirmarModal)

      expect(downloadMarkdown).not.toHaveBeenCalled()
    })

    it("sincroniza correctamente las ediciones de texto manuales en la vista de resultados", async () => {
      render(<GenerationSolutionCodeScreen {...defaultProps} />)
      await userEvent.click(
        await screen.findByRole("button", {
          name: /Seleccionar Examen Ajedrez Pro/i
        })
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Solución" })
      )

      const inputRespuesta = await screen.findByTestId("response-input")
      await userEvent.type(inputRespuesta, "Cambio manual del usuario")

      expect(mockGeminiMock.setResponseText).toHaveBeenCalled()
    })
  })
})
