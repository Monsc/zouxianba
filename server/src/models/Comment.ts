import mongoose from 'mongoose'

export interface IComment extends mongoose.Document {
  author: mongoose.Types.ObjectId
  post: mongoose.Types.ObjectId
  content: string
  parent?: mongoose.Types.ObjectId
  likes: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
)

// 索引
commentSchema.index({ post: 1, createdAt: -1 })
commentSchema.index({ author: 1, createdAt: -1 })

export default mongoose.model<IComment>('Comment', commentSchema) 