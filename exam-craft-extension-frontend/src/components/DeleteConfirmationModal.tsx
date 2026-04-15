import React from "react";

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
    onCancel 
}) => {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '30px', maxWidth: '450px', width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fff1f0', color: '#ff4d4f', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', border: '2px solid #ffa39e' }}>
                        !
                    </div>
                </div>
                
                <h2 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '22px' }}>Confirmar Acción</h2>
                
                <p style={{ color: '#555', lineHeight: '1.6', margin: '0 0 25px 0', fontSize: '16px' }}>
                    ¿Deseas eliminar {isExam ? 'el examen' : 'la sección'} <strong>"{itemName}"</strong>? <br />
                    <span style={{ fontSize: '14px', color: '#888' }}>Esta acción no se puede deshacer.</span>
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #d9d9d9', backgroundColor: '#fff', color: '#333', cursor: 'pointer', fontWeight: 'bold', flex: 1, transition: 'all 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        onClick={onConfirm} 
                        style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#ff4d4f', color: '#fff', cursor: 'pointer', fontWeight: 'bold', flex: 1, transition: 'all 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d9363e'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff4d4f'}
                    >
                        Sí, eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};