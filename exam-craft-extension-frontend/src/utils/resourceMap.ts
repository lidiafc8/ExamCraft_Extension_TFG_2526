
import extensionExamples from "bundle-text:../prompts/resources/functional_extension_examples.md"
import constraintsExamples from "bundle-text:../prompts/resources/attribute_constraints_examples_previous_exams.md"
import relationshipsExamples from "bundle-text:../prompts/resources/relationships_between_entities_examples_previous_exams.md"
import baseClassesExamples from "bundle-text:../prompts/resources/base_classes_structure_examples.md"

export const RESOURCE_MAP: Record<string, string> = {
  "functional_extension_examples.md": extensionExamples,
  "attribute_constraints_examples_previous_exams.md": constraintsExamples,
  "relationships_between_entities_examples_previous_exams.md": relationshipsExamples,
  "base_classes_structure_examples.md": baseClassesExamples
};