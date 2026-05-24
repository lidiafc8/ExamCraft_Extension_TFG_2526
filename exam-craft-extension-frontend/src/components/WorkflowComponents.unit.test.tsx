/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepperHeader, PromptEditor, SplitResultView } from "./WorkflowComponents";

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const steps = [
  { label: "Paso 1" },
  { label: "Paso 2" },
  { label: "Paso 3" },
];

// ===========================================================================
// STEPPER HEADER
// ===========================================================================

describe("StepperHeader – renderizado", () => {
  it("renderiza el contenedor del stepper", () => {
    const { container } = render(<StepperHeader steps={steps} currentStep={1} />);
    expect(container.querySelector(".stepper-container")).toBeInTheDocument();
  });

  it("renderiza todos los pasos", () => {
    render(<StepperHeader steps={steps} currentStep={1} />);
    expect(screen.getByText("Paso 1")).toBeInTheDocument();
    expect(screen.getByText("Paso 2")).toBeInTheDocument();
    expect(screen.getByText("Paso 3")).toBeInTheDocument();
  });

  it("renderiza los números de paso correctamente", () => {
    render(<StepperHeader steps={steps} currentStep={1} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renderiza N-1 líneas separadoras entre pasos", () => {
    const { container } = render(<StepperHeader steps={steps} currentStep={1} />);
    expect(container.querySelectorAll(".step-line")).toHaveLength(2);
  });

  it("no renderiza líneas con un solo paso", () => {
    const { container } = render(<StepperHeader steps={[{ label: "Solo" }]} currentStep={1} />);
    expect(container.querySelectorAll(".step-line")).toHaveLength(0);
  });
});

describe("StepperHeader – clases de estado", () => {
  it("el paso actual tiene la clase 'step-active'", () => {
    const { container } = render(<StepperHeader steps={steps} currentStep={2} />);
    const wrappers = container.querySelectorAll(".step-wrapper");
    expect(wrappers[1]).toHaveClass("step-active");
  });

  it("los pasos anteriores al actual tienen la clase 'step-completed'", () => {
    const { container } = render(<StepperHeader steps={steps} currentStep={3} />);
    const wrappers = container.querySelectorAll(".step-wrapper");
    expect(wrappers[0]).toHaveClass("step-completed");
    expect(wrappers[1]).toHaveClass("step-completed");
  });

  it("los pasos posteriores al actual tienen la clase 'step-inactive'", () => {
    const { container } = render(<StepperHeader steps={steps} currentStep={1} />);
    const wrappers = container.querySelectorAll(".step-wrapper");
    expect(wrappers[1]).toHaveClass("step-inactive");
    expect(wrappers[2]).toHaveClass("step-inactive");
  });

  it("el primer paso es activo cuando currentStep es 1", () => {
    const { container } = render(<StepperHeader steps={steps} currentStep={1} />);
    const wrappers = container.querySelectorAll(".step-wrapper");
    expect(wrappers[0]).toHaveClass("step-active");
  });

  it("todos los pasos son completed excepto el último cuando currentStep es el último", () => {
    const { container } = render(<StepperHeader steps={steps} currentStep={3} />);
    const wrappers = container.querySelectorAll(".step-wrapper");
    expect(wrappers[0]).toHaveClass("step-completed");
    expect(wrappers[1]).toHaveClass("step-completed");
    expect(wrappers[2]).toHaveClass("step-active");
  });
});

describe("StepperHeader – colores de línea", () => {
  it("la línea entre pasos completados es verde", () => {
    const { container } = render(<StepperHeader steps={steps} currentStep={3} />);
    const lines = container.querySelectorAll(".step-line");
    expect(lines[0]).toHaveStyle({ background: "#4CAF50" });
    expect(lines[1]).toHaveStyle({ background: "#4CAF50" });
  });

  it("la línea entre paso activo e inactivo es gris", () => {
    const { container } = render(<StepperHeader steps={steps} currentStep={1} />);
    const lines = container.querySelectorAll(".step-line");
    expect(lines[0]).toHaveStyle({ background: "#e0e0e0" });
  });

  it("primera línea verde y segunda gris cuando currentStep es 2", () => {
    const { container } = render(<StepperHeader steps={steps} currentStep={2} />);
    const lines = container.querySelectorAll(".step-line");
    expect(lines[0]).toHaveStyle({ background: "#4CAF50" });
    expect(lines[1]).toHaveStyle({ background: "#e0e0e0" });
  });
});

describe("StepperHeader – casos límite", () => {
  it("no rompe con array de pasos vacío", () => {
    const { container } = render(<StepperHeader steps={[]} currentStep={1} />);
    expect(container.querySelector(".stepper-container")).toBeInTheDocument();
  });

  it("no rompe con un solo paso", () => {
    render(<StepperHeader steps={[{ label: "Único" }]} currentStep={1} />);
    expect(screen.getByText("Único")).toBeInTheDocument();
  });

  it("no rompe con currentStep mayor que el número de pasos", () => {
    const { container } = render(<StepperHeader steps={steps} currentStep={99} />);
    const wrappers = container.querySelectorAll(".step-wrapper");
    wrappers.forEach(w => expect(w).toHaveClass("step-completed"));
  });

  it("no rompe con currentStep en 0", () => {
    const { container } = render(<StepperHeader steps={steps} currentStep={0} />);
    const wrappers = container.querySelectorAll(".step-wrapper");
    wrappers.forEach(w => expect(w).toHaveClass("step-inactive"));
  });
});

// ===========================================================================
// PROMPT EDITOR
// ===========================================================================

const promptBaseProps = {
  promptText: "Mi prompt inicial",
  isLoading: false,
  onPromptChange: vi.fn(),
  onGenerate: vi.fn(),
};

describe("PromptEditor – renderizado", () => {
  it("renderiza el textarea con el promptText recibido", () => {
    render(<PromptEditor {...promptBaseProps} />);
    expect(screen.getByRole("textbox")).toHaveValue("Mi prompt inicial");
  });

  it("muestra el título cuando se proporciona", () => {
    render(<PromptEditor {...promptBaseProps} title="Genera tu examen" />);
    expect(screen.getByRole("heading", { name: /genera tu examen/i })).toBeInTheDocument();
  });

  it("NO muestra el heading cuando no se proporciona título", () => {
    render(<PromptEditor {...promptBaseProps} />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("muestra la descripción cuando se proporciona", () => {
    render(<PromptEditor {...promptBaseProps} description="Escribe tu prompt aquí" />);
    expect(screen.getByText("Escribe tu prompt aquí")).toBeInTheDocument();
  });

  it("NO muestra la descripción cuando no se proporciona", () => {
    const { container } = render(<PromptEditor {...promptBaseProps} />);
    expect(container.querySelector(".wf-instruction-text")).not.toBeInTheDocument();
  });

  it("muestra el label del botón por defecto 'Generar'", () => {
    render(<PromptEditor {...promptBaseProps} />);
    expect(screen.getByRole("button", { name: /generar/i })).toBeInTheDocument();
  });

  it("muestra el label personalizado del botón", () => {
    render(<PromptEditor {...promptBaseProps} generateLabel="Crear examen" />);
    expect(screen.getByRole("button", { name: /crear examen/i })).toBeInTheDocument();
  });

  it("muestra el botón 'Volver' cuando se proporciona onBack", () => {
    render(<PromptEditor {...promptBaseProps} onBack={vi.fn()} />);
    expect(screen.getByRole("button", { name: /volver/i })).toBeInTheDocument();
  });

  it("NO muestra el botón 'Volver' cuando no se proporciona onBack", () => {
    render(<PromptEditor {...promptBaseProps} />);
    expect(screen.queryByRole("button", { name: /volver/i })).not.toBeInTheDocument();
  });
});

describe("PromptEditor – estado de carga", () => {
  it("el botón está deshabilitado cuando isLoading es true", () => {
    render(<PromptEditor {...promptBaseProps} isLoading={true} />);
    expect(screen.getByRole("button", { name: "" , hidden: true })).toBeDisabled();
  });

  it("muestra el spinner cuando isLoading es true", () => {
    const { container } = render(<PromptEditor {...promptBaseProps} isLoading={true} />);
    expect(container.querySelector(".loading-spinner")).toBeInTheDocument();
  });

  it("el botón NO está deshabilitado cuando isLoading es false", () => {
    render(<PromptEditor {...promptBaseProps} isLoading={false} />);
    const btns = screen.getAllByRole("button");
    const generateBtn = btns.find(b => b.classList.contains("btn-step"));
    expect(generateBtn).not.toBeDisabled();
  });

  it("NO muestra el spinner cuando isLoading es false", () => {
    const { container } = render(<PromptEditor {...promptBaseProps} isLoading={false} />);
    expect(container.querySelector(".loading-spinner")).not.toBeInTheDocument();
  });
});

describe("PromptEditor – callbacks", () => {
  it("llama a onGenerate al hacer click en el botón generar", async () => {
    const onGenerate = vi.fn();
    render(<PromptEditor {...promptBaseProps} onGenerate={onGenerate} />);
    await userEvent.click(screen.getByRole("button", { name: /generar/i }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it("llama a onBack al hacer click en 'Volver'", async () => {
    const onBack = vi.fn();
    render(<PromptEditor {...promptBaseProps} onBack={onBack} />);
    await userEvent.click(screen.getByRole("button", { name: /volver/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("llama a onPromptChange al escribir en el textarea", async () => {
    const onPromptChange = vi.fn();
    render(<PromptEditor {...promptBaseProps} onPromptChange={onPromptChange} />);
    await userEvent.type(screen.getByRole("textbox"), "x");
    expect(onPromptChange).toHaveBeenCalled();
  });

  it("NO llama a onGenerate cuando está en loading", async () => {
    const onGenerate = vi.fn();
    const { container } = render(
      <PromptEditor {...promptBaseProps} isLoading={true} onGenerate={onGenerate} />
    );
    const btn = container.querySelector(".btn-step") as HTMLButtonElement;
    await userEvent.click(btn);
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it("NO llama a onBack ni onGenerate al solo renderizar", () => {
    const onGenerate = vi.fn();
    const onBack = vi.fn();
    render(<PromptEditor {...promptBaseProps} onGenerate={onGenerate} onBack={onBack} />);
    expect(onGenerate).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
  });
});

describe("PromptEditor – casos límite", () => {
  it("no rompe con promptText vacío", () => {
    render(<PromptEditor {...promptBaseProps} promptText="" />);
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("no rompe con promptText muy largo", () => {
    render(<PromptEditor {...promptBaseProps} promptText={"A".repeat(5000)} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("acepta un nodo React como description", () => {
    render(
      <PromptEditor
        {...promptBaseProps}
        description={<strong data-testid="desc-node">Descripción</strong>}
      />
    );
    expect(screen.getByTestId("desc-node")).toBeInTheDocument();
  });
});

// ===========================================================================
// SPLIT RESULT VIEW
// ===========================================================================

const splitBaseProps = {
  promptText: "Prompt enviado",
  isLoading: false,
  responseText: "Respuesta del modelo",
  onPromptChange: vi.fn(),
  onRegenerate: vi.fn(),
  onResponseChange: vi.fn(),
};

describe("SplitResultView – renderizado", () => {
  it("muestra el título izquierdo por defecto", () => {
    render(<SplitResultView {...splitBaseProps} />);
    const { container } = render(<SplitResultView {...splitBaseProps} />);
    const titles = container.querySelectorAll(".wf-column-title");
    expect(titles[0]).toHaveTextContent("Prompt enviado");
  });

  it("muestra el título derecho por defecto", () => {
    const { container } = render(<SplitResultView {...splitBaseProps} />);
    const titles = container.querySelectorAll(".wf-column-title");
    expect(titles[1]).toHaveTextContent("Propuesta del modelo");
  });

  it("muestra los títulos personalizados", () => {
    const { container } = render(
      <SplitResultView {...splitBaseProps} leftTitle="Mi prompt" rightTitle="Mi resultado" />
    );
    const titles = container.querySelectorAll(".wf-column-title");
    expect(titles[0]).toHaveTextContent("Mi prompt");
    expect(titles[1]).toHaveTextContent("Mi resultado");
  });

  it("muestra el promptText en el textarea izquierdo", () => {
    render(<SplitResultView {...splitBaseProps} />);
    expect(screen.getByDisplayValue("Prompt enviado")).toBeInTheDocument();
  });

  it("muestra el responseText en el textarea derecho cuando no está cargando", () => {
    render(<SplitResultView {...splitBaseProps} />);
    expect(screen.getByDisplayValue("Respuesta del modelo")).toBeInTheDocument();
  });

  it("muestra 'Generando...' cuando isLoading es true", () => {
    render(<SplitResultView {...splitBaseProps} isLoading={true} />);
    expect(screen.getByText("Generando...")).toBeInTheDocument();
  });

  it("NO muestra el textarea derecho cuando isLoading es true", () => {
    render(<SplitResultView {...splitBaseProps} isLoading={true} responseText="algo" />);
    expect(screen.queryByDisplayValue("algo")).not.toBeInTheDocument();
  });
});

describe("SplitResultView – slots opcionales", () => {
  it("muestra rightContent cuando se proporciona", () => {
    render(
      <SplitResultView
        {...splitBaseProps}
        rightContent={<div data-testid="custom-right">Contenido custom</div>}
      />
    );
    expect(screen.getByTestId("custom-right")).toBeInTheDocument();
  });

  it("rightContent reemplaza al textarea derecho", () => {
    render(
      <SplitResultView
        {...splitBaseProps}
        rightContent={<div>Custom</div>}
      />
    );
    expect(screen.queryByDisplayValue("Respuesta del modelo")).not.toBeInTheDocument();
  });

  it("muestra rightActions cuando se proporciona", () => {
    render(
      <SplitResultView
        {...splitBaseProps}
        rightActions={<button>Acción extra</button>}
      />
    );
    expect(screen.getByRole("button", { name: /acción extra/i })).toBeInTheDocument();
  });

  it("muestra footer cuando se proporciona", () => {
    render(
      <SplitResultView
        {...splitBaseProps}
        footer={<button>Siguiente paso</button>}
      />
    );
    expect(screen.getByRole("button", { name: /siguiente paso/i })).toBeInTheDocument();
  });

  it("NO muestra el footer cuando no se proporciona", () => {
    const { container } = render(<SplitResultView {...splitBaseProps} />);
    expect(container.querySelector(".wf-actions-row")).not.toBeInTheDocument();
  });
});

describe("SplitResultView – callbacks", () => {
  it("llama a onPromptChange al escribir en el textarea izquierdo", async () => {
    const onPromptChange = vi.fn();
    render(<SplitResultView {...splitBaseProps} onPromptChange={onPromptChange} />);
    const textareas = screen.getAllByRole("textbox");
    await userEvent.type(textareas[0], "x");
    expect(onPromptChange).toHaveBeenCalled();
  });

  it("llama a onResponseChange al escribir en el textarea derecho", async () => {
    const onResponseChange = vi.fn();
    render(<SplitResultView {...splitBaseProps} onResponseChange={onResponseChange} />);
    const textareas = screen.getAllByRole("textbox");
    await userEvent.type(textareas[1], "x");
    expect(onResponseChange).toHaveBeenCalled();
  });

  it("NO llama a ningún callback al solo renderizar", () => {
    const onPromptChange = vi.fn();
    const onResponseChange = vi.fn();
    const onRegenerate = vi.fn();
    render(
      <SplitResultView
        {...splitBaseProps}
        onPromptChange={onPromptChange}
        onResponseChange={onResponseChange}
        onRegenerate={onRegenerate}
      />
    );
    expect(onPromptChange).not.toHaveBeenCalled();
    expect(onResponseChange).not.toHaveBeenCalled();
    expect(onRegenerate).not.toHaveBeenCalled();
  });
});

describe("SplitResultView – casos límite", () => {
  it("no rompe con promptText vacío", () => {
    render(<SplitResultView {...splitBaseProps} promptText="" />);
    expect(screen.getAllByRole("textbox")[0]).toHaveValue("");
  });

  it("no rompe con responseText vacío", () => {
    render(<SplitResultView {...splitBaseProps} responseText="" />);
    expect(screen.getAllByRole("textbox")[1]).toHaveValue("");
  });

  it("no rompe con promptText muy largo", () => {
    render(<SplitResultView {...splitBaseProps} promptText={"A".repeat(5000)} />);
    expect(screen.getAllByRole("textbox")[0]).toBeInTheDocument();
  });
});