import React, { useState } from "react";
import 'highlight.js/styles/github.css';
import { Header } from "~src/components/Header";
import { parseJavaFiles } from "~src/utils/codeUtils";
import { JavaCodeBlock } from "~src/components/JavaCodeBlock";
import { DeleteConfirmationModal } from "~src/components/DeleteConfirmationModal";

export interface VisualSolutionCodeScreenProps {
    selectedProject: any;
    selectedDomainFolder: string;
    logoExamCraft: string;
    onWelcome: () => void;
    onBack: () => void;
    onGoToExams: () => void;
    onGoToFolders: () => void;
    onDeleteSection: (sectionKey: string) => void;
}

export const VisualSolutionCodeScreen: React.FC<VisualSolutionCodeScreenProps> = ({
    selectedProject,
    selectedDomainFolder,
    onWelcome,
    onBack,
    onGoToExams,
    onGoToFolders,
    onDeleteSection
}) => {
    const [sectionToDelete, setSectionToDelete] = useState<{ key: string, name: string } | null>(null);
    
    const parsedAttributesConstraintsSolution = parseJavaFiles(selectedProject?.attributeConstraintsSolution || '');

    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'EXÁMENES ANTERIORES', action: onGoToFolders },
        { label: selectedDomainFolder?.toUpperCase(), action: onGoToExams },
        { label: selectedProject?.customName || `Examen de ${selectedProject?.domainName}`, action: onBack },
    ];

    const confirmDelete = () => {
        if (sectionToDelete) {
            onDeleteSection(sectionToDelete.key);
            setSectionToDelete(null);
        }
    };

    return (
        <div className="exam-app" style={{ minHeight: '100vh', height: 'auto', overflow: 'visible', display: 'flex', flexDirection: 'column' }}>
            <Header onWelcome={onWelcome} breadcrumbItems={breadcrumbItems} currentStep="CÓDIGO SOLUCIÓN" />

            <main className="main-content" style={{ padding: '30px', paddingBottom: '100px', height: 'auto', overflow: 'visible', flex: 1 }}>
                
                {/* SECCIÓN: SOLUCIÓN DE RESTRICCIONES DE ATRIBUTOS */}
                <div className="section-block" style={{ marginBottom: '1px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #b08968', paddingBottom: '10px' }}>
                    <h2 style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '0' }}>
                        Solución de Restricciones de Atributos
                    </h2>
                    {parsedAttributesConstraintsSolution.length > 0 && (
                        <button 
                            type="button" 
                            onClick={() => setSectionToDelete({ key: 'attributeConstraintsSolution', name: 'Solución de Restricciones de Atributos' })} 
                            style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', padding: '0 5px' }} 
                            title="Eliminar Solución de Restricciones de Atributos"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="section-block" style={{ width: '200%', marginBottom: '40px' }}>
                    <div className="content-card" style={{ padding: '20px' }}>
                        {parsedAttributesConstraintsSolution.length > 0 ? (
                            parsedAttributesConstraintsSolution.map((block) => (
                                <JavaCodeBlock key={block.filename} filename={block.filename} code={block.code} />
                            ))
                        ) : (
                            <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', margin: '30px 0' }}>
                                Aún no se han generado la solución del ejercicio "Restricciones de Atributos" para este examen.
                            </p>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    <button onClick={onBack} className="btn-back" style={{ position: 'relative', margin: 0 }}>
                        Volver
                    </button>
                </div>

                <DeleteConfirmationModal 
                    isOpen={!!sectionToDelete}
                    itemName={sectionToDelete?.name || ''}
                    onConfirm={confirmDelete}
                    onCancel={() => setSectionToDelete(null)}
                />
                
            </main>
        </div>
    );
};