import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi, describe, it, expect, beforeEach } from "vitest"
import "@testing-library/jest-dom"
import * as jestDomMatchers from "@testing-library/jest-dom/matchers"

import { GitHubDeployModal } from "./GitHubDeployModal"

expect.extend(jestDomMatchers)

vi.mock("./ConfirmModal", () => ({
  ConfirmModal: ({ title, message, warning, onConfirm, onCancel, confirmLabel }: any) => (
    <div data-testid="confirm-modal-mock">
      <h2>{title}</h2>
      <div data-testid="modal-message">{message}</div>
      <div data-testid="modal-warning">{warning}</div>
      <button onClick={onCancel}>Cerrar</button>
      <button onClick={onConfirm}>{confirmLabel}</button>
    </div>
  )
}))

vi.mock("./SuccessModal", () => ({
  SuccessModal: ({ title, message, actions }: any) => (
    <div data-testid="success-modal-mock">
      <h2>{title}</h2>
      <p>{message}</p>
      {actions.map((action: any) => (
        <button key={action.label} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </div>
  )
}))

const defaultProps = {
  domainName: "test-domain",
  templateRepo: "test-template",
  newRepoName: "mi-nuevo-repo-2026",
  uploadListString: "- Index.md\n- Seccion1.md\n- Seccion2.md",
  savedToken: null,
  onConfirm: vi.fn().mockResolvedValue("https://github.com/user/repo"),
  onSuccess: vi.fn(),
  onClose: vi.fn()
}

describe("Integración: GitHubDeployModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.spyOn(window, "open").mockImplementation(() => null)
    
    vi.spyOn(localStorage, "setItem")
  })

  
  describe("Casos Positivos", () => {
    it("renderiza la vista inicial de confirmación con el nombre del repositorio y los elementos formateados", () => {
      render(<GitHubDeployModal {...defaultProps} />)

      expect(screen.getByRole("heading", { name: "CONFIRMAR SUBIDA A GITHUB" })).toBeInTheDocument()
      expect(screen.getByText("mi-nuevo-repo-2026")).toBeInTheDocument()
      
      
      expect(screen.getByText("Index.md")).toBeInTheDocument()
      expect(screen.getByText("Seccion1.md")).toBeInTheDocument()
    })

    it("muestra el campo para ingresar el Token si savedToken es null", () => {
      render(<GitHubDeployModal {...defaultProps} savedToken={null} />)

      expect(screen.getByText("Se requiere Token de GitHub:")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("ghp_xxxxxxxxxxxx")).toBeInTheDocument()
    })

    it("completa el despliegue exitosamente guardando el token y abriendo el repositorio en otra pestaña", async () => {
      render(<GitHubDeployModal {...defaultProps} />)

      const input = screen.getByPlaceholderText("ghp_xxxxxxxxxxxx")
      await userEvent.type(input, "ghp_mockToken123")

      await userEvent.click(screen.getByRole("button", { name: "Desplegar" }))

      await waitFor(() => {
        expect(defaultProps.onConfirm).toHaveBeenCalledWith("ghp_mockToken123")
        expect(localStorage.setItem).toHaveBeenCalledWith("github_token", "ghp_mockToken123")
        expect(window.open).toHaveBeenCalledWith("https://github.com/user/repo", "_blank")
        
        expect(screen.getByTestId("success-modal-mock")).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "¡Despliegue completado!" })).toBeInTheDocument()
      })
    })
  })

  describe("Casos Negativos", () => {
    it("no inicia el despliegue si el token ingresado está vacío o son solo espacios", async () => {
      render(<GitHubDeployModal {...defaultProps} />)

      const input = screen.getByPlaceholderText("ghp_xxxxxxxxxxxx")
      await userEvent.type(input, "   ")

      await userEvent.click(screen.getByRole("button", { name: "Desplegar" }))

      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
    })

    it("captura los errores del servidor/promesa y renderiza la pantalla de error correspondiente", async () => {
      const customProps = {
        ...defaultProps,
        onConfirm: vi.fn().mockRejectedValue(new Error("Token inválido o expirado"))
      }

      render(<GitHubDeployModal {...customProps} />)

      await userEvent.type(screen.getByPlaceholderText("ghp_xxxxxxxxxxxx"), "token_malo")
      await userEvent.click(screen.getByRole("button", { name: "Desplegar" }))

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "ERROR EN EL DESPLIEGUE" })).toBeInTheDocument()
        expect(screen.getByText(/No se pudo crear el repositorio: Token inválido o expirado/i)).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument()
      })
    })
  })

  describe("Casos Límite", () => {
    it("oculta el input de contraseña por completo si savedToken ya viene proveído", () => {
      render(<GitHubDeployModal {...defaultProps} savedToken="ghp_token_guardado" />)

      expect(screen.queryByPlaceholderText("ghp_xxxxxxxxxxxx")).not.toBeInTheDocument()
      expect(screen.queryByText("Se requiere Token de GitHub:")).not.toBeInTheDocument()
    })

    it("no intenta abrir una nueva pestaña si onConfirm devuelve una URL vacía", async () => {
      const customProps = {
        ...defaultProps,
        onConfirm: vi.fn().mockResolvedValue("")
      }

      render(<GitHubDeployModal {...customProps} savedToken="token" />)
      await userEvent.click(screen.getByRole("button", { name: "Desplegar" }))

      await waitFor(() => {
        expect(window.open).not.toHaveBeenCalled()
        expect(screen.getByTestId("success-modal-mock")).toBeInTheDocument()
      })
    })

    it("limpia líneas vacías o espacios rebeldes del string de subidas sin romper la lista", () => {
      render(
        <GitHubDeployModal 
          {...defaultProps} 
          uploadListString={`
            - ArchivoUno.md
            
            -    ArchivoDos.md
          `} 
        />
      )

      expect(screen.getByText("ArchivoUno.md")).toBeInTheDocument()
      expect(screen.getByText("ArchivoDos.md")).toBeInTheDocument()
    })

    it("utiliza el mensaje por defecto 'Error' si el objeto de error capturado no contiene la propiedad message (Línea 45)", async () => {
      const customProps = {
        ...defaultProps,
        onConfirm: vi.fn().mockRejectedValue({}) 
      }

      render(<GitHubDeployModal templateRepo={""} newRepoName={""} uploadListString={""} savedToken={""} {...customProps} />)

      await userEvent.type(screen.getByPlaceholderText("ghp_xxxxxxxxxxxx"), "token_prueba")
      await userEvent.click(screen.getByRole("button", { name: "Desplegar" }))

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "ERROR EN EL DESPLIEGUE" })).toBeInTheDocument()
        expect(screen.getByText(/No se pudo crear el repositorio: Error/i)).toBeInTheDocument()
      })
    })
  })

  describe("Flujo Completo", () => {
    it("flujo completo: inicia error, reintenta cambiando token, avanza a éxito y finaliza el flujo", async () => {
      let debeFallar = true
      const dynamicConfirm = vi.fn().mockImplementation(() => {
        if (debeFallar) return Promise.reject(new Error("Error de Red"))
        return Promise.resolve("https://github.com/exito")
      })

      render(<GitHubDeployModal {...defaultProps} onConfirm={dynamicConfirm} />)

      await userEvent.type(screen.getByPlaceholderText("ghp_xxxxxxxxxxxx"), "token_incorrecto")
      await userEvent.click(screen.getByRole("button", { name: "Desplegar" }))

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "ERROR EN EL DESPLIEGUE" })).toBeInTheDocument()
      })

      debeFallar = false
      await userEvent.click(screen.getByRole("button", { name: "Reintentar" }))
      
      expect(screen.getByRole("heading", { name: "CONFIRMAR SUBIDA A GITHUB" })).toBeInTheDocument()

      await userEvent.click(screen.getByRole("button", { name: "Desplegar" }))

      await waitFor(() => {
        expect(screen.getByTestId("success-modal-mock")).toBeInTheDocument()
      })
      
      await userEvent.click(screen.getByRole("button", { name: "Vale" }))
      expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1)
    })
  })
})