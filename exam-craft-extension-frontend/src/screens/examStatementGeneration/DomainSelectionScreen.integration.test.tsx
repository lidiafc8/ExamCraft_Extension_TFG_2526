import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import DomainSelectionScreen from "./DomainSelectionScreen"

vi.mock("~src/components/Header", () => ({
  Header: ({ currentStep, breadcrumbItems }: any) => (
    <header data-testid="mock-header">
      <h1>{currentStep}</h1>
      <button onClick={breadcrumbItems[0].action}>Mock Inicio</button>
      <button onClick={breadcrumbItems[3].action}>Mock Enunciado</button>
    </header>
  )
}))

vi.mock("../../../assets/images/chess.png", () => ({
  default: "chess-mock-path"
}))
vi.mock("../../../assets/images/comingSoon.png", () => ({
  default: "soon-mock-path"
}))
vi.mock("../../../assets/images/petclinic.png", () => ({
  default: "pet-mock-path"
}))

describe("Integration Test - DomainSelectionScreen", () => {
  const defaultProps = {
    onBack: vi.fn(),
    onWelcome: vi.fn(),
    onSelectDomain: vi.fn(),
    onCreateExam: vi.fn(),
    onCreateExamByParts: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("debería renderizar todos los elementos de la interfaz correctamente", () => {
    render(<DomainSelectionScreen {...defaultProps} />)

    expect(screen.getByTestId("mock-header")).toBeInTheDocument()
    expect(screen.getByText("EXTENSIÓN FUNCIONAL")).toBeInTheDocument()
    expect(screen.getByText("CREAR EXTENSIÓN FUNCIONAL")).toBeInTheDocument()
    expect(
      screen.getByText(/Selecciona un dominio de todos los disponibles/i)
    ).toBeInTheDocument()

    expect(screen.getByText("Clínica Veterinaria")).toBeInTheDocument()
    expect(screen.getByAltText("Icono clínica veterinaria")).toBeInTheDocument()

    expect(screen.getByText("Ajedrez")).toBeInTheDocument()
    expect(screen.getByAltText("Icono ajedrez")).toBeInTheDocument()

    expect(screen.getByText("Crear nuevo dominio")).toBeInTheDocument()
    expect(screen.getByAltText("Icono comingSoon")).toBeInTheDocument()

    expect(screen.getByRole("button", { name: /volver/i })).toBeInTheDocument()
  })

  it("debería llamar a onSelectDomain con los argumentos correctos al hacer click en las tarjetas activas", () => {
    render(<DomainSelectionScreen {...defaultProps} />)

    const btnVeterinaria = screen.getByRole("button", {
      name: /icono clínica veterinaria clínica veterinaria/i
    })
    fireEvent.click(btnVeterinaria)
    expect(defaultProps.onSelectDomain).toHaveBeenCalledTimes(1)
    expect(defaultProps.onSelectDomain).toHaveBeenCalledWith(
      "Clínica Veterinaria"
    )

    const btnAjedrez = screen.getByRole("button", {
      name: /icono ajedrez ajedrez/i
    })
    fireEvent.click(btnAjedrez)
    expect(defaultProps.onSelectDomain).toHaveBeenCalledTimes(2)
    expect(defaultProps.onSelectDomain).toHaveBeenLastCalledWith("Ajedrez")
  })

  it("no debería permitir interacción ni disparar eventos en la tarjeta deshabilitada (Crear nuevo dominio)", () => {
    render(<DomainSelectionScreen {...defaultProps} />)

    const btnDeshabilitado = screen.getByRole("button", {
      name: /icono comingsoon crear nuevo dominio/i
    })

    expect(btnDeshabilitado).toBeDisabled()

    fireEvent.click(btnDeshabilitado)
    expect(defaultProps.onSelectDomain).not.toHaveBeenCalledWith(
      "Crear nuevo dominio"
    )
  })

  it("debería ejecutar correctamente las acciones de navegación de los botones y breadcrumbs", () => {
    render(<DomainSelectionScreen {...defaultProps} />)

    const btnVolver = screen.getByRole("button", { name: /volver/i })
    fireEvent.click(btnVolver)
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1)

    const btnMockInicio = screen.getByText("Mock Inicio")
    fireEvent.click(btnMockInicio)
    expect(defaultProps.onWelcome).toHaveBeenCalledTimes(1)
    const btnMockEnunciado = screen.getByText("Mock Enunciado")
    fireEvent.click(btnMockEnunciado)
    expect(defaultProps.onBack).toHaveBeenCalledTimes(2)
  })
})
