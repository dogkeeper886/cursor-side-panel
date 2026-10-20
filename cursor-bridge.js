// Runs in Cursor's pages. Acts only when the page is inside this extension's side panel.
const extensionOrigin = `chrome-extension://${chrome.runtime.id}`;

if (window.top !== window && location.ancestorOrigins[0] === extensionOrigin) {
  window.addEventListener('message', async (event) => {
    if (event.origin !== extensionOrigin || event.data?.type !== 'cursor-bridge-insert') return;
    const filled = await fillPromptBox(event.data.text);
    if (!filled) {
      window.parent.postMessage({ type: 'cursor-bridge-no-prompt-box', text: event.data.text }, extensionOrigin);
    }
  });
  window.parent.postMessage({ type: 'cursor-bridge-ready' }, extensionOrigin);
}

// Cursor renders the prompt box after it loads, so wait up to 10 seconds for it.
async function fillPromptBox(text) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const promptBox = [...document.querySelectorAll('[data-lexical-editor][contenteditable="true"]')]
      .filter((box) => box.offsetParent !== null)
      .at(-1);
    if (promptBox) {
      // Cursor's prompt box is a Lexical editor, which keeps its text in its own state and
      // ignores a value set from script. Paste the text instead: Lexical takes a paste event
      // and keeps its line breaks. After text already in the box, start on a new line.
      promptBox.focus();
      const data = new DataTransfer();
      data.setData('text/plain', promptBox.innerText.trim() ? `\n${text}` : text);
      promptBox.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}
