# AI-Powered Video Interview Platform

A full-stack web application for conducting AI-driven video interviews with automated scoring and feedback.

## Features

- 🔐 Email-based authentication
- 🎯 Domain-specific interviews (Technology, Marketing, Sales, HR, Finance, Data Science)
- ⏱️ Configurable interview duration (5, 10, 15, 30 minutes)
- 🎥 Full-screen video interview mode
- 🤖 AI-powered question generation and evaluation
- 📊 Automated scoring and feedback
- 🔒 Security features (tab switching prevention, copy/paste disabled)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Framer Motion
- **Backend**: Node.js, Express
- **AI**: OpenAI API (for questions and evaluation)
- **Authentication**: JWT-based auth

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Installation

1. Install dependencies:
```bash
npm install
```

2. **Configure OpenAI (for detailed AI evaluation):**
   - Get an API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Create a **`.env`** file in the project root (same folder as `package.json`):
   ```
   OPENAI_API_KEY=sk-proj-your_actual_key_here
   JWT_SECRET=your_jwt_secret_here
   API_URL=http://localhost:5000
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
   - The **backend** reads `.env` when you run `npm run server`. Without the key, the app runs with fallback (template questions and basic scoring). See **docs/OPENAI_SETUP.md** for full steps.

3. Run the development server:
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run server
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── interview/         # Interview flow pages
│   └── results/           # Results page
├── components/            # React components
├── lib/                   # Utilities and helpers
├── server/                # Backend API
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   └── services/         # AI services
└── types/                # TypeScript types
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | For AI features | Your OpenAI API key. Enables AI question generation and detailed evaluation. Get it from [platform.openai.com/api-keys](https://platform.openai.com/api-keys). Without it, the app uses template questions and basic scoring. |
| `JWT_SECRET` | Yes | Secret key for JWT tokens (auth). |
| `API_URL` | No | Backend API URL (default: `http://localhost:5000`). |
| `NEXT_PUBLIC_API_URL` | No | Same as API_URL for frontend requests. |

**Full setup guide:** [docs/OPENAI_SETUP.md](docs/OPENAI_SETUP.md)

## License

MIT
