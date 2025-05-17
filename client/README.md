# Twitter Clone Client

This is the frontend client for the Twitter Clone application, built with React and TypeScript.

## Features

- User authentication (login/signup)
- Create, read, update, and delete posts
- Like and comment on posts
- User profiles
- Real-time updates
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Create a `.env` file in the root directory with the following variables:
```
REACT_APP_API_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

The application will be available at http://localhost:3000.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── contexts/       # React contexts
  ├── pages/         # Page components
  ├── services/      # API services
  ├── styles/        # Global styles
  ├── types/         # TypeScript type definitions
  ├── utils/         # Utility functions
  ├── App.tsx        # Root component
  └── index.tsx      # Entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 