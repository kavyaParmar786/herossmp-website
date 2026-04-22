export interface User {
  _id: string
  username: string
  email: string
  role: 'USER' | 'STAFF' | 'ADMIN' | 'OWNER'
  provider?: 'email' | 'google' | 'discord' | 'twitter'
  avatar?: string
  createdAt: string
}

export interface Product {
  _id: string
  name: string
  price: number
  category: 'RANKS' | 'KEYS' | 'MONEY' | 'COINS' | 'LANDCLAIM' | 'PACKS'
  features: string[]
  description: string
  image?: string
  images?: string[]
  popular?: boolean
  color?: string
  createdAt: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  _id: string
  userId: string
  username: string
  items: CartItem[]
  totalAmount: number
  gstAmount: number
  finalAmount: number
  paymentId: string
  razorpayOrderId: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: string
}

export interface Ticket {
  _id: string
  userId: string
  username: string
  subject: string
  category: 'BUG' | 'PAYMENT' | 'REPORT' | 'GENERAL'
  status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS'
  messages: TicketMessage[]
  createdAt: string
  updatedAt: string
}

export interface TicketMessage {
  _id: string
  userId: string
  username: string
  role: string
  content: string
  createdAt: string
}

export interface News {
  _id: string
  title: string
  content: string
  excerpt: string
  author: string
  tags: string[]
  image?: string
  images?: string[]
  createdAt: string
}

export interface LeaderboardEntry {
  _id: string
  playerName: string
  kills: number
  deaths: number
  coins: number
  playtime: number
  rank: number
}

export interface FAQ {
  _id: string
  question: string
  answer: string
  category: string
  order: number
}

export interface SiteSettings {
  serverIP: string
  leaderboardEnabled: boolean
  maintenanceMode: boolean
  discordLink: string
  storeEnabled: boolean
}

export interface ServerStatus {
  online: boolean
  players: {
    online: number
    max: number
    list: string[]
  }
  motd: string
  version: string
  ip: string
}

export type QuestionType = 'MCQ' | 'QNA' | 'YES_NO' | 'RATING' | 'SHORT' | 'LONG'

export interface ApplicationQuestion {
  _id: string
  label: string
  type: QuestionType
  required: boolean
  options?: string[]
  placeholder?: string
}

export interface ApplicationFormType {
  _id: string
  title: string
  description: string
  slug: string
  role: string
  questions: ApplicationQuestion[]
  isOpen: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ApplicationAnswer {
  questionId: string
  questionLabel: string
  answer: string
}

export interface ApplicationSubmissionType {
  _id: string
  formId: string
  formTitle: string
  userId: string
  username: string
  answers: ApplicationAnswer[]
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  staffNote?: string
  createdAt: string
  updatedAt: string
}

export type QuestionType = 'MCQ' | 'QNA' | 'YES_NO' | 'RATING' | 'SHORT' | 'LONG'

export interface ApplicationQuestion {
  _id: string
  label: string
  type: QuestionType
  required: boolean
  options?: string[]
  placeholder?: string
}

export interface ApplicationForm {
  _id: string
  title: string
  description: string
  slug: string
  role: string
  questions: ApplicationQuestion[]
  isOpen: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ApplicationAnswer {
  questionId: string
  questionLabel: string
  answer: string
}

export interface ApplicationSubmission {
  _id: string
  formId: string
  formTitle: string
  userId: string
  username: string
  answers: ApplicationAnswer[]
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  staffNote?: string
  createdAt: string
  updatedAt: string
}
