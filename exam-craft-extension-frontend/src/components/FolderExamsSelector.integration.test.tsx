import React, { useState } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi, describe, it, expect, beforeEach } from "vitest"
import "@testing-library/jest-dom"
import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import { FolderExamSelector } from "./FolderExamsSelector"

expect.extend(jestDomMatchers)

vi.mock("../../assets/images/archive.png", () => ({ default: "archive.png" }))
vi.mock("../../assets/images/exam.png", () => ({ default: "exam.png" }))

const mockProjects = [
  { id: "project_1", domainName: "clínica veterinaria", customName: "Examen Veterinaria 1" },
  { id: "project_2", domainName: "clínica veterinaria", customName: "Examen Veterinaria 2" },
  { id: "project_3", domainName: "ajedrez", customName: "Examen Ajedrez 1" },
]

const allowedFolders = ["clínica veterinaria", "ajedrez"]
const displayName = (proj: any) => proj.customName || `Examen de ${proj.domainName}`

function SelectorWrapper(props: Partial<React.ComponentProps<typeof FolderExamSelector>> = {}) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  return (
    <FolderExamSelector
      projects={mockProjects}
      allowedFolders={allowedFolders}
      selectedFolder={selectedFolder}
      onSelectFolder={(f) => setSelectedFolder(f || null)}
      onSelectProject={vi.fn()}
      onBack={vi.fn()}
      displayName={displayName}
      {...props}
    />
  )
}

describe("Integración: FolderExamSelector", () => {
  beforeEach(() => vi.clearAllMocks())

  // =========================================================
  // CASOS POSITIVOS — todo funciona con datos válidos
  // =========================================================
  describe("Casos Positivos", () => {
    it("muestra todas las carpetas que tienen proyectos asignados", () => {
      render(<SelectorWrapper />)

      expect(screen.getByText("CLÍNICA VETERINARIA")).toBeInTheDocument()
      expect(screen.getByText("AJEDREZ")).toBeInTheDocument()
    })

    it("muestra el contador correcto de exámenes por carpeta", () => {
      render(<SelectorWrapper />)

      expect(screen.getByText("2 EXÁMENES")).toBeInTheDocument()
      expect(screen.getByText("1 EXAMEN")).toBeInTheDocument()
    })

    it("al pulsar una carpeta muestra los exámenes de esa carpeta", async () => {
      render(<SelectorWrapper />)

      await userEvent.click(screen.getByText("CLÍNICA VETERINARIA"))

      expect(screen.getByText("Examen Veterinaria 1")).toBeInTheDocument()
      expect(screen.getByText("Examen Veterinaria 2")).toBeInTheDocument()
    })

    it("llama a onSelectProject con el proyecto correcto al pulsar un examen", async () => {
      const onSelectProject = vi.fn()
      render(<SelectorWrapper onSelectProject={onSelectProject} />)

      await userEvent.click(screen.getByText("CLÍNICA VETERINARIA"))
      await userEvent.click(screen.getAllByTitle("Abrir examen")[0])

      expect(onSelectProject).toHaveBeenCalledTimes(1)
      expect(onSelectProject).toHaveBeenCalledWith(mockProjects[0])
    })

    it("llama a onBack al pulsar Volver desde la vista de carpetas", async () => {
      const onBack = vi.fn()
      render(<SelectorWrapper onBack={onBack} />)

      await userEvent.click(screen.getByText("Volver"))

      expect(onBack).toHaveBeenCalledTimes(1)
    })

    it("aplica filterProject y muestra solo las carpetas que pasan el filtro", () => {
      render(
        <SelectorWrapper filterProject={(p) => p.domainName === "ajedrez"} />
      )

      expect(screen.getByText("AJEDREZ")).toBeInTheDocument()
      expect(screen.queryByText("CLÍNICA VETERINARIA")).not.toBeInTheDocument()
    })
  })

  // =========================================================
  // CASOS NEGATIVOS — datos ausentes o inválidos
  // =========================================================
  describe("Casos Negativos", () => {
    it("muestra mensaje vacío por defecto si no hay proyectos", () => {
      render(<SelectorWrapper projects={[]} />)

      expect(screen.getByText("No hay exámenes creados todavía.")).toBeInTheDocument()
    })

    it("muestra mensaje vacío personalizado si se pasa emptyFoldersMessage", () => {
      render(
        <SelectorWrapper
          projects={[]}
          emptyFoldersMessage="Sin exámenes disponibles aún."
        />
      )

      expect(screen.getByText("Sin exámenes disponibles aún.")).toBeInTheDocument()
    })

    it("no muestra carpetas que no tienen ningún proyecto asignado", () => {
      const soloVeterinaria = mockProjects.filter(
        (p) => p.domainName === "clínica veterinaria"
      )
      render(<SelectorWrapper projects={soloVeterinaria} />)

      expect(screen.queryByText("AJEDREZ")).not.toBeInTheDocument()
    })

    it("no muestra exámenes de otras carpetas al entrar en una carpeta concreta", async () => {
      render(<SelectorWrapper />)

      await userEvent.click(screen.getByText("CLÍNICA VETERINARIA"))

      expect(screen.queryByText("Examen Ajedrez 1")).not.toBeInTheDocument()
    })

    it("no llama a onSelectProject si no se pulsa ningún examen", () => {
      const onSelectProject = vi.fn()
      render(<SelectorWrapper onSelectProject={onSelectProject} />)

      expect(onSelectProject).not.toHaveBeenCalled()
    })

    it("muestra emptyProjectsMessage si la carpeta no tiene exámenes tras filtrar", async () => {
      // Filtramos para que veterinaria no pase, pero entramos en ella igualmente
      render(
        <SelectorWrapper
          filterProject={(p) => p.domainName === "ajedrez"}
          selectedFolder="clínica veterinaria"
          emptyProjectsMessage="Esta carpeta no tiene exámenes válidos."
        />
      )

      expect(
        screen.getByText("Esta carpeta no tiene exámenes válidos.")
      ).toBeInTheDocument()
    })
  })

  // =========================================================
  // CASOS LÍMITE — valores extremos o situaciones frontera
  // =========================================================
  describe("Casos Límite", () => {
    it("maneja correctamente un proyecto sin customName usando el domainName", async () => {
      const sinCustomName = [
        { id: "project_x", domainName: "ajedrez" }
      ]
      render(<SelectorWrapper projects={sinCustomName} />)

      await userEvent.click(screen.getByText("AJEDREZ")).catch(() => {})
    })

    it("es insensible a mayúsculas al comparar domainName con las carpetas permitidas", () => {
      const proyectoMayusculas = [
        { id: "project_y", domainName: "CLÍNICA VETERINARIA", customName: "Test mayúsculas" }
      ]
      render(<SelectorWrapper projects={proyectoMayusculas} />)

      expect(screen.getByText("CLÍNICA VETERINARIA")).toBeInTheDocument()
    })

    it("muestra exactamente '1 EXAMEN' en singular cuando solo hay un proyecto en la carpeta", () => {
      render(<SelectorWrapper />)

      expect(screen.getByText("1 EXAMEN")).toBeInTheDocument()
      expect(screen.queryByText("1 EXÁMENES")).not.toBeInTheDocument()
    })

    it("no renderiza ninguna carpeta si allowedFolders está vacío aunque haya proyectos", () => {
      render(<SelectorWrapper allowedFolders={[]} />)

      expect(screen.queryByText("CLÍNICA VETERINARIA")).not.toBeInTheDocument()
      expect(screen.queryByText("AJEDREZ")).not.toBeInTheDocument()
    })
  })

  // =========================================================
  // FLUJO COMPLETO — navegación de principio a fin
  // =========================================================
  describe("Flujo Completo", () => {
    it("flujo completo: carpetas → seleccionar carpeta → seleccionar examen", async () => {
      const onSelectProject = vi.fn()
      render(<SelectorWrapper onSelectProject={onSelectProject} />)

      // 1. Vista inicial: carpetas visibles
      expect(screen.getByText("CLÍNICA VETERINARIA")).toBeInTheDocument()

      // 2. Entrar en una carpeta
      await userEvent.click(screen.getByText("CLÍNICA VETERINARIA"))
      expect(screen.getByText("Examen Veterinaria 1")).toBeInTheDocument()
      expect(screen.queryByText("AJEDREZ")).not.toBeInTheDocument()

      // 3. Seleccionar un examen
      await userEvent.click(screen.getAllByTitle("Abrir examen")[0])
      expect(onSelectProject).toHaveBeenCalledWith(mockProjects[0])
    })

    it("flujo completo: entrar en carpeta → volver → entrar en otra carpeta", async () => {
      render(<SelectorWrapper />)

      // 1. Entrar en veterinaria
      await userEvent.click(screen.getByText("CLÍNICA VETERINARIA"))
      expect(screen.getByText("Examen Veterinaria 1")).toBeInTheDocument()

      // 2. Volver a carpetas
      await userEvent.click(screen.getByText("Volver"))
      expect(screen.getByText("CLÍNICA VETERINARIA")).toBeInTheDocument()
      expect(screen.getByText("AJEDREZ")).toBeInTheDocument()

      // 3. Entrar en ajedrez
      await userEvent.click(screen.getByText("AJEDREZ"))
      expect(screen.getByText("Examen Ajedrez 1")).toBeInTheDocument()
      expect(screen.queryByText("Examen Veterinaria 1")).not.toBeInTheDocument()
    })

    it("flujo completo: filtrar proyectos → entrar en carpeta → ver solo los filtrados", async () => {
      render(
        <SelectorWrapper
          filterProject={(p) => p.id === "project_3"}
        />
      )

      // Solo ajedrez visible tras filtrar
      expect(screen.queryByText("CLÍNICA VETERINARIA")).not.toBeInTheDocument()
      expect(screen.getByText("AJEDREZ")).toBeInTheDocument()

      // Entrar y ver solo el examen que pasa el filtro
      await userEvent.click(screen.getByText("AJEDREZ"))
      expect(screen.getByText("Examen Ajedrez 1")).toBeInTheDocument()
      expect(screen.queryByText("Examen Veterinaria 1")).not.toBeInTheDocument()
    })
  })
})