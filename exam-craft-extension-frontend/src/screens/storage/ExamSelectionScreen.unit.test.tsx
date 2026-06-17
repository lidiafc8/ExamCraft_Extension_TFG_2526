import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import { DomainFolderScreen } from "./ExamSelectionScreen"

type DomainFolderScreenProps = React.ComponentProps<typeof DomainFolderScreen>

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

vi.mock("~src/components/modals/DeleteConfirmationModal", () => ({
  DeleteConfirmationModal: ({ isOpen, itemName, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid="mock-delete-modal">
        <p>¿Borrar {itemName}?</p>
        <button onClick={onConfirm}>Confirmar Borrado</button>
        <button onClick={onCancel}>Cancelar Borrado</button>
      </div>
    ) : null
}))

vi.mock("../../../assets/images/exam.png", () => ({
  default: "mock-exam-image.png"
}))

describe("DomainFolderScreen", () => {
  let baseProps: DomainFolderScreenProps

  beforeEach(() => {
    vi.clearAllMocks()

    baseProps = {
      selectedDomainFolder: "Matemáticas",
      projectsInFolder: [
        { id: "p1", domainName: "Matemáticas", customName: "Álgebra Lineal" },
        { id: "p2", domainName: "Matemáticas", customName: "" }
      ],
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

  describe("Casos Positivos y Renderizado Core", () => {
    it("renderiza correctamente los títulos transformados a mayúsculas y los contenedores principales", () => {
      render(<DomainFolderScreen {...baseProps} />)

      expect(screen.getByTestId("mock-header")).toBeInTheDocument()
      expect(
        screen.getByRole("heading", { name: "CARPETA: MATEMÁTICAS" })
      ).toBeInTheDocument()
    })

    it("mapea la lista de proyectos aplicando el customName o el string de fallback", () => {
      render(<DomainFolderScreen {...baseProps} />)

      expect(screen.getByText("Álgebra Lineal")).toBeInTheDocument()
      expect(screen.getByText("Examen de Matemáticas")).toBeInTheDocument()
    })

    it("ejecuta onSelectProject al hacer clic en el botón de icono para abrir el examen", async () => {
      render(<DomainFolderScreen {...baseProps} />)

      const openButtons = screen.getAllByRole("button", {
        name: "Abrir examen"
      })
      await userEvent.click(openButtons[0])

      expect(baseProps.onSelectProject).toHaveBeenCalledTimes(1)
      expect(baseProps.onSelectProject).toHaveBeenCalledWith(
        baseProps.projectsInFolder[0]
      )
    })

    it("gatilla las rutas de navegación superiores mapeadas en los Breadcrumbs", async () => {
      render(<DomainFolderScreen {...baseProps} />)

      await userEvent.click(screen.getByRole("button", { name: "INICIO" }))
      expect(baseProps.onWelcome).toHaveBeenCalledTimes(1)
    })

    it("ejecuta onBack al pulsar el botón 'Volver' al pie de la página", async () => {
      render(<DomainFolderScreen {...baseProps} />)

      const volverBtn = screen.getByRole("button", { name: "Volver" })
      await userEvent.click(volverBtn)

      expect(baseProps.onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe("Flujo e Interacciones de Borrado", () => {
    it("abre el modal con los datos del ítem seleccionado deteniendo la propagación", async () => {
      render(<DomainFolderScreen {...baseProps} />)

      const deleteButtons = screen.getAllByTitle("Borrar examen")

      fireEvent(
        deleteButtons[0],
        new MouseEvent("click", { bubbles: true, cancelable: true })
      )

      expect(screen.getByTestId("mock-delete-modal")).toBeInTheDocument()
      expect(screen.getByText("¿Borrar Álgebra Lineal?")).toBeInTheDocument()
    })

    it("ejecuta onDeleteProject con el ID correspondiente al confirmar la acción en el modal", async () => {
      render(<DomainFolderScreen {...baseProps} />)

      const deleteButtons = screen.getAllByTitle("Borrar examen")
      await userEvent.click(deleteButtons[0])

      const confirmBtn = screen.getByRole("button", {
        name: "Confirmar Borrado"
      })
      await userEvent.click(confirmBtn)

      expect(baseProps.onDeleteProject).toHaveBeenCalledWith("p1")
      expect(screen.queryByTestId("mock-delete-modal")).not.toBeInTheDocument()
    })

    it("resetea el estado y cierra el modal sin alterar los datos si se cancela la operación", async () => {
      render(<DomainFolderScreen {...baseProps} />)

      const deleteButtons = screen.getAllByTitle("Borrar examen")
      await userEvent.click(deleteButtons[0])

      const cancelBtn = screen.getByRole("button", { name: "Cancelar Borrado" })
      await userEvent.click(cancelBtn)

      expect(baseProps.onDeleteProject).not.toHaveBeenCalled()
      expect(screen.queryByTestId("mock-delete-modal")).not.toBeInTheDocument()
    })
  })

  describe("Flujo de Renombrado Inline e Inputs de Teclado", () => {
    it("conmuta de botón de texto a input de edición cuando editingId coincide con el proyecto", () => {
      baseProps.editingId = "p1"
      baseProps.tempName = "Nuevo Nombre Temporal"

      render(<DomainFolderScreen {...baseProps} />)

      const input = screen.getByRole("textbox")
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue("Nuevo Nombre Temporal")
    })

    it("ejecuta setEditingId y setTempName cargando el displayName al hacer clic sobre el texto del examen", async () => {
      render(<DomainFolderScreen {...baseProps} />)

      const labelButton = screen.getByRole("button", { name: "Álgebra Lineal" })

      fireEvent(
        labelButton,
        new MouseEvent("click", { bubbles: true, cancelable: true })
      )

      expect(baseProps.setEditingId).toHaveBeenCalledWith("p1")
      expect(baseProps.setTempName).toHaveBeenCalledWith("Álgebra Lineal")
    })

    it("lanza onRenameProject al perder el foco (onBlur) sobre el input de edición", () => {
      baseProps.editingId = "p1"
      baseProps.tempName = "Cambio por Desenfoque"
      render(<DomainFolderScreen {...baseProps} />)

      const input = screen.getByRole("textbox")
      fireEvent.blur(input)

      expect(baseProps.onRenameProject).toHaveBeenCalledWith(
        "p1",
        "Cambio por Desenfoque"
      )
    })

    it("lanza onRenameProject de forma exitosa al pulsar la tecla 'Enter'", async () => {
      baseProps.editingId = "p1"
      baseProps.tempName = "Nombre via Enter"
      render(<DomainFolderScreen {...baseProps} />)

      const input = screen.getByRole("textbox")
      await userEvent.type(input, "{enter}")

      expect(baseProps.onRenameProject).toHaveBeenCalledWith(
        "p1",
        "Nombre via Enter"
      )
    })

    it("cancela el modo de edición llamando a setEditingId(null) sin persistir al pulsar 'Escape'", async () => {
      baseProps.editingId = "p1"
      baseProps.tempName = "Texto Cancelado"
      render(<DomainFolderScreen {...baseProps} />)

      const input = screen.getByRole("textbox")
      await userEvent.type(input, "{escape}")

      expect(baseProps.setEditingId).toHaveBeenCalledWith(null)
      expect(baseProps.onRenameProject).not.toHaveBeenCalled()
    })
  })

  describe("Casos de Error y Límites de Datos", () => {
    it("renderiza de forma segura el contenedor sin arrojar errores si projectsInFolder está vacío", () => {
      baseProps.projectsInFolder = []
      render(<DomainFolderScreen {...baseProps} />)

      const cardsContainer = document.querySelector(".cards-container")
      expect(cardsContainer).toBeInTheDocument()
    })

    it("procesa correctamente cadenas con caracteres especiales o espacios múltiples en selectedDomainFolder", () => {
      baseProps.selectedDomainFolder = "ciencias-computación / versión 2.0 @"
      render(<DomainFolderScreen {...baseProps} />)

      expect(
        screen.getByRole("heading", {
          name: "CARPETA: CIENCIAS-COMPUTACIÓN / VERSIÓN 2.0 @"
        })
      ).toBeInTheDocument()
    })
  })
})
