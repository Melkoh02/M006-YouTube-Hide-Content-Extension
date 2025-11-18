const PATH_IS_VIDEOS_TAB = /\/(c\/[^/]+|channel\/[^/]+|@[^/]+)\/videos\b/;

const state = {hideMembers: true, hideShorts: false};

chrome.storage.sync.get(state).then(v => Object.assign(state, v));

chrome.storage.onChanged.addListener(changes => {
  let rerun = false;
  for (const k of ['hideMembers', 'hideShorts']) {
    if (changes[k]) {
      state[k] = changes[k].newValue;
      rerun = true;
    }
  }
  if (rerun) hideStuff();
});

const looksMembersOnly = el => {
  const text = el.textContent || "";
  if (/\bmembers?\s*only\b/i.test(text)) return true;
  if (el.querySelector('[aria-label*="Members only" i]')) return true;
  const badgeSelectors = [
    'ytd-badge-supported-renderer',
    '#overlays ytd-badge-supported-renderer',
    'ytd-rich-badge-renderer',
    'yt-badge-view-model'
  ];
  return badgeSelectors.some(sel => {
    const n = el.querySelector(sel);
    return n && (/\bmembers?\s*only\b/i.test(n.textContent || "") ||
      /members only/i.test(n.getAttribute('aria-label') || ""));
  });
};

// TODO: refactor this
const looksShorts = el => {
  const a = el.querySelector('a#thumbnail');
  if (a && /\/shorts\//.test(a.href)) return true;
  const overlay = el.querySelector('ytd-thumbnail-overlay-time-status-renderer, .badge-shorts');
  return !!(overlay && /shorts/i.test(overlay.textContent || ""));
};

function hideStuff(root = document) {
  if (!PATH_IS_VIDEOS_TAB.test(location.pathname)) return;

  const itemSelectors = [
    'ytd-rich-item-renderer',
    'ytd-grid-video-renderer',
    'ytd-compact-video-renderer'
  ];

  const items = root.querySelectorAll(itemSelectors.join(','));

  let hidden = 0;

  items.forEach(item => {
    item.style.display = '';
    item.dataset._ytCleanerHidden = '';

    const isMembers = looksMembersOnly(item);
    const isShort = looksShorts(item);

    const shouldHide =
      (state.hideMembers && isMembers) ||
      (state.hideShorts && isShort);

    if (shouldHide) {
      item.style.display = 'none';
      item.dataset._ytCleanerHidden = '1';
      hidden++;
    }
  });

  if (hidden) {
    console.info(`[YT Cleaner] Hid ${hidden} item(s).`, state);
  }
}

document.addEventListener('yt-navigate-finish', () => setTimeout(hideStuff, 0));

const mo = new MutationObserver(muts => {
  for (const m of muts) {
    for (const n of m.addedNodes || []) {
      if (n.nodeType === 1) hideStuff(n);
    }
  }
});
mo.observe(document.documentElement, {childList: true, subtree: true});

hideStuff();
