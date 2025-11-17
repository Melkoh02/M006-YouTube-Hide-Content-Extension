const DEFAULTS = {hideMembers: true, hideShorts: false};

async function load() {
  const stored = await chrome.storage.sync.get(DEFAULTS);
  document.getElementById('toggleMembers').checked = stored.hideMembers;
  document.getElementById('toggleShorts').checked = stored.hideShorts;
}

function save(key, value) {
  chrome.storage.sync.set({[key]: value});
  const s = document.getElementById('status');
  s.textContent = 'Saved';
  setTimeout(() => s.textContent = '', 800);
}

document.getElementById('toggleMembers').addEventListener('change', e => {
  save('hideMembers', e.target.checked);
});

document.getElementById('toggleShorts').addEventListener('change', e => {
  save('hideShorts', e.target.checked);
});

load();
