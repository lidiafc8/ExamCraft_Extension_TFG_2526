import { describe, it, expect, vi, beforeEach } from "vitest"
import { parseMasterPrompt } from "./promptParser"
import { RESOURCE_MAP } from "./resourceMap" // Importamos el mapa ya mockeado

// ── 1. MOCK SEGURO CON DECLARACIÓN INTERNA Y EXPORTACIÓN ─────────────────────
vi.mock("./resourceMap", () => {
  const innerMock = {
    "func_ext.md": "Contenido de extensión funcional.",
    "attr_const.md": "Contenido de restricciones.",
    "rel_entities.md": "Contenido de relaciones.",
    "base_classes.md": "Contenido de clases base."
  };
  return {
    RESOURCE_MAP: innerMock
  };
});

describe("resourceMap / promptParser", () => {
  
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
      const fullText = "* func_ext.md\n* attr_const.md\n## Prompt a utilizar:\nGenera la solución"
      const result = parseMasterPrompt(fullText)

      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: func_ext.md ---")
      expect(result.hiddenContext).toContain(RESOURCE_MAP["func_ext.md"])
      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: attr_const.md ---")
      expect(result.hiddenContext).toContain(RESOURCE_MAP["attr_const.md"])
    })

    it("encuentra recursos reales listados con guion (-) y limpia comillas simples o dobles", () => {
      const fullText = "- 'rel_entities.md'\n- \"base_classes.md\"\n## Prompt a utilizar:\nPrompt"
      const result = parseMasterPrompt(fullText)

      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: rel_entities.md ---")
      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: base_classes.md ---")
      expect(result.hiddenContext).toContain(RESOURCE_MAP["base_classes.md"])
    })

    it("extrae recursos reales envueltos en backticks (`) del encabezado de forma exitosa", () => {
      const fullText = "* `func_ext.md`\n## Prompt a utilizar:\nEjecutar instrucción"
      const result = parseMasterPrompt(fullText)

      expect(result.hiddenContext).toContain("--- ARCHIVO / RECURSO: func_ext.md ---")
    })
  })

  // ── II. CASOS NEGATIVOS ───────────────────────────────────────────────────
  describe("Casos negativos", () => {
    it("si la clave '## Prompt a utilizar:' NO existe, devuelve todo el texto como visible y el contexto vacío", () => {
      const fullText = "* func_ext.md\nTexto plano sin la clave de división por ningún lado."
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
      const fullText = "## Prompt a utilizar:\n* func_ext.md\nEste es el cuerpo real del prompt"
      const result = parseMasterPrompt(fullText)

      expect(result.visibleText).toBe("* func_ext.md\nEste es el cuerpo real del prompt")
      expect(result.hiddenContext).toBe("")
    })
  })

  // ── III. CASOS LÍMITE ─────────────────────────────────────────────────────
  describe("Casos límite", () => {
    it("funciona correctamente si el prompt a utilizar está totalmente en blanco", () => {
      const fullText = "* func_ext.md\n## Prompt a utilizar:\n"
      const result = parseMasterPrompt(fullText)

      expect(result.visibleText).toBe("")
      expect(result.hiddenContext).toContain(RESOURCE_MAP["func_ext.md"])
    })

    it("si hay múltiples ocurrencias de la clave divisoria, rompe solo en la primera", () => {
      const fullText = "Config\n## Prompt a utilizar:\nPrimer bloque\n## Prompt a utilizar:\nSegundo bloque"
      const result = parseMasterPrompt(fullText)

      expect(result.visibleText).toBe("Primer bloque")
    })
  })

  // ── IV. FLUJO MÁXIMO ──────────────────────────────────────────────────────
  describe("Flujo máximo", () => {
    it("procesa un Master Prompt complejo inyectando todos los recursos estáticos del mapa real y descartando los inexistentes", () => {
      const fullText = `
# CONFIGURACIÓN MAESTRA DE EXAMCRAFT
* func_ext.md
- 'attr_const.md'
* \`rel_entities.md\`
- "base_classes.md"
* archivo_desconocido.md

## Prompt a utilizar:
Genera un examen basado en el dominio solicitado siguiendo las estructuras adjuntas.
`.trim()

      const result = parseMasterPrompt(fullText)

      // 1. Validar cuerpo del prompt visible
      expect(result.visibleText).toBe("Genera un examen basado en el dominio solicitado siguiendo las estructuras adjuntas.")

      // 2. Validar dinámicamente que se inyectaron todas las llaves usando el objeto RESOURCE_MAP importado
      Object.keys(RESOURCE_MAP).forEach((fileName) => {
        expect(result.hiddenContext).toContain(`--- ARCHIVO / RECURSO: ${fileName} ---`)
      })

      // 3. Validar que se omitió el archivo desconocido
      expect(result.hiddenContext).not.toContain("archivo_desconocido.md")
    })
  })
})