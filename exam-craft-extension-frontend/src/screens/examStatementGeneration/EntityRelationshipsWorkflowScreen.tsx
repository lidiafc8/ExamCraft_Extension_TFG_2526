import React from "react"
import entityRelationshipsPromptMarkdown from "bundle-text:../../prompts/generation-entity-relationships/generation_relationships_between_entities_from_statement.md"
import { parseMasterPrompt } from "~src/utils/promptParser"
import WorkflowScreen from "../../components/WorkflowScreen"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
}

export default function EntityRelationshipsWorkflowScreen({
  onBack,
  onWelcome,
  onCreateExam,
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
      currentStep="RELACIONES ENTRE ENTIDADES"

      // ── Textos ────────────────────────────────────────────────────────────
      selectionTitle="Selecciona un dominio"
      selectionDescription='Para generar el ejercicio "Relaciones entre Entidades" es necesario elegir un examen ya creado y almacenado previamente en el sistema. Haz clic en la carpeta del dominio que quieres usar como base para este ejercicio.'
      workflowInputTitle="Relaciones entre Entidades"
      workflowResultTitle={(name) => `Generar Relaciones: ${name}`}
      instructionText={
        <>
          Este es el prompt que se usará para generar las relaciones entre entidades del examen
          seleccionado, puede revisar o modificar cualquier información que vea conveniente.
          Al terminar, pulse en <strong>"Generar"</strong>.
        </>
      }
      confirmTitle="Confirmar Contexto"
      confirmDescription={(name) =>
        `¿Deseas utilizar ${name} como base para generar el ejercicio de relaciones entre entidades?`
      }
      confirmWarning={(project) =>
        project.entityRelationships
          ? "Este examen ya tiene relaciones entre entidades generadas.\nSi continúas, las relaciones anteriores serán reemplazadas por las nuevas."
          : null
      }
     
      successTitle="¡Guardado correctamente!"
      successDescription={(name) =>
        `Las relaciones entre entidades de ${name} han sido actualizadas correctamente.`
      }
      saveButtonLabel="Guardar y Continuar"

      allowedFolders={["clínica veterinaria", "ajedrez"]}
      storageKey="entityRelationships"
      buildPrompt={() => parseMasterPrompt(entityRelationshipsPromptMarkdown)}
      logExerciseName="entity_relationships"
      downloadPrefix="Relaciones_Entidades"
      downloadTitle={(p) =>
        `Relaciones entre Entidades - ${p.customName || p.domainName}`
      }
      onSaved={(data) => onWelcome()}
    />
  )
}