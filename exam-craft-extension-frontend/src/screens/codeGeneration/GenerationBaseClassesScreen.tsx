import React from "react"
import generationExamBaseClassesPrompt from "bundle-text:../../prompts/generation-exam-repository/exam/generation_exam_base_classes.md"
import { parseMasterPrompt } from "~src/utils/promptParser"
import WorkflowScreen from "../../components/WorkflowComponents"

interface Props {
  readonly initialProject?: any; 
  readonly fromAttributes?: boolean; 
  readonly onGoToTests?: (projectData: any) => void;
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateExamByParts: () => void
  readonly onCodeGeneration: () => void
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
  initialProject,
  fromAttributes,
  onGoToTests,
  onBack,
  onWelcome,
  onCreateExam,
  onCreateExamByParts,
  onCodeGeneration
}: Props) {

  const breadcrumbs = fromAttributes
    ? [
        { label: "INICIO", action: onWelcome },
        { label: "CREAR EXAMEN", action: onCreateExam },
        { label: "POR PARTES", action: onCreateExamByParts },
        { label: "ATRIBUTOS", action: onBack },
      ]
    : [
        { label: "INICIO", action: onWelcome },
        { label: "CREAR EXAMEN", action: onCreateExam },
        { label: "POR PARTES", action: onCreateExamByParts },
        { label: "CÓDIGO", action: onCodeGeneration }
      ];


  return (
    <WorkflowScreen
      initialProject={initialProject}
      onBack={onBack}
      onWelcome={onWelcome}
      breadcrumbItems={breadcrumbs}
      currentStep="CLASES BASE"
      selectionTitle="Selecciona un dominio"
      selectionDescription="Para generar las clases base es necesario elegir un examen ya creado."
      workflowInputTitle="Clases Base del Examen"
      workflowResultTitle={(name) => `Generar Clases Base: ${name}`}
      instructionText={
        <>
          Este es el prompt que se usará para generar las clases base del examen seleccionado.
          Puedes revisar o modificar cualquier información que veas conveniente.
          Al terminar, pulsa en <strong>"Generar"</strong>.
        </>
      }
      confirmTitle="Confirmar Examen"
      confirmDescription={(name) =>
        `¿Deseas utilizar ${name} como base para generar las clases base del examen?`
      }
      successTitle="¡Guardado correctamente!"
      successDescription={(name) =>
        `Las clases base de ${name} han sido actualizadas correctamente.`
      }
      saveButtonLabel="Guardar"

      successPrimaryButtonLabel={fromAttributes ? "Continuar con Generación de Tests" : "Volver al menú de código"}
      successSecondaryButtonLabel="Ir al Inicio"
      onSuccessSecondary={() => onWelcome()}
      
      onSaved={(savedData) => {
        const finalProjectData = {
            ...savedData.project,
            id: savedData.project.id || initialProject?.id 
        };
        if (fromAttributes && onGoToTests) {
            onGoToTests(finalProjectData);
        } else {
            onCodeGeneration();
        }
    }}

      allowedFolders={["clínica veterinaria", "ajedrez"]}
      storageKey="baseClasses"
      buildPrompt={(project) => {
        try {
          const { visibleText, hiddenContext } = parseMasterPrompt(generationExamBaseClassesPrompt);
          
          const rawDominio = project?.domainName || project?.name || project?.customName || "";
          const dominioNormalizado = rawDominio.trim();
          
          const clasesExistentes = CLASES_POR_DEFECTO[dominioNormalizado.toLowerCase()] || 
                                  "No hay clases base registradas para este dominio.";

          const baseTemplate = visibleText && visibleText.trim().length > 0 
            ? visibleText 
            : "Genera las clases base en Java para el dominio {dominio}. Clases a incluir: {clases_existentes}";

          return {
          visibleText: baseTemplate
            .replaceAll("{dominio}", dominioNormalizado || "el examen")
            .replaceAll("{clases_existentes}", clasesExistentes),
          hiddenContext: hiddenContext || "",
        };
        } catch (error) {
          console.error("Error en buildPrompt:", error);
          return { 
            visibleText: "Error al preparar el prompt. Por favor, revisa el dominio seleccionado.", 
            hiddenContext: "" 
          };
        }
      }}
      logExerciseName="base_classes_code_generation"
      downloadPrefix="Clases_Base"
      downloadTitle={(p) => `Clases Base - ${p.customName || p.domainName}`}
    />
  )
}