import React, { useState } from "react"
import entityRelationshipsPromptMarkdown from "bundle-text:../../prompts/generation-entity-relationships/generation_relationships_between_entities_from_statement.md"
import { parseMasterPrompt } from "~src/utils/promptParser"
import WorkflowScreen from "../../components/WorkflowScreen"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateTest: (data: { project: any; constraints: string, entityRelationships: string, baseClass: string, targetPart?: string }) => void
  readonly onGoToBaseClass: (project?: any) => void 
}

export default function EntityRelationshipsWorkflowScreen({
  onBack,
  onWelcome,
  onCreateExam,
  onCreateTest,
  onGoToBaseClass,
}: Props) {
  
  const [pendingProjectForBaseClass, setPendingProjectForBaseClass] = useState<any>(null);

  return (
    <>
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
        confirmButtonLabel={(project) =>
          project.entityRelationships ? "Continuar y reemplazar" : "Confirmar"
        }
        
        // ── Éxito y Redirección a Tests ────────────────────────────────────────
        successTitle="¡Guardado correctamente!"
        successDescription={(name) =>
          `Las relaciones entre entidades de ${name} han sido actualizadas correctamente.\n\n¿Deseas continuar y generar los tests para estas relaciones ahora mismo?`
        }
        successPrimaryButtonLabel="Sí, generar tests"
        successSecondaryButtonLabel="No, volver al inicio"
        
        onSaved={(data) => {
          if (data.project.baseClasses) {
            onCreateTest({ 
              project: data.project, 
              constraints: data.project.attributeConstraints || "", 
              entityRelationships: data.result, 
              baseClass: data.project.baseClasses,
              targetPart: "test2_relationships" 
            });
          } else {
            setPendingProjectForBaseClass(data.project);
          }
        }}
        onSuccessSecondary={() => onWelcome()}

        // ── Configuración de guardado ──────────────────────────────────────────
        saveButtonLabel="Guardar"
        allowedFolders={["clínica veterinaria", "ajedrez"]}
        storageKey="entityRelationships"
        buildPrompt={() => parseMasterPrompt(entityRelationshipsPromptMarkdown)}
        logExerciseName="entity_relationships"
        downloadPrefix="Relaciones_Entidades"
        downloadTitle={(p) =>
          `Relaciones entre Entidades - ${p.customName || p.domainName}`
        }
      />

      {/* ── Modal de Advertencia: Faltan Clases Base ───────────────────────── */}
      {pendingProjectForBaseClass && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000,
        }}>
          <div className="content-card" style={{
            maxWidth: "400px", width: "90%", padding: "30px",
            textAlign: "center", backgroundColor: "#fff", borderRadius: "12px",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>⚠️</div>
            <h3 className="main-title small" style={{ marginBottom: "10px", color: "#4a3728" }}>
              Faltan las Clases Base
            </h3>
            <p style={{ marginBottom: "25px", color: "#555", fontSize: "15px" }}>
              Para poder generar los tests de relaciones, primero es necesario generar las <strong>Clases Base</strong> del examen.
            </p>
            <div className="wf-actions-row" style={{ justifyContent: "center", gap: "15px" }}>
              <button
                onClick={() => setPendingProjectForBaseClass(null)}
                className="btn-step secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const projectToPass = pendingProjectForBaseClass;
                  setPendingProjectForBaseClass(null);
                  onGoToBaseClass(projectToPass); 
                }}
                className="btn-step primary"
              >
                Ir a crear Clases Base
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}