# color-cart

![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-2021-000000?logo=rust&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)

Visual palette generator for digital artists and designers. Extract colors from reference images, curate them into a set, and export the palette as an image.

## Features

- Click-and-hold color sampling from a reference image, with a magnifier loupe.
- Palette with drag-to-reorder, duplicate detection (CIE2000 Delta E), and per-swatch HEX / RGB / OKLCH copy.
- Cursor-anchored zoom (up to 1000%), middle-mouse pan, and a minimap navigator.
- Export the palette as PNG, JPEG or WebP — shape, size, rotation, skew, spacing, outline and background are all configurable, with a live preview — or copy it straight to the clipboard.
- Light / dark / system color scheme plus rounding, density, border and motion preferences.

## Stack

Tauri 2 (Rust), Vite, React 19, TypeScript (strict), [`@stella-componente/terra`](https://github.com/nicked-nicky/stella-componente) with CSS Modules, colorjs.io, Zustand, Lucide React.

## Getting started

Install the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your platform (Rust, plus WebKitGTK 4.1 on Linux), then:

```bash
npm install
npm run dev
```

`npm run dev:web` runs the UI alone in a browser, with browser fallbacks for file access.

## Scripts

- `npm run dev` — start the desktop app in development
- `npm run build` — build and bundle the desktop app for the current platform
- `npm run typecheck` — type-check the frontend
- `npm run lint` — lint the frontend
- `npm test` — run the frontend unit tests
- `npm run format` / `format:check` — format with Prettier
- `cargo test --manifest-path src-tauri/Cargo.toml` — run the Rust unit tests

## Structure

```
src/                 # React UI
  components/        # atoms / molecules / organisms, one folder per component
  hooks/             # zoom/pan, color picking, drag reorder, file drops
  lib/               # export rendering, color naming/formatting
  store/             # Zustand stores (palette, image, settings)
  platform.ts        # Tauri bridge (with browser fallbacks)
src-tauri/           # Rust backend: file dialogs, scoped file access, window config
  capabilities/      # Permissions granted to the webview
  icons/             # Generated app icons
resources/
  icon.png           # Source app icon
```

Custom components follow the [Terra wiki's conventions](https://github.com/nicked-nicky/stella-componente/blob/main/WIKI.md#writing-new-components): a `Component.tsx` / `Component.module.css` / `index.ts` folder, styling only through `--stella-*` tokens (grade-indirected colors), a `data-stella-grade` root, a `data-stella-component` hook, and buttons only inside a `ButtonIsland`.

## Releases

Windows builds are signed through the Tauri bundler: set `bundle.windows.certificateThumbprint` in `src-tauri/tauri.conf.json` before `npm run build`. See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## License

[MIT](./LICENSE)
