import { RotateCcw } from 'lucide-react'

export default function RefundPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <RotateCcw className="w-12 h-12 text-hero-violet mx-auto mb-4" />
          <h1 className="font-display text-5xl font-bold text-white mb-3">Refund Policy</h1>
          <p className="text-slate-400">Last updated: January 2025</p>
        </div>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section className="glass rounded-2xl p-6 border border-yellow-500/20">
            <h2 className="font-display text-xl font-bold text-white mb-3">⚠️ General Policy</h2>
            <p>All purchases made on the HeroS SMP store are <strong className="text-white">final and non-refundable</strong> unless otherwise stated below. By completing a purchase you acknowledge that you have read and agreed to this policy.</p>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">Eligible Refunds</h2>
            <p className="mb-3">A refund may be considered in the following circumstances:</p>
            <ul className="space-y-2 list-disc list-inside text-slate-400">
              <li>You were charged more than once for the same purchase (duplicate charge).</li>
              <li>Your purchased item was never delivered to your in-game account after 48 hours.</li>
              <li>A technical error on our end prevented you from receiving your purchase.</li>
            </ul>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">Non-Eligible Refunds</h2>
            <p className="mb-3">Refunds will <strong className="text-white">not</strong> be issued for:</p>
            <ul className="space-y-2 list-disc list-inside text-slate-400">
              <li>Change of mind after purchase.</li>
              <li>Account bans resulting from rule violations.</li>
              <li>Items lost due to in-game actions (e.g. PvP, drops).</li>
              <li>Server downtime or maintenance periods.</li>
              <li>Failure to read item descriptions before purchasing.</li>
            </ul>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">How to Request a Refund</h2>
            <p className="mb-3">If you believe you are eligible for a refund, please follow these steps:</p>
            <ol className="space-y-2 list-decimal list-inside text-slate-400">
              <li>Open a support ticket from the <a href="/tickets" className="text-hero-glow hover:underline">Tickets</a> page.</li>
              <li>Include your Minecraft username and order details.</li>
              <li>Describe the issue clearly with any relevant screenshots.</li>
            </ol>
            <p className="mt-3">Our team will review your request within 3–5 business days.</p>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-white mb-3">Chargebacks</h2>
            <p>Initiating a chargeback without contacting us first will result in a <strong className="text-white">permanent ban</strong> from HeroS SMP. Please reach out to our support team before disputing a charge with your bank or payment provider.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
