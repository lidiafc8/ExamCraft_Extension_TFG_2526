import React from "react";
import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';

hljs.registerLanguage('java', java);

interface JavaCodeBlockProps {
    filename: string;
    code: string;
}

export const JavaCodeBlock: React.FC<JavaCodeBlockProps> = ({ filename, code }) => {
    const highlighted = hljs.highlight(code, { language: 'java' }).value;
    
    return (
        <div style={{ 
            minWidth: 0, 
            width: '100%', 
            boxSizing: 'border-box' 
        }}>
            <h4 style={{ marginBottom: '8px', color: '#555', fontFamily: 'monospace', fontSize: '1rem', fontWeight: 600, wordBreak: 'break-word' }}>
                {filename}
            </h4>
            <pre style={{ 
                margin: 0, 
                borderRadius: '8px', 
                overflowX: 'auto', 
                fontSize: '13px', 
                maxHeight: '500px', 
                backgroundColor: '#f6f8fa', 
                padding: '20px', 
                border: '1px solid #e1e4e8',
                width: '100%', 
                boxSizing: 'border-box'
            }}>
                <code className="hljs language-java" dangerouslySetInnerHTML={{ __html: highlighted }} />
            </pre>
        </div>
    );
};