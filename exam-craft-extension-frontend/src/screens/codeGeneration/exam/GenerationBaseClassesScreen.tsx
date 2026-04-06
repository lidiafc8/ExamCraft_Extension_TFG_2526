import React from "react"
import generationExamBaseClassesPrompt from "bundle-text:../../../prompts/generation-exam-repository/exam/generation_exam_base_classes.md"
import { parseMasterPrompt } from "~src/utils/promptParser"
import WorkflowScreen from "../../../components/WorkflowScreen"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateExamByParts: () => void
  readonly onCodeGeneration: () => void
  readonly onExamCodeGeneration: () => void
}

const CLASES_POR_DEFECTO: Record<string, string> = {
  "clínica veterinaria": `
- BaseEntity
- NamedEntity
- Person
- Owner
- Vet
- Pet
- PetType
- Specialty
- Visit
- Clinic
- PricingPlan
- ClinicOwner
- User
- Authorities`,
  "ajedrez": `
- BaseEntity
- NamedEntity
- Authorities
- User
- ChessMatch
- ChessBoard
- Piece`,
}

export default function GenerationBaseClassesScreen({
  onBack,
  onWelcome,
  onCreateExam,
  onCreateExamByParts,
  onCodeGeneration,
  onExamCodeGeneration
}: Props) {
  return (
    <WorkflowScreen
      // ── Navegación ────────────────────────────────────────────────────────
      onBack={onBack}
      onWelcome={onWelcome}
      breadcrumbItems={[
        { label: "INICIO", action: onWelcome },
        { label: "CREAR EXAMEN", action: onCreateExam },
        { label: "POR PARTES", action: onCreateExamByParts },
        { label: "CÓDIGO", action: onCodeGeneration },
        { label: "EXAMEN", action: onExamCodeGeneration },
      ]}
      currentStep="CLASES BASE"

      // ── Textos ────────────────────────────────────────────────────────────
      selectionTitle="Selecciona un dominio"
      selectionDescription="Para generar las clases base es necesario elegir un examen ya creado y almacenado previamente en el sistema. Haz clic en la carpeta del dominio que quieres usar como base."
      workflowInputTitle="Clases Base del Examen"
      workflowResultTitle={(name) => `Generar Clases Base: ${name}`}
      instructionText={
        <>
          Este es el prompt que se usará para generar las clases base del examen seleccionado,
          puede revisar o modificar cualquier información que vea conveniente.
          Al terminar, pulse en <strong>"Generar"</strong>.
        </>
      }
      confirmTitle="Confirmar Examen"
      confirmDescription={(name) =>
        `¿Deseas utilizar ${name} como base para generar las clases base del examen?`
      }
      confirmWarning={(project) =>
        project.baseClasses
          ? "Este examen ya tiene clases base generadas.\nSi continúas, las clases anteriores serán reemplazadas por las nuevas."
          : null
      }
      confirmButtonLabel={(project) =>
        project.baseClasses ? "Continuar y reemplazar" : "Confirmar"
      }
      successTitle="¡Guardado correctamente!"
      successDescription={(name) =>
        `Las clases base de ${name} han sido actualizadas correctamente.`
      }
      saveButtonLabel="Guardar"

      allowedFolders={["clínica veterinaria", "ajedrez"]}
      storageKey="baseClasses"
      buildPrompt={(project) => {
        const { visibleText, hiddenContext } = parseMasterPrompt(generationExamBaseClassesPrompt)
        const dominio = project.domainName || "Dominio no especificado"
        const clasesExistentes =
          CLASES_POR_DEFECTO[dominio.toLowerCase()] ??
          "No hay clases base registradas para este dominio."
        return {
          visibleText: visibleText
            .replace("{dominio}", dominio)
            .replace("{clases_existentes}", clasesExistentes),
          hiddenContext,
        }
      }}
      logExerciseName="base_classes_code_generation"
      downloadPrefix="Clases_Base"
      downloadTitle={(p) => `Clases Base - ${p.customName || p.domainName}`}
      onSaved={() => onWelcome()}
    />
  )
}