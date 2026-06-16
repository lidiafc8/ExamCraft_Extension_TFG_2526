import { describe, it, expect } from "vitest"
import { cleanMermaidCode } from "./MermaidCodeCleaner"

describe("Integración: cleanMermaidCode", () => {

  describe("Casos Positivos", () => {
    it("elimina los bloques de código markdown ```mermaid y ```", () => {
      const input = "```mermaid\nclassDiagram\n  A --> B\n```"
      const result = cleanMermaidCode(input)

      expect(result).not.toContain("```mermaid")
      expect(result).not.toContain("```")
      expect(result).toContain("classDiagram")
    })

    it("extrae desde classDiagram hasta el final", () => {
      const input = "Texto previo irrelevante\nclassDiagram\n  A --> B"
      const result = cleanMermaidCode(input)

      expect(result).not.toContain("Texto previo irrelevante")
      expect(result).toContain("classDiagram")
    })

    it("reconoce y extrae graph como tipo de diagrama válido", () => {
      const input = "graph TD\n  A --> B"
      const result = cleanMermaidCode(input)

      expect(result).toContain("graph TD")
    })

    it("reconoce y extrae sequenceDiagram como tipo de diagrama válido", () => {
      const input = "sequenceDiagram\n  A->>B: mensaje"
      const result = cleanMermaidCode(input)

      expect(result).toContain("sequenceDiagram")
    })

    it("reemplaza \\n literales por saltos de línea reales", () => {
      const input = "classDiagram\\n  A --> B"
      const result = cleanMermaidCode(input)

      expect(result).toContain("\n")
      expect(result).not.toContain("\\n")
    })

    it("reemplaza \\\" por comillas dobles reales", () => {
      const input = `classDiagram\n  A : \\"nombre\\"`
      const result = cleanMermaidCode(input)

      expect(result).toContain('"nombre"')
    })

    it("añade espacios alrededor de --> ", () => {
      const input = "classDiagram\n  A-->B"
      const result = cleanMermaidCode(input)

      expect(result).toContain("A --> B")
    })

    it("añade espacio y salto de línea al abrir llave {", () => {
        const input = "classDiagram\n  class A{\n  String name\n}"
        const result = cleanMermaidCode(input)
        expect(result).toContain(" {")
    })

    it("añade salto de línea al cerrar llave }", () => {
      const input = "classDiagram\n  class A {\n  String name\n}"
      const result = cleanMermaidCode(input)

      expect(result).toContain("\n}")
    })

    it("normaliza la relación <|-- con espacios", () => {
      const input = "classDiagram\n  Animal<|--Dog"
      const result = cleanMermaidCode(input)

      expect(result).toContain(" <|-- ")
    })

    it("elimina llaves vacías {}", () => {
      const input = "classDiagram\n  class A {}"
      const result = cleanMermaidCode(input)

      expect(result).not.toContain("{}")
    })

    it("elimina líneas vacías del resultado final", () => {
      const input = "classDiagram\n\n\n  A --> B\n\n"
      const result = cleanMermaidCode(input)

      const lines = result.split("\n").filter((l) => l.trim() === "")
      expect(lines.length).toBe(0)
    })

    it("transforma relación con etiqueta al formato correcto", () => {
      const input = `classDiagram\n  Owner "1" Pet : owns`
      const result = cleanMermaidCode(input)

      expect(result).toContain(`Owner --> "1" Pet : owns`)
    })

    it("transforma relación sin flecha al formato con -->", () => {
      const input = `classDiagram\n  Owner "1" Pet`
      const result = cleanMermaidCode(input)

      expect(result).toContain(`Owner --> "1" Pet`)
    })
  })

  describe("Casos Negativos", () => {
    it("devuelve string vacío si la entrada es vacía", () => {
      expect(cleanMermaidCode("")).toBe("")
    })

    it("devuelve string vacío si la entrada es null/undefined casteado", () => {
      expect(cleanMermaidCode(null as unknown as string)).toBe("")
    })

    it("devuelve el texto limpio si no hay tipo de diagrama reconocido", () => {
      const input = "Esto no es un diagrama válido"
      const result = cleanMermaidCode(input)

      expect(result).toBe("Esto no es un diagrama válido")
    })

    it("no introduce --> en relaciones que ya tienen <|--", () => {
      const input = "classDiagram\n  Animal <|-- Dog"
      const result = cleanMermaidCode(input)

      expect(result).toContain("<|--")
      expect(result).not.toMatch(/Animal --> .* Dog/)
    })

    it("no transforma líneas que ya contienen --> como relación con etiqueta", () => {
      const input = `classDiagram\n  A --> "1" B : uses`
      const result = cleanMermaidCode(input)

      expect(result).not.toContain("-->  -->")
    })
  })

  describe("Casos Límite", () => {
    it("maneja entrada con solo espacios en blanco", () => {
      const result = cleanMermaidCode("   ")

      expect(result).toBe("")
    })

    it("maneja entrada con solo backticks", () => {
      const result = cleanMermaidCode("```mermaid\n```")

      expect(result).toBe("")
    })

    it("maneja múltiples bloques ```mermaid anidados", () => {
      const input = "```mermaid\n```mermaid\nclassDiagram\n  A --> B\n```\n```"
      const result = cleanMermaidCode(input)

      expect(result).not.toContain("```")
      expect(result).toContain("classDiagram")
    })

    it("maneja texto muy largo sin romperse", () => {
      const lines = Array(1000).fill("  A --> B").join("\n")
      const input = `classDiagram\n${lines}`
      const result = cleanMermaidCode(input)

      expect(result).toContain("classDiagram")
      expect(result).toContain("A --> B")
    })

    it("elimina comillas dobles vacías \"\" del resultado", () => {
      const input = `classDiagram\n  A "" B`
      const result = cleanMermaidCode(input)

      expect(result).not.toContain('""')
    })

    it("normaliza *--> y o--> eliminando espacios intermedios", () => {
        const input = "classDiagram\n  A * --> B\n  C o --> D"
        const result = cleanMermaidCode(input)
        expect(result).toContain("*")
        expect(result).toContain("o")
        expect(result).toContain(" --> ")
    })

    it("añade salto de línea antes de %% comentarios", () => {
      const input = "classDiagram\n  A --> B%%comentario"
      const result = cleanMermaidCode(input)

      expect(result).toContain("\n%%")
    })
  })

  describe("Flujo Completo", () => {
    it("flujo completo: limpia un diagrama real con múltiples problemas", () => {
      const input = `
\`\`\`mermaid
Texto introductorio ignorado

classDiagram
  Animal<|--Dog
  Animal<|--Cat
  Owner "1" Pet : owns
  class Dog{}
  class Cat {
    String name
  }
  A -->B
\`\`\`
      `

      const result = cleanMermaidCode(input)

      expect(result).not.toContain("```")
      expect(result).not.toContain("Texto introductorio ignorado")
      expect(result).toContain("classDiagram")
      expect(result).toContain(" <|-- ")
      expect(result).toContain(`Owner --> "1" Pet : owns`)
      expect(result).not.toContain("{}")
      expect(result).toContain("A --> B")
    })

    it("flujo completo: diagrama limpio no sufre transformaciones innecesarias", () => {
      const input = `classDiagram\n  A --> B\n  C <|-- D`
      const result = cleanMermaidCode(input)

      expect(result).toContain("classDiagram")
      expect(result).toContain("A --> B")
      expect(result).toContain(" <|-- ")
      expect(result).not.toContain("```")
    })
  })
})