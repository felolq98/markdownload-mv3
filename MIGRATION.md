# MarkDownload Manifest V3 Migration

This document describes the migration from Manifest V2 to Manifest V3 for the MarkDownload extension.

## Changes Made

### 1. Manifest Updates (`manifest.json`)
- Updated `manifest_version` from 2 to 3
- Replaced `browser_action` with `action`
- Moved `<all_urls>` from `permissions` to `host_permissions`
- Added `scripting` permission for MV3 script injection
- Replaced `background.scripts` with `background.service_worker`
- Updated `_execute_browser_action` command to `_execute_action`
- Added `content_scripts` declaration for static injection
- Added `web_accessible_resources` for pageContext.js
- Removed Firefox-specific `browser_specific_settings`

### 2. Background Script Migration
- Created new `background/service-worker.js` as ES module
- Replaced `browser.*` APIs with `chrome.*` APIs throughout
- Updated `browser.tabs.executeScript()` calls to use `chrome.scripting.executeScript()`
- Modified script injection to use MV3 patterns with target objects
- Updated message handling for service worker context

### 3. Content Script Updates
- Updated to use `chrome.*` APIs instead of `browser.*`
- Modified runtime message sending
- Updated resource URL retrieval

### 4. Popup Script Updates
- Replaced `browser.*` APIs with `chrome.*` APIs
- Updated script injection calls to use `chrome.scripting.executeScript()`
- Modified result handling for new API response format

### 5. Options Script Updates
- Updated all `browser.*` API calls to use `chrome.*`
- Modified storage and context menu API calls

### 6. Context Menu Script Updates
- Replaced all `browser.contextMenus` calls with `chrome.contextMenus`

### 7. Default Options Updates
- Updated storage API calls to use `chrome.storage`

## Testing Instructions

### Loading the Extension
1. Open Chrome or Edge browser
2. Navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `src` folder of this extension

### Testing Core Functionality
1. **Toolbar Icon**: Click the extension icon in the toolbar - popup should open
2. **Page Clipping**: Navigate to any webpage and click the extension icon
   - Should show markdown preview of the page content
   - Download button should save a .md file
3. **Context Menus**: Right-click on any webpage
   - Should see MarkDownload context menu options
   - Test "Download Tab As Markdown" and "Copy Tab As Markdown"
4. **Options**: Right-click extension icon → Options
   - Should open options page
   - Test saving different settings
5. **Keyboard Shortcuts**: Test the configured shortcuts:
   - Alt+Shift+M: Open popup
   - Alt+Shift+D: Download current tab as markdown
   - Alt+Shift+C: Copy current tab as markdown

### Verification Checklist
- [ ] Extension loads without errors in chrome://extensions
- [ ] Popup opens and shows markdown preview
- [ ] Download functionality works (saves .md files)
- [ ] Context menus appear and function correctly
- [ ] Options page loads and saves settings
- [ ] Keyboard shortcuts work
- [ ] No console errors in background page or content scripts
- [ ] Image downloading works (if enabled in options)

## Known Limitations
- Some advanced features may need additional testing
- Cross-browser compatibility focused on Chromium-based browsers
- Service worker limitations compared to persistent background pages

## Rollback Plan
If issues are encountered, the original MV2 files are preserved and can be restored by reverting the manifest.json and associated script changes.