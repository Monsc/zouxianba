const mongoose = require('mongoose');

const userRelationshipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['follow', 'friend', 'block', 'mention', 'interaction'],
    required: true
  },
  weight: {
    type: Number,
    default: 1
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  }
}, {
  timestamps: true
});

// 复合索引
userRelationshipSchema.index({ user: 1, relatedUser: 1, type: 1 }, { unique: true });
userRelationshipSchema.index({ type: 1, weight: -1 });

// 方法
userRelationshipSchema.methods.increaseWeight = async function(amount = 1) {
  this.weight += amount;
  await this.save();
};

userRelationshipSchema.methods.decreaseWeight = async function(amount = 1) {
  this.weight = Math.max(0, this.weight - amount);
  await this.save();
};

// 静态方法
userRelationshipSchema.statics.getUserRelationships = async function(userId, type, limit = 20) {
  return this.find({ user: userId, type })
    .sort({ weight: -1 })
    .limit(limit)
    .populate('relatedUser', 'username avatar');
};

userRelationshipSchema.statics.getMutualConnections = async function(userId1, userId2) {
  const user1Relationships = await this.find({ user: userId1 })
    .select('relatedUser type');
  const user2Relationships = await this.find({ user: userId2 })
    .select('relatedUser type');

  const mutualConnections = user1Relationships.filter(r1 =>
    user2Relationships.some(r2 =>
      r2.relatedUser.toString() === r1.relatedUser.toString()
    )
  );

  return mutualConnections;
};

userRelationshipSchema.statics.getRelationshipStrength = async function(userId1, userId2) {
  const relationships = await this.find({
    $or: [
      { user: userId1, relatedUser: userId2 },
      { user: userId2, relatedUser: userId1 }
    ]
  });

  return relationships.reduce((strength, rel) => strength + rel.weight, 0);
};

const UserRelationship = mongoose.model('UserRelationship', userRelationshipSchema);

module.exports = UserRelationship; 