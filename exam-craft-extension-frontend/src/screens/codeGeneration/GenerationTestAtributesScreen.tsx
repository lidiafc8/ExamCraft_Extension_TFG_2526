import React, { useState, useEffect } from "react";
import { Header } from "~src/components/Header";
import { parseMasterPrompt } from "~src/utils/promptParser";
import { sendToGemini } from "~src/services/geminiService";
import testAttributesPromptMarkdown from "bundle-text:../../prompts/generation-exam-repository/exam/generation_tests_attributes.md";
import testRelationshipsPromptMarkdown from "bundle-text:../../prompts/generation-exam-repository/exam/generation_tests_relationships.md";

declare var chrome: any;

interface Props {
    readonly initialData: { 
        project: any; 
        constraints: string; 
        entityRelationships: string; 
        baseClass: string;
        targetType?: 'attributes' | 'entityRelationships';
    } | null;
    readonly source: 'attributes' | 'entityRelationships' | 'general';
    readonly onBack: () => void;
    readonly onCreateExamByParts: () => void;
    readonly onWelcome: () => void;
    readonly onCreateExam: () => void;
    readonly onCodeGeneration: () => void;

}

export default function GenerationTestScreen({
    initialData,
    source,
    onBack,
    onCreateExamByParts,
    onWelcome,
    onCreateExam,
    onCodeGeneration,
}: Props) {
    const [internalStep, setInternalStep] = useState<'input' | 'result'>('input');
    const [promptText, setPromptText] = useState("");
    const [hiddenContext, setHiddenContext] = useState("");
    const [responseText, setResponseText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [currentConfig, setCurrentConfig] = useState({
        rootPackage: "es.us.dp1.chess.tournament",
        repo: "DP1-chess-template-exam"
    });

    useEffect(() => {
        if (!initialData?.project) return;

        const domain = (initialData.project.domainName || "").toLowerCase();

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
        const baseClassesRaw = initialData.baseClass || initialData.project.baseClasses || initialData.project.javaCode || "";

        let targetPromptMarkdown = "";
        let contextToEvaluate = "";

        const isEntityRelationshipsTest = 
            source === 'entityRelationships' || 
            (source === 'general' && initialData.targetType === 'entityRelationships');

        if (isEntityRelationshipsTest) {
            targetPromptMarkdown = testRelationshipsPromptMarkdown;
            contextToEvaluate = initialData.entityRelationships || initialData.project.entityRelationships || "";
        } else {
            targetPromptMarkdown = testAttributesPromptMarkdown;
            contextToEvaluate = initialData.constraints || initialData.project.attributeConstraints || "";
        }

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

            const codigoLimpio = javaBlocks.map(block =>
                block
                    .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "") // NOSONAR javascript:S5852
                    .replace(/^(?!package\s|import\s+org\.springframework\.samples\.petclinic)import\s.*;$/gm, "")
                    .replace(/^\s*[\r\n]/gm, "") // NOSONAR javascript:S5852
                    .trim()
            ).join("\n\n// ---\n\n");

        const contextInfo = `
=== PAQUETES DE LA PLANTILLA DEL PROYECTO ===
${EXTRA_PACKAGES.join("\n")}

REGLA CRÍTICA DE IMPORTS:
- Usa EXACTAMENTE estos paquetes para las clases que NO son base.
- Paquete raíz: ${ROOT_PACKAGE}
- El paquete de ESTE test ${isEntityRelationshipsTest? `(Test2.java)`: `(Test1.java)`} debe ser: ${baseRootPackage};

=== CÓDIGO FUENTE REAL ===
${codigoLimpio}

=== ENUNCIADO ===
${enunciadoGeneral}

=== REGLAS A EVALUAR (RESTRICCIONES / RELACIONES) ===
${contextToEvaluate}
`;

        const { visibleText, hiddenContext: parsedHidden } = parseMasterPrompt(targetPromptMarkdown || "");
        const finalPrompt = (visibleText || "").split(/\{\{DOMAIN\}\}/gi).join(domain).trim();

        setPromptText(finalPrompt);
        setHiddenContext(`${parsedHidden}\n\n${contextInfo}`);

    }, [initialData, source]);

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
3. El paquete de ESTE test ${isEntityRelationshipsTest? `(Test2.java)`: `(Test1.java)`} debe ser el subpaquete .test de las clases base.
4. Usa las clases reales del código fuente proporcionado.

Genera ${isEntityRelationshipsTest? `(Test2.java)`: `(Test1.java)`} sin bloques markdown.
`.trim();

            const result = await sendToGemini(finalPayload);
            if (!result) throw new Error("Respuesta vacía");

            const cleanResult = result.replaceAll(/```java/gi, "").replaceAll(/```/gi, "").replace(/^java/i, "").trim(); 
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
                const existingProject = result[projectId] || {};
                
                const testParts: Record<string, { fileName: string, code: string }> = existingProject.testPartsMap || {};
                
                const partKey = isEntityRelationshipsTest ? 'test2_relationships' : 'test1_attributes';
                const fileName = isEntityRelationshipsTest ? 'Test2.java' : 'Test1.java';
                
                testParts[partKey] = {
                    fileName: fileName,
                    code: responseText
                };

                const updatedData = { 
                    ...existingProject, 
                    ...initialData.project, 
                    testPartsMap: testParts,
                    updatedAt: new Date().toISOString() 
                };

                chrome.storage.local.set({ [projectId]: updatedData }, () => { 
                    alert("¡Tests guardados con éxito!"); 
                    onWelcome(); 
                });
            });
        }
    };

    const handleDownload = () => {
        const blob = new Blob([responseText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        const testPrefix = isEntityRelationshipsTest ? "Test2" : "Test1";
        const projectName = initialData?.project?.customName || "Generado";
        link.download = `${testPrefix}-${projectName}.java`;

        link.click();
    };

    const baseBreadcrumbs = [
        { label: 'INICIO', action: onWelcome },
        { label: 'CREAR EXAMEN', action: onCreateExam },
        { label: 'POR PARTES', action: onCreateExamByParts }
    ];

    let dynamicBreadcrumbs: Array<{ label: string; action: () => void }> = [];

    if (source === 'general') {
        dynamicBreadcrumbs = [
            { label: 'CÓDIGO', action: onCodeGeneration },
            { label: 'TESTS', action: onBack }
        ];
    } else if (source === 'attributes') {
        dynamicBreadcrumbs = [
            { label: 'RESTRICCIONES', action: onBack }
        ];
    } else if (source === 'entityRelationships') {
        dynamicBreadcrumbs = [
            { label: 'RELACIONES ENTRE ENTIDADES', action: onBack }
        ];
    }

    const breadcrumbItems = [...baseBreadcrumbs, ...dynamicBreadcrumbs];

    const isEntityRelationshipsTest = 
        source === 'entityRelationships' || 
        (source === 'general' && initialData?.targetType === 'entityRelationships');

    const currentStepLabel = isEntityRelationshipsTest 
        ? "TESTS DE RELACIONES" 
        : "TESTS DE RESTRICCIONES";

    return (
        <div className="exam-app">
            <Header onWelcome={onWelcome} breadcrumbItems={breadcrumbItems} currentStep={currentStepLabel} />
            <main className="main-content">
                <div className="wf-layout-container">
                    <div className="wf-wide-wrapper" style={{ width: "100%", boxSizing: "border-box" }}>
                        {internalStep === 'input' ? (
                            <div className="content-card">
                                <h2 className="main-title small">Configuración del Test</h2>
                                
                                <textarea 
                                    className="wf-textarea-input" 
                                    style={{ height: '400px', fontFamily: 'monospace', width: "100%", boxSizing: "border-box" }} 
                                    value={promptText} 
                                    onChange={(e) => setPromptText(e.target.value)} 
                                />
                                
                                <div className="wf-actions-row">
                                    <button onClick={onBack} className="btn-back">Volver</button>
                                    <button onClick={executeGeneration} className="btn-step primary" disabled={isLoading}>
                                        {isLoading ? <div className="loading-spinner"></div> : "Generar Tests"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                        <div className="content-card" style={{ width: "100%", boxSizing: "border-box", overflowX: "hidden" }}>
                            <h2 className="main-title small">Resultado: {isEntityRelationshipsTest ? `Test2.java` : `Test1.java`}</h2>
                            
                            <div className="wf-split-view" style={{ display: "flex", flexWrap: "wrap", width: "100%", maxWidth: "100%", gap: "20px", boxSizing: "border-box" }}>
                                
                                <div className="wf-column" style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column" }}>
                                    <span className="wf-column-title">Prompt enviado</span>
                                    <textarea 
                                        className="wf-textarea-input" 
                                        value={promptText} 
                                        readOnly 
                                        style={{ width: "100%", boxSizing: "border-box", flexGrow: 1 }}
                                    />
                                    <button onClick={executeGeneration} className="btn-step primary" disabled={isLoading} style={{ marginTop: "10px" }}>
                                        {isLoading ? '...' : 'Regenerar'}
                                    </button>
                                </div>
                                
                                <div className="wf-column" style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column" }}>
                                    <span className="wf-column-title">Código generado</span>
                                    
                                    {isLoading ? (
                                        <div className="wf-result-box" style={{ width: "100%", boxSizing: "border-box", flexGrow: 1, fontSize: '11px' }}>
                                            Generando...
                                        </div>
                                    ) : (
                                        <textarea 
                                            className="wf-result-box" 
                                            value={responseText} 
                                            onChange={(e) => setResponseText(e.target.value)} 
                                            style={{ width: "100%", boxSizing: "border-box", flexGrow: 1, fontSize: '11px' }} 
                                        />
                                    )}
                                    
                                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                                        <button 
                                            onClick={handleDownload} 
                                            className="btn-step secondary"
                                            style={{ flex: 1, minWidth: "140px" }}
                                        >
                                            Descargar .java
                                        </button>
                                        <button 
                                            onClick={handleSaveToChrome} 
                                            className="btn-step primary" 
                                            style={{ flex: 1, backgroundColor: '#28a745', minWidth: "140px" }}
                                        >
                                            Guardar en Proyecto
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="wf-actions-row" style={{ marginTop: "20px", justifyContent: "center" }}>
                                <button type="button" onClick={() => setInternalStep('input')} className="btn-step secondary">
                                    Editar Prompt
                                </button>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}