import mongoose from 'mongoose'

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null } | undefined
}

async function connectDB(): Promise<mongoose.Connection> {
  const MONGODB_URI = process.env.MONGODB_URI

  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not defined. Add it to your Vercel environment variables or .env.local file.'
    )
  }

  if (!global._mongoose) {
    global._mongoose = { conn: null, promise: null }
  }

  const cached = global._mongoose

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
      })
      .then((m) => m.connection)
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
