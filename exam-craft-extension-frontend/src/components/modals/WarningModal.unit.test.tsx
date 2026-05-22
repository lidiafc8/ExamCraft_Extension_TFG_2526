import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WarningModal } from "./WarningModal";

const baseProps = {
  title: "Eliminar elemento",
  message: "Esta acción no se puede deshacer. ¿Deseas continuar?",
  confirmLabel: "Sí, eliminar",
  cancelLabel: "No, volver",
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("WarningModal – Renderizado e Interfaz", () => {
  it("renderiza el título, el icono de advertencia y las etiquetas de los botones correctamente", () => {
    render(<WarningModal {...baseProps} />);

    expect(screen.getByText("Eliminar elemento")).toBeInTheDocument();
    expect(screen.getByText("⚠️")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sí, eliminar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No, volver" })).toBeInTheDocument();
  });

  it("renderiza correctamente el mensaje cuando es un nodo complejo de React (React.ReactNode)", () => {
    const complexMessage = (
      <span data-testid="custom-node">
        ¿Seguro que quieres borrar <strong>archivo.pdf</strong>?
      </span>
    );

    const { container } = render(<WarningModal {...baseProps} message={complexMessage} />);

    const mensajeContenedor = screen.getByTestId("custom-node");
    expect(mensajeContenedor).toBeInTheDocument();
    expect(screen.getByText("archivo.pdf")).toBeInTheDocument();
    
    expect(container.querySelector("strong")).toBeInTheDocument();
  });

  it("asigna 'Cancelar' como etiqueta por defecto si no se le pasa la propiedad cancelLabel (Cubre rama por defecto)", () => {
    const { cancelLabel, ...propsSinCancelLabel } = baseProps;

    render(<WarningModal {...propsSinCancelLabel} />);

    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "No, volver" })).not.toBeInTheDocument();
  });
});

describe("WarningModal – Interacciones del Usuario", () => {
  it("ejecuta onConfirm al hacer click en el botón de confirmación principal", async () => {
    render(<WarningModal {...baseProps} />);

    const btnConfirmar = screen.getByRole("button", { name: "Sí, eliminar" });
    await userEvent.click(btnConfirmar);

    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(baseProps.onCancel).not.toHaveBeenCalled();
  });

  it("ejecuta onCancel al hacer click en el botón secundario de cancelación", async () => {
    render(<WarningModal {...baseProps} />);

    const btnCancelar = screen.getByRole("button", { name: "No, volver" });
    await userEvent.click(btnCancelar);

    expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
    expect(baseProps.onConfirm).not.toHaveBeenCalled();
  });
});