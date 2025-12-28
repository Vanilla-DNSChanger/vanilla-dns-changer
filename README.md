<div align="center">

# 🌐 Vanilla DNS Changer

**Open-source DNS Changer for Windows, macOS, and Linux**

[![GitHub license](https://img.shields.io/github/license/Vanilla-DNSChanger/vanilla-dns-changer?style=flat-square&color=53FC18)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Vanilla-DNSChanger/vanilla-dns-changer?style=flat-square&color=53FC18)](https://github.com/Vanilla-DNSChanger/vanilla-dns-changer/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Vanilla-DNSChanger/vanilla-dns-changer?style=flat-square)](https://github.com/Vanilla-DNSChanger/vanilla-dns-changer/issues)

<img src="apps/website/public/logo.svg" alt="Vanilla DNS Changer Logo" width="200" />

A secure, fast, and beautiful DNS changer application with **3000+ DNS servers** support.

[🖥️ Desktop App](#desktop-app) • [⌨️ CLI Tool](#cli-tool) • [🌐 Website](https://vanilla-dnschanger.github.io)

</div>

---

## ✨ Features

- 🚀 **One-Click DNS Change** - Connect to any DNS server instantly
- 📊 **3000+ DNS Servers** - Huge database of public DNS servers
- 🎨 **Modern UI** - Beautiful dark theme with Kick-style green accents
- 🖥️ **Cross-Platform** - Windows, macOS, and Linux support
- 🔒 **Open Source** - Fully transparent and community-driven
- ⚡ **Fast & Lightweight** - Minimal resource usage
- 🌍 **Multi-Language** - English and Persian (فارسی) support
- 📡 **Server Ping** - Test server latency before connecting
- 💾 **Custom DNS** - Add and save your own DNS servers
- 🔄 **Auto-Sync** - Automatic server list updates from GitHub

---

## 📦 Packages

This monorepo contains:

| Package | Description | Status |
|---------|-------------|--------|
| [`@vanilla-dns/desktop`](apps/desktop) | Electron desktop application | 🚧 In Development |
| [`@vanilla-dns/cli`](apps/cli) | Command-line interface tool | 🚧 In Development |
| [`@vanilla-dns/website`](apps/website) | Landing page & documentation | 🚧 In Development |
| [`@vanilla-dns/shared`](packages/shared) | Shared utilities & types | 🚧 In Development |

---

## 🖥️ Desktop App

Beautiful Electron-based desktop application with system tray support.

### Features
- Modern dark UI with green accents (Kick-style)
- System tray with quick actions
- Auto-start with system
- Flush DNS cache
- Network interface selection
- Auto-updates

### Download

> Coming soon! Check [Releases](https://github.com/Vanilla-DNSChanger/vanilla-dns-changer/releases)

---

## ⌨️ CLI Tool

Powerful command-line interface for DNS management.

### Installation

```bash
npm install -g @vanilla-dns/cli
```

### Usage

```bash
# Connect to DNS server interactively
vdns connect

# Connect by server name
vdns connect -n cloudflare

# Connect with custom DNS
vdns connect -s 8.8.8.8,8.8.4.4

# Connect to random server
vdns connect -r

# Disconnect (restore default DNS)
vdns disconnect

# Check current DNS status
vdns status

# List available servers
vdns list

# Ping a server
vdns ping cloudflare

# Flush DNS cache
vdns flush
```

---

## 🛠️ Development

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Setup

```bash
# Clone the repository
git clone https://github.com/Vanilla-DNSChanger/vanilla-dns-changer.git
cd vanilla-dns-changer

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development
pnpm dev
```

### Project Structure

```
vanilla-dns-changer/
├── apps/
│   ├── desktop/     # Electron app
│   ├── cli/         # CLI tool
│   └── website/     # Landing page
├── packages/
│   └── shared/      # Shared code
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

### Scripts

```bash
pnpm build          # Build all packages
pnpm dev            # Start development mode
pnpm lint           # Run linting
pnpm test           # Run tests
pnpm clean          # Clean all builds
pnpm desktop dev    # Run desktop app in dev mode
pnpm cli dev        # Run CLI in dev mode
pnpm website dev    # Run website in dev mode
```

---

## 🎨 Design

Vanilla DNS Changer uses a **Kick-style** dark theme:

| Color | Hex | Usage |
|-------|-----|-------|
| 🟢 Primary Green | `#53FC18` | Accents, buttons, highlights |
| ⚫ Background | `#0a0a0a` | Main background |
| 🔘 Card | `#141414` | Card backgrounds |
| 📝 Border | `#2a2a2a` | Borders, dividers |
| ⚪ Text | `#ffffff` | Primary text |
| 🔘 Muted | `#888888` | Secondary text |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**SudoLite**

- Twitter/X: [@sudolite](https://x.com/sudolite)
- GitHub: [@Vanilla-DNSChanger](https://github.com/Vanilla-DNSChanger)

---

<div align="center">

Made with 💚 by [SudoLite](https://x.com/sudolite)

⭐ Star this repo if you find it useful!

</div>
