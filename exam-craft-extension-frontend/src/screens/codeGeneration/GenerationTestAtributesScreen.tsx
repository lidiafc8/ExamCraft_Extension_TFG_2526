import React, { useState, useEffect } from "react"
import { Header } from "~src/components/Header" 
import { parseMasterPrompt } from "~src/utils/promptParser"
import { sendToGemini } from "~src/services/geminiService"
import testAttributesPromptMarkdown from "bundle-text:../../prompts/generation-exam-repository/generation_tests.md"

declare var chrome: any;

interface Props {
    readonly initialData: { project: any; constraints: string } | null;
    readonly source: 'attributes' | 'general'; 
    readonly onBack: () => void;
    readonly onCreateExamByParts: () => void;
    readonly onWelcome: () => void;
    readonly onCreateExam: () => void;
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
    const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);

    useEffect(() => {
        if (initialData?.project) {
            const domain = initialData.project.domainName || initialData.project.name || "Sin dominio";
            const enunciadoGeneral = initialData.project.extensionFinish || "";
            const restricciones = initialData.constraints || "";
            const codigoGenerado = initialData.project.javaCode || "";

            // LIMPIEZA DE CÓDIGO: Quitamos ruido para ahorrar tokens y evitar bloqueos de cuota
            const codigoLimpio = codigoGenerado
                .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "") // Quitar comentarios
                .replace(/^import .*;$/gm, "")                      // Quitar imports
                .replace(/^\s*[\r\n]/gm, "")                        // Quitar líneas vacías
                .trim();

            const { visibleText, hiddenContext: parsedHidden } = parseMasterPrompt(testAttributesPromptMarkdown || "");

            const contextoOculto = `
=== CÓDIGO FUENTE REAL (CLASES Y ATRIBUTOS) ===
${codigoLimpio}

=== ENUNCIADO Y RESTRICCIONES ===
${enunciadoGeneral}
${restricciones}
`;
            
            const finalPrompt = (visibleText || "")
                .split(/\{\{DOMAIN\}\}/gi).join(domain)
                .trim();

            setPromptText(finalPrompt);
            setHiddenContext(`${parsedHidden}\n\n${contextoOculto}`); 
        }
    }, [initialData]);

    const executeGeneration = async () => {
        if (!promptText) return;
        setIsLoading(true);
        setResponseText("");

        try {
            // Construcción del payload limpia: usamos el prompt que ya tiene las reglas de paquetes
            const finalPayload = `
${hiddenContext}

${promptText}

Genera el código de Test1.java siguiendo las instrucciones anteriores.
NO incluyas bloques de código markdown (\`\`\`java).
`.trim();

            const result = await sendToGemini(finalPayload);
            
            if (!result) throw new Error("La IA devolvió una respuesta vacía");

            const cleanResult = result
                .replace(/```java/gi, "")
                .replace(/```/gi, "")
                .replace(/^java/i, "") 
                .trim();
            
            setResponseText(cleanResult);
            setInternalStep('result');

        } catch (error: any) {
            console.error("DEBUG Gemini Error:", error);
            alert(`Error de conexión: ${error.message || "Consulta la consola"}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveToChrome = () => {
        const projectId = initialData?.project?.id;
        if (!projectId) return alert("Error: ID de proyecto no encontrado.");

        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.get([projectId], (result) => {
                const existingProject = result[projectId] || {};
                const updatedData = {
                    ...existingProject,
                    ...initialData.project,
                    javaTests: responseText,
                    updatedAt: new Date().toISOString()
                };

                chrome.storage.local.set({ [projectId]: updatedData }, () => {
                    alert("¡Tests guardados!");
                    onWelcome(); 
                });
            });
        }
    };

    const handleGenerateClick = () => {
        const projectId = initialData?.project?.id;
        if (typeof chrome !== "undefined" && chrome.storage?.local && projectId) {
            chrome.storage.local.get([projectId], (result) => {
                const project = result[projectId];
                if (project?.javaTests?.trim()) {
                    setShowOverwriteWarning(true);
                } else {
                    executeGeneration();
                }
            });
        } else {
            executeGeneration();
        }
    };

    const handleDownload = () => {
        if (!responseText) return;
        const blob = new Blob([responseText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Test1.java";
        link.click();
        URL.revokeObjectURL(url);
    };

    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'CREAR EXAMEN', action: onCreateExam },
        { label: 'POR PARTES', action: onCreateExamByParts },
        { label: source === 'attributes' ? 'RESTRICCIONES' : 'TESTS', action: onBack }
    ];

    return (
        <div className="exam-app">
            <Header onWelcome={onWelcome} breadcrumbItems={breadcrumbItems} currentStep="GENERACIÓN DE TEST" />
            <main className="main-content"> 
                <div className="wf-layout-container">
                    <div className="wf-wide-wrapper">
                        {internalStep === 'input' ? (
                            <div className="content-card">
                                <h2 className="main-title small">Configuración del Test</h2>
                                <textarea 
                                    className="wf-textarea" 
                                    style={{ height: '400px', fontFamily: 'monospace' }} 
                                    value={promptText}
                                    onChange={(e) => setPromptText(e.target.value)}
                                />
                                <div className="wf-actions-row" style={{ marginTop: '20px' }}>
                                    <button onClick={onBack} className="btn-step secondary">Volver</button>
                                    <button onClick={handleGenerateClick} className="btn-step primary" disabled={isLoading}>
                                        {isLoading ? "Generando" : 'Generar'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="content-card" style={{ maxWidth: '1100px' }}>
                                <h2 className="main-title small">Resultado: Test1.java</h2>
                                <div className="wf-split-view">
                                    <div className="wf-column">
                                        <span className="wf-column-title">Prompt final</span>
                                        <textarea className="wf-textarea" value={promptText} readOnly />
                                        <button onClick={handleGenerateClick} className="btn-step primary" disabled={isLoading}>Regenerar</button>
                                    </div>
                                    <div className="wf-column">
                                        <span className="wf-column-title">Código Generado</span>
                                        <textarea className="wf-result-box" value={responseText} onChange={(e) => setResponseText(e.target.value)} style={{ fontSize: '11px' }} />
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={handleDownload} className="btn-step secondary" style={{ flex: 1 }}>Descargar</button>
                                            <button onClick={handleSaveToChrome} className="btn-step primary" style={{ flex: 1, backgroundColor: '#28a745' }}>Guardar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            {showOverwriteWarning && (
                <div className="modal-overlay">
                    <div className="content-card" style={{ maxWidth: "400px", textAlign: "center" }}>
                        <h3>⚠️ Aviso</h3>
                        <p>Ya existen tests. ¿Deseas regenerarlos con el nuevo contexto?</p>
                        <div className="wf-actions-row" style={{ justifyContent: "center" }}>
                            <button onClick={() => setShowOverwriteWarning(false)} className="btn-step secondary">No</button>
                            <button onClick={() => { setShowOverwriteWarning(false); executeGeneration(); }} className="btn-step primary">Sí, sobrescribir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}