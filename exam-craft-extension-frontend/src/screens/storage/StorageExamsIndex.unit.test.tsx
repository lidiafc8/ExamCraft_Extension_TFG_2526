import React, { type ComponentProps } from "react"
import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import "@testing-library/jest-dom"

import StorageExamsIndex from "./StorageExamsIndex"
import { downloadProjectAsMarkdown } from "~src/utils/exportUtils"
import { GithubService } from "~src/services/githubService"

vi.mock("./FoldersGridScreen", () => ({
  FoldersGridScreen: ({ onSelectFolder, onWelcome }: any) => (
    <div data-testid="screen-folders-grid">
      <button onClick={() => onSelectFolder("ajedrez")}>Ir a carpeta Ajedrez</button>
      <button onClick={() => onSelectFolder("clínica veterinaria")}>Ir a carpeta Veterinaria</button>
      <button onClick={onWelcome}>Ir a Bienvenida</button>
    </div>
  )
}))

vi.mock("./ExamSelectionScreen", () => ({
  DomainFolderScreen: ({ onSelectProject, onBack, onDeleteProject, onRenameProject, setEditingId, setTempName, projectsInFolder }: any) => (
    <div data-testid="screen-domain-folder">
      <button onClick={onBack}>Volver a Carpetas</button>
      {projectsInFolder.map((p: any) => (
        <div key={p.id} data-testid={`project-item-${p.id}`}>
          <span>{p.customName || p.domainName}</span>
          <button onClick={() => onSelectProject(p)}>Ver Detalle</button>
          <button onClick={() => onDeleteProject(p.id)}>Eliminar Directo</button>
          <button onClick={() => { setEditingId(p.id); setTempName("Nuevo Nombre"); onRenameProject(p.id, "Nuevo Nombre") }}>
            Renombrar
          </button>
        </div>
      ))}
    </div>
  )
}))

vi.mock("./ExamDetailScreen", () => ({
  ExamDetailScreen: ({ onShowGeneratedCode, onShowSolutionGeneratedCode, onBack, onDownload, onGitHubDeploy, onDeleteProject, selectedProject }: any) => (
    <div data-testid="screen-exam-detail">
      <button onClick={onBack}>Volver a Selección</button>
      <button onClick={onShowGeneratedCode}>Ver Código Generado</button>
      <button onClick={onShowSolutionGeneratedCode}>Ver Código Solución</button>
      <button onClick={() => onDownload("fichero-exportacion")}>Exportar Markdown</button>
      <button onClick={() => onGitHubDeploy("mock-token", selectedProject)}>Desplegar GitHub</button>
      <button onClick={() => onDeleteProject(selectedProject.id)}>Disparar Borrado Modal</button>
    </div>
  )
}))

vi.mock("./GenerationCodeScreen", () => ({
  GeneratedCodeScreen: ({ onBack, onDeleteSection, onDeleteTest, onUpdateProject, selectedProject }: any) => (
    <div data-testid="screen-generated-code">
      <button onClick={onBack}>Volver de Código</button>
      <button onClick={() => onDeleteSection("baseClasses")}>Borrar Clases Base</button>
      <button onClick={() => onDeleteTest("test-1")}>Borrar Test Individual</button>
      <button onClick={() => onUpdateProject({ ...selectedProject, baseClasses: "CuerpoModificado" })}>
        Actualizar Proyecto Async
      </button>
    </div>
  )
}))

vi.mock("./VisualSolutionCodeScreen", () => ({
  VisualSolutionCodeScreen: ({ onBack }: any) => (
    <div data-testid="screen-visual-solution">
      <button onClick={onBack}>Volver de Solución</button>
    </div>
  )
}))

vi.mock("~src/components/modals/DeleteConfirmationModal", () => ({
  DeleteConfirmationModal: ({ isOpen, itemName, onConfirm, onCancel }: any) => {
    if (!isOpen) return null
    return (
      <div data-testid="delete-confirmation-modal">
        <p>¿Borrar {itemName}?</p>
        <button onClick={onConfirm}>Confirmar Operación</button>
        <button onClick={onCancel}>Cancelar Operación</button>
      </div>
    )
  }
}))

vi.mock("~src/utils/exportUtils", () => ({
  downloadProjectAsMarkdown: vi.fn()
}))

vi.mock("~src/services/githubService", () => ({
  GithubService: {
    deployExam: vi.fn().mockResolvedValue({ status: "success" })
  }
}))

describe("StorageExamsIndex - Suite Orquestadora Completa", () => {
  let mockChromeStorage: Record<string, any>
  const baseProps = { onWelcome: vi.fn() }

  beforeEach(() => {
    vi.clearAllMocks()
    mockChromeStorage = {
      "project_1": { id: "project_1", domainName: "ajedrez", customName: "Examen Mayo" },
      "project_2": { id: "project_2", domainName: "clínica veterinaria", customName: "Examen Veterinaria" },
      "otra_key_no_project": { data: "invalida" }
    }

    globalThis.chrome = {
      storage: {
        local: {
          get: vi.fn((keys, callback) => callback(mockChromeStorage)),
          set: vi.fn((data, callback) => {
            mockChromeStorage = { ...mockChromeStorage, ...data }
            if (callback) callback()
          }),
          remove: vi.fn((key, callback) => {
            delete mockChromeStorage[key]
            if (callback) callback()
          })
        }
      },
      runtime: {
        lastError: null
      }
    } as any
  })

  afterEach(() => {
    delete (globalThis as any).chrome
  })

  describe("Casos Positivos (Flujos Felices)", () => {
    it("carga inicialmente los proyectos desde el almacenamiento local filtrando por el prefijo project_", async () => {
      render(<StorageExamsIndex {...baseProps} />)
      expect(globalThis.chrome.storage.local.get).toHaveBeenCalledWith(null, expect.any(Function))
      expect(screen.getByTestId("screen-folders-grid")).toBeInTheDocument()
    })

    it("navega fluidamente por el árbol completo: Carpetas -> Listado de Exámenes -> Detalle -> Pantallas de Código", async () => {
      render(<StorageExamsIndex {...baseProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Ir a carpeta Ajedrez" }))
      expect(screen.getByTestId("screen-domain-folder")).toBeInTheDocument()
      expect(screen.getByText("Examen Mayo")).toBeInTheDocument()

      await userEvent.click(screen.getByRole("button", { name: "Ver Detalle" }))
      expect(screen.getByTestId("screen-exam-detail")).toBeInTheDocument()

      await userEvent.click(screen.getByRole("button", { name: "Ver Código Generado" }))
      expect(screen.getByTestId("screen-generated-code")).toBeInTheDocument()

      await userEvent.click(screen.getByRole("button", { name: "Volver de Código" }))
      expect(screen.getByTestId("screen-exam-detail")).toBeInTheDocument()

      await userEvent.click(screen.getByRole("button", { name: "Ver Código Solución" }))
      expect(screen.getByTestId("screen-visual-solution")).toBeInTheDocument()
    })

    it("ejecuta de manera exitosa las llamadas de renombrado persistiendo los cambios en local", async () => {
      render(<StorageExamsIndex {...baseProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Ir a carpeta Ajedrez" }))
      await userEvent.click(screen.getByRole("button", { name: "Renombrar" }))

      expect(globalThis.chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "project_1": expect.objectContaining({ customName: "Nuevo Nombre" })
        }),
        expect.any(Function)
      )
    })

    it("permite invocar el proceso de exportación del examen a formato Markdown", async () => {
      render(<StorageExamsIndex {...baseProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Ir a carpeta Ajedrez" }))
      await userEvent.click(screen.getByRole("button", { name: "Ver Detalle" }))
      await userEvent.click(screen.getByRole("button", { name: "Exportar Markdown" }))

      expect(downloadProjectAsMarkdown).toHaveBeenCalledWith(
        expect.objectContaining({ id: "project_1", customName: "Examen Mayo" }),
        "fichero-exportacion"
      )
    })

    it("orquesta el despliegue automático en los repositorios de GitHub según el dominio analizado (Ajedrez)", async () => {
      render(<StorageExamsIndex {...baseProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Ir a carpeta Ajedrez" }))
      await userEvent.click(screen.getByRole("button", { name: "Ver Detalle" }))
      await userEvent.click(screen.getByRole("button", { name: "Desplegar GitHub" }))

      expect(GithubService.deployExam).toHaveBeenCalledWith(
        "mock-token",
        expect.objectContaining({ id: "project_1", domainName: "ajedrez" }),
        expect.stringContaining("examen-ajedrez-"),
        "lidiafc8",
        "DP1-chess-template-exam",
        "src/test/java/es/us/dp1/chess/tournament/"
      )
    })
  })

  describe("Casos Negativos y Manejo de Errores", () => {
    it("no inicializa estados ni explota si el entorno de ejecución carece del objeto chrome de extensión", () => {
      delete (globalThis as any).chrome
      
      render(<StorageExamsIndex {...baseProps} />)
      expect(screen.getByTestId("screen-folders-grid")).toBeInTheDocument()
    })

    it("cancela el guardado asíncrono si el string del nuevo nombre está vacío", async () => {
      render(<StorageExamsIndex {...baseProps} />)
      await userEvent.click(screen.getByRole("button", { name: "Ir a carpeta Ajedrez" }))
      
      vi.spyOn(globalThis.chrome.storage.local, "set")
      
      expect(globalThis.chrome.storage.local.set).not.toHaveBeenCalledWith(
        { "project_1": expect.objectContaining({ customName: "" }) }, 
        expect.any(Function)
      )
    })

    it("rechaza la promesa asíncrona si la API interna de runtime de Chrome reporta una anomalía de guardado", async () => {
      render(<StorageExamsIndex {...baseProps} />)
      await userEvent.click(screen.getByRole("button", { name: "Ir a carpeta Ajedrez" }))
      await userEvent.click(screen.getByRole("button", { name: "Ver Detalle" }))
      await userEvent.click(screen.getByRole("button", { name: "Ver Código Generado" }))

      globalThis.chrome.runtime.lastError = { message: "Quota bytes exceeded in storage local" }

      const botonActualizar = screen.getByRole("button", { name: "Actualizar Proyecto Async" })

      const unhandledRejectionSpy = vi.fn()
      process.on("unhandledRejection", unhandledRejectionSpy)

      await userEvent.click(botonActualizar)

      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(globalThis.chrome.storage.local.set).toHaveBeenCalled()

      process.off("unhandledRejection", unhandledRejectionSpy)
    })
  })
  
  describe("Casos Límite y Mutaciones de Estado", () => {
    it("despliega de manera controlada el modal de eliminación y aborta la acción si el usuario decide cancelar", async () => {
      render(<StorageExamsIndex {...baseProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Ir a carpeta Ajedrez" }))
      await userEvent.click(screen.getByRole("button", { name: "Ver Detalle" }))
      await userEvent.click(screen.getByRole("button", { name: "Disparar Borrado Modal" }))

      expect(screen.getByTestId("delete-confirmation-modal")).toBeInTheDocument()
      expect(screen.getByText("¿Borrar Examen Mayo?")).toBeInTheDocument()

      await userEvent.click(screen.getByRole("button", { name: "Cancelar Operación" }))
      expect(screen.queryByTestId("delete-confirmation-modal")).not.toBeInTheDocument()
      expect(globalThis.chrome.storage.local.remove).not.toHaveBeenCalled()
    })

    it("completa el ciclo de borrado físico del examen completo si el usuario confirma en el modal", async () => {
      render(<StorageExamsIndex {...baseProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Ir a carpeta Ajedrez" }))
      await userEvent.click(screen.getByRole("button", { name: "Ver Detalle" }))
      await userEvent.click(screen.getByRole("button", { name: "Disparar Borrado Modal" }))

      await userEvent.click(screen.getByRole("button", { name: "Confirmar Operación" }))
      
      expect(globalThis.chrome.storage.local.remove).toHaveBeenCalledWith("project_1", expect.any(Function))
      expect(screen.queryByTestId("delete-confirmation-modal")).not.toBeInTheDocument()
    })

    it("gestiona la eliminación individual de secciones del documento sin alterar las propiedades paralelas", async () => {
      render(<StorageExamsIndex {...baseProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Ir a carpeta Ajedrez" }))
      await userEvent.click(screen.getByRole("button", { name: "Ver Detalle" }))
      await userEvent.click(screen.getByRole("button", { name: "Ver Código Generado" }))

      await userEvent.click(screen.getByRole("button", { name: "Borrar Clases Base" }))

      expect(globalThis.chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "project_1": expect.objectContaining({ baseClasses: "" })
        }),
        expect.any(Function)
      )
    })

    it("elimina una llave específica de test individual dentro del mapa asociativo de tests sin corromper el resto", async () => {
      mockChromeStorage["project_1"].testPartsMap = {
        "test-1": { fileName: "TestUno.java", code: "// codigo 1" },
        "test-2": { fileName: "TestDos.java", code: "// codigo 2" }
      }

      render(<StorageExamsIndex {...baseProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Ir a carpeta Ajedrez" }))
      await userEvent.click(screen.getByRole("button", { name: "Ver Detalle" }))
      await userEvent.click(screen.getByRole("button", { name: "Ver Código Generado" }))

      await userEvent.click(screen.getByRole("button", { name: "Borrar Test Individual" }))

      expect(globalThis.chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "project_1": expect.objectContaining({
            testPartsMap: {
              "test-2": { fileName: "TestDos.java", code: "// codigo 2" }
            }
          })
        }),
        expect.any(Function)
      )
    })

    it("aplica correctamente la regla alternativa RegExp para identificar el repositorio de la clínica veterinaria", async () => {
      mockChromeStorage = {
        "project_2": { id: "project_2", domainName: "clínica veterinaria", customName: "Examen Veterinaria" }
      }

      render(<StorageExamsIndex {...baseProps} />)

      
      await userEvent.click(screen.getByRole("button", { name: "Ir a carpeta Veterinaria" }))
      await userEvent.click(screen.getByRole("button", { name: "Ver Detalle" }))
      await userEvent.click(screen.getByRole("button", { name: "Desplegar GitHub" }))

      expect(GithubService.deployExam).toHaveBeenCalledWith(
        "mock-token",
        expect.objectContaining({ id: "project_2", domainName: "clínica veterinaria" }),
        expect.any(String),
        "lidiafc8",
        "DP1-petClinic-template-exam",
        "src/test/java/org/springframework/samples/petclinic/grooming/"
      )
    })
  })
})