import { RESOURCE_MAP } from "./resourceMap";

interface ParsedPrompt {
  visibleText: string;
  hiddenContext: string;
}

export const parseMasterPrompt = (fullText: string): ParsedPrompt => {
  const SPLIT_KEY = "## Prompt a utilizar:";

  const parts = fullText.split(SPLIT_KEY);

  if (parts.length < 2) {
    return { visibleText: fullText, hiddenContext: "" };
  }

  const headerPart = parts[0];
  const bodyPart = parts[1].trim();

  const resourceMatch = headerPart.match(/[\*\-]\s*[`'"]?([^`'"\n\r]+)[`'"]?/);

  let hiddenContext = "";

  if (resourceMatch && resourceMatch[1]) {
    const filename = resourceMatch[1].trim();
    
    if (RESOURCE_MAP[filename]) {
        hiddenContext = RESOURCE_MAP[filename];
        console.log(`Recurso cargado correctamente: ${filename}`);
    } else {
        console.warn(`Recurso detectado ('${filename}') pero NO coincide con ninguna clave en resourceMap.`);
        console.log("Claves disponibles:", Object.keys(RESOURCE_MAP));
    }
  }

  return {
    visibleText: bodyPart,
    hiddenContext: hiddenContext
  };
};