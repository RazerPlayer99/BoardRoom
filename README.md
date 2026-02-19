# BoardRoom

A local-first multi-agent "boardroom" web app where you act as CEO and AI agents collaborate in a group chat with distinct roles.

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Zustand (in-memory state)
- OpenAI + Anthropic provider calls via server routes

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build Plan

- **Step 1**: Project scaffold + chat UI shell + local message store (current)
- **Step 2**: Agent configs + system prompts + mock responses
- **Step 3**: Server routes + real provider calls + streaming
- **Step 4**: Conversation Manager + ping agent + mode toggles
