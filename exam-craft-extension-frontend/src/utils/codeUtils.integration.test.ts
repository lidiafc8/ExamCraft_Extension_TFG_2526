import { describe, expect, it } from "vitest"

import { parseJavaFiles } from "./codeUtils"

describe("parseJavaFiles Utility Tests", () => {
  it("debería retornar un array vacío si el texto de entrada está vacío o es nulo", () => {
    expect(parseJavaFiles("")).toEqual([])
    expect(parseJavaFiles(undefined as any)).toEqual([])
  })

  it("debería extraer el path y código cuando el nombre del archivo está justo antes del bloque de código", () => {
    const rawText = `
      Aquí tienes la clase principal:
      src/main/java/com/example/Main.java
      \`\`\`java
      public class Main {
          public static void main(String[] args) {}
      }
      \`\`\`
    `

    const result = parseJavaFiles(rawText)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      filename: "Main.java",
      path: "src/main/java/com/example/Main.java",
      code: "public class Main {\n          public static void main(String[] args) {}\n      }"
    })
  })

  it("debería extraer el path y código cuando el nombre del archivo está justo antes del bloque de código", () => {
    const rawText = `
      Aquí tienes la clase principal:
      src/main/java/com/example/Main.java
      \`\`\`java
      public class Main {}
      \`\`\`
    `
    const result = parseJavaFiles(rawText)

    expect(result).toHaveLength(1)
    expect(result[0].filename).toBe("Main.java")
    expect(result[0].path).toBe("src/main/java/com/example/Main.java")
  })

  it("debería extraer el path si viene dentro de un comentario justo al inicio del bloque de código", () => {
    const rawText = `
      \`\`\`java
      // Path: src/utils/MathUtils.java
      public class MathUtils {
          public int sum(int a, int b) { return a + b; }
      }
      \`\`\`
    `

    const result = parseJavaFiles(rawText)

    expect(result).toHaveLength(1)
    expect(result[0].filename).toBe("MathUtils.java")
    expect(result[0].path).toBe("src/utils/MathUtils.java")
    expect(result[0].code).not.toContain("// Path: src/utils/MathUtils.java")
    expect(result[0].code.startsWith("public class MathUtils")).toBe(true)
  })

  it("debería asignar un nombre por defecto si encuentra un bloque de código pero no hay ninguna ruta", () => {
    const rawText = `
      \`\`\`java
      public class SinNombre {}
      \`\`\`
    `

    const result = parseJavaFiles(rawText)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      filename: "Archivo.java",
      path: "",
      code: "public class SinNombre {}"
    })
  })

  it("debería procesar correctamente múltiples bloques de código secuenciales", () => {
    const rawText = `
      Ruta: src/Model.java
      \`\`\`java
      public class Model {}
      \`\`\`

      Ruta: src/Controller.java
      \`\`\`java
      public class Controller {}
      \`\`\`
    `

    const result = parseJavaFiles(rawText)

    expect(result).toHaveLength(2)
    expect(result[0].filename).toBe("Model.java")
    expect(result[1].filename).toBe("Controller.java")
  })

  it("debería usar el fallback de formato irregular si hay texto pero no contiene bloques Markdown con triple acento (```)", () => {
    const rawText =
      "public class EstiloPlanoNoMarkdown { // sin formato de bloques }"

    const result = parseJavaFiles(rawText)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      filename: "Código Generado (Formato Irregular)",
      code: rawText
    })
  })
})
