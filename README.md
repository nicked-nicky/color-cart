# color-basket

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Electron](https://img.shields.io/badge/Electron-43-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)

Visual palette generator for digital artists and designers. Extract colors from reference images, curate them into a set, and export the palette as an image.

## Features

- Click-to-pick color sampling from a reference image, with a loupe preview.
- Palette basket with drag-to-reorder, duplicate detection (CIE2000 Delta E), and per-swatch HEX/RGB copy.
- Cursor-anchored zoom (up to 1000%) and pan, independent of picker coordinates.
- Export the palette as a PNG/JPEG/WebP card via HTML5 Canvas, with configurable dimensions, background, font, and labels — or copy it straight to the clipboard.
- Light/dark theme with system accent color detection.

## Stack

Electron + Vite (electron-vite), React 19, TypeScript (strict), Tailwind CSS v4, colorjs.io, Zustand, Lucide React, Anime.js v4.

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
resources/
  icon.png    # Source app icon (window/taskbar + packaged builds)
```

## Releases

Windows builds are signed with `signtool.exe`. See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## License

[MIT](./LICENSE)
