import { useEffect, useRef, useState } from 'react'

// Zone de signature tactile : dessin au doigt/stylet sur canvas, export en
// data URL PNG. Gère le devicePixelRatio pour un tracé net sur tablette.

export function PadSignature({
  onChange
}: {
  onChange: (dataUrl: string | null) => void
}) {
  const refCanvas = useRef<HTMLCanvasElement>(null)
  const enTrace = useRef(false)
  const [vide, setVide] = useState(true)

  useEffect(() => {
    const canvas = refCanvas.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#263238'
  }, [])

  function position(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function debut(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = refCanvas.current?.getContext('2d')
    if (!ctx) return
    e.currentTarget.setPointerCapture(e.pointerId)
    enTrace.current = true
    const { x, y } = position(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function trace(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!enTrace.current) return
    const ctx = refCanvas.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = position(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    if (vide) setVide(false)
  }

  function fin() {
    if (!enTrace.current) return
    enTrace.current = false
    const canvas = refCanvas.current
    if (canvas) onChange(canvas.toDataURL('image/png'))
  }

  function effacer() {
    const canvas = refCanvas.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setVide(true)
    onChange(null)
  }

  return (
    <div>
      <canvas
        ref={refCanvas}
        className="pad-signature"
        aria-label="Zone de signature"
        onPointerDown={debut}
        onPointerMove={trace}
        onPointerUp={fin}
        onPointerCancel={fin}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--texte-2)' }}>
          {vide ? 'Signez dans le cadre ci-dessus.' : 'Signature saisie.'}
        </span>
        <button className="lien-retirer" onClick={effacer} disabled={vide}>
          Effacer
        </button>
      </div>
    </div>
  )
}
