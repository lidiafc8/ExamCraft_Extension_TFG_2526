import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { beforeEach, describe, expect, test, vi } from "vitest"

import "@testing-library/jest-dom"

import GithubScreen from "./GithubScreen"

vi.mock("~src/components/Header", () => ({
  Header: ({ currentStep }: any) => (
    <div data-testid="header">{currentStep}</div>
  )
}))

const mockGetUser = vi.fn()
const mockGetMyRepo = vi.fn()

vi.mock("../../services/githubService", () => ({
  GithubService: {
    getUser: (username: string) => mockGetUser(username),
    getMyRepo: (username: string, repo: string) => mockGetMyRepo(username, repo)
  }
}))

const defaultProps = {
  onBack: vi.fn()
}

describe("GithubScreen - Integration Tests Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("Debería mostrar la interfaz de carga mientras se obtienen los datos de la API de GitHub", () => {
    mockGetUser.mockReturnValue(new Promise(() => {}))
    mockGetMyRepo.mockReturnValue(new Promise(() => {}))

    render(<GithubScreen {...defaultProps} />)

    expect(screen.getByTestId("header")).toHaveTextContent("GITHUB INFO")
    expect(
      screen.getByText("Obteniendo datos de GitHub...")
    ).toBeInTheDocument()
    expect(screen.queryByText("Proyecto Actual")).not.toBeInTheDocument()
  })

  test("Debería renderizar los perfiles del equipo y la información del repositorio al resolver las peticiones", async () => {
    const mockLidiaData = {
      login: "lidiafc8",
      avatar_url: "https://avatar.lidia.com",
      public_repos: 12
    }
    const mockMariaData = {
      login: "mery16q",
      avatar_url: "https://avatar.maria.com",
      public_repos: 8
    }
    const mockRepoData = {
      name: "ExamCraft_Extension_TFG_2526",
      description: "Extensión para la generación de exámenes",
      stargazers_count: 5,
      html_url: "https://github.com/lidiafc8/ExamCraft_Extension_TFG_2526"
    }

    mockGetUser
      .mockResolvedValueOnce(mockLidiaData)
      .mockResolvedValueOnce(mockMariaData)
    mockGetMyRepo.mockResolvedValueOnce(mockRepoData)

    render(<GithubScreen {...defaultProps} />)

    await waitFor(() => {
      expect(
        screen.queryByText("Obteniendo datos de GitHub...")
      ).not.toBeInTheDocument()
    })

    expect(mockGetUser).toHaveBeenCalledWith("lidiafc8")
    expect(mockGetUser).toHaveBeenCalledWith("mery16q")
    expect(mockGetMyRepo).toHaveBeenCalledWith(
      "lidiafc8",
      "ExamCraft_Extension_TFG_2526"
    )

    expect(screen.getByText("lidiafc8")).toBeInTheDocument()
    expect(screen.getByText("Repos: 12")).toBeInTheDocument()
    const avatarLidia = screen.getByAltText("Lidia")
    expect(avatarLidia).toHaveAttribute("src", "https://avatar.lidia.com")

    expect(screen.getByText("mery16q")).toBeInTheDocument()
    expect(screen.getByText("Repos: 8")).toBeInTheDocument()
    const avatarMaria = screen.getByAltText("Maria")
    expect(avatarMaria).toHaveAttribute("src", "https://avatar.maria.com")

    expect(screen.getByText("Proyecto Actual")).toBeInTheDocument()
    expect(screen.getByText("ExamCraft_Extension_TFG_2526")).toBeInTheDocument()
    expect(
      screen.getByText('"Extensión para la generación de exámenes"')
    ).toBeInTheDocument()
    expect(screen.getByText("⭐ Estrellas: 5")).toBeInTheDocument()

    const linkGithub = screen.getByRole("link", { name: /Ver en GitHub/i })
    expect(linkGithub).toHaveAttribute(
      "href",
      "https://github.com/lidiafc8/ExamCraft_Extension_TFG_2526"
    )
    expect(linkGithub).toHaveAttribute("target", "_blank")
  })

  test("Debería manejar de manera segura los errores de la API sin romper el renderizado", async () => {
    mockGetUser.mockRejectedValue(new Error("GitHub API Error"))
    mockGetMyRepo.mockRejectedValue(new Error("GitHub API Error"))

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    render(<GithubScreen {...defaultProps} />)

    await waitFor(() => {
      expect(
        screen.queryByText("Obteniendo datos de GitHub...")
      ).not.toBeInTheDocument()
    })

    expect(screen.getAllByText("Cargando...")).toHaveLength(2)
    expect(screen.queryByText("Proyecto Actual")).not.toBeInTheDocument()
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error cargando datos",
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  test("Debería activar el callback onBack al presionar el botón 'Volver'", async () => {
    mockGetUser.mockResolvedValue({
      login: "user",
      avatar_url: "",
      public_repos: 0
    })
    mockGetMyRepo.mockResolvedValue({
      name: "repo",
      description: "",
      stargazers_count: 0,
      html_url: ""
    })

    render(<GithubScreen {...defaultProps} />)

    const backBtn = screen.getByRole("button", { name: /Volver/i })
    fireEvent.click(backBtn)

    expect(defaultProps.onBack).toHaveBeenCalledTimes(1)
  })

  test("Debería mostrar el texto de contingencia del TFG si el repo no tiene descripción", async () => {
    const mockRepoSinDesc = {
      name: "ExamCraft_Extension_TFG_2526",
      description: null,
      stargazers_count: 0,
      html_url: "https://github.com"
    }

    mockGetUser.mockResolvedValue({
      login: "user",
      avatar_url: "",
      public_repos: 0
    })
    mockGetMyRepo.mockResolvedValueOnce(mockRepoSinDesc)

    render(<GithubScreen {...defaultProps} />)

    await waitFor(() => {
      expect(
        screen.queryByText("Obteniendo datos de GitHub...")
      ).not.toBeInTheDocument()
    })

    expect(screen.getByText(/TFG Universidad de Sevilla/i)).toBeInTheDocument()
  })
})
