import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../src/models/User'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zouxianba'

async function createAdmin() {
  await mongoose.connect(MONGODB_URI)
  const password = await bcrypt.hash('admin123456', 10)
  const user = await User.findOneAndUpdate(
    { email: 'admin@zouxianba.com' },
    {
      username: 'admin',
      email: 'admin@zouxianba.com',
      password,
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
    { upsert: true, new: true }
  )
  console.log('Admin created/updated:', user)
  await mongoose.disconnect()
}

createAdmin() 