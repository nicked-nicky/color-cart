#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // WebKitGTK's DMA-BUF renderer fails to allocate GBM buffers on the NVIDIA
    // proprietary driver (and some other setups), leaving a blank window.
    // Must be set before the webview is created; an explicit value from the
    // environment wins.
    #[cfg(target_os = "linux")]
    if std::env::var_os("WEBKIT_DISABLE_DMABUF_RENDERER").is_none() {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    color_cart_lib::run()
}
