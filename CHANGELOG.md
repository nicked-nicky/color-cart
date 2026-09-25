# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Migrated from Electron to **Tauri 2**. The Rust backend owns the file dialogs and only reads images the user picked or dropped, and only writes to the path chosen in the export dialog.
- Rebuilt the UI on **`@stella-componente/terra`**, replacing Tailwind CSS. The kit's components are used directly, and the new custom components follow the Terra wiki's conventions (CSS Modules plus `--stella-*` tokens, grades, `ButtonIsland`-only buttons).
- Export settings were rebuilt from new custom components (`SettingRow`, `SliderSetting`, `ChoiceIsland`, `ShapePicker`, `ColorField`, `ExportPreview`).
- Settings are now persisted with `tauri-plugin-store`. Appearance uses Terra's theme options: color scheme, rounding, density, border thickness and motion.
- Toasts now use Terra's `NotificationProvider`. Animations now use Terra's motion tokens instead of Anime.js.

### Added
- Drag-to-reorder palette swatches.
- Swatch menu, also opened by right-clicking, to copy HEX, RGB or OKLCH, or remove the swatch.
- Background option for exports: transparent, or a solid color.
- Outline color and opacity options for exports.
- Confirmation before clearing the palette.
- Notifications when picking a duplicate color, and when an export or copy fails.
- Unit tests for export helpers, color formatting and the palette store (Vitest), and for the backend's file-access rules (Rust).

### Removed
- Accent color settings (Terra has no accent hue by design).

### Fixed
- JPEG and WebP exports are now actually encoded in the chosen format. Previously they were PNG data saved with a `.jpg` or `.webp` extension.

## [1.0.1] - 2026-08-14

### Changed
- Renamed the project from **color-basket** to **color-cart** — package name, app ID (`com.nicked-nicky.colorcart`), window/taskbar title, and the default palette export filename (`color-cart-palette.png`).
- Repository moved to [gitlab.com/nicked-nicky/color-cart](https://gitlab.com/nicked-nicky/color-cart).

## [1.0.0] - 2026-08-13

First stable release.

### Added
- Click-to-pick color sampling from a reference image, with a loupe preview at the picked coordinate.
- Palette basket with drag-to-reorder, per-swatch HEX/RGB copy, and remove.
- Duplicate-color detection using CIE2000 Delta E (threshold ≤ 1).
- Export the palette as a PNG/JPEG/WebP card via HTML5 Canvas, with configurable dimensions, background, font, and labels, plus a live preview before saving.
- One-click copy of the rendered palette image to the clipboard.
- Cursor-anchored zoom (up to 1000%) and pan on the reference image, independent of picker coordinates.
- Drag-and-drop image loading.
- Frameless custom titlebar with window controls and app branding/icon.
- Settings modal with General, Navigator, Export, and Theme categories; settings persist across sessions.
- Light/dark theme with system accent color detection (custom accent color fallback).
- Toast notifications for picker/export feedback.
- App icon wired into the window/taskbar and into packaged Windows/macOS/Linux builds.
- Signed Windows installer (via `signtool.exe`) — no SmartScreen warnings.

### Changed
- Palette icon inverted via a `brightness(0)` filter in light theme for legibility.

### Fixed
- Preload path resolution and `window.api` guarding in the renderer.
- Zustand store update loop and JSX namespace issues under React 19.
- Reference images now served as data URLs instead of `file://`, fixing loads under the dev server origin.
