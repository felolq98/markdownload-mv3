# MarkDownload - Manifest V3

A Chrome/Edge extension that converts web pages to Markdown format using Readability and Turndown.

## Installation

1. Download or clone this repository
2. Open Chrome/Edge and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `src` folder

## Usage

- **Click extension icon**: Opens popup with Markdown preview
- **Download button**: Saves page as .md file
- **Right-click menu**: Quick download/copy options
- **Keyboard shortcuts**:
  - `Alt+Shift+M`: Open popup
  - `Alt+Shift+D`: Download page as Markdown
  - `Alt+Shift+C`: Copy page as Markdown

## Features

- Converts web pages to clean Markdown
- Downloads images (optional)
- Context menu integration
- Keyboard shortcuts
- Options page for customization
- Obsidian integration support

## Technical Details

- **Manifest V3** compatible
- Uses **Readability.js** for content extraction
- Uses **Turndown.js** for HTML to Markdown conversion
- Service worker handles downloads and messaging
- Content scripts handle DOM processing

## Files Structure

```
src/
├── manifest.json           # Extension manifest
├── background/
│   └── service-worker.js   # Background service worker
├── contentScript/
│   ├── contentScript.js    # Main content script
│   └── content-processor.js # DOM processing
├── popup/
│   ├── popup.html          # Extension popup
│   └── popup.js            # Popup logic
├── options/
│   ├── options.html        # Settings page
│   └── options.js          # Settings logic
└── shared/
    └── default-options.js  # Default configuration
```