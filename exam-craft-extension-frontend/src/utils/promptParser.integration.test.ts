import { beforeEach, describe, expect, it, vi } from "vitest"

import { parseMasterPrompt } from "./promptParser"

vi.mock("./resourceMap", () => ({
  RESOURCE_MAP: {
    "PlantillaExamen.java": "public class PlantillaExamen {}",
    "Configuracion.json": '{ "timeout": 5000 }'
  }
}))

describe("parseMasterPrompt Utility Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("debería retornar el texto completo como visibleText y hiddenContext vacío si no incluye la clave SPLIT_KEY", () => {
    const rawText =
      "Texto plano sin cabeceras especiales ni prompts estructurados."

    const result = parseMasterPrompt(rawText)

    expect(result).toEqual({
      visibleText: rawText,
      hiddenContext: ""
    })
  })

  it("debería dividir correctamente el prompt visible del contexto e inyectar el recurso si existe en el mapa", () => {
    const rawText = `
      Recursos requeridos para la generación:
      * PlantillaExamen.java
      
      ## Prompt a utilizar:
      Genera una clase que herede de la plantilla provista.
    `.trim()

    const result = parseMasterPrompt(rawText)

    expect(result.visibleText).toBe(
      "Genera una clase que herede de la plantilla provista."
    )

    expect(result.hiddenContext).toContain(
      "--- ARCHIVO / RECURSO: PlantillaExamen.java ---"
    )
    expect(result.hiddenContext).toContain("public class PlantillaExamen {}")
  })

  it("debería procesar nombres de archivos envueltos en comillas simples, dobles o backticks", () => {
    const rawText = `
      Recursos con formatos distintos:
      * 'PlantillaExamen.java'
      - \`Configuracion.json\`
      
      ## Prompt a utilizar:
      Prompt de prueba.
    `.trim()

    const result = parseMasterPrompt(rawText)

    expect(result.visibleText).toBe("Prompt de prueba.")
    expect(result.hiddenContext).toContain(
      "--- ARCHIVO / RECURSO: PlantillaExamen.java ---"
    )
    expect(result.hiddenContext).toContain(
      "--- ARCHIVO / RECURSO: Configuracion.json ---"
    )
  })

  it("debería omitir el recurso en el hiddenContext e imprimir un log en consola si el archivo no existe en el mapa", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    const rawText = `
      Recursos:
      * ArchivoInexistente.java
      
      ## Prompt a utilizar:
      Crea un algoritmo genérico.
    `.trim()

    const result = parseMasterPrompt(rawText)

    expect(result.hiddenContext).toBe("")
    expect(result.visibleText).toBe("Crea un algoritmo genérico.")

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Recurso dinámico o no encontrado en map: 'ArchivoInexistente.java'"
      )
    )
  })
})
