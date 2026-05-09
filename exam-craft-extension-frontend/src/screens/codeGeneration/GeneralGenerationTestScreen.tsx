import React, { useState, useEffect } from "react";
import logoExamCraft from "../../../assets/icon512.png";
import carpeta from "../../../assets/images/archive.png";
import specific_exam_part from "../../../assets/images/exam_part_storage.png";
import exam from "../../../assets/images/exam.png"
import { createPortal } from "react-dom";

declare var chrome: any;

interface Props {
    readonly onBack: () => void;
    readonly onWelcome: () => void;
    readonly onCreateExam: () => void;
    readonly onCreateExamByParts: () => void;
    readonly onCreateTest1: (data: { 
        project: any; 
        constraints: string; 
        entityRelationships: string; 
        baseClass: string,
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
    const [step, setStep] = useState<'folders' | 'exams' | 'parts' | 'workflow'>('folders');
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedDomainFolder, setSelectedDomainFolder] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [selectedPartKey, setSelectedPartKey] = useState<string>("");

    const [showPartConfirmModal, setShowPartConfirmModal] = useState(false);
    const [pendingPartKey, setPendingPartKey] = useState(null);
    

    useEffect(() => {
        if (globalThis.chrome?.storage?.local) {
            chrome.storage.local.get(null, (items) => {
                const projectList = Object.keys(items)
                    .filter(key => key.startsWith('project_'))
                    .map(key => ({ id: key, ...items[key] }))
                    .filter(p => {
                        const hasBase = p.baseClasses && p.baseClasses.trim().length > 10;
                        const hasConstraints = p.attributeConstraints && p.attributeConstraints.trim().length > 10;
                        const hasRelationships = p.entityRelationships && p.entityRelationships.trim().length > 10;
                        return hasBase && (hasConstraints || hasRelationships);
                    });
                setProjects(projectList);
            });
        }
    }, []);

    const projectsInFolder = projects.filter(p => {
        if (!p.domainName || !selectedDomainFolder) return false;
        
        const projectDomains = Array.isArray(p.domainName) ? p.domainName : [p.domainName];
        
        return projectDomains.some(
            domain => domain.toLowerCase() === selectedDomainFolder.toLowerCase()
        );
    });

    const allowedFolders = Array.from(new Set(
        projects
            .filter(p => p.domainName && p.baseClasses) 
            .flatMap(p => Array.isArray(p.domainName) ? p.domainName : [p.domainName])
            .map(domain => domain.toLowerCase()) 
    ));

    const getAvailableParts = (project: any) => {
        const evaluableKeys = new Set(["attributeConstraints", "entityRelationships"]);
        return Object.keys(project).filter(key => evaluableKeys.has(key));
    };

    const breadcrumbButtonStyle: React.CSSProperties = {
        background: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
        font: 'inherit',
        color: '#4a3728',
        cursor: 'pointer',
        display: 'inline',
        outline: 'none'
    };

    const breadcrumbConfig = [
        { label: 'INICIO', action: onWelcome },
        { label: 'CREAR EXAMEN', action: onCreateExam },
        { label: 'POR PARTES', action: onCreateExamByParts },
        { label: 'CÓDIGO', action: onCodeGeneration }
    ];

    const handleHover = (e: React.MouseEvent | React.FocusEvent, scale: string) => {
        (e.currentTarget as HTMLElement).style.transform = `scale(${scale})`;
    };

    return (
        <div className="exam-app" style={{ position: 'relative' }}>
            <header className="app-header">
                <div className="header-left">
                    <button 
                        type="button"
                        onClick={onWelcome} 
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', outline: 'none' }}
                        aria-label="Ir a inicio"
                    >
                        <img src={logoExamCraft} alt="Logo ExamCraft" width="60" height="60" />
                    </button>
                    
                    <nav className="breadcrumb-nav">
                        {breadcrumbConfig.map((item) => (
                            <React.Fragment key={item.label}>
                                <button 
                                    type="button" 
                                    style={breadcrumbButtonStyle} 
                                    onClick={item.action}
                                >
                                    {item.label}
                                </button>
                                <span className="breadcrumb-separator">{' > '}</span>
                            </React.Fragment>
                        ))}
                        <span className="breadcrumb-current">TESTS</span>
                    </nav>
                </div>
            </header>

            <main className="main-content">
                {/* STEP: FOLDERS */}
                {step === 'folders' && (
                    <div className="content-card" style={{ width: '100%', maxWidth: '900px' }}>
                        <h2 className="main-title small">Selecciona un dominio</h2>
                        <p className="wf-instruction-text" style={{ textAlign: 'center' }}>
                            Elige la carpeta del dominio para generar un test sobre una de sus partes.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '30px', marginTop: '30px', padding: '20px' }}>
                            {allowedFolders.length > 0 ? (
                                allowedFolders.map((folderName) => (
                                    <div key={folderName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => { setSelectedDomainFolder(folderName); setStep('exams'); }}
                                            onMouseOver={(e) => handleHover(e, '1.1')}
                                            onMouseOut={(e) => handleHover(e, '1')}
                                            onFocus={(e) => handleHover(e, '1.1')}
                                            onBlur={(e) => handleHover(e, '1')}
                                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', transition: 'transform 0.2s', outline: 'none' }}
                                        >
                                            <img src={carpeta} alt={`Carpeta ${folderName}`} width="90" />
                                        </button>
                                        <span style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '14px', color: '#4a3728', textAlign: 'center', textTransform: 'capitalize' }}>
                                            {folderName}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>
                                    No hay carpetas con código base disponibles.
                                </p>
                            )}
                        </div>
                        <div className="wf-actions-row" style={{ marginTop: '30px' }}>
                            <button type="button" onClick={onBack} className="btn-step secondary">Volver</button>
                        </div>
                    </div>
                )}

                {/* STEP: EXAMS */}
                {step === 'exams' && selectedDomainFolder && (
                    <div className="content-card" style={{ width: '100%', maxWidth: '900px' }}>
                        <h2 className="main-title small">Exámenes de {selectedDomainFolder.toUpperCase()}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '30px', marginTop: '30px', padding: '20px' }}>
                            {projectsInFolder.length > 0 ? (
                                projectsInFolder.map((proj) => (
                                    <div key={proj.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => { setSelectedProject(proj); setStep('parts'); }} 
                                            onMouseOver={(e) => handleHover(e, '1.1')}
                                            onMouseOut={(e) => handleHover(e, '1')}
                                            onFocus={(e) => handleHover(e, '1.1')}
                                            onBlur={(e) => handleHover(e, '1')}
                                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', transition: 'transform 0.2s', outline: 'none' }}
                                        >
                                            <img src={exam} alt="Seleccionar examen" width="80" height="80" />
                                        </button>
                                        <span style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '14px', color: '#4a3728', textAlign: 'center' }}>
                                            {proj.customName || `Examen de ${Array.isArray(proj.domainName) ? proj.domainName.join(', ') : proj.domainName}`}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>No hay exámenes en esta carpeta.</p>
                            )}
                        </div>
                        <div className="wf-actions-row" style={{ marginTop: '30px' }}>
                            <button type="button" onClick={() => setStep('folders')} className="btn-step secondary">Volver a carpetas</button>
                        </div>
                    </div>
                )}

                {/* STEP: PARTS */}
                {step === 'parts' && selectedProject && (
                    <div className="content-card" style={{ width: '100%', maxWidth: '900px' }}>
                        <h2 className="main-title small">¿Qué parte quieres evaluar?</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '30px', marginTop: '30px', padding: '20px', justifyContent: 'center' }}>
                            {getAvailableParts(selectedProject)
                                .filter(key => key.toLowerCase().includes('attribute') || key.toLowerCase().includes('entity'))
                                .map(key => {
                                    const isAttribute = key.toLowerCase().includes('attribute');
                                    const partName = isAttribute ? 'Restricciones de Atributos' : 'Relaciones entre Entidades';

                                    return (
                                        <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <button
                                                type="button"
                                                onClick={() => { 
                                                    setPendingPartKey(key); 
                                                    setShowPartConfirmModal(true); 
                                                }}
                                                onMouseOver={(e) => handleHover(e, '1.1')}
                                                onMouseOut={(e) => handleHover(e, '1')}
                                                onFocus={(e) => handleHover(e, '1.1')}
                                                onBlur={(e) => handleHover(e, '1')}
                                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', transition: 'transform 0.2s', outline: 'none' }}
                                            >
                                                <img src={specific_exam_part} alt={partName} width="100" height="100" />
                                            </button>
                                            <span style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '14px', color: '#4a3728', textAlign: 'center' }}>
                                                {partName}
                                            </span>
                                        </div>
                                    );
                                })}
                        </div>
                        <div className="wf-actions-row" style={{ marginTop: '30px' }}>
                            <button type="button" onClick={() => setStep('exams')} className="btn-step secondary">Volver a exámenes</button>
                        </div>
                        
                        {/* MODAL DE CONFIRMACIÓN CON ADVERTENCIA ESPECÍFICA DE PARTE */}
                        {showPartConfirmModal && pendingPartKey && createPortal(
                            (() => {
                                let hasExistingTests = false;
                                
                                const testPartsMap = selectedProject?.testPartsMap || {};

                                const isAttributeConstraintsTests = pendingPartKey.toLowerCase().includes('attribute');
                                const isEntityRelationshipsTests = pendingPartKey.toLowerCase().includes('entity');

                                if (
                                    (isAttributeConstraintsTests && testPartsMap['test1_attributes']?.code?.trim().length > 0) || 
                                    (isEntityRelationshipsTests && testPartsMap['test2_relationships']?.code?.trim().length > 0)
                                ) {
                                    hasExistingTests = true;
                                }

                                return (
                                    <div style={{
                                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                        backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', 
                                        justifyContent: 'center', alignItems: 'center', zIndex: 2000 
                                    }}>
                                        <div className="content-card" style={{ maxWidth: '400px', width: '90%', padding: '30px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px' }}>
                                            
                                            <h3 className="main-title small" style={{ marginBottom: '15px', color: '#4a3728' }}>
                                                {hasExistingTests ? '⚠️ Confirmación de Sobrescritura' : 'Confirmación de Parte'}
                                            </h3>
                                            
                                            {hasExistingTests && (
                                                <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #ffeeba' }}>
                                                    <strong>Atención:</strong> Ya existen tests guardados para la parte de <strong>{isAttributeConstraintsTests ? 'Restricciones de Atributos' : 'Relaciones entre Entidades'}</strong>. Al generar nuevos, se sobrescribirán los anteriores correspondientes a esta parte.
                                                </div>
                                            )}
                                            
                                            <p style={{ marginBottom: '25px', color: '#555', fontSize: '15px' }}>
                                                ¿Deseas utilizar el ejercicio seleccionado como base para generar {hasExistingTests ? 'nuevos' : 'los'} tests?
                                            </p>

                                            <div className="wf-actions-row" style={{ justifyContent: 'center', gap: '15px' }}>
                                                <button 
                                                    onClick={() => { 
                                                        setShowPartConfirmModal(false); 
                                                        setPendingPartKey(null); 
                                                    }} 
                                                    className="btn-step secondary"
                                                >
                                                    Cancelar
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setShowPartConfirmModal(false);
                                                        setSelectedPartKey(pendingPartKey);
                                                        setStep('workflow'); 
                                                    }} 
                                                    className="btn-step primary"
                                                >
                                                    {hasExistingTests ? 'Sí, sobrescribir' : 'Comenzar'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })(),
                            document.body
                        )}
                    </div>
                )}

                {step === 'workflow' && selectedProject && (
                    <div className="content-card" style={{ width: '100%', maxWidth: '800px', textAlign: 'center' }}>
                        <h2 className="main-title small">{selectedProject.customName || "Revisar Contenido"}</h2>
                        <div style={{ margin: '20px 0', textAlign: 'left' }}>
                            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a3728', marginBottom: '8px' }}>
                                Contenido detectado:
                            </p>
                            <div style={{ 
                                backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', 
                                padding: '15px', maxHeight: '200px', overflowY: 'auto', fontSize: '14px', 
                                color: '#555', lineHeight: '1.5', whiteSpace: 'pre-wrap' 
                            }}>
                                {selectedProject[selectedPartKey] || "No hay texto guardado en esta sección."}
                            </div>
                        </div>
                        <div className="wf-actions-row" style={{ justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
                            <button type="button" onClick={() => setStep('parts')} className="btn-step secondary">
                                Volver atrás
                            </button>
                            <button 
                                type="button"
                                onClick={() => onCreateTest1({ 
                                    project: selectedProject, 
                                    constraints: selectedProject.attributeConstraints || "", 
                                    entityRelationships: selectedProject.entityRelationships || "",
                                    baseClass: selectedProject.baseClasses || "",
                                    targetType: selectedPartKey === 'attributeConstraints' ? 'attributes' : 'entityRelationships' 
                                })} 
                                disabled={!selectedProject[selectedPartKey]}
                                className="btn-step primary"
                                style={{ minWidth: '200px' }}
                            >
                                Generar Tests
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}