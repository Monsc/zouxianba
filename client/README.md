# ZXB Client

This is the frontend application for the ZXB project, built with Vite + React.

## Prerequisites

- Node.js >= 16
- pnpm >= 8

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
pnpm dev
```

4. Build for production:
```bash
pnpm build
```

5. Preview production build:
```bash
pnpm preview
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── pages/         # Page components
  ├── hooks/         # Custom React hooks
  ├── services/      # API services
  ├── utils/         # Utility functions
  ├── contexts/      # React contexts
  ├── styles/        # Global styles
  ├── config/        # Configuration files
  ├── lib/           # Third-party library configurations
  ├── App.jsx        # Root component
  └── main.jsx       # Entry point
```

## Features

- Modern React with Hooks
- Vite for fast development and building
- TailwindCSS for styling
- ESLint + Prettier for code quality
- TypeScript support
- Socket.IO for real-time features
- State management with Zustand
- UI components from Headless UI and Radix UI

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 