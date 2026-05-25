import React from "react"

import "./css/SuccessModal.css"

interface SuccessModalAction {
  label: string
  onClick: () => void
  variant?: "primary" | "secondary"
}

interface SuccessModalProps {
  title: string
  message: string
  actions: SuccessModalAction[]
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  title,
  message,
  actions
}) => (
  <div className="success-modal-overlay">
    <div className="content-card success-modal-card">
      <div className="success-modal-icon">✅</div>
      <h3 className="main-title small">{title}</h3>
      <p className="sucess-modal-description ">{message}</p>
      <div className="success-modal-actions">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`btn-step ${action.variant === "secondary" ? "secondary" : "primary"}`}>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  </div>
)
