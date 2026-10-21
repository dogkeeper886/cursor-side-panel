chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Cursor's pages and its sign-in pages refuse to load in a frame, through X-Frame-Options
// and the CSP frame-ancestors rule. Remove both headers only for frames outside tabs, such
// as this side panel, so Cursor in a normal tab keeps its protection.
// Session rules end with the browser, so add the rule each time the service worker starts.
chrome.declarativeNetRequest
  .updateSessionRules({
    removeRuleIds: [1],
    addRules: [
      {
        id: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            { header: 'x-frame-options', operation: 'remove' },
            { header: 'content-security-policy', operation: 'remove' },
          ],
        },
        condition: {
          requestDomains: ['cursor.com', 'cursor.sh', 'workos.com'],
          resourceTypes: ['sub_frame'],
          tabIds: [chrome.tabs.TAB_ID_NONE],
        },
      },
    ],
  })
  .catch((error) => console.error(error));

// Wakes the service worker at browser start so the rule is in place before the first click.
chrome.runtime.onStartup.addListener(() => {});

// The right-click menu comes from the menu folder. The service worker cannot list a folder,
// so menu-builder.html builds the menu in a background tab, which closes when done.
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({ url: 'menu-builder.html', active: false });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // Open the panel first: sidePanel.open must run within the click's user gesture.
  // A click inside the side panel has no tab, and the panel is open already.
  if (tab) chrome.sidePanel.open({ windowId: tab.windowId });
  // Each item's id is the path of its prompt file, so the prompt is read fresh on each click.
  const path = info.menuItemId.split('/').map(encodeURIComponent).join('/');
  const prompt = (await (await fetch(chrome.runtime.getURL(path))).text()).trimEnd();
  const values = { query: info.selectionText, url: info.pageUrl };
  // The panel picks the text up when its prompt box is ready.
  const pendingText = prompt.replace(/\{\{(query|url)\}\}/g, (match, name) => values[name]);
  chrome.storage.session.set({ pendingText });
});
