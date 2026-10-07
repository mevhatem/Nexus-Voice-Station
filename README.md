# 🎙️ Nexus Voice Station

> **Ultra-Lightweight P2P Voice, Chat & Gaming Overlay Platform**  
> *Built with Tauri v2, Rust, React 18, TypeScript & Tailwind CSS.*

Nexus Voice Station is a high-performance, privacy-focused alternative to heavy traditional VoIP clients. Powered by a native Rust backend and WebRTC peer-to-peer mesh architecture, it runs with a mere **~38 MB RAM** footprint — consuming a fraction of the resources required by Electron-based software.

---

## ✨ Key Features

- **⚡ Ultra-Low Resource Usage:** Uses native Windows WebView2 and Rust (~38 MB RAM vs. ~650 MB+ in Electron apps).
- **🔒 True P2P & End-to-End Privacy:** Voice, chat, and screen shares stream directly between peers via WebRTC. No central media servers storing your conversations.
- **🎙️ Push-to-Talk (Bas-Konuş) & Voice Activity:** Bind any custom key (`Space`, `CapsLock`, `V`, `Control`, etc.) with intelligent typing exemption and instant state indicators.
- **🎚️ Individual Volume Sliders (%0 - %200):** Adjust each participant's volume individually with Web Audio API amplification, plus local mute ("Kendim İçin Sustur").
- **🖥️ 60 FPS HD Screen Sharing:** Stream your display or specific windows at 720p or 1080p, 30 or 60 FPS, with system audio support.
- **🎮 Always-on-Top Floating Gaming Overlay:** Transparent, draggable streamer widget showing live glowing speaking rings even when the main app is minimized during gameplay. Includes customizable opacity presets (35%, 50%, 75%, 95%).
- **👤 Live Profile Customization:** Custom nicknames, custom avatars (presets or PC upload), and live status messages synced across connected peers in real time without reconnecting.
- **🖼️ Image & Rich Text Chat:** Built-in drawer chat supporting image sharing and unread indicators.

---

## 🛠️ Tech Stack

- **Backend:** [Tauri v2](https://v2.tauri.app/) (Rust)
- **Frontend:** [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Cyberpunk & Glassmorphic dark theme)
- **Icons:** [Lucide Icons](https://lucide.dev/)
- **Networking:** WebRTC via [PeerJS](https://peerjs.com/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust & Cargo](https://rustup.rs/) (latest stable)
- C++ Build Tools (Visual Studio or MinGW-w64 on Windows)

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/nexus-voice-station.git
cd nexus-voice-station

# Install frontend dependencies
npm install

# Run frontend in development mode
npm run dev

# Run full desktop app with Tauri
npm run tauri dev
```

### Production Build

```bash
# Build frontend and compile optimized release binary
npm run build
cargo build --release --manifest-path src-tauri/Cargo.toml
```

The compiled portable `.exe` will be located in `src-tauri/target/release/tauri-chat.exe`.

---

## 📄 License

MIT License. Open source and free for personal & commercial use.
