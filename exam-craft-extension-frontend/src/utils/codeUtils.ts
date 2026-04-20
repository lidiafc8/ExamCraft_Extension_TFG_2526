export const parseJavaFiles = (rawText: string) => {
    if (!rawText) return [];

    const results = [];
    const blockRegex = /```[a-zA-Z]*\r?\n([\s\S]*?)```/gi; // NOSONAR javascript:S5852
    let match;
    let lastIndex = 0;

    while ((match = blockRegex.exec(rawText)) !== null) {
        const blockStart = match.index;
        let rawCode = match[1];
        let path = '';

        const textBefore = rawText.slice(lastIndex, blockStart);
        const pathsBefore = [...textBefore.matchAll(/([a-zA-Z0-9_./\-]+\.java)/g)]; // NOSONAR javascript:S5852
        
        if (pathsBefore.length > 0) {
            path = pathsBefore[pathsBefore.length - 1][1];
        } else {
            const pathInsideMatch = rawCode.match(/^[\s*/]*([a-zA-Z0-9_./\-]+\.java)/); // NOSONAR javascript:S5852
            
            if (pathInsideMatch) {
                path = pathInsideMatch[1];
                const matchedStr = pathInsideMatch[0];
                rawCode = rawCode.substring(matchedStr.length).trim();
            }
        }

        const filename = path ? path.split('/').pop() || 'Archivo.java' : 'Archivo.java';
        
        results.push({ filename, code: rawCode.trim() });
        lastIndex = blockRegex.lastIndex;
    }

    if (results.length === 0 && rawText.trim() !== '') {
        return [{ filename: 'Código Generado (Formato Irregular)', code: rawText }];
    }

    return results;
};