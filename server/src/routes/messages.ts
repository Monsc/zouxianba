import { Router } from 'express';
import { Request, Response } from '../types/express';
import { Message } from '../models/Message';
import { auth } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';

const router = Router();

// Get conversations
router.get('/conversations', auth, catchAsync(async (req: Request, res: Response) => {
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: req.user._id },
          { recipient: req.user._id }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$sender', req.user._id] },
            '$recipient',
            '$sender'
          ]
        },
        lastMessage: { $first: '$$ROOT' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        _id: 1,
        lastMessage: 1,
        user: {
          _id: 1,
          username: 1,
          handle: 1,
          avatar: 1
        }
      }
    }
  ]);

  return res.json(conversations);
}));

// Get messages with a user
router.get('/:userId', auth, catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, recipient: userId },
      { sender: userId, recipient: req.user._id }
    ]
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'username handle avatar')
    .populate('recipient', 'username handle avatar');

  return res.json(messages);
}));

// Send message
router.post('/:userId', auth, catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { content } = req.body;

  const message = await Message.create({
    sender: req.user._id,
    recipient: userId,
    content
  });

  await message.populate('sender', 'username handle avatar');
  await message.populate('recipient', 'username handle avatar');

  return res.status(201).json(message);
}));

export default router; 