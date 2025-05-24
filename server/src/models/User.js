const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: 'default-avatar.png',
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    location: {
      type: String,
      maxlength: 30,
      default: '',
    },
    website: {
      type: String,
      maxlength: 100,
      default: '',
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    // 安全相关字段
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockExpires: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lastLogin: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    // 双因素认证
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
    twoFactorBackupCodes: [String],
    // 会话管理
    activeSessions: [{
      token: String,
      device: String,
      ip: String,
      lastActive: Date,
      createdAt: Date,
    }],
    // 安全日志
    securityLogs: [{
      action: String,
      ip: String,
      device: String,
      timestamp: Date,
    }],
    handle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tokens: [{
      token: {
        type: String,
        required: true,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  if (!user.isModified('password')) return next();

  try {
    user.passwordChangedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Create indexes for search
userSchema.index({ username: 'text', handle: 'text' });
userSchema.index({ email: 1 });

// 检查密码是否在指定时间后更改
userSchema.methods.changedPasswordAfter = function(timestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return timestamp < changedTimestamp;
  }
  return false;
};

// 生成双因素认证密钥
userSchema.methods.generateTwoFactorSecret = async function() {
  const secret = speakeasy.generateSecret({
    name: `${process.env.TWO_FACTOR_ISSUER}:${this.email}`,
  });

  this.twoFactorSecret = secret.base32;
  this.twoFactorBackupCodes = Array.from({ length: 8 }, () => 
    Math.random().toString(36).substr(2, 10)
  );

  await this.save();

  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  return {
    secret: secret.base32,
    qrCode,
    backupCodes: this.twoFactorBackupCodes
  };
};

// 验证双因素认证码
userSchema.methods.verifyTwoFactorToken = function(token) {
  return speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: 'base32',
    token
  });
};

// 验证备用码
userSchema.methods.verifyBackupCode = async function(code) {
  const index = this.twoFactorBackupCodes.indexOf(code);
  if (index === -1) return false;

  this.twoFactorBackupCodes.splice(index, 1);
  await this.save();
  return true;
};

// 添加安全日志
userSchema.methods.addSecurityLog = async function(action, ip, device) {
  this.securityLogs.push({
    action,
    ip,
    device,
    timestamp: new Date()
  });

  // 只保留最近100条日志
  if (this.securityLogs.length > 100) {
    this.securityLogs = this.securityLogs.slice(-100);
  }

  await this.save();
};

// 添加活动会话
userSchema.methods.addSession = async function(token, device, ip) {
  this.activeSessions.push({
    token,
    device,
    ip,
    lastActive: new Date(),
    createdAt: new Date()
  });

  // 只保留最近10个会话
  if (this.activeSessions.length > 10) {
    this.activeSessions = this.activeSessions.slice(-10);
  }

  await this.save();
};

// 移除会话
userSchema.methods.removeSession = async function(token) {
  this.activeSessions = this.activeSessions.filter(session => session.token !== token);
  await this.save();
};

// 更新会话活动时间
userSchema.methods.updateSessionActivity = async function(token) {
  const session = this.activeSessions.find(s => s.token === token);
  if (session) {
    session.lastActive = new Date();
    await this.save();
  }
};

// Method to generate authentication token
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  return user;
};

// Static method to find user by credentials
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid login credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid login credentials');
  }

  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 