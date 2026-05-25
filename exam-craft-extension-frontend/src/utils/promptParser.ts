import { RESOURCE_MAP } from "./resourceMap"

interface ParsedPrompt {
  visibleText: string
  hiddenContext: string
}

export const parseMasterPrompt = (fullText: string): ParsedPrompt => {
  const SPLIT_KEY = "## Prompt a utilizar:"
  const parts = fullText.split(SPLIT_KEY)

  if (parts.length < 2) {
    return { visibleText: fullText, hiddenContext: "" }
  }

  const headerPart = parts[0]
  const bodyPart = parts[1].trim()

  const resourceRegex = /[\*\-]\s*[`'"]?([^`'"\n\r]+)[`'"]?/g

  let hiddenContext = ""
  let match

  while ((match = resourceRegex.exec(headerPart)) !== null) {
    const filename = match[1].trim()

    if (RESOURCE_MAP[filename]) {
      hiddenContext += `\n--- ARCHIVO / RECURSO: ${filename} ---\n${RESOURCE_MAP[filename]}\n`
    } else {
      console.log(
        `Recurso dinámico o no encontrado en map: '${filename}'. Se omitirá del context estático.`
      )
    }
  }

  return {
    visibleText: bodyPart,
    hiddenContext: hiddenContext.trim()
  }
}
