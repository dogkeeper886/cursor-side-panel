const chatFrame = document.querySelector('iframe');
let bridgeReady = false;
let fallbackTimer = null;

// Text from "Send to Cursor" waits in session storage until the prompt box can take it.
async function deliverPendingText() {
  const { pendingText } = await chrome.storage.session.get('pendingText');
  if (!pendingText) return;
  if (!bridgeReady) {
    // Without the bridge (the frame shows Cursor's sign-in page, say), offer the text to copy.
    clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(() => {
      if (!bridgeReady) offerCopy(pendingText);
    }, 10000);
    return;
  }
  await chrome.storage.session.remove('pendingText');
  chatFrame.contentWindow.postMessage(
    { type: 'cursor-bridge-insert', text: pendingText },
    new URL(chatFrame.src).origin,
  );
}

function offerCopy(text) {
  chrome.storage.session.remove('pendingText');
  document.getElementById('notice')?.remove();
  const notice = document.createElement('div');
  notice.id = 'notice';
  const copy = document.createElement('button');
  copy.textContent = 'Copy text';
  copy.addEventListener('click', async () => {
    await navigator.clipboard.writeText(text);
    notice.remove();
  });
  notice.append('Could not reach the prompt box. Paste the text yourself.', copy);
  document.body.prepend(notice);
}

window.addEventListener('message', (event) => {
  if (event.source !== chatFrame.contentWindow) return;
  if (event.data?.type === 'cursor-bridge-ready') {
    bridgeReady = true;
    deliverPendingText();
  } else if (event.data?.type === 'cursor-bridge-no-prompt-box') {
    offerCopy(event.data.text);
  }
});

deliverPendingText();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'session' && changes.pendingText?.newValue) deliverPendingText();
});
