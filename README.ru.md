<div align="center">

<img src="resources/icon.png" alt="color-cart" width="128" />

# color-cart

Выбирайте цвета с любого изображения и экспортируйте их в виде картинки-палитры.

[English](README.md) · **Русский**

[![Последний релиз](https://img.shields.io/github/v/release/nicked-nicky/color-cart?label=релиз)](https://github.com/nicked-nicky/color-cart/releases/latest)
[![Загрузки](https://img.shields.io/github/downloads/nicked-nicky/color-cart/total?label=загрузки)](https://github.com/nicked-nicky/color-cart/releases)
![Платформы](https://img.shields.io/badge/платформы-Windows%20%7C%20Linux-lightgrey)
[![Лицензия](https://img.shields.io/github/license/nicked-nicky/color-cart?label=лицензия)](LICENSE)

</div>

## Возможности

- **Выбор цвета.** Зажмите кнопку мыши на изображении, чтобы взять цвет; лупа помогает попасть точно в нужный пиксель.
- **Палитра.** Меняйте порядок образцов перетаскиванием, копируйте любой цвет в HEX, RGB или OKLCH. Приложение предупредит, если цвет почти совпадает с уже добавленным (CIE2000 ΔE).
- **Навигация.** Масштабирование до 1000% относительно курсора, перемещение средней кнопкой мыши и мини-карта.
- **Экспорт.** Сохранение палитры в PNG, JPEG или WebP либо копирование прямо в буфер обмена. Форма, размер, поворот, наклон, отступы, обводка и фон образцов настраиваются, с живым предпросмотром.
- **Внешний вид.** Светлая, тёмная или системная тема, а также настройки скругления, плотности, границ и анимаций.

## Установка

Скачайте файл для своей системы со страницы [последнего релиза](https://github.com/nicked-nicky/color-cart/releases/latest).

| Система | Файл |
| --- | --- |
| Windows 10 / 11 (x64) | `color-cart_<версия>_x64-setup.exe` |
| Debian, Ubuntu, Linux Mint, Pop!_OS | `color-cart_<версия>_amd64.deb` |
| Fedora, RHEL, Rocky, AlmaLinux, openSUSE | `color-cart-<версия>-1.x86_64.rpm` |
| Любой другой дистрибутив (Arch, Manjaro, NixOS, …) | `color-cart_<версия>_amd64.AppImage` |

В командах ниже указана версия `2.0.0` — замените её на ту, которую скачали.

### Windows

1. Скачайте `color-cart_2.0.0_x64-setup.exe`.
2. Запустите его и следуйте инструкциям установщика. Приложение ставится для текущего пользователя, права администратора не нужны.
3. Запустите **color-cart** из меню «Пуск».

Приложение работает на Microsoft Edge WebView2, который уже встроен в Windows 10 и 11. Если его нет, установщик скачает его сам.

Если Windows SmartScreen покажет предупреждение, нажмите **Подробнее → Выполнить в любом случае**.

Чтобы удалить приложение, откройте **Параметры → Приложения → Установленные приложения**, найдите color-cart и нажмите **Удалить**.

### Debian, Ubuntu и производные

Нужен Debian 12+, Ubuntu 22.04+ или дистрибутив на их основе.

```bash
sudo apt install ./color-cart_2.0.0_amd64.deb
```

При установке через `apt` (а не `dpkg -i`) нужные зависимости (`libwebkit2gtk-4.1-0`, `libgtk-3-0`) подтянутся автоматически.

Удаление:

```bash
sudo apt remove color-cart
```

### Fedora, RHEL и производные

```bash
sudo dnf install ./color-cart-2.0.0-1.x86_64.rpm
```

Удаление:

```bash
sudo dnf remove color-cart
```

### openSUSE

```bash
sudo zypper install --allow-unsigned-rpm ./color-cart-2.0.0-1.x86_64.rpm
```

Удаление:

```bash
sudo zypper remove color-cart
```

### AppImage (любой дистрибутив)

AppImage — это один переносимый файл, устанавливать его не нужно:

```bash
chmod +x color-cart_2.0.0_amd64.AppImage
./color-cart_2.0.0_amd64.AppImage
```

Для работы AppImage нужен FUSE 2. Если приложение не запускается, установите его:

| Дистрибутив | Команда |
| --- | --- |
| Arch, Manjaro | `sudo pacman -S fuse2` |
| Ubuntu 24.04+ | `sudo apt install libfuse2t64` |
| Ubuntu 22.04, Debian | `sudo apt install libfuse2` |
| Fedora | `sudo dnf install fuse-libs` |

Чтобы добавить приложение в меню, воспользуйтесь [Gear Lever](https://flathub.org/apps/it.mijorus.gearlever) или [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher).

Для удаления просто удалите файл.

### macOS

Сборки для macOS пока не публикуются. Приложение можно [собрать из исходников](#сборка-из-исходников).

## Сборка из исходников

Установите [зависимости Tauri](https://tauri.app/start/prerequisites/) для своей платформы (Rust, а на Linux ещё WebKitGTK 4.1) и Node.js 20.19 или новее, затем:

```bash
git clone https://github.com/nicked-nicky/color-cart.git
cd color-cart
npm install
npm run dev
```

`npm run build` собирает приложение для текущей платформы в `src-tauri/target/release/bundle/`.

`npm run dev:web` запускает только интерфейс в браузере, с браузерными заменами для работы с файлами.

### Скрипты

| Команда | Описание |
| --- | --- |
| `npm run dev` | Запустить приложение в режиме разработки |
| `npm run build` | Собрать и упаковать приложение для текущей платформы |
| `npm run typecheck` | Проверить типы во фронтенде |
| `npm run lint` | Запустить линтер для фронтенда |
| `npm test` | Запустить юнит-тесты фронтенда |
| `npm run format` / `format:check` | Отформатировать код Prettier |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Запустить юнит-тесты Rust |

### Стек

Tauri 2 (Rust), Vite, React 19, TypeScript, [`@stella-componente/terra`](https://github.com/nicked-nicky/stella-componente) с CSS Modules, colorjs.io, Zustand, Lucide React.

### Структура проекта

```
src/                 интерфейс на React
  components/        atoms / molecules / organisms, по папке на компонент
  hooks/             масштаб и перемещение, выбор цвета, перетаскивание, drop файлов
  lib/               рендер экспорта, названия и форматы цветов
  store/             хранилища Zustand (палитра, изображение, настройки)
  platform.ts        мост к Tauri (с браузерными заменами)
src-tauri/           бэкенд на Rust: диалоги файлов, ограниченный доступ к файлам, настройки окна
  capabilities/      разрешения для webview
  icons/             сгенерированные иконки приложения
resources/
  icon.png           исходная иконка приложения
```

Собственные компоненты следуют [соглашениям из вики Terra](https://github.com/nicked-nicky/stella-componente/blob/main/WIKI.md#writing-new-components): папка с `Component.tsx` / `Component.module.css` / `index.ts`, стили только через токены `--stella-*`, корневой `data-stella-grade`, атрибут `data-stella-component` и кнопки только внутри `ButtonIsland`.

### Подпись сборок для Windows

Сборки для Windows подписываются через бандлер Tauri: перед `npm run build` укажите `bundle.windows.certificateThumbprint` в `src-tauri/tauri.conf.json`.

## Список изменений

См. [CHANGELOG.md](CHANGELOG.md).

## Лицензия

[MIT](LICENSE) © nicked-nicky
