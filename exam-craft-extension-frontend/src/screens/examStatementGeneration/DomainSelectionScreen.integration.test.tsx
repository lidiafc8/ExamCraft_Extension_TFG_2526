import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import React from "react"
import "@testing-library/jest-dom"

import DomainSelectionScreen from "./DomainSelectionScreen" // Ajusta la ruta si es necesario

// Mock del componente Header para aislar la vista y evaluar sus props de navegación
vi.mock("~src/components/Header", () => ({
  Header: ({ currentStep, breadcrumbItems }: any) => (
    <header data-testid="mock-header">
      <h1>{currentStep}</h1>
      <button onClick={breadcrumbItems[0].action}>Mock Inicio</button>
      <button onClick={breadcrumbItems[3].action}>Mock Enunciado</button>
    </header>
  )
}))

// Mock de las imágenes para evitar problemas con bundlers en entornos de test
vi.mock("../../../assets/images/chess.png", () => ({ default: "chess-mock-path" }))
vi.mock("../../../assets/images/comingSoon.png", () => ({ default: "soon-mock-path" }))
vi.mock("../../../assets/images/petclinic.png", () => ({ default: "pet-mock-path" }))

describe("Integration Test - DomainSelectionScreen", () => {
  // Configuración de las funciones espía (callbacks)
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

    // 1. Comprobar Header y títulos
    expect(screen.getByTestId("mock-header")).toBeInTheDocument()
    expect(screen.getByText("EXTENSIÓN FUNCIONAL")).toBeInTheDocument()
    expect(screen.getByText("CREAR EXTENSIÓN FUNCIONAL")).toBeInTheDocument()
    expect(
      screen.getByText(/Selecciona un dominio de todos los disponibles/i)
    ).toBeInTheDocument()

    // 2. Comprobar que existen las opciones disponibles y sus imágenes/alts
    expect(screen.getByText("Clínica Veterinaria")).toBeInTheDocument()
    expect(screen.getByAltText("Icono clínica veterinaria")).toBeInTheDocument()

    expect(screen.getByText("Ajedrez")).toBeInTheDocument()
    expect(screen.getByAltText("Icono ajedrez")).toBeInTheDocument()

    expect(screen.getByText("Crear nuevo dominio")).toBeInTheDocument()
    expect(screen.getByAltText("Icono comingSoon")).toBeInTheDocument()

    // 3. Comprobar botón inferior de volver
    expect(screen.getByRole("button", { name: /volver/i })).toBeInTheDocument()
  })

  it("debería llamar a onSelectDomain con los argumentos correctos al hacer click en las tarjetas activas", () => {
    render(<DomainSelectionScreen {...defaultProps} />)

    // Simular click en la tarjeta de Clínica Veterinaria
    const btnVeterinaria = screen.getByRole("button", { name: /icono clínica veterinaria clínica veterinaria/i })
    fireEvent.click(btnVeterinaria)
    expect(defaultProps.onSelectDomain).toHaveBeenCalledTimes(1)
    expect(defaultProps.onSelectDomain).toHaveBeenCalledWith("Clínica Veterinaria")

    // Simular click en la tarjeta de Ajedrez
    const btnAjedrez = screen.getByRole("button", { name: /icono ajedrez ajedrez/i })
    fireEvent.click(btnAjedrez)
    expect(defaultProps.onSelectDomain).toHaveBeenCalledTimes(2)
    expect(defaultProps.onSelectDomain).toHaveBeenLastCalledWith("Ajedrez")
  })

  it("no debería permitir interacción ni disparar eventos en la tarjeta deshabilitada (Crear nuevo dominio)", () => {
    render(<DomainSelectionScreen {...defaultProps} />)

    const btnDeshabilitado = screen.getByRole("button", { name: /icono comingsoon crear nuevo dominio/i })
    
    // Verificar propiedad nativa de HTML 'disabled'
    expect(btnDeshabilitado).toBeDisabled()

    // Intentar hacer click y comprobar que no altera nada
    fireEvent.click(btnDeshabilitado)
    expect(defaultProps.onSelectDomain).not.toHaveBeenCalledWith("Crear nuevo dominio")
  })

  it("debería ejecutar correctamente las acciones de navegación de los botones y breadcrumbs", () => {
    render(<DomainSelectionScreen {...defaultProps} />)

    // Probar el botón general "Volver" del flujo inferior
    const btnVolver = screen.getByRole("button", { name: /volver/i })
    fireEvent.click(btnVolver)
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1)

    // Probar la acción "INICIO" mapeada en el primer elemento del breadcrumb (inyectado en nuestro Header mock)
    const btnMockInicio = screen.getByText("Mock Inicio")
    fireEvent.click(btnMockInicio)
    expect(defaultProps.onWelcome).toHaveBeenCalledTimes(1)

    // Probar la acción "ENUNCIADO" mapeada en el cuarto elemento del breadcrumb que dispara onBack
    const btnMockEnunciado = screen.getByText("Mock Enunciado")
    fireEvent.click(btnMockEnunciado)
    expect(defaultProps.onBack).toHaveBeenCalledTimes(2)
  })
})