# Contributing to Nexus Voice Station

Thank you for your interest in contributing to **Nexus Voice Station**! We welcome bug reports, feature suggestions, documentation improvements, and pull requests from everyone.

---

## 🧭 Code of Conduct

This project is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code and treat everyone in the community with respect and courtesy.

---

## 🛠️ Development Setup

Nexus Voice Station is built with **Tauri v2**, **Rust**, **React 18**, and **TypeScript**.

### Prerequisites

1. **Node.js** (v18 or higher) & **npm**
2. **Rust & Cargo** (latest stable toolchain: `rustup default stable`)
3. **C++ Build Tools** (Visual Studio C++ or MinGW-w64 on Windows)

### Running Locally

```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/Nexus-Voice-Station.git
cd Nexus-Voice-Station/tauri-chat

# 2. Install dependencies
npm install

# 3. Start development environment
npm run tauri dev
```

---

## 💡 How Can You Help?

1. **Report Bugs:** If you discover a bug, please open an issue using the [Bug Report Template](https://github.com/mevhatem/Nexus-Voice-Station/issues/new?template=bug_report.md) with reproduction steps.
2. **Suggest Features:** We love new ideas! Check our current roadmap and submit a [Feature Request](https://github.com/mevhatem/Nexus-Voice-Station/issues/new?template=feature_request.md).
3. **Localization / Translations:** Help us translate Nexus into more languages or refine current translations in `src/i18n/translations.ts`.
4. **Performance & Audio:** Help improve WebRTC peer connectivity, audio filters, or Tauri backend optimizations.

---

## 🔀 Submitting a Pull Request

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and ensure the project builds with zero errors:
   ```bash
   npm run build
   cargo check --manifest-path src-tauri/Cargo.toml
   ```
3. Commit your changes using conventional commit messages:
   ```bash
   git commit -m "feat(audio): add custom noise gate filter"
   ```
4. Push to your fork and submit a Pull Request to `mevhatem/Nexus-Voice-Station`.
5. Clearly describe your changes in the PR description and link any related issues.

---

## 📜 License

By contributing to Nexus Voice Station, you agree that your contributions will be licensed under the [MIT License](LICENSE).
