import React, { useEffect, useState } from "react"
import { Header } from "~src/components/Header"
import { parseMasterPrompt } from "~src/utils/promptParser"
import { downloadMarkdown } from "~src/utils/downloadUtils"
import { saveToChrome } from "~src/utils/chromeStorageUtils"
import { SuccessModal } from "~src/components/modals/SuccessModal"
import { ConfirmModal } from "~src/components/modals/ConfirmModal"
import { DownloadConfirmModal } from "~src/components/modals/DownloadConfirmModal"
import { PromptEditor, SplitResultView } from "~src/components/WorkflowComponents"
import { useGeminiGeneration } from "~src/components/GeminiGeneration"
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
  readonly onComponents: () => void
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
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "")
        .replace(new RegExp(`^(?!package\\s|import\\s+${rootPackage.replace(/\./g, "\\.")})import\\s.*;$`, "gm"), "")
        .replace(/^\s*[\r\n]/gm, "")
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
  onComponents,
}: Props) {
  const [internalStep, setInternalStep] = useState<"input" | "result">("input")
  const [promptText, setPromptText] = useState("")
  const [hiddenContext, setHiddenContext] = useState("")
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [currentConfig, setCurrentConfig] = useState(DOMAIN_CONFIG.default)
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  const isRelationships =
    source === "entityRelationships" ||
    (source === "general" && initialData?.targetType === "entityRelationships")

  const partKey = isRelationships ? "test2_relationships" : "test1_attributes"
  const fileName = isRelationships ? "Test2.java" : "Test1.java"
  const currentStepLabel = isRelationships ? "TESTS DE RELACIONES" : "TESTS DE RESTRICCIONES"

  const { responseText, isLoading, setResponseText, generate } = useGeminiGeneration({
    logExerciseName: isRelationships
      ? "test_relationships_code_generation"
      : "test_attributes_code_generation",
    buildLogPayload: (result) => ({
      dominio: initialData?.project?.domainName || "",
      contextoOculto: hiddenContext,
      examenSeleccionado: initialData?.project?.extensionFinish || "",
      promptVisible: promptText,
      respuesta: result,
    }),
  })

  useEffect(() => {
    if (!initialData?.project) return

    const domain = (initialData.project.domainName || "").toLowerCase()
    const config = getDomainConfig(domain)
    setCurrentConfig(config)

    const baseClassesRaw = initialData.baseClass || initialData.project.baseClasses || initialData.project.javaCode || ""
    const enunciadoGeneral = initialData.project.extensionFinish || ""
    const targetPromptMarkdown = isRelationships ? testRelationshipsPromptMarkdown : testAttributesPromptMarkdown
    const contextToEvaluate = isRelationships
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
- El paquete de ESTE test ${isRelationships ? "(Test2.java)" : "(Test1.java)"} debe ser: ${baseRootPackage};

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

  const buildFinalPayload = () => `
${hiddenContext}

${promptText}

=== REGLAS CRÍTICAS DE IMPORTACIÓN (ESTRICTO) ===
1. El paquete raíz absoluto es: ${currentConfig.rootPackage}
2. REGLA DE SUBPAQUETES: Todo subpaquete debe escribirse EXCLUSIVAMENTE EN MINÚSCULAS.
3. El paquete de ESTE test ${isRelationships ? "(Test2.java)" : "(Test1.java)"} debe ser el subpaquete .test de las clases base.
4. Usa las clases reales del código fuente proporcionado.

Genera ${isRelationships ? "(Test2.java)" : "(Test1.java)"} sin bloques markdown.
`.trim()

  const handleGenerate = async () => {
    const result = await generate(buildFinalPayload())
    if (!result) return

    const clean = result
      .replaceAll(/```java/gi, "")
      .replaceAll(/```/gi, "")
      .replace(/^java/i, "")
      .trim()

    setResponseText(clean)
    setInternalStep("result")
  }

  const handleSaveToChrome = async () => {
    const projectId = initialData?.project?.id
    if (!projectId) return

    try {
      const existing = await new Promise<Record<string, any>>((resolve) => {
        chrome.storage.local.get([projectId], (result: any) => resolve(result[projectId] || {}))
      })

      const testParts = existing.testPartsMap || {}
      testParts[partKey] = { fileName, code: responseText }

      await saveToChrome(projectId, {
        ...existing,
        ...initialData!.project,
        testPartsMap: testParts,
        updatedAt: new Date().toISOString(),
      })

      setSaveStatus("success")
    } catch (err: any) {
      setErrorMessage(err.message ?? "No se pudo guardar.")
      setSaveStatus("error")
    }
  }

  const handleConfirmDownload = (customFileName: string) => {
    downloadMarkdown(responseText, customFileName)
    setShowDownloadModal(false)
  }

  const breadcrumbs = [
    { label: "INICIO", action: onWelcome },
    { label: "CREAR EXAMEN", action: onCreateExam },
    { label: "POR PARTES", action: onCreateExamByParts },
    { label: 'ENUNCIADO', action: onComponents },
    ...(source === "general"
      ? [{ label: "CÓDIGO", action: onCodeGeneration }, { label: "TESTS", action: onBack }]
      : source === "attributes"
      ? [{ label: "RESTRICCIONES", action: onBack }]
      : [{ label: "RELACIONES ENTRE ENTIDADES", action: onBack }]),
  ]

  return (
    <div className="exam-app">
      <Header
        onWelcome={onWelcome}
        breadcrumbItems={breadcrumbs}
        currentStep={currentStepLabel}
      />
      <main className="main-content">
        <div className="wf-layout-container">
          <div className="wf-wide-wrapper">
            {internalStep === "input" && (
              <PromptEditor
                title="Configuración del Test"
                promptText={promptText}
                isLoading={isLoading}
                generateLabel="Generar Tests"
                onPromptChange={setPromptText}
                onGenerate={handleGenerate}
                onBack={onBack}
              />
            )}

            {internalStep === "result" && (
              <>
                <h2 className="result-title">Código generado para {fileName}</h2>
                <SplitResultView
                  promptText={promptText}
                  isLoading={isLoading}
                  responseText={responseText}
                  leftTitle="Prompt enviado"
                  rightTitle="Código generado"
                  onPromptChange={setPromptText}
                  onRegenerate={handleGenerate}
                  onResponseChange={setResponseText}
                  footer={
                    <div className="wf-actions-row">
                      <button
                        onClick={handleGenerate}
                        className="btn-step generate"
                        disabled={isLoading}
                      >
                        {isLoading ? <div className="loading-spinner" /> : "Volver a generar"}
                      </button>
                      <button
                        onClick={() => setShowDownloadModal(true)}
                        className="btn-step btn-download"
                      >
                        Descargar (.md)
                      </button>
                      <button onClick={handleSaveToChrome} className="btn-step btn-save">
                        Guardar
                      </button>
                    </div>
                  }
                />
              </>
            )}
          </div>
        </div>
      </main>

      <DownloadConfirmModal
        isOpen={showDownloadModal}
        defaultFileName={`${isRelationships ? "Test2" : "Test1"}-${(initialData?.project?.customName || initialData?.project?.domainName || "Generado").replace(/\s+/g, "_")}`}
        onConfirm={handleConfirmDownload}
        onCancel={() => setShowDownloadModal(false)}
      />

      {saveStatus === "success" && (
        <SuccessModal
          title="¡Tests guardados con éxito!"
          message={`El archivo ${fileName} se ha guardado correctamente en el proyecto.`}
          actions={[
            { label: "Volver al inicio", onClick: onWelcome, variant: "primary" },
          ]}
        />
      )}

      {saveStatus === "error" && (
        <ConfirmModal
          title="Error al guardar"
          message={errorMessage}
          onConfirm={() => setSaveStatus("idle")}
          onCancel={onWelcome}
        />
      )}
    </div>
  )
}