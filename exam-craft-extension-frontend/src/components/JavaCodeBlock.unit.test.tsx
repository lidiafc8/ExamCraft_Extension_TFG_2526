import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { JavaCodeBlock } from "./JavaCodeBlock";
import hljs from "highlight.js/lib/core";

vi.mock("highlight.js/lib/core", () => {
  return {
    default: {
      registerLanguage: vi.fn(),
      highlight: vi.fn().mockReturnValue({
        value: 'public <span class="hljs-keyword">class</span> <span class="hljs-title">Main</span> {}',
      }),
    },
  };
});

const baseProps = {
  filename: "Main.java",
  code: "public class Main {}",
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("JavaCodeBlock – Renderizado y Resaltado", () => {
  it("renderiza el nombre del archivo correctamente", () => {
    render(<JavaCodeBlock {...baseProps} />);

    const titleElement = screen.getByRole("heading", { level: 4, name: "Main.java" });
    expect(titleElement).toBeInTheDocument();
  });

  it("llama a hljs.highlight con los parámetros adecuados e inyecta el HTML resaltado", () => {
    const { container } = render(<JavaCodeBlock {...baseProps} />);

    expect(hljs.highlight).toHaveBeenCalledWith("public class Main {}", { language: "java" });

    const codeElement = container.querySelector("code");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveClass("hljs", "language-java");

    expect(codeElement?.innerHTML).toBe('public <span class="hljs-keyword">class</span> <span class="hljs-title">Main</span> {}');
    
    const keywordSpan = container.querySelector(".hljs-keyword");
    expect(keywordSpan).toBeInTheDocument();
    expect(keywordSpan).toHaveTextContent("class");
  });

  it("aplica los estilos en línea de estructura y scrollbox al bloque de código preformateado", () => {
    const { container } = render(<JavaCodeBlock {...baseProps} />);

    const preElement = container.querySelector("pre");
    expect(preElement).toBeInTheDocument();
    
    expect(preElement).toHaveStyle({
      backgroundColor: "#f6f8fa",
      overflowX: "auto",
      maxHeight: "500px",
    });
  });
});