'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button, Card, Input } from '@/components/ui'
import {
  Trophy, Plus, Trash2, Save, RefreshCw, Search,
  Sword, Skull, Coins, Clock, AlertTriangle, X, Edit2, Copy, Check
} from 'lucide-react'
import toast from 'react-hot-toast'

interface LeaderboardEntry {
  _id?: string
  playerName: string
  kills: number
  deaths: number
  coins: number
  playtime: number
}

const EMPTY_ENTRY: Omit<LeaderboardEntry, '_id'> = {
  playerName: '',
  kills: 0,
  deaths: 0,
  coins: 0,
  playtime: 0,
}

export default function AdminLeaderboard() {
  const { token } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<LeaderboardEntry | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEntry, setNewEntry] = useState<Omit<LeaderboardEntry, '_id'>>(EMPTY_ENTRY)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const pluginKey = process.env.NEXT_PUBLIC_PLUGIN_KEY_HINT || '<your-PLUGIN_API_KEY from .env>'

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/leaderboard?sortBy=kills&limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setEntries(data.entries || [])
    } catch {
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchAll() }, [fetchAll])

  const saveEntry = async (entry: LeaderboardEntry) => {
    setSaving(entry._id ?? 'new')
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          playerName: entry.playerName,
          kills: Number(entry.kills),
          deaths: Number(entry.deaths),
          coins: Number(entry.coins),
          playtime: Number(entry.playtime),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(`Saved ${entry.playerName}!`)
      setEditingId(null)
      setEditData(null)
      setShowAddForm(false)
      setNewEntry(EMPTY_ENTRY)
      fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(null)
    }
  }

  const deleteEntry = async (playerName: string) => {
    try {
      const res = await fetch(`/api/leaderboard?playerName=${encodeURIComponent(playerName)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed')
      toast.success(`Removed ${playerName}`)
      setDeleteConfirm(null)
      fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const filtered = entries.filter(e =>
    e.playerName.toLowerCase().includes(search.toLowerCase())
  )

  const copyKey = () => {
    navigator.clipboard.writeText(pluginKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const StatInput = ({
    label, icon: Icon, value, color, onChange,
  }: {
    label: string
    icon: React.ElementType
    value: number
    color: string
    onChange: (v: number) => void
  }) => (
    <div className="flex-1 min-w-0">
      <label className={`text-xs font-semibold ${color} flex items-center gap-1 mb-1`}>
        <Icon className="w-3 h-3" /> {label}
      </label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-hero-violet/50"
      />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Leaderboard Manager
        </h2>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={fetchAll}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4" />
            Add Player
          </Button>
        </div>
      </div>

      {/* Plugin Key Info */}
      <Card className="mb-6 border border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-yellow-300 text-sm mb-1">Plugin Integration</p>
            <p className="text-slate-400 text-xs mb-3">
              Install <strong className="text-white">HerosSMPPlugin.jar</strong> on your Paper server.
              It will POST player stats every 5 minutes using this key as the <code className="text-yellow-300">x-plugin-key</code> header.
            </p>
            <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 border border-white/10">
              <code className="text-xs text-green-400 flex-1 font-mono truncate">
                PLUGIN_API_KEY = {pluginKey}
              </code>
              <button onClick={copyKey} className="text-slate-400 hover:text-white transition-colors flex-shrink-0">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-slate-500 text-xs mt-2">
              Set <code className="text-slate-300">WEBSITE_URL</code> and <code className="text-slate-300">PLUGIN_API_KEY</code> in <code className="text-slate-300">plugins/HerosSMP/config.yml</code>
            </p>
          </div>
        </div>
      </Card>

      {/* Add Player Form */}
      {showAddForm && (
        <Card className="mb-6 border border-hero-violet/30 bg-hero-violet/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-hero-violet" /> Add Player
            </h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Minecraft Username</label>
              <input
                type="text"
                placeholder="e.g. Notch"
                value={newEntry.playerName}
                onChange={e => setNewEntry({ ...newEntry, playerName: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-hero-violet/50"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <StatInput label="Kills" icon={Sword} value={newEntry.kills} color="text-red-400"
                onChange={v => setNewEntry({ ...newEntry, kills: v })} />
              <StatInput label="Deaths" icon={Skull} value={newEntry.deaths} color="text-slate-400"
                onChange={v => setNewEntry({ ...newEntry, deaths: v })} />
              <StatInput label="Coins" icon={Coins} value={newEntry.coins} color="text-yellow-400"
                onChange={v => setNewEntry({ ...newEntry, coins: v })} />
              <StatInput label="Playtime (min)" icon={Clock} value={newEntry.playtime} color="text-cyan-400"
                onChange={v => setNewEntry({ ...newEntry, playtime: v })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => { setShowAddForm(false); setNewEntry(EMPTY_ENTRY) }}>
              Cancel
            </Button>
            <Button
              loading={saving === 'new'}
              disabled={!newEntry.playerName.trim()}
              onClick={() => saveEntry(newEntry as LeaderboardEntry)}
            >
              <Save className="w-4 h-4" /> Add Player
            </Button>
          </div>
        </Card>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-hero-violet/40"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-semibold">#</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-semibold">Player</th>
                <th className="text-right px-4 py-3 text-xs text-red-400 font-semibold">
                  <span className="flex items-center justify-end gap-1"><Sword className="w-3 h-3" />Kills</span>
                </th>
                <th className="text-right px-4 py-3 text-xs text-slate-400 font-semibold">
                  <span className="flex items-center justify-end gap-1"><Skull className="w-3 h-3" />Deaths</span>
                </th>
                <th className="text-right px-4 py-3 text-xs text-yellow-400 font-semibold">
                  <span className="flex items-center justify-end gap-1"><Coins className="w-3 h-3" />Coins</span>
                </th>
                <th className="text-right px-4 py-3 text-xs text-cyan-400 font-semibold">
                  <span className="flex items-center justify-end gap-1"><Clock className="w-3 h-3" />Playtime</span>
                </th>
                <th className="text-right px-4 py-3 text-xs text-slate-500 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20 text-yellow-400" />
                    <p>No players found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((entry, idx) => {
                  const isEditing = editingId === entry._id
                  const data = isEditing ? editData! : entry
                  const playtimeH = Math.floor((data.playtime ?? 0) / 60)
                  const playtimeM = (data.playtime ?? 0) % 60
                  return (
                    <tr key={entry._id} className={`border-b border-white/5 transition-colors ${isEditing ? 'bg-hero-violet/5' : 'hover:bg-white/2'}`}>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://mc-heads.net/avatar/${encodeURIComponent(entry.playerName)}/24`}
                            alt={entry.playerName}
                            className="w-6 h-6 rounded flex-shrink-0 border border-white/10"
                            onError={e => { (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steve/24' }}
                          />
                          <span className="font-semibold text-white">{entry.playerName}</span>
                        </div>
                      </td>

                      {/* Stats — editable inline */}
                      {(['kills', 'deaths', 'coins', 'playtime'] as const).map((field, fi) => (
                        <td key={field} className="px-4 py-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              value={data[field]}
                              onChange={e => setEditData({ ...data, [field]: Number(e.target.value) })}
                              className="w-24 bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-xs font-mono text-right focus:outline-none focus:border-hero-violet/50"
                            />
                          ) : (
                            <span className={`font-mono ${['text-red-400', 'text-slate-400', 'text-yellow-400', 'text-cyan-400'][fi]}`}>
                              {field === 'playtime'
                                ? `${playtimeH}h ${playtimeM}m`
                                : data[field].toLocaleString()}
                            </span>
                          )}
                        </td>
                      ))}

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEntry(data)}
                                disabled={saving === entry._id}
                                className="px-2 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs flex items-center gap-1 transition-colors"
                              >
                                <Save className="w-3 h-3" />
                                {saving === entry._id ? 'Saving…' : 'Save'}
                              </button>
                              <button
                                onClick={() => { setEditingId(null); setEditData(null) }}
                                className="px-2 py-1 rounded bg-white/5 text-slate-400 hover:text-white text-xs transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          ) : deleteConfirm === entry._id ? (
                            <>
                              <span className="text-xs text-red-400 mr-1">Sure?</span>
                              <button
                                onClick={() => deleteEntry(entry.playerName)}
                                className="px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs transition-colors"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 rounded bg-white/5 text-slate-400 hover:text-white text-xs transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setEditingId(entry._id!); setEditData({ ...entry }) }}
                                className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(entry._id!)}
                                className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-white/5">
            <p className="text-xs text-slate-600 text-center">{filtered.length} player{filtered.length !== 1 ? 's' : ''} shown</p>
          </div>
        )}
      </Card>
    </div>
  )
}
