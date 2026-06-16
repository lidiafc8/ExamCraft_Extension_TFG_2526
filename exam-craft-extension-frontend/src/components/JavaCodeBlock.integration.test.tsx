import React from "react"
import { render, screen } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import "@testing-library/jest-dom"
import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import { JavaCodeBlock } from "./JavaCodeBlock"

expect.extend(jestDomMatchers)

const simpleCode = `public class Pet { private String name; }`

const multiClassCode = `
package org.example;

public class Owner {
  private String name;
  private int age;

  public Owner(String name, int age) {
    this.name = name;
    this.age = age;
  }
}
`

describe("Integración: JavaCodeBlock", () => {
  beforeEach(() => vi.clearAllMocks())

  // =========================================================
  // CASOS POSITIVOS
  // =========================================================
  describe("Casos Positivos", () => {
    it("renderiza el nombre del archivo correctamente", () => {
      render(<JavaCodeBlock filename="Pet.java" code={simpleCode} />)

      expect(screen.getByText("Pet.java")).toBeInTheDocument()
    })

    it("renderiza el bloque de código con la clase hljs correcta", () => {
      const { container } = render(
        <JavaCodeBlock filename="Pet.java" code={simpleCode} />
      )

      const codeEl = container.querySelector("code.hljs.language-java")
      expect(codeEl).toBeInTheDocument()
    })

    it("aplica syntax highlighting y genera HTML no vacío", () => {
      const { container } = render(
        <JavaCodeBlock filename="Pet.java" code={simpleCode} />
      )

      const codeEl = container.querySelector("code.hljs.language-java")
      expect(codeEl?.innerHTML.length).toBeGreaterThan(0)
    })

    it("renderiza dentro de un elemento pre con los estilos correctos", () => {
      const { container } = render(
        <JavaCodeBlock filename="Pet.java" code={simpleCode} />
      )

      const pre = container.querySelector("pre")
      expect(pre).toBeInTheDocument()
      expect(pre).toHaveStyle({ borderRadius: "8px" })
    })

    it("renderiza correctamente código Java con múltiples líneas", () => {
      render(<JavaCodeBlock filename="Owner.java" code={multiClassCode} />)

      expect(screen.getByText("Owner.java")).toBeInTheDocument()
      const { container } = render(
        <JavaCodeBlock filename="Owner.java" code={multiClassCode} />
      )
      const codeEl = container.querySelector("code.hljs.language-java")
      expect(codeEl?.innerHTML).toBeTruthy()
    })

    it("el filename se renderiza como h4", () => {
      const { container } = render(
        <JavaCodeBlock filename="Test.java" code={simpleCode} />
      )

      const h4 = container.querySelector("h4")
      expect(h4).toBeInTheDocument()
      expect(h4?.textContent).toBe("Test.java")
    })
  })

  // =========================================================
  // CASOS NEGATIVOS
  // =========================================================
  describe("Casos Negativos", () => {
    it("renderiza sin errores cuando el código está vacío", () => {
      render(<JavaCodeBlock filename="Empty.java" code="" />)

      expect(screen.getByText("Empty.java")).toBeInTheDocument()
    })

    it("renderiza sin errores cuando el filename está vacío", () => {
      const { container } = render(<JavaCodeBlock filename="" code={simpleCode} />)

      const h4 = container.querySelector("h4")
      expect(h4?.textContent).toBe("")
    })

    it("no muestra el código como texto plano visible sin escapar", () => {
      render(<JavaCodeBlock filename="Pet.java" code={simpleCode} />)

      // El código pasa por hljs y se renderiza como HTML, no como texto plano
      expect(screen.queryByText(simpleCode)).not.toBeInTheDocument()
    })
  })

  // =========================================================
  // CASOS LÍMITE
  // =========================================================
  describe("Casos Límite", () => {
    it("maneja código con caracteres especiales sin romperse", () => {
      const specialCode = `public class Test { String s = "<div>&amp;</div>"; }`
      render(<JavaCodeBlock filename="Test.java" code={specialCode} />)

      expect(screen.getByText("Test.java")).toBeInTheDocument()
    })

    it("maneja un filename muy largo sin romperse", () => {
      const longFilename = "A".repeat(200) + ".java"
      render(<JavaCodeBlock filename={longFilename} code={simpleCode} />)

      expect(screen.getByText(longFilename)).toBeInTheDocument()
    })

    it("maneja código muy largo sin romperse", () => {
      const longCode = Array(500).fill(simpleCode).join("\n")
      const { container } = render(
        <JavaCodeBlock filename="Big.java" code={longCode} />
      )

      const codeEl = container.querySelector("code.hljs.language-java")
      expect(codeEl?.innerHTML.length).toBeGreaterThan(0)
    })

    it("renderiza múltiples instancias independientes sin interferencia", () => {
      render(
        <div>
          <JavaCodeBlock filename="File1.java" code="public class A {}" />
          <JavaCodeBlock filename="File2.java" code="public class B {}" />
        </div>
      )

      expect(screen.getByText("File1.java")).toBeInTheDocument()
      expect(screen.getByText("File2.java")).toBeInTheDocument()
    })

    it("el contenedor principal tiene ancho 100% y boxSizing border-box", () => {
      const { container } = render(
        <JavaCodeBlock filename="Pet.java" code={simpleCode} />
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveStyle({ width: "100%", boxSizing: "border-box" })
    })
  })

  // =========================================================
  // FLUJO COMPLETO
  // =========================================================
  describe("Flujo Completo", () => {
    it("flujo completo: renderiza filename, pre, code con highlighting aplicado", () => {
      const { container } = render(
        <JavaCodeBlock filename="Owner.java" code={multiClassCode} />
      )

      // 1. Filename visible
      expect(screen.getByText("Owner.java")).toBeInTheDocument()

      // 2. Estructura pre > code presente
      const pre = container.querySelector("pre")
      const code = container.querySelector("code.hljs.language-java")
      expect(pre).toBeInTheDocument()
      expect(code).toBeInTheDocument()

      // 3. Highlighting aplicado — hljs añade spans con clases
      expect(code?.innerHTML).toContain("<span")

      // 4. El contenido no está vacío
      expect(code?.innerHTML.length).toBeGreaterThan(multiClassCode.length)
    })

    it("flujo completo: varios bloques de código renderizados juntos son independientes", () => {
      const { container } = render(
        <div>
          <JavaCodeBlock filename="ClassA.java" code="public class A {}" />
          <JavaCodeBlock filename="ClassB.java" code="public class B extends A {}" />
          <JavaCodeBlock filename="ClassC.java" code="public interface C {}" />
        </div>
      )

      const filenames = ["ClassA.java", "ClassB.java", "ClassC.java"]
      filenames.forEach((name) => {
        expect(screen.getByText(name)).toBeInTheDocument()
      })

      const codeBlocks = container.querySelectorAll("code.hljs.language-java")
      expect(codeBlocks).toHaveLength(3)

      // Cada bloque tiene su propio contenido
      const htmls = Array.from(codeBlocks).map((el) => el.innerHTML)
      expect(new Set(htmls).size).toBe(3)
    })
  })
})