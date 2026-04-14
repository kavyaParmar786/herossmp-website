'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const shown = sessionStorage.getItem('hs-loaded')
    if (shown) { setVisible(false); return }

    // Animate progress bar
    const steps = [
      { pct: 30, delay: 200 },
      { pct: 60, delay: 800 },
      { pct: 85, delay: 1400 },
      { pct: 100, delay: 2000 },
    ]
    const timers: ReturnType<typeof setTimeout>[] = []
    steps.forEach(({ pct, delay }) => {
      timers.push(setTimeout(() => setProgress(pct), delay))
    })

    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => {
        setVisible(false)
        sessionStorage.setItem('hs-loaded', '1')
      }, 600)
    }, 2600)

    return () => { timers.forEach(clearTimeout); clearTimeout(fadeTimer) }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-600 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'radial-gradient(ellipse at 30% 40%, #0d0520 0%, #050508 60%, #020205 100%)' }}
    >
      {/* Background glow layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)', animation: 'goldPulse 2s ease-in-out infinite' }} />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" style={{ backgroundSize: '50px 50px' }} />
      </div>

      {/* Logo — transparent PNG, gold glow */}
      <div className="relative mb-10 animate-float">
        <Image
          src="/logo.png"
          alt="HeroS SMP"
          width={280}
          height={185}
          priority
          className="object-contain"
          style={{ filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.6)) drop-shadow(0 0 60px rgba(124,58,237,0.3))' }}
        />
      </div>

      {/* Loading bar track */}
      <div className="w-72 h-1 rounded-full mb-4 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.1)' }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #7c3aed, #D4AF37, #FFD700)',
            boxShadow: '0 0 10px rgba(212,175,55,0.6)',
          }}
        />
      </div>

      <p className="text-slate-600 text-xs tracking-[0.3em] uppercase font-semibold">
        Entering the Arena…
      </p>

      <style>{`
        @keyframes goldPulse {
          0%,100% { transform: translate(-50%,-50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%,-50%) scale(1.2); opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
