import React, { useState, useEffect } from "react"
import { Header } from "~src/components/Header"
import { parseMasterPrompt } from "~src/utils/promptParser"
import { sendToGemini } from "~src/services/geminiService"
import { downloadMarkdown } from "~src/utils/downloadUtils"
import { SuccessModal } from "~src/components/modals/SuccessModal"
import { ConfirmModal } from "~src/components/modals/ConfirmModal"
import testAttributesPromptMarkdown from "bundle-text:../../prompts/generation-exam-repository/exam/generation_tests_attributes.md"
import testRelationshipsPromptMarkdown from "bundle-text:../../prompts/generation-exam-repository/exam/generation_tests_relationships.md"

declare var chrome: any

interface Props {
  readonly initialData: {
    project: any
    constraints: string
    entityRelationships: string
    baseClass: string
    targetType?: "attributes" | "entityRelationships"
  } | null
  readonly source: "attributes" | "entityRelationships" | "general"
  readonly onBack: () => void
  readonly onCreateExamByParts: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCodeGeneration: () => void
}

const DOMAIN_CONFIG: Record<string, { repo: string; rootPackage: string; extraPackages: string[] }> = {
  default: {
    repo: "DP1-chess-template-exam",
    rootPackage: "es.us.dp1.chess.tournament",
    extraPackages: [
      "es.us.dp1.chess.tournament.user",
      "es.us.dp1.chess.tournament.model",
      "es.us.dp1.chess.tournament.exceptions",
    ],
  },
  veterinaria: {
    repo: "DP1-petClinic-template-exam",
    rootPackage: "org.springframework.samples.petclinic",
    extraPackages: [
      "org.springframework.samples.petclinic.user",
      "org.springframework.samples.petclinic.model",
      "org.springframework.samples.petclinic.exceptions",
    ],
  },
}

function getDomainConfig(domain: string) {
  if (domain.includes("clínica veterinaria") || domain.includes("veterinaria")) {
    return DOMAIN_CONFIG.veterinaria
  }
  return DOMAIN_CONFIG.default
}

function extractBaseRootPackage(javaBlocks: string[], fallback: string): string {
  const packageNames = javaBlocks
    .map(block => (block.match(/^package\s+[\w.]+;/m) || [])[0])
    .filter(Boolean)
    .map(p => p.replace(/^package\s+/, "").replace(/;$/, ""))

  if (packageNames.length === 0) return fallback

  return packageNames.reduce((a, b) => {
    const partsA = a.split(".")
    const partsB = b.split(".")
    const common: string[] = []
    for (let i = 0; i < Math.min(partsA.length, partsB.length); i++) {
      if (partsA[i] === partsB[i]) common.push(partsA[i])
      else break
    }
    return common.join(".")
  }, packageNames[0])
}

function cleanJavaBlocks(javaBlocks: string[], rootPackage: string): string {
  return javaBlocks
    .map(block =>
      block
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "") // NOSONAR javascript:S5852
        .replace(new RegExp(`^(?!package\\s|import\\s+${rootPackage.replace(/\./g, "\\.")})import\\s.*;$`, "gm"), "")
        .replace(/^\s*[\r\n]/gm, "") // NOSONAR javascript:S5852
        .trim()
    )
    .join("\n\n// ---\n\n")
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
  const [internalStep, setInternalStep] = useState<"input" | "result">("input")
  const [promptText, setPromptText] = useState("")
  const [hiddenContext, setHiddenContext] = useState("")
  const [responseText, setResponseText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [currentConfig, setCurrentConfig] = useState(DOMAIN_CONFIG.default)

  const isEntityRelationshipsTest =
    source === "entityRelationships" ||
    (source === "general" && initialData?.targetType === "entityRelationships")

  const partKey = isEntityRelationshipsTest ? "test2_relationships" : "test1_attributes"
  const fileName = isEntityRelationshipsTest ? "Test2.java" : "Test1.java"
  const currentStepLabel = isEntityRelationshipsTest ? "TESTS DE RELACIONES" : "TESTS DE RESTRICCIONES"

  useEffect(() => {
    if (!initialData?.project) return

    const domain = (initialData.project.domainName || "").toLowerCase()
    const config = getDomainConfig(domain)
    setCurrentConfig(config)

    const baseClassesRaw = initialData.baseClass || initialData.project.baseClasses || initialData.project.javaCode || ""
    const enunciadoGeneral = initialData.project.extensionFinish || ""

    const targetPromptMarkdown = isEntityRelationshipsTest
      ? testRelationshipsPromptMarkdown
      : testAttributesPromptMarkdown

    const contextToEvaluate = isEntityRelationshipsTest
      ? initialData.entityRelationships || initialData.project.entityRelationships || ""
      : initialData.constraints || initialData.project.attributeConstraints || ""

    const javaBlocks = [...baseClassesRaw.matchAll(/```java\n([\s\S]*?)```/g)].map(m => m[1].trim())
    const baseRootPackage = extractBaseRootPackage(javaBlocks, config.rootPackage)
    const codigoLimpio = cleanJavaBlocks(javaBlocks, config.rootPackage)

    const contextInfo = `
=== PAQUETES DE LA PLANTILLA DEL PROYECTO ===
${config.extraPackages.join("\n")}

REGLA CRÍTICA DE IMPORTS:
- Usa EXACTAMENTE estos paquetes para las clases que NO son base.
- Paquete raíz: ${config.rootPackage}
- El paquete de ESTE test ${isEntityRelationshipsTest ? "(Test2.java)" : "(Test1.java)"} debe ser: ${baseRootPackage};

=== CÓDIGO FUENTE REAL ===
${codigoLimpio}

=== ENUNCIADO ===
${enunciadoGeneral}

=== REGLAS A EVALUAR (RESTRICCIONES / RELACIONES) ===
${contextToEvaluate}
`
    const { visibleText, hiddenContext: parsedHidden } = parseMasterPrompt(targetPromptMarkdown || "")
    const finalPrompt = (visibleText || "").split(/\{\{DOMAIN\}\}/gi).join(domain).trim()

    setPromptText(finalPrompt)
    setHiddenContext(`${parsedHidden}\n\n${contextInfo}`)
  }, [initialData, source])

  const executeGeneration = async () => {
    if (!promptText) return
    setIsLoading(true)
    setResponseText("")

    try {
      const finalPayload = `
${hiddenContext}

${promptText}

=== REGLAS CRÍTICAS DE IMPORTACIÓN (ESTRICTO) ===
1. El paquete raíz absoluto es: ${currentConfig.rootPackage}
2. REGLA DE SUBPAQUETES: Todo subpaquete debe escribirse EXCLUSIVAMENTE EN MINÚSCULAS.
3. El paquete de ESTE test ${isEntityRelationshipsTest ? "(Test2.java)" : "(Test1.java)"} debe ser el subpaquete .test de las clases base.
4. Usa las clases reales del código fuente proporcionado.

Genera ${isEntityRelationshipsTest ? "(Test2.java)" : "(Test1.java)"} sin bloques markdown.
`.trim()

      const result = await sendToGemini(finalPayload)
      if (!result) throw new Error("Respuesta vacía")

      const cleanResult = result
        .replaceAll(/```java/gi, "")
        .replaceAll(/```/gi, "")
        .replace(/^java/i, "")
        .trim()

      setResponseText(cleanResult)
      setInternalStep("result")

      try {
        await fetch("http://localhost:3001/save-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ejercicio: isEntityRelationshipsTest ? "test_relationships_code_generation" : "test_attributes_code_generation",
            dominio: initialData?.project?.domainName || "",
            contextoOculto: hiddenContext,
            examenSeleccionado: initialData?.project?.extensionFinish || "",
            promptVisible: promptText,
            respuesta: result,
          }),
        })
      } catch {
        console.warn("Servidor de logs apagado.")
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveToChrome = () => {
    const projectId = initialData?.project?.id
    if (!projectId || !chrome?.storage?.local) return

    chrome.storage.local.get([projectId], (result) => {
      const existingProject = result[projectId] || {}
      const testParts = existingProject.testPartsMap || {}

      testParts[partKey] = { fileName, code: responseText }

      const updatedData = {
        ...existingProject,
        ...initialData.project,
        testPartsMap: testParts,
        updatedAt: new Date().toISOString(),
      }

      chrome.storage.local.set({ [projectId]: updatedData }, () => {
        if (chrome.runtime.lastError) {
          setErrorMessage(chrome.runtime.lastError.message ?? "No se pudo guardar.")
          setSaveStatus("error")
        } else {
          setSaveStatus("success")
        }
      })
    })
  }

  const handleDownload = () => {
    const projectName = initialData?.project?.customName || "Generado"
    downloadMarkdown(responseText, `${isEntityRelationshipsTest ? "Test2" : "Test1"}-${projectName}.java`)
  }

  const baseBreadcrumbs = [
    { label: "INICIO", action: onWelcome },
    { label: "CREAR EXAMEN", action: onCreateExam },
    { label: "POR PARTES", action: onCreateExamByParts },
  ]

  const dynamicBreadcrumbs =
    source === "general"
      ? [{ label: "CÓDIGO", action: onCodeGeneration }, { label: "TESTS", action: onBack }]
      : source === "attributes"
      ? [{ label: "RESTRICCIONES", action: onBack }]
      : [{ label: "RELACIONES ENTRE ENTIDADES", action: onBack }]

  // --- Modales de estado de guardado ---
  if (saveStatus === "success") {
    return (
      <SuccessModal
        title="¡Tests guardados con éxito!"
        message={`El archivo ${fileName} se ha guardado correctamente en el proyecto.`}
        actions={[
          { label: "Seguir editando", onClick: () => setSaveStatus("idle"), variant: "secondary" },
          { label: "Volver al inicio", onClick: onWelcome, variant: "primary" },
        ]}
      />
    )
  }

  if (saveStatus === "error") {
    return (
      <ConfirmModal
        title="Error al guardar"
        message={errorMessage}
        onConfirm={() => setSaveStatus("idle")}
        onCancel={onWelcome}
        confirmLabel="Reintentar"
        cancelLabel="Volver al inicio"
      />
    )
  }

  return (
    <div className="exam-app">
      <Header
        onWelcome={onWelcome}
        breadcrumbItems={[...baseBreadcrumbs, ...dynamicBreadcrumbs]}
        currentStep={currentStepLabel}
      />
      <main className="main-content">
        <div className="wf-layout-container">
          <div className="wf-wide-wrapper" style={{ width: "100%", boxSizing: "border-box" }}>

            {internalStep === "input" ? (
              <div className="content-card">
                <h2 className="main-title small">Configuración del Test</h2>
                <textarea
                  className="wf-textarea-input"
                  style={{ height: "400px", fontFamily: "monospace", width: "100%", boxSizing: "border-box" }}
                  value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                />
                <div className="wf-actions-row">
                  <button onClick={onBack} className="btn-back">Volver</button>
                  <button onClick={executeGeneration} className="btn-step primary" disabled={isLoading}>
                    {isLoading ? <div className="loading-spinner" /> : "Generar Tests"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="content-card" style={{ width: "100%", boxSizing: "border-box", overflowX: "hidden" }}>
                <h2 className="main-title small">Resultado: {fileName}</h2>

                <div className="wf-split-view" style={{ display: "flex", flexWrap: "wrap", width: "100%", gap: "20px", boxSizing: "border-box" }}>
                  {/* Columna izquierda: prompt */}
                  <div className="wf-column" style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column" }}>
                    <span className="wf-column-title">Prompt enviado</span>
                    <textarea
                      className="wf-textarea-input"
                      value={promptText}
                      readOnly
                      style={{ width: "100%", boxSizing: "border-box", flexGrow: 1 }}
                    />
                    <button onClick={executeGeneration} className="btn-step primary" disabled={isLoading} style={{ marginTop: "10px" }}>
                      {isLoading ? "..." : "Regenerar"}
                    </button>
                  </div>

                  {/* Columna derecha: resultado */}
                  <div className="wf-column" style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column" }}>
                    <span className="wf-column-title">Código generado</span>
                    {isLoading ? (
                      <div className="wf-result-box" style={{ flexGrow: 1, fontSize: "11px" }}>Generando...</div>
                    ) : (
                      <textarea
                        className="wf-result-box"
                        value={responseText}
                        onChange={e => setResponseText(e.target.value)}
                        style={{ width: "100%", boxSizing: "border-box", flexGrow: 1, fontSize: "11px" }}
                      />
                    )}
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                      <button onClick={handleDownload} className="btn-step secondary" style={{ flex: 1, minWidth: "140px" }}>
                        Descargar .java
                      </button>
                      <button onClick={handleSaveToChrome} className="btn-step primary" style={{ flex: 1, minWidth: "140px", backgroundColor: "#28a745" }}>
                        Guardar en Proyecto
                      </button>
                    </div>
                  </div>
                </div>

                <div className="wf-actions-row" style={{ marginTop: "20px", justifyContent: "center" }}>
                  <button type="button" onClick={() => setInternalStep("input")} className="btn-step secondary">
                    Editar Prompt
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}