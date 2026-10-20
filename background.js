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
