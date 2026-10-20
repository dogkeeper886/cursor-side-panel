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

// The menu holds the skills in these groups.
const groups = [
  { id: 'word', title: 'Word level' },
  { id: 'sentence', title: 'Sentence level' },
  { id: 'paragraph', title: 'Paragraph level' },
];

// Each skill fills the prompt box with its prompt, the selected text in place of {{query}}.
const skills = [
  {
    id: 'skill-affirmative',
    group: 'word',
    title: 'Rewrite negative to affirmative',
    prompt: 'Rewrite negative to affirmative form keeps same meaning for following paragraph:\n\n"{{query}}"',
  },
  {
    id: 'skill-strike',
    group: 'word',
    title: 'Strike through redundancy and bloat',
    prompt: 'Strike though redundancy and bloat for following paragraph:\n\n"{{query}}"',
  },
  {
    id: 'skill-emphasis',
    group: 'word',
    title: 'Bold subject, italic action',
    prompt: 'Bold subject, italic its action for phrases in following paragraph:\n\n"{{query}}"',
  },
  {
    id: 'skill-character',
    group: 'sentence',
    title: 'Central character as subject, action as verb',
    prompt: 'Central character in subject position, important action in the verb for following paragraph:\n\n"{{query}}"',
  },
  {
    id: 'skill-nominalization',
    group: 'paragraph',
    title: 'Use nominalizations effectively',
    prompt: 'Use nominalizations effectively for following paragraph:\n\n"{{query}}"',
  },
  {
    id: 'skill-cohesion',
    group: 'paragraph',
    title: 'Cohesion: old to new information',
    prompt: 'Create cohesion by organizing information across sentences from old to new for following paragraph:\n\n"{{query}}"',
  },
  {
    id: 'skill-coherence',
    group: 'paragraph',
    title: 'Coherence: consistent topics',
    prompt: 'Create coherence with consistent topics at start of sentences for following paragraph:\n\n"{{query}}"',
  },
  {
    id: 'skill-stress',
    group: 'sentence',
    title: 'Complexity in the stress position',
    prompt: 'Locate complexity at the end of sentences, in the stress position for following paragraph:\n\n"{{query}}"',
  },
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'send', title: 'Send to Cursor', contexts: ['selection'] });
  chrome.contextMenus.create({
    id: 'send-selection',
    parentId: 'send',
    title: 'Selected text',
    contexts: ['selection'],
  });
  for (const { id, title } of groups) {
    chrome.contextMenus.create({ id, parentId: 'send', title, contexts: ['selection'] });
  }
  for (const { id, group, title } of skills) {
    chrome.contextMenus.create({ id, parentId: group, title, contexts: ['selection'] });
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const skill = skills.find(({ id }) => id === info.menuItemId);
  if (!skill && info.menuItemId !== 'send-selection') return;
  // Open the panel first: sidePanel.open must run within the click's user gesture.
  // A click inside the side panel has no tab, and the panel is open already.
  if (tab) chrome.sidePanel.open({ windowId: tab.windowId });
  // The panel picks the text up when its prompt box is ready.
  const pendingText = skill
    ? skill.prompt.replace('{{query}}', () => info.selectionText)
    : `${info.selectionText}\n\nSource: ${info.pageUrl}`;
  chrome.storage.session.set({ pendingText });
});
