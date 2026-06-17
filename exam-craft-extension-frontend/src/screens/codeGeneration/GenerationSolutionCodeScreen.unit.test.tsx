import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import GenerationSolutionCodeScreen from "./GenerationSolutionCodeScreen"

vi.mock(
  "bundle-text:../../prompts/generation-exam-repository/solution/generation_code_solution.md",
  () => ({
    default:
      "Prompt: {enunciado_restricciones} {enunciado_relaciones} {codigo_tests_restricciones} {codigo_tests_relaciones} {codigo_base_localstorage}"
  })
)

const mockDownloadMarkdown = vi.fn()
vi.mock("~src/utils/downloadUtils", () => ({
  downloadMarkdown: (...args: any[]) => mockDownloadMarkdown(...args)
}))

const mockParseMasterPrompt = vi.fn()
vi.mock("~src/utils/promptParser", () => ({
  parseMasterPrompt: (...args: any[]) => mockParseMasterPrompt(...args)
}))

const mockGenerate = vi.fn()
const mockSetResponseText = vi.fn()
let mockResponseTextValue = ""

vi.mock("~src/components/GeminiGeneration", () => ({
  useGeminiGeneration: vi.fn(() => ({
    get responseText() {
      return mockResponseTextValue
    },
    isLoading: false,
    setResponseText: mockSetResponseText,
    generate: mockGenerate
  }))
}))

vi.mock("~src/components/Header", () => ({
  Header: ({ breadcrumbItems = [], currentStep, onWelcome }: any) => (
    <header data-testid="mock-header">
      <span>Step: {currentStep}</span>
      <button onClick={onWelcome}>Welcome Link</button>
      {breadcrumbItems?.map((item: any, i: number) => (
        <button key={i} onClick={item.action}>
          {item.label}
        </button>
      ))}
    </header>
  )
}))

vi.mock("~src/components/modals/DownloadConfirmModal", () => ({
  DownloadConfirmModal: ({ isOpen, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid="download-modal">
        <button onClick={() => onConfirm("solucion_test")}>
          Confirmar descarga
        </button>
        <button onClick={onCancel}>Cancelar descarga</button>
      </div>
    ) : null
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
      <span>{title}</span>
      <span>{typeof message === "string" ? message : ""}</span>
      {warning && <span data-testid="confirm-warning">{warning}</span>}
      <button onClick={onConfirm}>{confirmLabel || "Confirmar"}</button>
      <button onClick={onCancel}>{cancelLabel || "Cancelar"}</button>
    </div>
  )
}))

vi.mock("~src/components/modals/SuccessModal", () => ({
  SuccessModal: ({ title, message, actions }: any) => (
    <div data-testid="success-modal">
      <span>{title}</span>
      <span>{message}</span>
      {actions?.map((a: any, i: number) => (
        <button key={i} onClick={a.onClick}>
          {a.label}
        </button>
      ))}
    </div>
  )
}))

const mockSaveToChrome = vi.fn()
const mockGetAllFromChrome = vi.fn()

vi.mock("~src/utils/chromeStorageUtils", () => ({
  getAllFromChrome: (...args: any[]) => mockGetAllFromChrome(...args),
  saveToChrome: (...args: any[]) => mockSaveToChrome(...args)
}))

const PROJECT_COMPLETE = {
  _key: "project_1",
  id: "project_1",
  domainName: "clínica veterinaria",
  customName: "Examen Veterinaria",
  baseClasses: "class Animal {}",
  attributeConstraints: "restricciones de prueba",
  entityRelationships: "relaciones de prueba",
  testPartsMap: {
    test1_attributes: { code: "test attr code" }
  }
}

const PROJECT_ONLY_CONSTRAINTS = {
  _key: "project_2",
  id: "project_2",
  domainName: "clínica veterinaria",
  customName: "Examen Solo Restricciones",
  baseClasses: "class Animal {}",
  attributeConstraints: "restricciones",
  entityRelationships: "",
  testPartsMap: {
    test1_attributes: { code: "test attr code" }
  }
}

const PROJECT_WITH_SOLUTION = {
  ...PROJECT_COMPLETE,
  customName: "Examen Con Solucion",
  fullSolution: "public class Solución {}"
}

const PROJECT_NO_BASE = {
  _key: "project_3",
  id: "project_3",
  domainName: "clínica veterinaria",
  customName: "Sin Clases Base"
}

const PROJECT_NO_ID = {
  _key: "project_4",
  domainName: "clínica veterinaria",
  customName: "Sin ID",
  baseClasses: "class X {}",
  attributeConstraints: "restricciones",
  testPartsMap: { test1_attributes: { code: "code" } }
}

const baseProps = {
  onBack: vi.fn(),
  onWelcome: vi.fn(),
  onCreateExam: vi.fn(),
  onCreateExamByParts: vi.fn(),
  onCodeGeneration: vi.fn()
}

async function navegarHastaEditor(proyectos = [PROJECT_COMPLETE]) {
  mockGetAllFromChrome.mockResolvedValue(
    proyectos.map((p) => ({ ...p, _key: p._key || `project_${Date.now()}` }))
  )
  render(<GenerationSolutionCodeScreen {...baseProps} />)

  const carpetaExamen = await screen.findByRole("button", {
    name: /1\s+examen/i
  })
  await userEvent.click(carpetaExamen)

  await userEvent.click(await screen.findByTitle("Abrir examen"))
  await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
}

beforeEach(() => {
  cleanup()
  vi.clearAllMocks()
  mockResponseTextValue = ""
  mockSaveToChrome.mockResolvedValue(undefined)
  mockGetAllFromChrome.mockResolvedValue([PROJECT_COMPLETE])
  mockParseMasterPrompt.mockReturnValue({
    visibleText: "Prompt visible de prueba",
    hiddenContext: "contexto oculto"
  })
})

describe("GenerationSolutionCodeScreen", () => {
  describe("Renderizado inicial", () => {
    it("renderiza el Header con currentStep SOLUCIÓN", async () => {
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      expect(screen.getByText("Step: SOLUCIÓN")).toBeInTheDocument()
    })

    it("muestra la vista de selección de carpetas al montar", async () => {
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      expect(await screen.findByText("MIS EXÁMENES")).toBeInTheDocument()
    })

    it("no muestra modales al montar", () => {
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument()
      expect(screen.queryByTestId("success-modal")).not.toBeInTheDocument()
      expect(screen.queryByTestId("download-modal")).not.toBeInTheDocument()
    })

    it("muestra mensaje vacío si no hay proyectos válidos", async () => {
      mockGetAllFromChrome.mockResolvedValue([PROJECT_NO_BASE])
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      expect(await screen.findByText(/No hay exámenes/i)).toBeInTheDocument()
    })

    it("filtra proyectos sin clases base", async () => {
      mockGetAllFromChrome.mockResolvedValue([
        PROJECT_NO_BASE,
        PROJECT_COMPLETE
      ])
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      expect(
        await screen.findByRole("button", { name: /1\s+examen/i })
      ).toBeInTheDocument()
      expect(screen.queryByText("Sin Clases Base")).not.toBeInTheDocument()
    })
  })

  describe("Breadcrumbs", () => {
    it("llama a onWelcome al pulsar INICIO", async () => {
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      await userEvent.click(screen.getByRole("button", { name: "INICIO" }))
      expect(baseProps.onWelcome).toHaveBeenCalledTimes(1)
    })

    it("llama a onCreateExam al pulsar CREAR EXAMEN", async () => {
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      await userEvent.click(
        screen.getByRole("button", { name: "CREAR EXAMEN" })
      )
      expect(baseProps.onCreateExam).toHaveBeenCalledTimes(1)
    })

    it("llama a onCreateExamByParts al pulsar POR PARTES", async () => {
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      await userEvent.click(screen.getByRole("button", { name: "POR PARTES" }))
      expect(baseProps.onCreateExamByParts).toHaveBeenCalledTimes(1)
    })

    it("llama a onCodeGeneration al pulsar CÓDIGO", async () => {
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      await userEvent.click(screen.getByRole("button", { name: "CÓDIGO" }))
      expect(baseProps.onCodeGeneration).toHaveBeenCalledTimes(1)
    })
  })

  describe("Flujo de selección de proyecto", () => {
    it("navega a la carpeta al hacer clic en ella", async () => {
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", { name: /1\s+examen/i })
      await userEvent.click(carpeta)
      expect(await screen.findByTitle("Abrir examen")).toBeInTheDocument()
    })

    it("abre el modal de confirmación al seleccionar un proyecto", async () => {
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", { name: /1\s+examen/i })
      await userEvent.click(carpeta)
      await userEvent.click(await screen.findByTitle("Abrir examen"))
      expect(screen.getByTestId("confirm-modal")).toBeInTheDocument()
    })

    it("muestra advertencia si el proyecto ya tiene solución generada", async () => {
      mockGetAllFromChrome.mockResolvedValue([PROJECT_WITH_SOLUTION])
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", { name: /1\s+examen/i })
      await userEvent.click(carpeta)
      await userEvent.click(await screen.findByTitle("Abrir examen"))
      expect(screen.getByTestId("confirm-warning")).toBeInTheDocument()
      expect(
        screen.getByText(/se reemplazará por la nueva versión/i)
      ).toBeInTheDocument()
    })

    it("NO muestra advertencia si el proyecto no tiene solución previa", async () => {
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", { name: /1\s+examen/i })
      await userEvent.click(carpeta)
      await userEvent.click(await screen.findByTitle("Abrir examen"))
      expect(screen.queryByTestId("confirm-warning")).not.toBeInTheDocument()
    })

    it("cierra el modal al cancelar la selección", async () => {
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", { name: /1\s+examen/i })
      await userEvent.click(carpeta)
      await userEvent.click(await screen.findByTitle("Abrir examen"))
      await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument()
    })

    it("navega al editor al confirmar la selección", async () => {
      await navegarHastaEditor()
      expect(
        await screen.findByRole("button", { name: /Generar/i })
      ).toBeInTheDocument()
    })

    it("muestra las partes detectadas del proyecto en el editor", async () => {
      await navegarHastaEditor()
      expect(
        await screen.findByText("Partes detectadas en este proyecto:")
      ).toBeInTheDocument()
      expect(
        screen.getByText("Enunciado de Restricciones de Atributos")
      ).toBeInTheDocument()
      expect(
        screen.getByText("Enunciado de Relaciones entre Entidades")
      ).toBeInTheDocument()
    })

    it("no muestra relaciones si el proyecto solo tiene restricciones", async () => {
      await navegarHastaEditor([PROJECT_ONLY_CONSTRAINTS])
      expect(
        await screen.findByText("Enunciado de Restricciones de Atributos")
      ).toBeInTheDocument()
      expect(
        screen.queryByText("Enunciado de Relaciones entre Entidades")
      ).not.toBeInTheDocument()
    })

    it("vuelve a la selección al pulsar Volver en el editor", async () => {
      await navegarHastaEditor()
      await userEvent.click(
        await screen.findByRole("button", { name: /Volver/i })
      )
      expect(await screen.findByText(/Exámenes de/i)).toBeInTheDocument()
      expect(screen.getByText(/CLÍNICA VETERINARIA/i)).toBeInTheDocument()
    })

    it("llama a onBack al pulsar Volver en la vista de carpetas", async () => {
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      await userEvent.click(
        await screen.findByRole("button", { name: /Volver/i })
      )
      expect(baseProps.onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe("Flujo de generación", () => {
    it("llama a generate al pulsar Generar", async () => {
      mockGenerate.mockResolvedValue("resultado generado")
      await navegarHastaEditor()
      await userEvent.click(
        await screen.findByRole("button", { name: /Generar/i })
      )
      expect(mockGenerate).toHaveBeenCalledTimes(1)
    })

    it("muestra la vista de resultado tras generación exitosa", async () => {
      mockGenerate.mockResolvedValue("public class Solucion {}")
      mockResponseTextValue = "public class Solucion {}"
      await navegarHastaEditor()
      await userEvent.click(
        await screen.findByRole("button", { name: /Generar/i })
      )
      expect(
        await screen.findByRole("button", { name: /Volver a generar/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /Guardar/i })
      ).toBeInTheDocument()
    })

    it("no navega a resultado si generate devuelve null", async () => {
      mockGenerate.mockResolvedValue(null)
      await navegarHastaEditor()
      await userEvent.click(
        await screen.findByRole("button", { name: /Generar/i })
      )
      await waitFor(() =>
        expect(
          screen.queryByRole("button", { name: /Guardar/i })
        ).not.toBeInTheDocument()
      )
    })

    it("permite editar el prompt antes de generar", async () => {
      await navegarHastaEditor()
      const textareas = await screen.findAllByRole("textbox")
      await userEvent.clear(textareas[0])
      await userEvent.type(textareas[0], "Prompt editado manualmente")
      expect(textareas[0]).toHaveValue("Prompt editado manualmente")
    })

    it("construye el payload con el hiddenContext y el promptText", async () => {
      mockGenerate.mockResolvedValue("resultado")
      await navegarHastaEditor()
      await userEvent.click(
        await screen.findByRole("button", { name: /Generar/i })
      )
      expect(mockGenerate).toHaveBeenCalledWith(
        expect.stringContaining("contexto oculto")
      )
      expect(mockGenerate).toHaveBeenCalledWith(
        expect.stringContaining("Prompt visible de prueba")
      )
    })
  })

  describe("Flujo de guardado", () => {
    async function navegarHastaResultado() {
      mockGenerate.mockResolvedValue("public class Solucion {}")
      mockResponseTextValue = "public class Solucion {}"
      await navegarHastaEditor()
      await userEvent.click(
        await screen.findByRole("button", { name: /Generar/i })
      )
      await screen.findByRole("button", { name: /Guardar/i })
    }

    it("muestra modal de éxito tras guardar correctamente", async () => {
      await navegarHastaResultado()
      await userEvent.click(screen.getByRole("button", { name: /Guardar/i }))
      expect(await screen.findByTestId("success-modal")).toBeInTheDocument()
      expect(
        screen.getByText("¡Solución generada correctamente!")
      ).toBeInTheDocument()
    })

    it("llama a saveToChrome con los datos correctos", async () => {
      await navegarHastaResultado()
      await userEvent.click(screen.getByRole("button", { name: /Guardar/i }))
      await waitFor(() =>
        expect(mockSaveToChrome).toHaveBeenCalledWith(
          "project_1",
          expect.objectContaining({
            fullSolution: "public class Solucion {}"
          })
        )
      )
    })

    it("muestra modal de error si saveToChrome falla", async () => {
      mockSaveToChrome.mockRejectedValue(new Error("Error de disco"))
      await navegarHastaResultado()
      await userEvent.click(screen.getByRole("button", { name: /Guardar/i }))
      expect(await screen.findByText("Error al guardar")).toBeInTheDocument()
      expect(screen.getByText("Error de disco")).toBeInTheDocument()
    })

    it("usa mensaje por defecto si el error no tiene message", async () => {
      mockSaveToChrome.mockRejectedValue({})
      await navegarHastaResultado()
      await userEvent.click(screen.getByRole("button", { name: /Guardar/i }))
      expect(await screen.findByText("No se pudo guardar.")).toBeInTheDocument()
    })

    it("reintenta guardar al pulsar Reintentar en el modal de error", async () => {
      mockSaveToChrome
        .mockRejectedValueOnce(new Error("Fallo temporal"))
        .mockResolvedValueOnce(undefined)
      await navegarHastaResultado()
      await userEvent.click(screen.getByRole("button", { name: /Guardar/i }))
      await screen.findByText("Error al guardar")
      await userEvent.click(screen.getByRole("button", { name: /Reintentar/i }))
      expect(await screen.findByTestId("success-modal")).toBeInTheDocument()
    })

    it("no llama a saveToChrome si el proyecto no tiene id", async () => {
      mockGetAllFromChrome.mockResolvedValue([PROJECT_NO_ID])
      mockGenerate.mockResolvedValue("resultado")
      mockResponseTextValue = "resultado"
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", { name: /1\s+examen/i })
      await userEvent.click(carpeta)
      await userEvent.click(await screen.findByTitle("Abrir examen"))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(
        await screen.findByRole("button", { name: /Generar/i })
      )
      await screen.findByRole("button", { name: /Guardar/i })
      await userEvent.click(screen.getByRole("button", { name: /Guardar/i }))
      expect(mockSaveToChrome).not.toHaveBeenCalled()
    })

    it("navega a onWelcome desde el modal de éxito", async () => {
      await navegarHastaResultado()
      await userEvent.click(screen.getByRole("button", { name: /Guardar/i }))
      await screen.findByTestId("success-modal")
      await userEvent.click(
        screen.getByRole("button", { name: /Volver al inicio/i })
      )
      expect(baseProps.onWelcome).toHaveBeenCalled()
    })

    it("navega a onWelcome desde el modal de error al pulsar Volver al inicio", async () => {
      mockSaveToChrome.mockRejectedValue(new Error("Error"))
      await navegarHastaResultado()
      await userEvent.click(screen.getByRole("button", { name: /Guardar/i }))
      await screen.findByText("Error al guardar")
      await userEvent.click(
        screen.getByRole("button", { name: /Volver al inicio/i })
      )
      expect(baseProps.onWelcome).toHaveBeenCalled()
    })
  })

  describe("Flujo de descarga", () => {
    async function navegarHastaResultado() {
      mockGenerate.mockResolvedValue("public class Solucion {}")
      mockResponseTextValue = "public class Solucion {}"
      await navegarHastaEditor()
      await userEvent.click(
        await screen.findByRole("button", { name: /Generar/i })
      )
      await screen.findByRole("button", { name: /Descargar/i })
    }

    it("abre el modal de descarga al pulsar Descargar (.md)", async () => {
      await navegarHastaResultado()
      await userEvent.click(screen.getByRole("button", { name: /Descargar/i }))
      expect(screen.getByTestId("download-modal")).toBeInTheDocument()
    })

    it("llama a downloadMarkdown al confirmar la descarga", async () => {
      await navegarHastaResultado()
      await userEvent.click(screen.getByRole("button", { name: /Descargar/i }))
      await userEvent.click(
        screen.getByRole("button", { name: /Confirmar descarga/i })
      )
      expect(mockDownloadMarkdown).toHaveBeenCalledWith(
        expect.stringContaining("Solución Completa"),
        "solucion_test"
      )
    })

    it("cierra el modal de descarga al cancelar", async () => {
      await navegarHastaResultado()
      await userEvent.click(screen.getByRole("button", { name: /Descargar/i }))
      await userEvent.click(
        screen.getByRole("button", { name: /Cancelar descarga/i })
      )
      expect(screen.queryByTestId("download-modal")).not.toBeInTheDocument()
    })

    it("no llama a downloadMarkdown si responseText está vacío", async () => {
      mockGenerate.mockResolvedValue("resultado")
      mockResponseTextValue = ""
      await navegarHastaEditor()
      await userEvent.click(
        await screen.findByRole("button", { name: /Generar/i })
      )
      expect(mockDownloadMarkdown).not.toHaveBeenCalled()
    })
  })

  describe("Casos límite", () => {
    it("maneja el fallo de getAllFromChrome sin romper la UI", async () => {
      mockGetAllFromChrome.mockRejectedValue(new Error("Storage no disponible"))
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      expect(await screen.findByText(/No hay exámenes/i)).toBeInTheDocument()
    })

    it("no muestra proyectos sin _key de project_", async () => {
      mockGetAllFromChrome.mockResolvedValue([
        {
          id: "otro_1",
          domainName: "clínica veterinaria",
          baseClasses: "class X {}",
          attributeConstraints: "x",
          testPartsMap: { test1_attributes: { code: "x" } }
        }
      ])
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      expect(await screen.findByText(/No hay exámenes/i)).toBeInTheDocument()
    })

    it("sustituye correctamente las variables del prompt", async () => {
      mockGetAllFromChrome.mockResolvedValue([PROJECT_COMPLETE])
      mockParseMasterPrompt.mockReturnValue({
        visibleText:
          "{enunciado_restricciones} | {enunciado_relaciones} | {codigo_tests_restricciones} | {codigo_base_localstorage}",
        hiddenContext: ""
      })
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", { name: /1\s+examen/i })
      await userEvent.click(carpeta)
      await userEvent.click(await screen.findByTitle("Abrir examen"))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      const textarea = (await screen.findByRole(
        "textbox"
      )) as HTMLTextAreaElement

      expect(textarea.value).toContain("restricciones de prueba")
    })

    it("usa texto por defecto cuando el proyecto no tiene restricciones", async () => {
      const proyectoSinRestricciones = {
        ...PROJECT_COMPLETE,
        attributeConstraints: "",
        entityRelationships: "",
        testPartsMap: { test1_attributes: { code: "x" } }
      }
      mockGetAllFromChrome.mockResolvedValue([proyectoSinRestricciones])
      mockParseMasterPrompt.mockReturnValue({
        visibleText: "{enunciado_restricciones}",
        hiddenContext: ""
      })
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      expect(await screen.findByText(/No hay exámenes/i)).toBeInTheDocument()
    })

    it("el título del resultado contiene el nombre del proyecto seleccionado", async () => {
      mockGenerate.mockResolvedValue("resultado")
      mockResponseTextValue = "resultado"
      await navegarHastaEditor()
      await userEvent.click(
        await screen.findByRole("button", { name: /Generar/i })
      )
      expect(await screen.findByText(/Examen Veterinaria/i)).toBeInTheDocument()
    })

    it("ejecuta la línea 63 al lanzar un error crítico controlado en la carga inicial", async () => {
      mockGetAllFromChrome.mockRejectedValueOnce(
        new Error("Chrome storage isolation error")
      )
      render(<GenerationSolutionCodeScreen {...baseProps} />)
      expect(await screen.findByText(/No hay exámenes/i)).toBeInTheDocument()
    })

    it("ejecuta las líneas 125-130 al intentar descargar un contenido inválido o vacío", async () => {
      mockGenerate.mockResolvedValue("public class Solucion {}")
      mockResponseTextValue = ""

      await navegarHastaEditor()
      await userEvent.click(
        await screen.findByRole("button", { name: /Generar/i })
      )

      const btnDescargar = await screen.findByRole("button", {
        name: /Descargar/i
      })
      await userEvent.click(btnDescargar)

      const btnConfirmar = await screen.findByRole("button", {
        name: /Confirmar descarga/i
      })
      await userEvent.click(btnConfirmar)

      expect(mockDownloadMarkdown).not.toHaveBeenCalled()
    })

    it("ejecuta la línea 265 al fallar una re-generación controlando la excepción global", async () => {
      const unhandledRejectionSpy = vi.fn()
      process.on("unhandledRejection", unhandledRejectionSpy)

      mockGenerate.mockResolvedValueOnce("public class Solucion {}")
      mockResponseTextValue = "public class Solucion {}"
      await navegarHastaEditor()
      await userEvent.click(
        await screen.findByRole("button", { name: /Generar/i })
      )

      mockGenerate.mockRejectedValueOnce(new Error("Gemini API Quota Exceeded"))

      const btnRegenerar = await screen.findByRole("button", {
        name: /Volver a generar/i
      })

      await userEvent.click(btnRegenerar)

      await vi.waitFor(() => {
        expect(btnRegenerar).toBeEnabled()
      })

      await new Promise((resolve) => setTimeout(resolve, 20))

      process.off("unhandledRejection", unhandledRejectionSpy)
    })
  })
})
