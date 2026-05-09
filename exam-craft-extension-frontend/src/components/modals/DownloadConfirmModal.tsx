import React, { useState, useEffect } from "react";
import "./css/ConfirmModal.css";

interface DownloadConfirmModalProps {
  isOpen: boolean;
  onConfirm: (fileName: string) => void;
  onCancel: () => void;
  defaultFileName: string;
}

export const DownloadConfirmModal: React.FC<DownloadConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  defaultFileName,
}) => {
  const [fileName, setFileName] = useState("");

  // Inicializar el input con el nombre sugerido cuando se abre
  useEffect(() => {
    if (isOpen) {
      setFileName(defaultFileName.replace(/\s+/g, '_'));
    }
  }, [isOpen, defaultFileName]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const finalName = fileName.trim() || defaultFileName;
    onConfirm(finalName);
  };

  return (
    <div className="confirm-modal-overlay">
      <div className="content-card confirm-modal-card">
        <div className="success-modal-icon" style={{ color: '#2196f3' }}>📥</div>
        
        <h3 className="main-title small">Nombre del archivo</h3>
        
        <p className="sucess-modal-description">
          ¿Cómo quieres llamar al archivo Markdown?
        </p>

        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            className="wf-input"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="nombre_archivo"
            autoFocus
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '15px',
              outline: 'none'
            }}
          />
        </div>
        
        <div className="confirm-modal-warning" style={{ fontSize: '12px' }}>
          El archivo se descargará con la extensión <strong>.md</strong> automáticamente.
        </div>

        <div className="wf-actions-row confirm-modal-actions">
          <button onClick={onCancel} className="btn-step secondary">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="btn-step primary">
            Descargar (.md)
          </button>
        </div>
      </div>
    </div>
  );
};