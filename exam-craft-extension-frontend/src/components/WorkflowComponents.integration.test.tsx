import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi, describe, it, expect, beforeEach } from "vitest"
import "@testing-library/jest-dom"
import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

// Ajusta las importaciones según la ruta de tus componentes
import { StepperHeader, PromptEditor, SplitResultView } from "./WorkflowComponents"

expect.extend(jestDomMatchers)

describe("Integración: Componentes de WorkFlow", () => {
  beforeEach(() => vi.clearAllMocks())

  // =========================================================
  // STEPPER HEADER
  // =========================================================
  describe("Componente: StepperHeader", () => {
    const defaultStepperProps = {
      steps: [{ label: "Paso 1" }, { label: "Paso 2" }, { label: "Paso 3" }],
      currentStep: 2
    }

    describe("Casos Positivos", () => {
      it("renderiza todos los pasos y sus etiquetas", () => {
        render(<StepperHeader {...defaultStepperProps} />)
        expect(screen.getByText("Paso 1")).toBeInTheDocument()
        expect(screen.getByText("Paso 2")).toBeInTheDocument()
        expect(screen.getByText("Paso 3")).toBeInTheDocument()
      })

      it("aplica las clases correctas según el estado del paso", () => {
        const { container } = render(<StepperHeader {...defaultStepperProps} />)
        
        // Paso 1: Completado (< currentStep)
        expect(container.querySelectorAll('.step-wrapper')[0]).toHaveClass('step-completed')
        // Paso 2: Activo (=== currentStep)
        expect(container.querySelectorAll('.step-wrapper')[1]).toHaveClass('step-active')
        // Paso 3: Inactivo (> currentStep)
        expect(container.querySelectorAll('.step-wrapper')[2]).toHaveClass('step-inactive')
      })
    })

    describe("Casos Límite", () => {
      it("no renderiza líneas de conexión si solo hay un paso", () => {
        const { container } = render(
          <StepperHeader steps={[{ label: "Único Paso" }]} currentStep={1} />
        )
        expect(container.querySelector('.step-line')).not.toBeInTheDocument()
      })

      it("marca todos completados si currentStep es mayor que la cantidad de pasos", () => {
        const { container } = render(<StepperHeader {...defaultStepperProps} currentStep={5} />)
        const wrappers = container.querySelectorAll('.step-wrapper')
        wrappers.forEach(w => expect(w).toHaveClass('step-completed'))
      })
    })
  })

  // =========================================================
  // PROMPT EDITOR
  // =========================================================
  describe("Componente: PromptEditor", () => {
    const defaultPromptProps = {
      title: "Título del Editor",
      description: "Descripción de prueba",
      promptText: "Texto inicial",
      isLoading: false,
      onPromptChange: vi.fn(),
      onGenerate: vi.fn(),
      onBack: vi.fn()
    }

    describe("Casos Positivos", () => {
      it("renderiza textos, botones y el textarea con su valor inicial", () => {
        render(<PromptEditor {...defaultPromptProps} />)
        
        expect(screen.getByText("Título del Editor")).toBeInTheDocument()
        expect(screen.getByText("Descripción de prueba")).toBeInTheDocument()
        expect(screen.getByRole("textbox")).toHaveValue("Texto inicial")
        expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Generar" })).toBeInTheDocument()
      })

      it("llama a onGenerate al pulsar el botón primario", async () => {
        render(<PromptEditor {...defaultPromptProps} />)
        await userEvent.click(screen.getByRole("button", { name: "Generar" }))
        expect(defaultPromptProps.onGenerate).toHaveBeenCalledTimes(1)
      })

      it("llama a onBack al pulsar el botón Volver", async () => {
        render(<PromptEditor {...defaultPromptProps} />)
        await userEvent.click(screen.getByRole("button", { name: "Volver" }))
        expect(defaultPromptProps.onBack).toHaveBeenCalledTimes(1)
      })
    })

    describe("Casos Negativos", () => {
      it("deshabilita el botón de generar y muestra spinner al estar cargando", () => {
        const { container } = render(<PromptEditor {...defaultPromptProps} isLoading={true} />)
        
        // Buscamos el botón por su clase, ya que al cargar pierde el texto "Generar"
        const generateButton = container.querySelector('.btn-step.primary')
        
        // 1. Validamos que el botón exista en el DOM
        expect(generateButton).toBeInTheDocument()
        
        // 2. Validamos que esté deshabilitado
        expect(generateButton).toBeDisabled()
        
        // 3. Validamos que el spinner esté renderizado dentro
        expect(container.querySelector('.loading-spinner')).toBeInTheDocument()
      })

      it("no renderiza el botón Volver si no se pasa la función onBack", () => {
        render(<PromptEditor {...defaultPromptProps} onBack={undefined} />)
        expect(screen.queryByRole("button", { name: "Volver" })).not.toBeInTheDocument()
      })
    })

    describe("Flujo Completo", () => {
      it("permite escribir en el textarea y dispara onPromptChange por cada tecla", async () => {
        render(<PromptEditor {...defaultPromptProps} promptText="" />)
        
        const textarea = screen.getByRole("textbox")
        await userEvent.type(textarea, "Hola")
        
        // Se llama 4 veces porque hemos escrito 4 letras ("H", "o", "l", "a")
        expect(defaultPromptProps.onPromptChange).toHaveBeenCalledTimes(4)
      })
    })
  })

  // =========================================================
  // SPLIT RESULT VIEW
  // =========================================================
  describe("Componente: SplitResultView", () => {
    const defaultSplitProps = {
      promptText: "Mi prompt",
      isLoading: false,
      responseText: "Respuesta de la IA",
      onPromptChange: vi.fn(),
      onRegenerate: vi.fn(),
      onResponseChange: vi.fn()
    }

    describe("Casos Positivos", () => {
      it("renderiza columnas izquierda y derecha con sus títulos por defecto", () => {
        render(<SplitResultView {...defaultSplitProps} />)
        expect(screen.getByText("Prompt enviado")).toBeInTheDocument()
        expect(screen.getByText("Propuesta del modelo")).toBeInTheDocument()
      })

      it("renderiza ambos textareas con sus valores correspondientes", () => {
        render(<SplitResultView {...defaultSplitProps} />)
        const textareas = screen.getAllByRole("textbox")
        expect(textareas[0]).toHaveValue("Mi prompt")
        expect(textareas[1]).toHaveValue("Respuesta de la IA")
      })
    })

    describe("Casos Negativos", () => {
      it("muestra el mensaje de 'Generando...' y oculta el textarea derecho si isLoading es true", () => {
        render(<SplitResultView {...defaultSplitProps} isLoading={true} />)
        
        expect(screen.getByText("Generando...")).toBeInTheDocument()
        // Solo debería haber 1 textbox (el de la izquierda)
        const textareas = screen.getAllByRole("textbox")
        expect(textareas).toHaveLength(1)
        expect(textareas[0]).toHaveValue("Mi prompt")
      })
    })

    describe("Casos Límite", () => {
      it("renderiza nodos React customizados en rightContent, rightActions y footer", () => {
        render(
          <SplitResultView 
            {...defaultSplitProps} 
            rightContent={<div data-testid="custom-content">Contenido Custom</div>}
            rightActions={<button>Acción Custom</button>}
            footer={<span>Footer Custom</span>}
          />
        )
        
        expect(screen.getByTestId("custom-content")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Acción Custom" })).toBeInTheDocument()
        expect(screen.getByText("Footer Custom")).toBeInTheDocument()
      })
    })

    describe("Flujo Completo", () => {
      it("modificar ambos textareas dispara sus funciones correspondientes", async () => {
        render(<SplitResultView {...defaultSplitProps} promptText="" responseText="" />)
        
        const textareas = screen.getAllByRole("textbox")
        const leftTextarea = textareas[0]
        const rightTextarea = textareas[1]

        await userEvent.type(leftTextarea, "A")
        expect(defaultSplitProps.onPromptChange).toHaveBeenCalledWith("A")

        await userEvent.type(rightTextarea, "B")
        expect(defaultSplitProps.onResponseChange).toHaveBeenCalledWith("B")
      })
    })
  })
})