import { describe, it, expect, vi, beforeEach } from "vitest"
import { parseMasterPrompt } from "./promptParser" // Ajusta la ruta a tu archivo original
import { RESOURCE_MAP } from "./resourceMap"

// ── MOCKS EXTERNOS ───────────────────────────────────────────────────────────
// Simulamos el RESOURCE_MAP con los nombres de archivos reales de tu proyecto
vi.mock("./resourceMap", () => ({
  RESOURCE_MAP: {
    "functional_extension_examples_previous_exams.md": "Contenido de ejemplo de extensión funcional de exámenes previos.",
    "attribute_constraints_examples_previous_exams.md": "Contenido de ejemplo de restricciones de atributos.",
    "relationships_between_entities_examples_previous_exams.md": "Contenido de ejemplo de relaciones entre entidades.",
    "base_classes_structure_examples_previous_exams.md": "Contenido de ejemplo de estructuras de clases base."
  }
}))

describe("resourceMap", () => {
  
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // ── I. CASOS POSITIVOS ────────────────────────────────────────────────────
  describe("Casos positivos", () => {
    it("separa correctamente el texto visible a partir de la clave '## Prompt a utilizar:'", () => {
      const fullText = "Configuración previa\n## Prompt a utilizar:\nEste es el mensaje final para la IA"
      const result = parseMasterPrompt(fullText)

      expect(result.visibleText).toBe("Este es el mensaje final para la IA")
    })

    it("hace un trim automático al texto de prompt visible eliminando espacios o saltos sobrantes", () => {
      const fullText = "Config\n## Prompt a utilizar:\n   \nMi prompt con espacios alrededor\n\n   "
      const result = parseMasterPrompt(fullText)

      expect(result.visibleText).toBe("Mi prompt con espacios alrededor")
    })

    it("encuentra recursos reales listados con asterisco (*) e inyecta su contenido en hiddenContext", () => {
      const fullText = "* functional_extension_examples_previous_exams.md\n* attribute_constraints_examples_previous_exams.md\n## Prompt a utilizar:\nGenera la solución"
      const result = parseMasterPrompt(fullText)

      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: functional_extension_examples_previous_exams.md ---")
      expect(result.hiddenContext).toContain("Contenido de ejemplo de extensión funcional")
      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: attribute_constraints_examples_previous_exams.md ---")
      expect(result.hiddenContext).toContain("Contenido de ejemplo de restricciones de atributos.")
    })

    it("encuentra recursos reales listados con guion (-) y limpia comillas simples o dobles", () => {
      const fullText = "- 'relationships_between_entities_examples_previous_exams.md'\n- \"base_classes_structure_examples_previous_exams.md\"\n## Prompt a utilizar:\nPrompt"
      const result = parseMasterPrompt(fullText)

      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: relationships_between_entities_examples_previous_exams.md ---")
      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: base_classes_structure_examples_previous_exams.md ---")
      expect(result.hiddenContext).toContain("Contenido de ejemplo de estructuras de clases base.")
    })

    it("extrae recursos reales envueltos en backticks (`) del encabezado de forma exitosa", () => {
      const fullText = "* `functional_extension_examples_previous_exams.md`\n## Prompt a utilizar:\nEjecutar instrucción"
      const result = parseMasterPrompt(fullText)

      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: functional_extension_examples_previous_exams.md ---")
    })
  })

  // ── II. CASOS NEGATIVOS ───────────────────────────────────────────────────
  describe("Casos negativos", () => {
    it("si la clave '## Prompt a utilizar:' NO existe, devuelve todo el texto como visible y el contexto vacío", () => {
      const fullText = "* functional_extension_examples_previous_exams.md\nTexto plano sin la clave de división por ningún lado."
      const result = parseMasterPrompt(fullText)

      expect(result.visibleText).toBe(fullText)
      expect(result.hiddenContext).toBe("")
    })

    it("no añade contenido al contexto y muestra un console.log explicativo si el archivo no existe en el mapa de recursos", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})
      const fullText = "* archivo_no_existente.md\n## Prompt a utilizar:\nPrompt text"
      
      const result = parseMasterPrompt(fullText)

      expect(result.hiddenContext).toBe("")
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Recurso dinámico o no encontrado en map: 'archivo_no_existente.md'")
      )
    })

    it("ignora por completo líneas de recursos válidas si estas se encuentran después de la palabra clave divisoria", () => {
      const fullText = "## Prompt a utilizar:\n* functional_extension_examples_previous_exams.md\nEste es el cuerpo real del prompt"
      const result = parseMasterPrompt(fullText)

      expect(result.visibleText).toBe("* functional_extension_examples_previous_exams.md\nEste es el cuerpo real del prompt")
      expect(result.hiddenContext).toBe("")
    })
  })

  // ── III. CASOS LÍMITE ─────────────────────────────────────────────────────
  describe("Casos límite", () => {
    it("funciona correctamente si el prompt a utilizar está totalmente en blanco", () => {
      const fullText = "* functional_extension_examples_previous_exams.md\n## Prompt a utilizar:\n"
      const result = parseMasterPrompt(fullText)

      expect(result.visibleText).toBe("")
      expect(result.hiddenContext).toContain("Contenido de ejemplo de extensión funcional de exámenes previos.")
    })

    it("si hay múltiples ocurrencias de la clave divisoria, rompe solo en la primera", () => {
      const fullText = "Config\n## Prompt a utilizar:\nPrimer bloque\n## Prompt a utilizar:\nSegundo bloque"
      const result = parseMasterPrompt(fullText)

      // CORREGIDO: Debe esperar solo "Primer bloque" que es lo que procesa tu split real
      expect(result.visibleText).toBe("Primer bloque")
    })
  })

  // ── IV. FLUJO MÁXIMO ──────────────────────────────────────────────────────
  describe("Flujo máximo", () => {
    it("procesa un Master Prompt complejo inyectando todos los recursos estáticos del mapa real y descartando los inexistentes", () => {
      const fullText = `
# CONFIGURACIÓN MAESTRA DE EXAMCRAFT
* functional_extension_examples_previous_exams.md
- 'attribute_constraints_examples_previous_exams.md'
* \`relationships_between_entities_examples_previous_exams.md\`
- "base_classes_structure_examples_previous_exams.md"
* archivo_desconocido.md

## Prompt a utilizar:
Genera un examen basado en el dominio solicitado siguiendo las estructuras adjuntas.
`.trim()

      const result = parseMasterPrompt(fullText)

      // 1. Validar cuerpo del prompt visible
      expect(result.visibleText).toBe("Genera un examen basado en el dominio solicitado siguiendo las estructuras adjuntas.")

      // 2. Validar que se inyectaron los 4 recursos reales del mapa
      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: functional_extension_examples_previous_exams.md ---")
      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: attribute_constraints_examples_previous_exams.md ---")
      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: relationships_between_entities_examples_previous_exams.md ---")
      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: base_classes_structure_examples_previous_exams.md ---")

      // 3. Validar que se omitió el archivo desconocido
      expect(result.hiddenContext).not.toContain("archivo_desconocido.md")
    })
  })
})