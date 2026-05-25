import mermaid from "mermaid"
import { useEffect, useRef, useState } from "react"

import "./css/MermaidViewer.css"

interface Props {
  chartCode: string
}

let mermaidInitialized = false
let currentTheme = ""

function sanitizeForRender(code: string): string {
  if (!code) return ""
  let result = code

  result = result
    .replaceAll("\\n", "\n")
    .replaceAll('\\"', '"')
    .replaceAll("\\'", "'")

  result = result
    .replace(/{\s*}/g, "")
    .replace(/{/g, " {\n")
    .replace(/}/g, "\n}\n")
    .replace(/<\|--/g, " <|-- ")
    .replace(/-->/g, " --> ")
    .replace(/<--/g, " <-- ")

  result = result
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("%%"))
    .join("\n")

  return result.trim()
}

function fixSvgDimensions(svgString: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, "image/svg+xml")
  const svg = doc.querySelector("svg")
  if (!svg) return svgString

  if (!svg.getAttribute("viewBox")) {
    const w = svg.getAttribute("width")
    const h = svg.getAttribute("height")
    if (w && h) {
      svg.setAttribute("viewBox", `0 0 ${parseFloat(w)} ${parseFloat(h)}`)
    }
  }

  svg.removeAttribute("width")
  svg.removeAttribute("height")
  svg.setAttribute("width", "100%")
  svg.setAttribute("height", "auto")
  svg.style.maxWidth = "none"
  svg.style.display = "block"

  return new XMLSerializer().serializeToString(svg)
}

export function MermaidViewer({ chartCode }: Props) {
  const [svg, setSvg] = useState("")
  const [error, setError] = useState("")
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isPanning = useRef(false)
  const startPos = useRef({ mx: 0, my: 0, px: 0, py: 0 })

  useEffect(() => {
    if (!chartCode) return
    setError("")
    setSvg("")

    const render = async () => {
      try {
        if (!mermaidInitialized || currentTheme !== "beige") {
          mermaid.initialize({
            startOnLoad: false,
            theme: "base",
            themeVariables: {
              primaryColor: "#fff3e0",
              primaryBorderColor: "#d4a96a",
              primaryTextColor: "#333333",
              lineColor: "#333333",
              background: "#ffffff",
              mainBkg: "#fff3e0",
              nodeBorder: "#d4a96a",
              clusterBkg: "#fff8f0",
              titleColor: "#333333",
              edgeLabelBackground: "#ffffff"
            },
            securityLevel: "loose"
          })
          mermaidInitialized = true
          currentTheme = "beige"
        }

        const safeCode = sanitizeForRender(chartCode)
        const id = "mermaid-render-" + Date.now()
        const { svg: renderedSvg } = await mermaid.render(id, safeCode)

        if (!renderedSvg) throw new Error("No se generó SVG")

        const fixedSvg = fixSvgDimensions(renderedSvg)
        setSvg(fixedSvg)
        setScale(1)
        setPan({ x: 0, y: 0 })
      } catch (e: any) {
        console.error("Mermaid render error:", e)
        setError("Error renderizando: " + (e?.message ?? String(e)))
      }
    }

    render()
  }, [chartCode])

  const zoomBy = (delta: number) =>
    setScale((s) => Math.max(0.15, Math.min(5, s + delta)))

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    zoomBy(e.deltaY > 0 ? -0.1 : 0.1)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    isPanning.current = true
    startPos.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current) return
    setPan({
      x: startPos.current.px + e.clientX - startPos.current.mx,
      y: startPos.current.py + e.clientY - startPos.current.my
    })
  }

  const onMouseUp = () => {
    isPanning.current = false
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%"
      }}>
      <div className="mermaid-toolbar">
        <button onClick={() => zoomBy(-0.2)} className="mermaid-btn">
          − Zoom
        </button>
        <span className="mermaid-zoom-label">{Math.round(scale * 100)}%</span>
        <button onClick={() => zoomBy(0.2)} className="mermaid-btn">
          + Zoom
        </button>
        <button
          onClick={() => {
            setScale(1)
            setPan({ x: 0, y: 0 })
          }}
          className="mermaid-btn">
          ⟳ Reset
        </button>
      </div>

      <div
        onWheel={handleWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="mermaid-outer-container">
        {error ? (
          <div className="mermaid-error">
            <div>{error}</div>
            <details style={{ marginTop: 12 }}>
              <summary>Ver código que falló</summary>
              <pre>{sanitizeForRender(chartCode)}</pre>
            </details>
          </div>
        ) : svg ? (
          <div
            className="mermaid-inner-content"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: "top left"
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="mermaid-loading">Renderizando...</div>
        )}
      </div>
    </div>
  )
}
