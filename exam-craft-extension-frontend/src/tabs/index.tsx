import { useState } from "react"
import WelcomeScreen from "../screens/principal/WelcomeScreen"
import GithubScreen from "../screens/principal/GithubScreen"
import CreateExamScreen from "../screens/chooseCreate/CreateExamScreen"
import CreateExamByPartsScreen from "../screens/chooseCreate/CreateExamByPartsScreen"
import DomainSelectionScreen from "../screens/examStatementGeneration/DomainSelectionScreen"
import DiagramUMLScreen from "../screens/examStatementGeneration/DiagramaUMLWorkflowScreen"
import FinishFunctionalExtensionScreen from "../screens/examStatementGeneration/FinishFunctionalExtensionScreen"
import AttributesConstraintsWorkflowScreen from "~src/screens/examStatementGeneration/AttributesConstraintsWorkflowScreen"
import GenerationTestAtributesScreen from "../screens/codeGeneration/GenerationTestAtributesScreen"
import GeneralGenerationTestScreen from "../screens/codeGeneration/GeneralGenerationTestScreen"
import CodeGenerationScreen from "~src/screens/codeGeneration/CodeSelectionGenerateScreen"
import GenerationBaseClassesScreen from "~src/screens/codeGeneration/GenerationBaseClassesScreen"
import StorageExamsIndex from "../screens/storage/StorageExamsIndex"
import EntityRelationshipsWorkflowScreen from "~src/screens/examStatementGeneration/EntityRelationshipsWorkflowScreen"
import PartsGenerationScreen from "~src/screens/chooseCreate/PartsGenetarionScreen"
import ContextWorkflowScreen from "../screens/examStatementGeneration/ContextWorkflowScreen"
import GenerationSolutionCodeScreen from "~src/screens/codeGeneration/GenerationSolutionCodeScreen"

export default function IndexTab() {
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const [contextResponse, setContextResponse] = useState<string>("")
  const [extensionStatement, setExtensionStatement] = useState<string>("")
  const [extensionMermaid, setExtensionMermaid] = useState<string>("")
  
  const [sharedTestData, setSharedTestData] = useState<{ project: any, constraints: string, entityRelationships: string, baseClass: string } | null>(null)

  const [testOrigin, setTestOrigin] = useState<'attributes' | 'entityRelationships' | 'general'>('attributes');

  // Estados de control de flujo
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [cameFromAttributes, setCameFromAttributes] = useState<boolean>(false);
  const [cameFromEntityRelationships, setCameFromEntityRelationships] = useState<boolean>(false);

  const [screen, setScreen] = useState<
    "welcome" | 
    "github" | 
    "createExam" | 
    "createExamByParts" | 
    "attributesConstraints" |
    "entityRelationships" |
    "functionalExtension" | 
    "contextWorkflow" |
    "diagramUML" |
    "finishFunctionalExtension" |
    "storage" |
    "domainSelection" | 
    "testAttributes" |
    "testGeneral" |
    "codeGeneration" |
    "generateBaseClasses" |
    "partsGeneration" |
    "generationSolutionCode"
    
  >("welcome")

  return (
    <div>
      {screen === "welcome" && (
        <WelcomeScreen 
          onStart={() => setScreen("github")} 
          onCreateExam={() => setScreen("createExam")}
          onBack={() => setScreen("welcome")}
          onStorage={() => setScreen("storage")}
        />
      )}

      {screen === "github" && (
        <GithubScreen onBack={() => setScreen("welcome")} />
      )}

      {screen === "createExam" && (
        <CreateExamScreen 
          onBack={() => setScreen("welcome")} 
          onCreateExamByParts={() => setScreen("createExamByParts")} 
        />
      )}

      {screen === "createExamByParts" && (
        <CreateExamByPartsScreen 
        onBack={() => setScreen("createExam")} 
        onWelcome={() => setScreen("welcome")} 
        onComponents={() => setScreen("partsGeneration")}
        onCodeGeneration={() => {
          setSelectedProject(null); 
          setCameFromAttributes(false);
          setScreen("codeGeneration");
          }}
        />
      )}

      {screen === "partsGeneration" && (
        <PartsGenerationScreen 
        onBack={() => setScreen("createExamByParts")} 
        onWelcome={() => setScreen("welcome")} 
        onFunctionalExtension={() => setScreen("domainSelection")}
        onAttributesConstraints={() => setScreen("attributesConstraints")}
        onEntityRelationships={() => setScreen("entityRelationships")}
        onPartsGeneration={() => setScreen("createExamByParts")}
        />
      )}

      {screen === "codeGeneration" && (
        <CodeGenerationScreen 
        onBack={() => setScreen("createExamByParts")} 
          onWelcome={() => setScreen("welcome")} 
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onGenerateTest={() => setScreen("testGeneral")}
          onGenerateBaseClasses={(project) => {
            setSelectedProject(null);
            setCameFromAttributes(false); 
            setScreen("generateBaseClasses");
          }}
          onGenerateSolutionCode={ () => setScreen("generationSolutionCode")}
            
        />
      )}
 

      {screen === "generateBaseClasses" && (
        <GenerationBaseClassesScreen 
          initialProject={selectedProject} 
          fromAttributes={cameFromAttributes || cameFromEntityRelationships} 
          onGoToTests={(updatedProject) => { 
            setSharedTestData({
              project: updatedProject,
              constraints: updatedProject.attributeConstraints || "",
              entityRelationships: updatedProject.entityRelationships || "",
              baseClass: updatedProject.baseClasses || updatedProject.baseClass || ""
            });
            setTestOrigin(cameFromEntityRelationships ? 'entityRelationships' : 'attributes');
            setScreen("testAttributes");
          }} 
          onBack={() => {
            if (cameFromEntityRelationships) setScreen("entityRelationships");
            else if (cameFromAttributes) setScreen("attributesConstraints");
            else setScreen("codeGeneration");
          }} 
          onWelcome={() => setScreen("welcome")}
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onCodeGeneration={() => setScreen("codeGeneration")}
        />
      )}

      {screen === "generationSolutionCode" && (
        <GenerationSolutionCodeScreen 
          onBack={() => setScreen("codeGeneration")}
          onWelcome ={() => setScreen("welcome")}
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onCodeGeneration={() => setScreen("codeGeneration")}
        />
      )}

      {screen === "domainSelection" && (
        <DomainSelectionScreen 
        onBack={() => setScreen("partsGeneration")} 
          onWelcome={() => setScreen("welcome")} 
          onSelectDomain={(domainName) => {
              setSelectedDomain(domainName)  
              setScreen("contextWorkflow") 
          }}
         onCreateExam={() => setScreen("createExam")}
         onComponents={() => setScreen("partsGeneration")}
        />
      )}

      {screen === "contextWorkflow" && (
        <ContextWorkflowScreen 
          domainName={selectedDomain}
          onBack={() => setScreen("domainSelection")} 
          onWelcome={() => setScreen("welcome")} 
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onFunctionalExtension={() => setScreen("domainSelection")}
          onCreateDiagram={(context) => {
            setContextResponse(context)
            setScreen("diagramUML")
          }}
        />
      )}

      {screen === "testGeneral" && (
        <GeneralGenerationTestScreen 
          onBack={() => setScreen("codeGeneration")} 
          onWelcome={() => setScreen("welcome")}
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onCreateTest1={(data) => {
            setSharedTestData(data);
            setTestOrigin('general');
            setScreen("testAttributes");
          }}
          onCodeGeneration={() => setScreen("codeGeneration")}
        />
      )}

      {screen === "diagramUML" && (
        <DiagramUMLScreen 
          domainName={selectedDomain}
          context={contextResponse}
          onBack={() => setScreen("contextWorkflow")} 
          onWelcome={() => setScreen("welcome")}
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onFunctionalExtension={() => setScreen("domainSelection")}
          onStatementStep1={() => setScreen("contextWorkflow")}
          onFinishExtension={(statement, mermaid) => {
              setExtensionStatement(statement);
              setExtensionMermaid(mermaid);
              setScreen("finishFunctionalExtension");
          }}
        />
      )}

      {screen === "finishFunctionalExtension" && (
        <FinishFunctionalExtensionScreen 
          domainName={selectedDomain}
          extensionStatement={extensionStatement}
          extensionMermaid={extensionMermaid}
          onBack={() => setScreen("diagramUML")} 
          onWelcome={() => setScreen("welcome")}
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onFunctionalExtension={() => setScreen("domainSelection")}
          onStatementStep1={() => setScreen("contextWorkflow")}
          onCreateDiagram={(context) => {
            setContextResponse(context)
            setScreen("diagramUML")
          }}
        />
      )}

      {screen === "storage" && (
        <StorageExamsIndex onWelcome={() => setScreen("welcome")} />
      )}

      {screen === "attributesConstraints" && (
        <AttributesConstraintsWorkflowScreen 
          onBack={() => setScreen("partsGeneration")} 
          onWelcome={() => setScreen("welcome")} 
          onCreateExam={() => setScreen("createExam")}
          onGoToBaseClass={(project) => {
            setSelectedProject(project);
            setCameFromAttributes(true); 
            setScreen("generateBaseClasses");
          }}
          onCreateTest={(data) => {
            setSharedTestData(data);
            setTestOrigin('attributes');
            setScreen("testAttributes");
          }}
        />
      )}

      {screen === "entityRelationships" && (
      <EntityRelationshipsWorkflowScreen 
        onBack={() => setScreen("partsGeneration")} 
        onWelcome={() => setScreen("welcome")} 
        onCreateExam={() => setScreen("createExam")}
        onGoToBaseClass={(project) => {
          setSelectedProject(project);
          setCameFromEntityRelationships(true);
          setScreen("generateBaseClasses");
        }}
        onCreateTest={(data) => {
          setSharedTestData(data);
          
          if (data.targetPart === "test2_relationships") {
            setTestOrigin('entityRelationships');
          } else {
            setTestOrigin('attributes'); 
          }
          
          setScreen("testAttributes"); 
        }}
      />
    )}

      {screen === "testAttributes" && (
        <GenerationTestAtributesScreen 
          initialData={sharedTestData} 
          source={testOrigin} 
          onBack={() => setScreen(testOrigin === 'attributes' ? "attributesConstraints" : "testGeneral")} 
          onWelcome={() => setScreen("welcome")} 
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onCodeGeneration={() => setScreen("codeGeneration")}
        />
      )}
    </div>
  )
}