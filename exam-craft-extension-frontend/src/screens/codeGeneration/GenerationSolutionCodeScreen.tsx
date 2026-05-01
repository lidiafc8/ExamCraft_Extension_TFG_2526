import React from "react"
import generationCodeSolutionPrompt from "bundle-text:../../prompts/generation-exam-repository/solution/generation_code_solution.md"
import { parseMasterPrompt } from "~src/utils/promptParser"
import WorkflowScreen from "../../components/WorkflowScreen"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateExamByParts: () => void
  readonly onCodeGeneration: () => void
}

export default function GenerationSolutionCodeScreen({
  onBack,
  onWelcome,
  onCreateExam,
  onCreateExamByParts,
  onCodeGeneration
}: Props) {
  return (
    <WorkflowScreen
      onBack={onBack}
      onWelcome={onWelcome}
      breadcrumbItems={[
        { label: "INICIO", action: onWelcome },
        { label: "CREAR EXAMEN", action: onCreateExam },
        { label: "POR PARTES", action: onCreateExamByParts },
        { label: "CÓDIGO", action: onCodeGeneration }
      ]}
      currentStep="SOLUCIÓN"

      selectionTitle="Selecciona un examen"
      selectionDescription="Para generar el codigo solución es necesario elegir un examen que cuente con las clases base generadas y al menos un ejercicio completo (enunciado + tests correspondientes). Haz clic en la carpeta correspondiente."
      
      workflowInputTitle="Generación de Código Solución"
      workflowResultTitle={(name) => `Generar Solución Completa: ${name}`}
      
      instructionText={(project) => {
        const hasConstraints = !!(project?.attributeConstraints);
        const hasRelations = !!(project?.entityRelationships); 

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <p>
              Este es el prompt que se usará para generar el <strong>Código Solución Completo</strong> del examen seleccionado. 
              La IA tomará las clases base iniciales y aplicará las soluciones para todas las partes detectadas.
              Al terminar, pulsa en <strong>"Generar"</strong>.
            </p>

            <div style={{ backgroundColor: "#f6f8fa", padding: "15px", borderRadius: "8px", border: "1px solid #e1e4e8" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "0.95em", fontWeight: 600, color: "#333" }}>
                Partes detectadas en este proyecto:
              </p>
              <ul style={{ margin: 0, paddingLeft: "24px", fontSize: "0.9em", color: "#555" }}>
                {hasConstraints && <li>Enunciado de Restricciones de Atributos</li>}
                {hasRelations && <li>Enunciado de Relaciones entre Entidades</li>}
              </ul>
            </div>
            
          </div>
        );
      }}
      
      confirmTitle="Confirmar Generación"
      confirmDescription={(name) =>
        `¿Deseas generar el código solución para el examen ${name}?`
      }
      
      confirmWarning={(project) =>
        project.fullSolution
          ? "Este examen ya tiene un código solución. Si continúas, se reemplazará por la nueva versión."
          : null
      }
      
      confirmButtonLabel={(project) =>
        project.fullSolution ? "Generar y reemplazar" : "Confirmar y generar"
      }
      
      successTitle="¡Solución generada correctamente!"
      successDescription={(name) =>
        `El código solución para ${name} ha sido guardado exitosamente.`
      }
      saveButtonLabel="Guardar"

      allowedFolders={["clínica veterinaria", "ajedrez"]}
      
      storageKey="fullSolution" 
      
      filterProject={(project) => {
        const hasBaseClasses = !!(project.baseClasses && project.baseClasses.trim() !== "");
        
        const hasConstraintsStatement = !!(project.attributeConstraints && project.attributeConstraints.trim() !== "");
        const hasConstraintsTests = !!(project.testPartsMap?.test1_attributes?.code?.trim());
        const hasCompleteConstraints = hasConstraintsStatement && hasConstraintsTests;

        const hasRelationsStatement = !!(project.entityRelationships && project.entityRelationships.trim() !== "");
        const hasRelationshipsTests = !!(project.testPartsMap?.test2_relationships?.code?.trim());
        const hasCompleteRelationships = hasRelationsStatement && hasRelationshipsTests;

        return hasBaseClasses && (hasCompleteConstraints || hasCompleteRelationships);
      }}
      
      buildPrompt={(project) => {
        const { visibleText, hiddenContext } = parseMasterPrompt(generationCodeSolutionPrompt);
        
        const attributeConstraintsStatement = project.attributeConstraints || "No hay restricciones de atributos.";
        const entityRelationsStatement = project.entityRelationships || "No hay relaciones entre entidades.";
        const testsCodeAttributes = project.testPartsMap?.test1_attributes?.code || "No se detectaron tests de atributos.";
        const testsCodeRelations = project.testPartsMap?.test2_relationships?.code || "No se detectaron tests de relaciones.";
        
        const baseClassesCode = project.baseClasses || "";

        return {
          visibleText: visibleText
            .replace("{enunciado_restricciones}", attributeConstraintsStatement)
            .replace("{enunciado_relaciones}", entityRelationsStatement)
            .replace("{codigo_tests_restricciones}", testsCodeAttributes)
            .replace("{codigo_tests_relaciones}", testsCodeRelations)
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