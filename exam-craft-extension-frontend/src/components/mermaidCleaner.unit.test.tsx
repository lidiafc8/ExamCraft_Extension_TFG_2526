import { describe, it, expect } from "vitest";
import { cleanMermaidCode } from "./MermaidCodeCleaner";

describe("cleanMermaidCode – Casos Base y Limpieza Inicial", () => {
  it("retorna un string vacío si la entrada es nula, indefinida o vacía (Control de Guardas)", () => {
    expect(cleanMermaidCode("")).toBe("");
    expect(cleanMermaidCode(null as unknown as string)).toBe("");
    expect(cleanMermaidCode(undefined as unknown as string)).toBe("");
  });

  it("elimina las etiquetas de bloque de código Markdown genéricas y de mermaid", () => {
    const raw = "```mermaid\ngraph TD\n```";
    const result = cleanMermaidCode(raw);
    expect(result).toBe("graph TD");
  });

  it("recorta y extrae el diagrama desde la primera palabra clave válida si hay texto basura alrededor", () => {
    const raw = "Aquí tienes el código solicitado:\nclassDiagram\nAnimal <|-- Dog\nEspero que te sirva.";
    const result = cleanMermaidCode(raw);

    expect(result).toBe("classDiagram\nAnimal  <|--  Dog\nEspero que te sirva.");
  });

  it("mantiene el texto original si no localiza ninguna palabra clave de diagramas Mermaid admitida", () => {
    const raw = "texto plano sin palabras clave de diagramas";
    const result = cleanMermaidCode(raw);
    expect(result).toBe("texto plano sin palabras clave de diagramas");
  });
});

describe("cleanMermaidCode – Reemplazos de Caracteres y Formateo Estructural", () => {
  it("desescapa correctamente saltos de línea, comillas dobles y comillas simples", () => {
    const raw = "graph TD\\nnode1\\\"texto\\\"\\'dato\\'";
    const result = cleanMermaidCode(raw);
    expect(result).toContain("\nnode1");
    expect(result).toContain('"texto"');
    expect(result).toContain("'dato'");
  });

  it("aplica las reglas de espaciado para llaves, herencias, comentarios y agregaciones", () => {
    const raw = "class Vacía{}\nclass Datos{A}\nB<|--C\n%%Comentario";
    const result = cleanMermaidCode(raw);
    
    expect(result).toContain("class Vacía");
    expect(result).not.toContain("{}"); 
    expect(result).toContain("class Datos {\nA\n}\n");
    expect(result).toContain(" <|-- ");
    expect(result).toContain("\n%%Comentario");
  });

  it("normaliza la separación de las flechas de flujo y limpia las comillas dobles vacías", () => {
    const raw = "A* -->B\nC  -->   D\nE \"\" F";
    const result = cleanMermaidCode(raw);
    
    expect(result).toContain("A* --> B");
    expect(result).toContain("C --> D");
    expect(result).toContain("E F");
  });

  it("normaliza la separación de las flechas de flujo y limpia las comillas dobles vacías", () => {
    const raw = "A* -->B\nC  -->   D\nE \"\" F";
    const result = cleanMermaidCode(raw);
    
    expect(result).toContain("A* --> B");
    expect(result).toContain("C --> D");
    expect(result).toContain("E F");
  });
});

describe("cleanMermaidCode – Procesamiento de Líneas (Regex Avanzadas)", () => {
  it("reestructura y añade la flecha explícita a las relaciones que contienen etiquetas descriptivas", () => {
    const raw = 'ClaseA "1" ClaseB : posee';
    const result = cleanMermaidCode(raw);
    
    expect(result).toBe('ClaseA --> "1" ClaseB : posee');
  });

  it("reestructura y añade la flecha explícita a relaciones con etiquetas que carecen de descripción", () => {
    const raw = 'ClaseA "0..*" ClaseB';
    const result = cleanMermaidCode(raw);
    
    expect(result).toBe('ClaseA --> "0..*" ClaseB');
  });

  it("ignora la reestructuración si la línea ya posee flechas, guiones o símbolos de herencia", () => {
    const lineasConFlecha = 'ClaseA --> "1" ClaseB\nClaseC -- ClaseD\nClaseE <|-- ClaseF';
    const result = cleanMermaidCode(lineasConFlecha);
    
    expect(result).toBe('ClaseA --> "1" ClaseB\nClaseC -- ClaseD\nClaseE  <|--  ClaseF');
  });

  it("filtra y elimina por completo las líneas en blanco o vacías resultantes", () => {
    const raw = "graph TD\n\n\nnodeA\n\nnodeB";
    const result = cleanMermaidCode(raw);
    
    expect(result).toBe("graph TD\nnodeA\nnodeB");
  });
});