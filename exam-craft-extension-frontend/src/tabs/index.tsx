import React, { useState } from "react"

import StatementPartSelectionScreen from "~src/screens/chooseCreate/StatementPartSelectionScreen"
import CodeGenerationScreen from "~src/screens/codeGeneration/CodeSelectionGenerateScreen"
import GenerationBaseClassesScreen from "~src/screens/codeGeneration/GenerationBaseClassesScreen"
import GenerationSolutionCodeScreen from "~src/screens/codeGeneration/GenerationSolutionCodeScreen"
import AttributesConstraintsWorkflowScreen from "~src/screens/examStatementGeneration/AttributesConstraintsWorkflowScreen"
import EntityRelationshipsWorkflowScreen from "~src/screens/examStatementGeneration/EntityRelationshipsWorkflowScreen"

import CreateExamByPartsScreen from "../screens/chooseCreate/CreateExamByPartsScreen"
import CreateExamScreen from "../screens/chooseCreate/CreateExamSelectionScreen"
import GenerationTestAtributesScreen from "../screens/codeGeneration/GenerationTestsScreen"
import GeneralGenerationTestScreen from "../screens/codeGeneration/SelectionGenerationTest"
import ContextWorkflowScreen from "../screens/examStatementGeneration/ContextWorkflowScreen"
import DiagramUMLScreen from "../screens/examStatementGeneration/DiagramaUMLWorkflowScreen"
import DomainSelectionScreen from "../screens/examStatementGeneration/DomainSelectionScreen"
import FinishFunctionalExtensionScreen from "../screens/examStatementGeneration/FinishFunctionalExtensionScreen"
import GithubScreen from "../screens/principal/GithubScreen"
import WelcomeScreen from "../screens/principal/WelcomeScreen"
import StorageExamsIndex from "../screens/storage/StorageExamsIndex"

export default function IndexTab() {
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const [contextResponse, setContextResponse] = useState<string>("")
  const [extensionStatement, setExtensionStatement] = useState<string>("")
  const [extensionMermaid, setExtensionMermaid] = useState<string>("")

  const [sharedTestData, setSharedTestData] = useState<{
    project: any
    constraints: string
    entityRelationships: string
    baseClass: string
  } | null>(null)

  const [testOrigin, setTestOrigin] = useState<
    "attributes" | "entityRelationships" | "general"
  >("attributes")

  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [cameFromAttributes, setCameFromAttributes] = useState<boolean>(false)
  const [cameFromEntityRelationships, setCameFromEntityRelationships] =
    useState<boolean>(false)

  const [screen, setScreen] = useState<
    | "welcome"
    | "github"
    | "createExam"
    | "createExamByParts"
    | "attributesConstraints"
    | "entityRelationships"
    | "functionalExtension"
    | "contextWorkflow"
    | "diagramUML"
    | "finishFunctionalExtension"
    | "storage"
    | "domainSelection"
    | "testAttributes"
    | "testGeneral"
    | "codeGeneration"
    | "generateBaseClasses"
    | "statementPartSelection"
    | "generationSolutionCode"
  >("welcome")

  const handleGoBackFromTests = () => {
    if (testOrigin === "attributes") {
      setScreen("attributesConstraints")
    } else if (testOrigin === "entityRelationships") {
      setScreen("entityRelationships")
    } else {
      setScreen("testGeneral")
    }
  }

  return (
    <div className="app-container">
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
          onComponents={() => setScreen("statementPartSelection")}
          onCodeGeneration={() => {
            setSelectedProject(null)
            setCameFromAttributes(false)
            setScreen("codeGeneration")
          }}
        />
      )}

      {screen === "statementPartSelection" && (
        <StatementPartSelectionScreen
          onBack={() => setScreen("createExamByParts")}
          onWelcome={() => setScreen("welcome")}
          onFunctionalExtension={() => setScreen("domainSelection")}
          onAttributesConstraints={() => setScreen("attributesConstraints")}
          onEntityRelationships={() => setScreen("entityRelationships")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
        />
      )}

      {screen === "codeGeneration" && (
        <CodeGenerationScreen
          onBack={() => setScreen("createExamByParts")}
          onWelcome={() => setScreen("welcome")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onGenerateTest={() => setScreen("testGeneral")}
          onGenerateBaseClasses={() => {
            setSelectedProject(null)
            setCameFromAttributes(false)
            setScreen("generateBaseClasses")
          }}
          onGenerateSolutionCode={() => setScreen("generationSolutionCode")}
        />
      )}

      {screen === "generateBaseClasses" && (
        <GenerationBaseClassesScreen
          initialProject={selectedProject}
          fromAttributes={cameFromAttributes || cameFromEntityRelationships}
          onGoToTests={(updatedProject) => {
            const origin = cameFromEntityRelationships
              ? "entityRelationships"
              : "attributes"
            setSharedTestData({
              project: updatedProject,
              constraints: updatedProject.attributeConstraints || "",
              entityRelationships: updatedProject.entityRelationships || "",
              baseClass: updatedProject.baseClasses || ""
            })
            setTestOrigin(origin)
            setScreen("testAttributes")
          }}
          onBack={() => {
            if (cameFromEntityRelationships) setScreen("entityRelationships")
            else if (cameFromAttributes) setScreen("attributesConstraints")
            else setScreen("codeGeneration")
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
          onWelcome={() => setScreen("welcome")}
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onCodeGeneration={() => setScreen("codeGeneration")}
        />
      )}

      {screen === "domainSelection" && (
        <DomainSelectionScreen
          onBack={() => setScreen("statementPartSelection")}
          onWelcome={() => setScreen("welcome")}
          onSelectDomain={(domainName) => {
            setSelectedDomain(domainName)
            setScreen("contextWorkflow")
          }}
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
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
          onComponents={() => setScreen("statementPartSelection")}
        />
      )}

      {screen === "testGeneral" && (
        <GeneralGenerationTestScreen
          onBack={() => setScreen("codeGeneration")}
          onWelcome={() => setScreen("welcome")}
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onCreateTest1={(data) => {
            setSharedTestData(data)
            setTestOrigin("general")
            setScreen("testAttributes")
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
            setExtensionStatement(statement)
            setExtensionMermaid(mermaid)
            setScreen("finishFunctionalExtension")
          }}
          onComponents={() => setScreen("statementPartSelection")}
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
          onComponents={() => setScreen("statementPartSelection")}
        />
      )}

      {screen === "storage" && (
        <StorageExamsIndex onWelcome={() => setScreen("welcome")} />
      )}

      {screen === "attributesConstraints" && (
        <AttributesConstraintsWorkflowScreen
          onBack={() => setScreen("statementPartSelection")}
          onWelcome={() => setScreen("welcome")}
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onGoToBaseClass={(project) => {
            setSelectedProject(project)
            setCameFromAttributes(true)
            setScreen("generateBaseClasses")
          }}
          onCreateTest={(data) => {
            setSharedTestData(data)
            setTestOrigin("attributes")
            setScreen("testAttributes")
          }}
        />
      )}

      {screen === "entityRelationships" && (
        <EntityRelationshipsWorkflowScreen
          onBack={() => setScreen("statementPartSelection")}
          onWelcome={() => setScreen("welcome")}
          onCreateExam={() => setScreen("createExam")}
          onGoToBaseClass={(project) => {
            setSelectedProject(project)
            setCameFromEntityRelationships(true)
            setScreen("generateBaseClasses")
          }}
          onCreateTest={(data) => {
            setSharedTestData(data)
            setTestOrigin(
              data.targetPart === "test2_relationships"
                ? "entityRelationships"
                : "attributes"
            )
            setScreen("testAttributes")
          }}
          onCreateExamByParts={() => setScreen("createExamByParts")}
        />
      )}

      {screen === "testAttributes" && (
        <GenerationTestAtributesScreen
          initialData={sharedTestData}
          source={testOrigin}
          onBack={handleGoBackFromTests}
          onWelcome={() => setScreen("welcome")}
          onCreateExam={() => setScreen("createExam")}
          onCreateExamByParts={() => setScreen("createExamByParts")}
          onCodeGeneration={() => setScreen("codeGeneration")}
          onComponents={() => setScreen("statementPartSelection")}
        />
      )}
    </div>
  )
}
