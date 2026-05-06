interface WarningModalProps {
  title: string
  message: React.ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export const WarningModal: React.FC<WarningModalProps> = ({
  title, message, confirmLabel, cancelLabel = "Cancelar", onConfirm, onCancel
}) => (
  <div className="confirm-modal-overlay">
    <div className="content-card confirm-modal-card">
      <div className="success-modal-icon">⚠️</div>
      <h3 className="main-title small">{title}</h3>
      <p className="sucess-modal-description">{message}</p>
      <div className="wf-actions-row confirm-modal-actions">
        <button onClick={onCancel} className="btn-step secondary">{cancelLabel}</button>
        <button onClick={onConfirm} className="btn-step primary">{confirmLabel}</button>
      </div>
    </div>
  </div>
)