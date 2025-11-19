# 🔍 GistLens v2.0

Beautifully view your GitHub gists interactively with a modern, feature-rich web interface powered by shadcn/ui and enhanced markdown rendering.

## ✨ Features

### Core Features
- 🎨 **Beautiful Modern UI** - Built with shadcn/ui components and Tailwind CSS v3
- 🌓 **Dark/Light Mode** - Seamless theme switching with persistent storage
- 🔍 **GitHub API Integration** - Fetch and display any public gist by URL or ID
- 🎯 **Advanced Syntax Highlighting** - PrismJS with 15+ language support
- 📝 **Enhanced Markdown Rendering** - GitHub-flavored markdown with math support (KaTeX)
- 🧮 **Math Rendering** - Full LaTeX math equation support via KaTeX
- 📂 **Multi-file Support** - Enhanced tabbed interface for multiple files
- 📥 **Download Files** - Download individual files from gists
- 📋 **One-Click Copy** - Copy code to clipboard with visual feedback
- 📚 **History Tracking** - Beautiful history sidebar with recently viewed gists
- 🖥️ **Fullscreen Mode** - Distraction-free code viewing
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile
- ✨ **Gradient Effects** - Beautiful gradient accents throughout the UI
- 🎭 **Smooth Animations** - Polished transitions and micro-interactions

### 🎬 Rich Media Support
- 🖼️ **Image Viewer** - Interactive pan, zoom, and rotate for PNG, JPG, GIF, WebP, SVG, and more
- 🎥 **Video Player** - Full-featured HTML5 player for MP4, WebM, OGG, MOV formats
- 🎵 **Audio Player** - Beautiful music player for MP3, WAV, FLAC, OGG, and other formats
- 📊 **Data Viewers** - Sortable/searchable tables for CSV/TSV, tree view for JSON, formatted XML/YAML
- 📄 **PDF Viewer** - Embedded PDF display with zoom and download
- 🔄 **Auto-Detection** - Automatically selects the best viewer based on file type

### Enhanced Markdown Features
- ✅ GitHub-flavored markdown (GFM)
- 🧮 Math equations with KaTeX
- 🔗 Auto-linked headings with slugs
- 📊 Tables with proper styling
- ✓ Task lists
- 💻 Enhanced code blocks with syntax highlighting
- 🎨 Custom styling for blockquotes, lists, and more

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

1. Open the application in your browser - you'll see a beautiful homepage with featured gists
2. To view content, you can:
   - **View a specific gist**: Paste a GitHub Gist URL (e.g., `https://gist.github.com/username/gist-id`) or just the gist ID
   - **Browse user gists**: Enter a username (e.g., `wyattowalsh`) or user URL (e.g., `https://gist.github.com/wyattowalsh`) to see all their public gists
   - **Explore featured gists**: Click on any featured gist card on the homepage
3. Click "Load" or press Enter to view the content
4. Use the sidebar to view your recently accessed gists
5. Toggle between files using the tabs (for multi-file gists)
6. For markdown files, use the Preview button to render them beautifully
7. Copy code with the Copy button or download files individually
8. Use keyboard shortcuts for faster navigation (see below)

## 🛠️ Technology Stack

### Core Technologies
- **React 18** - Modern UI framework with hooks
- **Vite 5** - Lightning-fast build tool and dev server
- **Tailwind CSS v3** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Lucide React** - Modern icon library

### Markdown & Code Rendering
- **Unified** - Markdown processing pipeline
- **Remark** - Markdown parsing (remark-gfm, remark-math)
- **Rehype** - HTML processing (rehype-katex, rehype-slug, rehype-autolink-headings, rehype-prism-plus)
- **KaTeX** - Fast math rendering
- **PrismJS** - Fallback syntax highlighting

### UI Components (shadcn/ui)
- **Radix UI** - Accessible primitive components
  - Tabs
  - Scroll Area
  - Separator
  - Slot
- **CVA** - Class variance authority for component variants
- **Tailwind Merge** - Intelligent Tailwind class merging

## 📦 Project Structure

```
gistlens/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.jsx
│   │   │   ├── tabs.jsx
│   │   │   ├── separator.jsx
│   │   │   └── scroll-area.jsx
│   │   └── MarkdownRenderer.jsx   # Enhanced markdown component
│   ├── lib/
│   │   ├── utils.js               # Utility functions (cn)
│   │   └── button-variants.js     # Button variant definitions
│   ├── App.jsx                    # Main application (v2.0)
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles + shadcn theme
├── index.html                     # HTML entry point
├── package.json                   # Dependencies and scripts
├── vite.config.js                 # Vite + MDX configuration
├── tailwind.config.js             # Tailwind CSS + shadcn config
├── postcss.config.js              # PostCSS configuration
└── .eslintrc.cjs                  # ESLint configuration
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

### Enhanced Markdown Preview
- **GitHub-flavored markdown** with full GFM support
- **Math equations** rendered with KaTeX (inline and block)
- **Auto-linked headings** with anchor links
- **Syntax highlighting** in code blocks with line numbers
- **Tables** with proper borders and styling
- **Task lists** with checkbox support
- **Blockquotes** with custom styling
- **Dark mode support** with proper theme variables
- **Sanitized HTML** output for security

### History Management
- Beautiful sidebar with card-based layout
- Stores last 10 viewed gists
- Persists across browser sessions
- Shows gist metadata (owner, file count, date)
- Avatar display for gist owners
- Hover effects and smooth animations
- Easy removal of individual history items
- Active state highlighting

### User Gists Browser
- Enter any GitHub username to view all their public gists
- Beautiful grid layout with gist cards
- Shows gist title, description, file count, and last update
- Click any gist card to view the full gist

### Homepage & Featured Gists
- Beautiful landing page with gradient hero section
- Feature cards highlighting key capabilities
- Curated list of featured gists for learning
- "How to Use" guide for new users
- Smooth navigation between views

### Keyboard Shortcuts
- `Cmd/Ctrl + K` - Focus search input
- `Cmd/Ctrl + H` - Return to homepage
- `Cmd/Ctrl + D` - Toggle dark/light mode
- `Escape` - Close sidebar (on mobile)

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
