import React from "react"

import "./css/ConfirmModal.css"

interface ConfirmModalProps {
  title: string
  message: React.ReactNode
  warning?: React.ReactNode
  plainWarning?: boolean
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  warning,
  plainWarning = false,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar"
}) => (
  <div className="confirm-modal-overlay">
    <div className="content-card confirm-modal-card">
      <div className="success-modal-icon">⚠️</div>
      <h3 className="main-title small">{title}</h3>
      <div className={`sucess-modal-description ${warning ? "warning" : ""}`}>
        {message}
      </div>
      {warning && (
        <div
          className={`confirm-modal-warning ${plainWarning ? "confirm-modal-warning--plain" : ""}`}>
          {warning}
        </div>
      )}
      <div className="wf-actions-row confirm-modal-actions">
        <button onClick={onCancel} className="btn-step secondary">
          {cancelLabel}
        </button>
        <button onClick={onConfirm} className="btn-step primary">
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
)
