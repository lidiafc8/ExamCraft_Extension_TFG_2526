import React, { useState, useEffect } from "react"
import { ConfirmModal } from "./ConfirmModal"
import { SuccessModal } from "./SuccessModal"
import { saveToChrome } from "~src/utils/chromeStorageUtils"

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

  const handleConfirm = async (nameOverride?: string) => {
    const finalName = nameOverride ?? (draftName.trim() || defaultName)
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

  useEffect(() => {
    if (skipPrompt) {
      handleConfirm(domainName)
    }
  }, [])

  if (saveState.type === "success") {
    return (
      <SuccessModal
        title="¡Guardado con éxito!"
        message={successMessage ?? `El examen "${saveState.savedName}" se ha guardado correctamente.`}
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
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
          <label style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#8a7060",
          }}>
            Nombre del examen
          </label>
          <div style={{ position: "relative", width: "100%" }}>
            <span style={{
              position: "absolute",
              left: "13px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "15px",
              color: focused ? "#5c3d2e" : "#b09080",
              transition: "color 0.2s ease",
              pointerEvents: "none",
              userSelect: "none",
            }}>
              ✏️
            </span>
            <input
              type="text"
              value={draftName}
              onChange={e => setDraftName(e.target.value)}
              placeholder={defaultName}
              autoFocus
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 16px 13px 40px",
                fontSize: "15px",
                fontWeight: 500,
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: "#2c1a0e",
                background: focused ? "#fff" : "#fdf8f4",
                border: `2px solid ${focused ? "#5c3d2e" : "#d4b8a8"}`,
                borderRadius: "10px",
                outline: "none",
                transition: "all 0.2s ease",
                boxShadow: focused
                  ? "0 0 0 4px rgba(92, 61, 46, 0.12), 0 2px 8px rgba(92, 61, 46, 0.08)"
                  : "0 1px 3px rgba(0,0,0,0.06)",
              }}
            />
            <div style={{
              position: "absolute",
              bottom: 0,
              left: "10px",
              right: "10px",
              height: "2px",
              background: "linear-gradient(90deg, #8b5e3c, #c8956c)",
              borderRadius: "0 0 8px 8px",
              opacity: focused ? 1 : 0,
              transition: "opacity 0.2s ease",
            }} />
          </div>
          {draftName.trim() === "" && (
            <p style={{
              margin: 0,
              fontSize: "11px",
              color: "#c0756a",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}>
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