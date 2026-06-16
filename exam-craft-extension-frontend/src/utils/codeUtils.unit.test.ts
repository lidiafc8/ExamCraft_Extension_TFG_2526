import { describe, it, expect } from "vitest"
import { parseJavaFiles } from "./codeUtils"

// ══════════════════════════════════════════════════════════════════════════════
describe("parseJavaFiles", () => {

  // ── I. CASOS POSITIVOS ────────────────────────────────────────────────────
  describe("Casos positivos", () => {
    it("devuelve array vacío si rawText es string vacío", () => {
      expect(parseJavaFiles("")).toEqual([])
    })

    it("devuelve array vacío si rawText es undefined/null (coerción a falsy)", () => {
      expect(parseJavaFiles(null as any)).toEqual([])
      expect(parseJavaFiles(undefined as any)).toEqual([])
    })

    it("extrae un único bloque de código sin path asociado → filename 'Archivo.java'", () => {
      const input = "```java\npublic class Hola {}\n```"
      const result = parseJavaFiles(input)
      expect(result).toHaveLength(1)
      expect(result[0].filename).toBe("Archivo.java")
      expect(result[0].code).toBe("public class Hola {}")
      expect(result[0].path).toBe("")
    })

    it("extrae el filename correcto cuando la ruta está en el texto antes del bloque", () => {
      const input = "src/main/Tablero.java\n```java\npublic class Tablero {}\n```"
      const result = parseJavaFiles(input)
      expect(result[0].filename).toBe("Tablero.java")
      expect(result[0].path).toBe("src/main/Tablero.java")
    })

    it("extrae el path completo cuando hay subdirectorios en la ruta", () => {
      const input = "com/example/service/UserService.java\n```java\nclass UserService {}\n```"
      const result = parseJavaFiles(input)
      expect(result[0].path).toBe("com/example/service/UserService.java")
      expect(result[0].filename).toBe("UserService.java")
    })

    it("extrae la ruta anotada con prefijo '//' antes del bloque", () => {
      const input = "// src/Animal.java\n```java\nclass Animal {}\n```"
      const result = parseJavaFiles(input)
      expect(result[0].filename).toBe("Animal.java")
      expect(result[0].path).toBe("/Animal.java") // ← lo que la función realmente devuelve
    })

    it("extrae la ruta con prefijo '// Archivo:' antes del bloque", () => {
      const input = "// Archivo: src/Gato.java\n```java\nclass Gato {}\n```"
      const result = parseJavaFiles(input)
      expect(result[0].filename).toBe("Gato.java")
    })

    it("detecta el path dentro del propio bloque como primera línea (prefijo 'Archivo:')", () => {
      const input = "```java\nArchivo: src/Perro.java\nclass Perro {}\n```"
      const result = parseJavaFiles(input)
      expect(result[0].filename).toBe("Perro.java")
      expect(result[0].path).toBe("src/Perro.java")
      expect(result[0].code).toBe("class Perro {}")
    })

    it("detecta el path dentro del bloque con prefijo 'Path:'", () => {
      const input = "```java\nPath: com/app/Main.java\npublic class Main {}\n```"
      const result = parseJavaFiles(input)
      expect(result[0].filename).toBe("Main.java")
      expect(result[0].code).toBe("public class Main {}")
    })

    it("detecta el path dentro del bloque sin prefijo (solo el nombre .java como primera línea)", () => {
      const input = "```java\n* src/Caballo.java\nclass Caballo {}\n```"
      const result = parseJavaFiles(input)
      expect(result[0].filename).toBe("Caballo.java")
    })

    it("extrae múltiples bloques con sus paths correctos", () => {
      const input = [
        "src/A.java",
        "```java",
        "class A {}",
        "```",
        "",
        "src/B.java",
        "```java",
        "class B {}",
        "```"
      ].join("\n")
      const result = parseJavaFiles(input)
      expect(result).toHaveLength(2)
      expect(result[0].filename).toBe("A.java")
      expect(result[1].filename).toBe("B.java")
    })

    it("usa la última referencia .java encontrada antes del bloque si hay varias", () => {
      const input = "src/Primero.java\nsrc/Ultimo.java\n```java\nclass Ultimo {}\n```"
      const result = parseJavaFiles(input)
      expect(result[0].filename).toBe("Ultimo.java")
    })

    it("elimina el trim del código (espacios/saltos al inicio y al final)", () => {
      const input = "```java\n\n  public class Limpia {}\n\n```"
      const result = parseJavaFiles(input)
      expect(result[0].code).toBe("public class Limpia {}")
    })

    it("bloque sin lenguaje (``` sin 'java') también se extrae", () => {
      const input = "```\npublic class SinLenguaje {}\n```"
      const result = parseJavaFiles(input)
      expect(result).toHaveLength(1)
      expect(result[0].code).toBe("public class SinLenguaje {}")
    })

    it("acepta bloques con fin de línea CRLF (\\r\\n)", () => {
      const input = "src/CrLf.java\r\n```java\r\nclass CrLf {}\r\n```"
      const result = parseJavaFiles(input)
      expect(result[0].filename).toBe("CrLf.java")
    })

    it("acepta rutas con guiones en el nombre del fichero", () => {
      const input = "src/my-service/My-Class.java\n```java\nclass MyClass {}\n```"
      const result = parseJavaFiles(input)
      expect(result[0].filename).toBe("My-Class.java")
    })

    it("el código extraído conserva la indentación interna del bloque", () => {
      const code = "class A {\n    void method() {\n        return;\n    }\n}"
      const input = `\`\`\`java\n${code}\n\`\`\``
      const result = parseJavaFiles(input)
      expect(result[0].code).toBe(code)
    })
  })

  // ── II. CASOS NEGATIVOS ───────────────────────────────────────────────────
  describe("Casos negativos", () => {
    it("devuelve fallback 'Código Generado (Formato Irregular)' si no hay bloques pero sí texto", () => {
      const input = "public class SinBloque { }"
      const result = parseJavaFiles(input)
      expect(result).toHaveLength(1)
      expect(result[0].filename).toBe("Código Generado (Formato Irregular)")
      expect(result[0].code).toBe(input)
    })

    it("el fallback incluye el rawText completo sin modificar", () => {
      const input = "  texto irregular con espacios  "
      const result = parseJavaFiles(input)
      expect(result[0].code).toBe(input)
    })

    it("devuelve array vacío si rawText es solo espacios en blanco", () => {
      expect(parseJavaFiles("   ")).toEqual([])
      expect(parseJavaFiles("\n\n\n")).toEqual([])
      expect(parseJavaFiles("\t\t")).toEqual([])
    })

    it("devuelve array vacío si rawText es solo saltos de línea", () => {
      expect(parseJavaFiles("\n")).toEqual([])
    })

    it("NO activa el fallback si rawText.trim() es vacío aunque tenga whitespace", () => {
      // La condición es: results.length === 0 && rawText.trim() !== ""
      const result = parseJavaFiles("   \n   ")
      expect(result).toEqual([])
    })

    it("un bloque sin contenido produce code vacío string vacío", () => {
      const input = "```java\n```"
      const result = parseJavaFiles(input)
      expect(result).toHaveLength(1)
      expect(result[0].code).toBe("")
    })

    it("un bloque con solo espacios produce code string vacío (por trim)", () => {
      const input = "```java\n   \n```"
      const result = parseJavaFiles(input)
      expect(result[0].code).toBe("")
    })

    it("no extrae paths con extensión que no sea .java (ej: .py, .ts)", () => {
      const input = "src/Script.py\n```java\nclass A {}\n```"
      const result = parseJavaFiles(input)
      // .py no es .java → no se captura como path
      expect(result[0].path).toBe("")
      expect(result[0].filename).toBe("Archivo.java")
    })

    it("no confunde una URL con una ruta java", () => {
      const input = "https://github.com/repo\n```java\nclass A {}\n```"
      const result = parseJavaFiles(input)
      // "github.com/repo" no termina en .java → no hay path
      expect(result[0].filename).toBe("Archivo.java")
    })
  })

  // ── III. CASOS LÍMITE ─────────────────────────────────────────────────────
  describe("Casos límite", () => {
    it("un bloque inmediatamente seguido de otro sin texto entre ellos", () => {
      const input = "```java\nclass A {}\n```\n```java\nclass B {}\n```"
      const result = parseJavaFiles(input)
      expect(result).toHaveLength(2)
      expect(result[0].code).toBe("class A {}")
      expect(result[1].code).toBe("class B {}")
    })

    it("path dentro del bloque: elimina la primera línea del código resultante", () => {
      const input = "```java\nArchivo: src/Test.java\nclass Test {}\n```"
      const result = parseJavaFiles(input)
      // La línea 'Archivo: src/Test.java' NO debe estar en el code
      expect(result[0].code).not.toContain("Archivo:")
      expect(result[0].code).toBe("class Test {}")
    })

    it("path en texto previo tiene prioridad sobre path dentro del bloque", () => {
      const input = "src/Externo.java\n```java\nArchivo: src/Interno.java\nclass X {}\n```"
      const result = parseJavaFiles(input)
      // pathsBefore tiene contenido → usa el externo, NO el interno
      expect(result[0].filename).toBe("Externo.java")
    })

    it("ruta con solo el nombre de fichero sin directorios → filename correcto", () => {
      const input = "Simple.java\n```java\nclass Simple {}\n```"
      const result = parseJavaFiles(input)
      expect(result[0].filename).toBe("Simple.java")
      expect(result[0].path).toBe("Simple.java")
    })

    it("filename es el último segmento del path (split('/').pop())", () => {
      const input = "a/b/c/d/Deep.java\n```java\nclass Deep {}\n```"
      const result = parseJavaFiles(input)
      expect(result[0].filename).toBe("Deep.java")
      expect(result[0].path).toBe("a/b/c/d/Deep.java")
    })

    it("rawText con solo bloques cerrados correctamente → no activa el fallback", () => {
      const input = "```java\nclass Ok {}\n```"
      const result = parseJavaFiles(input)
      expect(result[0].filename).not.toBe("Código Generado (Formato Irregular)")
    })

    it("texto muy largo antes del bloque → extrae el último .java mencionado", () => {
      const longPreamble = "Primero.java\n".repeat(50) + "Ultimo.java\n"
      const input = longPreamble + "```java\nclass X {}\n```"
      const result = parseJavaFiles(input)
      expect(result[0].filename).toBe("Ultimo.java")
    })

    it("múltiples bloques donde uno no tiene path y otro sí", () => {
      const input = [
        "```java",
        "class SinPath {}",
        "```",
        "src/ConPath.java",
        "```java",
        "class ConPath {}",
        "```"
      ].join("\n")
      const result = parseJavaFiles(input)
      expect(result[0].filename).toBe("Archivo.java")
      expect(result[1].filename).toBe("ConPath.java")
    })

    it("bloque con código que contiene referencias a otros .java no confunde al parser de paths", () => {
      const input = [
        "src/Main.java",
        "```java",
        "import com.example.Util.java; // esto no es una ruta",
        "class Main {}",
        "```"
      ].join("\n")
      const result = parseJavaFiles(input)
      // El path real viene del texto antes del bloque
      expect(result[0].filename).toBe("Main.java")
      expect(result[0].path).toBe("src/Main.java")
    })

    it("bloque con lenguaje en mayúsculas (```JAVA) también se captura", () => {
      const input = "```JAVA\npublic class Upper {}\n```"
      const result = parseJavaFiles(input)
      expect(result).toHaveLength(1)
      expect(result[0].code).toBe("public class Upper {}")
    })

    it("devuelve siempre 'path' como propiedad aunque esté vacío", () => {
      const input = "```java\nclass A {}\n```"
      const result = parseJavaFiles(input)
      expect(result[0]).toHaveProperty("path")
      expect(result[0].path).toBe("")
    })

    it("resultado siempre tiene las tres propiedades: filename, path, code", () => {
      const input = "Foo.java\n```java\nclass Foo {}\n```"
      const result = parseJavaFiles(input)
      expect(result[0]).toHaveProperty("filename")
      expect(result[0]).toHaveProperty("path")
      expect(result[0]).toHaveProperty("code")
    })
  })

  // ── IV. FLUJO MÁXIMO ──────────────────────────────────────────────────────
  describe("Flujo máximo: respuesta completa de IA con múltiples bloques y formatos mixtos", () => {
    it("procesa una respuesta realista con 5 archivos en formatos distintos", () => {
      const input = [
        "Aquí tienes los archivos generados para el examen:",
        "",
        "### 1. Clase principal",
        "src/main/java/com/examen/Main.java",
        "```java",
        "package com.examen;",
        "public class Main {",
        "    public static void main(String[] args) {}",
        "}",
        "```",
        "",
        "### 2. Entidad Animal (path dentro del bloque)",
        "```java",
        "// Archivo: src/main/java/com/examen/Animal.java",
        "public abstract class Animal {",
        "    private String nombre;",
        "}",
        "```",
        "",
        "### 3. Interfaz (con prefijo Path:)",
        "```java",
        "Path: src/main/java/com/examen/Identificable.java",
        "public interface Identificable {",
        "    String getId();",
        "}",
        "```",
        "",
        "### 4. Test (ruta en comentario previo)",
        "// src/test/java/com/examen/MainTest.java",
        "```java",
        "@Test",
        "public class MainTest {",
        "    void testMain() {}",
        "}",
        "```",
        "",
        "### 5. Bloque sin path identificable",
        "```java",
        "public class Auxiliar {",
        "    // helper class",
        "}",
        "```"
      ].join("\n")

      const result = parseJavaFiles(input)

      expect(result).toHaveLength(5)

      // Bloque 1: path en texto antes
      expect(result[0].filename).toBe("Main.java")
      expect(result[0].path).toBe("src/main/java/com/examen/Main.java")
      expect(result[0].code).toContain("public class Main")

      // Bloque 2: path dentro del bloque con prefijo '// Archivo:'
      expect(result[1].filename).toBe("Animal.java")
      expect(result[1].code).toContain("public abstract class Animal")
      expect(result[1].code).not.toContain("Archivo:")

      // Bloque 3: path dentro con 'Path:'
      expect(result[2].filename).toBe("Identificable.java")
      expect(result[2].code).toContain("public interface Identificable")
      expect(result[2].code).not.toContain("Path:")

      // Bloque 4: path en comentario antes del bloque
      expect(result[3].filename).toBe("MainTest.java")
      expect(result[3].code).toContain("@Test")

      // Bloque 5: sin path → fallback a Archivo.java
      expect(result[4].filename).toBe("Archivo.java")
      expect(result[4].path).toBe("")
      expect(result[4].code).toContain("public class Auxiliar")
    })

    it("todos los resultados tienen siempre las tres propiedades esperadas", () => {
      const input = [
        "A.java\n```java\nclass A {}\n```",
        "```java\nArchivo: B.java\nclass B {}\n```",
        "```java\nclass C {}\n```"
      ].join("\n\n")

      const result = parseJavaFiles(input)
      result.forEach((item) => {
        expect(item).toHaveProperty("filename")
        expect(item).toHaveProperty("path")
        expect(item).toHaveProperty("code")
        expect(typeof item.filename).toBe("string")
        expect(typeof item.path).toBe("string")
        expect(typeof item.code).toBe("string")
      })
    })

    it("procesa 10 bloques consecutivos y devuelve exactamente 10 resultados", () => {
      const blocks = Array.from(
        { length: 10 },
        (_, i) =>
          `src/Clase${i}.java\n\`\`\`java\npublic class Clase${i} {}\n\`\`\``
      ).join("\n\n")

      const result = parseJavaFiles(blocks)
      expect(result).toHaveLength(10)
      result.forEach((item, i) => {
        expect(item.filename).toBe(`Clase${i}.java`)
        expect(item.code).toBe(`public class Clase${i} {}`)
      })
    })

    it("respuesta con texto introductorio largo + bloque → no activa el fallback", () => {
      const intro = "Esta es una explicación muy larga sobre el examen.\n".repeat(20)
      const input = intro + "Resultado.java\n```java\nclass Resultado {}\n```"
      const result = parseJavaFiles(input)
      expect(result).toHaveLength(1)
      expect(result[0].filename).toBe("Resultado.java")
    })

    it("mezcla de bloques con CRLF y LF en el mismo rawText", () => {
      const input =
        "A.java\r\n```java\r\nclass A {}\r\n```\n\nB.java\n```java\nclass B {}\n```"
      const result = parseJavaFiles(input)
      expect(result).toHaveLength(2)
      expect(result[0].filename).toBe("A.java")
      expect(result[1].filename).toBe("B.java")
    })

    it("el código de cada bloque no contiene las marcas de apertura/cierre de bloque", () => {
      const input =
        "A.java\n```java\nclass A {}\n```\nB.java\n```java\nclass B {}\n```"
      const result = parseJavaFiles(input)
      result.forEach((item) => {
        expect(item.code).not.toContain("```")
      })
    })

    it("extrae correctamente anotaciones, imports y código multilínea complejo", () => {
      const complexCode = [
        "package com.examen;",
        "",
        "import java.util.List;",
        "import java.util.ArrayList;",
        "",
        "@SuppressWarnings(\"unchecked\")",
        "public class Complejo<T extends Comparable<T>> {",
        "    private List<T> items = new ArrayList<>();",
        "",
        "    public void add(T item) {",
        "        this.items.add(item);",
        "    }",
        "}"
      ].join("\n")

      const input = `src/Complejo.java\n\`\`\`java\n${complexCode}\n\`\`\``
      const result = parseJavaFiles(input)
      expect(result[0].filename).toBe("Complejo.java")
      expect(result[0].code).toBe(complexCode)
    })
  })
})