import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React, { useState } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import CreateExamByPartsScreen from "../chooseCreate/CreateExamByPartsScreen"
import CreateExamSelectionScreen from "../chooseCreate/CreateExamSelectionScreen"
import WelcomeScreen from "./WelcomeScreen"

expect.extend(jestDomMatchers)

vi.mock("~src/components/Header", () => ({
  Header: ({ currentStep, onWelcome, breadcrumbItems }: any) => (
    <header data-testid="mock-header">
      <span data-testid="current-step">{currentStep}</span>
      <button onClick={onWelcome}>Ir a Inicio</button>
      {breadcrumbItems?.map((item: any) => (
        <button key={item.label} onClick={item.action}>
          {item.label}
        </button>
      ))}
    </header>
  )
}))

vi.mock("../../../assets/images/exam.png", () => ({ default: "exam.png" }))
vi.mock("../../../assets/images/archive.png", () => ({
  default: "archive.png"
}))
vi.mock("../../../assets/images/complete_exam.png", () => ({
  default: "complete_exam.png"
}))
vi.mock("../../../assets/images/parts_exam.png", () => ({
  default: "parts_exam.png"
}))
vi.mock("../../../assets/images/code.png", () => ({ default: "code.png" }))
vi.mock("../../../assets/images/statement.png", () => ({
  default: "statement.png"
}))

function MiniApp() {
  const [screen_name, setScreen] = useState<
    "welcome" | "createExam" | "createByParts"
  >("welcome")

  if (screen_name === "createExam") {
    return (
      <CreateExamSelectionScreen
        onBack={() => setScreen("welcome")}
        onCreateExamByParts={() => setScreen("createByParts")}
      />
    )
  }

  if (screen_name === "createByParts") {
    return (
      <CreateExamByPartsScreen
        onBack={() => setScreen("createExam")}
        onWelcome={() => setScreen("welcome")}
        onCodeGeneration={() => {}}
        onComponents={() => {}}
      />
    )
  }

  return (
    <WelcomeScreen
      onStart={() => {}}
      onCreateExam={() => setScreen("createExam")}
      onBack={() => {}}
      onStorage={() => {}}
    />
  )
}

describe("Integración: flujo de navegación Welcome → CreateExam → ByParts", () => {
  it("navega de WelcomeScreen a CreateExamSelectionScreen al pulsar 'Crear examen'", async () => {
    render(<MiniApp />)

    expect(screen.getByText("¡BIENVENIDO A EXAMCRAFT!")).toBeInTheDocument()

    await userEvent.click(screen.getByText("Crear examen"))

    expect(screen.getByText("CREAR NUEVO EXAMEN")).toBeInTheDocument()
    expect(
      screen.queryByText("¡BIENVENIDO A EXAMCRAFT!")
    ).not.toBeInTheDocument()
  })

  it("navega de CreateExamSelectionScreen a CreateExamByPartsScreen", async () => {
    render(<MiniApp />)

    await userEvent.click(screen.getByText("Crear examen"))
    await userEvent.click(screen.getByText("Crear examen por partes"))

    expect(screen.getByText("CREAR EXAMEN POR PARTES")).toBeInTheDocument()
  })

  it("vuelve a WelcomeScreen desde CreateExamSelectionScreen con el breadcrumb INICIO", async () => {
    render(<MiniApp />)

    await userEvent.click(screen.getByText("Crear examen"))
    expect(screen.getByText("CREAR NUEVO EXAMEN")).toBeInTheDocument()

    await userEvent.click(screen.getByText("INICIO"))

    expect(screen.getByText("¡BIENVENIDO A EXAMCRAFT!")).toBeInTheDocument()
  })

  it("vuelve a CreateExamSelectionScreen desde CreateExamByPartsScreen con el breadcrumb CREAR EXAMEN", async () => {
    render(<MiniApp />)

    await userEvent.click(screen.getByText("Crear examen"))
    await userEvent.click(screen.getByText("Crear examen por partes"))
    expect(screen.getByText("CREAR EXAMEN POR PARTES")).toBeInTheDocument()

    await userEvent.click(screen.getByText("CREAR EXAMEN"))

    expect(screen.getByText("CREAR NUEVO EXAMEN")).toBeInTheDocument()
  })
})
