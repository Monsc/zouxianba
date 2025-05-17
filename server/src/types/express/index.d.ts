import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Document } from 'mongoose';

export interface Request extends ExpressRequest {
  user?: any;
}

export interface Response extends ExpressResponse {}

export interface UserDocument extends Document {
  username: string;
  handle: string;
  avatar: string;
  email: string;
  password: string;
  bio?: string;
  followers: string[];
  following: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PostDocument extends Document {
  author: string;
  content: string;
  media: string[];
  likes: string[];
  comments: string[];
  reposts: string[];
  createdAt: Date;
  updatedAt: Date;
  originalPost?: string;
} 