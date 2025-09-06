// Minimal service worker for MV3
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "download") {
    downloadMarkdown(message.markdown, message.title);
  }
});

async function downloadMarkdown(markdown, title) {
  try {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const downloadId = await chrome.downloads.download({
      url: url,
      filename: `${title}.md`,
      saveAs: true
    });
    
    // Clean up blob URL after download
    chrome.downloads.onChanged.addListener(function listener(delta) {
      if (delta.id === downloadId && delta.state && delta.state.current === "complete") {
        chrome.downloads.onChanged.removeListener(listener);
        URL.revokeObjectURL(url);
      }
    });
    
  } catch (error) {
    console.error("Download failed:", error);
  }
}