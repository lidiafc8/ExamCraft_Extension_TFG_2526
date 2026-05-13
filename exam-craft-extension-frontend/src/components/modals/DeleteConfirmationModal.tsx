import React from "react";
import "./css/DeleteConfirmationModal.css";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  itemName: string;
  isExam?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  itemName,
  isExam,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-card">
        <div className="delete-modal-icon-wrapper">
          <div className="delete-modal-icon">!</div>
        </div>

        <h2 className="delete-modal-title">Confirmar Acción</h2>

        <p className="delete-modal-message">
          ¿Deseas eliminar {isExam ? "el examen" : "la sección"} <strong>"{itemName}"</strong>?{" "}
          <br />
          <span className="delete-modal-warning">Esta acción no se puede deshacer.</span>
        </p>

        <div className="delete-modal-actions">
          <button type="button" onClick={onCancel} className="delete-modal-btn-cancel">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} className="delete-modal-btn-confirm">
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
};