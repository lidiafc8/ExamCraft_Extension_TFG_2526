import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import './MermaidDiagram.css'; 

mermaid.initialize({
  startOnLoad: false,
  theme: 'base', 
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: '#e8eaf6', 
    primaryBorderColor: '#5c6bc0',
    primaryTextColor: '#1a237e', 
    lineColor: '#7986cb', 
    fontFamily: 'Segoe UI, Roboto, sans-serif',
    fontSize: '14px'
  },
});

interface MermaidDiagramProps {
  chartCode: string;
}

export const MermaidDiagram = ({ chartCode }: MermaidDiagramProps) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartCode) return;

    const renderDiagram = async () => {
      try {
        setErrorMessage(null);
        const id = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
        const result: any = await mermaid.render(id, chartCode);
        const svgText = typeof result === 'string' ? result : result.svg;
        setSvgContent(svgText);
      } catch (error: any) {
        setErrorMessage(error?.message || "Error en el código UML");
      }
    };
    renderDiagram();
  }, [chartCode]);

  if (errorMessage) {
    return (
      <div className="mermaid-error">
        <strong>Error de renderizado:</strong> {errorMessage}
      </div>
    );
  }

  return (
    <div className="mermaid-outer-container">
      <div 
        ref={containerRef} 
        className="mermaid-inner-content" 
        dangerouslySetInnerHTML={{ __html: svgContent }} 
      />
    </div>
  );
};