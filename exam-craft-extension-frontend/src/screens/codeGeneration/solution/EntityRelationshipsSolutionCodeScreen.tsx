import React, { useState } from "react"
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
  
  const [generateCombined, setGenerateCombined] = useState(false);

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
        const hasOtherSolution = !!(project?.attributeConstraintsSolution);

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <p>
              Este es el prompt que se usará para generar el <strong>Código Solución de Relaciones entre Entidades</strong> del examen seleccionado. 
              Puede revisar o modificar cualquier información que vea conveniente.
              Al terminar, pulse en <strong>"Generar"</strong>.
            </p>
            
            {hasOtherSolution && (
              <div style={{ backgroundColor: "#f0f4f8", padding: "15px", borderRadius: "8px", border: "1px solid #cce0ff" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "bold", color: "#333" }}>
                  <input 
                    type="checkbox" 
                    checked={generateCombined} 
                    onChange={(e) => setGenerateCombined(e.target.checked)} 
                    style={{ transform: "scale(1.2)" }}
                  />
                  Generar versión COMPLETA
                </label>
                <p style={{ margin: "8px 0 0 25px", fontSize: "0.9em", color: "#555" }}>
                  Has generado código solución para el ejercicio "Restricciones de Atributos". Al activar esta opción, la IA usará dicho código como base para añadirle la solución de "Relaciones entre Entidades". 
                </p>
              </div>
            )}
          </div>
        );}
    
      }
      
      confirmTitle="Confirmar Generación"
      confirmDescription={(name) =>
        `¿Deseas generar el código solución ${generateCombined ? "COMPLETO" : "AISLADO"} del ejercicio "Relaciones entre Entidades" para el examen ${name}?`
      }
      
      confirmWarning={(project) => {
        const keyToCheck = generateCombined ? "fullSolution" : "entityRelationshipsSolution";
        return project[keyToCheck]
          ? `Este examen ya tiene código solución generado para la versión ${generateCombined ? "COMPLETA" : "AISLADA"}.\nSi continúas, el código anterior será reemplazado.`
          : null;
      }}
      
      confirmButtonLabel={(project) => {
        const keyToCheck = generateCombined ? "fullSolution" : "entityRelationshipsSolution";
        return project[keyToCheck] ? "Continuar y reemplazar" : "Confirmar";
      }}
      
      successTitle="¡Solución generada correctamente!"
      successDescription={(name) =>
        `El código solución ${generateCombined ? "completo" : "de Relaciones"} para ${name} ha sido guardado exitosamente.`
      }
      saveButtonLabel="Guardar"

      allowedFolders={["clínica veterinaria", "ajedrez"]}
      
      storageKey={generateCombined ? "fullSolution" : "entityRelationshipsSolution"} 
      
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

        const otherSolutionCode = project.attributeConstraintsSolution || ""; 
        let baseClassesCode = project.baseClasses || "";
        
        if (generateCombined && otherSolutionCode) {
            baseClassesCode = otherSolutionCode; 
        }

        return {
          visibleText: visibleText
            .replace("{enunciado_relaciones}", entityRelationshipsStatement)
            .replace("{codigo_tests}", testsCode)
            .replace("{codigo_base_localstorage}", baseClassesCode),
          hiddenContext,
        }
      }}
      
      logExerciseName={generateCombined ? "full_solution_generation" : "entity_relationships_solution_generation"}
      downloadPrefix={generateCombined ? "Solucion_Completa" : "Solucion_Relaciones_Entidades"}
      downloadTitle={(p) => `Solución ${generateCombined ? "Completa" : "Relaciones"} - ${p.customName || p.domainName}`}
      onSaved={() => onWelcome()}
    />
  )
}