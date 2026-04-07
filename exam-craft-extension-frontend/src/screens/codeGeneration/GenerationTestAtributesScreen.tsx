import React, { useState, useEffect } from "react"
import { Header } from "~src/components/Header" 
import { parseMasterPrompt } from "~src/utils/promptParser"
import { sendToGemini } from "~src/services/geminiService"
import { GithubService } from "~src/services/githubService"
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

function getTemplateInfo(domainName: string) {
    const domain = (domainName || "").toLowerCase();
    if (domain.includes("clínica veterinaria") || domain.includes("veterinaria")) {
        return {
            repo: "DP1-petClinic-template-exam",
            rootPackage: "org.springframework.samples.petclinic"
        };
    }
    return {
        repo: "DP1-chess-template-exam",
        rootPackage: "es.us.dp1.chess.tournament"
    };
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

    const [templatePackagesInfo, setTemplatePackagesInfo] = useState<{
        packages: string[];
        rootPackage: string;
        templateBasePath: string;
    } | null>(null);
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
    const [templateLoadError, setTemplateLoadError] = useState<string | null>(null);

    useEffect(() => {
        if (!initialData?.project) return;

        const domainName = initialData.project.domainName || initialData.project.name || "";
        const templateInfo = getTemplateInfo(domainName);

        setIsLoadingTemplate(true);
        setTemplateLoadError(null);

        GithubService.getTemplatePackages(templateInfo.repo)
            .then((info) => {
                setTemplatePackagesInfo(info);
            })
            .catch((err) => {
                console.error("Error al leer paquetes de plantilla:", err);
                setTemplateLoadError("No se pudieron leer los paquetes de la plantilla de GitHub.");
            })
            .finally(() => {
                setIsLoadingTemplate(false);
            });
    }, [initialData]);

    useEffect(() => {
        if (!initialData?.project) return;

        const domain = initialData.project.domainName || initialData.project.name || "Sin dominio";
        const enunciadoGeneral = initialData.project.extensionFinish || "";
        const restricciones = initialData.constraints || initialData.project.attributeConstraints || "";
        const baseClassesRaw = initialData.project.baseClasses || initialData.project.javaCode || "";

        const javaBlocks = [...baseClassesRaw.matchAll(/```java\n([\s\S]*?)```/g)]
            .map(m => m[1].trim());

        const packageLines = javaBlocks
            .map(block => (block.match(/^package\s+[\w.]+;/m) || [])[0])
            .filter(Boolean) as string[];
        const uniqueBasePackages = [...new Set(packageLines)];

        const basePackageNames = uniqueBasePackages.map(p =>
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
            })
            : "";

        const codigoLimpio = javaBlocks.map(block =>
            block
                .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "")
                .replace(/^(?!package\s)import\s.*;$/gm, "")
                .replace(/^\s*[\r\n]/gm, "")
                .trim()
        ).join("\n\n// ---\n\n");

        const basePackagesSummary = uniqueBasePackages.length > 0
            ? `=== PAQUETES DE LAS CLASES BASE DEL EXAMEN ===\n${uniqueBasePackages.join("\n")}\n\nREGLA CRÍTICA DE IMPORTS: El paquete del propio Test1.java debe ser: ${baseRootPackage}.test;\n`
            : "";

        let templatePackagesSummary = "";
        if (!isLoadingTemplate) {
            if (templatePackagesInfo && templatePackagesInfo.packages.length > 0) {
                templatePackagesSummary = `=== PAQUETES DE LA PLANTILLA DEL PROYECTO (EXISTENTES EN GITHUB) ===
${templatePackagesInfo.packages.join("\n")}

REGLA CRÍTICA DE IMPORTS:
- Usa EXACTAMENTE estos paquetes para las clases que NO son base (como User u otras utilidades).
- Paquete raíz: ${templatePackagesInfo.rootPackage}
`;
            } else if (templateLoadError) {
                templatePackagesSummary = `=== ADVERTENCIA: Error cargando plantilla ===\n${templateLoadError}\n`;
            }
        }

        const contextoOculto = `
${basePackagesSummary}
${templatePackagesSummary}
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
        setHiddenContext(`${parsedHidden}\n\n${contextoOculto}`);

    }, [initialData, templatePackagesInfo, isLoadingTemplate, templateLoadError]); 

    const executeGeneration = async () => {
        if (!promptText || isLoadingTemplate) return;
        setIsLoading(true);
        setResponseText("");

        const domainName = initialData?.project?.domainName || "";
        const templateInfo = getTemplateInfo(domainName);

        try {
            // REGLAS CORREGIDAS: Genéricas, explícitas sobre el dominio y el camelCase.
            const finalPayload = `
${hiddenContext}

${promptText}

=== REGLAS CRÍTICAS DE IMPORTACIÓN Y DOMINIO (ESTRICTO) ===
1. El paquete raíz absoluto es: ${templateInfo.rootPackage}
2. REGLA DE SUBPAQUETES: Todo subpaquete debe escribirse EXCLUSIVAMENTE EN MINÚSCULAS (nada de camelCase).
   - Ejemplo: La clase 'User' ESTÁ en -> import ${templateInfo.rootPackage}.user.User;
3. El paquete de ESTE test (Test1.java) debe ser: ${templateInfo.rootPackage}.test;
4. REGLA DE DOMINIO: IGNORA los nombres de entidades y clases que aparezcan en los ejemplos del prompt. DEBES generar los tests EXCLUSIVAMENTE para las clases que se encuentran en la sección "=== CÓDIGO FUENTE REAL ===". (Por ejemplo, si el código fuente incluye 'ChessPuzzle', prueba 'ChessPuzzle', no inventes tests para otras entidades).

Genera Test1.java respetando estos paquetes y reglas sin excepción. NO uses bloques markdown.
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
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.get([projectId], (result) => {
                const updatedData = { ...result[projectId], ...initialData.project, javaTests: responseText, updatedAt: new Date().toISOString() };
                chrome.storage.local.set({ [projectId]: updatedData }, () => { alert("¡Guardado!"); onWelcome(); });
            });
        }
    };

    const handleGenerateClick = () => {
        if (isLoadingTemplate) return alert("Cargando plantilla...");
        const projectId = initialData?.project?.id;
        if (typeof chrome !== "undefined" && chrome.storage?.local && projectId) {
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
        link.download = fileName;
        link.click();
    };

    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'CREAR EXAMEN', action: onCreateExam },
        { label: 'POR PARTES', action: onCreateExamByParts },
        { 
            label: source === 'attributes' ? 'RESTRICCIONES DE ATRIBUTOS' : 'TESTS GENERALES', 
            action: onBack 
        }
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
                                {isLoadingTemplate && <div style={{ padding: '8px', marginBottom: '12px', backgroundColor: '#fff3cd', borderRadius: '6px' }}>⏳ Cargando paquetes de GitHub...</div>}
                                {!isLoadingTemplate && templatePackagesInfo && <div style={{ padding: '8px', marginBottom: '12px', backgroundColor: '#d4edda', borderRadius: '6px' }}>✅ Plantilla lista.</div>}
                                {!isLoadingTemplate && templateLoadError && <div style={{ padding: '8px', marginBottom: '12px', backgroundColor: '#f8d7da', borderRadius: '6px' }}>⚠️ Error en GitHub (404), pero se generarán los tests usando el paquete raíz inferido.</div>}
                                <textarea className="wf-textarea" style={{ height: '400px', fontFamily: 'monospace' }} value={promptText} onChange={(e) => setPromptText(e.target.value)} />
                                <div className="wf-actions-row" style={{ marginTop: '20px' }}>
                                    <button onClick={onBack} className="btn-step secondary">Volver</button>
                                    <button onClick={handleGenerateClick} className="btn-step primary" disabled={isLoading || isLoadingTemplate}>
                                        {isLoading ? "Generando..." : "Generar"}
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
                                            <button onClick={handleDownload} className="btn-step secondary">Descargar</button>
                                            <button onClick={handleSaveToChrome} className="btn-step primary" style={{ backgroundColor: '#28a745' }}>Guardar</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="wf-actions-row" style={{ marginTop: '20px' }}>
                                    <button type="button" onClick={() => setInternalStep('input')} className="btn-step secondary">Volver al editor</button>
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
                        <p>¿Deseas sobrescribir los tests existentes?</p>
                        <div className="wf-actions-row" style={{ justifyContent: "center" }}>
                            <button onClick={() => setShowOverwriteWarning(false)} className="btn-step secondary">No</button>
                            <button onClick={() => { setShowOverwriteWarning(false); executeGeneration(); }} className="btn-step primary">Sí</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}