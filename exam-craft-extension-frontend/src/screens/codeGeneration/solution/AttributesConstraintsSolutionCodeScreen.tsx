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
      selectionDescription="Para generar la solución es necesario elegir un examen que ya cuente con el enunciado de restricciones, los tests y el código base generado. Haz clic en la carpeta del dominio correspondiente."
      
      workflowInputTitle="Generación de Código Solución"
      workflowResultTitle={(name) => `Generar Solución: ${name}`}
      
      instructionText={
        <>
          Este es el prompt que se usará para generar el <strong>Código Solución de Restricciones de Atributos</strong> del examen seleccionado. 
          Puede revisar o modificar cualquier información que vea conveniente.
          Al terminar, pulse en <strong>"Generar"</strong>.
        </>
      }
      
      confirmTitle="Confirmar Generación"
      confirmDescription={(name) =>
        `¿Deseas generar el código solución del ejercicio "Restricciones de Atributos" para el examen ${name}?`
      }
      confirmWarning={(project) =>
        project.attributeConstraintsSolution
          ? "Este examen ya tiene código solución generado para el ejercicio de restricciones de atributos.\nSi continúas, el código solución anterior será reemplazado por el nuevo."
          : null
      }
      confirmButtonLabel={(project) =>
        project.attributeConstraintsSolution ? "Continuar y reemplazar" : "Confirmar"
      }
      successTitle="¡Solución generada correctamente!"
      successDescription={(name) =>
        `El código solución de restricciones para ${name} ha sido guardado exitosamente.`
      }
      saveButtonLabel="Guardar Solución"

      allowedFolders={["clínica veterinaria", "ajedrez"]}
      storageKey="attributeConstraintsSolution" 
      
      filterProject={(project) => {
        return Boolean(
            project.baseClasses && 
            project.baseClasses.trim() !== "" &&
            project.javaTests && 
            project.attributeConstraints && 
            project.attributeConstraints.trim() !== ""
        );
      }}
      
      buildPrompt={(project) => {
        const { visibleText, hiddenContext } = parseMasterPrompt(generationAttributeConstraintsSolutionPrompt);
        
        const AttributeConstraintsStatement = project.attributeConstraints || "";
        
        let testsCode = "";
        if (Array.isArray(project.javaTests) && project.javaTests.length > 0) {
            testsCode = project.javaTests.join('\n\n');
        } else if (project.javaTests) {
            testsCode = project.javaTests;
        }

        const baseClassesCode = project.baseClasses || "";

        return {
          visibleText: visibleText
            .replace("{enunciado_restricciones}", AttributeConstraintsStatement)
            .replace("{codigo_tests}", testsCode)
            .replace("{codigo_base_localstorage}", baseClassesCode),
          hiddenContext,
        }
      }}
      
      logExerciseName="attribute_constraints_solution_generation"
      downloadPrefix="Solucion_Restricciones_Atributos"
      downloadTitle={(p) => `Solución Restricciones Atributos - ${p.customName || p.domainName}`}
      onSaved={() => onWelcome()}
    />
  )
}