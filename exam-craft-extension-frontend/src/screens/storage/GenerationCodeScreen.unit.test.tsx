import React from "react"
import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom" 

import { GeneratedCodeScreen } from "./GenerationCodeScreen"
import { parseJavaFiles } from "~src/utils/codeUtils"

type ComponentProps = React.ComponentProps<typeof GeneratedCodeScreen>

vi.mock("~src/utils/codeUtils", () => ({
  parseJavaFiles: vi.fn()
}))

vi.mock("~src/components/Header", () => ({
  Header: ({ breadcrumbItems, currentStep }: any) => (
    <header data-testid="mock-header">
      <span data-testid="step">{currentStep}</span>
      <div data-testid="breadcrumbs">
        {breadcrumbItems.map((bi: any) => bi.label).join(" > ")}
      </div>
    </header>
  )
}))

vi.mock("~src/components/JavaCodeBlock", () => ({
  JavaCodeBlock: ({ filename, code }: any) => (
    <div data-testid="java-code-block" data-filename={filename}>
      <code>{code}</code>
    </div>
  )
}))

vi.mock("~src/components/modals/DeleteConfirmationModal", () => ({
  DeleteConfirmationModal: ({ isOpen, itemName, onConfirm, onCancel }: any) => {
    if (!isOpen) return null
    return (
      <div data-testid="delete-modal">
        <span>Eliminar {itemName}</span>
        <button onClick={onConfirm}>Confirmar Borrado</button>
        <button onClick={onCancel}>Cancelar Borrado</button>
      </div>
    )
  }
}))

describe("GeneratedCodeScreen - Suite Completa de Tests", () => {
  let baseProps: ComponentProps

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(parseJavaFiles).mockReturnValue([
      { path: "src/Tablero.linea", filename: "Tablero.java", code: "public class Tablero {}" }
    ])

    baseProps = {
      selectedProject: {
        id: "project-123",
        customName: "Examen de Ajedrez Avanzado",
        domainName: "Ajedrez",
        baseClasses: "public class Tablero {}",
        testPartsMap: {
          "test-key-1": { fileName: "TableroTest.java", code: "@Test void testMovimiento() {}" }
        }
      },
      selectedDomainFolder: "Ajedrez_2026",
      onWelcome: vi.fn(),
      onBack: vi.fn(),
      onGoToExams: vi.fn(),
      onGoToFolders: vi.fn(),
      onDeleteSection: vi.fn(),
      onDeleteTest: vi.fn(),
      onUpdateProject: vi.fn().mockResolvedValue(undefined)
    }
  })
  describe("Casos Positivos (Flujos Felices)", () => {
    it("renderiza correctamente las rutas de migas de pan y bloques de código Java", () => {
      render(<GeneratedCodeScreen {...baseProps} />)

      expect(screen.getByTestId("step")).toHaveTextContent("CÓDIGO EXAMEN")
      expect(screen.getByTestId("breadcrumbs")).toHaveTextContent(
        "INICIO > EXÁMENES ANTERIORES > AJEDREZ_2026 > Examen de Ajedrez Avanzado"
      )
      expect(screen.getByText("public class Tablero {}")).toBeInTheDocument()
      expect(screen.getByText("@Test void testMovimiento() {}")).toBeInTheDocument()
    })

    it("abre la edición de clases base, modifica el contenido y guarda mandando el payload estructurado", async () => {
      render(<GeneratedCodeScreen {...baseProps} />)

      expect(screen.queryByRole("button", { name: "Guardar cambios" })).not.toBeInTheDocument()

      const toggleEdit = screen.getAllByRole("button", { name: "🔒 No editable" })[0]
      await userEvent.click(toggleEdit)
      expect(toggleEdit).toHaveTextContent("✎ Editando")

      const cajaTexto = screen.getByRole("textbox")
      await userEvent.clear(cajaTexto)
      await userEvent.type(cajaTexto, "public class TableroModificado {{}")

      const botonGuardar = screen.getByRole("button", { name: "Guardar cambios" })
      expect(botonGuardar).toBeInTheDocument()
      await userEvent.click(botonGuardar)

      expect(baseProps.onUpdateProject).toHaveBeenCalledWith(
        expect.objectContaining({
          baseClasses: "public class TableroModificado {}",
          updatedAt: expect.any(String)
        })
      )
    })

    it("permite modificar una sección de test individual sin alterar las clases base de origen", async () => {
      render(<GeneratedCodeScreen {...baseProps} />)

      const toggleEditTest = screen.getAllByRole("button", { name: "🔒 No editable" })[1]
      await userEvent.click(toggleEditTest)

      const cajaTexto = screen.getByRole("textbox")
      await userEvent.clear(cajaTexto)
      await userEvent.type(cajaTexto, "// Código de test reescrito")

      await userEvent.click(screen.getByRole("button", { name: "Guardar cambios" }))

      expect(baseProps.onUpdateProject).toHaveBeenCalledWith(
        expect.objectContaining({
          baseClasses: "public class Tablero {}",
          testPartsMap: {
            "test-key-1": { fileName: "TableroTest.java", code: "// Código de test reescrito" }
          }
        })
      )
    })
  })

  describe("Casos Negativos y Manejo de Errores", () => {
    it("lanza un alert en pantalla si la API falla y desbloquea el botón de guardar", async () => {
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {})
      baseProps.onUpdateProject = vi.fn().mockRejectedValue(new Error("Error de conexión 500"))

      render(<GeneratedCodeScreen {...baseProps} />)

      await userEvent.click(screen.getAllByRole("button", { name: "🔒 No editable" })[0])
      await userEvent.type(screen.getByRole("textbox"), "Fallo simulado")

      const botonGuardar = screen.getByRole("button", { name: "Guardar cambios" })
      await userEvent.click(botonGuardar)

      expect(alertMock).toHaveBeenCalledWith("Error de conexión 500")
      expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeEnabled()
      
      alertMock.mockRestore()
    })

    it("usa la función genérica onDeleteSection si el callback especializado onDeleteTest no viene definido", async () => {
      const propsSinBorradorEspecializado = { ...baseProps, onDeleteTest: undefined }

      render(<GeneratedCodeScreen {...propsSinBorradorEspecializado} />)

      const botonCruces = screen.getAllByRole("button", { name: "✕" })
      await userEvent.click(botonCruces[1])

      await userEvent.click(screen.getByRole("button", { name: "Confirmar Borrado" }))

      expect(baseProps.onDeleteSection).toHaveBeenCalledWith("testPart:test-key-1")
    })
  })

  
  describe("Casos Limite y Sincronización de Estados", () => {
    it("renderiza correctamente los textos de control vacíos si el payload no trae información", () => {
      vi.mocked(parseJavaFiles).mockReturnValue([])

      const emptyProps: ComponentProps = {
        ...baseProps,
        selectedProject: {
          id: "empty-id",
          baseClasses: "",
          testPartsMap: {}
        }
      }

      render(<GeneratedCodeScreen {...emptyProps} />)

      expect(screen.getByText("Aún no se han generado las clases base para este examen.")).toBeInTheDocument()
      expect(screen.getByText("Aún no se han generado los tests para este examen.")).toBeInTheDocument()
      expect(screen.queryByRole("button", { name: "🔒 No editable" })).not.toBeInTheDocument()
    })

    it("cierra el modal por completo si el usuario presiona el botón Cancelar", async () => {
      render(<GeneratedCodeScreen {...baseProps} />)

      await userEvent.click(screen.getAllByRole("button", { name: "✕" })[0])
      expect(screen.getByTestId("delete-modal")).toBeInTheDocument()

      await userEvent.click(screen.getByRole("button", { name: "Cancelar Borrado" }))
      expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument()
      expect(baseProps.onDeleteSection).not.toHaveBeenCalled()
    })

    it("re-sincroniza los estados internos del componente si el 'selectedProject' muta desde el padre", async () => {
      const { rerender } = render(<GeneratedCodeScreen {...baseProps} />)
      expect(screen.getByText("public class Tablero {}")).toBeInTheDocument()

      vi.mocked(parseJavaFiles).mockReturnValue([
        { path: "src/Tablero.java", filename: "Tablero.java", code: "public class TableroV2 {}" }
      ])

      const proyectoActualizado = {
        id: "project-123",
        customName: "Examen de Ajedrez Avanzado",
        baseClasses: "public class TableroV2 {}",
        testPartsMap: {
          "test-key-1": { fileName: "TableroTest.java", code: "@Test void testNuevo() {}" }
        }
      }

      await act(async () => {
        rerender(<GeneratedCodeScreen {...baseProps} selectedProject={proyectoActualizado} />)
      })

      expect(screen.getByText("public class TableroV2 {}")).toBeInTheDocument()
      expect(screen.getByText("@Test void testNuevo() {}")).toBeInTheDocument()
    })

    it("ignora y remueve de la lista aquellos objetos de test corruptos que carecen de código o nombre", () => {
      const propsCorruptas: ComponentProps = {
        ...baseProps,
        selectedProject: {
          id: "id-corrupto",
          baseClasses: "public class Valida {}",
          testPartsMap: {
            "test-valido": { fileName: "OkTest.java", code: "public class OkTest {}" },
            "test-sin-codigo": { fileName: "NoCodeTest.java", code: "" },
            "test-sin-nombre": { fileName: "", code: "public class NoNameTest {}" }
          }
        }
      }

      render(<GeneratedCodeScreen {...propsCorruptas} />)

      const bloquesDeCodigo = screen.getAllByTestId("java-code-block")
      const filenamesRenderizados = bloquesDeCodigo.map(el => el.getAttribute("data-filename"))
      expect(filenamesRenderizados).toContain("OkTest.java")
      expect(filenamesRenderizados).not.toContain("NoCodeTest.java")
    })

    it("llama a onDeleteSection cuando se borra un item de tipo section (Linea 105)", async () => {
      render(<GeneratedCodeScreen {...baseProps} />)

      const botonBorrarSeccion = screen.getAllByRole("button", { name: "✕" })[0]
      await userEvent.click(botonBorrarSeccion)

      const botonConfirmar = screen.getByRole("button", { name: "Confirmar Borrado" })
      await userEvent.click(botonConfirmar)

      expect(baseProps.onDeleteSection).toHaveBeenCalled()
    })

    it("llama a onDeleteTest cuando se borra un item de tipo test especializado (Linea 108)", async () => {
      render(<GeneratedCodeScreen {...baseProps} />)

      const botonBorrarTest = screen.getAllByRole("button", { name: "✕" })[1]
      await userEvent.click(botonBorrarTest)

      const botonConfirmar = screen.getByRole("button", { name: "Confirmar Borrado" })
      await userEvent.click(botonConfirmar)

      expect(baseProps.onDeleteTest).toHaveBeenCalledWith("test-key-1")
    })
  })
})