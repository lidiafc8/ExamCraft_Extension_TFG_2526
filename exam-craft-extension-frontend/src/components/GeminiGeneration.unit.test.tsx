/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useGeminiGeneration } from "./GeminiGeneration";

// Mock del servicio de Gemini
const mockGenerateWithAI = vi.fn();
vi.mock("../services/geminiService", () => ({
  generateWithAI: (payload: string) => mockGenerateWithAI(payload),
}));

const baseOptions = {
  logExerciseName: "Ejercicio de Álgebra",
  buildLogPayload: vi.fn().mockReturnValue({ customData: "payload-de-prueba" }),
};

beforeEach(() => {
  vi.clearAllMocks();
  
  // Mock base de fetch (funcionando bien)
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true }),
  } as unknown as Response);

  // Espías para limpiar la consola en los tests
  vi.spyOn(window, "alert").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("useGeminiGeneration – Configuración Básica", () => {
  it("inicializa el hook con los valores por defecto correctos", () => {
    const { result } = renderHook(() => useGeminiGeneration(baseOptions));
    expect(result.current.responseText).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  it("permite actualizar el texto de respuesta manualmente mediante setResponseText", () => {
    const { result } = renderHook(() => useGeminiGeneration(baseOptions));
    act(() => {
      result.current.setResponseText("Texto manual");
    });
    expect(result.current.responseText).toBe("Texto manual");
  });
});

describe("useGeminiGeneration – Flujos de Ejecución (Cobertura 100%)", () => {
  
  // CASO 1: Todo va perfecto (IA OK + Fetch Logs OK) -> Pasa por Try y luego por Finally
  it("gestiona los estados de carga, retorna el resultado y guarda el log con éxito", async () => {
    mockGenerateWithAI.mockResolvedValue("Respuesta de la IA");
    const { result } = renderHook(() => useGeminiGeneration(baseOptions));

    let promesa;
    await act(async () => {
      promesa = result.current.generate("Pregunta");
    });

    const respuestaFinal = await promesa;
    expect(respuestaFinal).toBe("Respuesta de la IA");

    // Forzamos al motor a esperar que el estado isLoading cambie en el finally
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.responseText).toBe("Respuesta de la IA");
  });

  // CASO 2: La IA va bien, pero los LOGS fallan (IA OK + Fetch Logs ERROR) -> Pasa por el Catch interno y luego por el Finally
  it("continúa la ejecución con éxito si el servidor de logs está apagado", async () => {
    mockGenerateWithAI.mockResolvedValue("Respuesta de la IA");
    // Forzamos error en el fetch de los logs
    global.fetch = vi.fn().mockRejectedValue(new Error("Logs caídos"));

    const { result } = renderHook(() => useGeminiGeneration(baseOptions));

    let promesa;
    await act(async () => {
      promesa = result.current.generate("Pregunta con logs caídos");
    });

    const respuestaFinal = await promesa;
    expect(respuestaFinal).toBe("Respuesta de la IA");

    // Esperamos a que pase por el finally de esta rama específica
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("Servidor de logs apagado"));
  });

  // CASO 3: Catástrofe principal (IA ERROR) -> Pasa por el Catch externo y luego por el Finally
  it("captura los fallos del servicio de IA, muestra alert y apaga la carga", async () => {
    mockGenerateWithAI.mockRejectedValue(new Error("Error de Gemini"));
    const { result } = renderHook(() => useGeminiGeneration(baseOptions));

    let respuestaError;
    await act(async () => {
      respuestaError = await result.current.generate("Payload inválido");
    });

    expect(respuestaError).toBeNull();

    // Esperamos que el finally limpie la carga en la rama del error catastrófico
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(window.alert).toHaveBeenCalledWith("Error al generar.");
    expect(global.fetch).not.toHaveBeenCalled(); // No debe intentar hacer logs si la IA falló
  });
});