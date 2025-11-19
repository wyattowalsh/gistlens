# Media Viewers Guide

GistLens now supports rich media file rendering and visualization for various file types beyond just code and markdown.

## Supported Media Types

### 🖼️ Images
**Supported formats:** PNG, JPG, JPEG, GIF, WEBP, SVG, BMP, ICO, TIFF, AVIF, HEIC, HEIF

**Features:**
- Pan and zoom with mouse/touch
- Rotate image 90° increments
- Reset view to original
- Download image
- Drag to pan, scroll/pinch to zoom

**Usage:** Simply upload or link a gist containing image files. They will automatically render in the interactive image viewer.

---

### 🎥 Videos
**Supported formats:** MP4, WEBM, OGG, OGV, MOV, AVI, WMV, FLV, MKV, M4V

**Features:**
- Custom HTML5 video player
- Play/pause controls
- Volume control with slider
- Seek/scrub timeline
- Fullscreen mode
- Download video
- Time display (current/total)

**Usage:** Gists containing video files will render with the custom video player. Click play to start playback.

---

### 🎵 Audio/Music
**Supported formats:** MP3, WAV, OGG, OGA, FLAC, M4A, AAC, WMA, OPUS, WEBM

**Features:**
- Beautiful music player UI
- Play/pause controls
- Volume slider
- Seek/scrub timeline
- Skip forward/backward (10s)
- Download audio
- Animated playback indicator

**Usage:** Audio files in gists will display a music player interface with full playback controls.

---

### 📊 Data Files
**Supported formats:** CSV, TSV, JSON, XML, YAML, YML, TOML

**Features:**

#### CSV/TSV Viewer
- Interactive table with sortable columns
- Search/filter across all data
- Click column headers to sort (ascending/descending)
- Row count display
- Automatic type detection for sorting (numbers vs strings)
- Download original file

#### JSON Viewer
- Tree structure with collapsible nodes
- Syntax highlighting
- Object size display
- Copy values to clipboard
- Expand/collapse all
- Search within structure
- Download original file

#### XML/YAML Viewer
- Syntax highlighted display
- Formatted text view
- Download original file

**Usage:** Data files automatically render in the appropriate viewer based on file extension.

---

### 📄 PDF Documents
**Supported formats:** PDF

**Features:**
- Native browser PDF viewer
- Zoom in/out
- Page navigation
- Text selection and search
- Open in new tab
- Download PDF

**Usage:** PDF files in gists will render using the browser's native PDF viewer with additional controls.

---

## How It Works

### Automatic Detection
GistLens automatically detects the file type based on the file extension and renders it with the appropriate viewer. No configuration needed!

### File Type Detection
The system categorizes files into:
1. **Markdown** - Rendered with enhanced markdown preview
2. **Images** - Interactive image viewer
3. **Videos** - Custom video player
4. **Audio** - Music player interface
5. **Data** - Table/tree viewer based on format
6. **PDF** - Embedded PDF viewer
7. **Code** - Syntax highlighted code view (fallback)

### Viewer Selection Priority
1. Check if file is markdown and preview mode is enabled → Markdown Renderer
2. Check file extension against known image types → Image Viewer
3. Check file extension against known video types → Video Player
4. Check file extension against known audio types → Audio Player
5. Check file extension against known data types → Data Viewer
6. Check if file is PDF → PDF Viewer
7. Default to syntax highlighted code block

## Examples

### Viewing Images
```
Load a gist with: image.png, photo.jpg, graphic.svg
Result: Interactive pan/zoom image viewer
```

### Viewing Data
```
Load a gist with: data.csv, config.json, settings.yaml
Result: Sortable/searchable data table or JSON tree viewer
```

### Viewing Media
```
Load a gist with: video.mp4, music.mp3
Result: Full-featured media players with controls
```

## Tips

- **Images**: Use scroll wheel or pinch to zoom, drag to pan, use toolbar buttons for rotate/reset
- **CSV/TSV**: Click column headers to sort, use search box to filter rows
- **JSON**: Click on nodes to expand/collapse, hover over values to copy
- **Videos/Audio**: Use keyboard spacebar to play/pause when player is focused
- **All viewers**: Download button available for offline access

## Technical Details

### Dependencies
- `react-zoom-pan-pinch` - Image pan/zoom functionality
- `papaparse` - CSV/TSV parsing
- `@textea/json-viewer` - JSON tree visualization
- HTML5 `<video>` and `<audio>` elements - Native media playback

### Performance
- Large files are streamed when possible
- Images use lazy loading
- Data tables use virtual scrolling for large datasets
- Media files use browser's native codec support

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- HTML5 video/audio codecs required
- JavaScript enabled
- Local storage for history

---

## Future Enhancements

Potential future additions:
- 3D model viewers (STL, OBJ, GLTF)
- Interactive charts for data visualization
- Code execution/REPL for certain languages
- Collaborative viewing features
- Advanced image editing tools
- Video trimming/editing
- Audio waveform visualization
