import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi, describe, it, expect, beforeEach } from "vitest"
import "@testing-library/jest-dom"
import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import StatementPartSelectionScreen from "./StatementPartSelectionScreen"

expect.extend(jestDomMatchers)

// Mockeamos el subcomponente Header para simplificar la integración y validar las props que recibe
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

const defaultProps = {
  onBack: vi.fn(),
  onWelcome: vi.fn(),
  onCreateExamByParts: vi.fn(),
  onFunctionalExtension: vi.fn(),
  onAttributesConstraints: vi.fn(),
  onEntityRelationships: vi.fn()
}

describe("Integración: StatementPartSelectionScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================
  // CASOS POSITIVOS: RENDERIZADO VISUAL
  // =========================================================
  describe("Casos Positivos: Renderizado", () => {
    it("renderiza correctamente los títulos de la sección y las instrucciones", () => {
      render(<StatementPartSelectionScreen {...defaultProps} />)

      expect(screen.getByRole("heading", { name: "GENERACIÓN DE ENUNCIADO", level: 1 })).toBeInTheDocument()
      expect(screen.getByText("¿Qué parte del enunciado te gustaría generar primero?")).toBeInTheDocument()
    })

    it("pasa las propiedades de navegación y paso actual de forma correcta al subcomponente Header", () => {
      render(<StatementPartSelectionScreen {...defaultProps} />)

      expect(screen.getByTestId("header-mock")).toBeInTheDocument()
      expect(screen.getByTestId("current-step")).toHaveTextContent("ENUNCIADO")
      
      // Comprobar que las migas de pan se enviaron con sus respectivas etiquetas
      expect(screen.getByRole("button", { name: "INICIO" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "CREAR EXAMEN" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "POR PARTES" })).toBeInTheDocument()
    })

    it("renderiza todos los botones del menú de selección y el botón de regreso", () => {
      render(<StatementPartSelectionScreen {...defaultProps} />)

      expect(screen.getByRole("button", { name: "Extensión funcional" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Restricciones de atributos" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Relaciones entre entidades" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument()
    })
  })

  // =========================================================
  // CASOS POSITIVOS: INTERACCIONES Y CALLBACKS
  // =========================================================
  describe("Casos Positivos: Interacciones", () => {
    it("ejecuta los callbacks del Header al interactuar con el logo o las migas de pan", async () => {
      render(<StatementPartSelectionScreen {...defaultProps} />)

      // Clic en el botón onWelcome del logo principal
      await userEvent.click(screen.getByRole("button", { name: "Logo Inicio" }))
      expect(defaultProps.onWelcome).toHaveBeenCalledTimes(1)

      // Clic en las migas de pan
      await userEvent.click(screen.getByRole("button", { name: "INICIO" }))
      expect(defaultProps.onWelcome).toHaveBeenCalledTimes(2) // Se llama de nuevo

      await userEvent.click(screen.getByRole("button", { name: "CREAR EXAMEN" }))
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1)

      await userEvent.click(screen.getByRole("button", { name: "POR PARTES" }))
      expect(defaultProps.onCreateExamByParts).toHaveBeenCalledTimes(1)
    })

    it("ejecuta los respectivos callbacks al hacer clic en las opciones del menú vertical", async () => {
      render(<StatementPartSelectionScreen {...defaultProps} />)

      // 1. Extensión funcional
      await userEvent.click(screen.getByRole("button", { name: "Extensión funcional" }))
      expect(defaultProps.onFunctionalExtension).toHaveBeenCalledTimes(1)

      // 2. Restricciones de atributos
      await userEvent.click(screen.getByRole("button", { name: "Restricciones de atributos" }))
      expect(defaultProps.onAttributesConstraints).toHaveBeenCalledTimes(1)

      // 3. Relaciones entre entidades
      await userEvent.click(screen.getByRole("button", { name: "Relaciones entre entidades" }))
      expect(defaultProps.onEntityRelationships).toHaveBeenCalledTimes(1)
    })

    it("ejecuta el callback onBack al presionar el botón general de 'Volver'", async () => {
      render(<StatementPartSelectionScreen {...defaultProps} />)

      await userEvent.click(screen.getByRole("main").querySelector(".btn-back") as HTMLButtonElement)
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1)
    })
  })
})