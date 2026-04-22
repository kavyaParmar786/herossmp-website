'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button, Card, Input } from '@/components/ui'
import { Settings, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const { token } = useAuth()
  const [settings, setSettings] = useState({
    serverIP: 'play.herossmp.xyz',
    leaderboardEnabled: true,
    maintenanceMode: false,
    discordLink: 'https://discord.gg/herossmp',
    storeEnabled: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.settings) setSettings(d.settings) })
      .catch(console.error)
  }, [token])

  const save = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Settings saved!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const Toggle = ({ label, description, field }: { label: string; description: string; field: keyof typeof settings }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div>
        <p className="font-semibold text-white">{label}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => setSettings({ ...settings, [field]: !settings[field] })}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${settings[field] ? 'bg-hero-violet' : 'bg-slate-600'}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings[field] ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-hero-violet" />
          Site Settings
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-white mb-4">General</h3>
          <div className="space-y-4">
            <Input
              label="Minecraft Server IP"
              value={settings.serverIP}
              onChange={(e) => setSettings({ ...settings, serverIP: e.target.value })}
              placeholder="play.herossmp.xyz"
            />
            <Input
              label="Discord Invite Link"
              value={settings.discordLink}
              onChange={(e) => setSettings({ ...settings, discordLink: e.target.value })}
              placeholder="https://discord.gg/..."
            />
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-white mb-4">Feature Flags</h3>
          <Toggle
            label="Leaderboard"
            description="Show leaderboard on homepage"
            field="leaderboardEnabled"
          />
          <Toggle
            label="Store"
            description="Allow players to purchase items"
            field="storeEnabled"
          />
          <Toggle
            label="Maintenance Mode"
            description="Show maintenance message to users"
            field="maintenanceMode"
          />
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button size="lg" loading={loading} onClick={save}>
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
