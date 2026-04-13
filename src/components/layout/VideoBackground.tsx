'use client'
import { useEffect, useRef } from 'react'

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Ensure video plays on mobile too
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked — video stays paused, fallback CSS bg shows
      })
    }
  }, [])

  return (
    <>
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
          style={{ filter: 'brightness(0.18) saturate(1.4)' }}
        >
          {/* Try common video extensions — put your file in /public/hero-bg/ */}
          <source src="/hero-bg/hero-bg.mp4" type="video/mp4" />
          <source src="/hero-bg/hero-bg.webm" type="video/webm" />
          <source src="/hero-bg/hero-bg.mov" type="video/quicktime" />
        </video>

        {/* Dark gradient overlay on top of video */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />

        {/* Purple tint */}
        <div className="absolute inset-0 bg-hero-purple/10" />

        {/* Grid pattern on top */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,92,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.07) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>
    </>
  )
}
