import React, { useState } from "react";
import 'highlight.js/styles/github.css';
import { Header } from "~src/components/Header";
import { parseJavaFiles } from "~src/utils/codeUtils";
import { JavaCodeBlock } from "~src/components/JavaCodeBlock";
import { DeleteConfirmationModal } from "~src/components/modals/DeleteConfirmationModal";
import "./css/StorageScreen.css";

export interface VisualSolutionCodeScreenProps {
    selectedProject: any;
    selectedDomainFolder: string;
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
    onDeleteSection,
}) => {
    const [sectionToDelete, setSectionToDelete] = useState<{ key: string; name: string } | null>(null);
    
    const parsedFullSolution = parseJavaFiles(
        selectedProject?.fullSolution || ''
    );

    const breadcrumbItems = [
        { label: 'INICIO',              action: onWelcome },
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
        <div>
            <Header
                onWelcome={onWelcome}
                breadcrumbItems={breadcrumbItems}
                currentStep="CÓDIGO SOLUCIÓN"
            />
            <div className="main-content">
                <main className="storage-main">

                    <div className="storage-section-heading">
                        <h2>Solución Completa </h2>
                        {parsedFullSolution.length > 0 && (
                            <button
                                type="button"
                                className="storage-delete-btn"
                                onClick={() => setSectionToDelete({
                                    key: 'fullSolution',
                                    name: 'Solución Completa',
                                })}
                                title="Eliminar Solución Completa"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                        <div className="wide-card">
                            <div className="card-header">
                                <h3>Archivos de Solución</h3>
                            </div>
                            <div className="content-card">
                                {parsedFullSolution.length > 0 ? (
                                    parsedFullSolution.map((block) => (
                                        <JavaCodeBlock
                                            key={block.filename}
                                            filename={block.filename}
                                            code={block.code}
                                        />
                                    ))
                                ) : (
                                    <p className="storage-empty-state">
                                        Aún no se ha generado una solución completa para este examen.
                                    </p>
                                )}
                            </div>
                    </div> 
                    
                    <div className="storage-bottom-actions">
                        <button type="button" onClick={onBack} className="btn-back">
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
        </div>
    );
};