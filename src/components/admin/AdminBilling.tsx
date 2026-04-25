'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  Receipt, Search, RefreshCw, CheckCircle2, XCircle,
  Clock, Package, ChevronLeft, ChevronRight, Filter,
  Download, Sword, User, Calendar, IndianRupee, Truck,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface OrderItem {
  name: string
  price: number
  quantity: number
  category: string
}

interface Order {
  _id: string
  username: string
  minecraftUsername?: string
  items: OrderItem[]
  totalAmount: number
  gstAmount: number
  finalAmount: number
  paymentId?: string
  razorpayOrderId: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  delivered: boolean
  deliveredAt?: string
  createdAt: string
}

const STATUS_COLORS = {
  COMPLETED: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  PENDING:   'text-amber-400  bg-amber-400/10  border-amber-400/30',
  FAILED:    'text-red-400    bg-red-400/10    border-red-400/30',
}

const STATUS_ICONS = {
  COMPLETED: <CheckCircle2 className="w-3 h-3" />,
  PENDING:   <Clock        className="w-3 h-3" />,
  FAILED:    <XCircle      className="w-3 h-3" />,
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatRupee(n: number) {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function AdminBilling() {
  const { token } = useAuth()

  const [orders,  setOrders]  = useState<Order[]>([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [pages,   setPages]   = useState(1)
  const [loading, setLoading] = useState(true)

  const [search,    setSearch]    = useState('')
  const [status,    setStatus]    = useState('')
  const [delivered, setDelivered] = useState('')
  const [expanded,  setExpanded]  = useState<string | null>(null)

  const fetchOrders = useCallback(async (p = page) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' })
      if (search)    params.set('search',    search)
      if (status)    params.set('status',    status)
      if (delivered) params.set('delivered', delivered)

      const res = await fetch(`/api/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setOrders(data.orders || [])
      setTotal(data.total  || 0)
      setPages(data.pages  || 1)
      setPage(p)
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [token, search, status, delivered, page])

  useEffect(() => { fetchOrders(1) }, [token]) // eslint-disable-line

  // Stats derived from current page
  const completedRevenue = orders
    .filter(o => o.status === 'COMPLETED')
    .reduce((s, o) => s + o.finalAmount, 0)

  const pendingDelivery = orders.filter(o => o.status === 'COMPLETED' && !o.delivered).length

  // CSV export
  const exportCSV = () => {
    const rows = [
      ['Order ID', 'Date', 'Username', 'Minecraft IGN', 'Items', 'Subtotal', 'GST', 'Total', 'Status', 'Delivered', 'Payment ID'],
      ...orders.map(o => [
        o._id,
        formatDate(o.createdAt),
        o.username,
        o.minecraftUsername || '—',
        o.items.map(i => `${i.name} x${i.quantity}`).join(' | '),
        o.totalAmount,
        o.gstAmount,
        o.finalAmount,
        o.status,
        o.delivered ? 'Yes' : 'No',
        o.paymentId || '—',
      ])
    ]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `orders-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Receipt className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">Billing Records</h2>
            <p className="text-sm text-slate-400">{total} total orders</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => fetchOrders(page)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Orders',    value: total,                          icon: <Receipt className="w-4 h-4" />,       color: 'text-blue-400'   },
          { label: 'Page Revenue',    value: formatRupee(completedRevenue),  icon: <IndianRupee className="w-4 h-4" />,   color: 'text-emerald-400'},
          { label: 'Pending Deliver', value: pendingDelivery,                icon: <Truck className="w-4 h-4" />,         color: 'text-amber-400'  },
          { label: 'Showing',         value: `${orders.length} / ${total}`,  icon: <Filter className="w-4 h-4" />,        color: 'text-violet-400' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="glass rounded-xl p-4 border border-white/5">
            <div className={`${color} mb-2`}>{icon}</div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 border border-white/5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchOrders(1)}
            placeholder="Search username, IGN, payment ID…"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); fetchOrders(1) }}
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
        >
          <option value="">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
        <select
          value={delivered}
          onChange={e => { setDelivered(e.target.value); fetchOrders(1) }}
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
        >
          <option value="">All Delivery</option>
          <option value="true">Delivered</option>
          <option value="false">Not Delivered</option>
        </select>
        <button
          onClick={() => fetchOrders(1)}
          className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Orders table */}
      <div className="glass rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Receipt className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  {['Date', 'User', 'Items', 'Total', 'Status', 'Delivered', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <>
                    <tr
                      key={order._id}
                      className="border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors"
                      onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                    >
                      {/* Date */}
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {formatDate(order.createdAt)}
                        </div>
                      </td>

                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-white font-medium flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {order.username}
                          </span>
                          {order.minecraftUsername && (
                            <span className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                              <Sword className="w-3 h-3" />
                              {order.minecraftUsername}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {order.items.map((item, i) => (
                            <span key={i} className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded text-violet-300 text-xs">
                              {item.name} {item.quantity > 1 && `×${item.quantity}`}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">
                        {formatRupee(order.finalAmount)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.status]}`}>
                          {STATUS_ICONS[order.status]}
                          {order.status}
                        </span>
                      </td>

                      {/* Delivered */}
                      <td className="px-4 py-3">
                        {order.status === 'COMPLETED' ? (
                          order.delivered ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </td>

                      {/* Expand */}
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {expanded === order._id ? '▲' : '▼'}
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {expanded === order._id && (
                      <tr key={order._id + '-detail'} className="bg-slate-800/50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">

                            {/* Order info */}
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Order Info</p>
                              <div className="space-y-1 text-slate-300">
                                <div><span className="text-slate-500">Order ID:</span> <span className="font-mono text-xs">{order._id}</span></div>
                                <div><span className="text-slate-500">Razorpay:</span> <span className="font-mono text-xs">{order.razorpayOrderId}</span></div>
                                {order.paymentId && <div><span className="text-slate-500">Payment:</span> <span className="font-mono text-xs">{order.paymentId}</span></div>}
                              </div>
                            </div>

                            {/* Price breakdown */}
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Price Breakdown</p>
                              <div className="space-y-1 text-slate-300">
                                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatRupee(order.totalAmount)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">GST (18%)</span><span>{formatRupee(order.gstAmount)}</span></div>
                                <div className="flex justify-between font-bold text-white border-t border-white/10 pt-1 mt-1"><span>Total</span><span>{formatRupee(order.finalAmount)}</span></div>
                              </div>
                            </div>

                            {/* Items detail */}
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Items</p>
                              <div className="space-y-1">
                                {order.items.map((item, i) => (
                                  <div key={i} className="flex items-center justify-between text-slate-300">
                                    <div className="flex items-center gap-2">
                                      <Package className="w-3 h-3 text-slate-500" />
                                      <span>{item.name}</span>
                                      <span className="text-xs text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded">{item.category}</span>
                                    </div>
                                    <span>{formatRupee(item.price)} ×{item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                              {order.delivered && order.deliveredAt && (
                                <p className="text-xs text-emerald-400 mt-2">
                                  ✓ Delivered at {formatDate(order.deliveredAt)}
                                </p>
                              )}
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => fetchOrders(page - 1)}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i
              if (p < 1 || p > pages) return null
              return (
                <button
                  key={p}
                  onClick={() => fetchOrders(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-amber-500 text-black'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            <button
              disabled={page >= pages}
              onClick={() => fetchOrders(page + 1)}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
