import React, { useState, useEffect } from "react"
import logoExamCraft from "../../assets/icon512.png"
import { parseMasterPrompt } from "~src/utils/promptParser"
import { sendToGemini } from "~src/services/geminiService"
import testAttributesPromptMarkdown from "bundle-text:../prompts/generation-test-exercice/generation_tests.md"

interface Props {
    readonly initialData: { project: any, constraints: string } | null;
    readonly source: 'attributes' | 'general'; 
    readonly onBack: () => void
    readonly onCreateExamByParts: () => void;
    readonly onWelcome: () => void
    readonly onCreateExam: () => void
}

export default function GenerationTestAtributesScreen({ 
    initialData, 
    source, 
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
            const domain = initialData.project.domainName || "Sin dominio";
            const enunciadoGeneral = initialData.project.extensionFinish || "Sin enunciado";
            const restricciones = initialData.constraints || "Sin restricciones detectadas";

            const contextoOculto = `
=== ENUNCIADO Y DIAGRAMA ===
${enunciadoGeneral}

=== RESTRICCIONES DE ATRIBUTOS ===
${restricciones}
`;
            
            let rawPrompt = testAttributesPromptMarkdown || "Genera tests de atributos para el dominio {{DOMAIN}}.";
            
            const { visibleText, hiddenContext: parsedHidden } = parseMasterPrompt(rawPrompt);

            // Corregido: Usamos split/join para evitar problemas de compatibilidad y bugs de Sonar
            let finalPrompt = visibleText
                .split(/\{\{context\}\}/gi).join("")
                .split(/\{\{DOMAIN\}\}/gi).join(domain)
                .trim();

            setPromptText(finalPrompt);
            setHiddenContext(parsedHidden + "\n\n" + contextoOculto); 
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
            } catch (logError) {
                console.error("Error al guardar el log:", logError);
            }

        } catch (error) {
            console.error(error);
            alert("Error al conectar con Gemini.");
        } finally {
            setIsLoading(false);
        }
    };

    // Estilo común para que los botones parezcan enlaces de texto (Breadcrumbs)
    const breadcrumbButtonStyle: React.CSSProperties = {
        background: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
        font: 'inherit',
        color: '#4a3728', // Tu color marrón
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'inline'
    };

    return (
      <div className="exam-app">
          <header className="app-header">
              <div className="header-left">
                  {/* Botón del logo invisible */}
                  <button 
                    type="button"
                    className="logo-icon" 
                    onClick={onWelcome} 
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', outline: 'none' }}
                  >
                      <img src={logoExamCraft} alt="Logo" width="60" height="60" />
                  </button>

                  <nav className="breadcrumb-nav">
                      <button type="button" style={breadcrumbButtonStyle} onClick={onWelcome}>INICIO</button>
                      <span className="breadcrumb-separator">{' > '}</span>
                      
                      <button type="button" style={breadcrumbButtonStyle} onClick={onCreateExam}>CREAR EXAMEN</button>
                      <span className="breadcrumb-separator">{' > '}</span>
                      
                      <button type="button" style={breadcrumbButtonStyle} onClick={onCreateExamByParts}>POR PARTES</button>
                      <span className="breadcrumb-separator">{' > '}</span>
                      
                      <button type="button" style={breadcrumbButtonStyle} onClick={onBack}>
                          {source === 'attributes' ? 'RESTRICCIONES DE ATRIBUTOS' : 'TESTS GENERALES'}
                      </button>
                      
                      <span className="breadcrumb-separator">{' > '}</span>
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
                                        <button onClick={() => {}} className="btn-step secondary" style={{ flex: 1, backgroundColor: '#4a90e2', color: 'white' }}>
                                            Descargar .md
                                        </button>
                                        
                                        <button onClick={() => {}} className="btn-step primary" style={{ flex: 1, backgroundColor: '#28a745' }}>
                                            Guardar
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