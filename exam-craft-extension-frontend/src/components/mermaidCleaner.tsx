export function cleanMermaidCode(rawText: string): string {
    if (!rawText) return "";

    let cleanResult = rawText
        .replaceAll(/```mermaid/g, "")
        .replaceAll(/```/g, "");

    const diagramMatch = cleanResult.match(
        /(classDiagram|graph|sequenceDiagram|erDiagram|stateDiagram|kanban)[\s\S]*/
    );

    cleanResult = diagramMatch ? diagramMatch[0].trim() : cleanResult.trim();

    cleanResult = cleanResult
        .replaceAll('\\n', '\n')
        .replaceAll('\\"', '"')
        .replaceAll("\\'", "'");

    cleanResult = cleanResult
        .replace(/{\s*}/g, '')
        .replace(/{/g, ' {\n')
        .replace(/}/g, '\n}\n')
        .replace(/<\|--/g, ' <|-- ')
        .replace(/%%/g, '\n%%');

    // Normaliza composición/agregación con espacio suelto: "* -->" -> "*-->"
    cleanResult = cleanResult
        .replace(/\*\s+-->/g, '*-->')
        .replace(/o\s+-->/g, 'o-->');

    // Normaliza "-->" con espacios extra
    cleanResult = cleanResult.replace(/\s*-->\s*/g, ' --> ');

    // Elimina multiplicidad vacía ""
    cleanResult = cleanResult.replace(/\s*""\s*/g, ' ');

    // Procesa línea a línea para evitar que dos relaciones colisionen
    cleanResult = cleanResult
        .split('\n')
        .map(line => {
            const trimmed = line.trim();

            // Relación con label: ClassA "mult" ClassB : label → ClassA --> "mult" ClassB : label
            const withLabel = trimmed.match(
                /^([A-Za-z0-9_]+)\s+"([^"]+)"\s+([A-Za-z0-9_]+)\s*:\s*(.+)$/
            );
            if (withLabel && !trimmed.includes('-->') && !trimmed.includes('--') && !trimmed.includes('<|')) {
                return `${withLabel[1]} --> "${withLabel[2]}" ${withLabel[3]} : ${withLabel[4]}`;
            }

            // Relación sin flecha ni label: ClassA "mult" ClassB → ClassA --> "mult" ClassB
            const noArrow = trimmed.match(
                /^([A-Za-z0-9_]+)\s+"([^"]+)"\s+([A-Za-z0-9_]+)\s*$/
            );
            if (noArrow && !trimmed.includes('-->') && !trimmed.includes('--') && !trimmed.includes('<|')) {
                return `${noArrow[1]} --> "${noArrow[2]}" ${noArrow[3]}`;
            }

            return trimmed;
        })
        .filter(line => line.length > 0)
        .join('\n');

    return cleanResult;
}