import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'strict' })

export default function FlowsDiagram({ definition }) {
  const containerRef = useRef(null)
  const [svg, setSvg] = useState('')

  useEffect(() => {
    let cancelled = false
    mermaid.render('flows-diagram', definition).then(({ svg }) => {
      if (!cancelled) setSvg(svg)
    })
    return () => { cancelled = true }
  }, [definition])

  return <div className="flows-diagram" ref={containerRef} dangerouslySetInnerHTML={{ __html: svg }} />
}
