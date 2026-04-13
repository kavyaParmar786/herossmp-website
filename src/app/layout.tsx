import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { CartProvider } from '@/hooks/useCart'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'HeroS SMP — The Ultimate Survival Experience',
  description: 'Join HeroS SMP — the most epic Minecraft survival multiplayer server. Ranked gameplay, custom features, and an incredible community.',
  keywords: 'minecraft, smp, survival, server, heros, herossmp',
  openGraph: {
    title: 'HeroS SMP',
    description: 'The Ultimate Minecraft Survival Experience',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-void text-slate-200 font-body antialiased">
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(10,10,18,0.95)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  color: '#e2e8f0',
                  backdropFilter: 'blur(12px)',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: '15px',
                },
                success: { iconTheme: { primary: '#10b981', secondary: '#050508' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#050508' } },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
