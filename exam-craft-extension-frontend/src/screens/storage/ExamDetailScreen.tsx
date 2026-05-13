import React, { useState, useEffect, useRef } from "react";
import { MermaidViewer } from "../../components/MermaidViewer";
import { Header } from "../../components/Header";
import { DeleteConfirmationModal } from "~src/components/modals/DeleteConfirmationModal";
import { DownloadConfirmModal } from "~src/components/modals/DownloadConfirmModal";
import { GitHubDeployModal } from "~src/components/modals/GitHubDeployModal";
import { cleanMermaidCode } from "../../components/mermaidCleaner";
import { generateWithAI } from "../../services/geminiService";
import "./css/StorageScreen.css";
import "./css/ExamDetailScreen.css";

export interface ExamDetailScreenProps {
    selectedProject: any;
    selectedDomainFolder: string;
    isCreating: boolean;
    onWelcome: () => void;
    onBack: () => void;
    onGoToFolders: () => void;
    onDownload: (fileName: string) => void;
    onGitHubDeploy: (token: string, project: any, repoName: string) => Promise<string>;
    onShowGeneratedCode: () => void;
    onDeleteProject: (id: string, e?: React.MouseEvent) => void;
    onShowSolutionGeneratedCode: () => void;
    onDeleteSection: (sectionKey: string) => void;
    onUpdateProject: (updatedProject: any) => Promise<void>;
}

function buildCombined(intro: string, mermaid: string): string {
    const i = intro || '';
    const m = mermaid || '';
    if (!i && !m) return '';
    if (!m) return i;
    const block = `\`\`\`mermaid\n${m}\n\`\`\``;
    if (!i) return block;
    return `${i}\n\n${block}`;
}

function parseMermaidFromCombined(combined: string): string {
    const match = combined.match(/```mermaid\s*([\s\S]*?)```/);
    return match ? match[1].trim() : '';
}

function parseIntroFromCombined(combined: string): string {
    const idx = combined.indexOf('```mermaid');
    return idx !== -1 ? combined.slice(0, idx).trim() : combined.trim();
}

export const ExamDetailScreen: React.FC<ExamDetailScreenProps> = ({
    selectedProject,
    selectedDomainFolder,
    onWelcome,
    onBack,
    onGoToFolders,
    onDownload,
    onGitHubDeploy,
    onShowGeneratedCode,
    onShowSolutionGeneratedCode,
    onDeleteProject,
    onDeleteSection,
    onUpdateProject,
}) => {
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showDeployModal, setShowDeployModal] = useState(false);
    const [sectionToDelete, setSectionToDelete] = useState<{ key: string; name: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isRegeneratingDiagram, setIsRegeneratingDiagram] = useState(false);

    const [editingCombined, setEditingCombined] = useState(false);
    const [editingAttributeConstraints, setEditingAttributeConstraints] = useState(false);
    const [editingEntityRelationships, setEditingEntityRelationships] = useState(false);

    const [combinedText, setCombinedText] = useState(
        buildCombined(selectedProject?.extensionStatement || '', selectedProject?.extensionMermaid || '')
    );
    const [attributeConstraints, setAttributeConstraints] = useState(selectedProject?.attributeConstraints || '');
    const [entityRelationships, setEntityRelationships] = useState(selectedProject?.entityRelationships || '');

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef(false);

    useEffect(() => {
        setCombinedText(buildCombined(
            selectedProject?.extensionStatement || '',
            selectedProject?.extensionMermaid || ''
        ));
        setAttributeConstraints(selectedProject?.attributeConstraints || '');
        setEntityRelationships(selectedProject?.entityRelationships || '');
    }, [selectedProject]);

    const liveMermaid =
        parseMermaidFromCombined(combinedText) || (selectedProject?.extensionMermaid || '');

    const originalCombined = buildCombined(
        selectedProject?.extensionStatement || '',
        selectedProject?.extensionMermaid || ''
    );
    const isDirty =
        combinedText !== originalCombined ||
        attributeConstraints !== (selectedProject?.attributeConstraints || '') ||
        entityRelationships !== (selectedProject?.entityRelationships || '');

    const currentTitle = selectedProject?.customName || `Examen de ${selectedProject?.domainName}`;

    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'EXÁMENES ANTERIORES', action: onGoToFolders },
        { label: selectedDomainFolder?.toUpperCase() || '', action: onBack },
    ];

    const handleCombinedChange = (newValue: string) => {
        setCombinedText(newValue);

        const newIntro = parseIntroFromCombined(newValue);
        const oldIntro = parseIntroFromCombined(combinedText);

        if (newIntro === oldIntro) return;

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        abortRef.current = true;

        debounceTimer.current = setTimeout(async () => {
            if (!newIntro.trim()) return;
            abortRef.current = false;
            setIsRegeneratingDiagram(true);
            try {
                const prompt = `Eres un experto en diseño de software. 
                        A partir del siguiente enunciado de examen, genera ÚNICAMENTE el código de un diagrama de clases Mermaid (classDiagram) que represente las entidades y relaciones descritas.
                        Devuelve SOLO el código Mermaid sin ningún texto adicional, sin explicaciones, sin bloques de código markdown, solo el código plano que empieza con "classDiagram".

                        ENUNCIADO:
                        ${newIntro}`;

                const result = await generateWithAI(prompt);
                if (abortRef.current) return;

                if (result?.trim()) {
                    const cleanResult = result
                        .replace(/```mermaid\s*/g, '') // NOSONAR javascript:S5852
                        .replace(/```\s*/g, '')
                        .trim();
                    setCombinedText(prev => {
                        const intro = parseIntroFromCombined(prev);
                        return buildCombined(intro, cleanResult);
                    });
                }
            } catch (err) {
                console.error("Error regenerando diagrama:", err);
            } finally {
                if (!abortRef.current) setIsRegeneratingDiagram(false);
            }
        }, 1500);
    };

    const handleConfirmDownload = (fileName: string) => {
        onDownload(fileName);
        setShowDownloadModal(false);
    };

    const handleDeletePart = (sectionKey: string, sectionName: string) => {
        setSectionToDelete({ key: sectionKey, name: sectionName });
    };

    const confirmDeletePart = () => {
        if (sectionToDelete) {
            onDeleteSection(sectionToDelete.key);
            setSectionToDelete(null);
        }
    };

    const handleSave = async () => {
        if (!selectedProject?.id) return;
        setIsSaving(true);
        try {
            const extensionStatement = parseIntroFromCombined(combinedText);
            const extensionMermaid = parseMermaidFromCombined(combinedText);
            await onUpdateProject({
                ...selectedProject,
                extensionStatement,
                extensionMermaid,
                attributeConstraints,
                entityRelationships,
                updatedAt: new Date().toISOString(),
            });
        } catch (err) {
            alert(err instanceof Error ? err.message : "No se pudo guardar.");
        } finally {
            setIsSaving(false);
        }
    };

    const getRepoConfig = (domain: string) => {
        const isPetClinic = domain.toLowerCase().includes("veterinaria") || domain.toLowerCase().includes("clínica");
        return {
            TEMPLATE_OWNER: "lidiafc8",
            TEMPLATE_REPO: isPetClinic ? "DP1-petClinic-template-exam" : "DP1-chess-template-exam",
            TEST_BASE_PATH: isPetClinic
                ? "src/test/java/org/springframework/samples/petclinic/grooming/"
                : "src/test/java/es/us/dp1/chess/tournament/"
        };
    };

    const buildUploadListString = () => {
        const items = ["README.md (Enunciado y UML)"];
        if (attributeConstraints) items.push("Restricciones de atributos");
        if (entityRelationships) items.push("Relaciones entre entidades");
        if (selectedProject?.baseClasses) items.push("Clases base");
        if (selectedProject?.testPartsMap) items.push("Tests unitarios Java (JUnit)");
        if (selectedProject?.fullSolution) items.push("Solución completa");
        return items.join('\n');
    };

    return (
        <div>
            <Header
                onWelcome={onWelcome}
                breadcrumbItems={breadcrumbItems}
                currentStep={currentTitle}
            />
            <div className="main-content">
                <main className="storage-main exam-detail-main">

                    <div className="actions-menu-wrapper">
                        <button
                            type="button"
                            className="actions-menu-btn"
                            onClick={() => setShowActionsMenu(!showActionsMenu)}
                        >
                            &#8942;
                        </button>

                        {showActionsMenu && (
                            <>
                                <div className="actions-overlay" onClick={() => setShowActionsMenu(false)} />
                                <div className="actions-dropdown">
                                    <button
                                        className="action-btn action-btn--preview"
                                        onClick={() => { setShowPreviewModal(true); setShowActionsMenu(false); }}
                                    >
                                        Previsualizar
                                    </button>
                                    <button
                                        className="action-btn action-btn--download"
                                        onClick={() => { setShowDownloadModal(true); setShowActionsMenu(false); }}
                                    >
                                        Descargar (.md)
                                    </button>
                                    <button
                                        className="action-btn action-btn--github"
                                        onClick={() => { setShowDeployModal(true); setShowActionsMenu(false); }}
                                    >
                                        Crear repositorio GitHub
                                    </button>
                                    <hr className="action-divider" />
                                    <button
                                        className="action-btn action-btn--delete"
                                        onClick={() => {
                                            setShowActionsMenu(false);
                                            onDeleteProject(selectedProject?.id);
                                        }}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="storage-section-heading">
                        <h2>Extensión Funcional</h2>
                        <button
                            type="button"
                            className={`btn-edit-toggle ${editingCombined ? 'btn-edit-toggle--active' : ''}`}
                            onClick={() => setEditingCombined(prev => !prev)}
                        >
                            {editingCombined ? '✎ Editando' : '🔒 No editable'}
                        </button>
                    </div>

                    <div className="two-col-grid">
                        <div className="content-card">
                            <div className="card-header">
                                <h3>Enunciado y Código Diagrama UML</h3>
                            </div>
                            <div className="card-body">
                                <textarea
                                    className="wf-textarea"
                                    value={combinedText}
                                    readOnly={!editingCombined}
                                    onChange={editingCombined ? e => handleCombinedChange(e.target.value) : undefined}
                                />
                            </div>
                        </div>
                        <div className="content-card">
                            <div className="card-header">
                                <h3>
                                    Ilustración Diagrama UML
                                    {isRegeneratingDiagram && (
                                        <span className="diagram-regenerating-indicator"> Regenerando...</span>
                                    )}
                                </h3>
                            </div>
                            <div className="card-body diagram-panel">
                                <MermaidViewer chartCode={cleanMermaidCode(liveMermaid)} />
                            </div>
                        </div>
                    </div>

                    <div className="storage-section-heading">
                        <h2>Restricciones de Atributos</h2>
                        <div className="section-heading-actions">
                            {selectedProject?.attributeConstraints && (
                                <button
                                    type="button"
                                    className={`btn-edit-toggle ${editingAttributeConstraints ? 'btn-edit-toggle--active' : ''}`}
                                    onClick={() => setEditingAttributeConstraints(prev => !prev)}
                                >
                                    {editingAttributeConstraints ? '✎ Editando' : '🔒 No editable'}
                                </button>
                            )}
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
                    </div>

                    <div className="wide-card">
                        <div className="card-header">
                            <h3>Definición de Restricciones</h3>
                        </div>
                        {selectedProject?.attributeConstraints ? (
                            <textarea
                                className="wide-textarea"
                                value={attributeConstraints}
                                readOnly={!editingAttributeConstraints}
                                onChange={editingAttributeConstraints ? e => setAttributeConstraints(e.target.value) : undefined}
                            />
                        ) : (
                            <p className="storage-empty-state">
                                Aún no se han creado las restricciones de atributos para este examen.
                            </p>
                        )}
                    </div>

                    <div className="storage-section-heading">
                        <h2>Relaciones entre Entidades</h2>
                        <div className="section-heading-actions">
                            {selectedProject?.entityRelationships && (
                                <button
                                    type="button"
                                    className={`btn-edit-toggle ${editingEntityRelationships ? 'btn-edit-toggle--active' : ''}`}
                                    onClick={() => setEditingEntityRelationships(prev => !prev)}
                                >
                                    {editingEntityRelationships ? '✎ Editando' : '🔒 No editable'}
                                </button>
                            )}
                            {selectedProject?.entityRelationships && (
                                <button
                                    type="button"
                                    className="storage-delete-btn"
                                    onClick={() => handleDeletePart('entityRelationships', 'Relaciones entre Entidades')}
                                    title="Eliminar Relaciones entre Entidades"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="wide-card">
                        <div className="card-header">
                            <h3>Definición de Relaciones</h3>
                        </div>
                        {selectedProject?.entityRelationships ? (
                            <textarea
                                className="wide-textarea"
                                value={entityRelationships}
                                readOnly={!editingEntityRelationships}
                                onChange={editingEntityRelationships ? e => setEntityRelationships(e.target.value) : undefined}
                            />
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
                        {isDirty && (
                            <button
                                type="button"
                                className="btn-save-changes"
                                onClick={handleSave}
                                disabled={isSaving || isRegeneratingDiagram}
                            >
                                {isSaving ? "Guardando…" : "Guardar cambios"}
                            </button>
                        )}
                    </div>

                    {showPreviewModal && (
                        <div className="preview-backdrop">
                            <div className="preview-modal">
                                <div className="preview-modal-header">
                                    <h2>Previsualización del Examen</h2>
                                    <button className="preview-close-btn" onClick={() => setShowPreviewModal(false)}>✖</button>
                                </div>
                                <div className="preview-modal-body">
                                    <div className="exam-markdown-container">
                                        <h1>{currentTitle}</h1>

                                        <h2>1. Extensión Funcional y Diagrama UML</h2>
                                        {combinedText && <p style={{ whiteSpace: 'pre-wrap' }}>{combinedText}</p>}
                                        {liveMermaid && (
                                            <div className="preview-diagram-wrapper">
                                                <MermaidViewer chartCode={cleanMermaidCode(liveMermaid)} />
                                            </div>
                                        )}

                                        <h2>2. Restricciones de Atributos</h2>
                                        {attributeConstraints
                                            ? <p style={{ whiteSpace: 'pre-wrap' }}>{attributeConstraints}</p>
                                            : <p style={{ textAlign: 'center' }}><em>Sin restricciones definidas</em></p>
                                        }

                                        <h2>3. Relaciones entre Entidades</h2>
                                        {entityRelationships
                                            ? <p style={{ whiteSpace: 'pre-wrap' }}>{entityRelationships}</p>
                                            : <p style={{ textAlign: 'center' }}><em>Sin relaciones definidas</em></p>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DownloadConfirmModal
                        isOpen={showDownloadModal}
                        defaultFileName={currentTitle}
                        onConfirm={handleConfirmDownload}
                        onCancel={() => setShowDownloadModal(false)}
                    />

                    {showDeployModal && (
                        <GitHubDeployModal
                            domainName={selectedProject.domainName}
                            templateRepo={getRepoConfig(selectedProject.domainName).TEMPLATE_REPO}
                            newRepoName={`examen-${currentTitle.toLowerCase().replace(/\s+/g, '-')}`}
                            uploadListString={buildUploadListString()}
                            savedToken={localStorage.getItem("github_token")}
                            onClose={() => setShowDeployModal(false)}
                            onSuccess={() => setShowDeployModal(false)}
                            onConfirm={async (token) => {
                                const repoUrl = await onGitHubDeploy(
                                    token,
                                    selectedProject,
                                    `examen-${currentTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
                                );
                                return repoUrl;
                            }}
                        />
                    )}

                    <DeleteConfirmationModal
                        isOpen={!!sectionToDelete}
                        itemName={sectionToDelete?.name || ''}
                        onConfirm={confirmDeletePart}
                        onCancel={() => setSectionToDelete(null)}
                    />

                </main>
            </div>
        </div>
    );
};