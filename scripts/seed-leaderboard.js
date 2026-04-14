// Run: node scripts/seed-leaderboard.js
// Seeds leaderboard with demo players so the board shows data immediately

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const LeaderboardSchema = new mongoose.Schema({
  playerName: { type: String, required: true, unique: true },
  kills: { type: Number, default: 0 },
  deaths: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  playtime: { type: Number, default: 0 },
}, { timestamps: true })

const Leaderboard = mongoose.models.Leaderboard || mongoose.model('Leaderboard', LeaderboardSchema)

const demoPlayers = [
  { playerName: 'Notch',       kills: 4821, deaths: 12,  coins: 98420, playtime: 5420 },
  { playerName: 'Herobrine',   kills: 3902, deaths: 44,  coins: 72100, playtime: 4310 },
  { playerName: 'Dream',       kills: 3201, deaths: 78,  coins: 64850, playtime: 3950 },
  { playerName: 'Technoblade', kills: 2987, deaths: 3,   coins: 115000,playtime: 6100 },
  { playerName: 'xIsuma',      kills: 2450, deaths: 105, coins: 55200, playtime: 2800 },
  { playerName: 'GoodTimesWithScar', kills: 1980, deaths: 201, coins: 42000, playtime: 2200 },
  { playerName: 'Mumbo',       kills: 1450, deaths: 320, coins: 33500, playtime: 1850 },
  { playerName: 'Grian',       kills: 1200, deaths: 480, coins: 28000, playtime: 1600 },
  { playerName: 'PearlescentMoon', kills: 980, deaths: 210, coins: 21000, playtime: 1200 },
  { playerName: 'ImpulseSV',   kills: 750,  deaths: 180, coins: 18500, playtime: 980  },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')
  for (const p of demoPlayers) {
    await Leaderboard.findOneAndUpdate(
      { playerName: p.playerName },
      p,
      { upsert: true, new: true }
    )
    console.log('Upserted:', p.playerName)
  }
  await mongoose.disconnect()
  console.log('Done! Leaderboard seeded.')
}

seed().catch(console.error)
