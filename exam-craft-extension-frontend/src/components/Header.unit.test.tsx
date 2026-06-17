import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Header } from "./Header"

vi.mock("../../assets/icon512.png", () => ({ default: "mock-logo-path" }))

const mockBreadcrumbItems = [
  { label: "Inicio", action: vi.fn() },
  { label: "Configuración", action: vi.fn() }
]

const baseProps = {
  onWelcome: vi.fn(),
  breadcrumbItems: mockBreadcrumbItems,
  currentStep: "Paso Final"
}

beforeEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("Header – Renderizado Estático", () => {
  it("renderiza correctamente el logo con sus atributos de accesibilidad", () => {
    render(<Header {...baseProps} />)

    const logoImg = screen.getByAltText("Logo ExamCraft")
    expect(logoImg).toBeInTheDocument()
    expect(logoImg).toHaveAttribute("src", "mock-logo-path")
    expect(logoImg).toHaveAttribute("width", "60")
    expect(logoImg).toHaveAttribute("height", "60")
  })

  it("renderiza la estructura de las migas de pan (breadcrumbs) con sus separadores", () => {
    render(<Header {...baseProps} />)

    expect(screen.getByText("Inicio")).toBeInTheDocument()
    expect(screen.getByText("Configuración")).toBeInTheDocument()

    expect(screen.getByText("Paso Final")).toBeInTheDocument()

    const separadores = screen.getAllByText(">")
    expect(separadores).toHaveLength(mockBreadcrumbItems.length)
  })

  it("funciona correctamente cuando la lista de breadcrumbItems viene vacía", () => {
    render(<Header {...baseProps} breadcrumbItems={[]} />)

    expect(screen.getByText("Paso Final")).toBeInTheDocument()
    expect(screen.queryByText("Inicio")).not.toBeInTheDocument()
    expect(screen.queryByText(">")).not.toBeInTheDocument()
  })
})

describe("Header – Interacciones de Usuario", () => {
  it("ejecuta onWelcome al hacer click sobre el botón del logo", async () => {
    render(<Header {...baseProps} />)

    const btnLogo = screen.getByRole("button", { name: "Ir a inicio" })
    await userEvent.click(btnLogo)

    expect(baseProps.onWelcome).toHaveBeenCalledTimes(1)
  })

  it("ejecuta la acción correspondiente al hacer click sobre un elemento específico del breadcrumb", async () => {
    render(<Header {...baseProps} />)

    const btnInicio = screen.getByRole("button", { name: "Inicio" })
    await userEvent.click(btnInicio)

    expect(mockBreadcrumbItems[0].action).toHaveBeenCalledTimes(1)
    expect(mockBreadcrumbItems[1].action).not.toHaveBeenCalled()
  })
})
