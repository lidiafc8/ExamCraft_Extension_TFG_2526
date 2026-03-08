import { useState } from "react"
import WelcomeScreen from "../screens/WelcomeScreen"
import GithubScreen from "../screens/GithubScreen"
import CreateExamScreen from "../screens/CreateExamScreen"
import CreateExamByPartsScreen from "../screens/CreateExamByPartsScreen"
import DomainSelectionScreen from "../screens/DomainSelectionScreen"
import DomainWorkflowScreen from "../screens/DomainWorkflowScreen"
import "/assets/main.css"

export default function IndexTab() {
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const [screen, setScreen] = useState<
    "welcome" | 
    "github" | 
    "createExam" | 
    "createExamByParts" | 
    "domainSelection" | 
    "domainWorkflow" 
  >("welcome")

  return (
    <div>
      {screen === "welcome" && (
        <WelcomeScreen 
        onStart={() => setScreen("github")} 
        onCreateExam={() => setScreen("createExam")}
        onBack={() => setScreen("welcome")}/>
      )}

      {screen === "github" && (
        <GithubScreen onBack={() => setScreen("welcome")} />
      )}

      {screen === "createExam" && (
        <CreateExamScreen 
        onBack={() => setScreen("welcome")} 
        onCreateExamByParts={() => setScreen("createExamByParts")} />
      )}

      {screen === "createExamByParts" && (
        <CreateExamByPartsScreen 
        onBack={() => setScreen("createExam")} 
        onWelcome={() => setScreen("welcome")} 
        onFunctionalExtension={() => setScreen("domainSelection")} />
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
          onFunctionalExtension={() => setScreen("domainSelection")}
        />
      )}


    </div>
  )
}

