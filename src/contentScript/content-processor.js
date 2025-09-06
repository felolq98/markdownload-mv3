// Content script for processing DOM and converting to markdown
// This runs in the page context where DOM APIs are available

// Load required libraries
const scripts = [
  'background/apache-mime-types.js',
  'background/moment.min.js', 
  'background/turndown.js',
  'background/turndown-plugin-gfm.js',
  'background/Readability.js',
  'shared/default-options.js'
];

// Load scripts sequentially
async function loadScripts() {
  for (const script of scripts) {
    try {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = chrome.runtime.getURL(script);
        s.onload = resolve;
        s.onerror = reject;
        (document.head || document.documentElement).appendChild(s);
      });
    } catch (error) {
      console.error(`Failed to load ${script}:`, error);
    }
  }
}

// Initialize when scripts are loaded
loadScripts().then(() => {
  // Set up message listener
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender, sendResponse);
    return true;
  });
});

async function handleMessage(message, sender, sendResponse) {
  if (message.type === "contextMenuAction") {
    await handleContextMenuAction(message.menuItemId, message.info);
  } else if (message.type === "commandAction") {
    await handleCommandAction(message.command);
  } else if (message.type === "clip") {
    await handleClipRequest(message);
  }
}

async function handleClipRequest(message) {
  try {
    const options = await getOptions();
    const article = await getArticleFromDom(message.dom);
    
    if (message.selection && message.clipSelection) {
      article.content = message.selection;
    }
    
    const { markdown } = await convertArticleToMarkdown(article);
    const title = await formatTitle(article);
    
    // Send back to popup
    chrome.runtime.sendMessage({
      type: "display.md",
      markdown: markdown,
      article: { ...article, title: title },
      imageList: {},
      mdClipsFolder: ""
    });
  } catch (error) {
    console.error("Error processing clip request:", error);
  }
}

async function handleContextMenuAction(menuItemId, info) {
  try {
    const options = await getOptions();
    const isSelection = menuItemId.includes("selection");
    const article = await getArticleFromCurrentPage(isSelection);
    const { markdown } = await convertArticleToMarkdown(article, false);
    const title = await formatTitle(article);
    
    if (menuItemId.startsWith("download")) {
      chrome.runtime.sendMessage({
        type: "download",
        markdown: markdown,
        title: title,
        tab: { id: 0 },
        imageList: {},
        mdClipsFolder: ""
      });
    } else if (menuItemId.startsWith("copy")) {
      await copyToClipboard(markdown);
    }
  } catch (error) {
    console.error("Error handling context menu action:", error);
  }
}

async function handleCommandAction(command) {
  // Similar to context menu but for keyboard shortcuts
  await handleContextMenuAction(command.replace("_", "-"), {});
}

// Simplified article processing
async function getArticleFromCurrentPage(selection = false) {
  const dom = getHTMLOfDocument();
  const article = await getArticleFromDom(dom);
  
  if (selection) {
    const selectedHtml = getHTMLOfSelection();
    if (selectedHtml) {
      article.content = selectedHtml;
    }
  }
  
  return article;
}

// Basic markdown conversion (simplified)
async function convertArticleToMarkdown(article, downloadImages = false) {
  const options = await getOptions();
  
  if (!window.TurndownService) {
    // Fallback if Turndown isn't loaded
    return { markdown: article.content || article.textContent || "Error: Could not convert to markdown" };
  }
  
  const turndownService = new TurndownService(options);
  const markdown = turndownService.turndown(article.content || "");
  
  return { markdown: markdown, imageList: {} };
}

async function formatTitle(article) {
  return (article.title || article.pageTitle || document.title || "untitled").replace(/[\/\?<>\\:\*\|\":]/g, "");
}

async function getArticleFromDom(domString) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(domString, "text/html");
  
  if (!window.Readability) {
    // Fallback if Readability isn't loaded
    return {
      title: document.title,
      content: document.body.innerHTML,
      baseURI: document.baseURI,
      pageTitle: document.title
    };
  }
  
  const article = new Readability(dom).parse();
  article.baseURI = dom.baseURI;
  article.pageTitle = dom.title;
  
  return article;
}