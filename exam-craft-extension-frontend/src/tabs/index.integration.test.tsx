import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom"
import IndexTab from "./index" // Ajusta la ruta según tu estructura

// =========================================================================
// MOCKS DE TODAS LAS PANTALLAS SUBORDINADAS
// =========================================================================
vi.mock("../screens/principal/WelcomeScreen", () => ({
  default: ({ onStart, onCreateExam, onStorage }: any) => (
    <div data-testid="screen-welcome">
      <button onClick={onStart}>Ir a Github</button>
      <button onClick={onCreateExam}>Ir a Crear Examen</button>
      <button onClick={onStorage}>Ir a Almacén</button>
    </div>
  )
}))

vi.mock("../screens/principal/GithubScreen", () => ({
  default: ({ onBack }: any) => (
    <div data-testid="screen-github"><button onClick={onBack}>Volver</button></div>
  )
}))

vi.mock("../screens/chooseCreate/CreateExamSelectionScreen", () => ({
  default: ({ onCreateExamByParts, onBack }: any) => (
    <div data-testid="screen-createExam">
      <button onClick={onCreateExamByParts}>Por partes</button>
      <button onClick={onBack}>Volver</button>
    </div>
  )
}))

vi.mock("../screens/chooseCreate/CreateExamByPartsScreen", () => ({
  default: ({ onComponents, onCodeGeneration }: any) => (
    <div data-testid="screen-createExamByParts">
      <button onClick={onComponents}>Configurar Enunciados</button>
      <button onClick={onCodeGeneration}>Generar Código</button>
    </div>
  )
}))

vi.mock("~src/screens/chooseCreate/StatementPartSelectionScreen", () => ({
  default: ({ onAttributesConstraints, onEntityRelationships }: any) => (
    <div data-testid="screen-statementPartSelection">
      <button onClick={onAttributesConstraints}>Ir a Atributos</button>
      <button onClick={onEntityRelationships}>Ir a Relaciones</button>
    </div>
  )
}))

vi.mock("~src/screens/codeGeneration/CodeSelectionGenerateScreen", () => ({
  default: ({ onGenerateTest }: any) => (
    <div data-testid="screen-codeGeneration">
      <button onClick={onGenerateTest}>Tests Generales</button>
    </div>
  )
}))

vi.mock("../screens/codeGeneration/SelectionGenerationTestScreen", () => ({
  default: ({ onCreateTest1 }: any) => (
    <div data-testid="screen-testGeneral">
      <button onClick={() => onCreateTest1({ project: {}, constraints: "" })}>Crear Test General</button>
    </div>
  )
}))

vi.mock("~src/screens/examStatementGeneration/AttributesConstraintsWorkflowScreen", () => ({
  default: ({ onCreateTest, onGoToBaseClass }: any) => (
    <div data-testid="screen-attributesConstraints">
      <button onClick={() => onCreateTest({ targetPart: "test1_attributes" })}>Crear Test Atributos</button>
      <button onClick={() => onGoToBaseClass({ id: "1" })}>Clases Base</button>
    </div>
  )
}))

vi.mock("~src/screens/examStatementGeneration/EntityRelationshipsWorkflowScreen", () => ({
  default: ({ onCreateTest, onGoToBaseClass }: any) => (
    <div data-testid="screen-entityRelationships">
      <button onClick={() => onCreateTest({ targetPart: "test2_relationships" })}>Crear Test Relaciones</button>
      <button onClick={() => onGoToBaseClass({ id: "1" })}>Clases Base desde Relaciones</button>
    </div>
  )
}))

vi.mock("../screens/codeGeneration/GenerationTestsScreen", () => ({
  default: ({ onBack }: any) => (
    <div data-testid="screen-testAttributes">
      <button onClick={onBack}>Volver Atrás</button>
    </div>
  )
}))

vi.mock("~src/screens/codeGeneration/GenerationBaseClassesScreen", () => ({
  default: ({ onBack }: any) => (
    <div data-testid="screen-generateBaseClasses">
      <button onClick={onBack}>Volver Base Classes</button>
    </div>
  )
}))

vi.mock("../screens/storage/StorageExamsIndex", () => ({
  default: () => <div data-testid="screen-storage">Almacén Index</div>
}))

// =========================================================================
// SUITE DE PRUEBAS DE INTEGRACIÓN
// =========================================================================
describe("IndexTab Router & Workflow Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // -------------------------------------------------------------------------
  // 1. RENDERIZADO INICIAL Y NAVEGACIÓN BÁSICA
  // -------------------------------------------------------------------------
  it("debería iniciar por defecto en la pantalla de bienvenida y permitir navegar a GitHub", () => {
    render(<IndexTab />)
    
    expect(screen.getByTestId("screen-welcome")).toBeInTheDocument()

    // Avanzar a la pantalla de GitHub
    fireEvent.click(screen.getByRole("button", { name: "Ir a Github" }))
    expect(screen.getByTestId("screen-github")).toBeInTheDocument()

    // Retroceder a Bienvenida
    fireEvent.click(screen.getByRole("button", { name: "Volver" }))
    expect(screen.getByTestId("screen-welcome")).toBeInTheDocument()
  })

  it("debería navegar correctamente al Storage (Almacén)", () => {
    render(<IndexTab />)
    fireEvent.click(screen.getByRole("button", { name: "Ir a Almacén" }))
    expect(screen.getByTestId("screen-storage")).toBeInTheDocument()
  })

  // -------------------------------------------------------------------------
  // 2. VALIDACIÓN DEL FLUJO COMPLEJO DE RETORNO DE TESTS (handleGoBackFromTests)
  // -------------------------------------------------------------------------
  it("debería recordar el origen 'attributes' y regresar allí al pulsar volver en los tests", () => {
    render(<IndexTab />)
    
    // Bienvenida -> Crear Examen -> Por Partes -> Configurar Enunciados -> Atributos
    fireEvent.click(screen.getByRole("button", { name: "Ir a Crear Examen" }))
    fireEvent.click(screen.getByRole("button", { name: "Por partes" }))
    fireEvent.click(screen.getByRole("button", { name: "Configurar Enunciados" }))
    fireEvent.click(screen.getByRole("button", { name: "Ir a Atributos" }))
    
    expect(screen.getByTestId("screen-attributesConstraints")).toBeInTheDocument()

    // Disparar la creación de test desde Atributos (Fija testOrigin = "attributes")
    fireEvent.click(screen.getByRole("button", { name: "Crear Test Atributos" }))
    expect(screen.getByTestId("screen-testAttributes")).toBeInTheDocument()

    // Pulsar volver (Ejecuta handleGoBackFromTests y debe redirigir a attributesConstraints)
    fireEvent.click(screen.getByRole("button", { name: "Volver Atrás" }))
    expect(screen.getByTestId("screen-attributesConstraints")).toBeInTheDocument()
  })

  it("debería recordar el origen 'entityRelationships' y regresar allí al pulsar volver en los tests", () => {
    render(<IndexTab />)
    
    // Navegación directa simulada hasta Relaciones
    fireEvent.click(screen.getByRole("button", { name: "Ir a Crear Examen" }))
    fireEvent.click(screen.getByRole("button", { name: "Por partes" }))
    fireEvent.click(screen.getByRole("button", { name: "Configurar Enunciados" }))
    fireEvent.click(screen.getByRole("button", { name: "Ir a Relaciones" }))

    // Disparar creación de test desde Relaciones (Fija testOrigin = "entityRelationships")
    fireEvent.click(screen.getByRole("button", { name: "Crear Test Relaciones" }))
    expect(screen.getByTestId("screen-testAttributes")).toBeInTheDocument()

    // Pulsar volver (Debe redirigir a entityRelationships)
    fireEvent.click(screen.getByRole("button", { name: "Volver Atrás" }))
    expect(screen.getByTestId("screen-entityRelationships")).toBeInTheDocument()
  })

  it("debería retornar a 'testGeneral' si el test se originó desde la pantalla de código general", () => {
    render(<IndexTab />)
    
    // Bienvenida -> Crear Examen -> Por Partes -> Generar Código -> Tests Generales
    fireEvent.click(screen.getByRole("button", { name: "Ir a Crear Examen" }))
    fireEvent.click(screen.getByRole("button", { name: "Por partes" }))
    fireEvent.click(screen.getByRole("button", { name: "Generar Código" }))
    fireEvent.click(screen.getByRole("button", { name: "Tests Generales" }))
    
    // Disparar test (Fija testOrigin = "general")
    fireEvent.click(screen.getByRole("button", { name: "Crear Test General" }))
    expect(screen.getByTestId("screen-testAttributes")).toBeInTheDocument()

    // Pulsar volver (Debe regresar a testGeneral)
    fireEvent.click(screen.getByRole("button", { name: "Volver Atrás" }))
    expect(screen.getByTestId("screen-testGeneral")).toBeInTheDocument()
  })

  // -------------------------------------------------------------------------
  // 3. VALIDACIÓN DE ESTADOS DINÁMICOS DE RETORNO (cameFromAttributes / Relaciones)
  // -------------------------------------------------------------------------
  it("debería volver a Atributos si se entró a Clases Base desde la pantalla de Atributos", () => {
    render(<IndexTab />)
    
    fireEvent.click(screen.getByRole("button", { name: "Ir a Crear Examen" }))
    fireEvent.click(screen.getByRole("button", { name: "Por partes" }))
    fireEvent.click(screen.getByRole("button", { name: "Configurar Enunciados" }))
    fireEvent.click(screen.getByRole("button", { name: "Ir a Atributos" }))
    
    // Entramos a Clases base (fija cameFromAttributes = true)
    fireEvent.click(screen.getByRole("button", { name: "Clases Base" }))
    expect(screen.getByTestId("screen-generateBaseClasses")).toBeInTheDocument()

    // Al pulsar volver en clases base, debe regresar a attributesConstraints gracias a la condicional del hook
    fireEvent.click(screen.getByRole("button", { name: "Volver Base Classes" }))
    expect(screen.getByTestId("screen-attributesConstraints")).toBeInTheDocument()
  })

  it("debería volver a Relaciones si se entró a Clases Base desde la pantalla de Relaciones", () => {
    render(<IndexTab />)
    
    fireEvent.click(screen.getByRole("button", { name: "Ir a Crear Examen" }))
    fireEvent.click(screen.getByRole("button", { name: "Por partes" }))
    fireEvent.click(screen.getByRole("button", { name: "Configurar Enunciados" }))
    fireEvent.click(screen.getByRole("button", { name: "Ir a Relaciones" }))
    
    // Entramos a Clases base (fija cameFromEntityRelationships = true)
    fireEvent.click(screen.getByRole("button", { name: "Clases Base desde Relaciones" }))
    expect(screen.getByTestId("screen-generateBaseClasses")).toBeInTheDocument()

    // Al pulsar volver en clases base, debe regresar a entityRelationships
    fireEvent.click(screen.getByRole("button", { name: "Volver Base Classes" }))
    expect(screen.getByTestId("screen-entityRelationships")).toBeInTheDocument()
  })
})