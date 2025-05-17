import mongoose from 'mongoose'

export interface IPost extends mongoose.Document {
  author: mongoose.Types.ObjectId
  content: string
  images?: string[]
  likes: mongoose.Types.ObjectId[]
  comments: mongoose.Types.ObjectId[]
  shares: number
  createdAt: Date
  updatedAt: Date
}

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    images: [{
      type: String,
      trim: true,
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    }],
    shares: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// 索引
postSchema.index({ author: 1, createdAt: -1 })
postSchema.index({ content: 'text' })

export default mongoose.model<IPost>('Post', postSchema) 