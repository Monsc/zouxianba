import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' }, // 个人简介
  avatar: { type: String, default: '' }, // 头像URL
  login: { type: String, unique: true, sparse: true }, // 登录名
  // ... 其它字段 ...
}, { timestamps: true });

export default mongoose.model('User', UserSchema); 