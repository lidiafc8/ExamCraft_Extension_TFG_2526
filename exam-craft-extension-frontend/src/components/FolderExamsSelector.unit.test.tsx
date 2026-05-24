import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FolderExamSelector } from "./FolderExamsSelector";

vi.mock("../../assets/images/archive.png", () => ({ default: "mock-carpeta-img" }));
vi.mock("../../assets/images/exam.png", () => ({ default: "mock-examen-img" }));

const mockProjects = [
  { id: "1", domainName: "Matemáticas", customName: "Parcial Álgebra" },
  { id: "2", domainName: "Matemáticas", customName: "Final Cálculo" },
  { id: "3", domainName: "Historia", customName: "Examen Siglo XX" },
];

const mockAllowedFolders = ["Matemáticas", "Historia", "Ciencia"];

const baseProps = {
  projects: mockProjects,
  allowedFolders: mockAllowedFolders,
  selectedFolder: null, 
  onSelectFolder: vi.fn(),
  onSelectProject: vi.fn(),
  onBack: vi.fn(),
  displayName: (proj: any) => proj.customName || "Sin nombre",
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("FolderExamSelector – Vista Inicial (selectedFolder = null)", () => {
  it("renderiza el título principal y las carpetas permitidas que contienen exámenes", () => {
    render(<FolderExamSelector {...baseProps} />);

    expect(screen.getByText("MIS EXÁMENES")).toBeInTheDocument();
    expect(screen.getByText("Selecciona un dominio")).toBeInTheDocument();
    
    expect(screen.getByText("MATEMÁTICAS")).toBeInTheDocument();
    expect(screen.getByText("HISTORIA")).toBeInTheDocument();
    
    expect(screen.queryByText("CIENCIA")).not.toBeInTheDocument();
  });

  it("calcula y renderiza el número correcto de exámenes por carpeta en formato plural y singular", () => {
    render(<FolderExamSelector {...baseProps} />);

    expect(screen.getByText("2 EXÁMENES")).toBeInTheDocument();
    expect(screen.getByText("1 EXAMEN")).toBeInTheDocument();
  });

  it("ejecuta onSelectFolder con el nombre de la carpeta al hacer click en una tarjeta", async () => {
    render(<FolderExamSelector {...baseProps} />);

    const btnMatematicas = screen.getByRole("button", { name: /MATEMÁTICAS/i });
    await userEvent.click(btnMatematicas);

    expect(baseProps.onSelectFolder).toHaveBeenCalledWith("Matemáticas");
  });

  it("ejecuta onBack al pulsar el botón general de volver al inicio", async () => {
    render(<FolderExamSelector {...baseProps} />);

    const btnVolver = screen.getByRole("button", { name: "Volver" });
    await userEvent.click(btnVolver);

    expect(baseProps.onBack).toHaveBeenCalledTimes(1);
  });

  it("muestra el mensaje de aviso si no hay ninguna carpeta con exámenes (Carpetas vacías)", () => {
    render(
      <FolderExamSelector 
        {...baseProps} 
        projects={[]} 
        emptyFoldersMessage="¡Bandeja de entrada vacía!" 
      />
    );

    expect(screen.getByText("¡Bandeja de entrada vacía!")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /EXÁMENES/i })).not.toBeInTheDocument();
  });
});

describe("FolderExamSelector – Vista de Carpeta Seleccionada", () => {
  it("renderiza el título de la carpeta y lista todos los exámenes pertenecientes a ella", () => {
    render(<FolderExamSelector {...baseProps} selectedFolder="Matemáticas" />);

    expect(screen.getByText("Exámenes de MATEMÁTICAS")).toBeInTheDocument();
    
    expect(screen.getByText("Parcial Álgebra")).toBeInTheDocument();
    expect(screen.getByText("Final Cálculo")).toBeInTheDocument();
    
    expect(screen.queryByText("Examen Siglo XX")).not.toBeInTheDocument();
  });

  it("ejecuta onSelectProject al hacer click en el icono/botón de un examen específico", async () => {
    render(<FolderExamSelector {...baseProps} selectedFolder="Matemáticas" />);

    const botonesAbrir = screen.getAllByRole("button", { name: "Abrir examen" });
    
    await userEvent.click(botonesAbrir[0]);

    expect(baseProps.onSelectProject).toHaveBeenCalledWith(mockProjects[0]);
  });

  it("ejecuta onSelectFolder con un string vacío para simular el regreso a la vista de carpetas", async () => {
    render(<FolderExamSelector {...baseProps} selectedFolder="Matemáticas" />);

    const btnVolverAtras = screen.getByRole("button", { name: "Volver" });
    await userEvent.click(btnVolverAtras);

    expect(baseProps.onSelectFolder).toHaveBeenCalledWith("");
  });

  it("muestra el mensaje de aviso configurado si la carpeta actual no tiene exámenes", () => {
    render(
      <FolderExamSelector 
        {...baseProps} 
        selectedFolder="Ciencia" 
        emptyProjectsMessage="No encontramos nada aquí." 
      />
    );

    expect(screen.getByText("No encontramos nada aquí.")).toBeInTheDocument();
  });
});

describe("FolderExamSelector – Filtros y Casos Límite", () => {
  it("aplica la propiedad opcional filterProject si viene definida (Cubre rama condicional)", () => {
    const customFilter = (p: typeof mockProjects[0]) => p.customName.includes("Final");

    render(
      <FolderExamSelector 
        {...baseProps} 
        selectedFolder="Matemáticas" 
        filterProject={customFilter} 
      />
    );

    expect(screen.getByText("Final Cálculo")).toBeInTheDocument();
    expect(screen.queryByText("Parcial Álgebra")).not.toBeInTheDocument();
  });
});