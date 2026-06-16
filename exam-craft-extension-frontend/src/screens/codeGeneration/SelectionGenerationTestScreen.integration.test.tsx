import React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi, describe, it, expect, beforeEach } from "vitest"
import "@testing-library/jest-dom"
import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import SelectionGenerationTestScreen from "./SelectionGenerationTestScreen"
import { getAllFromChrome } from "~src/utils/chromeStorageUtils"

expect.extend(jestDomMatchers)

// =========================================================
// MOCKS DE DEPENDENCIAS Y COMPONENTES
// =========================================================

// Mock de la utilidad de Chrome Storage
vi.mock("~src/utils/chromeStorageUtils", () => ({
  getAllFromChrome: vi.fn()
}))

// Mock de Header para evaluar props básicas
vi.mock("~src/components/Header", () => ({
  Header: ({ onWelcome, breadcrumbItems, currentStep }: any) => (
    <header data-testid="header-mock">
      <span data-testid="current-step">{currentStep}</span>
      <button onClick={onWelcome}>Logo Inicio</button>
      <nav data-testid="breadcrumbs">
        {breadcrumbItems.map((item: any) => (
          <button key={item.label} onClick={item.action}>
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  )
}))

// Mock de FolderExamSelector para no heredar su lógica interna pesada
vi.mock("../../components/FolderExamsSelector", () => ({
  FolderExamSelector: ({ projects, onSelectProject, onBack, displayName }: any) => (
    <div data-testid="selector-step-mock">
      <button onClick={onBack}>Volver Selector</button>
      <ul>
        {projects.map((proj: any) => (
          <li key={proj._key}>
            <button onClick={() => onSelectProject(proj)}>
              {displayName(proj)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}))

// Datos simulados (Exámenes válidos e inválidos según los filtros del useEffect)
const mockProjects = [
  {
    _key: "project_valido_1",
    domainName: "Matematicas",
    baseClasses: "class Base { length > 10 caracteres }",
    attributeConstraints: "constraints { length > 10 caracteres }",
    entityRelationships: "relationships { length > 10 caracteres }",
    customName: "Examen Final A",
    testPartsMap: {
      test1_attributes: { code: "  " }, // Vacío
      test2_relationships: { code: "const valid = true;" } // Con tests existentes
    }
  },
  {
    _key: "project_invalido_corto", // Se filtrará por longitud de strings
    domainName: "Historia",
    baseClasses: "corto",
    attributeConstraints: "corto"
  }
]

const defaultProps = {
  onBack: vi.fn(),
  onWelcome: vi.fn(),
  onCreateExam: vi.fn(),
  onCreateExamByParts: vi.fn(),
  onCreateTest1: vi.fn(),
  onCodeGeneration: vi.fn()
}

describe("Integración: SelectionGenerationTestScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Comportamiento por defecto: devuelve la lista de proyectos simulados
    vi.mocked(getAllFromChrome).mockResolvedValue(mockProjects)
  })

  // =========================================================
  // RENDERIZADO INICIAL Y FLUJO DE DATOS (PASO 1: SELECTOR)
  // =========================================================
  describe("Paso 1: Selector de Proyectos", () => {
    it("pasa la configuración exacta al Header al inicializarse", async () => {
      render(<SelectionGenerationTestScreen {...defaultProps} />)

      expect(screen.getByTestId("header-mock")).toBeInTheDocument()
      expect(screen.getByTestId("current-step")).toHaveTextContent("TESTS")
      
      expect(screen.getByRole("button", { name: "INICIO" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "CREAR EXAMEN" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "POR PARTES" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "CÓDIGO" })).toBeInTheDocument()
    })

    it("filtra y carga los proyectos válidos desde el almacenamiento de Chrome", async () => {
      render(<SelectionGenerationTestScreen {...defaultProps} />)

      // Esperamos a que se resuelva la promesa del useEffect y se renderice el mock del selector
      await waitFor(() => {
        expect(screen.getByTestId("selector-step-mock")).toBeInTheDocument()
      })

      // El proyecto válido usa su customName ("Examen Final A")
      expect(screen.getByRole("button", { name: "Examen Final A" })).toBeInTheDocument()
      // El proyecto inválido no debe aparecer en la lista
      expect(screen.queryByRole("button", { name: /Historia/i })).not.toBeInTheDocument()
    })

    it("ejecuta los callbacks de navegación del Header y del Selector", async () => {
      render(<SelectionGenerationTestScreen {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Logo Inicio" }))
      expect(defaultProps.onWelcome).toHaveBeenCalledTimes(1)

      await userEvent.click(screen.getByRole("button", { name: "CÓDIGO" }))
      expect(defaultProps.onCodeGeneration).toHaveBeenCalledTimes(1)

      await waitFor(() => screen.getByRole("button", { name: "Volver Selector" }))
      await userEvent.click(screen.getByRole("button", { name: "Volver Selector" }))
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1)
    })
  })

  // =========================================================
  // SELECCIÓN Y CONFIGURACIÓN DE PARTES (PASO 2: PARTS)
  // =========================================================
  describe("Paso 2: Selección de Partes a Evaluar", () => {
    const avanzarAlPasoPartes = async () => {
      render(<SelectionGenerationTestScreen {...defaultProps} />)
      const proyectoBtn = await screen.findByRole("button", { name: "Examen Final A" })
      await userEvent.click(proyectoBtn)
    }

    it("cambia de paso y muestra las partes evaluables del proyecto seleccionado", async () => {
      await avanzarAlPasoPartes()

      expect(screen.getByRole("heading", { name: "¿Qué parte quieres evaluar?", level: 1 })).toBeInTheDocument()
      
      // Deben renderizarse las dos opciones disponibles basadas en las keys del JSON del proyecto
      expect(screen.getByRole("button", { name: /Restricciones de Atributos/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Relaciones entre Entidades/i })).toBeInTheDocument()
    })

    it("permite regresar al paso del selector mediante el botón Volver", async () => {
      await avanzarAlPasoPartes()

      const btnVolver = screen.getByRole("button", { name: "Volver" })
      await userEvent.click(btnVolver)

      // Regresa al paso anterior
      expect(screen.getByTestId("selector-step-mock")).toBeInTheDocument()
      expect(screen.queryByRole("heading", { name: "¿Qué parte quieres evaluar?" })).not.toBeInTheDocument()
    })
  })

  // =========================================================
  // PORTAL: MODAL DE CONFIRMACIÓN Y SOBREESCRITURA
  // =========================================================
  // =========================================================
  // PORTAL: MODAL DE CONFIRMACIÓN Y SOBREESCRITURA
  // =========================================================
  describe("Flujo del Modal de Confirmación (Portales)", () => {
    const avanzarAlPasoPartes = async () => {
      render(<SelectionGenerationTestScreen {...defaultProps} />)
      const proyectoBtn = await screen.findByRole("button", { name: "Examen Final A" })
      await userEvent.click(proyectoBtn)
    }

    it("abre el modal sin advertencia si la parte seleccionada no tiene tests previos", async () => {
      await avanzarAlPasoPartes()

      // Hacemos click en "Restricciones de Atributos" (test1_attributes está vacío)
      const btnAtributos = screen.getByRole("button", { name: /Restricciones de Atributos/i })
      await userEvent.click(btnAtributos)

      // Validamos por su cabecera h3 en lugar de "dialog"
      const modalTitle = screen.getByRole("heading", { name: "Confirmar Parte", level: 3 })
      expect(modalTitle).toBeInTheDocument()
      
      expect(screen.getByText(/¿Deseas utilizar el ejercicio seleccionado como base para generar los tests de Restricciones de Atributos?/i)).toBeInTheDocument()
      expect(screen.queryByText(/Al generar nuevos se sobrescribirán los anteriores/i)).not.toBeInTheDocument()
    })

    it("abre el modal con mensaje de advertencia si la parte seleccionada ya tiene tests guardados", async () => {
      await avanzarAlPasoPartes()

      // Hacemos click en "Relaciones entre Entidades" (test2_relationships tiene código)
      const btnRelaciones = screen.getByRole("button", { name: /Relaciones entre Entidades/i })
      await userEvent.click(btnRelaciones)

      expect(screen.getByRole("heading", { name: "Confirmar Examen", level: 3 })).toBeInTheDocument()
      expect(screen.getByText(/Ya existen tests guardados para Relaciones entre Entidades. Al generar nuevos se sobrescribirán los anteriores./i)).toBeInTheDocument()
    })

    it("cierra el modal sin realizar acciones al presionar Cancelar", async () => {
      await avanzarAlPasoPartes()

      await userEvent.click(screen.getByRole("button", { name: /Restricciones de Atributos/i }))
      
      // Verificamos que el modal está presente asegurando que existe el botón Cancelar
      const btnCancelar = screen.getByRole("button", { name: "Cancelar" })
      expect(btnCancelar).toBeInTheDocument()

      // Hacemos click en Cancelar
      await userEvent.click(btnCancelar)
      
      // Al cerrarse, el botón Cancelar y el título ya no deben existir en el DOM
      expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument()
      expect(screen.queryByRole("heading", { name: "Confirmar Parte", level: 3 })).not.toBeInTheDocument()
      expect(defaultProps.onCreateTest1).not.toHaveBeenCalled()
    })

    it("ejecuta onCreateTest1 con el payload correspondiente al confirmar la acción", async () => {
      await avanzarAlPasoPartes()

      await userEvent.click(screen.getByRole("button", { name: /Restricciones de Atributos/i }))
      
      const btnConfirmar = screen.getByRole("button", { name: "Confirmar" })
      await userEvent.click(btnConfirmar)

      expect(defaultProps.onCreateTest1).toHaveBeenCalledTimes(1)
      expect(defaultProps.onCreateTest1).toHaveBeenCalledWith({
        project: mockProjects[0],
        constraints: mockProjects[0].attributeConstraints,
        entityRelationships: mockProjects[0].entityRelationships,
        baseClass: mockProjects[0].baseClasses,
        targetType: "attributes"
      })
      
      // El modal debe desaparecer tras confirmar
      expect(screen.queryByRole("button", { name: "Confirmar" })).not.toBeInTheDocument()
    })
  })
})