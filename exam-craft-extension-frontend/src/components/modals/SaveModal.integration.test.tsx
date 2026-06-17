import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import { getAllFromChrome, saveToChrome } from "~src/utils/chromeStorageUtils"

import { SaveModal } from "./SaveModal"

expect.extend(jestDomMatchers)

vi.mock("~src/utils/chromeStorageUtils", () => ({
  getAllFromChrome: vi.fn(),
  saveToChrome: vi.fn()
}))

vi.mock("./ConfirmModal", () => ({
  ConfirmModal: ({
    title,
    message,
    warning,
    onConfirm,
    onCancel,
    confirmLabel
  }: any) => (
    <div data-testid="confirm-modal-mock">
      <h2>{title}</h2>
      <div data-testid="modal-message">{message}</div>
      <div data-testid="modal-warning">{warning}</div>
      <button onClick={onCancel}>Cancelar</button>
      <button onClick={onConfirm}>{confirmLabel}</button>
    </div>
  )
}))

vi.mock("./SuccessModal", () => ({
  SuccessModal: ({ title, message, actions }: any) => (
    <div data-testid="success-modal-mock">
      <h2>{title}</h2>
      <p>{message}</p>
      {actions.map((action: any) => (
        <button key={action.label} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </div>
  )
}))

const defaultProps = {
  domainName: "Matemáticas",
  onSuccess: vi.fn(),
  onClose: vi.fn(),
  buildPayload: vi.fn((name) => ({
    customName: name,
    domainName: "Matemáticas",
    data: "test"
  })),
  existingKey: undefined,
  skipPrompt: false
}

describe("Integración: SaveModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAllFromChrome).mockResolvedValue([])
    vi.mocked(saveToChrome).mockResolvedValue(undefined)
  })

  describe("Casos Positivos", () => {
    it("renderiza el estado 'prompt' inicial con el nombre autogenerado por defecto", () => {
      render(<SaveModal {...defaultProps} />)

      expect(
        screen.getByRole("heading", { name: "Guardar examen" })
      ).toBeInTheDocument()

      const input = screen.getByLabelText("Nombre del examen")
      expect(input).toHaveValue("Examen de Matemáticas")

      expect(
        screen.queryByText("⚠️ Se usará el nombre por defecto si se deja vacío")
      ).not.toBeInTheDocument()
    })

    it("permite guardar exitosamente y transiciona a la pantalla de SuccessModal", async () => {
      render(<SaveModal {...defaultProps} />)

      const input = screen.getByLabelText("Nombre del examen")
      await userEvent.clear(input)
      await userEvent.type(input, "Parcial Geometría")

      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      await waitFor(() => {
        expect(getAllFromChrome).toHaveBeenCalledTimes(1)
        expect(saveToChrome).toHaveBeenCalledWith(
          expect.stringContaining("project_"),
          {
            customName: "Parcial Geometría",
            domainName: "Matemáticas",
            data: "test"
          }
        )
        expect(screen.getByTestId("success-modal-mock")).toBeInTheDocument()
        expect(
          screen.getByText(
            'El examen "Parcial Geometría" se ha guardado correctamente.'
          )
        ).toBeInTheDocument()
      })
    })

    it("dispara las clases de focus en los iconos e inputs contenedores al hacer foco en el elemento", async () => {
      const { container } = render(<SaveModal {...defaultProps} />)
      const input = screen.getByLabelText("Nombre del examen")

      await userEvent.click(input)
      expect(container.querySelector(".save-modal-input-icon")).toHaveClass(
        "save-modal-input-icon--focused"
      )
      expect(container.querySelector(".save-modal-input")).toHaveClass(
        "save-modal-input--focused"
      )

      await userEvent.click(container.firstChild as HTMLElement)

      expect(container.querySelector(".save-modal-input-icon")).not.toHaveClass(
        "save-modal-input-icon--focused"
      )
      expect(container.querySelector(".save-modal-input")).not.toHaveClass(
        "save-modal-input--focused"
      )
    })
  })

  describe("Casos Negativos", () => {
    it("bloquea el guardado si detecta un duplicado en la base de datos de Chrome para el mismo dominio", async () => {
      vi.mocked(getAllFromChrome).mockResolvedValue([
        {
          _key: "old_key",
          domainName: "Matemáticas",
          customName: "examen repetido"
        }
      ])

      const { container } = render(<SaveModal {...defaultProps} />)
      const input = screen.getByLabelText("Nombre del examen")

      await userEvent.clear(input)
      await userEvent.type(input, "  Examen Repetido  ")

      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      await waitFor(() => {
        expect(
          screen.getByText(
            /❌ Ya existe un examen con ese nombre en "Matemáticas"/i
          )
        ).toBeInTheDocument()
        expect(container.querySelector(".save-modal-input")).toHaveClass(
          "save-modal-input--error"
        )
        expect(saveToChrome).not.toHaveBeenCalled()
      })
    })

    it("captura errores de la promesa saveToChrome y renderiza el modal de error con opción de reintentar", async () => {
      vi.mocked(saveToChrome).mockRejectedValue(
        new Error("Espacio insuficiente en Chrome Storage")
      )

      render(<SaveModal {...defaultProps} />)
      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Error al guardar" })
        ).toBeInTheDocument()
        expect(
          screen.getByText("Espacio insuficiente en Chrome Storage")
        ).toBeInTheDocument()
      })

      await userEvent.click(screen.getByRole("button", { name: "Reintentar" }))
      expect(
        screen.getByRole("heading", { name: "Guardar examen" })
      ).toBeInTheDocument()
    })
  })

  describe("Casos Límite", () => {
    it("si skipPrompt es true, guarda inmediatamente de forma automática usando el domainName como override", async () => {
      const { container } = render(
        <SaveModal {...defaultProps} skipPrompt={true} />
      )

      expect(
        container.querySelector(".save-modal-input-wrapper")
      ).not.toBeInTheDocument()

      await waitFor(() => {
        expect(saveToChrome).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ customName: "Matemáticas" })
        )
        expect(screen.getByTestId("success-modal-mock")).toBeInTheDocument()
      })
    })

    it("utiliza el defaultName como fallback absoluto si el usuario borra el input por completo", async () => {
      render(<SaveModal {...defaultProps} />)
      const input = screen.getByLabelText("Nombre del examen")

      await userEvent.clear(input)

      expect(
        screen.getByText("⚠️ Se usará el nombre por defecto si se deja vacío")
      ).toBeInTheDocument()

      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      await waitFor(() => {
        expect(saveToChrome).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ customName: "Examen de Matemáticas" })
        )
      })
    })

    it("ignora el registro duplicado si coincide con el existingKey actual (modo edición)", async () => {
      vi.mocked(getAllFromChrome).mockResolvedValue([
        {
          _key: "project_123",
          domainName: "Matemáticas",
          customName: "examen original"
        }
      ])

      render(<SaveModal {...defaultProps} existingKey="project_123" />)
      const input = screen.getByLabelText("Nombre del examen")

      await userEvent.clear(input)
      await userEvent.type(input, "examen original")

      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      await waitFor(() => {
        expect(
          screen.queryByText(/❌ Ya existe un examen con ese nombre/i)
        ).not.toBeInTheDocument()
        expect(saveToChrome).toHaveBeenCalledWith(
          "project_123",
          expect.any(Object)
        )
      })
    })
  })

  describe("Flujo Completo", () => {
    it("flujo completo: intenta guardar un duplicado, limpia el error al escribir, cambia el texto y procesa con éxito", async () => {
      vi.mocked(getAllFromChrome).mockResolvedValue([
        { _key: "any", domainName: "Matemáticas", customName: "error_name" }
      ])

      const { container } = render(
        <SaveModal {...defaultProps} successAction="Cerrar Todo" />
      )
      const input = screen.getByLabelText("Nombre del examen")

      await userEvent.clear(input)
      await userEvent.type(input, "error_name")
      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      await waitFor(() => {
        expect(
          screen.getByText(/❌ Ya existe un examen con ese nombre/i)
        ).toBeInTheDocument()
      })

      await userEvent.type(input, "_nuevo")
      expect(
        screen.queryByText(/❌ Ya existe un examen con ese nombre/i)
      ).not.toBeInTheDocument()
      expect(container.querySelector(".save-modal-input")).not.toHaveClass(
        "save-modal-input--error"
      )

      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      await waitFor(() => {
        expect(screen.getByTestId("success-modal-mock")).toBeInTheDocument()
      })

      await userEvent.click(screen.getByRole("button", { name: "Cerrar Todo" }))
      expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1)
    })

    it("retorna false en checkDuplicate si la llamada a getAllFromChrome falla lanzando una excepción (Líneas 54-55)", async () => {
      vi.mocked(getAllFromChrome).mockRejectedValue(
        new Error("Error de lectura en Chrome Storage")
      )

      render(<SaveModal {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      await waitFor(() => {
        expect(getAllFromChrome).toHaveBeenCalledTimes(1)
        expect(saveToChrome).toHaveBeenCalled()
        expect(screen.getByTestId("success-modal-mock")).toBeInTheDocument()
      })
    })

    it("utiliza el mensaje alternativo 'No se pudo guardar.' si el objeto capturado en el catch no es una instancia de Error (Línea 73)", async () => {
      vi.mocked(saveToChrome).mockRejectedValue(
        "Error misterioso de la extensión"
      )

      render(<SaveModal {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Error al guardar" })
        ).toBeInTheDocument()
        expect(screen.getByText("No se pudo guardar.")).toBeInTheDocument()
      })
    })
  })
})
