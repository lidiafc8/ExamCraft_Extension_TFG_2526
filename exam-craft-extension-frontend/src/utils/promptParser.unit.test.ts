import { describe, it, expect, vi, beforeEach } from "vitest"
import { parseMasterPrompt } from "./promptParser" 
import { RESOURCE_MAP } from "./resourceMap"

vi.mock("./resourceMap", () => ({
  RESOURCE_MAP: {
    "ClaseBase.java": "public class ClaseBase {}",
    "Restricciones.md": "## Reglas de negocio",
    "Diagrama.mermaid": "classDiagram\nAnimal <|-- Perro",
  }
}))

describe("parseMasterPrompt", () => {
  
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("Casos positivos", () => {
    it("separa correctamente el texto visible a partir de la clave '## Prompt a utilizar:'", () => {
      const fullText = "Sección de configuración\n## Prompt a utilizar:\nEste es el mensaje final para la IA"
      const result = parseMasterPrompt(fullText)

      expect(result.visibleText).toBe("Este es el mensaje final para la IA")
    })

    it("hace un trim automático al texto de prompt visible eliminando espacios o saltos sobrantes", () => {
      const fullText = "Config\n## Prompt a utilizar:\n   \nMi prompt con espacios alrededor\n\n   "
      const result = parseMasterPrompt(fullText)

      expect(result.visibleText).toBe("Mi prompt con espacios alrededor")
    })

    it("encuentra recursos listados con viñetas de asterisco (*) e inyecta su contenido en hiddenContext", () => {
      const fullText = "* ClaseBase.java\n* Restricciones.md\n## Prompt a utilizar:\nGenera la solución"
      const result = parseMasterPrompt(fullText)

      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: ClaseBase.java ---")
      expect(result.hiddenContext).toContain("public class ClaseBase {}")
      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: Restricciones.md ---")
      expect(result.hiddenContext).toContain("## Reglas de negocio")
    })

    it("encuentra recursos listados con viñetas de guion (-) y limpia comillas simples o dobles", () => {
      const fullText = "- 'ClaseBase.java'\n- \"Diagrama.mermaid\"\n## Prompt a utilizar:\nPrompt"
      const result = parseMasterPrompt(fullText)

      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: ClaseBase.java ---")
      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: Diagrama.mermaid ---")
      expect(result.hiddenContext).toContain("classDiagram\nAnimal <|-- Perro")
    })

    it("extrae recursos envueltos en backticks (`) del encabezado de forma exitosa", () => {
      const fullText = "* `ClaseBase.java`\n## Prompt a utilizar:\nEjecutar instrucción"
      const result = parseMasterPrompt(fullText)

      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: ClaseBase.java ---")
    })
  })

  describe("Casos negativos", () => {
    it("si la clave '## Prompt a utilizar:' NO existe, devuelve todo el texto como visible y el contexto vacío", () => {
      const fullText = "* ClaseBase.java\nTexto plano sin la clave de división por ningún lado."
      const result = parseMasterPrompt(fullText)

      expect(result.visibleText).toBe(fullText)
      expect(result.hiddenContext).toBe("")
    })

    it("no añade contenido al contexto y muestra un console.log explicativo si el archivo no existe en el mapa", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})
      const fullText = "* ArchivoFantasma.java\n## Prompt a utilizar:\nPrompt text"
      
      const result = parseMasterPrompt(fullText)

      expect(result.hiddenContext).toBe("")
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Recurso dinámico o no encontrado en map: 'ArchivoFantasma.java'")
      )
    })

    it("ignora por completo líneas de recursos válidas si estas se encuentran después de la palabra clave", () => {
      const fullText = "## Prompt a utilizar:\n* ClaseBase.java\nEste es el cuerpo real del prompt"
      const result = parseMasterPrompt(fullText)

      expect(result.visibleText).toBe("* ClaseBase.java\nEste es el cuerpo real del prompt")
      expect(result.hiddenContext).toBe("")
    })
  })

  describe("Casos límite", () => {
    it("funciona correctamente si el prompt a utilizar está totalmente en blanco", () => {
      const fullText = "* ClaseBase.java\n## Prompt a utilizar:\n"
      const result = parseMasterPrompt(fullText)

      expect(result.visibleText).toBe("")
      expect(result.hiddenContext).toContain("public class ClaseBase {}")
    })

    it("maneja nombres de archivos con espacios internos o caracteres especiales", () => {
      RESOURCE_MAP["Mi Clase Especial v2.java"] = "public class Especial {}"

      const fullText = "* `Mi Clase Especial v2.java`\n## Prompt a utilizar:\nTest"
      const result = parseMasterPrompt(fullText)

      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: Mi Clase Especial v2.java ---")
      expect(result.hiddenContext).toContain("public class Especial {}")
    })

    it("si hay múltiples ocurrencias de la clave divisoria, rompe solo en la primera", () => {
      const fullText = "Config\n## Prompt a utilizar:\nPrimer bloque\n## Prompt a utilizar:\nSegundo bloque"
      const result = parseMasterPrompt(fullText)

      expect(result.visibleText).toBe("Primer bloque")
    })
  })

  describe("Flujo máximo", () => {
    it("procesa un Master Prompt complejo con múltiples tipos de viñetas, archivos existentes y no existentes", () => {
      const fullText = `
# CONFIGURACIÓN DEL SISTEMA DE IA
Aquí listamos el contexto que leerá el backend de forma transparente:
* ClaseBase.java
- 'Restricciones.md'
* \`Diagrama.mermaid\`
- "ArchivoInexistente.txt"

## Prompt a utilizar:
Genera un examen basado en el dominio de Veterinaria.
Asegúrate de implementar los patrones vistos arriba.
`.trim()

      const result = parseMasterPrompt(fullText)

      expect(result.visibleText).toContain("Genera un examen basado en el dominio de Veterinaria.")
      expect(result.visibleText).toContain("Asegúrate de implementar los patrones vistos arriba.")
      expect(result.visibleText).not.toContain("# CONFIGURACIÓN DEL SISTEMA DE IA")

      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: ClaseBase.java ---")
      expect(result.hiddenContext).toContain("public class ClaseBase {}")
      
      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: Restricciones.md ---")
      expect(result.hiddenContext).toContain("## Reglas de negocio")
      
      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: Diagrama.mermaid ---")
      expect(result.hiddenContext).toContain("classDiagram\nAnimal <|-- Perro")

      expect(result.hiddenContext).not.toContain("ArchivoInexistente.txt")
    })
  })
})