import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import specific_exam_part from "../../../assets/images/exam_part_storage.png";
import { getAllFromChrome } from "~src/utils/chromeStorageUtils";
import { FolderExamSelector } from "../../components/FolderExamsSelector";
import { Header } from "~src/components/Header";
import { ConfirmModal } from "~src/components/modals/ConfirmModal";

interface Props {
    readonly onBack: () => void;
    readonly onWelcome: () => void;
    readonly onCreateExam: () => void;
    readonly onCreateExamByParts: () => void;
    readonly onCreateTest1: (data: {
        project: any;
        constraints: string;
        entityRelationships: string;
        baseClass: string;
        targetType?: 'attributes' | 'entityRelationships';
    }) => void;
    readonly onCodeGeneration: () => void;
}

export default function GeneralGenerationTestScreen({
    onBack,
    onWelcome,
    onCreateExam,
    onCreateExamByParts,
    onCreateTest1,
    onCodeGeneration,
}: Props) {
    const [step, setStep] = useState<'selector' | 'parts'>('selector');
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [showPartConfirmModal, setShowPartConfirmModal] = useState(false);
    const [pendingPartKey, setPendingPartKey] = useState<string | null>(null);

    useEffect(() => {
        getAllFromChrome()
            .then(allItems => {
                const projectList = allItems
                    .filter(item => item._key?.startsWith('project_'))
                    .filter(p => {
                        const hasBase = p.baseClasses && p.baseClasses.trim().length > 10;
                        const hasConstraints = p.attributeConstraints && p.attributeConstraints.trim().length > 10;
                        const hasRelationships = p.entityRelationships && p.entityRelationships.trim().length > 10;
                        return hasBase && (hasConstraints || hasRelationships);
                    });
                setProjects(projectList);
            })
            .catch(() => setProjects([]));
    }, []);

    const allowedFolders = Array.from(new Set(
        projects
            .filter(p => p.domainName && p.baseClasses)
            .flatMap(p => Array.isArray(p.domainName) ? p.domainName : [p.domainName])
            .map((domain: string) => domain.toLowerCase())
    ));

    const getAvailableParts = (project: any) => {
        const evaluableKeys = new Set(["attributeConstraints", "entityRelationships"]);
        return Object.keys(project).filter(key => evaluableKeys.has(key));
    };

    const handleHover = (e: React.MouseEvent | React.FocusEvent, scale: string) => {
        (e.currentTarget as HTMLElement).style.transform = `scale(${scale})`;
    };

    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'CREAR EXAMEN', action: onCreateExam },
        { label: 'POR PARTES', action: onCreateExamByParts },
        { label: 'CÓDIGO', action: onCodeGeneration },
    ];

    const getPartModalData = () => {
        if (!pendingPartKey || !selectedProject) return null;
        const testPartsMap = selectedProject.testPartsMap || {};
        const isAttribute = pendingPartKey.toLowerCase().includes('attribute');
        const partName = isAttribute ? 'Restricciones de Atributos' : 'Relaciones entre Entidades';
        const hasExistingTests = isAttribute
            ? testPartsMap['test1_attributes']?.code?.trim().length > 0
            : testPartsMap['test2_relationships']?.code?.trim().length > 0;
        return { partName, hasExistingTests };
    };

    const partModalData = getPartModalData();

    const handleConfirm = () => {
        setShowPartConfirmModal(false);
        const key = pendingPartKey!;
        setPendingPartKey(null);
        onCreateTest1({
            project: selectedProject,
            constraints: selectedProject.attributeConstraints || "",
            entityRelationships: selectedProject.entityRelationships || "",
            baseClass: selectedProject.baseClasses || "",
            targetType: key === 'attributeConstraints' ? 'attributes' : 'entityRelationships',
        });
    };

    const handleCancel = () => {
        setShowPartConfirmModal(false);
        setPendingPartKey(null);
    };

    return (
        <div className="exam-app">
            <Header
                onWelcome={onWelcome}
                breadcrumbItems={breadcrumbItems}
                currentStep="TESTS"
            />

            <main className="main-content">
                {step === 'selector' && (
                    <FolderExamSelector
                        projects={projects}
                        allowedFolders={allowedFolders}
                        selectedFolder={selectedFolder}
                        onSelectFolder={(folder) => setSelectedFolder(folder || null)}
                        onSelectProject={(proj) => { setSelectedProject(proj); setStep('parts'); }}
                        onBack={onBack}
                        displayName={(proj) =>
                            proj.customName ||
                            `Examen de ${Array.isArray(proj.domainName) ? proj.domainName.join(', ') : proj.domainName}`
                        }
                        emptyFoldersMessage="No hay exámenes con clases base y partes generadas. Genera primero las clases base y al menos una parte del examen."
                        emptyProjectsMessage="Ningún examen de esta carpeta tiene clases base y partes generadas todavía."
                        />
                )}

                {step === 'parts' && selectedProject && (
                    <div>
                        <h1 className="main-title">¿Qué parte quieres evaluar?</h1>
                        <div className="cards-container">
                            {getAvailableParts(selectedProject)
                                .filter(key => key.toLowerCase().includes('attribute') || key.toLowerCase().includes('entity'))
                                .map(key => {
                                    const isAttribute = key.toLowerCase().includes('attribute');
                                    const partName = isAttribute ? 'Restricciones de Atributos' : 'Relaciones entre Entidades';
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => { setPendingPartKey(key); setShowPartConfirmModal(true); }}
                                            onMouseOver={(e) => handleHover(e, '1.05')}
                                            onMouseOut={(e) => handleHover(e, '1')}
                                            onFocus={(e) => handleHover(e, '1.05')}
                                            onBlur={(e) => handleHover(e, '1')}
                                            className="action-card"
                                        >
                                            <img src={specific_exam_part} alt={partName} className="card-icon" />
                                            <span className="card-label">{partName}</span>
                                        </button>
                                    );
                                })}
                        </div>
                        <div className="wf-actions-row">
                            <button onClick={() => setStep('selector')} className="btn-back" style={{ marginTop: "20px" }}>Volver</button>                        </div>
                    </div>
                )}
            </main>

            {showPartConfirmModal && partModalData && createPortal(
                <ConfirmModal
                    title={partModalData.hasExistingTests ? 'Confirmar Examen' : 'Confirmar Parte'}
                    message={`¿Deseas utilizar el ejercicio seleccionado como base para generar ${partModalData.hasExistingTests ? 'nuevos' : 'los'} tests de ${partModalData.partName}?`}
                    warning={partModalData.hasExistingTests
                        ? `Ya existen tests guardados para ${partModalData.partName}. Al generar nuevos se sobrescribirán los anteriores.`
                        : undefined
                    }
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />,
                document.body
            )}
        </div>
    );
}