import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmModal } from "./ConfirmModal";

const baseProps = {
  title: "¿Estás seguro?",
  message: "Esta acción no se puede deshacer.",
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ConfirmModal – renderizado", () => {
  it("muestra el título recibido por props", () => {
    render(<ConfirmModal {...baseProps} />);
    expect(screen.getByRole("heading", { name: /estás seguro/i })).toBeInTheDocument();
  });

  it("muestra el mensaje recibido por props", () => {
    render(<ConfirmModal {...baseProps} />);
    expect(screen.getByText(/esta acción no se puede deshacer/i)).toBeInTheDocument();
  });

  it("muestra el icono de advertencia ⚠️", () => {
    render(<ConfirmModal {...baseProps} />);
    expect(screen.getByText("⚠️")).toBeInTheDocument();
  });

  it("renderiza el overlay y la tarjeta de contenido", () => {
    const { container } = render(<ConfirmModal {...baseProps} />);
    expect(container.querySelector(".confirm-modal-overlay")).toBeInTheDocument();
    expect(container.querySelector(".confirm-modal-card")).toBeInTheDocument();
  });
});

describe("ConfirmModal – botones por defecto", () => {
  it("muestra el label 'Confirmar' por defecto", () => {
    render(<ConfirmModal {...baseProps} />);
    expect(screen.getByRole("button", { name: /confirmar/i })).toBeInTheDocument();
  });

  it("muestra el label 'Cancelar' por defecto", () => {
    render(<ConfirmModal {...baseProps} />);
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });

  it("usa los labels personalizados cuando se proporcionan", () => {
    render(
      <ConfirmModal {...baseProps} confirmLabel="Sí, borrar" cancelLabel="No, volver" />
    );
    expect(screen.getByRole("button", { name: /sí, borrar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /no, volver/i })).toBeInTheDocument();
  });
});

describe("ConfirmModal – prop warning", () => {
  it("NO renderiza el bloque de warning si no se pasa la prop", () => {
    const { container } = render(<ConfirmModal {...baseProps} />);
    expect(container.querySelector(".confirm-modal-warning")).not.toBeInTheDocument();
  });

  it("renderiza el warning cuando se pasa la prop", () => {
    render(<ConfirmModal {...baseProps} warning="Acción irreversible" />);
    expect(screen.getByText("Acción irreversible")).toBeInTheDocument();
  });

  it("añade la clase CSS 'warning' al mensaje cuando hay warning", () => {
    const { container } = render(
      <ConfirmModal {...baseProps} warning="Cuidado" />
    );
    expect(
      container.querySelector(".sucess-modal-description.warning")
    ).toBeInTheDocument();
  });

  it("NO añade la clase CSS 'warning' al mensaje cuando no hay warning", () => {
    const { container } = render(<ConfirmModal {...baseProps} />);
    const desc = container.querySelector(".sucess-modal-description");
    expect(desc).not.toHaveClass("warning");
  });

  it("aplica la clase '--plain' cuando plainWarning es true", () => {
    const { container } = render(
      <ConfirmModal {...baseProps} warning="Sin icono" plainWarning />
    );
    expect(
      container.querySelector(".confirm-modal-warning--plain")
    ).toBeInTheDocument();
  });

  it("NO aplica la clase '--plain' cuando plainWarning es false (valor por defecto)", () => {
    const { container } = render(
      <ConfirmModal {...baseProps} warning="Con icono" />
    );
    expect(
      container.querySelector(".confirm-modal-warning--plain")
    ).not.toBeInTheDocument();
  });

  it("acepta un nodo React como warning", () => {
    render(
      <ConfirmModal
        {...baseProps}
        warning={<strong data-testid="rich-warning">¡Peligro!</strong>}
      />
    );
    expect(screen.getByTestId("rich-warning")).toBeInTheDocument();
  });
});


describe("ConfirmModal – callbacks", () => {
  it("llama a onConfirm al hacer click en el botón de confirmación", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmModal {...baseProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole("button", { name: /confirmar/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("llama a onCancel al hacer click en el botón de cancelación", async () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...baseProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("NO llama a onConfirm al cancelar", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmModal {...baseProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("NO llama a onCancel al confirmar", async () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...baseProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole("button", { name: /confirmar/i }));
    expect(onCancel).not.toHaveBeenCalled();
  });
});


describe("ConfirmModal – accesibilidad básica", () => {
  it("el botón de confirmar es focusable", () => {
    render(<ConfirmModal {...baseProps} />);
    const btn = screen.getByRole("button", { name: /confirmar/i });
    btn.focus();
    expect(btn).toHaveFocus();
  });

  it("el botón de cancelar es focusable", () => {
    render(<ConfirmModal {...baseProps} />);
    const btn = screen.getByRole("button", { name: /cancelar/i });
    btn.focus();
    expect(btn).toHaveFocus();
  });

  it("puede activar confirmar con la tecla Enter", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmModal {...baseProps} onConfirm={onConfirm} />);
    const btn = screen.getByRole("button", { name: /confirmar/i });
    btn.focus();
    await userEvent.keyboard("{Enter}");
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

describe("ConfirmModal – casos límite: props vacías", () => {
  it("no rompe con título vacío", () => {
    render(<ConfirmModal {...baseProps} title="" />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("no rompe con mensaje vacío", () => {
    const { container } = render(<ConfirmModal {...baseProps} message="" />);
    expect(container.querySelector(".sucess-modal-description")).toBeInTheDocument();
  });

  it("warning con string vacío no muestra el bloque de warning", () => {
    const { container } = render(<ConfirmModal {...baseProps} warning="" />);
    expect(container.querySelector(".confirm-modal-warning")).not.toBeInTheDocument();
  });

  it("plainWarning={true} sin warning no rompe el componente", () => {
    const { container } = render(<ConfirmModal {...baseProps} plainWarning={true} />);
    expect(container.querySelector(".confirm-modal-overlay")).toBeInTheDocument();
    expect(container.querySelector(".confirm-modal-warning")).not.toBeInTheDocument();
  });

  it("confirmLabel vacío no rompe el botón", () => {
    render(<ConfirmModal {...baseProps} confirmLabel="" />);
    const btns = screen.getAllByRole("button");
    expect(btns.length).toBe(2);
  });

  it("cancelLabel vacío no rompe el botón", () => {
    render(<ConfirmModal {...baseProps} cancelLabel="" />);
    const btns = screen.getAllByRole("button");
    expect(btns.length).toBe(2);
  });
});

describe("ConfirmModal – casos límite: clicks múltiples", () => {
  it("onConfirm se llama exactamente 3 veces si se hace click 3 veces", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmModal {...baseProps} onConfirm={onConfirm} />);
    const btn = screen.getByRole("button", { name: /confirmar/i });
    await userEvent.click(btn);
    await userEvent.click(btn);
    await userEvent.click(btn);
    expect(onConfirm).toHaveBeenCalledTimes(3);
  });

  it("onCancel se llama exactamente 3 veces si se hace click 3 veces", async () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...baseProps} onCancel={onCancel} />);
    const btn = screen.getByRole("button", { name: /cancelar/i });
    await userEvent.click(btn);
    await userEvent.click(btn);
    await userEvent.click(btn);
    expect(onCancel).toHaveBeenCalledTimes(3);
  });
});

describe("ConfirmModal – casos límite: contenido React complejo", () => {
  it("acepta un nodo React complejo como message", () => {
    render(
      <ConfirmModal
        {...baseProps}
        message={
          <span>
            ¿Eliminar <strong data-testid="bold-text">Archivo.pdf</strong>?
          </span>
        }
      />
    );
    expect(screen.getByTestId("bold-text")).toBeInTheDocument();
    expect(screen.getByText("Archivo.pdf")).toBeInTheDocument();
  });

  it("acepta título con caracteres especiales", () => {
    render(<ConfirmModal {...baseProps} title="¿Eliminar «Archivo»? 100% seguro" />);
    expect(
      screen.getByRole("heading", { name: /eliminar.*archivo/i })
    ).toBeInTheDocument();
  });

  it("acepta título muy largo sin romper el layout", () => {
    const titulo = "A".repeat(200);
    const { container } = render(<ConfirmModal {...baseProps} title={titulo} />);
    expect(container.querySelector(".confirm-modal-card")).toBeInTheDocument();
  });

  it("acepta warning con múltiples nodos React anidados", () => {
    render(
      <ConfirmModal
        {...baseProps}
        warning={
          <div>
            <span data-testid="w1">Línea 1</span>
            <span data-testid="w2">Línea 2</span>
          </div>
        }
      />
    );
    expect(screen.getByTestId("w1")).toBeInTheDocument();
    expect(screen.getByTestId("w2")).toBeInTheDocument();
  });
});

describe("ConfirmModal – casos negativos", () => {
  it("NO renderiza más de 2 botones", () => {
    render(<ConfirmModal {...baseProps} />);
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("NO renderiza el bloque warning con plainWarning=true si no hay warning", () => {
    const { container } = render(
      <ConfirmModal {...baseProps} plainWarning={true} />
    );
    expect(container.querySelector(".confirm-modal-warning--plain")).not.toBeInTheDocument();
  });

  it("NO llama a ningún callback al solo renderizar el componente", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmModal {...baseProps} onConfirm={onConfirm} onCancel={onCancel} />);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("NO tiene más de un heading visible", () => {
    render(<ConfirmModal {...baseProps} />);
    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });
});