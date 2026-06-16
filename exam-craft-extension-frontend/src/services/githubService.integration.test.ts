import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { GithubService } from "./githubService" 
global.fetch = vi.fn()

describe("GitHub Utility & Service Tests", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "log").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("getUser & getMyRepo", () => {
    it("getUser: debería mapear y retornar los datos del usuario si el API responde 200 OK", async () => {
      const mockUserData = { login: "maria_tfg", avatar_url: "url", public_repos: 5, bio: "Estudiante" }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockUserData)
      } as unknown as Response)

      const user = await GithubService.getUser("maria_tfg")
      expect(user).toEqual(mockUserData)
    })

    it("getUser: debería retornar null y capturar el error si el estatus no es OK (ej. 404)", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as unknown as Response)

      const user = await GithubService.getUser("usuario_inexistente")
      expect(user).toBeNull()
      expect(console.error).toHaveBeenCalled()
    })

    it("getMyRepo: debería retornar la información básica filtrada del repositorio", async () => {
      const mockRepoData = { name: "ExamCraft", description: "TFG", html_url: "https://...", stargazers_count: 2 }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockRepoData)
      } as unknown as Response)

      const repo = await GithubService.getMyRepo("owner", "ExamCraft")
      expect(repo).toEqual(mockRepoData)
    })
  })

  describe("createRepoFromTemplate", () => {
    it("debería solicitar a GitHub la creación de un repo basado en una plantilla y retornar el JSON", async () => {
      const mockRepoResponse = { name: "nuevo-repo", html_url: "https://github.com/user/nuevo-repo" }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "application/json" },
        json: vi.fn().mockResolvedValueOnce(mockRepoResponse)
      } as unknown as Response)

      const response = await GithubService.createRepoFromTemplate("token", "template-owner", "template-repo", "nuevo-repo")
      
      expect(response).toEqual(mockRepoResponse)
      expect(response.html_url).toBe("https://github.com/user/nuevo-repo")
      expect(fetch).toHaveBeenCalledWith(
        "https://api.github.com/repos/template-owner/template-repo/generate",
        expect.objectContaining({ method: "POST" })
      )
    })
  })

  describe("createOrUpdateFile", () => {
    it("debería hacer un PUT directo si el archivo no existe previamente (404)", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 404 } as unknown as Response)
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({})
      } as unknown as Response)

      await GithubService.createOrUpdateFile("token", "owner", "repo", "src/Main.java", "public class Main {}", "Subiendo Main")
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it("debería incluir el SHA previo si el archivo ya existe para poder sobrescribirlo", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ sha: "sha-antiguo-123" })
      } as unknown as Response)
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({})
      } as unknown as Response)

      await GithubService.createOrUpdateFile("token", "owner", "repo", "src/Main.java", "public class Main {}", "Actualizando Main")
      
      const putCall = vi.mocked(fetch).mock.calls[1]
      const body = JSON.parse(putCall?.[1]?.body as string)
      expect(body.sha).toBe("sha-antiguo-123")
    })
  })

  describe("updateReadmeWithDescription Polling", () => {
    it("debería reintentar la descarga si el README devuelve 404 temporalmente y luego actualizarlo", async () => {
      const mockReadmeContent = "## Descripción control check a realizar\n*(Aquí puedes añadir los detalles o la lista de comprobaciones)*"
      const safeBase64 = btoa(unescape(encodeURIComponent(mockReadmeContent)))

      vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 404 } as unknown as Response)
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ content: safeBase64 })
      } as unknown as Response)
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ sha: "readme-sha-123" })
      } as unknown as Response)
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ content: { name: "README.md" } })
      } as unknown as Response)

      const updatePromise = GithubService.updateReadmeWithDescription("token", "owner", "repo", "Nueva descripción del examen")
      
      await vi.advanceTimersByTimeAsync(2000)
      await updatePromise

      expect(fetch).toHaveBeenCalledTimes(4)
    })
  })

  describe("deployExam Orchestration", () => {
    it("debería fallar de inmediato si la validación inicial del token es rechazada por GitHub", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 401 } as unknown as Response)

      await expect(
        GithubService.deployExam("token-invalido", {}, "repo", "owner", "template", "src/")
      ).rejects.toThrow("Token inválido o caducado")
    })

    it("debería ejecutar toda la secuencia de subidas (Readme, Tests, Clases base) con éxito", async () => {
      const safeReadmeBase64 = btoa(unescape(encodeURIComponent("## Descripción")))

      vi.mocked(fetch).mockResolvedValueOnce({ 
        ok: true, 
        json: vi.fn().mockResolvedValueOnce({ login: "profesor_user" }) 
      } as unknown as Response)

      vi.mocked(fetch).mockResolvedValueOnce({ 
        ok: true, 
        headers: { get: () => "application/json" }, 
        json: vi.fn().mockResolvedValueOnce({ html_url: "https://github.com/profesor_user/nuevo-examen" }) 
      } as unknown as Response)

      vi.mocked(fetch).mockResolvedValueOnce({ 
        ok: true, 
        json: vi.fn().mockResolvedValueOnce({ content: safeReadmeBase64 }) 
      } as unknown as Response)

      vi.mocked(fetch).mockResolvedValueOnce({ 
        ok: true, 
        json: vi.fn().mockResolvedValueOnce({ sha: "readme-initial-sha" }) 
      } as unknown as Response)

      vi.mocked(fetch).mockResolvedValueOnce({ 
        ok: true, 
        json: vi.fn().mockResolvedValueOnce({}) 
      } as unknown as Response)

      vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 404 } as unknown as Response) 

      vi.mocked(fetch).mockResolvedValueOnce({ 
        ok: true, 
        json: vi.fn().mockResolvedValueOnce({}) 
      } as unknown as Response)

      const fakeProject = {
        customName: "Examen Final",
        extensionStatement: "Ampliar la lógica de negocio",
        testPartsMap: {
          "Test.java": { fileName: "Test.java", code: "public class Test {}" }
        }
      }

      const deployPromise = GithubService.deployExam("token-valido", fakeProject, "nuevo-examen", "t-owner", "t-repo", "src/test/java/")
      
      await vi.advanceTimersByTimeAsync(2000)
      const urlResult = await deployPromise

      expect(urlResult).toBe("https://github.com/profesor_user/nuevo-examen")
      expect(fetch).toHaveBeenCalledTimes(7)
    })
  })
})