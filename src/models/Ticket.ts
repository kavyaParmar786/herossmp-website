import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITicketMessage {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  username: string
  role: string
  content: string
  createdAt: Date
}

export interface ITicket extends Document {
  userId: mongoose.Types.ObjectId
  username: string
  subject: string
  category: 'BUG' | 'PAYMENT' | 'REPORT' | 'GENERAL'
  status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS'
  messages: ITicketMessage[]
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<ITicketMessage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    username: String,
    role: String,
    content: String,
  },
  { timestamps: true }
)

const TicketSchema = new Schema<ITicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    subject: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['BUG', 'PAYMENT', 'REPORT', 'GENERAL'],
      default: 'GENERAL',
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'IN_PROGRESS'],
      default: 'OPEN',
    },
    messages: [MessageSchema],
  },
  { timestamps: true }
)

const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema)
export default Ticket
