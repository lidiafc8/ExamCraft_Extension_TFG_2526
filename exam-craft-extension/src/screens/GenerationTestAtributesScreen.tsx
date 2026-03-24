import React, { useState, useEffect } from "react"
import logoExamCraft from "../../assets/icon512.png"
import { parseMasterPrompt } from "~src/utils/promptParser"
import { sendToGemini } from "~src/services/geminiService"
// Asegúrate de que esta ruta sea exacta
import testAttributesPromptMarkdown from "bundle-text:../prompts/generation-test-exercice/generation_tests.md"

interface Props {
    initialData: { project: any, constraints: string } | null;
    onBack: () => void
    onCreateExamByParts: () => void;
    onWelcome: () => void
    onCreateExam: () => void
}

export default function GenerationTestAtributesScreen({ 
    initialData, 
    onBack, 
    onCreateExamByParts, 
    onWelcome, 
    onCreateExam 
}: Props) {

    const [internalStep, setInternalStep] = useState<'input' | 'result'>('input');
    const [promptText, setPromptText] = useState("");
    const [hiddenContext, setHiddenContext] = useState("");
    const [responseText, setResponseText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialData?.project) {
            const parsed = testAttributesPromptMarkdown 
                ? parseMasterPrompt(testAttributesPromptMarkdown) 
                : { visibleText: "Genera los tests de atributos basándote en el siguiente contexto:", hiddenContext: "" };

            const { visibleText, hiddenContext: hc } = parsed;
            
            const domain = initialData.project.domainName || "Sin dominio";
            const enunciadoGeneral = initialData.project.extensionFinish || "Sin enunciado";
            const restricciones = initialData.constraints || "Sin restricciones detectadas";

            const contextBlock = `
=== CONTEXTO DEL EXAMEN ===
DOMINIO: ${domain}
ENUNCIADO Y DIAGRAMA:
${enunciadoGeneral}

=== RESTRICCIONES DE ATRIBUTOS ===
${restricciones}
===========================
`;
            const finalVisible = visibleText.replaceAll("{{DOMAIN}}", domain);
            setPromptText(contextBlock + "\n" + finalVisible);    
            setHiddenContext(hc);
        }
    }, [initialData]);

    const handleGenerateTests = async () => {
        if (!promptText) return;
        setIsLoading(true);
        setResponseText("");

        try {
            const finalPayload = `
            CONTEXTO INTERNO Y RECURSOS:
            ${hiddenContext}

            INSTRUCCIONES Y DATOS DEL EXAMEN:
            ${promptText}
            `;

            const result = await sendToGemini(finalPayload);
            
            setResponseText(result);
            setInternalStep('result');

            try {
                await fetch("http://localhost:3001/save-log", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        exercise: "attribute_tests",
                        domain: initialData?.project?.domainName,
                        response: result 
                    })
                });
            } catch (e) { /* Log server off */ }

        } catch (error) {
            console.error(error);
            alert("Error al conectar con Gemini.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- NUEVA FUNCIÓN DE GUARDADO ---
    const handleSaveToChrome = () => {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
            
            if (!initialData?.project?.id) {
                alert("Error: No se ha encontrado el ID del proyecto para guardar.");
                return;
            }

            // Creamos el objeto actualizado con los tests
            const updatedExamData = {
                ...initialData.project, 
                javaTests: responseText, // Guardamos los tests generados
                updatedAt: new Date().toISOString()
            };

            chrome.storage.local.set({ [initialData.project.id]: updatedExamData }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error al guardar:", chrome.runtime.lastError);
                    alert("No se pudo guardar el test en el almacenamiento.");
                } else {
                    alert("¡Tests guardados con éxito en el examen!");
                    onWelcome(); // Volvemos al inicio tras guardar
                }
            });
        } else {
            alert("El almacenamiento local de Chrome no está disponible.");
        }
    };

    const handleDownload = () => {
        if (!responseText) return;
        const fileName = `Tests_Atributos_${initialData?.project?.domainName || 'examen'}.md`;
        const content = `# Tests de Atributos\n\n${responseText}`;
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    };

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
                      <span className="breadcrumb-link" onClick={onCreateExam}>CREAR EXAMEN</span>
                      <span className="breadcrumb-separator">{'>'}</span>
                      <span className="breadcrumb-link" onClick={onCreateExamByParts}>POR PARTES</span>
                      <span className="breadcrumb-separator">{'>'}</span>
                      <span className="breadcrumb-link" onClick={onBack}>RESTRICCIONES</span>
                      <span className="breadcrumb-separator">{'>'}</span>
                      <span className="breadcrumb-current">TEST DE ATRIBUTOS</span>
                  </nav>
              </div>
          </header>  

          <main className="main-content"> 
            <div className="wf-layout-container">
                <div className="wf-wide-wrapper">
                    
                    {internalStep === 'input' && (
                        <div className="content-card" style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
                            <h2 className="main-title small">Generar Tests de Atributos</h2>
                            <p className="wf-instruction-text">Ajusta el prompt si es necesario y pulsa Generar Tests.</p>

                            <textarea 
                                className="wf-textarea" 
                                style={{ height: '450px', fontFamily: 'monospace' }} 
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                            />

                            <div className="wf-actions-row" style={{ marginTop: '20px' }}>
                                <button onClick={onBack} className="btn-step secondary">Volver</button>
                                <button onClick={handleGenerateTests} className="btn-step primary" disabled={isLoading}>
                                    {isLoading ? <div className="loading-spinner"></div> : 'Generar Tests'}
                                </button>
                            </div>
                        </div>
                    )}

                    {internalStep === 'result' && (
                        <div className="content-card" style={{ width: '100%', maxWidth: '1100px' }}>
                            <h2 className="main-title small">Tests Generados</h2>
                            <div className="wf-split-view">
                                <div className="wf-column">
                                    <span className="wf-column-title">Prompt y Contexto</span>
                                    <textarea 
                                        className="wf-textarea" 
                                        value={promptText}
                                        onChange={(e) => setPromptText(e.target.value)}
                                    />
                                    <button onClick={handleGenerateTests} className="btn-step primary" disabled={isLoading}>
                                        {isLoading ? 'Generando...' : 'Regenerar'}
                                    </button>
                                </div>
                                <div className="wf-column">
                                    <span className="wf-column-title">Tests de Atributos (Propuesta)</span>
                                    <textarea 
                                        className="wf-result-box"
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={handleDownload} className="btn-step secondary" style={{ flex: 1, backgroundColor: '#4a90e2', color: 'white' }}>
                                            Descargar .md
                                        </button>
                                        
                                        {/* BOTÓN DE GUARDADO AÑADIDO */}
                                        <button onClick={handleSaveToChrome} className="btn-step primary" style={{ flex: 1, backgroundColor: '#28a745' }}>
                                            Guardar en Examen
                                        </button>

                                        <button onClick={onWelcome} className="btn-step secondary" style={{ flex: 1 }}>
                                            Finalizar
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="wf-actions-row" style={{ marginTop: '20px' }}>
                                <button onClick={() => setInternalStep('input')} className="btn-step secondary">Volver al editor</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </main>
      </div>
    )
}