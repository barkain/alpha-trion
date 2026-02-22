# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | TypeScript check (`tsc -b`) + Vite production build |
| `npm run lint` | ESLint (flat config, ESLint 9) |
| `npm run preview` | Serve production build locally |

No test framework is configured.

## Tech Stack

React 19 + TypeScript 5.9 + Vite 7. 3D rendering via Three.js / React Three Fiber / drei. State management with Zustand (single flat store). Animations with Framer Motion. Styling via CSS Modules (`screens.module.css`) + global CSS. Claude API (Sonnet) for dynamic question and scene generation.

## Architecture

**Screen-based navigation** — no router library. The Zustand store holds a `screen: ScreenId` field that drives a flat state machine in `App.tsx`:

```
nameInput → story (3 steps) → map → charIntro → loading → question → levelComplete → map
                                                                     → gameComplete (final world)
```

**Single Zustand store** (`stores/gameStore.ts`) — all game state in one flat store, no slices/middleware/persistence. Components read state via `useGameStore((s) => s.field)` selector pattern.

**AI integration** (`services/api.ts`) — direct browser fetch to `api.anthropic.com/v1/messages`. Two endpoints: `generateQuestions()` for quiz content, `generateScene()` for 3D scene descriptions. Both return JSON parsed from Claude responses. `useWorldLoader` hook fires both in parallel via `Promise.all`.

**3D pipeline** — `WorldScene.tsx` composes the R3F Canvas (fixed camera, auto-rotate, shadows). AI-generated `GeneratedScene` objects are mapped through `SceneObjectMesh.tsx`, a procedural geometry factory supporting 9 object types (tree, rock, crystal, book, tower, orb, mushroom, pillar, arch) with 4 animation types (float, rotate, pulse, sway). `MagicFog` particles decrease opacity as `fogStrength` drops with correct answers.

**Game domain** — 5 worlds with unique NPC characters, 4 question categories (math, symbols, words, patterns). World 5 mixes all categories. Config-driven: `config/worlds.ts` and `config/characters.ts` define all content. AI prompts in `config/prompts.ts`.

## Code Conventions

- All content is **Hebrew with RTL layout** (`direction: rtl` on root div)
- **Named exports** throughout (no default exports except App)
- **`export function ComponentName()`** for React components (named function declarations)
- **`type` keyword** for type imports (enforced by `verbatimModuleSyntax`)
- Components read from Zustand store directly — no prop drilling
- **Barrel exports** via `index.ts` in `types/`, `config/`, `components/screens/`
- **PascalCase** files for components, **camelCase** for non-components
- **UPPER_SNAKE_CASE** for config constants (`WORLDS`, `CHARACTERS`)
- **camelCase** for CSS Module classes (`centeredScreen`, `goldBtn`)
- Google Fonts: Rubik (body), Secular One (titles), Heebo (story/dialog)
- Glassmorphism design: backdrop-filter blur, semi-transparent backgrounds, gold accents (#FFD700, #FFA500), dark purple/blue gradients
