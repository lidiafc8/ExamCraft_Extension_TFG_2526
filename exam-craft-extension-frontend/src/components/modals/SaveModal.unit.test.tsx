import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SaveModal } from "./SaveModal";

const mockSaveToChrome = vi.fn();
const mockGetAllFromChrome = vi.fn();

vi.mock("~src/utils/chromeStorageUtils", () => ({
  saveToChrome: (...args: any[]) => mockSaveToChrome(...args),
  getAllFromChrome: () => mockGetAllFromChrome(),
}));

const baseProps = {
  domainName: "Matemáticas",
  onSuccess: vi.fn(),
  onClose: vi.fn(),
  buildPayload: vi.fn().mockReturnValue({ data: "test-payload" }),
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockGetAllFromChrome.mockResolvedValue([]); 
  mockSaveToChrome.mockResolvedValue(undefined); 
});

describe("SaveModal – Renderizado Inicial (Estado: prompt)", () => {
  it("renderiza el título y mensaje principal del modal", () => {
    render(<SaveModal {...baseProps} />);
    expect(screen.getByText("Guardar examen")).toBeInTheDocument();
    expect(screen.getByText(/¿Con qué nombre quieres guardar este examen?/i)).toBeInTheDocument();
  });

  it("inicializa el input con el nombre por defecto basado en el dominio", () => {
    render(<SaveModal {...baseProps} />);
    const input = screen.getByRole("textbox", { name: /nombre del examen/i });
    expect(input).toHaveValue("Examen de Matemáticas");
  });

  it("muestra el aviso de nombre por defecto si el input se vacía", async () => {
    render(<SaveModal {...baseProps} />);
    const input = screen.getByRole("textbox", { name: /nombre del examen/i });
    
    await userEvent.clear(input);
    
    expect(screen.getByText(/se usará el nombre por defecto si se deja vacío/i)).toBeInTheDocument();
  });

  it("maneja correctamente los eventos focus y blur del input añadiendo/quitando clases visuales", async () => {
    const { container } = render(<SaveModal {...baseProps} />);
    const input = screen.getByRole("textbox", { name: /nombre del examen/i });
    
    await userEvent.click(input);
    expect(container.querySelector(".save-modal-input-icon--focused")).toBeInTheDocument();
    
    const titulo = screen.getByText("Guardar examen");
    await userEvent.click(titulo);
    
    expect(container.querySelector(".save-modal-input-icon--focused")).not.toBeInTheDocument();
  });
});

describe("SaveModal – Control de Duplicados", () => {
  it("muestra error de duplicado si ya existe un examen con el mismo nombre en el mismo dominio", async () => {

    mockGetAllFromChrome.mockResolvedValue([
      { domainName: "Matemáticas", customName: "Examen de Matemáticas", _key: "project_1" }
    ]);

    render(<SaveModal {...baseProps} />);
    
    const btnGuardar = screen.getByRole("button", { name: /guardar/i });
    await userEvent.click(btnGuardar);

    expect(screen.getByText(/ya existe un examen con ese nombre en "Matemáticas"/i)).toBeInTheDocument();
    expect(mockSaveToChrome).not.toHaveBeenCalled();
  });

  it("elimina el mensaje de error de duplicado cuando el usuario vuelve a escribir en el input", async () => {
    mockGetAllFromChrome.mockResolvedValue([
      { domainName: "Matemáticas", customName: "Examen de Matemáticas", _key: "project_1" }
    ]);

    render(<SaveModal {...baseProps} />);
    
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));
    expect(screen.getByText(/ya existe un examen con ese nombre/i)).toBeInTheDocument();

    const input = screen.getByRole("textbox", { name: /nombre del examen/i });
    await userEvent.type(input, " Nuevo");

    expect(screen.queryByText(/ya existe un examen con ese nombre/i)).not.toBeInTheDocument();
  });

  it("permite guardar el mismo nombre si el elemento duplicado tiene el mismo existingKey (Caso Edición)", async () => {
    mockGetAllFromChrome.mockResolvedValue([
      { domainName: "Matemáticas", customName: "Examen de Matemáticas", _key: "key_actual_123" }
    ]);

    render(<SaveModal {...baseProps} existingKey="key_actual_123" />);
    
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(screen.queryByText(/ya existe un examen con ese nombre/i)).not.toBeInTheDocument();
    expect(mockSaveToChrome).toHaveBeenCalled();
  });

  it("retorna falso de forma silenciosa en la validación de duplicados si getAllFromChrome falla (Cubre rama catch)", async () => {
    mockGetAllFromChrome.mockRejectedValue(new Error("Storage Error"));

    render(<SaveModal {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(screen.getByText("¡Guardado con éxito!")).toBeInTheDocument();
  });
});

describe("SaveModal – Flujo de Éxito y Cancelación", () => {
  it("guarda usando una clave autogenerada si no recibe existingKey y muestra la pantalla de éxito", async () => {
    render(<SaveModal {...baseProps} />);
    
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(mockSaveToChrome).toHaveBeenCalledWith(
      expect.stringContaining("project_"),
      { data: "test-payload" }
    );
    expect(screen.getByText("¡Guardado con éxito!")).toBeInTheDocument();
    expect(screen.getByText(/el examen "Examen de Matemáticas" se ha guardado correctamente/i)).toBeInTheDocument();
  });

  it("utiliza el fallback defaultName si el usuario intenta guardar habiendo vaciado el input", async () => {
    render(<SaveModal {...baseProps} />);
    const input = screen.getByRole("textbox", { name: /nombre del examen/i });
    await userEvent.clear(input);

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(screen.getByText(/el examen "Examen de Matemáticas" se ha guardado correctamente/i)).toBeInTheDocument();
  });

  it("ejecuta onSuccess al hacer click en el botón de confirmación del modal de éxito", async () => {
    const onSuccessMock = vi.fn();
    render(<SaveModal {...baseProps} onSuccess={onSuccessMock} successAction="Volver" />);
    
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));
    await userEvent.click(screen.getByRole("button", { name: "Volver" }));

    expect(onSuccessMock).toHaveBeenCalledTimes(1);
  });

  it("ejecuta onClose al hacer click en el botón Cancelar inicial", async () => {
    const onCloseMock = vi.fn();
    render(<SaveModal {...baseProps} onClose={onCloseMock} />);
    
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});

describe("SaveModal – Manejo de Errores", () => {
  it("pasa a estado de error y muestra el mensaje si saveToChrome falla con una instancia de Error", async () => {
    mockSaveToChrome.mockRejectedValue(new Error("Fallo crítico de cuota de disco"));

    render(<SaveModal {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(screen.getByText("Error al guardar")).toBeInTheDocument();
    expect(screen.getByText("Fallo crítico de cuota de disco")).toBeInTheDocument();
  });

  it("pasa a estado de error mostrando el mensaje por defecto si lo arrojado no es una instancia de Error (Cubre fallback)", async () => {
  
    mockSaveToChrome.mockRejectedValue("Error misterioso de Chrome");

    render(<SaveModal {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(screen.getByText("Error al guardar")).toBeInTheDocument();
    expect(screen.getByText("No se pudo guardar.")).toBeInTheDocument();
  });

  it("permite reintentar desde la pantalla de error devolviendo al usuario al prompt de edición", async () => {
    mockSaveToChrome.mockRejectedValue(new Error("Crash"));

    render(<SaveModal {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));
    
    await userEvent.click(screen.getByRole("button", { name: /reintentar/i }));

    expect(screen.getByText("Guardar examen")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /nombre del examen/i })).toBeInTheDocument();
  });

  it("llama a onClose si el usuario pulsa Cerrar desde la pantalla de error", async () => {
    mockSaveToChrome.mockRejectedValue(new Error("Crash"));
    const onCloseMock = vi.fn();

    render(<SaveModal {...baseProps} onClose={onCloseMock} />);
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));
    
    await userEvent.click(screen.getByRole("button", { name: /cerrar/i }));

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});

describe("SaveModal – Caso Especial: skipPrompt", () => {
  it("guarda el examen automáticamente usando domainName y pasa a la pantalla de éxito", async () => {
    render(<SaveModal {...baseProps} skipPrompt={true} />);
    
    await waitFor(() => {
      expect(mockSaveToChrome).toHaveBeenCalledWith(
        expect.stringContaining("project_"),
        { data: "test-payload" }
      );
    });

    const successTitle = await screen.findByText("¡Guardado con éxito!");
    expect(successTitle).toBeInTheDocument();
  });
});