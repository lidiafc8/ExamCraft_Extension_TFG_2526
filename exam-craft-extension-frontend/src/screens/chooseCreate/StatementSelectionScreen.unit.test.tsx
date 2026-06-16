import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StatementPartSelectionScreen from "./StatementPartSelectionScreen";

vi.mock("../../css/Vertical.css", () => ({}));

vi.mock("~src/components/Header", () => ({
  Header: ({ breadcrumbItems, currentStep, onWelcome }: any) => (
    <header data-testid="mock-header">
      <span>Step: {currentStep}</span>
      <button onClick={onWelcome}>Welcome Link</button>
      {breadcrumbItems.map((item: any, index: number) => (
        <button key={index} onClick={item.action}>
          {item.label}
        </button>
      ))}
    </header>
  ),
}));

const baseProps = {
  onBack: vi.fn(),
  onWelcome: vi.fn(),
  onCreateExamByParts: vi.fn(),
  onFunctionalExtension: vi.fn(),
  onAttributesConstraints: vi.fn(),
  onEntityRelationships: vi.fn(),
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("StatementPartSelectionScreen – Pruebas Unitarias", () => {

  it("renderiza correctamente los títulos y textos de la pantalla", () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    expect(screen.getByText("GENERACIÓN DE ENUNCIADO")).toBeInTheDocument();
    expect(screen.getByText(/qué parte del enunciado te gustaría generar primero/i)).toBeInTheDocument();
  });

  it("renderiza los tres botones del menú vertical", () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    expect(screen.getByRole("button", { name: "Extensión funcional" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Restricciones de atributos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Relaciones entre entidades" })).toBeInTheDocument();
  });

  it("renderiza el botón de Volver", () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument();
  });

  it("renderiza el Header con el paso actual 'ENUNCIADO'", () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByText("Step: ENUNCIADO")).toBeInTheDocument();
  });

  it("renderiza los tres breadcrumbs del Header correctamente", () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    expect(screen.getByRole("button", { name: "INICIO" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CREAR EXAMEN" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "POR PARTES" })).toBeInTheDocument();
  });

  it("ejecuta onFunctionalExtension al hacer click en 'Extensión funcional'", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "Extensión funcional" }));

    expect(baseProps.onFunctionalExtension).toHaveBeenCalledTimes(1);
  });

  it("ejecuta onAttributesConstraints al hacer click en 'Restricciones de atributos'", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "Restricciones de atributos" }));

    expect(baseProps.onAttributesConstraints).toHaveBeenCalledTimes(1);
  });

  it("ejecuta onEntityRelationships al hacer click en 'Relaciones entre entidades'", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "Relaciones entre entidades" }));

    expect(baseProps.onEntityRelationships).toHaveBeenCalledTimes(1);
  });

  it("ejecuta onBack al pulsar el botón Volver", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "Volver" }));

    expect(baseProps.onBack).toHaveBeenCalledTimes(1);
  });

  it("ejecuta onWelcome al pulsar el breadcrumb INICIO", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "INICIO" }));

    expect(baseProps.onWelcome).toHaveBeenCalledTimes(1);
  });

  it("ejecuta onBack al pulsar el breadcrumb CREAR EXAMEN", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "CREAR EXAMEN" }));

    expect(baseProps.onBack).toHaveBeenCalledTimes(1);
  });

  it("ejecuta onCreateExamByParts al pulsar el breadcrumb POR PARTES", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "POR PARTES" }));

    expect(baseProps.onCreateExamByParts).toHaveBeenCalledTimes(1);
  });

  it("ejecuta onWelcome al pulsar el Welcome Link del Header", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "Welcome Link" }));

    expect(baseProps.onWelcome).toHaveBeenCalledTimes(1);
  });

  it("click en 'Extensión funcional' no dispara las demás callbacks", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "Extensión funcional" }));

    expect(baseProps.onAttributesConstraints).not.toHaveBeenCalled();
    expect(baseProps.onEntityRelationships).not.toHaveBeenCalled();
    expect(baseProps.onBack).not.toHaveBeenCalled();
    expect(baseProps.onWelcome).not.toHaveBeenCalled();
  });

  it("click en 'Restricciones de atributos' no dispara las demás callbacks", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "Restricciones de atributos" }));

    expect(baseProps.onFunctionalExtension).not.toHaveBeenCalled();
    expect(baseProps.onEntityRelationships).not.toHaveBeenCalled();
    expect(baseProps.onBack).not.toHaveBeenCalled();
    expect(baseProps.onWelcome).not.toHaveBeenCalled();
  });

  it("click en 'Relaciones entre entidades' no dispara las demás callbacks", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "Relaciones entre entidades" }));

    expect(baseProps.onFunctionalExtension).not.toHaveBeenCalled();
    expect(baseProps.onAttributesConstraints).not.toHaveBeenCalled();
    expect(baseProps.onBack).not.toHaveBeenCalled();
    expect(baseProps.onWelcome).not.toHaveBeenCalled();
  });

  it("click en Volver no dispara ninguna callback de menú", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "Volver" }));

    expect(baseProps.onFunctionalExtension).not.toHaveBeenCalled();
    expect(baseProps.onAttributesConstraints).not.toHaveBeenCalled();
    expect(baseProps.onEntityRelationships).not.toHaveBeenCalled();
    expect(baseProps.onWelcome).not.toHaveBeenCalled();
    expect(baseProps.onCreateExamByParts).not.toHaveBeenCalled();
  });

  it("ningún botón del menú está deshabilitado", () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    expect(screen.getByRole("button", { name: "Extensión funcional" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Restricciones de atributos" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Relaciones entre entidades" })).not.toBeDisabled();
  });

  it("acumula correctamente múltiples clicks en 'Extensión funcional'", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    const btn = screen.getByRole("button", { name: "Extensión funcional" });
    await userEvent.click(btn);
    await userEvent.click(btn);
    await userEvent.click(btn);

    expect(baseProps.onFunctionalExtension).toHaveBeenCalledTimes(3);
  });

  it("acumula correctamente múltiples clicks en 'Restricciones de atributos'", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    const btn = screen.getByRole("button", { name: "Restricciones de atributos" });
    await userEvent.click(btn);
    await userEvent.click(btn);

    expect(baseProps.onAttributesConstraints).toHaveBeenCalledTimes(2);
  });

  it("acumula correctamente múltiples clicks en 'Relaciones entre entidades'", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    const btn = screen.getByRole("button", { name: "Relaciones entre entidades" });
    await userEvent.click(btn);
    await userEvent.click(btn);

    expect(baseProps.onEntityRelationships).toHaveBeenCalledTimes(2);
  });

  it("acumula correctamente múltiples clicks en Volver", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    const btn = screen.getByRole("button", { name: "Volver" });
    await userEvent.click(btn);
    await userEvent.click(btn);

    expect(baseProps.onBack).toHaveBeenCalledTimes(2);
  });

  it("clicks alternados en distintos botones del menú acumulan llamadas correctamente", async () => {
    render(<StatementPartSelectionScreen {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "Extensión funcional" }));
    await userEvent.click(screen.getByRole("button", { name: "Restricciones de atributos" }));
    await userEvent.click(screen.getByRole("button", { name: "Extensión funcional" }));

    expect(baseProps.onFunctionalExtension).toHaveBeenCalledTimes(2);
    expect(baseProps.onAttributesConstraints).toHaveBeenCalledTimes(1);
    expect(baseProps.onEntityRelationships).not.toHaveBeenCalled();
  });
});