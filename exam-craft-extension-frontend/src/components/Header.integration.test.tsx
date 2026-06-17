import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import { Header } from "./Header"

expect.extend(jestDomMatchers)

vi.mock("../../assets/icon512.png", () => ({ default: "logo.png" }))

const defaultProps = {
  onWelcome: vi.fn(),
  breadcrumbItems: [
    { label: "INICIO", action: vi.fn() },
    { label: "CREAR EXAMEN", action: vi.fn() }
  ],
  currentStep: "POR PARTES"
}

describe("Integración: Header", () => {
  beforeEach(() => vi.clearAllMocks())

  describe("Casos Positivos", () => {
    it("renderiza el logo con su alt y aria-label correctos", () => {
      render(<Header {...defaultProps} />)

      expect(screen.getByAltText("Logo ExamCraft")).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "Ir a inicio" })
      ).toBeInTheDocument()
    })

    it("renderiza todos los items del breadcrumb", () => {
      render(<Header {...defaultProps} />)

      expect(screen.getByText("INICIO")).toBeInTheDocument()
      expect(screen.getByText("CREAR EXAMEN")).toBeInTheDocument()
    })

    it("renderiza el paso actual como texto no clicable", () => {
      render(<Header {...defaultProps} />)

      expect(screen.getByText("POR PARTES")).toBeInTheDocument()
      expect(
        screen.queryByRole("button", { name: "POR PARTES" })
      ).not.toBeInTheDocument()
    })

    it("renderiza los separadores entre breadcrumbs", () => {
      render(<Header {...defaultProps} />)

      const separators = screen.getAllByText(">")
      expect(separators.length).toBeGreaterThanOrEqual(1)
    })

    it("llama a onWelcome al pulsar el logo", async () => {
      render(<Header {...defaultProps} />)

      await userEvent.click(screen.getByRole("button", { name: "Ir a inicio" }))

      expect(defaultProps.onWelcome).toHaveBeenCalledTimes(1)
    })

    it("llama a la acción correcta al pulsar cada breadcrumb", async () => {
      render(<Header {...defaultProps} />)

      await userEvent.click(screen.getByText("INICIO"))
      expect(defaultProps.breadcrumbItems[0].action).toHaveBeenCalledTimes(1)

      await userEvent.click(screen.getByText("CREAR EXAMEN"))
      expect(defaultProps.breadcrumbItems[1].action).toHaveBeenCalledTimes(1)
    })

    it("renderiza correctamente con un solo breadcrumb", () => {
      render(
        <Header
          onWelcome={vi.fn()}
          breadcrumbItems={[{ label: "INICIO", action: vi.fn() }]}
          currentStep="CREAR EXAMEN"
        />
      )

      expect(screen.getByText("INICIO")).toBeInTheDocument()
      expect(screen.getByText("CREAR EXAMEN")).toBeInTheDocument()
    })
  })

  describe("Casos Negativos", () => {
    it("no renderiza ningún breadcrumb si el array está vacío", () => {
      render(
        <Header onWelcome={vi.fn()} breadcrumbItems={[]} currentStep="INICIO" />
      )

      expect(
        screen.queryByRole("button", { name: "INICIO" })
      ).not.toBeInTheDocument()
      expect(screen.getByText("INICIO")).toBeInTheDocument()
    })

    it("no llama a onWelcome si no se pulsa el logo", () => {
      render(<Header {...defaultProps} />)

      expect(defaultProps.onWelcome).not.toHaveBeenCalled()
    })

    it("no llama a las acciones de breadcrumb si no se pulsa ninguno", () => {
      render(<Header {...defaultProps} />)

      defaultProps.breadcrumbItems.forEach((item) => {
        expect(item.action).not.toHaveBeenCalled()
      })
    })

    it("no confunde onWelcome con las acciones de los breadcrumbs", async () => {
      render(<Header {...defaultProps} />)

      await userEvent.click(screen.getByText("INICIO"))

      expect(defaultProps.onWelcome).not.toHaveBeenCalled()
      expect(defaultProps.breadcrumbItems[0].action).toHaveBeenCalledTimes(1)
    })
  })

  describe("Casos Límite", () => {
    it("renderiza correctamente con breadcrumbs vacío y currentStep vacío", () => {
      render(<Header onWelcome={vi.fn()} breadcrumbItems={[]} currentStep="" />)

      expect(
        screen.getByRole("button", { name: "Ir a inicio" })
      ).toBeInTheDocument()
    })

    it("maneja correctamente muchos breadcrumbs sin romperse", () => {
      const manyItems = Array.from({ length: 10 }, (_, i) => ({
        label: `PASO ${i + 1}`,
        action: vi.fn()
      }))

      render(
        <Header
          onWelcome={vi.fn()}
          breadcrumbItems={manyItems}
          currentStep="FINAL"
        />
      )

      manyItems.forEach((item) => {
        expect(screen.getByText(item.label)).toBeInTheDocument()
      })
      expect(screen.getByText("FINAL")).toBeInTheDocument()
    })

    it("renderiza correctamente un currentStep con caracteres especiales", () => {
      render(
        <Header
          onWelcome={vi.fn()}
          breadcrumbItems={[]}
          currentStep="CLÍNICA VETERINARIA 🐾"
        />
      )

      expect(screen.getByText("CLÍNICA VETERINARIA 🐾")).toBeInTheDocument()
    })

    it("cada breadcrumb tiene su propia acción independiente", async () => {
      render(<Header {...defaultProps} />)

      await userEvent.click(screen.getByText("CREAR EXAMEN"))

      expect(defaultProps.breadcrumbItems[0].action).not.toHaveBeenCalled()
      expect(defaultProps.breadcrumbItems[1].action).toHaveBeenCalledTimes(1)
    })
  })

  describe("Flujo Completo", () => {
    it("flujo completo: navegar por varios breadcrumbs y luego al inicio con el logo", async () => {
      const onWelcome = vi.fn()
      const accionInicio = vi.fn()
      const accionCrear = vi.fn()

      render(
        <Header
          onWelcome={onWelcome}
          breadcrumbItems={[
            { label: "INICIO", action: accionInicio },
            { label: "CREAR EXAMEN", action: accionCrear }
          ]}
          currentStep="POR PARTES"
        />
      )

      await userEvent.click(screen.getByText("CREAR EXAMEN"))
      expect(accionCrear).toHaveBeenCalledTimes(1)
      expect(accionInicio).not.toHaveBeenCalled()

      await userEvent.click(screen.getByText("INICIO"))
      expect(accionInicio).toHaveBeenCalledTimes(1)

      await userEvent.click(screen.getByRole("button", { name: "Ir a inicio" }))
      expect(onWelcome).toHaveBeenCalledTimes(1)
    })

    it("flujo completo: header con breadcrumbs vacíos solo permite navegar con el logo", async () => {
      const onWelcome = vi.fn()

      render(
        <Header
          onWelcome={onWelcome}
          breadcrumbItems={[]}
          currentStep="INICIO"
        />
      )

      expect(screen.queryByText("INICIO")).toBeInTheDocument()
      expect(screen.queryAllByRole("button", { name: "INICIO" })).toHaveLength(
        0
      )

      await userEvent.click(screen.getByRole("button", { name: "Ir a inicio" }))
      expect(onWelcome).toHaveBeenCalledTimes(1)
    })
  })
})
