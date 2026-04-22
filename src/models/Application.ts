import mongoose, { Schema, Document, Model } from 'mongoose'

export type QuestionType = 'MCQ' | 'QNA' | 'YES_NO' | 'RATING' | 'SHORT' | 'LONG'

export interface IQuestion {
  _id: mongoose.Types.ObjectId
  label: string
  type: QuestionType
  required: boolean
  options?: string[]  // for MCQ
  placeholder?: string
}

export interface IAnswer {
  questionId: mongoose.Types.ObjectId
  questionLabel: string
  answer: string
}

export interface IApplicationForm extends Document {
  title: string
  description: string
  slug: string  // e.g. "staff", "builder", "mod"
  role: string  // role granted if accepted
  questions: IQuestion[]
  isOpen: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface IApplicationSubmission extends Document {
  formId: mongoose.Types.ObjectId
  formTitle: string
  userId: string
  username: string
  answers: IAnswer[]
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  staffNote?: string
  createdAt: Date
  updatedAt: Date
}

const QuestionSchema = new Schema<IQuestion>({
  label: { type: String, required: true },
  type: { type: String, enum: ['MCQ', 'QNA', 'YES_NO', 'RATING', 'SHORT', 'LONG'], default: 'SHORT' },
  required: { type: Boolean, default: true },
  options: [String],
  placeholder: String,
}, { _id: true })

const AnswerSchema = new Schema<IAnswer>({
  questionId: Schema.Types.ObjectId,
  questionLabel: String,
  answer: String,
}, { _id: false })

const ApplicationFormSchema = new Schema<IApplicationForm>({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  slug: { type: String, required: true, unique: true },
  role: { type: String, default: 'USER' },
  questions: [QuestionSchema],
  isOpen: { type: Boolean, default: true },
  createdBy: String,
}, { timestamps: true })

const ApplicationSubmissionSchema = new Schema<IApplicationSubmission>({
  formId: { type: Schema.Types.ObjectId, ref: 'ApplicationForm', required: true },
  formTitle: String,
  userId: { type: String, required: true },
  username: { type: String, required: true },
  answers: [AnswerSchema],
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
  staffNote: String,
}, { timestamps: true })

export const ApplicationForm: Model<IApplicationForm> =
  mongoose.models.ApplicationForm || mongoose.model<IApplicationForm>('ApplicationForm', ApplicationFormSchema)

export const ApplicationSubmission: Model<IApplicationSubmission> =
  mongoose.models.ApplicationSubmission || mongoose.model<IApplicationSubmission>('ApplicationSubmission', ApplicationSubmissionSchema)
