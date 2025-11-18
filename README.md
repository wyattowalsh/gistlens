# 🔍 GistLens

Beautifully view your GitHub gists interactively with a modern, feature-rich web interface.

## ✨ Features

- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations
- 🌓 **Dark/Light Mode** - Toggle between dark and light themes
- 🔍 **GitHub API Integration** - Fetch and display any public gist by URL or ID
- 🎯 **Syntax Highlighting** - PrismJS-powered syntax highlighting for 15+ languages
- 📝 **Markdown Preview** - Render markdown files with GitHub-flavored styling
- 📂 **Multi-file Support** - View and switch between multiple files in a gist
- 📥 **Download Files** - Download individual files from gists
- 📋 **One-Click Copy** - Copy code to clipboard with visual feedback
- 📚 **History Tracking** - Keep track of recently viewed gists in local storage
- 🖥️ **Fullscreen Mode** - Focus on code with fullscreen viewing
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/wyattowalsh/gistlens.git
cd gistlens

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Usage

1. Open the application in your browser
2. The default gist (`bb3bbe2ecc3dd810a14942e66fb87094`) will load automatically
3. To view a different gist:
   - Paste a GitHub Gist URL (e.g., `https://gist.github.com/username/gist-id`)
   - Or paste just the gist ID (e.g., `bb3bbe2ecc3dd810a14942e66fb87094`)
   - Click "Load" or press Enter
4. Use the sidebar to view your recently accessed gists
5. Toggle between files using the tabs
6. For markdown files, use the Preview button to render them
7. Copy code with the Copy button or download files individually

## 🛠️ Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **PrismJS** - Syntax highlighting (loaded via CDN)
- **Marked** - Markdown parser (loaded via CDN)
- **DOMPurify** - HTML sanitizer (loaded via CDN)
- **GitHub Markdown CSS** - GitHub-flavored markdown styling (loaded via CDN)

## 📦 Project Structure

```
gistlens/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── .eslintrc.cjs        # ESLint configuration
```

## 🎨 Features in Detail

### Syntax Highlighting
Supports 15+ languages including:
- JavaScript/TypeScript (JSX/TSX)
- Python
- HTML/CSS
- JSON
- Bash
- SQL
- Go
- Rust
- Java
- YAML
- And more...

### Markdown Preview
- GitHub-flavored markdown rendering
- Syntax highlighting in code blocks
- Dark mode support
- Sanitized HTML output for security

### History Management
- Stores last 10 viewed gists
- Persists across browser sessions
- Shows gist metadata (owner, file count, date)
- Easy removal of individual history items

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is licensed under the terms specified in the LICENSE file.

## 🙏 Acknowledgments

- GitHub API for providing gist data
- PrismJS for syntax highlighting
- Marked for markdown parsing
- The React and Tailwind CSS communities
