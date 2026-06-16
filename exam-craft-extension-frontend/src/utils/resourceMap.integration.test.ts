import { describe, it, expect, vi } from "vitest"

// =========================================================================
// MOCK DE LOS TEXTOS EMBEBIDOS POR PARCEL (bundle-text)
// =========================================================================
vi.mock("bundle-text:../prompts/resources/functional_extension_examples_previous_exams.md", () => ({
  default: "Contenido de extensiones funcionales"
}))

vi.mock("bundle-text:../prompts/resources/attribute_constraints_examples_previous_exams.md", () => ({
  default: "Contenido de restricciones de atributos"
}))

vi.mock("bundle-text:../prompts/resources/relationships_between_entities_examples_previous_exams.md", () => ({
  default: "Contenido de relaciones entre entidades"
}))

vi.mock("bundle-text:../prompts/resources/base_classes_structure_examples_previous_exams.md", () => ({
  default: "Contenido de estructura de clases base"
}))

// Importamos el mapa después de declarar los mocks para que tome los valores simulados
import { RESOURCE_MAP } from "./resourceMap" // Ajusta la ruta a tu archivo real

describe("RESOURCE_MAP Static Configuration Tests", () => {
  
  it("debería contener exactamente las 4 llaves de archivos Markdown requeridas", () => {
    const keys = Object.keys(RESOURCE_MAP)
    
    expect(keys).toHaveLength(4)
    expect(keys).toEqual(
      expect.arrayContaining([
        "functional_extension_examples_previous_exams.md",
        "attribute_constraints_examples_previous_exams.md",
        "relationships_between_entities_examples_previous_exams.md",
        "base_classes_structure_examples_previous_exams.md"
      ])
    )
  })
})