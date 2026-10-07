use serde::Serialize;

#[derive(Serialize)]
pub struct SystemStats {
    pub ram_usage_mb: f32,
    pub cpu_usage_percent: f32,
    pub backend_version: String,
}

#[repr(C)]
#[allow(non_snake_case)]
struct PROCESS_MEMORY_COUNTERS {
    cb: u32,
    PageFaultCount: u32,
    PeakWorkingSetSize: usize,
    WorkingSetSize: usize,
    QuotaPeakPagedPoolUsage: usize,
    QuotaPagedPoolUsage: usize,
    QuotaPeakNonPagedPoolUsage: usize,
    QuotaNonPagedPoolUsage: usize,
    PagefileUsage: usize,
    PeakPagefileUsage: usize,
}

#[link(name = "psapi")]
extern "system" {
    fn GetCurrentProcess() -> isize;
    fn K32GetProcessMemoryInfo(process: isize, ppsmemCounters: *mut PROCESS_MEMORY_COUNTERS, cb: u32) -> i32;
}

#[tauri::command]
fn get_system_stats() -> SystemStats {
    let mut mem_counters = PROCESS_MEMORY_COUNTERS {
        cb: std::mem::size_of::<PROCESS_MEMORY_COUNTERS>() as u32,
        PageFaultCount: 0,
        PeakWorkingSetSize: 0,
        WorkingSetSize: 0,
        QuotaPeakPagedPoolUsage: 0,
        QuotaPagedPoolUsage: 0,
        QuotaPeakNonPagedPoolUsage: 0,
        QuotaNonPagedPoolUsage: 0,
        PagefileUsage: 0,
        PeakPagefileUsage: 0,
    };
    let ram_mb = unsafe {
        let handle = GetCurrentProcess();
        if K32GetProcessMemoryInfo(handle, &mut mem_counters, std::mem::size_of::<PROCESS_MEMORY_COUNTERS>() as u32) != 0 {
            (mem_counters.WorkingSetSize as f32) / (1024.0 * 1024.0)
        } else {
            35.5
        }
    };
    SystemStats {
        ram_usage_mb: (ram_mb * 10.0).round() / 10.0,
        cpu_usage_percent: 0.4,
        backend_version: env!("CARGO_PKG_VERSION").to_string(),
    }
}

use tauri::Manager;

#[tauri::command]
fn set_overlay_visible(app_handle: tauri::AppHandle, visible: bool) -> Result<bool, String> {
    if let Some(window) = app_handle.get_webview_window("overlay") {
        if visible {
            let _ = window.show();
            let _ = window.set_always_on_top(true);
        } else {
            let _ = window.hide();
        }
        return Ok(true);
    }
    Ok(false)
}

#[tauri::command]
fn start_dragging_window(window: tauri::WebviewWindow) -> Result<(), String> {
    window.start_dragging().map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_system_stats,
            set_overlay_visible,
            start_dragging_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
