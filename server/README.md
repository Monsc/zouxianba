# Twitter Clone Backend

This is the backend server for the Twitter clone application. It provides a RESTful API for user authentication, posts, comments, and user interactions.

## Features

- User authentication (register, login, profile management)
- Post creation, editing, and deletion
- Comments and replies
- Like/unlike posts
- Follow/unfollow users
- User search
- Privacy settings
- Feed with posts from followed users

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/twitter-clone
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm start
   ```

For development with hot reload:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- PATCH `/api/auth/me` - Update user profile
- POST `/api/auth/change-password` - Change password
- DELETE `/api/auth/me` - Delete account

### Posts
- GET `/api/posts/feed` - Get feed posts
- GET `/api/posts/user/:userId` - Get user posts
- POST `/api/posts` - Create post
- GET `/api/posts/:postId` - Get post by ID
- PATCH `/api/posts/:postId` - Update post
- DELETE `/api/posts/:postId` - Delete post
- POST `/api/posts/:postId/like` - Like/unlike post
- POST `/api/posts/:postId/comments` - Add comment
- GET `/api/posts/:postId/comments` - Get post comments

### Users
- GET `/api/users/:userId` - Get user profile
- GET `/api/users/search/:query` - Search users
- POST `/api/users/:userId/follow` - Follow/unfollow user
- GET `/api/users/:userId/followers` - Get user followers
- GET `/api/users/:userId/following` - Get user following
- PATCH `/api/users/privacy` - Update privacy settings
- GET `/api/users/suggestions` - Get suggested users

## Error Handling

The API uses a consistent error response format:
```json
{
  "status": "error",
  "message": "Error message"
}
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Input validation and sanitization
- Rate limiting (to be implemented)
- CORS enabled

## Development

To run tests:
```bash
npm test
```

## License

MIT 