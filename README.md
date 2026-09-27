<div align="center">

<img src="resources/icon.png" alt="color-cart" width="128" />

# color-cart

Pick colors from any image and export them as a palette picture.

**English** · [Русский](README.ru.md)

[![Latest release](https://img.shields.io/github/v/release/nicked-nicky/color-cart)](https://github.com/nicked-nicky/color-cart/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/nicked-nicky/color-cart/total)](https://github.com/nicked-nicky/color-cart/releases)
![Platforms](https://img.shields.io/badge/platforms-Windows%20%7C%20Linux-lightgrey)
[![License](https://img.shields.io/github/license/nicked-nicky/color-cart)](LICENSE)

</div>

## Features

- **Color sampling.** Click and hold on a reference image to pick a color, with a magnifier loupe for precision.
- **Palette.** Drag swatches to reorder them, copy any swatch as HEX, RGB or OKLCH, and get warned about near-duplicate colors (CIE2000 ΔE).
- **Navigation.** Cursor-anchored zoom up to 1000%, middle-mouse panning and a minimap navigator.
- **Export.** Save the palette as PNG, JPEG or WebP, or copy it straight to the clipboard. Swatch shape, size, rotation, skew, spacing, outline and background are all configurable, with a live preview.
- **Appearance.** Light, dark or system color scheme, plus rounding, density, border and motion settings.

## Installation

Download the file for your system from the [latest release](https://github.com/nicked-nicky/color-cart/releases/latest).

| System | File |
| --- | --- |
| Windows 10 / 11 (x64) | `color-cart_<version>_x64-setup.exe` |
| Debian, Ubuntu, Linux Mint, Pop!_OS | `color-cart_<version>_amd64.deb` |
| Fedora, RHEL, Rocky, AlmaLinux, openSUSE | `color-cart-<version>-1.x86_64.rpm` |
| Any other distro (Arch, Manjaro, NixOS, …) | `color-cart_<version>_amd64.AppImage` |

The commands below use version `2.0.0`. Replace it with the version you downloaded.

### Windows

1. Download `color-cart_2.0.0_x64-setup.exe`.
2. Run it and follow the installer. It installs for the current user, so no administrator rights are needed.
3. Start **color-cart** from the Start menu.

The app runs on Microsoft Edge WebView2, which is built into Windows 10 and 11. If it's missing, the installer downloads it automatically.

If Windows SmartScreen shows a warning, click **More info → Run anyway**.

To uninstall, go to **Settings → Apps → Installed apps**, find color-cart and click **Uninstall**.

### Debian, Ubuntu and derivatives

Requires Debian 12+, Ubuntu 22.04+ or a distro based on them.

```bash
sudo apt install ./color-cart_2.0.0_amd64.deb
```

Installing with `apt` (not `dpkg -i`) pulls in the required dependencies (`libwebkit2gtk-4.1-0`, `libgtk-3-0`) automatically.

To uninstall:

```bash
sudo apt remove color-cart
```

### Fedora, RHEL and derivatives

```bash
sudo dnf install ./color-cart-2.0.0-1.x86_64.rpm
```

To uninstall:

```bash
sudo dnf remove color-cart
```

### openSUSE

```bash
sudo zypper install --allow-unsigned-rpm ./color-cart-2.0.0-1.x86_64.rpm
```

To uninstall:

```bash
sudo zypper remove color-cart
```

### AppImage (any distro)

The AppImage is a single portable file and needs no installation:

```bash
chmod +x color-cart_2.0.0_amd64.AppImage
./color-cart_2.0.0_amd64.AppImage
```

AppImages need FUSE 2. If the app doesn't start, install it:

| Distro | Command |
| --- | --- |
| Arch, Manjaro | `sudo pacman -S fuse2` |
| Ubuntu 24.04+ | `sudo apt install libfuse2t64` |
| Ubuntu 22.04, Debian | `sudo apt install libfuse2` |
| Fedora | `sudo dnf install fuse-libs` |

To add it to your app menu, use a tool like [Gear Lever](https://flathub.org/apps/it.mijorus.gearlever) or [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher).

To uninstall, delete the file.

### macOS

No macOS builds are published yet. You can [build from source](#building-from-source).

## Building from source

Install the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your platform (Rust, plus WebKitGTK 4.1 on Linux) and Node.js 20.19 or newer, then:

```bash
git clone https://github.com/nicked-nicky/color-cart.git
cd color-cart
npm install
npm run dev
```

`npm run build` bundles the app for the current platform into `src-tauri/target/release/bundle/`.

`npm run dev:web` runs the UI alone in a browser, with browser fallbacks for file access.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the desktop app in development mode |
| `npm run build` | Build and bundle the desktop app for the current platform |
| `npm run typecheck` | Type-check the frontend |
| `npm run lint` | Lint the frontend |
| `npm test` | Run the frontend unit tests |
| `npm run format` / `format:check` | Format with Prettier |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Run the Rust unit tests |

### Stack

Tauri 2 (Rust), Vite, React 19, TypeScript, [`@stella-componente/terra`](https://github.com/nicked-nicky/stella-componente) with CSS Modules, colorjs.io, Zustand, Lucide React.

### Project structure

```
src/                 React UI
  components/        atoms / molecules / organisms, one folder per component
  hooks/             zoom/pan, color picking, drag reorder, file drops
  lib/               export rendering, color naming/formatting
  store/             Zustand stores (palette, image, settings)
  platform.ts        Tauri bridge (with browser fallbacks)
src-tauri/           Rust backend: file dialogs, scoped file access, window config
  capabilities/      permissions granted to the webview
  icons/             generated app icons
resources/
  icon.png           source app icon
```

Custom components follow the [Terra wiki's conventions](https://github.com/nicked-nicky/stella-componente/blob/main/WIKI.md#writing-new-components): a `Component.tsx` / `Component.module.css` / `index.ts` folder, styling only through `--stella-*` tokens, a `data-stella-grade` root, a `data-stella-component` hook, and buttons only inside a `ButtonIsland`.

### Signing Windows builds

Windows builds are signed through the Tauri bundler: set `bundle.windows.certificateThumbprint` in `src-tauri/tauri.conf.json` before running `npm run build`.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE) © nicked-nicky
