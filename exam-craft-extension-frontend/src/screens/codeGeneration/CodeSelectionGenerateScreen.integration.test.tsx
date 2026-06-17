import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import CodeSelectionGenerateScreen from "./CodeSelectionGenerateScreen"

expect.extend(jestDomMatchers)

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
  onGenerateBaseClasses: vi.fn(),
  onGenerateTest: vi.fn(),
  onGenerateSolutionCode: vi.fn()
}

describe("Integración: CodeSelectionGenerateScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Casos Positivos: Renderizado", () => {
    it("renderiza correctamente los títulos principales y las instrucciones de la vista", () => {
      render(<CodeSelectionGenerateScreen {...defaultProps} />)

      expect(
        screen.getByRole("heading", { name: "GENERACIÓN DE CÓDIGO", level: 1 })
      ).toBeInTheDocument()
      expect(
        screen.getByText("¿Qué parte de código te gustaría generar primero?")
      ).toBeInTheDocument()
    })

    it("pasa la configuración exacta de migas de pan y paso activo 'CÓDIGO' al Header", () => {
      render(<CodeSelectionGenerateScreen {...defaultProps} />)

      expect(screen.getByTestId("header-mock")).toBeInTheDocument()
      expect(screen.getByTestId("current-step")).toHaveTextContent("CÓDIGO")

      expect(screen.getByRole("button", { name: "INICIO" })).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "CREAR EXAMEN" })
      ).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "POR PARTES" })
      ).toBeInTheDocument()
    })

    it("renderiza todos los botones del menú de selección vertical y el botón de regreso", () => {
      render(<CodeSelectionGenerateScreen {...defaultProps} />)

      expect(
        screen.getByRole("button", { name: "Clases base" })
      ).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Tests" })).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "Solución" })
      ).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument()
    })
  })

  describe("Casos Positivos: Interacciones", () => {
    it("ejecuta los respectivos callbacks del Header al interactuar con el logo o las migas de pan", async () => {
      render(<CodeSelectionGenerateScreen {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Logo Inicio" }))
      expect(defaultProps.onWelcome).toHaveBeenCalledTimes(1)

      await userEvent.click(screen.getByRole("button", { name: "INICIO" }))
      expect(defaultProps.onWelcome).toHaveBeenCalledTimes(2)

      await userEvent.click(
        screen.getByRole("button", { name: "CREAR EXAMEN" })
      )
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1)

      await userEvent.click(screen.getByRole("button", { name: "POR PARTES" }))
      expect(defaultProps.onCreateExamByParts).toHaveBeenCalledTimes(1)
    })

    it("ejecuta los respectivos callbacks al hacer clic en las opciones del menú vertical", async () => {
      render(<CodeSelectionGenerateScreen {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Clases base" }))
      expect(defaultProps.onGenerateBaseClasses).toHaveBeenCalledTimes(1)

      await userEvent.click(screen.getByRole("button", { name: "Tests" }))
      expect(defaultProps.onGenerateTest).toHaveBeenCalledTimes(1)

      await userEvent.click(screen.getByRole("button", { name: "Solución" }))
      expect(defaultProps.onGenerateSolutionCode).toHaveBeenCalledTimes(1)
    })

    it("ejecuta el callback onBack al presionar el botón general inferior 'Volver'", async () => {
      render(<CodeSelectionGenerateScreen {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Volver" }))
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1)
    })
  })
})
