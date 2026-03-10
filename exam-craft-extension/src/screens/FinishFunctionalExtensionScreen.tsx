import React, { useState } from "react"
import logoExamCraft from "../../assets/icon512.png"
import { MermaidViewer } from "../components/MermaidViewer"

interface Props {
    domainName: string;
    extensionFinish: string;
    onBack: () => void;
    onWelcome: () => void;
    onCreateExam: () => void;
    onCreateExamByParts: () => void;
    onFunctionalExtension: () => void;
    onStatementStep1: () => void;
    onCreateDiagram: (text: string) => void; 
}


export default function FinishFunctionalExtensionScreen({
    domainName, 
    extensionFinish,
    onBack, 
    onWelcome, 
    onCreateExam, 
    onCreateExamByParts, 
    onFunctionalExtension, 
    onCreateDiagram,
    onStatementStep1 
}: Props) {

    const cleanMermaidCode = (code: string) => {
        if (!code) return '';
        return code
            .replace(/<[^>]*>?/gm, '') 
            .replace(/&nbsp;/g, ' ')   
            .trim();
    };

    const handleSaveToChrome = () => {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
            
            const userChosenName = prompt("Introduce el nombre para guardar este examen:", `Examen de ${domainName}`);
            
            if (userChosenName === null) return;
            
            const finalName = userChosenName.trim() || `Examen de ${domainName}`;

            const dataToSave = {
                domainName: domainName, 
                customName: finalName,  
                extensionFinish: extensionFinish,
                savedAt: new Date().toISOString()
            };

            const storageKey = `project_${Date.now()}`;

            chrome.storage.local.set({ [storageKey]: dataToSave }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error al guardar:", chrome.runtime.lastError);
                    alert("No se pudo guardar en el almacenamiento local.");
                } else {
                    alert(`¡Examen "${finalName}" guardado con éxito en la carpeta de ${domainName.toUpperCase()}!`);
                }
            });
        } else {
            alert("Esta funcionalidad solo está disponible dentro de la Extensión de Chrome.");
        }
    };

    const extractMermaidCode = (fullText: string) => {
        if (!fullText) return "";
        const separatorRegex = /-{5,}|={5,}/; 
        const parts = fullText.split(separatorRegex);
        const diagramPart = parts.find(p => p.toLowerCase().includes("classdiagram") || p.toLowerCase().includes("graph")) || "";
        return diagramPart.replace(/.*?(classDiagram|graph)/is, "$1").trim();
    };

    const mermaidCode = extractMermaidCode(extensionFinish);

    return (
        <div className="exam-app">
            <header className="app-header">
                <div className="header-left">
                    <span className="logo-icon" onClick={onWelcome} style={{cursor: 'pointer'}}>
                        <img src={logoExamCraft} alt="Logo" width="60" height="60" />
                    </span> 
                    <nav className="breadcrumb-nav">
                        <span className="breadcrumb-link" onClick={onWelcome}>INICIO</span>
                        <span className="breadcrumb-separator">{'>'}</span>
                        <span className="breadcrumb-link" onClick={onCreateExam} >CREAR EXAMEN</span>
                        <span className="breadcrumb-separator">{'>'}</span>
                        <span className="breadcrumb-link" onClick={onCreateExamByParts} >POR PARTES</span>
                        <span className="breadcrumb-separator">{'>'}</span>
                        <span className="breadcrumb-link" onClick={onFunctionalExtension} >EXTENSIÓN FUNCIONAL</span>
                        <span className="breadcrumb-separator">{'>'}</span>
                        <span className="breadcrumb-link" onClick={onStatementStep1} >{domainName.toUpperCase()}</span>
                        <span className="breadcrumb-separator">{'>'}</span>
                        <span className="breadcrumb-current">EXTENSION FUNCIONAL COMPLETA</span>
                    </nav>
                </div>
            </header>

            <main className="main-content"> 
                <div className="wf-layout-container">
                    <div className="stepper-container">
                        <div className="step-wrapper step-completed">
                            <div className="step-circle">1</div>
                            <span className="step-label">Texto de enunciado</span>
                        </div>
                        <div className="step-line" style={{ background: '#4CAF50' }}></div>
                        <div className="step-wrapper step-completed">
                            <div className="step-circle">2</div>
                            <span className="step-label">Diagrama UML</span>
                        </div>
                    </div>

                    <div className="wf-wide-wrapper" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                        <h2 className="main-title small" style={{ textAlign: 'center', marginBottom: '20px' }}>
                            {domainName.toUpperCase()}: Resultado Final
                        </h2>

                        <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch', minHeight: '600px' }}>
                            
                            {/* COLUMNA IZQUIERDA: TEXTO COMPLETO */}
                            <div className="content-card" style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                                <p className="wf-instruction-text" style={{ fontWeight: 'bold' }}>Informe de la Extensión:</p>
                                <textarea 
                                    className="wf-textarea" 
                                    style={{ flex: 1, resize: 'none', fontSize: '13px', lineHeight: '1.6', padding: '15px' }}
                                    value={extensionFinish}
                                    readOnly
                                />
                            </div>

                            {/* COLUMNA DERECHA: DIAGRAMA RENDERIZADO */}
                            <div className="content-card" style={{ flex: '1.2', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '15px', overflow: 'hidden' }}>
                                <div style={{ padding: '10px', background: '#f8f9fa', borderBottom: '1px solid #eee', fontWeight: 'bold', textAlign: 'center', fontSize: '14px' }}>
                                    Visualización del Modelo UML
                                </div>
                                <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '20px' }}>
                                    {mermaidCode ? (
                                        <div style={{ width: '100%' }}>
                                            <MermaidViewer chartCode={cleanMermaidCode(mermaidCode)} />
                                        </div>
                                    ) : (
                                        <div style={{ color: '#aaa', marginTop: '50px' }}>No se pudo extraer el diagrama del texto.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ACCIONES FINALES */}
                        <div className="wf-actions-row" style={{ marginTop: '30px', justifyContent: 'center', gap: '20px' }}>
                            <button onClick={onBack} className="btn-step secondary" style={{ padding: '12px 30px' }}>
                                Volver a UML
                            </button>
                            
                            <button 
                                style={{ 
                                    background: 'transparent', 
                                    border: '1px solid #ccc', 
                                    color: '#333', 
                                    padding: '8px 16px', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    transition: 'background 0.3s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#f0f0f0'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                onClick={handleSaveToChrome}
                                title="Guardar en la extensión"
                            >
                                <svg 
                                    width="24" 
                                    height="24" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    style={{ verticalAlign: 'middle' }}
                                >
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                    <polyline points="7 3 7 8 15 8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}