import React, { useState } from "react"
import attributesConstraintsPromptMarkdown from "bundle-text:../../prompts/generation-constraints-attributes/generation_attribute_constraints_from_statement.md"
import { parseMasterPrompt } from "~src/utils/promptParser"
import WorkflowScreen from "../../components/WorkflowScreen"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateTest: (data: { project: any; constraints: string, entityRelationships: string, baseClass: string }) => void
  readonly onGoToBaseClass: (project?: any) => void 
}

export default function AttributesConstraintsWorkflowScreen({
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
        onBack={onBack}
        onWelcome={onWelcome}
        breadcrumbItems={[
          { label: "INICIO", action: onWelcome },
          { label: "CREAR EXAMEN", action: onCreateExam },
          { label: "POR PARTES", action: onBack },
        ]}
        currentStep="RESTRICCIONES DE ATRIBUTOS"

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
          `Las restricciones de atributos de ${name} han sido actualizadas correctamente.\n\n¿Deseas continuar y generar los tests para estas restricciones ahora mismo?`
        }
        successPrimaryButtonLabel="Sí, generar tests"
        successSecondaryButtonLabel="No, volver al inicio"
        
        onSaved={(data) => {
          if (data.project.baseClasses) {
            onCreateTest({ 
              project: data.project, 
              constraints: data.result,
              entityRelationships: data.project.entityRelationships || "", 
              baseClass: data.project.baseClasses 
            });
          } else {
            setPendingProjectForBaseClass(data.project);
          }
        }}
        onSuccessSecondary={() => onWelcome()}

        saveButtonLabel="Guardar"
        allowedFolders={["clínica veterinaria", "ajedrez"]}
        storageKey="attributeConstraints"
        buildPrompt={() => parseMasterPrompt(attributesConstraintsPromptMarkdown)}
        logExerciseName="attributes_constraints"
        downloadPrefix="Restricciones_Atributos"
        downloadTitle={(p) =>
          `Restricciones de Atributos - ${p.customName || p.domainName}`
        }
      />

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
              Para poder generar los tests de restricciones, primero es necesario generar las <strong>Clases Base</strong> del examen.
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