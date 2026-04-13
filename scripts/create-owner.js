/**
 * Create owner account — run once:  node scripts/create-owner.js
 * Requires MONGODB_URI in .env.local
 *
 * Usage: OWNER_EMAIL=admin@herossmp.xyz OWNER_USERNAME=HerosAdmin OWNER_PASSWORD=secure123 node scripts/create-owner.js
 */
require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1) }

const username = process.env.OWNER_USERNAME || 'HerosAdmin'
const email = process.env.OWNER_EMAIL || 'admin@herossmp.xyz'
const password = process.env.OWNER_PASSWORD || 'ChangeMe123!'

const UserSchema = new mongoose.Schema({
  username: String, email: String, password: String,
  role: { type: String, default: 'USER' }
}, { timestamps: true })

const User = mongoose.model('User', UserSchema)

async function createOwner() {
  console.log('🔐 Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI)

  const existing = await User.findOne({ $or: [{ email }, { username }] })
  if (existing) {
    console.log('⚠️  User already exists. Updating role to OWNER...')
    await User.updateOne({ $or: [{ email }, { username }] }, { role: 'OWNER' })
    console.log(`✅ ${existing.username} is now OWNER`)
  } else {
    const hashed = await bcrypt.hash(password, 12)
    await User.create({ username, email, password: hashed, role: 'OWNER' })
    console.log(`✅ Owner created: ${username} (${email})`)
    console.log(`   Password: ${password}`)
    console.log('   ⚠️  Change this password after first login!')
  }

  await mongoose.disconnect()
  process.exit(0)
}

createOwner().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
