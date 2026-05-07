import React, { useState } from "react"
import { ConfirmModal } from "./ConfirmModal"
import { SuccessModal } from "./SuccessModal"

interface GitHubDeployModalProps {
  domainName: string
  templateRepo: string
  newRepoName: string
  uploadListString: string
  savedToken: string | null
  onConfirm: (token: string) => Promise<string> // devuelve la URL del repo creado
  onSuccess: () => void
  onClose: () => void
}

type DeployState =
  | { type: "confirm" }
  | { type: "loading" }
  | { type: "success"; repoUrl: string }
  | { type: "error"; message: string }

export const GitHubDeployModal: React.FC<GitHubDeployModalProps> = ({
  domainName,
  templateRepo,
  newRepoName,
  uploadListString,
  savedToken,
  onConfirm,
  onSuccess,
  onClose,
}) => {
  const [deployState, setDeployState] = useState<DeployState>({ type: "confirm" })
  const [token, setToken] = useState(savedToken ?? "")

  const handleConfirm = async () => {
    if (!token.trim()) return
    setDeployState({ type: "loading" })
    try {
      const repoUrl = await onConfirm(token.trim())
      setDeployState({ type: "success", repoUrl })
    } catch (error: any) {
      setDeployState({
        type: "error",
        message: error?.message ?? "No se pudo crear el repositorio.",
      })
    }
  }

  if (deployState.type === "success") {
    return (
      <SuccessModal
        title="¡Repositorio creado con éxito!"
        message={`El repositorio ${newRepoName} ha sido creado y todos los archivos subidos correctamente.`}
        actions={[
          { label: "Abrir repositorio", onClick: () => globalThis.open(deployState.repoUrl, "_blank"), variant: "secondary" },
          { label: "Ir al inicio", onClick: onSuccess, variant: "primary" },
        ]}
      />
    )
  }

  if (deployState.type === "error") {
    return (
      <ConfirmModal
        title="Error al crear el repositorio"
        message={deployState.message}
        onConfirm={() => setDeployState({ type: "confirm" })}
        onCancel={onClose}
        confirmLabel="Reintentar"
        cancelLabel="Cerrar"
      />
    )
  }

  return (
    <ConfirmModal
      title="Confirmar subida a GitHub"
      message={
        `Dominio: ${domainName}\n` +
        `Plantilla: lidiafc8/${templateRepo}\n` +
        `Nuevo repo: ${newRepoName}\n\n` +
        `Se subirán:\n${uploadListString}`
      }
      warning={
        !savedToken ? (
          <input
            type="password"
            className="wf-input"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Introduce tu token de GitHub"
            autoFocus
          />
        ) : null
      }
      onConfirm={handleConfirm}
      onCancel={onClose}
      confirmLabel={deployState.type === "loading" ? "Creando..." : "Confirmar"}
      cancelLabel="Cancelar"
    />
  )
}