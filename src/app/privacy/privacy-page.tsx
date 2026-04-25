import { Shield } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Shield className="w-12 h-12 text-hero-violet mx-auto mb-4" />
          <h1 className="font-display text-5xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-slate-400">Last updated: January 2025</p>
        </div>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p className="mb-3">When you use HeroS SMP services, we may collect:</p>
            <ul className="space-y-2 list-disc list-inside text-slate-400">
              <li>Your Minecraft username and UUID.</li>
              <li>Email address (if provided during registration).</li>
              <li>Purchase history and transaction data.</li>
              <li>IP address and basic browser information for security purposes.</li>
            </ul>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use collected data to:</p>
            <ul className="space-y-2 list-disc list-inside text-slate-400">
              <li>Deliver purchased items to your in-game account.</li>
              <li>Provide customer support and process refund requests.</li>
              <li>Detect and prevent fraud or abuse.</li>
              <li>Send important service updates (no marketing without consent).</li>
            </ul>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">3. Data Sharing</h2>
            <p>We do not sell or rent your personal data to third parties. We may share data with payment processors (e.g. Stripe) solely to complete transactions. These providers have their own privacy policies and are bound by data protection agreements.</p>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">4. Data Retention</h2>
            <p>We retain your data for as long as your account is active or as required to provide services. You may request deletion of your account and associated data by opening a support ticket.</p>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">5. Cookies</h2>
            <p>We use essential cookies to keep you logged in and maintain your session. We do not use tracking or advertising cookies.</p>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. To exercise these rights, please open a support ticket or contact us on Discord.</p>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">7. Contact</h2>
            <p>For privacy-related questions, reach us via <a href="/tickets" className="text-hero-glow hover:underline">support ticket</a> or on our <a href="https://discord.gg/herossmp" target="_blank" rel="noopener noreferrer" className="text-hero-glow hover:underline">Discord server</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
