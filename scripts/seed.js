/**
 * Seed script — run with:  node scripts/seed.js
 * Requires MONGODB_URI in .env.local
 */
require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1) }

// ── Schemas ────────────────────────────────────────────────────────────────────
const ProductSchema = new mongoose.Schema({
  name: String, price: Number, category: String,
  features: [String], description: String,
  popular: Boolean, color: String, active: { type: Boolean, default: true }
}, { timestamps: true })

const LeaderboardSchema = new mongoose.Schema({
  playerName: String, kills: Number, deaths: Number, coins: Number, playtime: Number
})

const FAQSchema = new mongoose.Schema({
  question: String, answer: String, category: String, order: Number
})

const SiteSettingsSchema = new mongoose.Schema({
  key: String, serverIP: String, leaderboardEnabled: Boolean,
  maintenanceMode: Boolean, discordLink: String, storeEnabled: Boolean
})

const Product = mongoose.model('Product', ProductSchema)
const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema)
const FAQ = mongoose.model('FAQ', FAQSchema)
const SiteSettings = mongoose.model('SiteSettings', SiteSettingsSchema)

// ── Seed data ─────────────────────────────────────────────────────────────────
const products = [
  {
    name: 'Hero Rank', price: 299, category: 'RANKS', popular: true, color: '#8b5cf6',
    description: 'The entry-level rank for serious players',
    features: ['Custom prefix [Hero]', 'Access to /fly in spawn', '5 home sets', 'Color chat', '10% shop discount']
  },
  {
    name: 'Legend Rank', price: 599, category: 'RANKS', popular: false, color: '#f59e0b',
    description: 'Become a legend on the server',
    features: ['Custom prefix [Legend]', 'Access to /fly everywhere', '15 home sets', 'Color & format chat', '20% shop discount', 'Legend kit']
  },
  {
    name: 'God Rank', price: 999, category: 'RANKS', popular: false, color: '#ec4899',
    description: 'The ultimate rank for the elite',
    features: ['Custom prefix [GOD]', 'Full /fly access', 'Unlimited homes', 'All chat formats', '30% shop discount', 'God kit', 'Priority queue']
  },
  {
    name: 'Common Key', price: 49, category: 'KEYS', popular: false, color: '#10b981',
    description: 'Open common crates for good loot',
    features: ['1x Common Crate Key', 'Random enchanted gear', 'Chance for bonus items']
  },
  {
    name: 'Rare Key Bundle', price: 149, category: 'KEYS', popular: true, color: '#3b82f6',
    description: '5 rare keys for amazing rewards',
    features: ['5x Rare Crate Keys', 'Higher loot quality', 'Exclusive cosmetics chance', 'Bonus coins chance']
  },
  {
    name: '10,000 Coins', price: 99, category: 'COINS', popular: false, color: '#f59e0b',
    description: 'Boost your in-game economy',
    features: ['10,000 in-game coins', 'Instant delivery', 'Use in player shops', 'Trade with other players']
  },
  {
    name: '50,000 Coins', price: 399, category: 'COINS', popular: true, color: '#f59e0b',
    description: 'A massive coin boost',
    features: ['50,000 in-game coins', 'Instant delivery', 'Best value pack', 'Bonus 5% on top']
  },
  {
    name: '₹1000 In-Game Money', price: 149, category: 'MONEY', popular: false, color: '#10b981',
    description: 'In-game economy currency',
    features: ['₹1,000 in-game cash', 'Buy from admin shop', 'Trade with players', 'Instant credit']
  },
  {
    name: '100 Claim Blocks', price: 79, category: 'LANDCLAIM', popular: false, color: '#06b6d4',
    description: 'Protect more of your land',
    features: ['100 extra claim blocks', 'Permanent addition', 'Protects builds from grief', 'Use /claim to activate']
  },
  {
    name: 'Starter Pack', price: 199, category: 'PACKS', popular: true, color: '#a78bfa',
    description: 'Perfect for new players',
    features: ['Hero Rank (30 days)', '2x Common Keys', '5,000 coins', '50 claim blocks', 'Welcome kit']
  },
]

const leaderboard = [
  { playerName: 'DragonSlayer99', kills: 1543, deaths: 120, coins: 98400, playtime: 8760 },
  { playerName: 'HeroMaster', kills: 1201, deaths: 89, coins: 75200, playtime: 6540 },
  { playerName: 'NightWalker', kills: 987, deaths: 201, coins: 62100, playtime: 5430 },
  { playerName: 'SwordKing', kills: 854, deaths: 155, coins: 54000, playtime: 4320 },
  { playerName: 'PhoenixRiser', kills: 743, deaths: 98, coins: 48900, playtime: 3960 },
  { playerName: 'StormBringer', kills: 612, deaths: 210, coins: 41200, playtime: 3240 },
  { playerName: 'IronFist', kills: 589, deaths: 178, coins: 38700, playtime: 2880 },
  { playerName: 'ShadowWolf', kills: 521, deaths: 134, coins: 32400, playtime: 2520 },
  { playerName: 'CrimsonBlade', kills: 487, deaths: 167, coins: 28900, playtime: 2160 },
  { playerName: 'LightningBolt', kills: 423, deaths: 145, coins: 24300, playtime: 1800 },
]

const faqs = [
  { question: 'What is the server IP?', answer: 'The server IP is play.herossmp.xyz. You can copy it from the homepage. We support Minecraft Java Edition 1.20+.', category: 'General', order: 1 },
  { question: 'How do I claim land?', answer: 'Use a golden shovel to right-click two corners of your land to claim it. Each player starts with 1000 claim blocks. You can buy more in the store.', category: 'Gameplay', order: 2 },
  { question: 'How do I get a rank?', answer: 'Visit our store at herossmp.xyz/store and choose from our rank packages. All purchases are instant and permanent.', category: 'Store', order: 3 },
  { question: 'What payment methods are accepted?', answer: 'We use Razorpay for payments which supports UPI, credit/debit cards, net banking, and wallets. All prices include 18% GST.', category: 'Store', order: 4 },
  { question: 'Can I get a refund?', answer: 'Refunds are available within 24 hours of purchase if the item has not been delivered. Contact us via a support ticket with your payment ID.', category: 'Store', order: 5 },
  { question: 'How do I report a bug or player?', answer: 'Create a support ticket on our website. Choose the appropriate category (Bug Report or Player Report) and provide as much detail as possible.', category: 'Support', order: 6 },
  { question: 'Are there regular events?', answer: 'Yes! We host weekly PvP tournaments, monthly build competitions, and seasonal events. Watch our Discord and news page for announcements.', category: 'General', order: 7 },
  { question: 'What version of Minecraft is required?', answer: 'We support Java Edition 1.20 and above. Bedrock Edition is not currently supported.', category: 'General', order: 8 },
]

const settings = {
  key: 'global',
  serverIP: 'play.herossmp.xyz',
  leaderboardEnabled: true,
  maintenanceMode: false,
  discordLink: 'https://discord.gg/herossmp',
  storeEnabled: true,
}

// ── Run ────────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected!')

  console.log('🗑️  Clearing existing data...')
  await Promise.all([
    Product.deleteMany({}),
    Leaderboard.deleteMany({}),
    FAQ.deleteMany({}),
    SiteSettings.deleteMany({}),
  ])

  console.log('🌱 Seeding products...')
  await Product.insertMany(products)

  console.log('🌱 Seeding leaderboard...')
  await Leaderboard.insertMany(leaderboard)

  console.log('🌱 Seeding FAQs...')
  await FAQ.insertMany(faqs)

  console.log('🌱 Seeding site settings...')
  await SiteSettings.create(settings)

  console.log('✅ Seed complete!')
  console.log(`   - ${products.length} products`)
  console.log(`   - ${leaderboard.length} leaderboard entries`)
  console.log(`   - ${faqs.length} FAQs`)
  console.log('   - Site settings initialized')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
