import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import DomainSelectionScreen from "./DomainSelectionScreen"

expect.extend(jestDomMatchers)

vi.mock("../../../assets/images/chess.png", () => ({
  default: "mock-chess-path"
}))
vi.mock("../../../assets/images/comingSoon.png", () => ({
  default: "mock-coming-soon-path"
}))
vi.mock("../../../assets/images/petclinic.png", () => ({
  default: "mock-petclinic-path"
}))

vi.mock("~src/components/Header", () => ({
  Header: ({ currentStep, onWelcome, breadcrumbItems }: any) => (
    <header data-testid="mock-header">
      <h1>{currentStep}</h1>
      <button onClick={onWelcome}>Inicio Global</button>
      <div data-testid="breadcrumbs">
        {breadcrumbItems?.map((item: any, idx: number) => (
          <button key={idx} onClick={item.action}>
            {item.label}
          </button>
        ))}
      </div>
    </header>
  )
}))

describe("DomainSelectionScreen", () => {
  const baseProps = {
    onBack: vi.fn(),
    onWelcome: vi.fn(),
    onSelectDomain: vi.fn(),
    onCreateExam: vi.fn(),
    onCreateExamByParts: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Renderizado Estático e Interfaz", () => {
    it("renderiza correctamente los títulos, textos informativos y el Header", () => {
      render(<DomainSelectionScreen {...baseProps} />)

      expect(screen.getByTestId("mock-header")).toBeInTheDocument()
      expect(
        screen.getByRole("heading", { name: "CREAR EXTENSIÓN FUNCIONAL" })
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Selecciona un dominio de todos los disponibles/i)
      ).toBeInTheDocument()
    })

    it("renderiza las tarjetas con sus respectivas imágenes y etiquetas correctas", () => {
      render(<DomainSelectionScreen {...baseProps} />)

      expect(screen.getByText("Clínica Veterinaria")).toBeInTheDocument()
      expect(screen.getByText("Ajedrez")).toBeInTheDocument()
      expect(screen.getByText("Crear nuevo dominio")).toBeInTheDocument()

      expect(
        screen.getByAltText("Icono clínica veterinaria")
      ).toBeInTheDocument()
      expect(screen.getByAltText("Icono ajedrez")).toBeInTheDocument()
      expect(screen.getByAltText("Icono comingSoon")).toBeInTheDocument()
    })

    it("mantiene deshabilitada la tarjeta de 'Crear nuevo dominio' (Prueba de Rama/Atributo)", () => {
      render(<DomainSelectionScreen {...baseProps} />)

      const disabledCard = screen.getByRole("button", {
        name: /Icono comingSoon Crear nuevo dominio/i
      })
      expect(disabledCard).toBeDisabled()
    })
  })

  describe("Flujos de Navegación y Eventos de Clic", () => {
    it("llama a onSelectDomain con 'Clínica Veterinaria' al pulsar su tarjeta", async () => {
      render(<DomainSelectionScreen {...baseProps} />)

      const petClinicBtn = screen.getByRole("button", {
        name: /Icono clínica veterinaria Clínica Veterinaria/i
      })
      await userEvent.click(petClinicBtn)

      expect(baseProps.onSelectDomain).toHaveBeenCalledWith(
        "Clínica Veterinaria"
      )
    })

    it("llama a onSelectDomain con 'Ajedrez' al pulsar su tarjeta", async () => {
      render(<DomainSelectionScreen {...baseProps} />)

      const chessBtn = screen.getByRole("button", {
        name: /Icono ajedrez Ajedrez/i
      })
      await userEvent.click(chessBtn)

      expect(baseProps.onSelectDomain).toHaveBeenCalledWith("Ajedrez")
    })

    it("invoca la acción onBack al hacer clic en el botón inferior Volver", async () => {
      render(<DomainSelectionScreen {...baseProps} />)

      const backBtn = screen.getByRole("button", { name: "Volver" })
      await userEvent.click(backBtn)

      expect(baseProps.onBack).toHaveBeenCalled()
    })

    it("ejecuta correctamente todas las acciones configuradas en el Breadcrumb del Header", async () => {
      render(<DomainSelectionScreen {...baseProps} />)

      await userEvent.click(screen.getByRole("button", { name: "INICIO" }))
      expect(baseProps.onWelcome).toHaveBeenCalled()

      await userEvent.click(
        screen.getByRole("button", { name: "CREAR EXAMEN" })
      )
      expect(baseProps.onCreateExam).toHaveBeenCalled()

      await userEvent.click(screen.getByRole("button", { name: "POR PARTES" }))
      expect(baseProps.onCreateExamByParts).toHaveBeenCalled()

      await userEvent.click(screen.getByRole("button", { name: "ENUNCIADO" }))
      expect(baseProps.onBack).toHaveBeenCalled()
    })
  })
})
