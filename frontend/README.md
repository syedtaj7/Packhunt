# Package Compass - Frontend

React + Vite frontend application for the Package Compass platform.

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in this directory:

```env
VITE_API_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Development

```bash
npm run dev
```

The application will be available at http://localhost:8080

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable React components
│   │   └── ui/         # Shadcn/ui components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and configurations
│   ├── pages/          # Page components
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── public/             # Static assets
└── index.html          # HTML template
```

## Technology Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn/ui
- React Router
- TanStack Query
- Firebase Authentication
- Lucide React Icons

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm start` - Alias for `npm run dev`
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally
