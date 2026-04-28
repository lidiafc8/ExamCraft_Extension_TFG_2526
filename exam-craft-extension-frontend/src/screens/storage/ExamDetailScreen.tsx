import React, { useState } from "react";

import { MermaidViewer } from "../../components/MermaidViewer";
import { Header } from "../../components/Header";
import { DeleteConfirmationModal } from "~src/components/DeleteConfirmationModal";
import { cleanMermaidCode } from "../../components/mermaidCleaner";
import "./css/StorageScreen.css";
import "./css/ExamDetailScreen.css";

export interface ExamDetailScreenProps {
    selectedProject: any;
    selectedDomainFolder: string;
    isCreating: boolean;
    onWelcome: () => void;
    onBack: () => void;
    onGoToFolders: () => void;
    onDownload: () => void;
    onGitHubDeploy: () => void;
    onShowGeneratedCode: () => void;
    onDeleteProject: (id: string, e?: React.MouseEvent) => void;
    onShowSolutionGeneratedCode: () => void;
    onDeleteSection: (sectionKey: string) => void;
}

export const ExamDetailScreen: React.FC<ExamDetailScreenProps> = ({
    selectedProject,
    selectedDomainFolder,
    isCreating,
    onWelcome,
    onBack,
    onGoToFolders,
    onDownload,
    onGitHubDeploy,
    onShowGeneratedCode,
    onShowSolutionGeneratedCode,
    onDeleteProject,
    onDeleteSection,
}) => {
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
    const [sectionToDelete, setSectionToDelete] = useState<{ key: string; name: string } | null>(null);

    const mermaidCode = selectedProject?.extensionMermaid  || '';
    const introText   = selectedProject?.extensionStatement || '';

    const breadcrumbItems = [
        { label: 'INICIO',              action: onWelcome },
        { label: 'EXÁMENES ANTERIORES', action: onGoToFolders },
        { label: selectedDomainFolder?.toUpperCase() || '', action: onBack },
    ];

    const currentTitle = selectedProject?.customName || `Examen de ${selectedProject?.domainName}`;

    const handleDeletePart = (sectionKey: string, sectionName: string) => {
        setSectionToDelete({ key: sectionKey, name: sectionName });
    };

    const confirmDeletePart = () => {
        if (sectionToDelete) {
            onDeleteSection(sectionToDelete.key);
            setSectionToDelete(null);
        }
    };

    const confirmDeleteProject = () => {
        onDeleteProject(selectedProject?.id);
        setShowDeleteProjectModal(false);
    };

    return (
        <div className="storage-page">
            <Header
                onWelcome={onWelcome}
                breadcrumbItems={breadcrumbItems}
                currentStep={currentTitle}
            />

            <main className="storage-main exam-detail-main">

                <div className="actions-menu-wrapper">
                    <button
                        type="button"
                        className="actions-menu-btn"
                        onClick={() => setShowActionsMenu(!showActionsMenu)}
                        title="Opciones del examen"
                    >
                        &#8942;
                    </button>

                    {showActionsMenu && (
                        <>
                            <div className="actions-overlay" onClick={() => setShowActionsMenu(false)} />
                            <div className="actions-dropdown">
                                <button
                                    type="button"
                                    className="action-btn action-btn--preview"
                                    onClick={() => { setShowPreviewModal(true); setShowActionsMenu(false); }}
                                >
                                    Previsualizar
                                </button>
                                <button
                                    type="button"
                                    className="action-btn action-btn--download"
                                    onClick={() => { onDownload(); setShowActionsMenu(false); }}
                                >
                                    Descargar (.md)
                                </button>
                                <button
                                    type="button"
                                    className="action-btn action-btn--github"
                                    onClick={onGitHubDeploy}
                                    disabled={isCreating}
                                >
                                    {isCreating ? 'Generando Repositorio…' : 'Crear repositorio GitHub'}
                                </button>
                                <hr className="action-divider" />
                                <button
                                    type="button"
                                    className="action-btn action-btn--delete"
                                    onClick={() => { setShowDeleteProjectModal(true); setShowActionsMenu(false); }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <div className="storage-section-heading">
                    <h2>Extensión Funcional</h2>
                </div>

                <div className="two-col-grid">
                    <div className="content-card">
                        <div className="card-header">
                            <h3>Enunciado y Código Diagrama UML</h3>
                        </div>
                        <div className="card-body">
                            <textarea
                                className="wf-textarea"
                                readOnly
                                value={`${introText}\n\n${mermaidCode}`}
                            />
                        </div>
                    </div>

                    <div className="content-card">
                        <div className="card-header">
                            <h3>Ilustración Diagrama UML</h3>
                        </div>
                        <div className="card-body diagram-panel">
                            <MermaidViewer chartCode={cleanMermaidCode(mermaidCode)} />
                        </div>
                    </div>
                </div>

                <div className="storage-section-heading">
                    <h2>Restricciones de Atributos</h2>
                    {selectedProject?.attributeConstraints && (
                        <button
                            type="button"
                            className="storage-delete-btn"
                            onClick={() => handleDeletePart('attributeConstraints', 'Restricciones de Atributos')}
                            title="Eliminar Restricciones de Atributos"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="wide-card">
                    <div className="card-header">
                        <h3>Definición de Restricciones</h3>
                    </div>
                    {selectedProject?.attributeConstraints ? (
                        <textarea className="wide-textarea" readOnly value={selectedProject.attributeConstraints} />
                    ) : (
                        <p className="storage-empty-state">
                            Aún no se han creado las restricciones de atributos para este examen.
                        </p>
                    )}
                </div>

                <div className="storage-section-heading">
                    <h2>Relaciones entre Entidades</h2>
                    {selectedProject?.entityRelationships && (
                        <button
                            type="button"
                            className="storage-delete-btn"
                            onClick={() => handleDeletePart('entityRelations', 'Relaciones entre Entidades')}
                            title="Eliminar Relaciones entre Entidades"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="wide-card">
                    <div className="card-header">
                        <h3>Definición de Relaciones</h3>
                    </div>
                    {selectedProject?.entityRelationships ? (
                        <textarea className="wide-textarea" readOnly value={selectedProject.entityRelationships} />
                    ) : (
                        <p className="storage-empty-state">
                            Aún no se han creado las relaciones entre entidades para este examen.
                        </p>
                    )}
                </div>

                <div className="storage-section-heading" style={{ marginTop: '48px' }}>
                    <h2>Código Generado</h2>
                </div>

                <div className="wide-card">
                    <div className="code-buttons-row">
                        <button type="button" className="btn-code" onClick={onShowGeneratedCode}>
                            Ver Código Examen
                        </button>
                        <button type="button" className="btn-code" onClick={onShowSolutionGeneratedCode}>
                            Ver Código Solución
                        </button>
                    </div>
                </div>

                <div className="storage-bottom-actions">
                    <button type="button" className="btn-back" onClick={onBack}>
                        Volver
                    </button>
                </div>

                {showPreviewModal && (
                    <div className="preview-backdrop">
                        <div className="preview-modal">
                            <div className="preview-modal-header">
                                <h2>Previsualización del Examen</h2>
                                <button
                                    type="button"
                                    className="preview-close-btn"
                                    onClick={() => setShowPreviewModal(false)}
                                >
                                    ✖
                                </button>
                            </div>
                            <div className="preview-modal-body">
                                <div className="exam-markdown-container">
                                    <h1>{selectedProject?.customName || `Examen de ${selectedProject?.domainName}`}</h1>
                                    <h2>1. Extensión Funcional y Diagrama UML</h2>
                                    {introText && <p style={{ whiteSpace: 'pre-wrap' }}>{introText}</p>}
                                    {mermaidCode && (
                                        <div className="preview-diagram-wrapper">
                                            <div className="preview-diagram-blocker" />
                                            <MermaidViewer chartCode={cleanMermaidCode(mermaidCode)} />
                                        </div>
                                    )}
                                    <h2>2. Restricciones de Atributos</h2>
                                    {selectedProject?.attributeConstraints
                                        ? <p style={{ whiteSpace: 'pre-wrap' }}>{selectedProject.attributeConstraints}</p>
                                        : <p><em>Sin restricciones para atributos definidas</em></p>
                                    }
                                    <h2>3. Relaciones entre Entidades</h2>
                                    {selectedProject?.entityRelationships
                                        ? <p style={{ whiteSpace: 'pre-wrap' }}>{selectedProject.entityRelationships}</p>
                                        : <p><em>Sin relaciones entre entidades definidas</em></p>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <DeleteConfirmationModal
                    isOpen={!!sectionToDelete}
                    itemName={sectionToDelete?.name || ''}
                    onConfirm={confirmDeletePart}
                    onCancel={() => setSectionToDelete(null)}
                />

                <DeleteConfirmationModal
                    isOpen={showDeleteProjectModal}
                    itemName={currentTitle}
                    isExam={true}
                    onConfirm={confirmDeleteProject}
                    onCancel={() => setShowDeleteProjectModal(false)}
                />
            </main>
        </div>
    );
};