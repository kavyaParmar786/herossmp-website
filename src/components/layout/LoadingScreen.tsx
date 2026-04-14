'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Check if already shown this session
    const shown = sessionStorage.getItem('loading-shown')
    if (shown) { setVisible(false); return }

    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => {
        setVisible(false)
        sessionStorage.setItem('loading-shown', '1')
      }, 700)
    }, 2800)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{
        background: 'radial-gradient(ellipse at center, #0d0520 0%, #050508 70%)',
      }}
    >
      {/* Animated purple glow blobs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />

      {/* Logo */}
      <div
        className="relative mb-8"
        style={{
          animation: 'float 3s ease-in-out infinite',
          filter: 'drop-shadow(0 0 40px rgba(139,92,246,0.6))',
        }}
      >
        <div style={{ mixBlendMode: 'screen' }}>
          <Image
            src="/logo.png"
            alt="HeroS SMP"
            width={240}
            height={160}
            priority
            style={{ mixBlendMode: 'screen' }}
          />
        </div>
      </div>

      {/* Loading bar */}
      <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #7c3aed, #a855f7, #06b6d4)',
            animation: 'loadbar 2.5s ease-out forwards',
          }}
        />
      </div>

      <p className="text-slate-500 text-sm tracking-widest uppercase">
        Loading the arena…
      </p>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes loadbar {
          0% { width: 0%; }
          30% { width: 40%; }
          70% { width: 75%; }
          100% { width: 100%; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
