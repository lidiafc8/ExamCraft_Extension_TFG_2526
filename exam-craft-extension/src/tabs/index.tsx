import { useState } from "react"
import WelcomeScreen from "../screens/WelcomeScreen"
import GithubScreen from "../screens/GithubScreen"
import CreateExamScreen from "../screens/CreateExamScreen"
import CreateExamByPartsScreen from "../screens/CreateExamByPartsScreen"
import CreateExamExtensionStep2Screen from "../screens/CreateExamExtensionStep2Screen"
import FunctionalExtensionScreen from "../screens/FunctionalExtensionScreen"
import DomainWorkflowScreen from "../screens/DomainWorkflowScreen"
import FinishFunctionalExtensionScreen from "../screens/FinishFunctionalExtensionScreen"
import "/assets/main.css"

export default function IndexTab() {
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const [statementText, setStatementText] = useState<string>("")
  
  const [screen, setScreen] = useState<
    "welcome" | 
    "github" | 
    "createExam" | 
    "createExamByParts" | 
    "functionalExtension" | 
    "domainWorkflow" |
    "diagramUML" |
    "finishFunctionalExtension"
  >("welcome")

  return (
    <div>
      {screen === "welcome" && (
        <WelcomeScreen 
          onStart={() => setScreen("github")} 
          onCreateExam={() => setScreen("createExam")}
          onBack={() => setScreen("welcome")}
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
          onFunctionalExtension={() => setScreen("functionalExtension")} 
        />
      )}

      {screen === "functionalExtension" && (
        <FunctionalExtensionScreen 
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
          onBack={() => setScreen("functionalExtension")} 
          onWelcome={() => setScreen("welcome")} 
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onFunctionalExtension={() => setScreen("functionalExtension")}
          onGoToUML={(texto) => {
              setStatementText(texto);
              setScreen("diagramUML");
          }}
        />
      )}

      {screen === "diagramUML" && (
        <CreateExamExtensionStep2Screen
          domainName={selectedDomain}
          statementText={statementText} 
          onBack={() => setScreen("domainWorkflow")} 
          onWelcome={() => setScreen("welcome")}
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onFunctionalExtension={() => setScreen("functionalExtension")}
          onStatementStep1={() => setScreen("domainWorkflow")}
          finishFunctionalExtension={(texto) => setScreen("finishFunctionalExtension")}
          onGoToUML={(texto) => {
            console.log("Avanzando desde el paso 2 con el texto:", texto);
          }}
        />
      )}

        {screen === "finishFunctionalExtension" && (
        <FinishFunctionalExtensionScreen
          domainName={selectedDomain}
          statementText={statementText} 
          onBack={() => setScreen("domainWorkflow")} 
          onWelcome={() => setScreen("welcome")}
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onFunctionalExtension={() => setScreen("functionalExtension")}
          onStatementStep1={() => setScreen("domainWorkflow")}
          onGoToUML={(texto) => {
            console.log("Avanzando desde el paso 2 con el texto:", texto);
          }}
        />
      )}

    </div>
  )
}