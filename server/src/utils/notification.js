const Notification = require('../models/Notification');
const User = require('../models/User');
const io = require('../socket');

// 创建通知
const createNotification = async ({
  recipient,
  sender,
  type,
  post = null,
  comment = null
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      post,
      comment
    });

    // 获取发送者信息
    const senderInfo = await User.findById(sender).select('username avatar');
    notification.sender = senderInfo;

    // 通过 WebSocket 发送实时通知
    io.to(recipient.toString()).emit('notification', notification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// 发送点赞通知
const sendLikeNotification = async (post, liker) => {
  if (post.author.toString() === liker.toString()) return;

  return createNotification({
    recipient: post.author,
    sender: liker,
    type: 'like',
    post: post._id
  });
};

// 发送评论通知
const sendCommentNotification = async (post, comment, commenter) => {
  if (post.author.toString() === commenter.toString()) return;

  return createNotification({
    recipient: post.author,
    sender: commenter,
    type: 'comment',
    post: post._id,
    comment: comment._id
  });
};

// 发送关注通知
const sendFollowNotification = async (followed, follower) => {
  return createNotification({
    recipient: followed,
    sender: follower,
    type: 'follow'
  });
};

// 发送提及通知
const sendMentionNotification = async (post, mentionedUser, mentioner) => {
  if (mentionedUser.toString() === mentioner.toString()) return;

  return createNotification({
    recipient: mentionedUser,
    sender: mentioner,
    type: 'mention',
    post: post._id
  });
};

// 发送转发通知
const sendRepostNotification = async (post, reposter) => {
  if (post.author.toString() === reposter.toString()) return;

  return createNotification({
    recipient: post.author,
    sender: reposter,
    type: 'repost',
    post: post._id
  });
};

// 发送系统通知
const sendSystemNotification = async (recipient, message) => {
  return createNotification({
    recipient,
    sender: process.env.SYSTEM_USER_ID,
    type: 'system',
    message
  });
};

module.exports = {
  createNotification,
  sendLikeNotification,
  sendCommentNotification,
  sendFollowNotification,
  sendMentionNotification,
  sendRepostNotification,
  sendSystemNotification
}; 