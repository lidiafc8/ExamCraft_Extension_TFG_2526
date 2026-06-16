import { describe, it, expect } from "vitest"
import { cleanMermaidCode, extractMermaidCode, sanitizeMermaidForModal } from "./mermaidUtils"  
describe("Mermaid Utilities Tests", () => {

  describe("cleanMermaidCode", () => {
    it("debería retornar un string vacío si la entrada es nula o vacía", () => {
      expect(cleanMermaidCode("")).toBe("")
      expect(cleanMermaidCode(undefined as any)).toBe("")
    })

    it("debería eliminar por completo las etiquetas HTML y reemplazar los &nbsp; por espacios", () => {
      const rawCode = "<div>classDiagram</div><br/><span>Persona &nbsp;--&gt; Empleado</span>"
      const result = cleanMermaidCode(rawCode)

      expect(result).toBe("classDiagramPersona  --&gt; Empleado")
    })
  })

  describe("extractMermaidCode", () => {
    it("debería retornar un string vacío si la entrada no tiene texto", () => {
      expect(extractMermaidCode("")).toBe("")
    })

    it("debería extraer el bloque de diagrama usando separadores de guiones (-----) o iguales (=====)", () => {
      const fullText = `
        Texto introductorio del enunciado.
        ----------
        classDiagram
        class Vehiculo { +String matricula }
        ==========
        Texto final de conclusiones.
      `
      const result = extractMermaidCode(fullText)

      expect(result).toContain("classDiagram")
      expect(result).toContain("+String matricula")
      expect(result).not.toContain("Texto introductorio")
      expect(result).not.toContain("Texto final")
    })

    it("debería recortar el texto anterior al inicio exacto de la palabra clave del diagrama (classDiagram/graph)", () => {
      const fullText = `
        ----------
        Este es un texto basura antes del código real graph TD
        A[Inicio] --> B[Fin]
      `
      const result = extractMermaidCode(fullText)

      expect(result.startsWith("graph TD")).toBe(true)
      expect(result).not.toContain("Texto basura")
    })

    it("debería devolver un string vacío si no encuentra las palabras clave del diagrama", () => {
      const textWithoutDiagramKeywords = "----------\nTexto plano sin palabras clave de mermaid"
      const result = extractMermaidCode(textWithoutDiagramKeywords)
      
      expect(result).toBe("")
    })
  })

  describe("sanitizeMermaidForModal", () => {
    it("debería retornar un string vacío si no hay entrada o no contiene la estructura del diagrama", () => {
      expect(sanitizeMermaidForModal("")).toBe("")
      expect(sanitizeMermaidForModal("texto normal sin diagramas")).toBe("")
    })

    it("debería aislar el contenido desde el inicio del diagrama e interpretar los tags HTML de formato de línea", () => {
      const richText = `
        Enunciado previo...
        classDiagram<br>class Cliente {<br/>  +String nombre<br>}<p>  // comentario de bloque</p>
      `
      const result = sanitizeMermaidForModal(richText)

      expect(result.startsWith("classDiagram")).toBe(true)
      expect(result).toContain("classDiagram\nclass Cliente {\n  +String nombre\n}\n  // comentario de bloque")
    })

    it("debería limpiar tags secundarios (span), espacios web y parsear los símbolos de menor/mayor que", () => {
      const dirtyMermaid = `
        graph TD
        <span>NodoA</span> &nbsp;--&gt; <span>NodoB &lt;Generic&gt;</span>
      `
      const result = sanitizeMermaidForModal(dirtyMermaid)

      expect(result).toBe("graph TD\n        NodoA  --> NodoB <Generic>")
    })
  })
})