import React from "react"
import { MermaidViewer } from "../components/MermaidViewer"
import { Header } from "~src/components/Header";

declare var chrome: any;

interface Props {
    readonly domainName: string;
    readonly extensionStatement: string;  
    readonly extensionMermaid: string;
    readonly onBack: () => void;
    readonly onWelcome: () => void;
    readonly onCreateExam: () => void;
    readonly onCreateExamByParts: () => void;
    readonly onFunctionalExtension: () => void;
    readonly onStatementStep1: () => void;
    readonly onCreateDiagram: (text: string) => void; 
}

export default function FinishFunctionalExtensionScreen({
    domainName, 
    extensionStatement,
    extensionMermaid,
    onBack, 
    onWelcome, 
    onCreateExam, 
    onCreateExamByParts, 
    onFunctionalExtension, 
    onCreateDiagram,
    onStatementStep1 
}: Props) {

    const handleSaveToChrome = () => {
        if (globalThis.chrome?.storage?.local) {
            const userChosenName = prompt("Introduce el nombre para guardar este examen:", `Examen de ${domainName}`);
            if (userChosenName === null) return;
            
            const finalName = userChosenName.trim() || `Examen de ${domainName}`;

            const dataToSave = {
                domainName: domainName, 
                customName: finalName,  
                extensionStatement,
                extensionMermaid,
                savedAt: new Date().toISOString()
            };

            const storageKey = `project_${Date.now()}`;

            chrome.storage.local.set({ [storageKey]: dataToSave }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error al guardar:", chrome.runtime.lastError);
                    alert("No se pudo guardar en el almacenamiento local.");
                } else {
                    alert(`¡Examen "${finalName}" guardado con éxito en la carpeta de ${domainName.toUpperCase()}!`);
                    onWelcome();
                }
            });
        } else {
            alert("Esta funcionalidad solo está disponible dentro de la Extensión de Chrome.");
        }
    };

    const handleDownload = () => {
        const defaultName = `Extension_Funcional_${domainName}`;
        const userChosenName = prompt("Introduce el nombre para el archivo a descargar:", defaultName);
        if (userChosenName === null) return; 
        
        let finalFileName = userChosenName.trim() || defaultName;
        if (!finalFileName.toLowerCase().endsWith('.md')) finalFileName += '.md';

        const title = `Extensión Funcional - ${domainName}`;

        const markdownContent = `# ${title}\n\n## Enunciado\n${extensionStatement || "No hay texto de enunciado."}\n\n${extensionMermaid ? `\`\`\`mermaid\n${extensionMermaid}\n\`\`\`` : '*No se generó código Mermaid*'}\n`;

        const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = finalFileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'CREAR EXAMEN', action: onCreateExam },
        { label: 'POR PARTES', action: onCreateExamByParts },
        { label: 'EXTENSIÓN FUNCIONAL', action: onFunctionalExtension },
        { label: domainName.toUpperCase(), action: onStatementStep1 },
    ];

    return (
        <div className="exam-app">
            <Header onWelcome={onWelcome} breadcrumbItems={breadcrumbItems} currentStep={"EXTENSION FUNCIONAL COMPLETA"} />
            <main className="main-content"> 
                <div className="wf-layout-container">
                    <div className="stepper-container">
                        <div className="step-wrapper step-completed"><div className="step-circle">1</div><span className="step-label">Texto de enunciado</span></div>
                        <div className="step-line" style={{ background: '#4CAF50' }}></div>
                        <div className="step-wrapper step-completed"><div className="step-circle">2</div><span className="step-label">Diagrama UML</span></div>
                    </div>
                    <div className="wf-wide-wrapper" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                        <h2 className="main-title small" style={{ textAlign: 'center', marginBottom: '20px' }}>{domainName.toUpperCase()}: Resultado Final</h2>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch', minHeight: '600px' }}>
                            <div className="content-card" style={{ flex: '2', display: 'flex', flexDirection: 'column' }}>
                                <p className="wf-instruction-text" style={{ fontWeight: 'bold' }}>Informe de la Extensión:</p>
                                <textarea 
                                    className="wf-textarea" 
                                    style={{ flex: 1, resize: 'none', fontSize: '13px', lineHeight: '1.6', padding: '15px' }} 
                                    value={extensionStatement} 
                                    readOnly 
                                />
                            </div>
                            <div className="content-card" style={{ flex: '2', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '15px', overflow: 'hidden' }}>
                                <div style={{ padding: '10px', background: '#f8f9fa', borderBottom: '1px solid #eee', fontWeight: 'bold', textAlign: 'center', fontSize: '14px' }}>Visualización del Modelo UML</div>
                                <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '20px' }}>
                                    {extensionMermaid 
                                        ? <div style={{ width: '100%' }}><MermaidViewer chartCode={extensionMermaid} /></div> 
                                        : <div style={{ color: '#aaa', marginTop: '50px' }}>No se pudo extraer el diagrama del texto.</div>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="wf-actions-row" style={{ marginTop: '20px', justifyContent: 'center', gap: '20px' }}>
                            <button onClick={onBack} className="btn-step secondary" style={{ padding: '12px 30px' }}>Volver a UML</button>
                            <button onClick={handleDownload} className="btn-step secondary" style={{ padding: '12px 30px', backgroundColor: '#4a90e2', color: 'white', border: 'none' }}>Descargar (.md)</button>
                            <button onClick={handleSaveToChrome} className="btn-step primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                Guardar 
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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