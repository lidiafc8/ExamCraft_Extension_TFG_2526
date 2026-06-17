import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import StorageExamsIndex from "./StorageExamsIndex"

declare global {
  var chrome: any
}

let errorCapturadoEnMock: Error | null = null

vi.mock("./FoldersGridScreen", () => ({
  FoldersGridScreen: ({ onSelectFolder }: any) => (
    <div data-testid="folders-grid">
      <button onClick={() => onSelectFolder("ajedrez")}>
        Seleccionar Ajedrez
      </button>
    </div>
  )
}))

vi.mock("./ExamSelectionScreen", () => ({
  DomainFolderScreen: ({
    onSelectProject,
    onBack,
    onDeleteProject,
    onRenameProject
  }: any) => (
    <div data-testid="domain-folder">
      <button
        onClick={() =>
          onSelectProject({
            id: "project_1",
            domainName: "ajedrez",
            baseClasses: "class A {}",
            testPartsMap: {
              "TestDos.java": { fileName: "TestDos.java", code: "code" }
            }
          })
        }>
        Ver Proyecto 1
      </button>
      <button onClick={() => onDeleteProject("project_1")}>
        Eliminar Directo
      </button>
      <button onClick={() => onRenameProject("project_1", "Nuevo Nombre")}>
        Renombrar Proyecto
      </button>
      <button onClick={onBack}>Volver a Grid</button>
    </div>
  )
}))

vi.mock("./ExamDetailScreen", () => ({
  ExamDetailScreen: ({
    onShowGeneratedCode,
    onShowSolutionGeneratedCode,
    onBack,
    onDeleteProject
  }: any) => (
    <div data-testid="exam-detail">
      <button onClick={onShowGeneratedCode}>Ver Código Generado</button>
      <button onClick={onShowSolutionGeneratedCode}>Ver Solución Visual</button>
      <button onClick={() => onDeleteProject("project_1")}>
        Abrir Modal Eliminar
      </button>
      <button onClick={onBack}>Volver a Carpeta</button>
    </div>
  )
}))

vi.mock("./GenerationCodeScreen", () => ({
  GeneratedCodeScreen: ({
    onBack,
    onDeleteTest,
    onDeleteSection,
    onUpdateProject,
    selectedProject
  }: any) => (
    <div data-testid="generated-code-screen">
      <button
        title="Eliminar TestDos.java"
        onClick={() => onDeleteTest("TestDos.java")}>
        X Test
      </button>
      <button
        title="Eliminar Clases Base"
        onClick={() => onDeleteSection("baseClasses")}>
        X Sección
      </button>
      <button
        onClick={() => {
          onUpdateProject({
            ...selectedProject,
            baseClasses: "class Modificada {}"
          }).catch((err: Error) => {
            errorCapturadoEnMock = err
          })
        }}>
        Guardar
      </button>
      <button onClick={onBack}>Atrás</button>
    </div>
  )
}))

vi.mock("./VisualSolutionCodeScreen", () => ({
  VisualSolutionCodeScreen: ({ onBack }: any) => (
    <div data-testid="visual-solution-screen">
      <button onClick={onBack}>Atrás Solución</button>
    </div>
  )
}))

vi.mock("~src/services/githubService")
vi.mock("~src/utils/exportUtils")

describe("StorageExamsIndex Integration Tests", () => {
  const mockOnWelcome = vi.fn()
  let fakeStorage: Record<string, any> = {}

  beforeEach(() => {
    vi.clearAllMocks()
    errorCapturadoEnMock = null
    fakeStorage = {
      project_1: {
        domainName: "ajedrez",
        customName: "Mi Examen",
        baseClasses: "public class Main {}",
        testPartsMap: {}
      }
    }

    vi.stubGlobal("chrome", {
      storage: {
        local: {
          get: vi.fn((key, callback) => callback(fakeStorage)),
          set: vi.fn((data, callback) => {
            fakeStorage = { ...fakeStorage, ...data }
            if (callback) callback()
          }),
          remove: vi.fn((id, callback) => {
            delete fakeStorage[id]
            if (callback) callback()
          })
        }
      },
      runtime: {
        lastError: null
      }
    })
  })

  it("debería cargar los proyectos de chrome.storage.local al montar el componente", async () => {
    render(<StorageExamsIndex onWelcome={mockOnWelcome} />)
    expect(chrome.storage.local.get).toHaveBeenCalledWith(
      null,
      expect.any(Function)
    )
    expect(screen.getByTestId("folders-grid")).toBeInTheDocument()
  })

  it("debería navegar por todo el ciclo de pantallas: Grid -> Carpeta -> Detalle -> Códigos", async () => {
    render(<StorageExamsIndex onWelcome={mockOnWelcome} />)

    fireEvent.click(screen.getByText("Seleccionar Ajedrez"))
    expect(screen.getByTestId("domain-folder")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Ver Proyecto 1"))
    expect(screen.getByTestId("exam-detail")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Ver Código Generado"))
    expect(screen.getByTestId("generated-code-screen")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Atrás"))
    expect(screen.getByTestId("exam-detail")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Ver Solución Visual"))
    expect(screen.getByTestId("visual-solution-screen")).toBeInTheDocument()
  })

  it("debería renombrar un proyecto modificando el storage local", async () => {
    render(<StorageExamsIndex onWelcome={mockOnWelcome} />)
    fireEvent.click(screen.getByText("Seleccionar Ajedrez"))

    fireEvent.click(screen.getByText("Renombrar Proyecto"))
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      { project_1: expect.objectContaining({ customName: "Nuevo Nombre" }) },
      expect.any(Function)
    )
  })

  it("debería eliminar un proyecto directamente desde la vista de la carpeta", async () => {
    render(<StorageExamsIndex onWelcome={mockOnWelcome} />)
    fireEvent.click(screen.getByText("Seleccionar Ajedrez"))

    fireEvent.click(screen.getByText("Eliminar Directo"))
    expect(chrome.storage.local.remove).toHaveBeenCalledWith(
      "project_1",
      expect.any(Function)
    )
  })

  it("debería abrir el modal de confirmación y borrar el examen completo", async () => {
    render(<StorageExamsIndex onWelcome={mockOnWelcome} />)
    fireEvent.click(screen.getByText("Seleccionar Ajedrez"))
    fireEvent.click(screen.getByText("Ver Proyecto 1"))

    fireEvent.click(screen.getByText("Abrir Modal Eliminar"))

    const confirmBtn = screen.getByRole("button", { name: /sí, eliminar/i })
    fireEvent.click(confirmBtn)

    expect(chrome.storage.local.remove).toHaveBeenCalledWith(
      "project_1",
      expect.any(Function)
    )
  })

  it("debería mutar y eliminar una sección específica (baseClasses) sin borrar el proyecto", async () => {
    render(<StorageExamsIndex onWelcome={mockOnWelcome} />)
    fireEvent.click(screen.getByText("Seleccionar Ajedrez"))
    fireEvent.click(screen.getByText("Ver Proyecto 1"))
    fireEvent.click(screen.getByText("Ver Código Generado"))

    fireEvent.click(screen.getByTitle("Eliminar Clases Base"))
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      { project_1: expect.objectContaining({ baseClasses: "" }) },
      expect.any(Function)
    )
  })

  it("debería eliminar una clave del mapa testPartsMap cuando se invoca onDeleteTest", async () => {
    render(<StorageExamsIndex onWelcome={mockOnWelcome} />)
    fireEvent.click(screen.getByText("Seleccionar Ajedrez"))
    fireEvent.click(screen.getByText("Ver Proyecto 1"))
    fireEvent.click(screen.getByText("Ver Código Generado"))

    fireEvent.click(screen.getByText("X Test"))

    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      { project_1: expect.objectContaining({ testPartsMap: {} }) },
      expect.any(Function)
    )
  })

  it("debería resolver y actualizar los cambios cuando onUpdateProject se ejecuta con éxito", async () => {
    render(<StorageExamsIndex onWelcome={mockOnWelcome} />)
    fireEvent.click(screen.getByText("Seleccionar Ajedrez"))
    fireEvent.click(screen.getByText("Ver Proyecto 1"))
    fireEvent.click(screen.getByText("Ver Código Generado"))

    fireEvent.click(screen.getByText("Guardar"))
    expect(chrome.storage.local.set).toHaveBeenCalled()
  })

  it("debería rechazar la promesa con un error si chrome.runtime.lastError está presente", async () => {
    vi.stubGlobal("chrome", {
      storage: {
        local: {
          get: vi.fn((key, callback) => callback(fakeStorage)),
          set: vi.fn((data, callback) => {
            chrome.runtime.lastError = { message: "Quota exceeded" }
            if (callback) callback()
          }),
          remove: vi.fn()
        }
      },
      runtime: { lastError: null }
    })

    render(<StorageExamsIndex onWelcome={mockOnWelcome} />)

    fireEvent.click(screen.getByText("Seleccionar Ajedrez"))
    fireEvent.click(screen.getByText("Ver Proyecto 1"))
    fireEvent.click(screen.getByText("Ver Código Generado"))

    fireEvent.click(screen.getByText("Guardar"))

    await waitFor(() => {
      expect(errorCapturadoEnMock).not.toBeNull()
    })

    expect(errorCapturadoEnMock?.message).toBe("Quota exceeded")
  })
})
