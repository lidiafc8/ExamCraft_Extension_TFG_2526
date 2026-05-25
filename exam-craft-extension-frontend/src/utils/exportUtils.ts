import { sanitizeMermaidForModal } from "./mermaidUtils"

const formatCodeSection = (content: string, emptyMessage: string) => {
  if (!content) return emptyMessage
  let trimmed = content.trim()

  const backticks = trimmed.match(/```/g)
  const count = backticks ? backticks.length : 0

  if (count === 0) {
    return `\`\`\`java\n${trimmed}\n\`\`\``
  }

  if (count % 2 !== 0) {
    trimmed += "\n```"
  }

  return trimmed
}

export const downloadProjectAsMarkdown = (project: any, chosenName: string) => {
  if (!project) return

  const title = project.customName
    ? `Examen: ${project.customName}`
    : `Examen de ${project.domainName}`

  const fullText = project.extensionFinish || ""
  const mermaidMatch = fullText.match(/(classDiagram|graph)[\s\S]*/i)
  let introText = fullText
  let finalMermaidCode = ""

  if (mermaidMatch) {
    introText = fullText.substring(0, mermaidMatch.index).trim()
    finalMermaidCode = sanitizeMermaidForModal(fullText)
    finalMermaidCode = finalMermaidCode.replace(/```mermaid|```/g, "").trim()
  }

  const testParts: { fileName: string; code: string }[] = project.testPartsMap
    ? Object.values(
        project.testPartsMap as Record<
          string,
          { fileName: string; code: string }
        >
      )
        .filter((p) => p?.fileName && p?.code)
        .sort((a, b) => a.fileName.localeCompare(b.fileName))
    : []

  const testsMarkdown =
    testParts.length > 0
      ? testParts
          .map((part) => {
            const cleanCode = part.code
              .replace(/```[a-z]*\n?/gi, "")
              .replace(/```/g, "")
              .trim()
            return `### 📄 ${part.fileName}\n\`\`\`java\n${cleanCode}\n\`\`\``
          })
          .join("\n\n")
      : "_No hay tests generados para este examen._"

  const markdownContent = `# ${title}

---

## 1. Extensión Funcional
${introText || "_No hay datos de extensión funcional._"}

${finalMermaidCode ? `### Diagrama de Clases\n\`\`\`mermaid\n${finalMermaidCode}\n\`\`\`` : ""}

---

## 2. Restricciones de Atributos
${project.attributeConstraints ? project.attributeConstraints.trim() : "_No se crearon restricciones de atributos._"}

---

## 3. Relaciones entre Entidades
${project.entityRelationships ? project.entityRelationships.trim() : "_No se crearon relaciones entre entidades._"}

---

## 4. Clases Base
${formatCodeSection(project.baseClasses, "_No se generaron clases base para este examen._")}

---

## 5. Tests de Java (JUnit)
${testsMarkdown}

---

## 6. Clases Solución
${formatCodeSection(project.fullSolution, "_No se generaron clases solución para este examen._")}

---

_Generado automáticamente por ExamCraft_
`.trim()

  let finalFileName = chosenName.trim() || "examen"
  if (!finalFileName.toLowerCase().endsWith(".md")) {
    finalFileName += ".md"
  }

  const blob = new Blob([markdownContent], {
    type: "text/markdown;charset=utf-8"
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = finalFileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
