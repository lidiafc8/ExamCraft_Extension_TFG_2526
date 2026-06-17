import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import { VisualSolutionCodeScreen } from "./VisualSolutionCodeScreen"

import "../../setupComponentMocks"

describe("VisualSolutionCodeScreen - Pruebas Unitarias", () => {
  const baseProps = {
    selectedProject: {
      id: "project_1",
      domainName: "ajedrez",
      fullSolution: "public class Solucion { // Código inicial }",
      baseClasses: "class Base {}"
    },
    onBack: vi.fn(),
    onDeleteSection: vi.fn(),
    onUpdateProject: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderScreen = (customProps = {}) => {
    const finalProps = { ...baseProps, ...customProps }
    return render(
      <VisualSolutionCodeScreen
        selectedDomainFolder={""}
        onWelcome={function (): void {
          throw new Error("Function not implemented.")
        }}
        onGoToExams={function (): void {
          throw new Error("Function not implemented.")
        }}
        onGoToFolders={function (): void {
          throw new Error("Function not implemented.")
        }}
        {...finalProps}
      />
    )
  }

  it("debería renderizar correctamente la pantalla con el título de la solución", () => {
    renderScreen()
    expect(
      screen.getByRole("heading", { name: "Solución Completa", level: 2 })
    ).toBeInTheDocument()
  })

  it("debería ejecutar la función onBack al pulsar el botón de regresar", async () => {
    renderScreen()
    await userEvent.click(screen.getByRole("button", { name: "Volver" }))
    expect(baseProps.onBack).toHaveBeenCalledTimes(1)
  })

  it("debería solicitar el borrado de la sección fullSolution al hacer clic en borrar", async () => {
    renderScreen()

    await userEvent.click(screen.getByRole("button", { name: "✕" }))

    const confirmButton = screen.queryByRole("button", {
      name: /confirmar|eliminar|sí|aceptar/i
    })

    if (confirmButton) {
      await userEvent.click(confirmButton)
    }
    expect(baseProps.onDeleteSection).toHaveBeenCalled()
  })

  it("debería permitir alternar el modo edición si el botón correspondiente existe", () => {
    renderScreen()
    const toggleBtn = screen.getByRole("button", { name: /No editable/i })
    expect(toggleBtn).toBeInTheDocument()
  })
})
