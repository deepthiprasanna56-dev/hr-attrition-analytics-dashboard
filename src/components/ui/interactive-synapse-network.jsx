import { useEffect, useRef } from 'react'

/** Lightweight, responsive canvas network used as a decorative dashboard backdrop. */
export default function InteractiveSynapseNetwork({ nodeCount = 34, connectionRadius = 126, className = '' }) {
  const hostRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!host || !canvas || !ctx) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let frame = 0
    let pointer = { x: -1000, y: -1000 }
    const nodes = []

    const resize = () => {
      const rect = host.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * ratio
      canvas.height = height * ratio
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      nodes.length = 0
      for (let i = 0; i < nodeCount; i += 1) {
        nodes.push({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - .5) * .24, vy: (Math.random() - .5) * .24, z: .45 + Math.random() * .55, phase: Math.random() * Math.PI * 2 })
      }
    }
    const move = event => {
      const rect = host.getBoundingClientRect()
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
    const leave = () => { pointer = { x: -1000, y: -1000 } }
    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      nodes.forEach((node, index) => {
        if (!reduced) {
          node.x += node.vx
          node.y += node.vy
          node.phase += .012
          if (node.x < -8 || node.x > width + 8) node.vx *= -1
          if (node.y < -8 || node.y > height + 8) node.vy *= -1
        }
        const dx = node.x - pointer.x
        const dy = node.y - pointer.y
        const glow = Math.max(0, 1 - Math.hypot(dx, dy) / 170)
        for (let j = index + 1; j < nodes.length; j += 1) {
          const other = nodes[j]
          const distance = Math.hypot(node.x - other.x, node.y - other.y)
          if (distance < connectionRadius) {
            const alpha = (1 - distance / connectionRadius) * .22 * node.z
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(128,137,255,${alpha + glow * .26})`
            ctx.lineWidth = .55 + glow * .65
            ctx.stroke()
            if (!reduced && Math.sin(node.phase + index) > .985) {
              const pulse = (Math.sin(node.phase + index) - .985) / .015
              const px = node.x + (other.x - node.x) * pulse
              const py = node.y + (other.y - node.y) * pulse
              ctx.beginPath()
              ctx.arc(px, py, 1.5, 0, Math.PI * 2)
              ctx.fillStyle = 'rgba(224,225,255,.85)'
              ctx.fill()
            }
          }
        }
        const radius = 1 + node.z * 1.15 + glow * 1.7
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius * 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(129,135,255,${.025 + glow * .06})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(171,174,255,${.28 + glow * .55})`
        ctx.fill()
      })
      if (!reduced) frame = requestAnimationFrame(draw)
    }

    resize()
    draw()
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    host.addEventListener('pointermove', move)
    host.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
    }
  }, [nodeCount, connectionRadius])

  return <div ref={hostRef} className={`synapse-network ${className}`} aria-hidden="true"><canvas ref={canvasRef} /></div>
}
