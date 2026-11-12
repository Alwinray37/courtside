export function createStorage(ctx) {
  const { DB, S, esc } = ctx;
/* ---------- persistence: everything lives in this browser ---------- */
const STORE_KEY = 'courtside-v1', OLD_STORE_KEY = 'svbc-lineup-builder-v1';   // older saves are read once and copied over
let saveT = null;
function loadStore() {
  try { const v = JSON.parse(localStorage.getItem(STORE_KEY) || localStorage.getItem(OLD_STORE_KEY) || 'null'); if (v && v.teams) Object.assign(DB, { v: 1, lineups: {}, ...v }); S.storeOk = true; }
  catch (e) { S.storeOk = false; }
}
function writeStore() {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    saveT = null;
    try { DB.savedAt = new Date().toISOString(); localStorage.setItem(STORE_KEY, JSON.stringify(DB)); S.storeOk = true; setSave('saved'); }
    catch (e) { S.storeOk = false; setSave('error', 'This browser won’t let the page save. Download a backup so you don’t lose your work.'); }
  }, 250);
}
// write any pending save right away if the page is closed, reloaded or backgrounded
function flushStore() { if (!saveT) return; clearTimeout(saveT); saveT = null; try { DB.savedAt = new Date().toISOString(); localStorage.setItem(STORE_KEY, JSON.stringify(DB)); } catch (e) {} }
addEventListener('pagehide', flushStore);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushStore(); });
function persist() {
  if (S.team) { DB.teams[S.team.id] = S.team; DB.lineups[S.team.id] = S.lineups; S.team.updatedAt = new Date().toISOString(); }
  DB.cur = S.team ? S.team.id : null;
  writeStore();
}
function setSave(state, msg = '') { S.save = { state, msg }; const el = document.getElementById('saveState'); if (el) el.outerHTML = saveBadge(); }
function saveLineup(L) { L.updatedAt = new Date().toISOString(); persist(); }
function saveTeam() { persist(); }
function retrySaves() { persist(); }
function saveBadge() {
  const s = S.save || { state: 'idle' };
  if (s.state === 'saved') return `<span id="saveState" class="pill ok" title="Saved on this device only. Download a backup to move it or keep it safe.">✓ Saved in this browser</span>`;
  if (s.state === 'error') return `<button id="saveState" class="pill err" data-act="backup" title="${esc(s.msg)}">Not saving · download a backup</button>`;
  return `<span id="saveState"></span>`;
}

  return { loadStore, writeStore, persist, saveLineup, saveTeam, saveBadge };
}
