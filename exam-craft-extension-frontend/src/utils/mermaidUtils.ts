const HTML_TAGS_REGEX = /<[^>]*>?/gm
const NBSP_REGEX = /&nbsp;/g
const SEPARATOR_REGEX = /-{5,}|={5,}/
const MERMAID_TYPE_REGEX = /classDiagram|graph/i
const MERMAID_CONTENT_REGEX = /(classDiagram|graph)[\s\S]*/i

const BR_TAG_REGEX = /<br\s*\/?>/gi
const P_TAG_REGEX = /<\/?p[^>]*>/gi
const DIV_TAG_REGEX = /<\/?div[^>]*>/gi
const SPAN_TAG_REGEX = /<\/?span[^>]*>/gi

export const cleanMermaidCode = (code: string) => {
  if (!code) {
    return ""
  }
  return code.replaceAll(HTML_TAGS_REGEX, "").replaceAll(NBSP_REGEX, " ").trim()
}
export const extractMermaidCode = (fullText: string) => {
  if (!fullText) {
    return ""
  }

  const parts = fullText.split(SEPARATOR_REGEX)
  const diagramPart =
    parts.find(
      (p) =>
        p.toLowerCase().includes("classdiagram") ||
        p.toLowerCase().includes("graph")
    ) || ""

  const match = MERMAID_TYPE_REGEX.exec(diagramPart)

  return match && typeof match.index === "number"
    ? diagramPart.slice(match.index).trim()
    : diagramPart.trim()
}

export const sanitizeMermaidForModal = (code: string) => {
  if (!code) {
    return ""
  }

  const match = MERMAID_CONTENT_REGEX.exec(code)
  if (!match) {
    return ""
  }

  let clean = match[0]

  clean = clean
    .replaceAll(BR_TAG_REGEX, "\n")
    .replaceAll(P_TAG_REGEX, "\n")
    .replaceAll(DIV_TAG_REGEX, "\n")
    .replaceAll(SPAN_TAG_REGEX, "")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")

  return clean.trim()
}
