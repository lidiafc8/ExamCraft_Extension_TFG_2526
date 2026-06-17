import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import type { ComponentProps } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { DomainFolderScreen } from "./ExamSelectionScreen"

type DomainFolderScreenProps = ComponentProps<typeof DomainFolderScreen>

vi.mock("../../../assets/images/exam.png", () => ({
  default: "exam-mock-image.png"
}))

vi.mock("~src/components/Header", () => ({
  Header: ({ currentStep, onWelcome }: any) => (
    <header data-testid="mock-header">
      <button onClick={onWelcome}>Inicio Breadcrumb</button>
      <span>{currentStep}</span>
    </header>
  )
}))

vi.mock("~src/components/modals/DeleteConfirmationModal", () => ({
  DeleteConfirmationModal: ({ isOpen, itemName, onConfirm, onCancel }: any) => {
    if (!isOpen) return null
    return (
      <div data-testid="delete-modal">
        <p>¿Borrar {itemName}?</p>
        <button onClick={onConfirm}>Confirmar Borrado</button>
        <button onClick={onCancel}>Cancelar Borrado</button>
      </div>
    )
  }
}))

describe("DomainFolderScreen Integration Tests", () => {
  let defaultProps: DomainFolderScreenProps

  const mockProjects = [
    { id: "1", customName: "Examen Matemáticas", domainName: "Ciencias" },
    { id: "2", customName: "", domainName: "Historia" }
  ]

  beforeEach(() => {
    defaultProps = {
      selectedDomainFolder: "Matemáticas",
      projectsInFolder: mockProjects,
      editingId: null,
      tempName: "",
      onWelcome: vi.fn(),
      onBack: vi.fn(),
      onSelectProject: vi.fn(),
      onDeleteProject: vi.fn(),
      onRenameProject: vi.fn(),
      setEditingId: vi.fn(),
      setTempName: vi.fn()
    }
  })

  it("debería renderizar todos los elementos iniciales correctamente", () => {
    render(<DomainFolderScreen {...defaultProps} />)

    expect(screen.getByText("CARPETA: MATEMÁTICAS")).toBeInTheDocument()

    expect(screen.getByText("Examen Matemáticas")).toBeInTheDocument()
    expect(screen.getByText("Examen de Historia")).toBeInTheDocument()

    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument()
  })

  it("debería ejecutar onWelcome al hacer click en el acceso del Header", () => {
    render(<DomainFolderScreen {...defaultProps} />)
    fireEvent.click(screen.getByText("Inicio Breadcrumb"))
    expect(defaultProps.onWelcome).toHaveBeenCalledTimes(1)
  })

  it("debería ejecutar onBack al hacer click en el botón Volver", () => {
    render(<DomainFolderScreen {...defaultProps} />)
    fireEvent.click(screen.getByRole("button", { name: "Volver" }))
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1)
  })

  it("debería ejecutar onSelectProject al abrir un examen", () => {
    render(<DomainFolderScreen {...defaultProps} />)
    const openButtons = screen.getAllByTitle("Abrir examen")

    fireEvent.click(openButtons[0])
    expect(defaultProps.onSelectProject).toHaveBeenCalledWith(mockProjects[0])
  })

  it("debería activar el modo edición al hacer click en la etiqueta del proyecto", () => {
    render(<DomainFolderScreen {...defaultProps} />)

    const labelButton = screen.getByText("Examen Matemáticas")
    fireEvent.click(labelButton)

    expect(defaultProps.setEditingId).toHaveBeenCalledWith("1")
    expect(defaultProps.setTempName).toHaveBeenCalledWith("Examen Matemáticas")
  })

  it("debería renderizar el input cuando editingId coincide con el id del proyecto", () => {
    const customProps: DomainFolderScreenProps = {
      ...defaultProps,
      editingId: "1",
      tempName: "Nuevo Nombre"
    }
    render(<DomainFolderScreen {...customProps} />)

    const input = screen.getByDisplayValue("Nuevo Nombre")
    expect(input).toBeInTheDocument()

    fireEvent.change(input, { target: { value: "Nombre Cambiado" } })
    expect(defaultProps.setTempName).toHaveBeenCalledWith("Nombre Cambiado")
  })

  it("debería ejecutar onRenameProject al perder el foco (onBlur) en el input", () => {
    const customProps: DomainFolderScreenProps = {
      ...defaultProps,
      editingId: "1",
      tempName: "Nombre Blur"
    }
    render(<DomainFolderScreen {...customProps} />)

    const input = screen.getByDisplayValue("Nombre Blur")
    fireEvent.blur(input)

    expect(defaultProps.onRenameProject).toHaveBeenCalledWith(
      "1",
      "Nombre Blur"
    )
  })

  it("debería ejecutar onRenameProject al presionar la tecla Enter", () => {
    const customProps: DomainFolderScreenProps = {
      ...defaultProps,
      editingId: "1",
      tempName: "Nombre Enter"
    }
    render(<DomainFolderScreen {...customProps} />)

    const input = screen.getByDisplayValue("Nombre Enter")
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" })

    expect(defaultProps.onRenameProject).toHaveBeenCalledWith(
      "1",
      "Nombre Enter"
    )
  })

  it("debería cancelar la edición (setEditingId(null)) al presionar la tecla Escape", () => {
    const customProps: DomainFolderScreenProps = {
      ...defaultProps,
      editingId: "1",
      tempName: "Nombre Escape"
    }
    render(<DomainFolderScreen {...customProps} />)

    const input = screen.getByDisplayValue("Nombre Escape")
    fireEvent.keyDown(input, { key: "Escape", code: "Escape" })

    expect(defaultProps.setEditingId).toHaveBeenCalledWith(null)
  })

  it("no debería hacer nada en el onKeyDown si se presiona otra tecla distinta", () => {
    const customProps: DomainFolderScreenProps = {
      ...defaultProps,
      editingId: "1",
      tempName: "Test Tecla"
    }
    render(<DomainFolderScreen {...customProps} />)

    const input = screen.getByDisplayValue("Test Tecla")
    fireEvent.keyDown(input, { key: "Shift", code: "Shift" })

    expect(defaultProps.onRenameProject).not.toHaveBeenCalled()
    expect(defaultProps.setEditingId).not.toHaveBeenCalled()
  })

  it("debería abrir el modal de confirmación al hacer click en el botón de borrar", () => {
    render(<DomainFolderScreen {...defaultProps} />)

    expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument()

    const deleteButtons = screen.getAllByTitle("Borrar examen")
    fireEvent.click(deleteButtons[0])

    expect(screen.getByTestId("delete-modal")).toBeInTheDocument()
    expect(screen.getByText("¿Borrar Examen Matemáticas?")).toBeInTheDocument()
  })

  it("debería ejecutar onDeleteProject y cerrar el modal al confirmar el borrado", () => {
    render(<DomainFolderScreen {...defaultProps} />)

    const deleteButtons = screen.getAllByTitle("Borrar examen")
    fireEvent.click(deleteButtons[0])

    const confirmBtn = screen.getByRole("button", { name: "Confirmar Borrado" })
    fireEvent.click(confirmBtn)

    expect(defaultProps.onDeleteProject).toHaveBeenCalledWith("1")
    expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument()
  })

  it("debería cerrar el modal sin borrar al hacer click en cancelar", () => {
    render(<DomainFolderScreen {...defaultProps} />)

    const deleteButtons = screen.getAllByTitle("Borrar examen")
    fireEvent.click(deleteButtons[0])

    const cancelBtn = screen.getByRole("button", { name: "Cancelar Borrado" })
    fireEvent.click(cancelBtn)

    expect(defaultProps.onDeleteProject).not.toHaveBeenCalled()
    expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument()
  })
})
