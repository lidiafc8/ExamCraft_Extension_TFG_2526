import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { GithubService, extractFilesForGitHub } from "./githubService" // Ajusta la ruta a tu archivo real si es necesario

describe("GithubService & Utils - Suite de Pruebas Unitarias Completa", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.fetch = vi.fn()
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "log").mockImplementation(() => {})
    // Congelamos el tiempo para evitar fallas volátiles con Date.now() en fallbacks
    vi.useFakeTimers().setSystemTime(new Date("2026-06-16T00:00:00.000Z"))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  // =========================================================================
  // 1. TESTS DE LA FUNCIÓN PURA: extractFilesForGitHub
  // =========================================================================
  describe("Función extractFilesForGitHub", () => {
    it("debe retornar un array vacío si el texto raw de entrada es nulo o vacío", () => {
      expect(extractFilesForGitHub("")).toEqual([])
    })

    it("extrae la ruta del archivo java cuando se define justamente antes del bloque de código", () => {
      const rawText = `
         El siguiente archivo contiene la lógica base:
         src/main/java/es/us/domain/Vehiculo.java
         \`\`\`java
         public class Vehiculo {}
         \`\`\`
       `
      const resultado = extractFilesForGitHub(rawText)
      expect(resultado).toHaveLength(1)
      expect(resultado[0]).toEqual({
        path: "src/main/java/es/us/domain/Vehiculo.java",
        content: "public class Vehiculo {}"
      })
    })

    it("extrae la ruta si está declarada de manera interna en la primera línea del bloque de código", () => {
      const rawText = `
         \`\`\`java
         // Archivo: src/test/java/es/us/TestExamen.java
         public class TestExamen {}
         \`\`\`
       `
      const resultado = extractFilesForGitHub(rawText)
      expect(resultado).toHaveLength(1)
      expect(resultado[0].path).toBe("src/test/java/es/us/TestExamen.java")
      expect(resultado[0].content).toBe("public class TestExamen {}")
    })

    it("asigna un nombre de fallback con timestamp si no localiza ningún patrón de ruta Java", () => {
      const rawText = `
         \`\`\`java
         public class Anonima {}
         \`\`\`
       `
      const resultado = extractFilesForGitHub(rawText)
      expect(resultado).toHaveLength(1)
      expect(resultado[0].path).toBe(`src/main/java/generated/ClaseGenerada_${Date.now()}.java`)
      expect(resultado[0].content).toBe("public class Anonima {}")
    })
  })

  // =========================================================================
  // 2. CASOS POSITIVOS (FLUJOS FELICES DE GITHUB)
  // =========================================================================
  describe("GithubService - Casos Positivos", () => {
    it("getUser: obtiene el perfil formateado de un usuario correctamente", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          login: "lidiafc8",
          avatar_url: "https://avatar.url",
          public_repos: 12,
          bio: "Developer"
        })
      } as any)

      const user = await GithubService.getUser("lidiafc8")
      expect(user).toEqual({
        login: "lidiafc8",
        avatar_url: "https://avatar.url",
        public_repos: 12,
        bio: "Developer"
      })
    })

    it("getMyRepo: obtiene los metadatos de un repositorio existente", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          name: "mi-repo",
          description: "Un gran examen",
          html_url: "https://github.com/mi-repo",
          stargazers_count: 5
        })
      } as any)

      const repo = await GithubService.getMyRepo("owner", "mi-repo")
      expect(repo).toEqual({
        name: "mi-repo",
        description: "Un gran examen",
        html_url: "https://github.com/mi-repo",
        stargazers_count: 5
      })
    })

    it("createRepoFromTemplate: crea el repositorio y resuelve JSON alternativo de contingencia si no hay payload", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "text/plain" }
      } as any)

      const res = await GithubService.createRepoFromTemplate("token", "owner", "tpl", "nuevo")
      expect(res.success).toBe(true)
    })

    it("createOrUpdateFile: recupera el SHA previo si el archivo existe y hace PUT mandando dicho identificador", async () => {
      vi.mocked(globalThis.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValueOnce({ sha: "sha-viejo-123" })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValueOnce({ content: { name: "README.md" } })
        } as any)

      const result = await GithubService.createOrUpdateFile("token", "owner", "repo", "README.md", "Nuevo Contenido", "commit msg")
      
      expect(globalThis.fetch).toHaveBeenLastCalledWith(
        "https://api.github.com/repos/owner/repo/contents/README.md",
        expect.objectContaining({
          method: "PUT",
          body: expect.stringContaining('"sha":"sha-viejo-123"')
        })
      )
      expect(result.content.name).toBe("README.md")
    })

    it("updateReadmeWithDescription: reintenta hasta encontrar el archivo si recibe códigos 404 transitorios", async () => {
      const readmeMockBase64 = btoa(unescape(encodeURIComponent("## Descripción control check a realizar\n*(Aquí puedes añadir los detalles o la lista de comprobaciones que se deben realizar en el control)*")))

      vi.mocked(globalThis.fetch)
        .mockResolvedValueOnce({ ok: false, status: 404 } as any) // Intento 1 (Bucle)
        .mockResolvedValueOnce({ ok: false, status: 404 } as any) // Intento 2 (Bucle)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValueOnce({
            content: readmeMockBase64
          })
        } as any) // Intento 3 (Éxito del Bucle y rompe el ciclo)
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValueOnce({ success: true }) } as any) // Llamada interna a createOrUpdateFile (GET verificador)
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValueOnce({ success: true }) } as any) // Llamada interna a createOrUpdateFile (PUT final)

      const promesaReadme = GithubService.updateReadmeWithDescription("tok", "ow", "rep", "Nueva info insertada")
      
      await vi.runAllTimersAsync()
      const res = await promesaReadme

      expect(res).toBeDefined()
    })
  })

  // =========================================================================
  // 3. CASOS NEGATIVOS Y MANEJO DE EXCEPCIONES
  // =========================================================================
  describe("GithubService - Casos Negativos y Errores", () => {
    it("getUser & getMyRepo: deben retornar null atrapando el error limpiamente si la API falla", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({ ok: false } as any)

      const user = await GithubService.getUser("usuario-fantasma")
      const repo = await GithubService.getMyRepo("owner", "repo-fantasma")

      expect(user).toBeNull()
      expect(repo).toBeNull()
    })

    it("createRepoFromTemplate: lanza excepción descriptiva con el texto crudo del error de GitHub", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: vi.fn().mockResolvedValueOnce("Repository name already exists")
      } as any)

      await expect(
        GithubService.createRepoFromTemplate("tok", "owner", "tpl", "repo")
      ).rejects.toThrow("Error GitHub (422): Repository name already exists")
    })

    it("createOrUpdateFile: lanza excepción si la petición PUT es rechazada", async () => {
      vi.mocked(globalThis.fetch)
        .mockResolvedValueOnce({ ok: false } as any) // GET previo falla
        .mockResolvedValueOnce({
          ok: false,
          json: vi.fn().mockResolvedValueOnce({ message: "Invalid base64 content" })
        } as any) // PUT falla

      await expect(
        GithubService.createOrUpdateFile("tok", "ow", "rep", "test.java", "code", "msg")
      ).rejects.toThrow("Error subiendo test.java: Invalid base64 content")
    })

    it("updateReadmeWithDescription: lanza excepción fatal si se agotan todos los reintentos permitidos", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({ ok: false, status: 404 } as any)

      // CORRECCIÓN: Declaramos la aserción al mismo tiempo que disparamos el flujo asíncrono de los relojes virtuales
      const promesaReadme = GithubService.updateReadmeWithDescription("tok", "ow", "rep", "info")
      
      const expectPromise = expect(promesaReadme).rejects.toThrow(
        "No se pudo obtener el README.md (GitHub está tardando demasiado en generar la plantilla)"
      )

      await vi.runAllTimersAsync()
      await expectPromise
    })
  })

  // =========================================================================
  // 4. FLUJO COMPLETO DE ORQUESTACIÓN (deployExam)
  // =========================================================================
  describe("GithubService - Flujo de Despliegue de Examen (deployExam)", () => {
    it("orquesta con éxito todo el ciclo de publicación de ramas y subida de archivos", async () => {
      const projectMock = {
        customName: "Examen Integrador de Software",
        domainName: "Software",
        extensionStatement: "Detalle funcional",
        extensionMermaid: "graph TD; A-->B",
        attributeConstraints: "No nulos",
        entityRelationships: "Uno a muchos",
        testPartsMap: {
          "t1": { fileName: "ExamenTest.java", code: "public class ExamenTest {}" }
        },
        baseClasses: "src/ClaseBase.java\n```java\npublic class ClaseBase {}\n```",
        fullSolution: "src/ClaseBase.java\n```java\npublic class ClaseBaseResuelta {}\n```"
      }

      // Solución al URIError: Codificamos de forma binaria segura antes de generar el mock binario
      const readmeMockBase64 = btoa(unescape(encodeURIComponent("## Descripción control check a realizar")))

      vi.mocked(globalThis.fetch)
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValueOnce({ login: "lidiafc8" }) } as any) // /user
        .mockResolvedValueOnce({ ok: true, headers: { get: () => "application/json" }, json: vi.fn().mockResolvedValueOnce({ html_url: "https://github.com/lidiafc8/nuevo-examen" }) } as any) // /generate
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValueOnce({ content: readmeMockBase64 }) } as any) // GET README (Corregido)
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValueOnce({ success: true }) } as any) // GET interno README
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValueOnce({ success: true }) } as any) // PUT README
        .mockResolvedValueOnce({ ok: false } as any) // GET Test
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValueOnce({ success: true }) } as any) // PUT Test
        .mockResolvedValueOnce({ ok: false } as any) // GET Base class
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValueOnce({ success: true }) } as any) // PUT Base class
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValueOnce({ object: { sha: "main-sha" } }) } as any) // GET SHA
        .mockResolvedValueOnce({ ok: true } as any) // POST Create Branch
        .mockResolvedValueOnce({ ok: false } as any) // GET Branch content
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValueOnce({ success: true }) } as any) // PUT Branch content

      const promesaDeploy = GithubService.deployExam(
        "valid-token",
        projectMock,
        "nuevo-examen",
        "template-owner",
        "template-repo",
        "src/test/java/"
      )

      await vi.runAllTimersAsync()
      const urlResultante = await promesaDeploy

      expect(urlResultante).toBe("https://github.com/lidiafc8/nuevo-examen")
    })
  })
})