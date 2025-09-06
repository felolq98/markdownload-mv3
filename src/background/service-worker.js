// Simple service worker for MV3 - handles messaging and downloads only
// DOM processing moved to content scripts

// Add notification listener for foreground page messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async response
});

// Create context menus on startup
chrome.runtime.onStartup.addListener(() => {
  createContextMenus();
});

chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
});

async function handleMessage(message, sender, sendResponse) {
  if (message.type === "download") {
    await downloadMarkdown(message.markdown, message.title, message.tab.id, message.imageList || {}, message.mdClipsFolder || '');
    sendResponse({ success: true });
  }
}

// Simple context menu creation
async function createContextMenus() {
  try {
    await chrome.contextMenus.removeAll();
    
    chrome.contextMenus.create({
      id: "download-markdown-all",
      title: "Download Tab As Markdown",
      contexts: ["all"]
    });

    chrome.contextMenus.create({
      id: "copy-markdown-all", 
      title: "Copy Tab As Markdown",
      contexts: ["all"]
    });

    chrome.contextMenus.create({
      id: "download-markdown-selection",
      title: "Download Selection As Markdown", 
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: "copy-markdown-selection",
      title: "Copy Selection As Markdown",
      contexts: ["selection"]
    });
  } catch (error) {
    console.error("Error creating context menus:", error);
  }
}

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["browser-polyfill.min.js", "contentScript/contentScript.js"]
    });

    // Send message to content script to handle the action
    chrome.tabs.sendMessage(tab.id, {
      type: "contextMenuAction",
      menuItemId: info.menuItemId,
      info: info
    });
  } catch (error) {
    console.error("Error handling context menu:", error);
  }
});

// Command handler
chrome.commands.onCommand.addListener(async (command) => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  
  if (!tab) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["browser-polyfill.min.js", "contentScript/contentScript.js"]
    });

    chrome.tabs.sendMessage(tab.id, {
      type: "commandAction", 
      command: command
    });
  } catch (error) {
    console.error("Error handling command:", error);
  }
});

// Download function
async function downloadMarkdown(markdown, title, tabId, imageList = {}, mdClipsFolder = '') {
  try {
    if (mdClipsFolder && !mdClipsFolder.endsWith('/')) mdClipsFolder += '/';
    
    const url = URL.createObjectURL(new Blob([markdown], {
      type: "text/markdown;charset=utf-8"
    }));

    const id = await chrome.downloads.download({
      url: url,
      filename: mdClipsFolder + title + ".md",
      saveAs: false
    });

    // Clean up blob URL after download
    chrome.downloads.onChanged.addListener(function listener(delta) {
      if (delta.id === id && delta.state && delta.state.current === "complete") {
        chrome.downloads.onChanged.removeListener(listener);
        URL.revokeObjectURL(url);
      }
    });

  } catch (error) {
    console.error("Download failed:", error);
  }
}