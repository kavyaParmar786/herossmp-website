'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState(0)
  const phases = ['Connecting to server…', 'Loading assets…', 'Entering world…']

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + Math.random() * 18
        if (next >= 100) { clearInterval(interval); return 100 }
        return next
      })
    }, 120)
    const phaseInterval = setInterval(() => {
      setPhase(p => (p + 1) % phases.length)
    }, 900)
    return () => { clearInterval(interval); clearInterval(phaseInterval) }
  }, [])

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: '#05050A' }}>

      {/* Aurora glow */}
      <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.8) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'auroraShift 8s linear infinite' }} />

      {/* Logo */}
      <div className="animate-float mb-8">
        <Image src="/logo.png" alt="HeroSMP" width={200} height={130} priority
          style={{ filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.5)) drop-shadow(0 0 60px rgba(124,58,237,0.3))' }} />
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1 rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(progress, 100)}%`,
            background: 'linear-gradient(90deg, #7c3aed, #D4AF37)',
            boxShadow: '0 0 12px rgba(212,175,55,0.5)',
          }}
        />
      </div>

      {/* Phase text */}
      <p className="text-xs text-slate-500 font-mono tracking-widest animate-pulse">{phases[phase]}</p>
    </div>
  )
}
