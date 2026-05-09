import React, { useState, useEffect } from "react"
import { ConfirmModal } from "./ConfirmModal"
import { SuccessModal } from "./SuccessModal"
import { saveToChrome, getAllFromChrome } from "~src/utils/chromeStorageUtils"
import "./css/SaveModal.css"

interface SaveModalProps {
  domainName: string
  onSuccess: () => void
  onClose: () => void
  buildPayload: (finalName: string) => Record<string, any>
  existingKey?: string
  skipPrompt?: boolean
  successMessage?: string
  successAction?: string
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
  skipPrompt = false,
  successMessage,
  successAction = "Volver al inicio",
}) => {
  const defaultName = `Examen de ${domainName}`
  const [saveState, setSaveState] = useState<SaveState>({ type: "prompt" })
  const [draftName, setDraftName] = useState(defaultName)
  const [focused, setFocused] = useState(false)
  const [duplicateError, setDuplicateError] = useState(false)

  const checkDuplicate = async (finalName: string): Promise<boolean> => {
    try {
      const allItems = await getAllFromChrome()
      return allItems.some(item => {
        if (existingKey && item._key === existingKey) return false
        return (
          item.domainName === domainName &&
          item.customName?.trim().toLowerCase() === finalName.trim().toLowerCase()
        )
      })
    } catch {
      return false
    }
  }

  const handleConfirm = async (nameOverride?: string) => {
    const finalName = nameOverride ?? (draftName.trim() || defaultName)

    const isDuplicate = await checkDuplicate(finalName)
    if (isDuplicate) {
      setDuplicateError(true)
      return
    }

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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraftName(e.target.value)
    if (duplicateError) setDuplicateError(false)
  }

  useEffect(() => {
    if (skipPrompt) {
      handleConfirm(domainName)
    }
  }, [])

  if (saveState.type === "success") {
    return (
      <SuccessModal
        title="¡Guardado con éxito!"
        message={
          successMessage ??
          `El examen "${saveState.savedName}" se ha guardado correctamente.`
        }
        actions={[
          { label: successAction, onClick: onSuccess, variant: "primary" },
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

  if (skipPrompt) return null

  return (
    <ConfirmModal
      title="Guardar examen"
      message="¿Con qué nombre quieres guardar este examen?"
      plainWarning
      warning={
        <div className="save-modal-input-wrapper">
          <label className="save-modal-label">Nombre del examen</label>
          <div className="save-modal-input-container">
            <span
              className={`save-modal-input-icon ${
                focused ? "save-modal-input-icon--focused" : ""
              }`}
            >
              ✏️
            </span>
            <input
              type="text"
              className={`save-modal-input ${
                focused ? "save-modal-input--focused" : ""
              } ${duplicateError ? "save-modal-input--error" : ""}`}
              value={draftName}
              onChange={handleNameChange}
              placeholder={defaultName}
              autoFocus
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            <div
              className={`save-modal-input-underline ${
                focused ? "save-modal-input-underline--focused" : ""
              } ${duplicateError ? "save-modal-input-underline--error" : ""}`}
            />
          </div>
          {duplicateError && (
            <p className="save-modal-duplicate-error">
              ❌ Ya existe un examen con ese nombre en "{domainName}". Elige otro.
            </p>
          )}
          {!duplicateError && draftName.trim() === "" && (
            <p className="save-modal-empty-warning">
              ⚠️ Se usará el nombre por defecto si se deja vacío
            </p>
          )}
        </div>
      }
      onConfirm={() => handleConfirm()}
      onCancel={onClose}
      confirmLabel="Guardar"
      cancelLabel="Cancelar"
    />
  )
}