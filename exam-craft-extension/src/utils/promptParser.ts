import { RESOURCE_MAP } from "./resourceMap";

interface ParsedPrompt {
  visibleText: string;   
  hiddenContext: string;
}

export const parseMasterPrompt = (fullText: string): ParsedPrompt => {
  const SPLIT_KEY = "## Prompt a utilizar:";
  const RESOURCE_KEY = "## Recursos a proporcionar:";

  const parts = fullText.split(SPLIT_KEY);

  if (parts.length < 2) {
    return { visibleText: fullText, hiddenContext: "" };
  }

  const headerPart = parts[0]; 
  const bodyPart = parts[1].trim();

  const resourceMatch = headerPart.match(/^\s*-\s*(.*examples.*)$/im);
  
  let hiddenContext = "";

  if (resourceMatch && resourceMatch[1]) {
    const filename = resourceMatch[1].trim();
    
    if (RESOURCE_MAP[filename]) {
        hiddenContext = RESOURCE_MAP[filename];
        console.log(`Recurso cargado: ${filename}`);
    } else {
        console.warn(`Recurso NO encontrado en resourceMap: ${filename}`);
    }
  }

  return {
    visibleText: bodyPart,
    hiddenContext: hiddenContext
  };
};