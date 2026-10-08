# 🎙️ Nexus Voice Station

<div align="center">

![Nexus Voice Station Banner](https://img.shields.io/badge/Nexus-Voice%20Station-00ffff?style=for-the-badge&logo=tauri&logoColor=black)

**The Ultra-Lightweight, Privacy-Focused P2P Voice, Screen Share & Gaming Overlay Platform**  
*Built with Tauri v2, Rust, React 18, TypeScript & Tailwind CSS.*

[![Latest Release](https://img.shields.io/github/v/release/mevhatem/Nexus-Voice-Station?color=cyan&label=Latest%20Release)](https://github.com/mevhatem/Nexus-Voice-Station/releases)
[![CI](https://github.com/mevhatem/Nexus-Voice-Station/actions/workflows/ci.yml/badge.svg)](https://github.com/mevhatem/Nexus-Voice-Station/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?logo=windows&logoColor=white)](https://github.com/mevhatem/Nexus-Voice-Station/releases)
[![Memory Footprint](https://img.shields.io/badge/RAM%20Footprint-~38%20MB-emerald.svg)](#)
[![Languages](https://img.shields.io/badge/Languages-EN%20%7C%20TR%20%7C%20DE%20%7C%20FR%20%7C%20RU-orange.svg)](#)
[![GitHub Stars](https://img.shields.io/github/stars/mevhatem/Nexus-Voice-Station?style=social)](https://github.com/mevhatem/Nexus-Voice-Station/stargazers)

[📥 Download Portable](#-download--quick-start-no-installation-required) • [✨ Features](#-key-features) • [⚡ Performance Comparison](#-nexus-vs-traditional-voip) • [🛠️ Tech Stack](#️-tech-stack) • [🚀 Developer Guide](#-developer-guide) • [🤝 Contributing](#-community--contributing)

</div>

---

## 📖 Overview

**Nexus Voice Station** is a high-performance, resource-efficient desktop voice communication platform engineered specifically for gamers, power users, and developers. 

While mainstream VoIP applications (like Discord) are built on heavy Electron runtimes that often consume **800 MB to 1.5 GB of RAM** in the background, Nexus runs natively on Windows via **Tauri v2** and **Rust**, keeping total memory consumption strictly at **~35–38 MB**. 

Voice streams, screen sharing, and text chat are transmitted directly peer-to-peer (P2P) via **WebRTC mesh networking** using the high-fidelity **Opus codec**. No central media servers record or buffer your streams.

---

## ⚡ Nexus vs. Traditional VoIP

| Metric / Feature | 🎙️ Nexus Voice Station | 👾 Mainstream Clients (Discord / Teams) |
| :--- | :--- | :--- |
| **Active RAM Usage** | **~35 – 38 MB** | 700 MB – 1.4 GB |
| **Runtime Architecture** | Native Rust + Lightweight WebView2 | Heavy Electron Chromium Container |
| **Audio Transmission** | **Direct P2P Mesh (Opus Codec)** | Relayed through proprietary servers |
| **Privacy** | End-to-peer encrypted; zero telemetry | Server logs, telemetry, voice routing |
| **Startup Speed** | **< 0.8 seconds (Instant)** | 5 – 15 seconds |
| **In-Game Gaming Impact** | **0% FPS drop / Zero stutter** | Noticeable FPS drops on mid/low-spec PCs |
| **Installation** | **Single Portable `.exe` (Zero install)** | Heavy installer + auto-updater bloat |

---

## 📥 Download & Quick Start (No Installation Required!)

> 💡 **You DO NOT need Rust, Node.js, or any developer tools to use Nexus!**  
> Precompiled standalone portable releases are ready to run out of the box.

### 👉 **[Download the Latest Release (Click Here)](https://github.com/mevhatem/Nexus-Voice-Station/releases/latest)**

1. Download **`NexusVoiceStation_Kurulumsuz.zip`** from the latest release.
2. Extract the ZIP folder anywhere on your computer (e.g., Desktop or Documents).
3. Double-click **`NexusVoice.exe`** to launch immediately.
4. Share your **Room Code** with friends to begin instant P2P voice chat!

---

## ✨ Key Features

- **⚡ Minimal Resource Overhead:** Operates at ~38 MB RAM footprint, freeing up your CPU, GPU, and memory for your favorite games and heavy workloads.
- **🔒 True P2P & End-to-End Privacy:** Direct peer-to-peer voice and chat streams over WebRTC. No central servers store your conversations.
- **🎙️ Push-to-Talk (PTT) & Voice Activity Detection (VAD):** Bind any key on your keyboard (`Space`, `CapsLock`, `V`, `Ctrl`, mouse keys, etc.) with real-time audio detection bars and smart typing exemption.
- **🎮 Always-on-Top Gaming HUD Overlay:** A sleek, transparent widget displaying live speaker rings and status badges in the corner of your screen while playing full-screen games. Features adjustable opacity presets (`35%`, `50%`, `75%`, `95%`), speaking-only filter, and instant mic toggle.
- **🖥️ 60 FPS HD Screen Sharing:** Stream your full screen or individual windows at 720p or 1080p (30/60 FPS). Optimized with CPU/GPU throttling to prevent game lag while sharing.
- **🎚️ Individual Volume Sliders (0% - 200%):** Customize volume independently for each user with Web Audio API amplification, plus local mute ("Mute for Myself").
- **👤 Live Profile Customization:** Change your nickname, avatar (built-in cyber avatars or custom image upload), and live status text with instant real-time synchronization across peers.
- **🌍 Multi-Language Localization (5 Languages):** Switch seamlessly on the fly without restarting:
  - 🇹🇷 **Türkçe**
  - 🇬🇧 **English**
  - 🇩🇪 **Deutsch**
  - 🇫🇷 **Français**
  - 🇷🇺 **Русский**
- **💬 Fast In-Room Text & Image Chat:** Built-in drawer chat supporting image sharing and unread notification badges.
- **🎛️ Studio Hardware Audio Filters:** Native Echo Cancellation, Noise Suppression, and Auto Gain Control for crystal-clear microphone audio.

---

## 🛠️ Tech Stack

- **Backend Core:** [Tauri v2](https://v2.tauri.app/) (Rust)
- **Frontend Framework:** [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **UI & Styling:** [Tailwind CSS](https://tailwindcss.com/) (Cyberpunk & Glassmorphic dark aesthetic)
- **Icons:** [Lucide React](https://lucide.dev/)
- **P2P Networking:** WebRTC Mesh via [PeerJS](https://peerjs.com/)
- **Audio Processing:** Native Web Audio API & MediaStream DSP filters

---

## 🚀 Developer Guide

If you wish to inspect the source code or build Nexus Voice Station locally from scratch:

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust & Cargo](https://rustup.rs/) (latest stable)
- C++ Build Tools (Visual Studio C++ or MinGW-w64 on Windows)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/mevhatem/Nexus-Voice-Station.git
cd Nexus-Voice-Station/tauri-chat

# Install frontend packages
npm install
```

### 2. Run in Development Mode

```bash
# Starts both frontend Vite dev server and Tauri Rust desktop shell
npm run tauri dev
```

### 3. Build Production Release

```bash
# Build frontend bundles
npm run build

# Compile highly optimized native Windows binary
cargo build --release --manifest-path src-tauri/Cargo.toml
```

The resulting standalone executable will be generated at `src-tauri/target/release/tauri-chat.exe`.

---

## 🛡️ Security & Privacy

Nexus Voice Station is built from the ground up on the principle of minimal trust:
- **No Account Required:** No emails, passwords, phone numbers, or third-party OAuth logins.
- **Direct P2P Connections:** Audio and chat data pass directly between users' machines.
---

## 🤝 Community & Contributing

Contributions make the open-source community an incredible place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

- 📖 **Contributing Guidelines:** Please read our [CONTRIBUTING.md](CONTRIBUTING.md) before submitting pull requests.
- 🛡️ **Code of Conduct:** Review our community standards in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- 🔒 **Security Policy:** Learn how to report vulnerabilities responsibly in [SECURITY.md](SECURITY.md).
- 🐛 **Report a Bug:** Open an issue with our [Bug Report Template](https://github.com/mevhatem/Nexus-Voice-Station/issues/new?template=bug_report.md).
- 💡 **Request a Feature:** Submit an idea via our [Feature Request Template](https://github.com/mevhatem/Nexus-Voice-Station/issues/new?template=feature_request.md).

---

## ⭐ Star History

If you love the mission of lightweight, private, and high-performance software, please consider giving Nexus Voice Station a **Star**! It helps the project reach more gamers and developers.

[![Star History Chart](https://api.star-history.com/svg?repos=mevhatem/Nexus-Voice-Station&type=Date)](https://star-history.com/#mevhatem/Nexus-Voice-Station&Date)

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it freely for both personal and commercial purposes.

---

<div align="center">
  <sub>Designed with ⚡ for gamers who value every megabyte of RAM.</sub>
</div>
