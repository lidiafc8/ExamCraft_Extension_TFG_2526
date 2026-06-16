import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"
import type { ComponentProps } from "react"
import "@testing-library/jest-dom/vitest"

import { FoldersGridScreen } from "./FoldersGridScreen"

// Extraemos el tipo de las props dinámicamente ya que no está exportado
type FoldersGridScreenProps = ComponentProps<typeof FoldersGridScreen>

// 1. Mock de recursos estáticos (imágenes)
vi.mock("../../../assets/images/archive.png", () => ({
  default: "archive-mock-image.png"
}))

// 2. Mock del componente Header para aislar la vista
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
    { id: "p2", domainName: "MATEMÁTICAS" }, // Prueba insensibilidad a mayúsculas/minúsculas
    { id: "p3", domainName: "Historia" }      // Un solo examen para probar el singular "1 EXAMEN"
  ]

  beforeEach(() => {
    defaultProps = {
      allowedFolders: mockAllowedFolders,
      projects: mockProjects,
      onWelcome: vi.fn(),
      onSelectFolder: vi.fn()
    }
  })

  // --- RENDERING & GRID STATE ---
  it("debería renderizar las carpetas visibles que contienen proyectos", () => {
    render(<FoldersGridScreen {...defaultProps} />)

    // Título principal
    expect(screen.getByText("MIS EXÁMENES")).toBeInTheDocument()

    // Comprobar que "Matemáticas" e "Historia" aparecen porque tienen proyectos vinculados
    expect(screen.getByText("MATEMÁTICAS")).toBeInTheDocument()
    expect(screen.getByText("HISTORIA")).toBeInTheDocument()

    // "Ciencias" no debería renderizarse porque no tiene proyectos en el array
    expect(screen.queryByText("CIENCIAS")).not.toBeInTheDocument()
  })

  it("debería manejar correctamente el texto en plural y singular de los contadores", () => {
    render(<FoldersGridScreen {...defaultProps} />)

    // Matemáticas tiene 2 proyectos vinculados -> Plural
    expect(screen.getByText("2 EXÁMENES")).toBeInTheDocument()

    // Historia tiene 1 proyecto vinculado -> Singular
    expect(screen.getByText("1 EXAMEN")).toBeInTheDocument()
  })

  // --- EMPTY STATE ---
  it("debería mostrar el diseño de estado vacío si ninguna carpeta permitida tiene proyectos", () => {
    const emptyProps: FoldersGridScreenProps = {
      ...defaultProps,
      projects: [] // Sin proyectos guardados
    }
    render(<FoldersGridScreen {...emptyProps} />)

    // Mensajes informativos de estado vacío
    expect(screen.getByText("Todavía no tienes ningún examen guardado.")).toBeInTheDocument()
    expect(screen.getByText("Crea tu primer examen para verlo aquí.")).toBeInTheDocument()

    // No debería haber ningún botón de carpeta renderizado
    expect(screen.queryByRole("button", { name: /EXAMEN/ })).not.toBeInTheDocument()
  })

  // --- INTERACTION & NAVIGATION ---
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
    
    // Hacemos click en la tarjeta de Matemáticas
    const folderButton = screen.getByRole("button", { name: /MATEMÁTICAS/ })
    fireEvent.click(folderButton)

    expect(defaultProps.onSelectFolder).toHaveBeenCalledWith("Matemáticas")
  })
})