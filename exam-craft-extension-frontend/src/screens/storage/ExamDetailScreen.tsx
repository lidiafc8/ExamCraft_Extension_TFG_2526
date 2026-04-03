import React, { useState } from "react";
import { marked } from 'marked';
import DOMPurify from 'dompurify';

import { MermaidViewer } from "../../components/MermaidViewer";
import { Header } from "../../components/Header"; // Importamos el Header común
import { 
    extractMermaidCode, 
    sanitizeMermaidForModal, 
    cleanMermaidCode 
} from "~src/utils/mermaidUtils";

export interface ExamDetailScreenProps {
    selectedProject: any;
    selectedDomainFolder: string;
    logoExamCraft: string;
    isCreating: boolean;
    
    onWelcome: () => void;
    onBack: () => void; 
    onGoToFolders: () => void;
    
    onDownload: () => void;
    onGitHubDeploy: () => void;
    onShowGeneratedCode: () => void;
    onDeleteProject: (id: string, e?: React.MouseEvent) => void;
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
    onDeleteProject
}) => {
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // CORRECCIÓN: Uso de Optional Chaining para evitar errores de lectura
    const mermaidCode = extractMermaidCode(selectedProject?.extensionFinish);
    const fullText = selectedProject?.extensionFinish || '';
    const mermaidMatch = fullText.match(/(classDiagram|graph)[\s\S]*/i);
    let introText = fullText;
    let modalMermaidCode = '';
    
    if (mermaidMatch) {
        introText = fullText.substring(0, mermaidMatch.index).trim();
        modalMermaidCode = sanitizeMermaidForModal(fullText);
    }

    const examFullMarkdown = `
# Examen ${selectedProject?.domainName}: ${selectedProject?.customName || `Examen de ${selectedProject?.domainName}`}

## 1. Extensión Funcional y Diagrama UML
${introText || '*Sin extensión funcional*'}

${modalMermaidCode ? `\`\`\`mermaid\n${modalMermaidCode}\n\`\`\`` : ''}

## 2. Restricciones de Atributos
${selectedProject?.attributeConstraints || '*Sin restricciones para atributos definidas*'}

## 3. Relaciones entre Entidades
${selectedProject?.entityRelations || '*Sin relaciones entre entidades definidas*'}
    `.trim();

    const rawHtml = marked.parse(examFullMarkdown) as string;
    const safeHtml = DOMPurify.sanitize(rawHtml);
                
    // CORRECCIÓN: Configuración para el componente Header
    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'EXÁMENES ANTERIORES', action: onGoToFolders },
        { label: selectedDomainFolder?.toUpperCase() || '', action: onBack },
    ];

    const currentTitle = selectedProject?.customName || `Examen de ${selectedProject?.domainName}`;

    return (
        <div className="exam-app" style={{ minHeight: '100vh', height: 'auto', overflow: 'visible', display: 'flex', flexDirection: 'column' }}>
            
            <Header 
                onWelcome={onWelcome} 
                breadcrumbItems={breadcrumbItems} 
                currentStep={currentTitle} 
            />

            <main className="main-content" style={{ padding: '30px', paddingBottom: '100px', height: 'auto', overflow: 'visible', flex: 1, position: 'relative' }}>
                
                <div style={{ position: 'absolute', top: '30px', right: '30px', zIndex: 150 }}>
                    <button 
                        type="button"
                        onClick={() => setShowActionsMenu(!showActionsMenu)}
                        style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#555', padding: '5px 10px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Opciones del examen"
                    >
                        &#8942;
                    </button>

                    {showActionsMenu && (
                        <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '10px', backgroundColor: 'white', border: '1px solid #e1e4e8', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '240px', transition: 'opacity 0.2s ease, transform 0.2s ease', transformOrigin: 'top right' }}>
                            <button type="button" onClick={() => { setShowPreviewModal(true); setShowActionsMenu(false); }} className="btn-back" style={{ margin: 0, width: '100%', backgroundColor: '#2e7d32', color: 'white', fontSize: '14px', padding: '10px' }}>
                                Previsualizar
                            </button>
                            <button type="button" onClick={() => { onDownload(); setShowActionsMenu(false); }} className="btn-back" style={{ margin: 0, width: '100%', backgroundColor: '#4a90e2', color: 'white', borderColor: '#4a90e2', fontSize: '14px', padding: '10px' }}>
                                Descargar (.md)
                            </button>
                            <button type="button" onClick={onGitHubDeploy} disabled={isCreating} className="btn-back" style={{ margin: 0, width: '100%', backgroundColor: isCreating ? "#666" : "#24292e", color: "white", cursor: isCreating ? "not-allowed" : "pointer", fontSize: '14px', padding: '10px' }}>
                                {isCreating ? "Generando Repositorio..." : "Crear repositorio GitHub"}
                            </button>
                            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '5px 0' }} />
                            <button type="button" onClick={(e) => { onDeleteProject(selectedProject?.id, e); setShowActionsMenu(false); }} className="btn-back" style={{ margin: 0, width: '100%', backgroundColor: '#ff4d4f', color: 'white', fontSize: '14px', padding: '10px' }}>
                                Eliminar
                            </button>
                        </div>
                    )}
                </div>

                <div className="section-block" style={{ marginBottom: '1px', marginTop: '40px' }}>
                    <h2 style={{ borderBottom: '2px solid #b08968', paddingBottom: '10px', marginBottom: '20px', width: 'calc(100% - 40px)' }}>Extensión Funcional</h2>
                </div>
                <div className="section-block" style={{ width: '80%', marginBottom: '0px' }}>
                    <div style={{ display: 'flex', gap: '10px', height: '600px' }}>
                        <div className="content-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginBottom: '10px' }}>ENUNCIADO Y CÓDIGO DIAGRAMA UML</h3>
                            <textarea className="wf-textarea" readOnly value={selectedProject?.extensionFinish} style={{ flex: 1, resize: 'none', padding: '15px', fontSize: '14px' }} />
                        </div>
                        <div className="content-card" style={{ flex: 1.5, backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginBottom: '10px' }}>ILUSTRACIÓN DIAGRAMA UML</h3>
                            <div style={{ flex: 1, overflow: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                                <MermaidViewer chartCode={cleanMermaidCode(mermaidCode)} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section-block" style={{ marginBottom: '1px', marginTop: '40px' }}>
                    <h2 style={{ borderBottom: '2px solid #b08968', paddingBottom: '10px', marginBottom: '1px' }}>Restricciones de Atributos</h2>
                </div>
                <div className="section-block" style={{ width: '200%', marginBottom: '50px' }}>
                        <div className="content-card" style={{ padding: '20px' }}>
                            {selectedProject?.attributeConstraints ? (
                                <textarea className="wf-textarea" readOnly value={selectedProject.attributeConstraints}
                                    style={{ width: '100%', minHeight: '500px', resize: 'vertical', padding: '15px', fontSize: '14px' }} />
                            ) : (
                                <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', margin: '30px 0' }}>
                                    Aún no se han creado las restricciones de atributos para este examen.
                                </p>
                            )}
                        </div>
                    </div>

                <div className="section-block" style={{ marginBottom: '1px' }}>
                    <h2 style={{ borderBottom: '2px solid #b08968', paddingBottom: '10px', marginBottom: '1px' }}>Relaciones entre Entidades</h2>
                </div>
                <div className="section-block" style={{ width: '200%', marginBottom: '50px' }}>
                        <div className="content-card" style={{ padding: '20px' }}>
                            {selectedProject?.entityRelations ? (
                                <textarea className="wf-textarea" readOnly value={selectedProject.entityRelations}
                                    style={{ width: '100%', minHeight: '200px', resize: 'vertical', padding: '15px', fontSize: '14px' }} />
                            ) : (
                                <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', margin: '30px 0' }}>
                                    Aún no se han creado las relaciones entre entidades para este examen.
                                </p>
                            )}
                        </div>
                </div>

                <div className="section-block" style={{ marginBottom: '1px' }}>
                    <h2 style={{ borderBottom: '2px solid #b08968', paddingBottom: '10px', marginBottom: '1px' }}>Código</h2>
                </div>
                <div className="section-block" style={{ width: '200%', marginBottom: '50px' }}>
                    <div className="content-card" style={{ padding: '20px' }}>
                        <button type="button" onClick={onShowGeneratedCode} className="btn-back" 
                            style={{ width: 'fit-content', alignSelf: 'center', margin: 20, backgroundColor: '#b08968', color: 'white', padding: '12px 30px', fontWeight: 'bold' }}>
                            Ver Código Generado
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    <button type="button" onClick={onBack} className="btn-back">Volver</button>
                </div>

                {showPreviewModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
                        <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '900px', height: '100%', maxHeight: '85vh', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '20px', borderBottom: '2px solid #b08968', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ margin: 0 }}>Previsualización del Examen</h2>
                                <button type="button" onClick={() => setShowPreviewModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✖</button>
                            </div>
                            <div style={{ padding: '30px', overflowY: 'auto', flex: 1, backgroundColor: '#fafafa' }}>
                                <div className="content-card exam-markdown-container" style={{ padding: '40px', backgroundColor: '#fff' }} dangerouslySetInnerHTML={{ __html: safeHtml }} />
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};