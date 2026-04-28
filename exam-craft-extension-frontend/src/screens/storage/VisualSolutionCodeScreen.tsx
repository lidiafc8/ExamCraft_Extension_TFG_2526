import React, { useState } from "react";
import 'highlight.js/styles/github.css';
import { Header } from "~src/components/Header";
import { parseJavaFiles } from "~src/utils/codeUtils";
import { JavaCodeBlock } from "~src/components/JavaCodeBlock";
import { DeleteConfirmationModal } from "~src/components/DeleteConfirmationModal";
import "./css/StorageScreen.css";

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
    onDeleteSection,
}) => {
    const [sectionToDelete, setSectionToDelete] = useState<{ key: string; name: string } | null>(null);

    const parsedAttributesConstraintsSolution = parseJavaFiles(
        selectedProject?.attributeConstraintsSolution || ''
    );

    const parsedEntityRelationshipsSolution = parseJavaFiles(
        selectedProject?.entityRelationshipsSolution || ''
    );

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
        <div className="storage-page">
            <Header
                onWelcome={onWelcome}
                breadcrumbItems={breadcrumbItems}
                currentStep="CÓDIGO SOLUCIÓN"
            />

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

                <div className="storage-section-content">
                    <div className="wide-card">
                        <div className="card-header">
                            <h3>Archivos de Solución</h3>
                        </div>
                        <div className="storage-content-card">
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
                </div>

                <div className="storage-section-heading">
                    <h2>Solución de Restricciones de Atributos</h2>
                    {parsedAttributesConstraintsSolution.length > 0 && (
                        <button
                            type="button"
                            className="storage-delete-btn"
                            onClick={() => setSectionToDelete({
                                key: 'attributeConstraintsSolution',
                                name: 'Solución de Restricciones de Atributos',
                            })}
                            title="Eliminar Solución de Restricciones de Atributos"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="storage-section-content">
                    <div className="wide-card">
                        <div className="card-header">
                            <h3>Archivos de Solución</h3>
                        </div>
                        <div className="storage-content-card">
                            {parsedAttributesConstraintsSolution.length > 0 ? (
                                parsedAttributesConstraintsSolution.map((block) => (
                                    <JavaCodeBlock
                                        key={block.filename}
                                        filename={block.filename}
                                        code={block.code}
                                    />
                                ))
                            ) : (
                                <p className="storage-empty-state">
                                    Aún no se ha generado la solución del ejercicio "Restricciones de Atributos" para este examen.
                                </p>
                            )}
                        </div>
                    </div>
                </div>


                <div className="storage-section-heading">
                    <h2>Solución de Relaciones entre Entidades</h2>
                    {parsedEntityRelationshipsSolution.length > 0 && (
                        <button
                            type="button"
                            className="storage-delete-btn"
                            onClick={() => setSectionToDelete({
                                key: 'entityRelationshipsSolution',
                                name: 'Solución de Relaciones entre Entidades',
                            })}
                            title="Eliminar Solución de Relaciones entre Entidades"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="storage-section-content">
                    <div className="wide-card">
                        <div className="card-header">
                            <h3>Archivos de Solución</h3>
                        </div>
                        <div className="storage-content-card">
                            {parsedEntityRelationshipsSolution.length > 0 ? (
                                parsedEntityRelationshipsSolution.map((block) => (
                                    <JavaCodeBlock
                                        key={block.filename}
                                        filename={block.filename}
                                        code={block.code}
                                    />
                                ))
                            ) : (
                                <p className="storage-empty-state">
                                    Aún no se ha generado la solución del ejercicio "Relaciones entre Entidades" para este examen.
                                </p>
                            )}
                        </div>
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
    );
};