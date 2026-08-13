# color-basket

Visual palette generator for digital artists and designers. Extract colors from reference images, curate them into a set, and export the palette as an image.

## Stack

Electron + Vite (electron-vite), React 18/19, TypeScript (strict), Tailwind CSS v4, colorjs.io, Zustand, Lucide React, Anime.js v4.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the app in development
- `npm run build` — type-check and build
- `npm run typecheck` — type-check main, preload, and renderer
- `npm run lint` — lint the codebase
- `npm run format` — format with Prettier
- `npm run build:win` / `build:mac` / `build:linux` — package the app

## Structure

```
src/
  main/       # Electron main process (window, IPC, file system)
  preload/    # Typed contextBridge API exposed to the renderer
  renderer/   # React UI (src/App.tsx, store, types, components)
```
