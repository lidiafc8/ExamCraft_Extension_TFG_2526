import React, { useState, useEffect } from "react"
import logoExamCraft from "../../assets/icon512.png"
import carpeta from "../../assets/images/archive.png"
import examen from "../../assets/images/exam.png"
import attributesConstraintsPromptMarkdown from "bundle-text:../prompts/generation-constraints-attributes/generation_attribute_constraints_from_statement.md"
import { sendToGemini } from "~src/services/geminiService"

interface Props {
    onBack: () => void
    onWelcome: () => void
    onCreateExam: () => void
    onCreateExamByParts: () => void; // CORRECCIÓN 1: Añadido aquí
    onCreateTest1: (data: { project: any, constraints: string }) => void; 
}

// CORRECCIÓN 1: Añadido onCreateExamByParts a los parámetros
export default function GeneralGenerationTestScreen({ onBack, onWelcome, onCreateExam, onCreateExamByParts, onCreateTest1 }: Props) {
    const [step, setStep] = useState<'folders' | 'exams' | 'parts' | 'workflow'>('folders');
    
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedDomainFolder, setSelectedDomainFolder] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<any | null>(null);
    const [selectedPartKey, setSelectedPartKey] = useState<string>("");

    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [savedData, setSavedData] = useState<{ project: any, constraints: string } | null>(null);

    const allowedFolders = ["clínica veterinaria", "ajedrez"];

    useEffect(() => {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.get(null, (items) => {
                const projectList = Object.keys(items)
                    .filter(key => key.startsWith('project_'))
                    .map(key => ({ id: key, ...items[key] }))
                    .filter(p => p.attributeConstraints && p.attributeConstraints.trim().length > 10);
                setProjects(projectList);
            });
        }
    }, []);

    const projectsInFolder = projects.filter(p => 
        p.domainName && selectedDomainFolder && p.domainName.toLowerCase() === selectedDomainFolder.toLowerCase()
    );

    // CORRECCIÓN APLICADA AQUÍ: Quitamos 'attributeConstraints' de la lista negra
    // y añadimos las keys de metadata (savedAt, updatedAt, extensionFinish)
    const getAvailableParts = (project: any) => {
        const forbiddenKeys = ["id", "domainName", "customName", "extensionFinish", "savedAt", "updatedAt"];
        return Object.keys(project).filter(key => !forbiddenKeys.includes(key));
    };

    const handleSelectFolder = (folder: string) => {
        setSelectedDomainFolder(folder);
        setStep('exams');
    };

    const handleSelectProject = (project: any) => {
        setSelectedProject(project);
        setStep('parts');
    };

    const handleSelectPart = (partKey: string) => {
        setSelectedPartKey(partKey);
        setStep('workflow');
    };


    return (
        <div className="exam-app" style={{ position: 'relative' }}>
            
            {/* MODAL ÉXITO */}
            {showSuccessModal && savedData && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="content-card" style={{ maxWidth: '400px', width: '90%', padding: '30px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>✅</div>
                        <h3 className="main-title small" style={{ marginBottom: '10px', color: '#4a3728' }}>
                            ¡Test Generado!
                        </h3>
                        <p style={{ marginBottom: '25px', color: '#555', fontSize: '15px' }}>
                            Se han extraído las restricciones de la parte seleccionada.
                        </p>
                        <button 
                            // CORRECCIÓN 3: Cambiado onCreateTest por onCreateTest1
                            onClick={() => { setShowSuccessModal(false); onCreateTest1(savedData); }} 
                            className="btn-step primary" 
                            style={{ width: '100%' }}
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            )}

            <header className="app-header">
                <div className="header-left">
                    <span className="logo-icon" onClick={onWelcome} style={{ cursor: 'pointer' }}>
                        <img src={logoExamCraft} alt="Logo" width="60" height="60" />
                    </span> 
                    <nav className="breadcrumb-nav">
                      <span className="breadcrumb-link" onClick={onWelcome}>INICIO</span>
                      <span className="breadcrumb-separator">{'>'}</span>
                      <span className="breadcrumb-link" onClick={onCreateExam}>CREAR EXAMEN</span>
                      <span className="breadcrumb-separator">{'>'}</span>
                      <span className="breadcrumb-link" onClick={onCreateExamByParts}>POR PARTES</span>
                      <span className="breadcrumb-separator">{'>'}</span>
                      <span className="breadcrumb-current">TEST DE ATRIBUTOS</span>
                  </nav>
                </div>
            </header>

            <main className="main-content">
                
                {/* PASO 1: CARPETAS */}
                {step === 'folders' && (
                    <div className="content-card" style={{ width: '100%', maxWidth: '900px' }}>
                        <h2 className="main-title small">Selecciona un dominio</h2>
                        <p className="wf-instruction-text" style={{ textAlign: 'center' }}>
                            Elige la carpeta del dominio para generar un test sobre una de sus partes.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '30px', marginTop: '30px', padding: '20px' }}>
                            {allowedFolders.map((folderName) => (
                                <div key={folderName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <img 
                                        src={carpeta} 
                                        alt="Carpeta" 
                                        width="90" 
                                        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                        onClick={() => handleSelectFolder(folderName)}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    />
                                    <span style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '14px', color: '#4a3728', textAlign: 'center', textTransform: 'capitalize' }}>
                                        {folderName}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="wf-actions-row" style={{ marginTop: '30px' }}>
                            <button onClick={onBack} className="btn-step secondary">Volver</button>
                        </div>
                    </div>
                )}

                {/* PASO 2: EXÁMENES */}
                {step === 'exams' && selectedDomainFolder && (
                    <div className="content-card" style={{ width: '100%', maxWidth: '900px' }}>
                        <h2 className="main-title small">Exámenes de {selectedDomainFolder.toUpperCase()}</h2>
                        <p className="wf-instruction-text" style={{ textAlign: 'center' }}>
                            Haz clic en el examen específico que deseas utilizar.
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '30px', marginTop: '30px', padding: '20px' }}>
                            {projectsInFolder.length > 0 ? (
                                projectsInFolder.map((proj) => (
                                    <div key={proj.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span 
                                            className="parts-exam-icon" 
                                            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '110px', width: '100%' }}
                                            onClick={() => handleSelectProject(proj)}
                                        >
                                            <img 
                                                src={examen} 
                                                alt="Abrir" 
                                                width="80" 
                                                height="80" 
                                                style={{ transition: 'transform 0.2s' }} 
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            />
                                        </span>
                                        <span style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '14px', color: '#4a3728', textAlign: 'center' }}>
                                            {proj.customName || `Examen de ${proj.domainName}`}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>No hay exámenes con contenido en esta carpeta.</p>
                            )}
                        </div>

                        <div className="wf-actions-row" style={{ marginTop: '30px' }}>
                            <button onClick={() => setStep('folders')} className="btn-step secondary">Volver a carpetas</button>
                        </div>
                    </div>
                )}

                {/* PASO 3: PARTES DEL EXAMEN */}
                {step === 'parts' && selectedProject && (
                    <div className="content-card" style={{ width: '100%', maxWidth: '900px' }}>
                        <h2 className="main-title small">¿Qué parte quieres evaluar?</h2>
                        <p className="wf-instruction-text" style={{ textAlign: 'center' }}>
                            Selecciona una sección del examen <strong>{selectedProject.customName || selectedProject.domainName}</strong>
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '30px', marginTop: '30px', padding: '20px', justifyContent: 'center' }}>
                            {getAvailableParts(selectedProject)
                                .filter(key => key.toLowerCase().includes('attribute'))
                                .map(key => (
                                    <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span 
                                            className="parts-exam-icon" 
                                            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '110px', width: '100%' }}
                                            onClick={() => handleSelectPart(key)}
                                        >
                                            <img 
                                                src={examen} 
                                                alt="Restricciones" 
                                                width="80" 
                                                height="80" 
                                                style={{ transition: 'transform 0.2s' }} 
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            />
                                        </span>
                                        <span style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '14px', color: '#4a3728', textAlign: 'center' }}>
                                            Restricciones de Atributos
                                        </span>
                                    </div>
                                ))}
                        </div>
                        
                        <div className="wf-actions-row" style={{ marginTop: '30px' }}>
                            <button onClick={() => setStep('exams')} className="btn-step secondary">Volver a exámenes</button>
                        </div>
                    </div>
                )}

                {/* PASO 4: GENERACIÓN Y VISTA PREVIA */}
                {step === 'workflow' && selectedProject && (
                    <div className="content-card" style={{ width: '100%', maxWidth: '800px', textAlign: 'center' }}>
                        <h2 className="main-title small">{selectedProject.customName || "Revisar Contenido"}</h2>
                        
                        <div style={{ margin: '20px 0', textAlign: 'left' }}>
                            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a3728', marginBottom: '8px' }}>
                                Contenido detectado en "Restricciones de Atributos":
                            </p>
                            <div style={{ 
                                backgroundColor: '#fff', 
                                border: '1px solid #ddd', 
                                borderRadius: '8px', 
                                padding: '15px', 
                                maxHeight: '200px', 
                                overflowY: 'auto', 
                                fontSize: '14px', 
                                color: '#555',
                                lineHeight: '1.5',
                                whiteSpace: 'pre-wrap' 
                            }}>
                                {selectedProject[selectedPartKey] || "No hay texto guardado en esta sección."}
                            </div>
                        </div>
                        
                        <div className="wf-actions-row" style={{ justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
                            <button onClick={() => setStep('parts')} className="btn-step secondary" disabled={isLoading}>
                                Volver atrás
                            </button>
                            <button 
                                // CORRECCIÓN 2: Añadido () => para que no se ejecute solo al cargar
                                onClick={() => onCreateTest1({ project: selectedProject, constraints: selectedProject[selectedPartKey] })} 
                                disabled={isLoading || !selectedProject[selectedPartKey]}
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
    )
}