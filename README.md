# German Learning App

An AI-powered German language learning app built with React and the Anthropic API. Practice German through dynamic conversations, contextual exercises, and adaptive feedback, all generated live by Claude.

## What it does

- Generates German exercises tailored to your level
- Gives instant feedback on grammar and vocabulary
- Adapts difficulty based on your responses
- Covers conversation practice, grammar drills, and vocabulary building

## Tech Stack

| Layer            | Technology                  |
|------------------|-----------------------------|
| Frontend         | React, Vite, Tailwind CSS   |
| State Management | Zustand                     |
| Backend          | Node.js (API proxy)         |
| AI               | Anthropic API (Claude)      |

## Getting Started

### Prerequisites

- Node.js 18+
- An Anthropic API key ([get one here](https://console.anthropic.com/))

### Installation

```bash
# Clone the repo
git clone https://github.com/SherwanAli0/German-App.git
cd German-App

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Start the backend proxy
cd server
npm install
node index.js

# In a new terminal, start the frontend
cd ..
npm run dev
```

The app runs at `http://localhost:5173`

## Project Structure

```
German-App/
├── src/
│   ├── components/     # React components
│   ├── store/          # Zustand state management
│   └── App.jsx         # Main app
├── server/
│   └── index.js        # Node.js proxy for Anthropic API
└── README.md
```

## Why a proxy server?

The Node.js backend keeps your Anthropic API key off the client. All requests go through `localhost:3001` which forwards them to the Anthropic API server-side.

## Built by

[Sherwan Ali](https://github.com/SherwanAli0)
