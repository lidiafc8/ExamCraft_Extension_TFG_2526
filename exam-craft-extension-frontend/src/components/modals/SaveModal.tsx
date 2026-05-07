import React, { useState } from "react"
import { ConfirmModal } from "./ConfirmModal"
import { SuccessModal } from "./SuccessModal"
import { saveToChrome } from "~src/utils/chromeStorageUtils"

interface SaveModalProps {
  domainName: string
  onSuccess: () => void
  onClose: () => void
  buildPayload: (finalName: string) => Record<string, any>
  existingKey?: string
}

type SaveState =
  | { type: "prompt" }
  | { type: "success"; savedName: string }
  | { type: "error"; message: string }

export const SaveModal: React.FC<SaveModalProps> = ({
  domainName,
  onSuccess,
  onClose,
  buildPayload,
  existingKey,
}) => {
  const defaultName = `Examen de ${domainName}`
  const [saveState, setSaveState] = useState<SaveState>({ type: "prompt" })
  const [draftName, setDraftName] = useState(defaultName)

  const handleConfirm = async () => {
    const finalName = draftName.trim() || defaultName
    const key = existingKey ?? `project_${Date.now()}`
    try {
      await saveToChrome(key, buildPayload(finalName))
      setSaveState({ type: "success", savedName: finalName })
    } catch (error) {
      setSaveState({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo guardar.",
      })
    }
  }

  if (saveState.type === "success") {
    return (
      <SuccessModal
        title="¡Guardado con éxito!"
        message={`El examen "${saveState.savedName}" se ha guardado correctamente.`}
        actions={[
          { label: "Ir al inicio", onClick: onSuccess, variant: "primary" },
          { label: "Cerrar", onClick: onClose, variant: "secondary" },
        ]}
      />
    )
  }

  if (saveState.type === "error") {
    return (
      <ConfirmModal
        title="Error al guardar"
        message={saveState.message}
        onConfirm={() => setSaveState({ type: "prompt" })}
        onCancel={onClose}
        confirmLabel="Reintentar"
        cancelLabel="Cerrar"
      />
    )
  }

  return (
    <ConfirmModal
      title="Guardar examen"
      message="¿Con qué nombre quieres guardar este examen?"
      warning={
        <input
          type="text"
          className="wf-input"
          value={draftName}
          onChange={e => setDraftName(e.target.value)}
          placeholder={defaultName}
          autoFocus
        />
      }
      onConfirm={handleConfirm}
      onCancel={onClose}
      confirmLabel="Guardar"
      cancelLabel="Cancelar"
    />
  )
}