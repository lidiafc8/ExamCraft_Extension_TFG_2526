import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import { DownloadConfirmModal } from "./DownloadConfirmModal"

expect.extend(jestDomMatchers)

const defaultProps = {
  isOpen: true,
  defaultFileName: "mi examen de historia 2026",
  onConfirm: vi.fn(),
  onCancel: vi.fn()
}

describe("Integración: DownloadConfirmModal", () => {
  beforeEach(() => vi.clearAllMocks())

  describe("Casos Positivos", () => {
    it("renderiza todos los elementos visuales correctamente cuando está abierto", () => {
      render(<DownloadConfirmModal {...defaultProps} />)

      expect(
        screen.getByRole("heading", { name: "Nombre del archivo", level: 3 })
      ).toBeInTheDocument()
      expect(
        screen.getByText("¿Cómo quieres llamar al archivo Markdown?")
      ).toBeInTheDocument()
      expect(screen.getByText("📥")).toBeInTheDocument()
    })

    it("reemplaza automáticamente los espacios del nombre por defecto con guiones bajos al abrirse", () => {
      render(<DownloadConfirmModal {...defaultProps} />)

      const input = screen.getByRole("textbox")
      expect(input).toHaveValue("mi_examen_de_historia_2026")
    })

    it("llama a onConfirm enviando el valor del input al hacer clic en Descargar", async () => {
      render(<DownloadConfirmModal {...defaultProps} />)

      await userEvent.click(
        screen.getByRole("button", { name: "Descargar (.md)" })
      )

      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
      expect(defaultProps.onConfirm).toHaveBeenCalledWith(
        "mi_examen_de_historia_2026"
      )
    })

    it("llama a onCancel al hacer clic en Cancelar", async () => {
      render(<DownloadConfirmModal {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
    })
  })

  describe("Casos Negativos", () => {
    it("no renderiza nada en absoluto si isOpen es false", () => {
      const { container } = render(
        <DownloadConfirmModal {...defaultProps} isOpen={false} />
      )

      expect(container.firstChild).toBeNull()
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    })

    it("no altera el flujo ni dispara callbacks si el usuario interactúa con el input pero no confirma", async () => {
      render(<DownloadConfirmModal {...defaultProps} />)

      const input = screen.getByRole("textbox")
      await userEvent.clear(input)
      await userEvent.type(input, "nuevo_nombre")

      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
      expect(defaultProps.onCancel).not.toHaveBeenCalled()
    })
  })

  describe("Casos Límite", () => {
    it("utiliza el defaultFileName original si el usuario borra por completo el input (fallback)", async () => {
      render(<DownloadConfirmModal {...defaultProps} />)

      const input = screen.getByRole("textbox")
      await userEvent.clear(input)
      expect(input).toHaveValue("")

      await userEvent.click(
        screen.getByRole("button", { name: "Descargar (.md)" })
      )

      expect(defaultProps.onConfirm).toHaveBeenCalledWith(
        "mi examen de historia 2026"
      )
    })

    it("reemplaza múltiples espacios consecutivos por un único guion bajo", () => {
      render(
        <DownloadConfirmModal
          {...defaultProps}
          defaultFileName="examen    con    muchos    espacios"
        />
      )

      const input = screen.getByRole("textbox")
      expect(input).toHaveValue("examen_con_muchos_espacios")
    })

    it("hace un trim correcto eliminando espacios vacíos adicionales alrededor al confirmar", async () => {
      render(<DownloadConfirmModal {...defaultProps} />)

      const input = screen.getByRole("textbox")
      await userEvent.clear(input)
      await userEvent.type(input, "   nombre_limpio   ")

      await userEvent.click(
        screen.getByRole("button", { name: "Descargar (.md)" })
      )

      expect(defaultProps.onConfirm).toHaveBeenCalledWith("nombre_limpio")
    })
  })

  describe("Flujo Completo", () => {
    it("flujo completo: abre el modal, lee el formateo inicial, escribe un nombre personalizado y descarga", async () => {
      const { rerender } = render(
        <DownloadConfirmModal
          {...defaultProps}
          isOpen={false}
          defaultFileName="Quiz Inicial"
        />
      )

      expect(screen.queryByRole("textbox")).not.toBeInTheDocument()

      rerender(
        <DownloadConfirmModal
          {...defaultProps}
          isOpen={true}
          defaultFileName="Quiz Inicial"
        />
      )

      const input = screen.getByRole("textbox")
      expect(input).toHaveValue("Quiz_Inicial")

      await userEvent.clear(input)
      await userEvent.type(input, "mi_propio_quiz_v2")

      await userEvent.click(
        screen.getByRole("button", { name: "Descargar (.md)" })
      )

      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
      expect(defaultProps.onConfirm).toHaveBeenCalledWith("mi_propio_quiz_v2")
    })
  })
})
