import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import CreateExamByPartsScreen from "./CreateExamByPartsScreen"

vi.mock("../../../assets/images/code.png", () => ({
  default: "mock-code-icon"
}))
vi.mock("../../../assets/images/statement.png", () => ({
  default: "mock-statement-icon"
}))

vi.mock("~src/components/Header", () => ({
  Header: ({ breadcrumbItems, currentStep, onWelcome }: any) => (
    <header data-testid="mock-header">
      <span>Step: {currentStep}</span>
      <button onClick={onWelcome}>Welcome Link</button>
      {breadcrumbItems.map((item: any, index: number) => (
        <button key={index} onClick={item.action}>
          {item.label}
        </button>
      ))}
    </header>
  )
}))

const baseProps = {
  onBack: vi.fn(),
  onWelcome: vi.fn(),
  onCodeGeneration: vi.fn(),
  onComponents: vi.fn()
}

beforeEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("CreateExamByPartsScreen – Pruebas Unitarias", () => {
  it("renderiza correctamente los títulos, textos e iconos de la pantalla", () => {
    render(<CreateExamByPartsScreen {...baseProps} />)

    expect(screen.getByText("CREAR EXAMEN POR PARTES")).toBeInTheDocument()
    expect(
      screen.getByText("¿Qué parte te gustaría generar primero?")
    ).toBeInTheDocument()

    expect(screen.getByText("Enunciado")).toBeInTheDocument()
    expect(screen.getByText("Código")).toBeInTheDocument()

    expect(screen.getByAltText("Icono examen")).toBeInTheDocument()
    expect(screen.getByAltText("Icono archivo")).toBeInTheDocument()

    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument()
  })

  it("ejecuta onComponents al hacer click en la tarjeta de Enunciado", async () => {
    render(<CreateExamByPartsScreen {...baseProps} />)

    const btnEnunciado = screen.getByRole("button", { name: /enunciado/i })
    await userEvent.click(btnEnunciado)

    expect(baseProps.onComponents).toHaveBeenCalledTimes(1)
  })

  it("ejecuta onCodeGeneration al hacer click en la tarjeta de Código", async () => {
    render(<CreateExamByPartsScreen {...baseProps} />)

    const btnCodigo = screen.getByRole("button", { name: /código/i })
    await userEvent.click(btnCodigo)

    expect(baseProps.onCodeGeneration).toHaveBeenCalledTimes(1)
  })

  it("ejecuta onBack al pulsar el botón general de Volver", async () => {
    render(<CreateExamByPartsScreen {...baseProps} />)

    const btnVolver = screen.getByRole("button", { name: "Volver" })
    await userEvent.click(btnVolver)

    expect(baseProps.onBack).toHaveBeenCalledTimes(1)
  })

  it("pasa las acciones correctas al componente Header y reacciona a sus interacciones", async () => {
    render(<CreateExamByPartsScreen {...baseProps} />)

    expect(screen.getByTestId("mock-header")).toBeInTheDocument()
    expect(screen.getByText("Step: POR PARTES")).toBeInTheDocument()

    const btnInicio = screen.getByRole("button", { name: "INICIO" })
    const btnCrearExamen = screen.getByRole("button", { name: "CREAR EXAMEN" })
    const btnWelcomeLink = screen.getByRole("button", { name: "Welcome Link" })

    await userEvent.click(btnInicio)
    expect(baseProps.onWelcome).toHaveBeenCalledTimes(1)

    await userEvent.click(btnCrearExamen)
    expect(baseProps.onBack).toHaveBeenCalledTimes(1)

    await userEvent.click(btnWelcomeLink)
    expect(baseProps.onWelcome).toHaveBeenCalledTimes(2)
  })
})
