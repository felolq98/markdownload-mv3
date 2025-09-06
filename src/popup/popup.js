// Simple popup that works with MV3
let selectedText = null;
let imageList = null;
let mdClipsFolder = '';

const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
const cm = CodeMirror.fromTextArea(document.getElementById("md"), {
    theme: darkMode ? "xq-dark" : "xq-light",
    mode: "markdown",
    lineWrapping: true
});

document.getElementById("download").addEventListener("click", download);

// Initialize popup
chrome.tabs.query({ currentWindow: true, active: true }).then(tabs => {
    const tab = tabs[0];
    
    // Inject content script and get page content
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            // Simple content extraction
            const title = document.title;
            const content = document.body.innerText || document.body.textContent || '';
            
            return {
                title: title,
                content: content,
                url: window.location.href
            };
        }
    }).then(results => {
        if (results && results[0] && results[0].result) {
            const data = results[0].result;
            
            // Simple markdown conversion
            const markdown = `# ${data.title}\n\n${data.content}\n\n---\nSource: ${data.url}`;
            
            cm.setValue(markdown);
            document.getElementById("title").value = data.title.replace(/[\/\?<>\\:\*\|\":]/g, "");
            
            // Show content
            document.getElementById("container").style.display = 'flex';
            document.getElementById("spinner").style.display = 'none';
            document.getElementById("download").focus();
            cm.refresh();
        }
    }).catch(error => {
        console.error("Error:", error);
        showError(error);
    });
});

async function download(e) {
    e.preventDefault();
    
    const markdown = cm.getValue();
    const title = document.getElementById("title").value || "untitled";
    
    // Send to service worker for download
    chrome.runtime.sendMessage({
        type: "download",
        markdown: markdown,
        title: title
    });
    
    window.close();
}

function showError(err) {
    document.getElementById("container").style.display = 'flex';
    document.getElementById("spinner").style.display = 'none';
    cm.setValue(`Error: ${err}`);
}