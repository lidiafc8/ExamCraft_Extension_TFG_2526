import React from "react"
import generationAttributeConstraintsSolutionPrompt from "bundle-text:../../../prompts/generation-exam-repository/solution/generation_attributes_constraints_solution.md"
import { parseMasterPrompt } from "~src/utils/promptParser"
import WorkflowScreen from "../../../components/WorkflowScreen"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateExamByParts: () => void
  readonly onCodeGeneration: () => void
  readonly onSolutionCodeGeneration: () => void
}

export default function GenerationAttributeConstraintsSolutionScreen({
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
      currentStep="RESTRICCIONES ATRIBUTOS"

      selectionTitle="Selecciona un examen"
      selectionDescription="Para generar la solución es necesario elegir un examen que ya cuente con el enunciado de restricciones, los tests correspondientes y el código base generado. Haz clic en la carpeta del dominio correspondiente."
      
      workflowInputTitle="Generación de Código Solución"
      workflowResultTitle={(name) => `Generar Solución: ${name}`}
      
      instructionText={(project) => {
        const hasOtherSolution = !!(project?.fullSolution);

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <p>
              Este es el prompt que se usará para generar el <strong>Código Solución de Restricciones de Atributos</strong> del examen seleccionado. 
              Puede revisar o modificar cualquier información que vea conveniente.
              Al terminar, pulse en <strong>"Generar"</strong>.
            </p>
            
            {hasOtherSolution && (
              <div style={{ backgroundColor: "#f0f4f8", padding: "15px", borderRadius: "8px", border: "1px solid #cce0ff" }}>
                <p style={{ margin: 0, fontSize: "0.9em", color: "#555" }}>
                  <strong>Nota:</strong> Se ha detectado código solución del ejercicio "Relaciones entre Entidades". La IA usará dicho código como base automáticamente para añadirle la solución de "Restricciones de Atributos", generando así una versión completa. 
                </p>
              </div>
            )}
          </div>
        );
      }}
      
      confirmTitle="Confirmar Generación"
      confirmDescription={(name) =>
        `¿Deseas generar el código solución de "Restricciones de Atributos" para el examen ${name}?`
      }
      
      confirmWarning={(project) =>
        project.fullSolution
          ? "Este examen ya tiene código solución generado.\nSi continúas, el código anterior será reemplazado."
          : null
      }
      
      confirmButtonLabel={(project) =>
        project.fullSolution ? "Continuar y reemplazar" : "Confirmar"
      }
      
      successTitle="¡Solución generada correctamente!"
      successDescription={(name) =>
        `El código solución para ${name} ha sido guardado exitosamente.`
      }
      saveButtonLabel="Guardar"

      allowedFolders={["clínica veterinaria", "ajedrez"]}
      
      // Guardamos siempre en fullSolution
      storageKey="fullSolution" 
      
      filterProject={(project) => {
        const hasBaseClasses = !!(project.baseClasses && project.baseClasses.trim() !== "");
        const hasConstraints = !!(project.attributeConstraints && project.attributeConstraints.trim() !== "");
        const hasAttributeTests = !!(project.testPartsMap?.test1_attributes?.code?.trim());

        return hasBaseClasses && hasConstraints && hasAttributeTests;
      }}
      
      buildPrompt={(project) => {
        const { visibleText, hiddenContext } = parseMasterPrompt(generationAttributeConstraintsSolutionPrompt);
        
        const attributeConstraintsStatement = project.attributeConstraints || "";
        const testsCode = project.testPartsMap?.test1_attributes?.code || "";

        // Si existe la solución de relaciones o la completa, la usa como base, de lo contrario usa las clases base limpias
        const baseClassesCode = project.fullSolution || project.baseClasses || "";

        return {
          visibleText: visibleText
            .replace("{enunciado_restricciones}", attributeConstraintsStatement)
            .replace("{codigo_tests}", testsCode)
            .replace("{codigo_base_localstorage}", baseClassesCode),
          hiddenContext,
        }
      }}
      
      logExerciseName="attribute_constraints_full_solution_generation"
      downloadPrefix="Solucion_Completa"
      downloadTitle={(p) => `Solución Completa - ${p.customName || p.domainName}`}
      onSaved={() => onWelcome()}
    />
  )
}