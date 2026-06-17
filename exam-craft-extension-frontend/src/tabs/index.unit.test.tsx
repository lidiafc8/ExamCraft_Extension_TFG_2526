import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom"

import IndexTab from "./index"

vi.mock("../screens/principal/WelcomeScreen", () => ({
  default: ({ onStart, onCreateExam, onStorage }: any) => (
    <div data-testid="screen-welcome">
      <button onClick={onStart}>Ir a GitHub</button>
      <button onClick={onCreateExam}>Crear Examen</button>
      <button onClick={onStorage}>Ver Storage</button>
    </div>
  )
}))

vi.mock("../screens/principal/GithubScreen", () => ({
  default: ({ onBack }: any) => (
    <div data-testid="screen-github">
      <button onClick={onBack}>Volver desde GitHub</button>
    </div>
  )
}))

vi.mock("../screens/chooseCreate/CreateExamSelectionScreen", () => ({
  default: ({ onBack, onCreateExamByParts }: any) => (
    <div data-testid="screen-createExam">
      <button onClick={onBack}>Volver desde CreateExam</button>
      <button onClick={onCreateExamByParts}>Por Partes</button>
    </div>
  )
}))

vi.mock("../screens/chooseCreate/CreateExamByPartsScreen", () => ({
  default: ({ onBack, onWelcome, onComponents, onCodeGeneration }: any) => (
    <div data-testid="screen-createExamByParts">
      <button onClick={onBack}>Volver desde ByParts</button>
      <button onClick={onWelcome}>Welcome desde ByParts</button>
      <button onClick={onComponents}>Componentes</button>
      <button onClick={onCodeGeneration}>Código desde ByParts</button>
    </div>
  )
}))

vi.mock("~src/screens/chooseCreate/StatementPartSelectionScreen", () => ({
  default: ({
    onBack,
    onWelcome,
    onFunctionalExtension,
    onAttributesConstraints,
    onEntityRelationships,
    onCreateExamByParts
  }: any) => (
    <div data-testid="screen-statementPartSelection">
      <button onClick={onBack}>Volver desde StatementPart</button>
      <button onClick={onWelcome}>Welcome desde StatementPart</button>
      <button onClick={onFunctionalExtension}>Extensión Funcional</button>
      <button onClick={onAttributesConstraints}>Atributos</button>
      <button onClick={onEntityRelationships}>Relaciones</button>
      <button onClick={onCreateExamByParts}>ByParts desde StatementPart</button>
    </div>
  )
}))

vi.mock("~src/screens/codeGeneration/CodeSelectionGenerateScreen", () => ({
  default: ({
    onBack,
    onWelcome,
    onCreateExamByParts,
    onGenerateTest,
    onGenerateBaseClasses,
    onGenerateSolutionCode
  }: any) => (
    <div data-testid="screen-codeGeneration">
      <button onClick={onBack}>Volver desde CodeGen</button>
      <button onClick={onWelcome}>Welcome desde CodeGen</button>
      <button onClick={onCreateExamByParts}>ByParts desde CodeGen</button>
      <button onClick={onGenerateTest}>Generar Test</button>
      <button onClick={onGenerateBaseClasses}>Generar Clases Base</button>
      <button onClick={onGenerateSolutionCode}>Generar Solución</button>
    </div>
  )
}))

vi.mock("~src/screens/codeGeneration/GenerationBaseClassesScreen", () => ({
  default: ({
    onBack,
    onWelcome,
    onCreateExam,
    onCreateExamByParts,
    onCodeGeneration,
    onGoToTests,
    initialProject,
    fromAttributes
  }: any) => (
    <div data-testid="screen-generateBaseClasses">
      <span data-testid="initial-project">
        {JSON.stringify(initialProject)}
      </span>
      <span data-testid="from-attributes">{String(fromAttributes)}</span>
      <button onClick={onBack}>Volver desde BaseClasses</button>
      <button onClick={onWelcome}>Welcome desde BaseClasses</button>
      <button onClick={onCreateExam}>CreateExam desde BaseClasses</button>
      <button onClick={onCreateExamByParts}>ByParts desde BaseClasses</button>
      <button onClick={onCodeGeneration}>CodeGen desde BaseClasses</button>
      <button
        onClick={() =>
          onGoToTests({
            id: "p1",
            attributeConstraints: "constraints",
            entityRelationships: "relations",
            baseClasses: "class A {}"
          })
        }>
        Ir a Tests
      </button>
    </div>
  )
}))

vi.mock("~src/screens/codeGeneration/GenerationSolutionCodeScreen", () => ({
  default: ({
    onBack,
    onWelcome,
    onCreateExam,
    onCreateExamByParts,
    onCodeGeneration
  }: any) => (
    <div data-testid="screen-generationSolutionCode">
      <button onClick={onBack}>Volver desde SolutionCode</button>
      <button onClick={onWelcome}>Welcome desde SolutionCode</button>
      <button onClick={onCreateExam}>CreateExam desde SolutionCode</button>
      <button onClick={onCreateExamByParts}>ByParts desde SolutionCode</button>
      <button onClick={onCodeGeneration}>CodeGen desde SolutionCode</button>
    </div>
  )
}))

vi.mock("../screens/examStatementGeneration/DomainSelectionScreen", () => ({
  default: ({
    onBack,
    onWelcome,
    onSelectDomain,
    onCreateExam,
    onCreateExamByParts
  }: any) => (
    <div data-testid="screen-domainSelection">
      <button onClick={onBack}>Volver desde DomainSelection</button>
      <button onClick={onWelcome}>Welcome desde DomainSelection</button>
      <button onClick={() => onSelectDomain("veterinaria")}>
        Seleccionar Dominio
      </button>
      <button onClick={onCreateExam}>CreateExam desde DomainSelection</button>
      <button onClick={onCreateExamByParts}>
        ByParts desde DomainSelection
      </button>
    </div>
  )
}))

vi.mock("../screens/examStatementGeneration/ContextWorkflowScreen", () => ({
  default: ({
    onBack,
    onWelcome,
    onCreateExam,
    onCreateExamByParts,
    onFunctionalExtension,
    onCreateDiagram,
    onComponents,
    domainName
  }: any) => (
    <div data-testid="screen-contextWorkflow">
      <span data-testid="domain-name">{domainName}</span>
      <button onClick={onBack}>Volver desde ContextWorkflow</button>
      <button onClick={onWelcome}>Welcome desde ContextWorkflow</button>
      <button onClick={onCreateExam}>CreateExam desde ContextWorkflow</button>
      <button onClick={onCreateExamByParts}>
        ByParts desde ContextWorkflow
      </button>
      <button onClick={onFunctionalExtension}>
        Extensión desde ContextWorkflow
      </button>
      <button onClick={() => onCreateDiagram("contexto generado")}>
        Crear Diagrama
      </button>
      <button onClick={onComponents}>Componentes desde ContextWorkflow</button>
    </div>
  )
}))

vi.mock("../screens/examStatementGeneration/DiagramaUMLWorkflowScreen", () => ({
  default: ({
    onBack,
    onWelcome,
    onCreateExam,
    onCreateExamByParts,
    onFunctionalExtension,
    onStatementStep1,
    onFinishExtension,
    onComponents,
    domainName,
    context
  }: any) => (
    <div data-testid="screen-diagramUML">
      <span data-testid="diagram-domain">{domainName}</span>
      <span data-testid="diagram-context">{context}</span>
      <button onClick={onBack}>Volver desde DiagramUML</button>
      <button onClick={onWelcome}>Welcome desde DiagramUML</button>
      <button onClick={onCreateExam}>CreateExam desde DiagramUML</button>
      <button onClick={onCreateExamByParts}>ByParts desde DiagramUML</button>
      <button onClick={onFunctionalExtension}>
        Extensión desde DiagramUML
      </button>
      <button onClick={onStatementStep1}>Step1 desde DiagramUML</button>
      <button
        onClick={() =>
          onFinishExtension("enunciado final", "diagrama mermaid")
        }>
        Finalizar Extensión
      </button>
      <button onClick={onComponents}>Componentes desde DiagramUML</button>
    </div>
  )
}))

vi.mock(
  "../screens/examStatementGeneration/FinishFunctionalExtensionScreen",
  () => ({
    default: ({
      onBack,
      onWelcome,
      onCreateExam,
      onCreateExamByParts,
      onFunctionalExtension,
      onStatementStep1,
      onComponents,
      domainName,
      extensionStatement,
      extensionMermaid
    }: any) => (
      <div data-testid="screen-finishFunctionalExtension">
        <span data-testid="finish-domain">{domainName}</span>
        <span data-testid="finish-statement">{extensionStatement}</span>
        <span data-testid="finish-mermaid">{extensionMermaid}</span>
        <button onClick={onBack}>Volver desde FinishExtension</button>
        <button onClick={onWelcome}>Welcome desde FinishExtension</button>
        <button onClick={onCreateExam}>CreateExam desde FinishExtension</button>
        <button onClick={onCreateExamByParts}>
          ByParts desde FinishExtension
        </button>
        <button onClick={onFunctionalExtension}>
          Extensión desde FinishExtension
        </button>
        <button onClick={onStatementStep1}>Step1 desde FinishExtension</button>
        <button onClick={onComponents}>
          Componentes desde FinishExtension
        </button>
      </div>
    )
  })
)

vi.mock("../screens/storage/StorageExamsIndex", () => ({
  default: ({ onWelcome }: any) => (
    <div data-testid="screen-storage">
      <button onClick={onWelcome}>Welcome desde Storage</button>
    </div>
  )
}))

vi.mock(
  "~src/screens/examStatementGeneration/AttributesConstraintsWorkflowScreen",
  () => ({
    default: ({
      onBack,
      onWelcome,
      onCreateExam,
      onCreateExamByParts,
      onGoToBaseClass,
      onCreateTest
    }: any) => (
      <div data-testid="screen-attributesConstraints">
        <button onClick={onBack}>Volver desde Attributes</button>
        <button onClick={onWelcome}>Welcome desde Attributes</button>
        <button onClick={onCreateExam}>CreateExam desde Attributes</button>
        <button onClick={onCreateExamByParts}>ByParts desde Attributes</button>
        <button
          onClick={() =>
            onGoToBaseClass({ id: "p1", attributeConstraints: "constraints" })
          }>
          Ir a Clases Base desde Attributes
        </button>
        <button
          onClick={() =>
            onCreateTest({
              project: { id: "p1" },
              constraints: "constraints",
              entityRelationships: "relations",
              baseClass: "class A {}"
            })
          }>
          Crear Test desde Attributes
        </button>
      </div>
    )
  })
)

vi.mock(
  "~src/screens/examStatementGeneration/EntityRelationshipsWorkflowScreen",
  () => ({
    default: ({
      onBack,
      onWelcome,
      onCreateExam,
      onCreateExamByParts,
      onGoToBaseClass,
      onCreateTest
    }: any) => (
      <div data-testid="screen-entityRelationships">
        <button onClick={onBack}>Volver desde Relationships</button>
        <button onClick={onWelcome}>Welcome desde Relationships</button>
        <button onClick={onCreateExam}>CreateExam desde Relationships</button>
        <button onClick={onCreateExamByParts}>
          ByParts desde Relationships
        </button>
        <button
          onClick={() =>
            onGoToBaseClass({ id: "p2", entityRelationships: "relations" })
          }>
          Ir a Clases Base desde Relationships
        </button>
        <button
          onClick={() =>
            onCreateTest({
              project: { id: "p2" },
              constraints: "",
              entityRelationships: "relations",
              baseClass: "class B {}",
              targetPart: "test2_relationships"
            })
          }>
          Crear Test desde Relationships
        </button>
      </div>
    )
  })
)

vi.mock("../screens/codeGeneration/GenerationTestsScreen", () => ({
  default: ({
    onBack,
    onWelcome,
    onCreateExam,
    onCreateExamByParts,
    onCodeGeneration,
    onComponents,
    initialData,
    source
  }: any) => (
    <div data-testid="screen-testAttributes">
      <span data-testid="test-source">{source}</span>
      <span data-testid="test-initial-data">{JSON.stringify(initialData)}</span>
      <button onClick={onBack}>Volver desde TestAttributes</button>
      <button onClick={onWelcome}>Welcome desde TestAttributes</button>
      <button onClick={onCreateExam}>CreateExam desde TestAttributes</button>
      <button onClick={onCreateExamByParts}>
        ByParts desde TestAttributes
      </button>
      <button onClick={onCodeGeneration}>CodeGen desde TestAttributes</button>
      <button onClick={onComponents}>Componentes desde TestAttributes</button>
    </div>
  )
}))

vi.mock("../screens/codeGeneration/SelectionGenerationTestScreen", () => ({
  default: ({
    onBack,
    onWelcome,
    onCreateExam,
    onCreateExamByParts,
    onCreateTest1,
    onCodeGeneration
  }: any) => (
    <div data-testid="screen-testGeneral">
      <button onClick={onBack}>Volver desde TestGeneral</button>
      <button onClick={onWelcome}>Welcome desde TestGeneral</button>
      <button onClick={onCreateExam}>CreateExam desde TestGeneral</button>
      <button onClick={onCreateExamByParts}>ByParts desde TestGeneral</button>
      <button
        onClick={() =>
          onCreateTest1({
            project: { id: "g1" },
            constraints: "c",
            entityRelationships: "r",
            baseClass: "class G {}",
            targetType: "attributes"
          })
        }>
        Crear Test1 desde TestGeneral
      </button>
      <button onClick={onCodeGeneration}>CodeGen desde TestGeneral</button>
    </div>
  )
}))

describe("IndexTab", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Renderizado inicial", () => {
    it("muestra la pantalla de bienvenida al montar", () => {
      render(<IndexTab />)
      expect(screen.getByTestId("screen-welcome")).toBeInTheDocument()
    })

    it("no muestra ninguna otra pantalla al montar", () => {
      render(<IndexTab />)
      expect(screen.queryByTestId("screen-github")).not.toBeInTheDocument()
      expect(screen.queryByTestId("screen-createExam")).not.toBeInTheDocument()
      expect(screen.queryByTestId("screen-storage")).not.toBeInTheDocument()
    })
  })

  describe("Navegación desde WelcomeScreen", () => {
    it("navega a GitHub al pulsar 'Ir a GitHub'", async () => {
      render(<IndexTab />)
      await userEvent.click(screen.getByRole("button", { name: "Ir a GitHub" }))
      expect(screen.getByTestId("screen-github")).toBeInTheDocument()
      expect(screen.queryByTestId("screen-welcome")).not.toBeInTheDocument()
    })

    it("navega a CreateExam al pulsar 'Crear Examen'", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      expect(screen.getByTestId("screen-createExam")).toBeInTheDocument()
    })

    it("navega a Storage al pulsar 'Ver Storage'", async () => {
      render(<IndexTab />)
      await userEvent.click(screen.getByRole("button", { name: "Ver Storage" }))
      expect(screen.getByTestId("screen-storage")).toBeInTheDocument()
    })
  })

  describe("Navegación hacia atrás (botones Volver)", () => {
    it("vuelve a Welcome desde GitHub", async () => {
      render(<IndexTab />)
      await userEvent.click(screen.getByRole("button", { name: "Ir a GitHub" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Volver desde GitHub" })
      )
      expect(screen.getByTestId("screen-welcome")).toBeInTheDocument()
    })

    it("vuelve a Welcome desde CreateExam", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Volver desde CreateExam" })
      )
      expect(screen.getByTestId("screen-welcome")).toBeInTheDocument()
    })

    it("vuelve a CreateExam desde CreateExamByParts", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Volver desde ByParts" })
      )
      expect(screen.getByTestId("screen-createExam")).toBeInTheDocument()
    })

    it("vuelve a Welcome desde Storage", async () => {
      render(<IndexTab />)
      await userEvent.click(screen.getByRole("button", { name: "Ver Storage" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Welcome desde Storage" })
      )
      expect(screen.getByTestId("screen-welcome")).toBeInTheDocument()
    })

    it("vuelve a CreateExamByParts desde StatementPartSelection", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(screen.getByRole("button", { name: "Componentes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Volver desde StatementPart" })
      )
      expect(screen.getByTestId("screen-createExamByParts")).toBeInTheDocument()
    })

    it("vuelve a CodeGeneration desde GenerationSolutionCode", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Código desde ByParts" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Solución" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Volver desde SolutionCode" })
      )
      expect(screen.getByTestId("screen-codeGeneration")).toBeInTheDocument()
    })
  })

  describe("Flujo completo: creación por partes y generación de código", () => {
    it("navega Welcome → CreateExam → ByParts → CodeGeneration", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Código desde ByParts" })
      )
      expect(screen.getByTestId("screen-codeGeneration")).toBeInTheDocument()
    })

    it("navega CodeGeneration → GenerateBaseClasses con initialProject nulo y fromAttributes false", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Código desde ByParts" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Clases Base" })
      )

      expect(
        screen.getByTestId("screen-generateBaseClasses")
      ).toBeInTheDocument()
      expect(screen.getByTestId("initial-project")).toHaveTextContent("null")
      expect(screen.getByTestId("from-attributes")).toHaveTextContent("false")
    })

    it("navega CodeGeneration → TestGeneral al pulsar Generar Test", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Código desde ByParts" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Test" })
      )
      expect(screen.getByTestId("screen-testGeneral")).toBeInTheDocument()
    })
  })

  describe("Flujo: Atributos → Clases Base → Tests", () => {
    async function llegarAAttributeConstraints() {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(screen.getByRole("button", { name: "Componentes" }))
      await userEvent.click(screen.getByRole("button", { name: "Atributos" }))
    }

    it("llega a AttributesConstraints desde StatementPartSelection", async () => {
      await llegarAAttributeConstraints()
      expect(
        screen.getByTestId("screen-attributesConstraints")
      ).toBeInTheDocument()
    })

    it("navega a GenerateBaseClasses desde Attributes con fromAttributes=true y el proyecto correcto", async () => {
      await llegarAAttributeConstraints()
      await userEvent.click(
        screen.getByRole("button", {
          name: "Ir a Clases Base desde Attributes"
        })
      )
      expect(
        screen.getByTestId("screen-generateBaseClasses")
      ).toBeInTheDocument()
      expect(screen.getByTestId("from-attributes")).toHaveTextContent("true")
      expect(screen.getByTestId("initial-project")).toHaveTextContent("p1")
    })

    it("desde GenerateBaseClasses (via Attributes) el botón Volver regresa a attributesConstraints", async () => {
      await llegarAAttributeConstraints()
      await userEvent.click(
        screen.getByRole("button", {
          name: "Ir a Clases Base desde Attributes"
        })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Volver desde BaseClasses" })
      )
      expect(
        screen.getByTestId("screen-attributesConstraints")
      ).toBeInTheDocument()
    })

    it("onGoToTests desde BaseClasses (via Attributes) lleva a testAttributes con source 'attributes'", async () => {
      await llegarAAttributeConstraints()
      await userEvent.click(
        screen.getByRole("button", {
          name: "Ir a Clases Base desde Attributes"
        })
      )
      await userEvent.click(screen.getByRole("button", { name: "Ir a Tests" }))
      expect(screen.getByTestId("screen-testAttributes")).toBeInTheDocument()
      expect(screen.getByTestId("test-source")).toHaveTextContent("attributes")
      expect(screen.getByTestId("test-initial-data")).toHaveTextContent(
        "constraints"
      )
    })

    it("onCreateTest desde Attributes lleva a testAttributes con source 'attributes'", async () => {
      await llegarAAttributeConstraints()
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Test desde Attributes" })
      )
      expect(screen.getByTestId("screen-testAttributes")).toBeInTheDocument()
      expect(screen.getByTestId("test-source")).toHaveTextContent("attributes")
    })

    it("Volver desde testAttributes (origen attributes) regresa a attributesConstraints", async () => {
      await llegarAAttributeConstraints()
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Test desde Attributes" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Volver desde TestAttributes" })
      )
      expect(
        screen.getByTestId("screen-attributesConstraints")
      ).toBeInTheDocument()
    })
  })

  describe("Flujo: Relaciones entre Entidades → Clases Base → Tests", () => {
    async function llegarAEntityRelationships() {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(screen.getByRole("button", { name: "Componentes" }))
      await userEvent.click(screen.getByRole("button", { name: "Relaciones" }))
    }

    it("llega a EntityRelationships desde StatementPartSelection", async () => {
      await llegarAEntityRelationships()
      expect(
        screen.getByTestId("screen-entityRelationships")
      ).toBeInTheDocument()
    })

    it("navega a GenerateBaseClasses desde Relationships con fromAttributes=true", async () => {
      await llegarAEntityRelationships()
      await userEvent.click(
        screen.getByRole("button", {
          name: "Ir a Clases Base desde Relationships"
        })
      )
      expect(
        screen.getByTestId("screen-generateBaseClasses")
      ).toBeInTheDocument()
      expect(screen.getByTestId("from-attributes")).toHaveTextContent("true")
    })

    it("desde GenerateBaseClasses (via Relationships) el botón Volver regresa a entityRelationships", async () => {
      await llegarAEntityRelationships()
      await userEvent.click(
        screen.getByRole("button", {
          name: "Ir a Clases Base desde Relationships"
        })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Volver desde BaseClasses" })
      )
      expect(
        screen.getByTestId("screen-entityRelationships")
      ).toBeInTheDocument()
    })

    it("onGoToTests desde BaseClasses (via Relationships) lleva a testAttributes con source 'entityRelationships'", async () => {
      await llegarAEntityRelationships()
      await userEvent.click(
        screen.getByRole("button", {
          name: "Ir a Clases Base desde Relationships"
        })
      )
      await userEvent.click(screen.getByRole("button", { name: "Ir a Tests" }))
      expect(screen.getByTestId("screen-testAttributes")).toBeInTheDocument()
      expect(screen.getByTestId("test-source")).toHaveTextContent(
        "entityRelationships"
      )
    })

    it("onCreateTest desde Relationships con targetPart='test2_relationships' → source 'entityRelationships'", async () => {
      await llegarAEntityRelationships()
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Test desde Relationships" })
      )
      expect(screen.getByTestId("screen-testAttributes")).toBeInTheDocument()
      expect(screen.getByTestId("test-source")).toHaveTextContent(
        "entityRelationships"
      )
    })

    it("Volver desde testAttributes (origen entityRelationships) regresa a entityRelationships", async () => {
      await llegarAEntityRelationships()
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Test desde Relationships" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Volver desde TestAttributes" })
      )
      expect(
        screen.getByTestId("screen-entityRelationships")
      ).toBeInTheDocument()
    })
  })

  describe("Flujo: TestGeneral → TestAttributes", () => {
    async function llegarATestGeneral() {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Código desde ByParts" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Test" })
      )
    }

    it("llega a TestGeneral desde CodeGeneration", async () => {
      await llegarATestGeneral()
      expect(screen.getByTestId("screen-testGeneral")).toBeInTheDocument()
    })

    it("onCreateTest1 desde TestGeneral lleva a testAttributes con source 'general'", async () => {
      await llegarATestGeneral()
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Test1 desde TestGeneral" })
      )
      expect(screen.getByTestId("screen-testAttributes")).toBeInTheDocument()
      expect(screen.getByTestId("test-source")).toHaveTextContent("general")
    })

    it("Volver desde testAttributes (origen general) regresa a testGeneral", async () => {
      await llegarATestGeneral()
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Test1 desde TestGeneral" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Volver desde TestAttributes" })
      )
      expect(screen.getByTestId("screen-testGeneral")).toBeInTheDocument()
    })

    it("los datos de sharedTestData se pasan correctamente a testAttributes", async () => {
      await llegarATestGeneral()
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Test1 desde TestGeneral" })
      )
      const initialData = screen.getByTestId("test-initial-data").textContent
      const parsed = JSON.parse(initialData!)
      expect(parsed.constraints).toBe("c")
      expect(parsed.entityRelationships).toBe("r")
      expect(parsed.baseClass).toBe("class G {}")
    })
  })

  describe("Flujo: Extensión Funcional completo", () => {
    async function llegarADomainSelection() {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(screen.getByRole("button", { name: "Componentes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Extensión Funcional" })
      )
    }

    it("llega a DomainSelection desde StatementPartSelection", async () => {
      await llegarADomainSelection()
      expect(screen.getByTestId("screen-domainSelection")).toBeInTheDocument()
    })

    it("seleccionar dominio navega a ContextWorkflow con el domainName correcto", async () => {
      await llegarADomainSelection()
      await userEvent.click(
        screen.getByRole("button", { name: "Seleccionar Dominio" })
      )
      expect(screen.getByTestId("screen-contextWorkflow")).toBeInTheDocument()
      expect(screen.getByTestId("domain-name")).toHaveTextContent("veterinaria")
    })

    it("'Crear Diagrama' desde ContextWorkflow navega a DiagramUML con contexto", async () => {
      await llegarADomainSelection()
      await userEvent.click(
        screen.getByRole("button", { name: "Seleccionar Dominio" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Diagrama" })
      )
      expect(screen.getByTestId("screen-diagramUML")).toBeInTheDocument()
      expect(screen.getByTestId("diagram-context")).toHaveTextContent(
        "contexto generado"
      )
      expect(screen.getByTestId("diagram-domain")).toHaveTextContent(
        "veterinaria"
      )
    })

    it("'Finalizar Extensión' desde DiagramUML navega a FinishFunctionalExtension con datos correctos", async () => {
      await llegarADomainSelection()
      await userEvent.click(
        screen.getByRole("button", { name: "Seleccionar Dominio" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Diagrama" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Finalizar Extensión" })
      )
      expect(
        screen.getByTestId("screen-finishFunctionalExtension")
      ).toBeInTheDocument()
      expect(screen.getByTestId("finish-domain")).toHaveTextContent(
        "veterinaria"
      )
      expect(screen.getByTestId("finish-statement")).toHaveTextContent(
        "enunciado final"
      )
      expect(screen.getByTestId("finish-mermaid")).toHaveTextContent(
        "diagrama mermaid"
      )
    })

    it("vuelve a DiagramUML desde FinishFunctionalExtension", async () => {
      await llegarADomainSelection()
      await userEvent.click(
        screen.getByRole("button", { name: "Seleccionar Dominio" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Diagrama" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Finalizar Extensión" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Volver desde FinishExtension" })
      )
      expect(screen.getByTestId("screen-diagramUML")).toBeInTheDocument()
    })

    it("'Extensión desde DiagramUML' navega a DomainSelection", async () => {
      await llegarADomainSelection()
      await userEvent.click(
        screen.getByRole("button", { name: "Seleccionar Dominio" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Diagrama" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Extensión desde DiagramUML" })
      )
      expect(screen.getByTestId("screen-domainSelection")).toBeInTheDocument()
    })

    it("'Step1 desde DiagramUML' regresa a ContextWorkflow", async () => {
      await llegarADomainSelection()
      await userEvent.click(
        screen.getByRole("button", { name: "Seleccionar Dominio" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Diagrama" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Step1 desde DiagramUML" })
      )
      expect(screen.getByTestId("screen-contextWorkflow")).toBeInTheDocument()
    })
  })

  describe("Atajos de navegación global", () => {
    it("Welcome desde cualquier pantalla profunda lleva a welcome", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(screen.getByRole("button", { name: "Componentes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Welcome desde StatementPart" })
      )
      expect(screen.getByTestId("screen-welcome")).toBeInTheDocument()
    })

    it("CreateExam desde FinishFunctionalExtension lleva a createExam", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(screen.getByRole("button", { name: "Componentes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Extensión Funcional" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Seleccionar Dominio" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Diagrama" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Finalizar Extensión" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "CreateExam desde FinishExtension" })
      )
      expect(screen.getByTestId("screen-createExam")).toBeInTheDocument()
    })

    it("ByParts desde CodeGeneration lleva a createExamByParts", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Código desde ByParts" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "ByParts desde CodeGen" })
      )
      expect(screen.getByTestId("screen-createExamByParts")).toBeInTheDocument()
    })

    it("Welcome desde ByParts lleva a welcome", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Welcome desde ByParts" })
      )
      expect(screen.getByTestId("screen-welcome")).toBeInTheDocument()
    })

    it("CodeGen desde TestAttributes lleva a codeGeneration", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Código desde ByParts" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Test" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Test1 desde TestGeneral" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "CodeGen desde TestAttributes" })
      )
      expect(screen.getByTestId("screen-codeGeneration")).toBeInTheDocument()
    })

    it("Componentes desde ContextWorkflow lleva a statementPartSelection", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(screen.getByRole("button", { name: "Componentes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Extensión Funcional" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Seleccionar Dominio" })
      )
      await userEvent.click(
        screen.getByRole("button", {
          name: "Componentes desde ContextWorkflow"
        })
      )
      expect(
        screen.getByTestId("screen-statementPartSelection")
      ).toBeInTheDocument()
    })
  })

  describe("Casos límite y estados compartidos", () => {
    it("sharedTestData es null al montar (no se pasa initialData undefined a testAttributes antes de navegar)", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Código desde ByParts" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Test" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Test1 desde TestGeneral" })
      )
      const data = screen.getByTestId("test-initial-data").textContent
      expect(JSON.parse(data!)).toMatchObject({ constraints: "c" })
    })

    it("CodeGeneration desde ByParts resetea selectedProject a null", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(screen.getByRole("button", { name: "Componentes" }))
      await userEvent.click(screen.getByRole("button", { name: "Atributos" }))
      await userEvent.click(
        screen.getByRole("button", {
          name: "Ir a Clases Base desde Attributes"
        })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Volver desde BaseClasses" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Volver desde Attributes" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "ByParts desde StatementPart" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Código desde ByParts" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Generar Clases Base" })
      )
      expect(screen.getByTestId("initial-project")).toHaveTextContent("null")
    })

    it("domainName se mantiene al volver de DiagramUML a ContextWorkflow", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(screen.getByRole("button", { name: "Componentes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Extensión Funcional" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Seleccionar Dominio" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Diagrama" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Volver desde DiagramUML" })
      )
      expect(screen.getByTestId("domain-name")).toHaveTextContent("veterinaria")
    })

    it("extensionStatement y extensionMermaid se mantienen al volver de FinishExtension a DiagramUML", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(screen.getByRole("button", { name: "Componentes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Extensión Funcional" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Seleccionar Dominio" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Diagrama" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Finalizar Extensión" })
      )
      expect(screen.getByTestId("finish-statement")).toHaveTextContent(
        "enunciado final"
      )
      expect(screen.getByTestId("finish-mermaid")).toHaveTextContent(
        "diagrama mermaid"
      )
    })

    it("volver a DomainSelection desde ContextWorkflow resetea flujo de extensión", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))
      await userEvent.click(screen.getByRole("button", { name: "Componentes" }))
      await userEvent.click(
        screen.getByRole("button", { name: "Extensión Funcional" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Seleccionar Dominio" })
      )
      await userEvent.click(
        screen.getByRole("button", { name: "Volver desde ContextWorkflow" })
      )
      expect(screen.getByTestId("screen-domainSelection")).toBeInTheDocument()
    })

    it("solo se muestra una pantalla a la vez en cualquier punto de la navegación", async () => {
      render(<IndexTab />)
      await userEvent.click(
        screen.getByRole("button", { name: "Crear Examen" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Por Partes" }))

      const screenIds = [
        "screen-welcome",
        "screen-github",
        "screen-createExam",
        "screen-createExamByParts",
        "screen-statementPartSelection",
        "screen-codeGeneration",
        "screen-generateBaseClasses",
        "screen-testAttributes",
        "screen-testGeneral",
        "screen-storage",
        "screen-domainSelection",
        "screen-contextWorkflow",
        "screen-diagramUML",
        "screen-finishFunctionalExtension",
        "screen-attributesConstraints",
        "screen-entityRelationships"
      ]
      const visibles = screenIds.filter((id) => screen.queryByTestId(id))
      expect(visibles).toHaveLength(1)
      expect(visibles[0]).toBe("screen-createExamByParts")
    })
  })
})
