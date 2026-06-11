import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateExamSelectionScreen from "./CreateExamSelectionScreen";

vi.mock("../../../assets/images/complete_exam.png", () => ({ default: "mock-complete-exam-icon" }));
vi.mock("../../../assets/images/parts_exam.png", () => ({ default: "mock-parts-exam-icon" }));

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
  onCreateExamByParts: vi.fn(),
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CreateExamSelectionScreen – Pruebas Unitarias", () => {
  it("renderiza correctamente los títulos, textos e iconos de la pantalla", () => {
    render(<CreateExamSelectionScreen {...baseProps} />);

    // Verificar textos principales en el DOM
    expect(screen.getByText("CREAR NUEVO EXAMEN")).toBeInTheDocument();
    // Regex para evitar problemas con espacios/saltos de línea en el JSX
    expect(screen.getByText(/selecciona la modalidad de creación/i)).toBeInTheDocument();

    // Verificar que las etiquetas de las tarjetas están presentes
    expect(screen.getByText("Crear examen por partes")).toBeInTheDocument();
    expect(screen.getByText("Crear examen completo")).toBeInTheDocument();

    // Verificar que las imágenes cargan con sus respectivos textos alternativos (alt)
    expect(screen.getByAltText("Icono examen")).toBeInTheDocument();
    expect(screen.getByAltText("Icono archivo")).toBeInTheDocument();

    // Verificar el botón general de retroceso
    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument();
  });

  it("ejecuta onCreateExamByParts al hacer click en la tarjeta 'Crear examen por partes'", async () => {
    render(<CreateExamSelectionScreen {...baseProps} />);

    const btnPartes = screen.getByRole("button", { name: /crear examen por partes/i });
    await userEvent.click(btnPartes);

    expect(baseProps.onCreateExamByParts).toHaveBeenCalledTimes(1);
  });

  it("no ejecuta ninguna acción al hacer click en la tarjeta deshabilitada 'Crear examen completo'", async () => {
    render(<CreateExamSelectionScreen {...baseProps} />);

    const btnCompleto = screen.getByRole("button", { name: /crear examen completo/i });

    expect(btnCompleto).toBeDisabled();
    await userEvent.click(btnCompleto);

    expect(baseProps.onBack).not.toHaveBeenCalled();
    expect(baseProps.onCreateExamByParts).not.toHaveBeenCalled();
  });

  it("ejecuta onBack al pulsar el botón general de Volver", async () => {
    render(<CreateExamSelectionScreen {...baseProps} />);

    const btnVolver = screen.getByRole("button", { name: "Volver" });
    await userEvent.click(btnVolver);

    expect(baseProps.onBack).toHaveBeenCalledTimes(1);
  });

  it("pasa las acciones correctas al componente Header y reacciona a sus interacciones", async () => {
    render(<CreateExamSelectionScreen {...baseProps} />);

    // Verificar que el Header se renderiza con el paso actual
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByText("Step: CREAR EXAMEN")).toBeInTheDocument();

    // El breadcrumb INICIO apunta a onBack
    const btnInicio = screen.getByRole("button", { name: "INICIO" });
    await userEvent.click(btnInicio);
    expect(baseProps.onBack).toHaveBeenCalledTimes(1);

    // onWelcome del Header también apunta a onBack (ver componente)
    const btnWelcomeLink = screen.getByRole("button", { name: "Welcome Link" });
    await userEvent.click(btnWelcomeLink);
    expect(baseProps.onBack).toHaveBeenCalledTimes(2);
  });

  it("onBack y onCreateExamByParts son independientes entre sí", async () => {
    render(<CreateExamSelectionScreen {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: /crear examen por partes/i }));

    expect(baseProps.onCreateExamByParts).toHaveBeenCalledTimes(1);
    expect(baseProps.onBack).not.toHaveBeenCalled();
  });

  it("acumula correctamente múltiples clicks en 'Crear examen por partes'", async () => {
    render(<CreateExamSelectionScreen {...baseProps} />);

    const btn = screen.getByRole("button", { name: /crear examen por partes/i });
    await userEvent.click(btn);
    await userEvent.click(btn);
    await userEvent.click(btn);

    expect(baseProps.onCreateExamByParts).toHaveBeenCalledTimes(3);
  });

  it("acumula correctamente múltiples clicks en 'Volver'", async () => {
    render(<CreateExamSelectionScreen {...baseProps} />);

    const btn = screen.getByRole("button", { name: "Volver" });
    await userEvent.click(btn);
    await userEvent.click(btn);

    expect(baseProps.onBack).toHaveBeenCalledTimes(2);
  });
});