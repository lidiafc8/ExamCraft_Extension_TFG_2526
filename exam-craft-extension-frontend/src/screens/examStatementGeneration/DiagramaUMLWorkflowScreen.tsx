import React, { useState, useEffect } from "react"
import extensionPromptMarkdown from "bundle-text:../../prompts/functional-extension-generation/generation_UML_diagram_functional_extension.md"
<<<<<<< HEAD
=======
import { generateWithAI } from "../../services/geminiService"
>>>>>>> 0ef57d43c9cc74e781de44fd6b60fadca2761e66
import { parseMasterPrompt } from "../../utils/promptParser"
import { MermaidViewer } from "../../components/MermaidViewer"
import { Header } from "~src/components/Header"
import { cleanMermaidCode } from "../../components/mermaidCleaner"
import { useGeminiGeneration } from "../../components/GeminiGeneration"
import { StepperHeader, PromptEditor } from "../../components/WorkflowComponents"
import "../../css/WorkFlowParts.css"

interface Props {
  readonly domainName: string
  readonly context: string
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateExamByParts: () => void
  readonly onFunctionalExtension: () => void
  readonly onStatementStep1: () => void
  readonly onFinishExtension: (statement: string, mermaidCode: string) => void
}

const STEPS = [{ label: "Texto de enunciado" }, { label: "Diagrama UML" }]

export default function DiagramUMLScreen({
  domainName,
  context,
  onBack,
  onWelcome,
  onCreateExam,
  onCreateExamByParts,
  onFunctionalExtension,
  onStatementStep1,
  onFinishExtension,
}: Props) {
  const [internalStep, setInternalStep] = useState<"input" | "result">("input")
  const [promptText, setPromptText] = useState("")
  const [hiddenContext, setHiddenContext] = useState("")
  const [cleanCode, setCleanCode] = useState("")

  useEffect(() => {
    if (!extensionPromptMarkdown || !domainName) return
    const { visibleText, hiddenContext: parsed } = parseMasterPrompt(extensionPromptMarkdown)
    setPromptText(visibleText.replaceAll("{{DOMAIN}}", domainName))
    setHiddenContext(parsed)
  }, [context, domainName])

  const { responseText, isLoading, generate, setResponseText } = useGeminiGeneration({
    logExerciseName: "diagram_uml_functional_extension",
    buildLogPayload: (result) => ({
      domain: domainName,
      hiddenContext,
      statementContext: context,
      visiblePrompt: promptText,
      response: result,
    }),
  })

  const handleGenerate = async () => {
    const payload = `
      CONTEXTO Y RECURSOS (Información interna):
      ${hiddenContext}

      ENUNCIADO / EXTENSIÓN FUNCIONAL (Sobre lo que tienes que hacer el diagrama):
      ${context}

<<<<<<< HEAD
      INSTRUCCIONES PRINCIPALES:
      ${promptText}
    `
    const result = await generate(payload)
    if (result) {
      const clean = cleanMermaidCode(result)
      setCleanCode(clean)
      setResponseText(clean)
      setInternalStep("result")
    }
  }
=======
            INSTRUCCIONES PRINCIPALES:
            ${promptText}
        `;
            const result = await generateWithAI(finalPayload);
            const cleanResult = cleanMermaidCode(result);
>>>>>>> 0ef57d43c9cc74e781de44fd6b60fadca2761e66

  const breadcrumbItems = [
    { label: "INICIO", action: onWelcome },
    { label: "CREAR EXAMEN", action: onCreateExam },
    { label: "POR PARTES", action: onCreateExamByParts },
    { label: "EXTENSIÓN FUNCIONAL", action: onFunctionalExtension },
    { label: domainName.toUpperCase(), action: onStatementStep1 },
  ]

<<<<<<< HEAD
=======
            try {
                await fetch("http://localhost:3000/save-log", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        exercise: "diagram_uml_functional_extension",
                        domain: domainName,
                        hiddenContext,
                        statementContext: context,
                        visiblePrompt: promptText,
                        response: cleanResult
                    })
                });
                console.log("Log enviado al servidor local correctamente.");
            } catch {
                console.warn("Servidor de logs apagado. El log no se guardó en el repo.");
            }

        } catch (error) {
            console.error(error);
            alert("Error al generar.");
        } finally {
            setIsLoading(false);
        }
    };
    const handleCombinationExtension = (context: string, responseText: string) => {
        onFinishExtension(context.trim(), responseText.trim());
    };

    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'CREAR EXAMEN', action: onCreateExam },
        { label: 'POR PARTES', action: onCreateExamByParts },
        { label: 'EXTENSIÓN FUNCIONAL', action: onFunctionalExtension },
        { label: domainName.toUpperCase(), action: onStatementStep1 },
    ];

    const currentTitle = "DIAGRAMA UML";
    
>>>>>>> 0ef57d43c9cc74e781de44fd6b60fadca2761e66
  return (
    <div className="exam-app">
      <Header
        onWelcome={onWelcome}
        breadcrumbItems={breadcrumbItems}
        currentStep="DIAGRAMA UML"
      />

      <main className="main-content">
        <div className="wf-layout-container">

          <StepperHeader steps={STEPS} currentStep={2} />

          <div className="wf-wide-wrapper">

            {internalStep === "input" && (
              <PromptEditor
                title={`${domainName.toUpperCase()}: Diagrama UML`}
                description={
                  <>
                    Este es el prompt que se usará para generar el diagrama UML (en código mermaid
                    y en visualización gráfica), puede revisar o modificar cualquier información
                    que vea conveniente. Al terminar, pulse en{" "}
                    <strong>"Generar Diagrama UML"</strong>.
                  </>
                }
                promptText={promptText}
                isLoading={isLoading}
                generateLabel="Generar Diagrama UML"
                onPromptChange={setPromptText}
                onGenerate={handleGenerate}
                onBack={onBack}
              />
            )}

            {internalStep === "result" && (
              <>
                <div className="wf-diagram-split-view">

                  <div className="wf-column-three">
                    <span className="wf-column-title">Prompt de Generación del Diagrama UML</span>
                    <div className="wf-instruction-text">
                      <textarea
                        className="wf-textarea-input"
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="wf-column-three">
                    <span className="wf-column-title">Extensión Funcional con Diagrama UML</span>
                    <div className="wf-diagram-viewer-inner">
                      <div className="wf-diagram-enunciado">{context}</div>
                      <div className="wf-diagram-area">
                        {cleanCode
                          ? <MermaidViewer chartCode={cleanCode} />
                          : <div>Renderizando...</div>
                        }
                      </div>
                    </div>
                  </div>

                  <div className="wf-column-three">
                    <span className="wf-column-title">Código Mermaid</span>
                    <div className="wf-diagram-code-inner">
                      <pre className="wf-result-box"><code>{isLoading ? "Generando..." : responseText}</code></pre>
                    </div>
                  </div>

                </div>

                <div className="wf-actions-row">
                  <button
                    onClick={handleGenerate}
                    className="btn-step generate"
                    disabled={isLoading}
                  >
                    {isLoading ? <div className="loading-spinner" /> : "Volver a generar"}
                  </button>
                  <button
                    className="btn-step primary"
                    onClick={() => onFinishExtension(context.trim(), responseText.trim())}
                  >
                    Confirmar Diagrama UML
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}