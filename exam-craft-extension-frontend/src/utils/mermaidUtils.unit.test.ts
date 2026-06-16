import { describe, it, expect, vi, beforeEach } from "vitest"
import { 
  cleanMermaidCode, 
  extractMermaidCode, 
  sanitizeMermaidForModal 
} from "./mermaidUtils"

describe("Mermaid Utilities", () => {

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("cleanMermaidCode", () => {
    
    describe("Casos positivos", () => {
      it("remueve etiquetas HTML básicas de un bloque de código", () => {
        const input = "classDiagram\n<div>class Avión</div>"
        expect(cleanMermaidCode(input)).toBe("classDiagram\nclass Avión")
      })

      it("reemplaza todas las entidades &nbsp; por espacios en blanco tradicionales", () => {
        const input = "graph TD\nA&nbsp;-->&nbsp;B"
        expect(cleanMermaidCode(input)).toBe("graph TD\nA --> B")
      })
    })

    describe("Casos negativos", () => {
      it("retorna un string vacío de forma segura si la entrada es nula, undefined o vacía", () => {
        expect(cleanMermaidCode(null as any)).toBe("")
        expect(cleanMermaidCode(undefined as any)).toBe("")
        expect(cleanMermaidCode("")).toBe("")
      })
    })

    describe("Casos límite", () => {
      it("no corrompe el código si tiene etiquetas mal cerradas o símbolos '<' legítimos", () => {
        const input = "classDiagram\nList<String"
        
        expect(cleanMermaidCode(input)).toBe("classDiagram\nList")
      })

      it("elimina espacios y saltos de línea al inicio y al final (trim)", () => {
        const input = "   \n  classDiagram  \n   "
        expect(cleanMermaidCode(input)).toBe("classDiagram")
      })
    })
  })

  describe("extractMermaidCode", () => {

    describe("Casos positivos", () => {
      it("extrae el diagrama buscando la sección delimitada por líneas divisoras (--- o ===)", () => {
        const fullText = "Introducción teórica\n-----------\nclassDiagram\nA <|-- B\n===========\nConclusión final"
        const result = extractMermaidCode(fullText)
        expect(result).toBe("classDiagram\nA <|-- B")
      })

      it("encuentra un diagrama con sintaxis 'graph' (insensible a mayúsculas)", () => {
        const fullText = "Enunciado\n-----\nGRAPH LR\nStart --> Stop"
        const result = extractMermaidCode(fullText)
        expect(result).toBe("GRAPH LR\nStart --> Stop")
      })

      it("recorta cualquier texto basura previo al inicio exacto de la palabra clave del diagrama", () => {
        const fullText = "-----\nTexto aleatorio previo\nclassDiagram\nAnimal <|-- Perro"
        const result = extractMermaidCode(fullText)
        expect(result).toBe("classDiagram\nAnimal <|-- Perro")
      })
    })

    describe("Casos negativos", () => {
      it("devuelve un string vacío de forma segura si la entrada es nula, vacía o indefinida", () => {
        expect(extractMermaidCode(null as any)).toBe("")
        expect(extractMermaidCode("")).toBe("")
      })

      it("devuelve una cadena vacía si no se localiza ninguna sección con classDiagram o graph", () => {
        const fullText = "Sección A\n-----\nSección B sin palabras clave de diagramas"
        expect(extractMermaidCode(fullText)).toBe("")
      })
    })

    describe("Casos límite", () => {
      it("extrae el fragmento completo aun si el separador es excesivamente largo", () => {
        const fullText = "Teoría\n=========================================\ngraph TD\nX --> Y"
        expect(extractMermaidCode(fullText)).toBe("graph TD\nX --> Y")
      })

      it("si no hay separadores pero el texto completo contiene la palabra clave, procesa el texto entero desde su índice", () => {
        const fullText = "Preámbulo directo classDiagram\nVehiculo <|-- Coche"
        expect(extractMermaidCode(fullText)).toBe("classDiagram\nVehiculo <|-- Coche")
      })
    })
  })

  describe("sanitizeMermaidForModal", () => {

    describe("Casos positivos", () => {
      it("mapea etiquetas de salto estructuradas (<br>, <p>, <div>) transformándolas en saltos de línea reales (\\n)", () => {
        const input = "graph TD\nA[Texto]<br/>B<p>C</p><div>D</div>"
        const result = sanitizeMermaidForModal(input)
        
        expect(result).toBe("graph TD\nA[Texto]\nB\nC\n\nD")
      })

      it("elimina las etiquetas <span> por completo e interpreta entidades de escape como &lt; y &gt;", () => {
        const input = "classDiagram\n<span>List&lt;String&gt;</span>"
        const result = sanitizeMermaidForModal(input)
        
        expect(result).toBe("classDiagram\nList<String>")
      })
    })

    describe("Casos negativos", () => {
      it("retorna vacío de inmediato si el string original es nulo o no contiene sintaxis válida de Mermaid", () => {
        expect(sanitizeMermaidForModal(null as any)).toBe("")
        expect(sanitizeMermaidForModal("Texto plano cualquiera")).toBe("")
      })
    })

    describe("Casos límite", () => {
      it("mantiene intacta la capitalización original de las estructuras internas tras la limpieza", () => {
        const input = "classDiagram\nclass USUARIO_SISTEMA"
        expect(sanitizeMermaidForModal(input)).toBe("classDiagram\nclass USUARIO_SISTEMA")
      })

      it("tolera variaciones de cierres de etiquetas HTML o espacios internos (<br    />)", () => {
        const input = "graph LR\nInicio<br    />Fin"
        expect(sanitizeMermaidForModal(input)).toBe("graph LR\nInicio\nFin")
      })
    })
  })
})