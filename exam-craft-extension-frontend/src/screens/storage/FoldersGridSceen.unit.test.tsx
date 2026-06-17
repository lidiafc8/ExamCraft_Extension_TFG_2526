import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import { FoldersGridScreen } from "./FoldersGridScreen"

type FoldersGridScreenProps = React.ComponentProps<typeof FoldersGridScreen>

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

vi.mock("../../../assets/images/archive.png", () => ({
  default: "mock-archive-image.png"
}))

describe("FoldersGridScreen", () => {
  let baseProps: FoldersGridScreenProps

  beforeEach(() => {
    vi.clearAllMocks()

    baseProps = {
      allowedFolders: ["MATEMÁTICAS", "HISTORIA", "PROGRAMACIÓN"],
      projects: [
        { id: "1", domainName: "Matemáticas" },
        { id: "2", domainName: "MATEMÁTICAS" },
        { id: "3", domainName: "Historia" }
      ],
      onWelcome: vi.fn(),
      onSelectFolder: vi.fn()
    }
  })

  describe("Casos Positivos - Renderizado Core y Conteo", () => {
    it("renderiza correctamente los elementos estructurales fijos de la pantalla", () => {
      render(<FoldersGridScreen {...baseProps} />)

      expect(screen.getByTestId("mock-header")).toBeInTheDocument()
      expect(
        screen.getByRole("heading", { name: "MIS EXÁMENES" })
      ).toBeInTheDocument()
      expect(screen.getByText("Selecciona un dominio")).toBeInTheDocument()
    })

    it("muestra únicamente las carpetas permitidas que contienen al menos un proyecto", () => {
      render(<FoldersGridScreen {...baseProps} />)

      expect(
        screen.getByRole("button", { name: /MATEMÁTICAS/ })
      ).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /HISTORIA/ })
      ).toBeInTheDocument()

      expect(
        screen.queryByRole("button", { name: /PROGRAMACIÓN/ })
      ).not.toBeInTheDocument()
    })

    it("calcula y muestra de manera exacta el conteo pluralizado y singularizado de los exámenes", () => {
      render(<FoldersGridScreen {...baseProps} />)

      expect(screen.getByText("2 EXÁMENES")).toBeInTheDocument()

      expect(screen.getByText("1 EXAMEN")).toBeInTheDocument()
    })

    it("renderiza las imágenes decorativas con su respectivo texto alternativo por carpeta", () => {
      render(<FoldersGridScreen {...baseProps} />)

      const folderImages = screen.getAllByRole("img", { name: "Carpeta" })
      expect(folderImages).toHaveLength(2)
    })
  })

  describe("Lógica de Funciones - Clicks y Navegación", () => {
    it("ejecuta onSelectFolder con el nombre original de la carpeta al hacer clic en una tarjeta", async () => {
      render(<FoldersGridScreen {...baseProps} />)

      const mathCard = screen.getByRole("button", { name: /MATEMÁTICAS/ })
      await userEvent.click(mathCard)

      expect(baseProps.onSelectFolder).toHaveBeenCalledTimes(1)
      expect(baseProps.onSelectFolder).toHaveBeenCalledWith("MATEMÁTICAS")
    })

    it("ejecuta onWelcome al accionar el botón 'Volver' al pie de la página", async () => {
      render(<FoldersGridScreen {...baseProps} />)

      const backBtn = screen.getByRole("button", { name: "Volver" })
      await userEvent.click(backBtn)

      expect(baseProps.onWelcome).toHaveBeenCalledTimes(1)
    })

    it("dispara la acción onWelcome desde el componente Header a través de los Breadcrumbs", async () => {
      render(<FoldersGridScreen {...baseProps} />)

      const breadcrumbBtn = screen.getByRole("button", { name: "INICIO" })
      await userEvent.click(breadcrumbBtn)

      expect(baseProps.onWelcome).toHaveBeenCalledTimes(1)
    })
  })

  describe("Casos Límite - Comparación Casing e Insensibilidad a Mayúsculas", () => {
    it("iguala correctamente las carpetas aunque combinan mayúsculas, minúsculas o espacios extraños en casing", () => {
      baseProps.allowedFolders = ["CiEnCiAs"]
      baseProps.projects = [
        { id: "1", domainName: "ciencias" },
        { id: "2", domainName: "CIENCIAS" }
      ]

      render(<FoldersGridScreen {...baseProps} />)

      expect(
        screen.getByRole("button", { name: /CIENCIAS/ })
      ).toBeInTheDocument()
      expect(screen.getByText("2 EXÁMENES")).toBeInTheDocument()
    })

    it("tolera proyectos que vengan con la propiedad domainName ausente o undefined sin romper la lógica", () => {
      baseProps.allowedFolders = ["QUÍMICA"]
      baseProps.projects = [
        { id: "1", domainName: undefined },
        { id: "2", domainName: null },
        { id: "3", domainName: "Química" }
      ]

      render(<FoldersGridScreen {...baseProps} />)

      expect(
        screen.getByRole("button", { name: /QUÍMICA/ })
      ).toBeInTheDocument()
      expect(screen.getByText("1 EXAMEN")).toBeInTheDocument()
    })
  })

  describe("Casos Negativos - Estados Vacíos de Datos", () => {
    it("muestra la interfaz de estado vacío si la lista filtrada de visibleFolders resulta en longitud cero", () => {
      baseProps.projects = [
        { id: "1", domainName: "Geografía" },
        { id: "2", domainName: "Arte" }
      ]

      render(<FoldersGridScreen {...baseProps} />)

      expect(
        screen.queryByRole("button", { name: /MATEMÁTICAS/ })
      ).not.toBeInTheDocument()

      expect(
        screen.getByText("Todavía no tienes ningún examen guardado.")
      ).toBeInTheDocument()
      expect(
        screen.getByText("Crea tu primer examen para verlo aquí.")
      ).toBeInTheDocument()
    })

    it("muestra el estado vacío si la lista total de proyectos recibida está completamente vacía", () => {
      baseProps.projects = []

      render(<FoldersGridScreen {...baseProps} />)

      expect(
        screen.getByText("Todavía no tienes ningún examen guardado.")
      ).toBeInTheDocument()
    })

    it("muestra el estado vacío si allowedFolders viene como un array vacío de origen", () => {
      baseProps.allowedFolders = []

      render(<FoldersGridScreen {...baseProps} />)

      expect(
        screen.getByText("Todavía no tienes ningún examen guardado.")
      ).toBeInTheDocument()
    })
  })
})
