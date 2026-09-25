use std::collections::HashSet;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use tauri::ipc::{InvokeBody, Request, Response};
use tauri::{AppHandle, DragDropEvent, Emitter, Manager, State, WindowEvent};
use tauri_plugin_dialog::DialogExt;

const IMAGE_EXTENSIONS: [&str; 4] = ["png", "jpg", "jpeg", "webp"];
const MAX_IMAGE_BYTES: u64 = 256 * 1024 * 1024;

#[derive(Default)]
struct FileAccess {
    readable: Mutex<HashSet<PathBuf>>,
    pending_export: Mutex<Option<PathBuf>>,
}

impl FileAccess {
    fn grant_read(&self, path: &Path) {
        self.readable
            .lock()
            .expect("file access lock poisoned")
            .insert(path.to_path_buf());
    }

    fn can_read(&self, path: &Path) -> bool {
        self.readable
            .lock()
            .expect("file access lock poisoned")
            .contains(path)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum ExportFormat {
    Png,
    Jpeg,
    Webp,
}

impl ExportFormat {
    fn from_path(path: &Path) -> Option<Self> {
        match extension_of(path)?.as_str() {
            "png" => Some(Self::Png),
            "jpg" | "jpeg" => Some(Self::Jpeg),
            "webp" => Some(Self::Webp),
            _ => None,
        }
    }

    fn matches(self, bytes: &[u8]) -> bool {
        match self {
            Self::Png => bytes.starts_with(&[0x89, b'P', b'N', b'G', 0x0D, 0x0A, 0x1A, 0x0A]),
            Self::Jpeg => bytes.starts_with(&[0xFF, 0xD8, 0xFF]),
            Self::Webp => bytes.len() >= 12 && &bytes[0..4] == b"RIFF" && &bytes[8..12] == b"WEBP",
        }
    }
}

fn extension_of(path: &Path) -> Option<String> {
    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.to_ascii_lowercase())
}

fn is_supported_image(path: &Path) -> bool {
    extension_of(path).is_some_and(|ext| IMAGE_EXTENSIONS.contains(&ext.as_str()))
}

fn with_export_extension(path: PathBuf) -> PathBuf {
    if ExportFormat::from_path(&path).is_some() {
        path
    } else {
        let mut name = path.file_name().unwrap_or_default().to_os_string();
        name.push(".png");
        path.with_file_name(name)
    }
}

#[tauri::command]
async fn pick_image(
    app: AppHandle,
    access: State<'_, FileAccess>,
) -> Result<Option<String>, String> {
    let picked = app
        .dialog()
        .file()
        .set_title("Open reference image")
        .add_filter("Images", &IMAGE_EXTENSIONS)
        .blocking_pick_file();
    let Some(file) = picked else {
        return Ok(None);
    };
    let path = file.into_path().map_err(|error| error.to_string())?;
    if !is_supported_image(&path) {
        return Err("Unsupported image type.".into());
    }
    access.grant_read(&path);
    Ok(Some(path.to_string_lossy().into_owned()))
}

#[tauri::command]
async fn read_image(path: String, access: State<'_, FileAccess>) -> Result<Response, String> {
    let path = PathBuf::from(path);
    if !access.can_read(&path) {
        return Err("This file wasn't opened through Color Cart.".into());
    }
    let size = fs::metadata(&path)
        .map_err(|error| error.to_string())?
        .len();
    if size > MAX_IMAGE_BYTES {
        return Err("The image is too large to open.".into());
    }
    let bytes = fs::read(&path).map_err(|error| error.to_string())?;
    Ok(Response::new(bytes))
}

#[tauri::command]
async fn pick_export_path(
    app: AppHandle,
    access: State<'_, FileAccess>,
    default_name: String,
) -> Result<Option<String>, String> {
    let picked = app
        .dialog()
        .file()
        .set_title("Export palette")
        .set_file_name(&default_name)
        .add_filter("PNG Image", &["png"])
        .add_filter("JPEG Image", &["jpg", "jpeg"])
        .add_filter("WebP Image", &["webp"])
        .blocking_save_file();
    let mut pending = access
        .pending_export
        .lock()
        .expect("file access lock poisoned");
    let Some(file) = picked else {
        *pending = None;
        return Ok(None);
    };
    let path = with_export_extension(file.into_path().map_err(|error| error.to_string())?);
    *pending = Some(path.clone());
    Ok(Some(path.to_string_lossy().into_owned()))
}

#[tauri::command]
async fn write_export(request: Request<'_>, access: State<'_, FileAccess>) -> Result<(), String> {
    let InvokeBody::Raw(bytes) = request.body() else {
        return Err("Expected raw image bytes.".into());
    };
    let path = access
        .pending_export
        .lock()
        .expect("file access lock poisoned")
        .take()
        .ok_or("No export destination was chosen.")?;
    let format = ExportFormat::from_path(&path).ok_or("Unsupported export format.")?;
    if !format.matches(bytes) {
        return Err("The encoded image doesn't match the chosen file type.".into());
    }
    fs::write(&path, bytes).map_err(|error| error.to_string())
}

fn handle_drag_drop(app: &AppHandle, paths: &[PathBuf]) {
    match paths.iter().find(|path| is_supported_image(path)) {
        Some(path) => {
            app.state::<FileAccess>().grant_read(path);
            let _ = app.emit("image-dropped", path.to_string_lossy().into_owned());
        }
        None => {
            let name = paths
                .first()
                .and_then(|path| path.file_name())
                .map(|name| name.to_string_lossy().into_owned())
                .unwrap_or_default();
            let _ = app.emit("image-drop-rejected", name);
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .manage(FileAccess::default())
        .on_window_event(|window, event| {
            if let WindowEvent::DragDrop(DragDropEvent::Drop { paths, .. }) = event {
                handle_drag_drop(window.app_handle(), paths);
            }
        })
        .invoke_handler(tauri::generate_handler![
            pick_image,
            read_image,
            pick_export_path,
            write_export
        ])
        .run(tauri::generate_context!())
        .expect("error while running color-cart");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn recognizes_supported_images_case_insensitively() {
        assert!(is_supported_image(Path::new("/a/photo.PNG")));
        assert!(is_supported_image(Path::new("/a/photo.jpeg")));
        assert!(is_supported_image(Path::new("/a/photo.webp")));
        assert!(!is_supported_image(Path::new("/a/photo.gif")));
        assert!(!is_supported_image(Path::new("/a/photo")));
    }

    #[test]
    fn appends_png_when_export_extension_is_missing_or_unknown() {
        assert_eq!(
            with_export_extension(PathBuf::from("/a/palette")),
            PathBuf::from("/a/palette.png")
        );
        assert_eq!(
            with_export_extension(PathBuf::from("/a/palette.txt")),
            PathBuf::from("/a/palette.txt.png")
        );
        assert_eq!(
            with_export_extension(PathBuf::from("/a/palette.JPG")),
            PathBuf::from("/a/palette.JPG")
        );
    }

    #[test]
    fn export_format_follows_extension() {
        assert_eq!(
            ExportFormat::from_path(Path::new("x.png")),
            Some(ExportFormat::Png)
        );
        assert_eq!(
            ExportFormat::from_path(Path::new("x.jpg")),
            Some(ExportFormat::Jpeg)
        );
        assert_eq!(
            ExportFormat::from_path(Path::new("x.jpeg")),
            Some(ExportFormat::Jpeg)
        );
        assert_eq!(
            ExportFormat::from_path(Path::new("x.webp")),
            Some(ExportFormat::Webp)
        );
        assert_eq!(ExportFormat::from_path(Path::new("x.bmp")), None);
    }

    #[test]
    fn rejects_bytes_that_do_not_match_the_format() {
        let png = [0x89, b'P', b'N', b'G', 0x0D, 0x0A, 0x1A, 0x0A, 0];
        let jpeg = [0xFF, 0xD8, 0xFF, 0xE0];
        let webp = *b"RIFF\0\0\0\0WEBPVP8 ";
        assert!(ExportFormat::Png.matches(&png));
        assert!(!ExportFormat::Jpeg.matches(&png));
        assert!(ExportFormat::Jpeg.matches(&jpeg));
        assert!(!ExportFormat::Webp.matches(&jpeg));
        assert!(ExportFormat::Webp.matches(&webp));
        assert!(!ExportFormat::Png.matches(&webp));
    }

    #[test]
    fn read_access_is_granted_per_path() {
        let access = FileAccess::default();
        let path = Path::new("/a/photo.png");
        assert!(!access.can_read(path));
        access.grant_read(path);
        assert!(access.can_read(path));
        assert!(!access.can_read(Path::new("/a/other.png")));
    }
}
