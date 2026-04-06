import { useState } from "react"
import WelcomeScreen from "../screens/WelcomeScreen"
import GithubScreen from "../screens/GithubScreen"
import CreateExamScreen from "../screens/CreateExamScreen"
import CreateExamByPartsScreen from "../screens/CreateExamByPartsScreen"
import DomainSelectionScreen from "../screens/examStatementGeneration/DomainSelectionScreen"
import DomainWorkflowScreen from "../screens/examStatementGeneration/DomainWorkflowScreen"
import DiagramUMLScreen from "../screens/examStatementGeneration/DiagramUMLScreen"
import FinishFunctionalExtensionScreen from "../screens/examStatementGeneration/FinishFunctionalExtensionScreen"
import "/assets/main.css"
import AttributesConstraintsWorkflowScreen from "~src/screens/examStatementGeneration/AttributesConstraintsWorkflowScreen"
import GenerationTestAtributesScreen from "../screens/codeGeneration/GenerationTestAtributesScreen"
import GeneralGenerationTestScreen from "../screens/codeGeneration/GeneralGenerationTestScreen"
import CodeGenerationScreen from "~src/screens/codeGeneration/CodeGenerationScreen"
import GenerationBaseClassesScreen from "~src/screens/codeGeneration/GenerationBaseClassesScreen"
import StorageExamsIndex from "../screens/storage/StorageExamsIndex"

export default function IndexTab() {
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const [contextResponse, setContextResponse] = useState<string>("")
  const [functionalExtensionCompleted, setFunctionalExtensionCompleted] = useState<string>("")
  
  const [sharedTestData, setSharedTestData] = useState<{ project: any, constraints: string, baseClass: string } | null>(null)
  const [testOrigin, setTestOrigin] = useState<'attributes' | 'general'>('attributes');
  
  // Estados de control de flujo
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [cameFromAttributes, setCameFromAttributes] = useState<boolean>(false);

  const [screen, setScreen] = useState<
    "welcome" | 
    "github" | 
    "createExam" | 
    "createExamByParts" | 
    "attributesConstraints" |
    "functionalExtension" | 
    "domainWorkflow" |
    "diagramUML" |
    "finishFunctionalExtension" |
    "storage" |
    "domainSelection" | 
    "testAtributes" |
    "testGeneral" |
    "codeGeneration" |
    "generateBaseClasses"
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
          onFunctionalExtension={() => setScreen("domainSelection")}
          onAttributesConstraints={() => setScreen("attributesConstraints")}
          // 👇 Al ir a código desde aquí, reseteamos el origen
          onCodeGeneration={() => {
            setSelectedProject(null); 
            setCameFromAttributes(false);
            setScreen("codeGeneration");
          }}
          onGenerateTest={() => setScreen("testGeneral")}
        />
      )}

      {screen === "codeGeneration" && (
        <CodeGenerationScreen 
          onBack={() => setScreen("createExamByParts")} 
          onWelcome={() => setScreen("welcome")} 
          onGenerateTest={() => setScreen("testGeneral")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onGenerateBaseClasses={(project) => {
            setSelectedProject(null);
            setCameFromAttributes(false); 
            setScreen("generateBaseClasses");
          }}
        />
      )}
  
      {screen === "generateBaseClasses" && (
        <GenerationBaseClassesScreen 
          initialProject={selectedProject} 
          fromAttributes={cameFromAttributes} // ✅ Corregido: Ahora pasa el booleano real
          onGoToTests={(updatedProject) => { 
            setSharedTestData({
              project: updatedProject,
              constraints: updatedProject.attributeConstraints || "",
              baseClass: updatedProject.baseClasses || updatedProject.baseClass || ""
            });
            setTestOrigin('attributes');
            setScreen("testAtributes");
          }} 
          onBack={() => setScreen(cameFromAttributes ? "attributesConstraints" : "codeGeneration")} 
          onWelcome={() => setScreen("welcome")}
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onCodeGeneration={() => setScreen("codeGeneration")}
        />
      )}

      {screen === "domainSelection" && (
        <DomainSelectionScreen 
          onBack={() => setScreen("createExamByParts")} 
          onWelcome={() => setScreen("welcome")} 
          onSelectDomain={(domainName) => {
              setSelectedDomain(domainName)  
              setScreen("domainWorkflow") 
          }}
          onCreateExam={() => setScreen("createExam")}
        />
      )}

      {screen === "domainWorkflow" && (
        <DomainWorkflowScreen 
          domainName={selectedDomain}
          onBack={() => setScreen("domainSelection")} 
          onWelcome={() => setScreen("welcome")} 
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onFunctionalExtension={() => setScreen("functionalExtension")}
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
            setScreen("testAtributes");
          }}
          onCodeGeneration={() => setScreen("codeGeneration")}
        />
      )}

      {screen === "diagramUML" && (
        <DiagramUMLScreen 
          domainName={selectedDomain}
          context={contextResponse}
          onBack={() => setScreen("domainWorkflow")} 
          onWelcome={() => setScreen("welcome")}
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onFunctionalExtension={() => setScreen("domainSelection")}
          onStatementStep1={() => setScreen("domainWorkflow")}
          onFinishExtension={(extensionFinish) => {
            setFunctionalExtensionCompleted(extensionFinish)
            setScreen("finishFunctionalExtension")
          }}
        />
      )}

      {screen === "finishFunctionalExtension" && (
        <FinishFunctionalExtensionScreen 
          domainName={selectedDomain}
          extensionFinish={functionalExtensionCompleted}
          onBack={() => setScreen("domainWorkflow")} 
          onWelcome={() => setScreen("welcome")}
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onFunctionalExtension={() => setScreen("functionalExtension")}
          onStatementStep1={() => setScreen("domainWorkflow")}
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
          onBack={() => setScreen("createExamByParts")} 
          onWelcome={() => setScreen("welcome")} 
          onCreateExam={() => setScreen("createExam")}
          onGoToBaseClass={(project) => {
            setSelectedProject(project);
            setCameFromAttributes(true); // ✅ Marcamos que venimos de atributos
            setScreen("generateBaseClasses");
          }}
          onCreateTest={(data) => {
            setSharedTestData(data);
            setTestOrigin('attributes');
            setScreen("testAtributes");
          }}
        />
      )}

      {screen === "testAtributes" && (
        <GenerationTestAtributesScreen 
          initialData={sharedTestData} 
          source={testOrigin} 
          onBack={() => setScreen(testOrigin === 'attributes' ? "attributesConstraints" : "testGeneral")} 
          onWelcome={() => setScreen("welcome")} 
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
        />
      )}
    </div>
  )
}