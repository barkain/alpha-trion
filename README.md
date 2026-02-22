<!-- MAIN_IMAGE_PLACEHOLDER -->

# Alpha Trion

Interactive 3D educational game for gifted program test preparation (Grade 2, Israel).

## Setup

```bash
cp .env.example .env
# Edit .env with your API key
npm install
npm run dev
```

## AI Provider Configuration

The app auto-detects which AI provider to use based on your environment variables.

**Environment Variables:**

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_AI_API_KEY` | Yes | API key for any supported provider |
| `VITE_AI_BASE_URL` | No | Base URL for the AI endpoint |
| `VITE_AI_MODEL` | No | Override default model |

**Auto-detection logic (3 tiers):**

1. Key starts with `sk-ant-` → Direct Anthropic API (default model: `claude-sonnet-4-6`)
2. Base URL contains "anthropic" → Anthropic-format proxy like z.ai (default model: `gpt-4o-mini`)
3. Everything else → OpenAI-compatible (default model: `gpt-4o-mini`)

**Example configs:**

Direct Anthropic:
```env
VITE_AI_API_KEY=sk-ant-...
```

OpenAI:
```env
VITE_AI_API_KEY=sk-...
```

z.ai or other Anthropic proxy:
```env
VITE_AI_API_KEY=your-zai-key
VITE_AI_BASE_URL=https://api.z.ai/api/anthropic
VITE_AI_MODEL=GLM-4.7
```

## Architecture

```
src/
├── types/           # TypeScript domain types
│   └── game.ts      # Question, World, Character, SceneObject, etc.
├── config/          # Static configuration (no logic)
│   ├── characters.ts  # 5 NPC characters with dialog trees
│   ├── worlds.ts      # 5 worlds with 3D scene configs
│   └── prompts.ts     # AI prompts for questions & scene generation
├── stores/          # Zustand state management
│   └── gameStore.ts   # Single source of truth for all game state
├── services/        # External API calls
│   └── api.ts         # Claude API — question gen + scene gen (parallel)
├── hooks/           # Custom React hooks
│   └── useWorldLoader.ts  # Orchestrates loading questions + 3D scene
├── utils/           # Pure utility functions
│   └── helpers.ts
├── components/
│   ├── screens/     # UI screens (2D overlay)
│   │   ├── NameInputScreen.tsx
│   │   ├── StoryScreen.tsx
│   │   ├── MapScreen.tsx
│   │   ├── CharIntroScreen.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── QuestionScreen.tsx
│   │   ├── CompletionScreens.tsx
│   │   └── screens.module.css
│   └── 3d/          # Three.js / R3F components
│       ├── scenes/
│       │   └── WorldScene.tsx    # Main 3D canvas — composes everything
│       ├── objects/
│       │   ├── SceneObjectMesh.tsx  # Procedural object factory
│       │   └── Ground.tsx
│       └── effects/
│           ├── MagicFog.tsx         # Volumetric fog (thins on correct answers)
│           └── FloatingParticles.tsx # Firefly particles
├── App.tsx          # Root — screen router + 3D background toggle
├── main.tsx         # Entry point
└── index.css        # Global styles + font imports
```

## Stack

- **React 18** + TypeScript
- **React Three Fiber** (R3F) + **drei** — declarative 3D
- **Zustand** — lightweight state management
- **Framer Motion** — screen transitions + micro-animations
- **Claude API** (Sonnet) — dynamic question + scene generation

## Key Design Decisions

1. **AI-Generated 3D Scenes**: Each world sends a scene prompt to Claude, which returns a JSON array of typed `SceneObject`s. These are rendered procedurally via `SceneObjectMesh` — a factory that maps object types to Three.js geometries with animations.

2. **Fog as Progress Metaphor**: The "Fog of Forgetfulness" (`MagicFog`) is tied to `fogStrength` in the store. Each correct answer reduces it — the 3D world literally clears up as the child succeeds.

3. **Parallel Loading**: `useWorldLoader` fires question generation and scene generation simultaneously via `Promise.all`.

4. **Character System**: Each world has an NPC with personality-specific dialog for greetings, correct/wrong responses, loading messages, and story intros.

5. **CSS Modules**: All screen styles are scoped via `screens.module.css` to avoid global conflicts with R3F canvas.

## Extending

- **Add a world**: Add entry to `config/worlds.ts` + character to `config/characters.ts`
- **New 3D object type**: Add to `SceneObject["type"]` union in `types/game.ts` + geometry case in `SceneObjectMesh.tsx`
- **New question category**: Add to `CategoryId` type + `QUESTION_PROMPTS`
- **Sound effects**: Add a `services/audio.ts` using Web Audio API, hook into `answerQuestion` action
