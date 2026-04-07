import React, { useState, useEffect } from "react";
import { Header } from "~src/components/Header";
import { parseMasterPrompt } from "~src/utils/promptParser";
import { sendToGemini } from "~src/services/geminiService";
import testAttributesPromptMarkdown from "bundle-text:../../prompts/generation-exam-repository/exam/generation_tests.md";

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

    // Variables de configuración de dominio (estilo StorageExamsIndex)
    const [currentConfig, setCurrentConfig] = useState({
        rootPackage: "es.us.dp1.chess.tournament",
        repo: "DP1-chess-template-exam"
    });

    useEffect(() => {
        if (!initialData?.project) return;

        const domain = (initialData.project.domainName || "").toLowerCase();

        // --- LÓGICA DE PLANTILLA (ESTILO STORAGEEXAMSINDEX) ---
        let TEMPLATE_REPO = "DP1-chess-template-exam";
        let ROOT_PACKAGE = "es.us.dp1.chess.tournament";
        let EXTRA_PACKAGES = [
            "es.us.dp1.chess.tournament.user",
            "es.us.dp1.chess.tournament.model",
            "es.us.dp1.chess.tournament.exceptions"
        ];

        if (domain.includes("clínica veterinaria") || domain.includes("veterinaria")) {
            TEMPLATE_REPO = "DP1-petClinic-template-exam";
            ROOT_PACKAGE = "org.springframework.samples.petclinic";
            EXTRA_PACKAGES = [
                "org.springframework.samples.petclinic.user",
                "org.springframework.samples.petclinic.model",
                "org.springframework.samples.petclinic.exceptions"
            ];
        }

        setCurrentConfig({ rootPackage: ROOT_PACKAGE, repo: TEMPLATE_REPO });
        // -------------------------------------------------------

        const enunciadoGeneral = initialData.project.extensionFinish || "";
        const restricciones = initialData.constraints || initialData.project.attributeConstraints || "";
        const baseClassesRaw = initialData.project.baseClasses || initialData.project.javaCode || "";

        const javaBlocks = [...baseClassesRaw.matchAll(/```java\n([\s\S]*?)```/g)]
            .map(m => m[1].trim());

        const packageLines = javaBlocks
            .map(block => (block.match(/^package\s+[\w.]+;/m) || [])[0])
            .filter(Boolean) as string[];

        const basePackageNames = packageLines.map(p =>
            p.replace(/^package\s+/, "").replace(/;$/, "")
        );

        const baseRootPackage = basePackageNames.length > 0
            ? basePackageNames.reduce((a, b) => {
                const partsA = a.split(".");
                const partsB = b.split(".");
                const common: string[] = [];
                for (let i = 0; i < Math.min(partsA.length, partsB.length); i++) {
                    if (partsA[i] === partsB[i]) common.push(partsA[i]);
                    else break;
                }
                return common.join(".");
            }, basePackageNames[0])
            : ROOT_PACKAGE;

        // Busca esta parte dentro del useEffect:
            const codigoLimpio = javaBlocks.map(block =>
                block
                    .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "") // Borrar comentarios
                    // MODIFICACIÓN AQUÍ:
                    // Solo borramos imports que NO sean del proyecto (como los de JUnit, Mockito, etc.)
                    // Queremos que los imports de 'org.springframework.samples.petclinic' se queden.
                    .replace(/^(?!package\s|import\s+org\.springframework\.samples\.petclinic)import\s.*;$/gm, "")
                    .replace(/^\s*[\r\n]/gm, "")
                    .trim()
            ).join("\n\n// ---\n\n");

        const contextInfo = `
=== PAQUETES DE LA PLANTILLA DEL PROYECTO ===
${EXTRA_PACKAGES.join("\n")}

REGLA CRÍTICA DE IMPORTS:
- Usa EXACTAMENTE estos paquetes para las clases que NO son base.
- Paquete raíz: ${ROOT_PACKAGE}
- El paquete de ESTE test (Test1.java) debe ser: ${baseRootPackage}.test;

=== CÓDIGO FUENTE REAL ===
${codigoLimpio}

=== ENUNCIADO ===
${enunciadoGeneral}

=== RESTRICCIONES DE ATRIBUTOS ===
${restricciones}
`;

        const { visibleText, hiddenContext: parsedHidden } = parseMasterPrompt(testAttributesPromptMarkdown || "");
        const finalPrompt = (visibleText || "").split(/\{\{DOMAIN\}\}/gi).join(domain).trim();

        setPromptText(finalPrompt);
        setHiddenContext(`${parsedHidden}\n\n${contextInfo}`);

    }, [initialData]);

    const executeGeneration = async () => {
        if (!promptText) return;
        setIsLoading(true);
        setResponseText("");

        try {
            const finalPayload = `
${hiddenContext}

${promptText}

=== REGLAS CRÍTICAS DE IMPORTACIÓN (ESTRICTO) ===
1. El paquete raíz absoluto es: ${currentConfig.rootPackage}
2. REGLA DE SUBPAQUETES: Todo subpaquete debe escribirse EXCLUSIVAMENTE EN MINÚSCULAS.
3. El paquete de ESTE test (Test1.java) debe ser el subpaquete .test de las clases base.
4. Usa las clases reales del código fuente proporcionado.

Genera Test1.java sin bloques markdown.
`.trim();

            const result = await sendToGemini(finalPayload);
            if (!result) throw new Error("Respuesta vacía");

            const cleanResult = result.replace(/```java/gi, "").replace(/```/gi, "").replace(/^java/i, "").trim();
            setResponseText(cleanResult);
            setInternalStep('result');
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveToChrome = () => {
        const projectId = initialData?.project?.id;
        if (!projectId) return;
        if (chrome?.storage?.local) {
            chrome.storage.local.get([projectId], (result) => {
                const updatedData = { 
                    ...result[projectId], 
                    ...initialData.project, 
                    javaTests: responseText, 
                    updatedAt: new Date().toISOString() 
                };
                chrome.storage.local.set({ [projectId]: updatedData }, () => { 
                    alert("¡Tests guardados con éxito!"); 
                    onWelcome(); 
                });
            });
        }
    };

    const handleGenerateClick = () => {
        const projectId = initialData?.project?.id;
        if (chrome?.storage?.local && projectId) {
            chrome.storage.local.get([projectId], (result) => {
                if (result[projectId]?.javaTests?.trim()) setShowOverwriteWarning(true);
                else executeGeneration();
            });
        } else { executeGeneration(); }
    };

    const handleDownload = () => {
        const blob = new Blob([responseText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Test1.java";
        link.click();
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
                                <textarea className="wf-textarea" style={{ height: '400px', fontFamily: 'monospace' }} value={promptText} onChange={(e) => setPromptText(e.target.value)} />
                                <div className="wf-actions-row" style={{ marginTop: '20px' }}>
                                    <button onClick={onBack} className="btn-step secondary">Volver</button>
                                    <button onClick={handleGenerateClick} className="btn-step primary" disabled={isLoading}>
                                        {isLoading ? "Generando..." : "Generar Tests"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="content-card">
                                <h2 className="main-title small">Resultado: Test1.java</h2>
                                <div className="wf-split-view">
                                    <div className="wf-column">
                                        <textarea className="wf-textarea" value={promptText} readOnly />
                                        <button onClick={handleGenerateClick} className="btn-step primary" disabled={isLoading}>Regenerar</button>
                                    </div>
                                    <div className="wf-column">
                                        <textarea className="wf-result-box" value={responseText} onChange={(e) => setResponseText(e.target.value)} style={{ fontSize: '11px' }} />
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={handleDownload} className="btn-step secondary">Descargar .java</button>
                                            <button onClick={handleSaveToChrome} className="btn-step primary" style={{ backgroundColor: '#28a745' }}>Guardar en Proyecto</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="wf-actions-row" style={{ marginTop: '20px' }}>
                                    <button type="button" onClick={() => setInternalStep('input')} className="btn-step secondary">Editar Prompt</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showOverwriteWarning && (
                <div className="modal-overlay">
                    <div className="content-card" style={{ maxWidth: "400px", textAlign: "center" }}>
                        <h3>⚠️ Tests existentes</h3>
                        <p>Ya existen tests guardados para este proyecto. ¿Deseas borrarlos y generar unos nuevos?</p>
                        <div className="wf-actions-row" style={{ justifyContent: "center" }}>
                            <button onClick={() => setShowOverwriteWarning(false)} className="btn-step secondary">Cancelar</button>
                            <button onClick={() => { setShowOverwriteWarning(false); executeGeneration(); }} className="btn-step primary">Sí, sobrescribir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}