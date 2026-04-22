'use client'
import { useEffect, useRef } from 'react'

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // Performance: reduce quality on low-end devices
    video.playbackRate = 1
    video.play().catch(() => {})
  }, [])

  return (
    <>
      {/* Scanline sweep */}
      <div className="scanline" aria-hidden="true" />

      {/* Aurora blobs — pure CSS, no JS */}
      <div className="aurora" style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,1) 0%, rgba(212,175,55,0.3) 40%, transparent 70%)' }} aria-hidden="true" />
      <div className="aurora" style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.6) 0%, rgba(139,92,246,0.2) 50%, transparent 70%)', animationDuration: '28s', animationDirection: 'reverse', opacity: 0.03 }} aria-hidden="true" />

      {/* Video layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute w-full h-full object-cover"
          style={{ filter: 'brightness(0.18) saturate(1.4)', transform: 'translateZ(0)', willChange: 'auto' }}
        >
          <source src="/hero-bg/hero-bg.mp4" type="video/mp4" />
          <source src="/hero-bg/hero-bg.webm" type="video/webm" />
        </video>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />
        <div className="absolute inset-0 bg-hero-purple/10" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>
    </>
  )
}
