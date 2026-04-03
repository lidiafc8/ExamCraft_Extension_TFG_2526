import React from "react"
import attributesConstraintsPromptMarkdown from "bundle-text:../../prompts/generation-constraints-attributes/generation_attribute_constraints_from_statement.md"
import { parseMasterPrompt } from "~src/utils/promptParser"
import WorkflowScreen from "../../components/WorkflowScreen"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateTest: (data: { project: any; constraints: string }) => void
}

export default function AttributesConstraintsWorkflowScreen({
  onBack,
  onWelcome,
  onCreateExam,
  onCreateTest,
}: Props) {
  return (
    <WorkflowScreen
      // ── Navegación ────────────────────────────────────────────────────────
      onBack={onBack}
      onWelcome={onWelcome}
      breadcrumbItems={[
        { label: "INICIO", action: onWelcome },
        { label: "CREAR EXAMEN", action: onCreateExam },
        { label: "POR PARTES", action: onBack },
      ]}
      currentStep="RESTRICCIONES DE ATRIBUTOS"

      // ── Textos ────────────────────────────────────────────────────────────
      selectionTitle="Selecciona un dominio"
      selectionDescription='Para generar el ejercicio "Restricciones de Atributos" es necesario elegir un examen ya creado y almacenado previamente en el sistema. Haz clic en la carpeta del dominio que quieres usar como base para este ejercicio.'
      workflowInputTitle="Restricciones de Atributos"
      workflowResultTitle={(name) => `Generar Restricciones: ${name}`}
      instructionText={
        <>
          Este es el prompt que se usará para generar las restricciones de atributos del examen
          seleccionado, puede revisar o modificar cualquier información que vea conveniente.
          Al terminar, pulse en <strong>"Generar"</strong>.
        </>
      }
      confirmTitle="Confirmar Contexto"
      confirmDescription={(name) =>
        `¿Deseas utilizar ${name} como base para generar el ejercicio de restricciones?`
      }
      confirmWarning={(project) =>
        project.attributeConstraints
          ? "Este examen ya tiene restricciones de atributos generadas.\nSi continúas, las restricciones anteriores serán reemplazadas por las nuevas."
          : null
      }
      confirmButtonLabel={(project) =>
        project.attributeConstraints ? "Continuar y reemplazar" : "Confirmar"
      }
      successTitle="¡Guardado correctamente!"
      successDescription={(name) =>
        `Las restricciones de atributos de ${name} han sido actualizadas correctamente.`
      }
      saveButtonLabel="Guardar y Continuar"

      allowedFolders={["clínica veterinaria", "ajedrez"]}
      storageKey="attributeConstraints"
      buildPrompt={() => parseMasterPrompt(attributesConstraintsPromptMarkdown)}
      logExerciseName="attributes_constraints"
      downloadPrefix="Restricciones_Atributos"
      downloadTitle={(p) =>
        `Restricciones de Atributos - ${p.customName || p.domainName}`
      }
      onSaved={(data) => onCreateTest({ project: data.project, constraints: data.result })}
    />
  )
}