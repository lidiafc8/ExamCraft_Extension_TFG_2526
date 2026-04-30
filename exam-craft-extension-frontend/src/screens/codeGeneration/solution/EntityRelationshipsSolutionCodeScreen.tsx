import React from "react"
import { parseMasterPrompt } from "~src/utils/promptParser"
import generationEntityRelationshipsSolutionPrompt from "bundle-text:../../../prompts/generation-exam-repository/solution/generation_entity_relationships_solution.md"
import WorkflowScreen from "../../../components/WorkflowScreen"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateExamByParts: () => void
  readonly onCodeGeneration: () => void
  readonly onSolutionCodeGeneration: () => void
}

export default function GenerationEntityRelationshipsSolutionScreen({
  onBack,
  onWelcome,
  onCreateExam,
  onCreateExamByParts,
  onCodeGeneration,
  onSolutionCodeGeneration
}: Props) {

  return (
    <WorkflowScreen
      onBack={onBack}
      onWelcome={onWelcome}
      breadcrumbItems={[
        { label: "INICIO", action: onWelcome },
        { label: "CREAR EXAMEN", action: onCreateExam },
        { label: "POR PARTES", action: onCreateExamByParts },
        { label: "CÓDIGO", action: onCodeGeneration },
        { label: "SOLUCIÓN", action: onSolutionCodeGeneration },
      ]}
      currentStep="RELACIONES ENTRE ENTIDADES"

      selectionTitle="Selecciona un examen"
      selectionDescription="Para generar la solución es necesario elegir un examen que ya cuente con el enunciado de relaciones entre entidades, los tests correspondientes y el código base generado. Haz clic en la carpeta del dominio correspondiente."
      
      workflowInputTitle="Generación de Código Solución"
      workflowResultTitle={(name) => `Generar Solución: ${name}`}
      
      instructionText={(project) => {
        const hasOtherSolution = !!(project?.fullSolution);

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <p>
              Este es el prompt que se usará para generar el <strong>Código Solución de Relaciones entre Entidades</strong> del examen seleccionado. 
              Puede revisar o modificar cualquier información que vea conveniente.
              Al terminar, pulse en <strong>"Generar"</strong>.
            </p>
            
            {hasOtherSolution && (
              <div style={{ backgroundColor: "#f0f4f8", padding: "15px", borderRadius: "8px", border: "1px solid #cce0ff" }}>
                <p style={{ margin: 0, fontSize: "0.9em", color: "#555" }}>
                  <strong>Nota:</strong> Se ha detectado código solución del ejercicio "Restricciones de Atributos". La IA usará dicho código como base automáticamente para añadirle la solución de "Relaciones entre Entidades", generando así una versión completa. 
                </p>
              </div>
            )}
          </div>
        );
      }}
      
      confirmTitle="Confirmar Generación"
      confirmDescription={(name) => `¿Deseas generar el código solución de "Relaciones entre Entidades" para el examen ${name}?`}
      
      confirmWarning={(project) => project.fullSolution
          ? `Este examen ya tiene código solución generado.\nSi continúas, el código anterior será actualizado o reemplazado.`
          : null
      }
      
      confirmButtonLabel={(project) => project.fullSolution ? "Continuar y reemplazar" : "Confirmar"}
      
      successTitle="¡Solución generada correctamente!"
      successDescription={(name) => `El código solución para ${name} ha sido guardado exitosamente.`}
      saveButtonLabel="Guardar"

      allowedFolders={["clínica veterinaria", "ajedrez"]}
      
      storageKey="fullSolution" 
      
      filterProject={(project) => {
        const hasBaseClasses = !!(project.baseClasses && project.baseClasses.trim() !== "");
        const hasRelationships = !!(project.entityRelationships && project.entityRelationships.trim() !== "");
        const hasRelationshipsTests = !!(project.testPartsMap?.test2_relationships?.code?.trim());
        return hasBaseClasses && hasRelationships && hasRelationshipsTests;
      }}
      
      buildPrompt={(project) => {
        const { visibleText, hiddenContext } = parseMasterPrompt(generationEntityRelationshipsSolutionPrompt);
        
        const entityRelationshipsStatement = project.entityRelationships || "";
        const testsCode = project.testPartsMap?.test2_relationships?.code || "";

        // Si existe la solución de restricciones la usa como base, de lo contrario cae en las clases base limpias
        const baseClassesCode = project.fullSolution || project.baseClasses || "";

        return {
          visibleText: visibleText
            .replace("{enunciado_relaciones}", entityRelationshipsStatement)
            .replace("{codigo_tests}", testsCode)
            .replace("{codigo_base_localstorage}", baseClassesCode),
          hiddenContext,
        }
      }}
      
      logExerciseName="full_solution_generation"
      downloadPrefix="Solucion_Completa"
      downloadTitle={(p) => `Solución Completa - ${p.customName || p.domainName}`}
      onSaved={() => onWelcome()}
    />
  )
}