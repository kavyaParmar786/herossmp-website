import { Scale } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Scale className="w-12 h-12 text-hero-violet mx-auto mb-4" />
          <h1 className="font-display text-5xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-slate-400">Last updated: January 2025</p>
        </div>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the HeroS SMP store and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">2. Virtual Goods & Purchases</h2>
            <p>All purchases on HeroS SMP are for virtual in-game items and ranks. These items have no real-world monetary value and cannot be transferred, sold, or exchanged outside of the game. Purchases are tied to your Minecraft username.</p>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">3. Account Responsibility</h2>
            <p>You are responsible for maintaining the security of your account. HeroS SMP is not liable for any loss resulting from unauthorised use of your account. Do not share your login credentials with others.</p>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">4. Server Rules</h2>
            <p>All players must abide by the HeroS SMP server rules. Violations may result in temporary or permanent bans without refund of any purchased items or ranks. Rules are enforced at the discretion of server staff.</p>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">5. Service Availability</h2>
            <p>We strive to maintain server uptime but do not guarantee uninterrupted access. HeroS SMP reserves the right to perform maintenance, updates, or shut down services with or without notice.</p>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">6. Modifications</h2>
            <p>HeroS SMP reserves the right to modify these Terms at any time. Continued use of our services after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">7. Contact</h2>
            <p>For questions about these Terms, please open a support ticket or reach out on our <a href="https://discord.gg/herossmp" target="_blank" rel="noopener noreferrer" className="text-hero-glow hover:underline">Discord server</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
