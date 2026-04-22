import mongoose, { Schema, Document, Model } from 'mongoose'

// ─── News ────────────────────────────────────────────────────────────────────
export interface INews extends Document {
  title: string
  content: string
  excerpt: string
  author: string
  tags: string[]
  image?: string
  createdAt: Date
}

const NewsSchema = new Schema<INews>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    excerpt: { type: String, default: '' },
    author: { type: String, required: true },
    tags: [String],
    image: String,
  },
  { timestamps: true }
)

export const News: Model<INews> = mongoose.models.News || mongoose.model<INews>('News', NewsSchema)

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export interface ILeaderboard extends Document {
  playerName: string
  kills: number
  deaths: number
  coins: number
  playtime: number
}

const LeaderboardSchema = new Schema<ILeaderboard>(
  {
    playerName: { type: String, required: true, unique: true },
    kills: { type: Number, default: 0 },
    deaths: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    playtime: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Leaderboard: Model<ILeaderboard> =
  mongoose.models.Leaderboard || mongoose.model<ILeaderboard>('Leaderboard', LeaderboardSchema)

// ─── FAQ ─────────────────────────────────────────────────────────────────────
export interface IFAQ extends Document {
  question: string
  answer: string
  category: string
  order: number
}

const FAQSchema = new Schema<IFAQ>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'General' },
  order: { type: Number, default: 0 },
})

export const FAQ: Model<IFAQ> = mongoose.models.FAQ || mongoose.model<IFAQ>('FAQ', FAQSchema)

// ─── SiteSettings ─────────────────────────────────────────────────────────────
export interface ISiteSettings extends Document {
  key: string
  serverIP: string
  leaderboardEnabled: boolean
  maintenanceMode: boolean
  discordLink: string
  storeEnabled: boolean
}

const SiteSettingsSchema = new Schema<ISiteSettings>({
  key: { type: String, default: 'global', unique: true },
  serverIP: { type: String, default: 'play.herossmp.xyz' },
  leaderboardEnabled: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  discordLink: { type: String, default: 'https://discord.gg/herossmp' },
  storeEnabled: { type: Boolean, default: true },
})

export const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema)
