import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import { GithubService } from "../../services/githubService"
import GithubScreen from "./GithubScreen"

expect.extend(jestDomMatchers)

vi.mock("~src/components/Header", () => ({
  Header: ({ currentStep, onWelcome }: any) => (
    <header data-testid="mock-header">
      <h1>{currentStep}</h1>
      <button onClick={onWelcome}>Inicio Global</button>
    </header>
  )
}))

vi.mock("../../services/githubService", () => ({
  GithubService: {
    getUser: vi.fn(),
    getMyRepo: vi.fn()
  }
}))

describe("GithubScreen", () => {
  const baseProps = {
    onBack: vi.fn()
  }

  const mockLidiaData = {
    login: "lidiafc8",
    avatar_url: "https://github.com/lidiafc8.png",
    public_repos: 15,
    bio: "Desarrolladora apasionada por el software educativo."
  }

  const mockMariaData = {
    login: "mery16q",
    avatar_url: "https://github.com/mery16q.png",
    public_repos: 22,
    bio: "Entusiasta de la tecnología y colaboradora en proyectos open source."
  }

  const mockRepoData = {
    name: "ExamCraft_Extension_TFG_2526",
    description: "Repositorio oficial del proyecto de extensión",
    stargazers_count: 5,
    html_url: "https://github.com/lidiafc8/ExamCraft_Extension_TFG_2526"
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Fase de Carga e Interfaz Límite (Loading)", () => {
    it("muestra el mensaje de carga inicial y oculta la estructura de perfiles antes de resolver las promesas", async () => {
      vi.mocked(GithubService.getUser).mockReturnValue(new Promise(() => {}))
      vi.mocked(GithubService.getMyRepo).mockReturnValue(new Promise(() => {}))

      render(<GithubScreen {...baseProps} />)

      expect(
        screen.getByText("Obteniendo datos de GitHub...")
      ).toBeInTheDocument()

      expect(screen.queryByText("lidiafc8")).not.toBeInTheDocument()
      expect(screen.queryByText("Proyecto Actual")).not.toBeInTheDocument()
    })
  })

  describe("Casos Positivos y Renderizado Exitoso", () => {
    beforeEach(() => {
      vi.mocked(GithubService.getUser)
        .mockResolvedValueOnce(mockLidiaData)
        .mockResolvedValueOnce(mockMariaData)
      vi.mocked(GithubService.getMyRepo).mockResolvedValue(mockRepoData)
    })

    it("renderiza toda la información de perfiles y repositorio tras resolver las promesas", async () => {
      render(<GithubScreen {...baseProps} />)

      await waitFor(() => {
        expect(
          screen.queryByText("Obteniendo datos de GitHub...")
        ).not.toBeInTheDocument()
      })

      expect(screen.getByText("lidiafc8")).toBeInTheDocument()
      expect(screen.getByText("Repos: 15")).toBeInTheDocument()
      const imgLidia = screen.getByAltText("Lidia") as HTMLImageElement
      expect(imgLidia.src).toBe(mockLidiaData.avatar_url)

      expect(screen.getByText("mery16q")).toBeInTheDocument()
      expect(screen.getByText("Repos: 22")).toBeInTheDocument()
      const imgMaria = screen.getByAltText("Maria") as HTMLImageElement
      expect(imgMaria.src).toBe(mockMariaData.avatar_url)

      expect(screen.getByText("Proyecto Actual")).toBeInTheDocument()
      expect(screen.getByText(mockRepoData.name)).toBeInTheDocument()
      expect(
        screen.getByText(`"${mockRepoData.description}"`)
      ).toBeInTheDocument()
      expect(screen.getByText("⭐ Estrellas: 5")).toBeInTheDocument()

      const link = screen.getByRole("link", {
        name: /Ver en GitHub/i
      }) as HTMLAnchorElement
      expect(link.href).toBe(mockRepoData.html_url)
      expect(link.target).toBe("_blank")
      expect(link.rel).toBe("noopener noreferrer")
    })

    it("vuelve a la pantalla anterior al pulsar cualquiera de los botones de navegación (Header u onBack)", async () => {
      render(<GithubScreen {...baseProps} />)

      const btnBack = screen.getByRole("button", { name: "Volver" })
      await userEvent.click(btnBack)
      expect(baseProps.onBack).toHaveBeenCalledTimes(1)

      const btnHeader = screen.getByRole("button", { name: "Inicio Global" })
      await userEvent.click(btnHeader)
      expect(baseProps.onBack).toHaveBeenCalledTimes(2)
    })
  })

  describe("Casos Negativos y Fallbacks Especiales", () => {
    it("atrapa los errores de la API mediante el bloque catch sin romper la interfaz de usuario", async () => {
      const spyConsoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})
      vi.mocked(GithubService.getUser).mockRejectedValue(
        new Error("API Rate Limit Error")
      )
      vi.mocked(GithubService.getMyRepo).mockRejectedValue(
        new Error("Network Error")
      )

      render(<GithubScreen {...baseProps} />)

      await waitFor(() => {
        expect(
          screen.queryByText("Obteniendo datos de GitHub...")
        ).not.toBeInTheDocument()
      })
      expect(spyConsoleError).toHaveBeenCalledWith(
        "Error cargando datos",
        expect.any(Error)
      )

      const fallbacks = screen.getAllByRole("heading", { level: 3 })
      expect(fallbacks).toHaveLength(2)
      expect(fallbacks[0].textContent).toBe("Cargando...")

      expect(screen.queryByText("Proyecto Actual")).not.toBeInTheDocument()

      spyConsoleError.mockRestore()
    })

    it("evalúa el fallback de texto para la descripción del repositorio cuando este viene falsy o vacío", async () => {
      vi.mocked(GithubService.getUser)
        .mockResolvedValueOnce(mockLidiaData)
        .mockResolvedValueOnce(mockMariaData)

      const mockRepoSinDescripcion = {
        ...mockRepoData,
        description: ""
      }
      vi.mocked(GithubService.getMyRepo).mockResolvedValue(
        mockRepoSinDescripcion
      )

      render(<GithubScreen {...baseProps} />)

      await waitFor(() => {
        expect(
          screen.queryByText("Obteniendo datos de GitHub...")
        ).not.toBeInTheDocument()
      })

      expect(
        screen.getByText(`"TFG Universidad de Sevilla"`)
      ).toBeInTheDocument()
    })
  })
})
