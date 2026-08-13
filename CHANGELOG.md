# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
