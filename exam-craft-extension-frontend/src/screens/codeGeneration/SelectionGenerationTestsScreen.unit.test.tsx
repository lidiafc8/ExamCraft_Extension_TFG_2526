import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import {
  cleanup,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import SelectionGenerationTestScreen from "./SelectionGenerationTestScreen"

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

const mockGetAllFromChrome = vi.fn()
vi.mock("~src/utils/chromeStorageUtils", () => ({
  getAllFromChrome: (...args: any[]) => mockGetAllFromChrome(...args)
}))

vi.mock("../../../assets/images/exam_part_storage.png", () => ({
  default: "exam_part_storage.png"
}))

vi.mock("../../../assets/images/archive.png", () => ({
  default: "archive.png"
}))

vi.mock("../../../assets/images/exam.png", () => ({
  default: "exam.png"
}))

vi.mock("../../../src/css/Cards.css", () => ({}))

const PROJECT_BOTH_PARTS = {
  _key: "project_1",
  id: "project_1",
  domainName: "clínica veterinaria",
  customName: "Examen Veterinaria",
  baseClasses: "class Animal {}",
  attributeConstraints: "restricciones de prueba largas para pasar el filtro",
  entityRelationships: "relaciones de prueba largas para pasar el filtro",
  testPartsMap: {
    test1_attributes: { code: "test attr code" }
  }
}

const PROJECT_ONLY_ATTRIBUTES: any = {
  _key: "project_2",
  id: "project_2",
  domainName: "clínica veterinaria",
  customName: "Examen Solo Atributos",
  baseClasses: "class Animal {}",
  attributeConstraints: "restricciones de prueba largas para pasar el filtro",
  testPartsMap: {}
}

const PROJECT_ONLY_RELATIONSHIPS = {
  _key: "project_3",
  id: "project_3",
  domainName: "clínica veterinaria",
  customName: "Examen Solo Relaciones",
  baseClasses: "class Animal {}",
  attributeConstraints: "",
  entityRelationships: "relaciones de prueba largas para pasar el filtro",
  testPartsMap: {
    test2_relationships: { code: "test rel code" }
  }
}

const PROJECT_NO_BASE_CLASS = {
  _key: "project_4",
  id: "project_4",
  domainName: "informática",
  customName: "Sin Clases Base",
  baseClasses: "",
  attributeConstraints: "restricciones largas para pasar el filtro de verdad",
  entityRelationships: ""
}

const PROJECT_SHORT_FIELDS = {
  _key: "project_5",
  id: "project_5",
  domainName: "informática",
  customName: "Campos Cortos",
  baseClasses: "short",
  attributeConstraints: "short",
  entityRelationships: "short"
}

const PROJECT_NOT_PREFIXED = {
  _key: "otro_1",
  id: "otro_1",
  domainName: "clínica veterinaria",
  customName: "No es proyecto",
  baseClasses: "class Animal {}",
  attributeConstraints: "restricciones de prueba largas para pasar el filtro",
  entityRelationships: ""
}

const PROJECT_SECOND_IN_SAME_FOLDER = {
  _key: "project_8",
  id: "project_8",
  domainName: "clínica veterinaria",
  customName: "Segundo Examen Veterinaria",
  baseClasses: "class Gato {}",
  attributeConstraints: "restricciones de prueba largas para pasar el filtro",
  entityRelationships: "",
  testPartsMap: {}
}

const baseProps = {
  onBack: vi.fn(),
  onWelcome: vi.fn(),
  onCreateExam: vi.fn(),
  onCreateExamByParts: vi.fn(),
  onCreateTest1: vi.fn(),
  onCodeGeneration: vi.fn()
}

beforeEach(() => {
  cleanup()
  vi.clearAllMocks()
  mockGetAllFromChrome.mockResolvedValue([PROJECT_BOTH_PARTS])
})

describe("SelectionGenerationTestScreen", () => {
  describe("Renderizado inicial", () => {
    it("renderiza el Header con currentStep TESTS", async () => {
      render(<SelectionGenerationTestScreen {...baseProps} />)
      expect(screen.getByText("Step: TESTS")).toBeInTheDocument()
    })

    it("muestra la vista de selección de carpetas al montar", async () => {
      render(<SelectionGenerationTestScreen {...baseProps} />)
      expect(await screen.findByText("MIS EXÁMENES")).toBeInTheDocument()
    })

    it("no muestra el modal de confirmación de parte al montar", () => {
      render(<SelectionGenerationTestScreen {...baseProps} />)
      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument()
    })

    it("muestra mensaje vacío personalizado si no hay proyectos válidos", async () => {
      mockGetAllFromChrome.mockResolvedValue([PROJECT_NO_BASE_CLASS])
      render(<SelectionGenerationTestScreen {...baseProps} />)
      expect(
        await screen.findByText(
          /No hay exámenes con clases base y partes generadas/i
        )
      ).toBeInTheDocument()
    })

    it("filtra proyectos cuyos campos no superan los 10 caracteres", async () => {
      mockGetAllFromChrome.mockResolvedValue([PROJECT_SHORT_FIELDS])
      render(<SelectionGenerationTestScreen {...baseProps} />)
      expect(
        await screen.findByText(
          /No hay exámenes con clases base y partes generadas/i
        )
      ).toBeInTheDocument()
    })

    it("incluye un proyecto que solo tiene attributeConstraints válido", async () => {
      mockGetAllFromChrome.mockResolvedValue([PROJECT_ONLY_ATTRIBUTES])
      render(<SelectionGenerationTestScreen {...baseProps} />)
      expect(
        await screen.findByRole("button", {
          name: /CLÍNICA VETERINARIA/i
        })
      ).toBeInTheDocument()
    })

    it("incluye un proyecto que solo tiene entityRelationships válido", async () => {
      mockGetAllFromChrome.mockResolvedValue([PROJECT_ONLY_RELATIONSHIPS])
      render(<SelectionGenerationTestScreen {...baseProps} />)
      expect(
        await screen.findByRole("button", {
          name: /CLÍNICA VETERINARIA/i
        })
      ).toBeInTheDocument()
    })

    it("ignora elementos cuyo _key no empieza por 'project_'", async () => {
      mockGetAllFromChrome.mockResolvedValue([PROJECT_NOT_PREFIXED])
      render(<SelectionGenerationTestScreen {...baseProps} />)
      expect(
        await screen.findByText(
          /No hay exámenes con clases base y partes generadas/i
        )
      ).toBeInTheDocument()
    })

    it("maneja el fallo de getAllFromChrome sin romper la UI", async () => {
      mockGetAllFromChrome.mockRejectedValue(new Error("Storage no disponible"))
      render(<SelectionGenerationTestScreen {...baseProps} />)
      expect(
        await screen.findByText(
          /No hay exámenes con clases base y partes generadas/i
        )
      ).toBeInTheDocument()
    })

    it("muestra el contador de exámenes correctamente en la carpeta", async () => {
      mockGetAllFromChrome.mockResolvedValue([
        PROJECT_BOTH_PARTS,
        PROJECT_SECOND_IN_SAME_FOLDER
      ])
      render(<SelectionGenerationTestScreen {...baseProps} />)
      expect(await screen.findByText(/2 EXÁMENES/i)).toBeInTheDocument()
    })
  })
  describe("Breadcrumbs", () => {
    it("llama a onWelcome al pulsar INICIO", async () => {
      render(<SelectionGenerationTestScreen {...baseProps} />)
      await userEvent.click(screen.getByRole("button", { name: "INICIO" }))
      expect(baseProps.onWelcome).toHaveBeenCalledTimes(1)
    })

    it("llama a onCreateExam al pulsar CREAR EXAMEN", async () => {
      render(<SelectionGenerationTestScreen {...baseProps} />)
      await userEvent.click(
        screen.getByRole("button", { name: "CREAR EXAMEN" })
      )
      expect(baseProps.onCreateExam).toHaveBeenCalledTimes(1)
    })

    it("llama a onCreateExamByParts al pulsar POR PARTES", async () => {
      render(<SelectionGenerationTestScreen {...baseProps} />)
      await userEvent.click(screen.getByRole("button", { name: "POR PARTES" }))
      expect(baseProps.onCreateExamByParts).toHaveBeenCalledTimes(1)
    })

    it("llama a onCodeGeneration al pulsar CÓDIGO", async () => {
      render(<SelectionGenerationTestScreen {...baseProps} />)
      await userEvent.click(screen.getByRole("button", { name: "CÓDIGO" }))
      expect(baseProps.onCodeGeneration).toHaveBeenCalledTimes(1)
    })

    it("llama a onWelcome al pulsar el logo del Header", async () => {
      render(<SelectionGenerationTestScreen {...baseProps} />)
      await userEvent.click(
        screen.getByRole("button", { name: "Welcome Link" })
      )
      expect(baseProps.onWelcome).toHaveBeenCalledTimes(1)
    })
  })

  describe("Flujo de selección de proyecto", () => {
    it("llama a onBack al pulsar Volver en la vista de carpetas", async () => {
      render(<SelectionGenerationTestScreen {...baseProps} />)
      await userEvent.click(
        await screen.findByRole("button", { name: /^Volver$/ })
      )
      expect(baseProps.onBack).toHaveBeenCalledTimes(1)
    })

    it("navega a la carpeta al hacer clic en ella", async () => {
      render(<SelectionGenerationTestScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", {
        name: /CLÍNICA VETERINARIA/i
      })
      await userEvent.click(carpeta)
      expect(await screen.findByTitle("Abrir examen")).toBeInTheDocument()
    })

    it("muestra el título de la carpeta seleccionada", async () => {
      render(<SelectionGenerationTestScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", {
        name: /CLÍNICA VETERINARIA/i
      })
      await userEvent.click(carpeta)
      expect(
        await screen.findByText(/Exámenes de CLÍNICA VETERINARIA/i)
      ).toBeInTheDocument()
    })

    it("muestra la pantalla de selección de partes al elegir un proyecto", async () => {
      render(<SelectionGenerationTestScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", {
        name: /CLÍNICA VETERINARIA/i
      })
      await userEvent.click(carpeta)
      await userEvent.click(await screen.findByTitle("Abrir examen"))
      expect(
        await screen.findByText("¿Qué parte quieres evaluar?")
      ).toBeInTheDocument()
    })

    it("muestra ambas tarjetas si el proyecto tiene ambas partes evaluables", async () => {
      render(<SelectionGenerationTestScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", {
        name: /CLÍNICA VETERINARIA/i
      })
      await userEvent.click(carpeta)
      await userEvent.click(await screen.findByTitle("Abrir examen"))
      expect(
        await screen.findByText("Restricciones de Atributos")
      ).toBeInTheDocument()
      expect(screen.getByText("Relaciones entre Entidades")).toBeInTheDocument()
    })

    it("muestra solo la tarjeta de Restricciones de Atributos si entityRelationships está vacío", async () => {
      mockGetAllFromChrome.mockResolvedValue([PROJECT_ONLY_ATTRIBUTES])
      render(<SelectionGenerationTestScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", {
        name: /CLÍNICA VETERINARIA/i
      })
      await userEvent.click(carpeta)
      await userEvent.click(await screen.findByTitle("Abrir examen"))
      expect(
        await screen.findByText("Restricciones de Atributos")
      ).toBeInTheDocument()
      expect(
        screen.queryByText("Relaciones entre Entidades")
      ).not.toBeInTheDocument()
    })

    it("vuelve a la vista de carpetas al pulsar Volver en la pantalla de partes", async () => {
      render(<SelectionGenerationTestScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", {
        name: /CLÍNICA VETERINARIA/i
      })
      await userEvent.click(carpeta)
      await userEvent.click(await screen.findByTitle("Abrir examen"))
      await userEvent.click(
        await screen.findByRole("button", { name: /^Volver$/ })
      )
      expect(
        await screen.findByText(/Exámenes de CLÍNICA VETERINARIA/i)
      ).toBeInTheDocument()
    })

    it("usa customName como displayName si está presente", async () => {
      render(<SelectionGenerationTestScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", {
        name: /CLÍNICA VETERINARIA/i
      })
      await userEvent.click(carpeta)
      expect(await screen.findByText("Examen Veterinaria")).toBeInTheDocument()
    })

    it("genera displayName con 'Examen de <dominio>' si no hay customName", async () => {
      const projectSinCustomName = {
        ...PROJECT_BOTH_PARTS,
        customName: undefined
      }
      mockGetAllFromChrome.mockResolvedValue([projectSinCustomName])
      render(<SelectionGenerationTestScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", {
        name: /CLÍNICA VETERINARIA/i
      })
      await userEvent.click(carpeta)
      expect(
        await screen.findByText(/Examen de clínica veterinaria/i)
      ).toBeInTheDocument()
    })

    it("vuelve de la lista de exámenes a la lista de carpetas con el botón Volver del FolderExamSelector", async () => {
      render(<SelectionGenerationTestScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", {
        name: /CLÍNICA VETERINARIA/i
      })
      await userEvent.click(carpeta)
      await screen.findByTitle("Abrir examen")
      await userEvent.click(
        await screen.findByRole("button", { name: /^Volver$/ })
      )
      expect(await screen.findByText("MIS EXÁMENES")).toBeInTheDocument()
    })
  })

  describe("Modal de confirmación de parte", () => {
    async function navegarHastaPartes(proyectos: any[] = [PROJECT_BOTH_PARTS]) {
      mockGetAllFromChrome.mockResolvedValue(proyectos)
      render(<SelectionGenerationTestScreen {...baseProps} />)
      const carpeta = await screen.findByRole("button", {
        name: /CLÍNICA VETERINARIA/i
      })
      await userEvent.click(carpeta)
      await userEvent.click(await screen.findByTitle("Abrir examen"))
    }

    it("abre el modal 'Confirmar Examen' cuando ya existen tests para entityRelationships", async () => {
      await navegarHastaPartes([PROJECT_ONLY_RELATIONSHIPS])
      await userEvent.click(
        await screen.findByText("Relaciones entre Entidades")
      )
      expect(screen.getByTestId("confirm-modal")).toBeInTheDocument()
      expect(screen.getByText("Confirmar Examen")).toBeInTheDocument()
      expect(screen.getByTestId("confirm-warning")).toBeInTheDocument()
    })

    it("abre el modal 'Confirmar Parte' (sin advertencia) cuando no hay tests previos", async () => {
      await navegarHastaPartes([PROJECT_ONLY_ATTRIBUTES])
      await userEvent.click(
        await screen.findByText("Restricciones de Atributos")
      )
      expect(screen.getByTestId("confirm-modal")).toBeInTheDocument()
      expect(screen.getByText("Confirmar Parte")).toBeInTheDocument()
      expect(screen.queryByTestId("confirm-warning")).not.toBeInTheDocument()
    })

    it("abre el modal 'Confirmar Examen' con advertencia cuando ya existen tests para attributeConstraints", async () => {
      await navegarHastaPartes([PROJECT_BOTH_PARTS])
      await userEvent.click(
        await screen.findByText("Restricciones de Atributos")
      )
      expect(screen.getByText("Confirmar Examen")).toBeInTheDocument()
      expect(screen.getByTestId("confirm-warning")).toBeInTheDocument()
      expect(
        screen.getByText(/Ya existen tests guardados/i)
      ).toBeInTheDocument()
    })

    it("muestra el mensaje correcto en el modal según la parte seleccionada", async () => {
      await navegarHastaPartes([PROJECT_BOTH_PARTS])
      await userEvent.click(
        await screen.findByRole("button", {
          name: /Relaciones entre Entidades/i
        })
      )
      const modal = screen.getByTestId("confirm-modal")
      expect(
        within(modal).getByText(/Relaciones entre Entidades/)
      ).toBeInTheDocument()
    })

    it("cierra el modal al cancelar sin invocar onCreateTest1", async () => {
      await navegarHastaPartes([PROJECT_BOTH_PARTS])
      await userEvent.click(
        await screen.findByText("Restricciones de Atributos")
      )
      await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument()
      expect(baseProps.onCreateTest1).not.toHaveBeenCalled()
    })

    it("llama a onCreateTest1 con targetType 'attributes' al confirmar Restricciones de Atributos", async () => {
      await navegarHastaPartes([PROJECT_BOTH_PARTS])
      await userEvent.click(
        await screen.findByText("Restricciones de Atributos")
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      expect(baseProps.onCreateTest1).toHaveBeenCalledWith({
        project: PROJECT_BOTH_PARTS,
        constraints: PROJECT_BOTH_PARTS.attributeConstraints,
        entityRelationships: PROJECT_BOTH_PARTS.entityRelationships,
        baseClass: PROJECT_BOTH_PARTS.baseClasses,
        targetType: "attributes"
      })
    })

    it("llama a onCreateTest1 con targetType 'entityRelationships' al confirmar Relaciones entre Entidades", async () => {
      await navegarHastaPartes([PROJECT_BOTH_PARTS])
      await userEvent.click(
        await screen.findByText("Relaciones entre Entidades")
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      expect(baseProps.onCreateTest1).toHaveBeenCalledWith({
        project: PROJECT_BOTH_PARTS,
        constraints: PROJECT_BOTH_PARTS.attributeConstraints,
        entityRelationships: PROJECT_BOTH_PARTS.entityRelationships,
        baseClass: PROJECT_BOTH_PARTS.baseClasses,
        targetType: "entityRelationships"
      })
    })

    it("cierra el modal tras confirmar y limpia pendingPartKey", async () => {
      await navegarHastaPartes([PROJECT_BOTH_PARTS])
      await userEvent.click(
        await screen.findByText("Restricciones de Atributos")
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await waitFor(() =>
        expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument()
      )
    })

    it("usa fallback de string vacío en entityRelationships si no existe en el proyecto", async () => {
      const projectSinCampos = {
        _key: "project_7",
        id: "project_7",
        domainName: "clínica veterinaria",
        customName: "Sin Campos",
        baseClasses: "class Animal {}",
        attributeConstraints:
          "restricciones de prueba largas para pasar el filtro",
        entityRelationships: undefined,
        testPartsMap: {}
      }
      await navegarHastaPartes([projectSinCampos])
      await userEvent.click(
        await screen.findByText("Restricciones de Atributos")
      )
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      expect(baseProps.onCreateTest1).toHaveBeenCalledWith(
        expect.objectContaining({
          entityRelationships: ""
        })
      )
    })

    it("no muestra advertencia si entityRelationships no tiene tests previos con código vacío", async () => {
      const projectSinTestsRelaciones = {
        ...PROJECT_ONLY_RELATIONSHIPS,
        testPartsMap: {
          test2_relationships: { code: "" }
        }
      }
      await navegarHastaPartes([projectSinTestsRelaciones])
      await userEvent.click(
        await screen.findByText("Relaciones entre Entidades")
      )
      expect(screen.getByText("Confirmar Parte")).toBeInTheDocument()
      expect(screen.queryByTestId("confirm-warning")).not.toBeInTheDocument()
    })

    it("no muestra advertencia si testPartsMap no existe en el proyecto", async () => {
      const projectSinTestPartsMap: any = {
        _key: "project_10",
        id: "project_10",
        domainName: "clínica veterinaria",
        customName: "Sin TestPartsMap",
        baseClasses: "class Animal {}",
        attributeConstraints:
          "restricciones de prueba largas para pasar el filtro",
        entityRelationships: ""
      }
      await navegarHastaPartes([projectSinTestPartsMap])
      await userEvent.click(
        await screen.findByText("Restricciones de Atributos")
      )
      expect(screen.getByText("Confirmar Parte")).toBeInTheDocument()
      expect(screen.queryByTestId("confirm-warning")).not.toBeInTheDocument()
    })
  })

  describe("Casos límite adicionales", () => {
    it("genera displayName uniendo los dominios con ', ' cuando domainName es un array y no hay customName", async () => {
      vi.resetModules()
      vi.doMock("../../components/FolderExamsSelector", () => ({
        FolderExamSelector: ({ projects, displayName }: any) => (
          <div>
            {projects.map((p: any) => (
              <span key={p.id}>{displayName(p)}</span>
            ))}
          </div>
        )
      }))

      const { default: ScreenWithMockedSelector } = await import(
        "./SelectionGenerationTestScreen"
      )

      const projectArrayDomainSinCustomName = {
        _key: "project_12",
        id: "project_12",
        domainName: ["clínica veterinaria", "informática"],
        customName: undefined,
        baseClasses: "class Animal {}",
        attributeConstraints:
          "restricciones de prueba largas para pasar el filtro",
        entityRelationships: "",
        testPartsMap: {}
      }
      mockGetAllFromChrome.mockResolvedValue([projectArrayDomainSinCustomName])

      render(<ScreenWithMockedSelector {...baseProps} />)

      expect(
        await screen.findByText("Examen de clínica veterinaria, informática")
      ).toBeInTheDocument()

      vi.doUnmock("../../components/FolderExamsSelector")
    })
  })
})
