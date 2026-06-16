import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi, describe, it, expect, beforeEach } from "vitest"
import "@testing-library/jest-dom"
import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import CreateExamByPartsScreen from "./CreateExamByPartsScreen"

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

vi.mock("../../../assets/images/statement.png", () => ({ default: "mock-statement-icon.png" }))
vi.mock("../../../assets/images/code.png", () => ({ default: "mock-code-icon.png" }))

const defaultProps = {
  onBack: vi.fn(),
  onWelcome: vi.fn(),
  onCodeGeneration: vi.fn(),
  onComponents: vi.fn()
}

describe("Integración: CreateExamByPartsScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Casos Positivos: Renderizado", () => {
    it("renderiza correctamente los títulos, subtítulos y los contenedores de acción de la vista", () => {
      render(<CreateExamByPartsScreen {...defaultProps} />)

      expect(screen.getByRole("heading", { name: "CREAR EXAMEN POR PARTES", level: 1 })).toBeInTheDocument()
      expect(screen.getByText("¿Qué parte te gustaría generar primero?")).toBeInTheDocument()
    })

    it("pasa las propiedades de navegación y las migas de pan esperadas al componente Header", () => {
      render(<CreateExamByPartsScreen {...defaultProps} />)

      expect(screen.getByTestId("header-mock")).toBeInTheDocument()
      expect(screen.getByTestId("current-step")).toHaveTextContent("POR PARTES")
      
      expect(screen.getByRole("button", { name: "INICIO" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "CREAR EXAMEN" })).toBeInTheDocument()
    })

    it("renderiza las tarjetas con sus etiquetas correspondientes e imágenes asociadas", () => {
      render(<CreateExamByPartsScreen {...defaultProps} />)

      expect(screen.getByText("Enunciado")).toBeInTheDocument()
      expect(screen.getByText("Código")).toBeInTheDocument()

      const iconoExamen = screen.getByAltText("Icono examen")
      const iconoArchivo = screen.getByAltText("Icono archivo")

      expect(iconoExamen).toBeInTheDocument()
      expect(iconoExamen).toHaveAttribute("src", "mock-statement-icon.png")

      expect(iconoArchivo).toBeInTheDocument()
      expect(iconoArchivo).toHaveAttribute("src", "mock-code-icon.png")
    })
  })

  describe("Casos Positivos: Interacciones", () => {
    it("ejecuta los respectivos callbacks de navegación en el Header al pulsar sus elementos", async () => {
      render(<CreateExamByPartsScreen {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Logo Inicio" }))
      expect(defaultProps.onWelcome).toHaveBeenCalledTimes(1)

      await userEvent.click(screen.getByRole("button", { name: "INICIO" }))
      expect(defaultProps.onWelcome).toHaveBeenCalledTimes(2)

      await userEvent.click(screen.getByRole("button", { name: "CREAR EXAMEN" }))
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1)
    })

    it("ejecuta el callback onComponents al hacer clic en la tarjeta de 'Enunciado'", async () => {
      render(<CreateExamByPartsScreen {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: /Enunciado/i }))
      expect(defaultProps.onComponents).toHaveBeenCalledTimes(1)
    })

    it("ejecuta el callback onCodeGeneration al hacer clic en la tarjeta de 'Código'", async () => {
      render(<CreateExamByPartsScreen {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: /Código/i }))
      expect(defaultProps.onCodeGeneration).toHaveBeenCalledTimes(1)
    })

    it("ejecuta el callback onBack al presionar el botón general inferior 'Volver'", async () => {
      render(<CreateExamByPartsScreen {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Volver" }))
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1)
    })
  })
})