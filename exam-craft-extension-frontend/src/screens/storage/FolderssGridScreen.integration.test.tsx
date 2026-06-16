import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"
import type { ComponentProps } from "react"
import "@testing-library/jest-dom/vitest"

import { FoldersGridScreen } from "./FoldersGridScreen"

type FoldersGridScreenProps = ComponentProps<typeof FoldersGridScreen>

vi.mock("../../../assets/images/archive.png", () => ({
  default: "archive-mock-image.png"
}))

vi.mock("~src/components/Header", () => ({
  Header: ({ currentStep, onWelcome }: any) => (
    <header data-testid="mock-header">
      <button onClick={onWelcome}>Inicio Breadcrumb</button>
      <span>{currentStep}</span>
    </header>
  )
}))

describe("FoldersGridScreen Integration Tests", () => {
  let defaultProps: FoldersGridScreenProps

  const mockAllowedFolders = ["Matemáticas", "Historia", "Ciencias"]
  const mockProjects = [
    { id: "p1", domainName: "Matemáticas" },
    { id: "p2", domainName: "MATEMÁTICAS" }, 
    { id: "p3", domainName: "Historia" }    
  ]

  beforeEach(() => {
    defaultProps = {
      allowedFolders: mockAllowedFolders,
      projects: mockProjects,
      onWelcome: vi.fn(),
      onSelectFolder: vi.fn()
    }
  })

  it("debería renderizar las carpetas visibles que contienen proyectos", () => {
    render(<FoldersGridScreen {...defaultProps} />)

    expect(screen.getByText("MIS EXÁMENES")).toBeInTheDocument()

    expect(screen.getByText("MATEMÁTICAS")).toBeInTheDocument()
    expect(screen.getByText("HISTORIA")).toBeInTheDocument()

    expect(screen.queryByText("CIENCIAS")).not.toBeInTheDocument()
  })

  it("debería manejar correctamente el texto en plural y singular de los contadores", () => {
    render(<FoldersGridScreen {...defaultProps} />)

    expect(screen.getByText("2 EXÁMENES")).toBeInTheDocument()

    expect(screen.getByText("1 EXAMEN")).toBeInTheDocument()
  })

  it("debería mostrar el diseño de estado vacío si ninguna carpeta permitida tiene proyectos", () => {
    const emptyProps: FoldersGridScreenProps = {
      ...defaultProps,
      projects: []
    }
    render(<FoldersGridScreen {...emptyProps} />)

    expect(screen.getByText("Todavía no tienes ningún examen guardado.")).toBeInTheDocument()
    expect(screen.getByText("Crea tu primer examen para verlo aquí.")).toBeInTheDocument()

    expect(screen.queryByRole("button", { name: /EXAMEN/ })).not.toBeInTheDocument()
  })

  it("debería ejecutar onWelcome al hacer click en el acceso del Header", () => {
    render(<FoldersGridScreen {...defaultProps} />)
    fireEvent.click(screen.getByText("Inicio Breadcrumb"))
    
    expect(defaultProps.onWelcome).toHaveBeenCalledTimes(1)
  })

  it("debería ejecutar onWelcome al hacer click en el botón Volver del pie de página", () => {
    render(<FoldersGridScreen {...defaultProps} />)
    fireEvent.click(screen.getByRole("button", { name: "Volver" }))
    
    expect(defaultProps.onWelcome).toHaveBeenCalledTimes(1)
  })

  it("debería ejecutar onSelectFolder con el nombre correcto de la carpeta al hacer click en ella", () => {
    render(<FoldersGridScreen {...defaultProps} />)
    
    const folderButton = screen.getByRole("button", { name: /MATEMÁTICAS/ })
    fireEvent.click(folderButton)

    expect(defaultProps.onSelectFolder).toHaveBeenCalledWith("Matemáticas")
  })
})