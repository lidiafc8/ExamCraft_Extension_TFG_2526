import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import CodeSelectionGenerateScreen from "./CodeSelectionGenerateScreen"

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
  onCreateExamByParts: vi.fn(),
  onGenerateBaseClasses: vi.fn(),
  onGenerateTest: vi.fn(),
  onGenerateSolutionCode: vi.fn()
}

beforeEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("CodeSelectionGenerateScreen – Pruebas Unitarias", () => {
  it("renderiza correctamente el título principal de la pantalla", () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    expect(screen.getByText("GENERACIÓN DE CÓDIGO")).toBeInTheDocument()
  })

  it("renderiza el badge con la pregunta de selección", () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    expect(
      screen.getByText(/qué parte de código te gustaría generar primero/i)
    ).toBeInTheDocument()
  })

  it("renderiza los tres botones del menú vertical", () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    expect(
      screen.getByRole("button", { name: "Clases base" })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Tests" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Solución" })).toBeInTheDocument()
  })

  it("renderiza el botón de Volver", () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument()
  })

  it("renderiza el Header con el paso actual 'CÓDIGO'", () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    expect(screen.getByTestId("mock-header")).toBeInTheDocument()
    expect(screen.getByText("Step: CÓDIGO")).toBeInTheDocument()
  })

  it("renderiza los tres breadcrumbs del Header correctamente", () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    expect(screen.getByRole("button", { name: "INICIO" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "CREAR EXAMEN" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "POR PARTES" })
    ).toBeInTheDocument()
  })

  it("ejecuta onGenerateBaseClasses al hacer click en 'Clases base'", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    await userEvent.click(screen.getByRole("button", { name: "Clases base" }))

    expect(baseProps.onGenerateBaseClasses).toHaveBeenCalledTimes(1)
  })

  it("ejecuta onGenerateTest al hacer click en 'Tests'", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    await userEvent.click(screen.getByRole("button", { name: "Tests" }))

    expect(baseProps.onGenerateTest).toHaveBeenCalledTimes(1)
  })

  it("ejecuta onGenerateSolutionCode al hacer click en 'Solución'", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    await userEvent.click(screen.getByRole("button", { name: "Solución" }))

    expect(baseProps.onGenerateSolutionCode).toHaveBeenCalledTimes(1)
  })

  it("ejecuta onBack al pulsar el botón Volver", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    await userEvent.click(screen.getByRole("button", { name: "Volver" }))

    expect(baseProps.onBack).toHaveBeenCalledTimes(1)
  })

  it("ejecuta onWelcome al pulsar el breadcrumb INICIO", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    await userEvent.click(screen.getByRole("button", { name: "INICIO" }))

    expect(baseProps.onWelcome).toHaveBeenCalledTimes(1)
  })

  it("ejecuta onBack al pulsar el breadcrumb CREAR EXAMEN", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    await userEvent.click(screen.getByRole("button", { name: "CREAR EXAMEN" }))

    expect(baseProps.onBack).toHaveBeenCalledTimes(1)
  })

  it("ejecuta onCreateExamByParts al pulsar el breadcrumb POR PARTES", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    await userEvent.click(screen.getByRole("button", { name: "POR PARTES" }))

    expect(baseProps.onCreateExamByParts).toHaveBeenCalledTimes(1)
  })

  it("ejecuta onWelcome al pulsar el Welcome Link del Header", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    await userEvent.click(screen.getByRole("button", { name: "Welcome Link" }))

    expect(baseProps.onWelcome).toHaveBeenCalledTimes(1)
  })

  it("click en 'Clases base' no dispara las demás callbacks de menú", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    await userEvent.click(screen.getByRole("button", { name: "Clases base" }))

    expect(baseProps.onGenerateTest).not.toHaveBeenCalled()
    expect(baseProps.onGenerateSolutionCode).not.toHaveBeenCalled()
    expect(baseProps.onBack).not.toHaveBeenCalled()
    expect(baseProps.onWelcome).not.toHaveBeenCalled()
  })

  it("click en 'Tests' no dispara las demás callbacks de menú", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    await userEvent.click(screen.getByRole("button", { name: "Tests" }))

    expect(baseProps.onGenerateBaseClasses).not.toHaveBeenCalled()
    expect(baseProps.onGenerateSolutionCode).not.toHaveBeenCalled()
    expect(baseProps.onBack).not.toHaveBeenCalled()
    expect(baseProps.onWelcome).not.toHaveBeenCalled()
  })

  it("click en 'Solución' no dispara las demás callbacks de menú", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    await userEvent.click(screen.getByRole("button", { name: "Solución" }))

    expect(baseProps.onGenerateBaseClasses).not.toHaveBeenCalled()
    expect(baseProps.onGenerateTest).not.toHaveBeenCalled()
    expect(baseProps.onBack).not.toHaveBeenCalled()
    expect(baseProps.onWelcome).not.toHaveBeenCalled()
  })

  it("click en Volver no dispara ninguna callback de menú", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    await userEvent.click(screen.getByRole("button", { name: "Volver" }))

    expect(baseProps.onGenerateBaseClasses).not.toHaveBeenCalled()
    expect(baseProps.onGenerateTest).not.toHaveBeenCalled()
    expect(baseProps.onGenerateSolutionCode).not.toHaveBeenCalled()
    expect(baseProps.onWelcome).not.toHaveBeenCalled()
    expect(baseProps.onCreateExamByParts).not.toHaveBeenCalled()
  })

  it("ningún botón del menú está deshabilitado", () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    expect(
      screen.getByRole("button", { name: "Clases base" })
    ).not.toBeDisabled()
    expect(screen.getByRole("button", { name: "Tests" })).not.toBeDisabled()
    expect(screen.getByRole("button", { name: "Solución" })).not.toBeDisabled()
  })

  it("acumula correctamente múltiples clicks en 'Clases base'", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    const btn = screen.getByRole("button", { name: "Clases base" })
    await userEvent.click(btn)
    await userEvent.click(btn)
    await userEvent.click(btn)

    expect(baseProps.onGenerateBaseClasses).toHaveBeenCalledTimes(3)
  })

  it("acumula correctamente múltiples clicks en 'Tests'", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    const btn = screen.getByRole("button", { name: "Tests" })
    await userEvent.click(btn)
    await userEvent.click(btn)

    expect(baseProps.onGenerateTest).toHaveBeenCalledTimes(2)
  })

  it("acumula correctamente múltiples clicks en 'Solución'", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    const btn = screen.getByRole("button", { name: "Solución" })
    await userEvent.click(btn)
    await userEvent.click(btn)

    expect(baseProps.onGenerateSolutionCode).toHaveBeenCalledTimes(2)
  })

  it("acumula correctamente múltiples clicks en Volver", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    const btn = screen.getByRole("button", { name: "Volver" })
    await userEvent.click(btn)
    await userEvent.click(btn)

    expect(baseProps.onBack).toHaveBeenCalledTimes(2)
  })

  it("clicks alternados en distintos botones del menú se acumulan de forma independiente", async () => {
    render(<CodeSelectionGenerateScreen {...baseProps} />)

    await userEvent.click(screen.getByRole("button", { name: "Clases base" }))
    await userEvent.click(screen.getByRole("button", { name: "Tests" }))
    await userEvent.click(screen.getByRole("button", { name: "Clases base" }))
    await userEvent.click(screen.getByRole("button", { name: "Solución" }))

    expect(baseProps.onGenerateBaseClasses).toHaveBeenCalledTimes(2)
    expect(baseProps.onGenerateTest).toHaveBeenCalledTimes(1)
    expect(baseProps.onGenerateSolutionCode).toHaveBeenCalledTimes(1)
  })
})
