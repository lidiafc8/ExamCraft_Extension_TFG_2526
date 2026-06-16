import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi, describe, it, expect, beforeEach } from "vitest"
import "@testing-library/jest-dom"
import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import CreateExamSelectionScreen from "./CreateExamSelectionScreen"

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

vi.mock("../../../assets/images/parts_exam.png", () => ({ default: "mock-parts-icon.png" }))
vi.mock("../../../assets/images/complete_exam.png", () => ({ default: "mock-complete-icon.png" }))

const defaultProps = {
  onBack: vi.fn(),
  onCreateExamByParts: vi.fn()
}

describe("Integración: CreateExamSelectionScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Casos Positivos: Renderizado", () => {
    it("renderiza los títulos, el subtítulo y la estructura semántica de la pantalla", () => {
      render(<CreateExamSelectionScreen {...defaultProps} />)

      expect(screen.getByRole("heading", { name: "CREAR NUEVO EXAMEN", level: 1 })).toBeInTheDocument()
      expect(screen.getByText("Selecciona la modalidad de creación")).toBeInTheDocument()
    })

    it("pasa la configuración correcta de migas de pan y paso activo al Header", () => {
      render(<CreateExamSelectionScreen {...defaultProps} />)

      expect(screen.getByTestId("header-mock")).toBeInTheDocument()
      expect(screen.getByTestId("current-step")).toHaveTextContent("CREAR EXAMEN")
      expect(screen.getByRole("button", { name: "INICIO" })).toBeInTheDocument()
    })

    it("renderiza las tarjetas con sus respectivas etiquetas e imágenes/iconos asociados", () => {
      render(<CreateExamSelectionScreen {...defaultProps} />)

      expect(screen.getByText("Crear examen por partes")).toBeInTheDocument()
      expect(screen.getByText("Crear examen completo")).toBeInTheDocument()

      const iconoExamen = screen.getByAltText("Icono examen")
      const iconoArchivo = screen.getByAltText("Icono archivo")

      expect(iconoExamen).toBeInTheDocument()
      expect(iconoExamen).toHaveAttribute("src", "mock-parts-icon.png")

      expect(iconoArchivo).toBeInTheDocument()
      expect(iconoArchivo).toHaveAttribute("src", "mock-complete-icon.png")
    })
  })

  describe("Casos Positivos: Interacciones", () => {
    it("ejecuta el callback onBack al interactuar con los elementos del Header", async () => {
      render(<CreateExamSelectionScreen {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Logo Inicio" }))
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1)

      await userEvent.click(screen.getByRole("button", { name: "INICIO" }))
      expect(defaultProps.onBack).toHaveBeenCalledTimes(2)
    })

    it("ejecuta el callback onCreateExamByParts al hacer clic en la tarjeta de creación por partes", async () => {
      render(<CreateExamSelectionScreen {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: /Crear examen por partes/i }))
      expect(defaultProps.onCreateExamByParts).toHaveBeenCalledTimes(1)
    })

    it("ejecuta el callback onBack al presionar el botón general de 'Volver'", async () => {
      render(<CreateExamSelectionScreen {...defaultProps} />)

      await userEvent.click(screen.getByRole("main").querySelector(".btn-back") as HTMLButtonElement)
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe("Casos Límite", () => {
    it("mantiene deshabilitada la tarjeta de 'Crear examen completo' y bloquea cualquier evento de clic", async () => {
      render(<CreateExamSelectionScreen {...defaultProps} />)

      const botonDeshabilitado = screen.getByRole("button", { name: /Crear examen completo/i })

      expect(botonDeshabilitado).toBeDisabled()
      expect(botonDeshabilitado).toHaveClass("disabled-card")

      await userEvent.click(botonDeshabilitado)

      expect(defaultProps.onCreateExamByParts).not.toHaveBeenCalled()
      expect(defaultProps.onBack).not.toHaveBeenCalled()
    })
  })
})