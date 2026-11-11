import { ENG, allP, RT } from './engine.js';
/* ===== App ===== */
(() => {
const SEASON_DEFAULT = '2026-27';
const GLOSSARY = [{"code": "High", "confirmed": true, "desc": "High ball to the left antenna. Easiest set off a bad pass; gives the hitter time but lets the block set up.", "h": 5, "oneFoot": false, "roles": ["OH", "OPP"], "row": "F", "tempo": 3, "x": 0.04}, {"code": "Hut", "confirmed": true, "desc": "Left-side set between a Go and a High: a little more time than a Go, still beats a slow middle.", "h": 3, "oneFoot": false, "roles": ["OH"], "row": "F", "tempo": 2, "x": 0.05}, {"code": "Go", "confirmed": false, "desc": "Fast outside set to the left antenna. Keeps their middle from closing.", "h": 2, "oneFoot": false, "roles": ["OH"], "row": "F", "tempo": 2, "x": 0.06}, {"code": "Rip", "confirmed": true, "desc": "Medium set between the left pin and the middle (a \"32\"). Often run over the top of a 3.", "h": 3, "oneFoot": false, "roles": ["OH", "OPP"], "row": "F", "tempo": 2, "x": 0.27}, {"code": "3", "confirmed": false, "desc": "Quick between the middle and the left (a \"31\" or Gap). Attacks the seam between their right-side and middle blockers.", "h": 1, "oneFoot": false, "roles": ["M", "OH"], "row": "F", "tempo": 1, "x": 0.4}, {"code": "Push 1", "confirmed": true, "desc": "Quick pushed a little left of a normal 1.", "h": 1, "oneFoot": false, "roles": ["M"], "row": "F", "tempo": 1, "x": 0.5}, {"code": "1", "confirmed": false, "desc": "Quick right in front of the setter. The hitter is in the air before the set.", "h": 1, "oneFoot": false, "roles": ["M"], "row": "F", "tempo": 1, "x": 0.6}, {"code": "Meter", "confirmed": true, "desc": "Lower, faster version of the 2 in the middle.", "h": 2, "oneFoot": false, "roles": ["M", "OH"], "row": "F", "tempo": 2, "x": 0.56}, {"code": "2", "confirmed": false, "desc": "Higher set in the middle. Forgiving off a so-so pass; the X/tandem set behind a quick.", "h": 3, "oneFoot": false, "roles": ["M", "OH"], "row": "F", "tempo": 2, "x": 0.54}, {"code": "Back 1", "confirmed": false, "desc": "Quick just behind the setter.", "h": 1, "oneFoot": false, "roles": ["M"], "row": "F", "tempo": 1, "x": 0.76}, {"code": "Back Gap", "confirmed": false, "desc": "Set in the gap behind the setter (a \"Back 2\").", "h": 2, "oneFoot": false, "roles": ["M", "OPP"], "row": "F", "tempo": 2, "x": 0.82}, {"code": "Slide", "confirmed": false, "desc": "Middle runs parallel to the net behind the setter and jumps off one foot. Stretches their middle to the right pin.", "h": 2, "oneFoot": true, "roles": ["M"], "row": "F", "tempo": 1, "x": 0.92}, {"code": "Red", "confirmed": false, "desc": "Fast set to the right antenna.", "h": 2, "oneFoot": false, "roles": ["OPP", "M", "OH"], "row": "F", "tempo": 2, "x": 0.94}, {"code": "5", "confirmed": true, "desc": "High set to the right antenna.", "h": 5, "oneFoot": false, "roles": ["OPP", "OH"], "row": "F", "tempo": 3, "x": 0.95}, {"code": "A", "confirmed": true, "desc": "Back-row attack from the left side (zone 5).", "h": 3, "oneFoot": false, "roles": ["OH"], "row": "B", "tempo": 2, "x": 0.12}, {"code": "30", "confirmed": true, "desc": "Back-row set into the seam between their middle blocker and their right-side blocker.", "h": 3, "oneFoot": false, "roles": ["OH", "OPP"], "row": "B", "tempo": 2, "x": 0.35, "seam": "L"}, {"code": "Pipe", "confirmed": true, "desc": "Back-row attack through the middle. Keeps their middle blocker home.", "h": 3, "oneFoot": false, "roles": ["OH", "OPP"], "row": "B", "tempo": 2, "x": 0.5}, {"code": "Bic", "confirmed": false, "desc": "Back-row quick through the middle. Lower and faster than a Pipe; pairs with a 1 or 3.", "h": 2, "oneFoot": false, "roles": ["OH"], "row": "B", "tempo": 1, "x": 0.5}, {"code": "40", "confirmed": true, "desc": "Back-row set into the seam between their middle blocker and their outside-hitter blocker.", "h": 3, "oneFoot": false, "roles": ["OH", "OPP"], "row": "B", "tempo": 2, "x": 0.65, "seam": "R"}, {"code": "D", "confirmed": false, "desc": "Back-row attack from the right side (zone 1).", "h": 3, "oneFoot": false, "roles": ["OPP", "OH"], "row": "B", "tempo": 2, "x": 0.86}, {"code": "4", "confirmed": true, "desc": "High ball to the left pin (the standard outside set). Easiest set off a bad pass; gives the hitter time but lets the block set up.", "h": 5, "oneFoot": false, "roles": ["OH", "OPP"], "row": "F", "tempo": 3, "x": 0.04}];
const ROLES = ['S', 'OH', 'M', 'OPP', 'L', 'DS'];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const SYS = {
  '5-1': { label: '5-1', d: 'One setter sets all six rotations.' },
  '5-2': { label: '5-2', d: 'Back-row setter swaps out for a front-row setter.' },
  '6-2': { label: '6-2', d: 'Two setters opposite; back-row one sets. Front-row one hits or subs out for a hitter.' },
  '4-2': { label: '4-2', d: 'Two setters opposite; front-row one sets.' }
};
const S = { team: null, lineups: [], cur: null, view: 'board', bd: { r: 1 }, ed: null, sug: null, ai: null, review: null, dlg: null,
  confirmDel: false, fixLog: null, publicCopy: false, fb: null, canWrite: true, sandbox: false, comments: null, remote: {}, db: null, sample: null, loadingTeam: true, loadingLu: true, dbMissing: false, live: null };
const sandboxed = new Set();
let dragging = null;

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const P = id => (S.team && (S.team.players.find(p => p.id === id) || (S.team.roster || []).find(p => p.id === id))) || { id, first: id, last: '', roles: [] };
const pool = () => (S.team && (S.team.roster || S.team.players)) || [];
const tokP = t => (S.team && S.team.sixMap && S.team.sixMap[t]) || t;
// what goes on a player's token: her jersey number, or her initials if she has no number
const jer = id => { const p = P(id); if (p && p.jersey) return String(p.jersey).replace(/^#/, '').trim(); const R = S.team && S.team.roster; return R && R.includes(p) ? (((p.first || '')[0] || '') + ((p.last || '')[0] || '')).toUpperCase() : ''; };
const nm = id => { const p = P(id), R = S.team && S.team.roster; if (R && R.includes(p) && p.last && R.some(q => q !== p && q.first === p.first)) return p.first + ' ' + p.last[0] + '.'; return p.first || id; };

/* positional labels shown in the circles: S1, OH1, OH2, MB1, MB2, RS1, L1, DS1 (numbered in roster order, so a second setter is S2) */
const POS_LABEL = { S: 'S', L: 'L', DS: 'DS', M: 'MB', OPP: 'OP', OH: 'OH' };
function lbl(id) { return (S.lblOv && S.lblOv[id]) || lblBase(id); }
function lblBase(id) {
  const ps = (S.team && S.team.players) || [], n = {}, tot = {}, out = {};
  ps.forEach(p => { const pre = POS_LABEL[(p.roles || [])[0]] || 'P'; tot[pre] = (tot[pre] || 0) + 1; });
  ps.forEach(p => { const pre = POS_LABEL[(p.roles || [])[0]] || 'P'; n[pre] = (n[pre] || 0) + 1; out[p.id] = tot[pre] > 1 ? pre + n[pre] : pre; });
  return out[id] || String(id);
}
const tokTxt = id => (S.liveTok && jer(id)) || lbl(id);
const lblStyle = id => tokTxt(id).length > 2 ? ' style="font-size:11px"' : '';

/* position color: middle, outside, opposite (setter and libero keep their own colors) */
function roleOf(L, id) {
  const ro = P(id).roles || [], lu = L || curL();
  if (ro.includes('M') && !ro.includes('OH') && !ro.includes('OPP')) return 'mid';
  if (ro.includes('S') && !ro.includes('OH') && !ro.includes('M')) return 'opp';
  const si = lu && lu.setters && lu.setters[0] ? lu.order.indexOf(lu.setters[0]) : -1, i = lu ? lu.order.indexOf(id) : -1;
  const k = si >= 0 && i >= 0 ? (i - si + 6) % 6 : -1;
  if (ro.includes('OPP') && !ro.includes('OH')) return 'opp';
  if (ro.includes('OH') && !ro.includes('OPP')) return 'out';
  if (ro.includes('OH') && ro.includes('OPP')) return k === 3 ? 'opp' : 'out';
  if (ro.includes('M')) return 'mid';
  return k === 3 ? 'opp' : (k === 2 || k === 5) ? 'mid' : (k === 1 || k === 4) ? 'out' : '';
}
const roleCls = (L, id) => { const r = S.roleOv && id in S.roleOv ? S.roleOv[id] : roleOf(L, id); return r ? 'role-' + r : ''; };

const full = id => `${P(id).first || id} ${P(id).last || ''}`.trim();
const G = code => S.team.glossary.find(g => g.code === code);
const curL = () => S.lineups.find(l => l.id === S.cur);
const isF = ENG.isFront;
const toast = msg => { document.querySelectorAll('.toast').forEach(x => x.remove()); const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); };
const titleOf = L => `${L.system} – ${L.name}`;
const shortName = () => { const n = (S.team && S.team.name) || 'Us'; const w = n.replace(/^\d+(\/\d+)?\s*/, ''); return (w || n).slice(0, 14); };

/* ---------- persistence: everything lives in this browser ---------- */
const STORE_KEY = 'courtside-v1', OLD_STORE_KEY = 'svbc-lineup-builder-v1';   // older saves are read once and copied over
let DB = { v: 1, teams: {}, lineups: {}, cur: null };
let saveT = null;
function loadStore() {
  try { const v = JSON.parse(localStorage.getItem(STORE_KEY) || localStorage.getItem(OLD_STORE_KEY) || 'null'); if (v && v.teams) DB = { v: 1, lineups: {}, ...v }; S.storeOk = true; }
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
function dlog() {}
function sig() { return ''; }
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
function deleteLineup(L) {
  S.lineups = S.lineups.filter(x => x.id !== L.id);
  S.cur = S.lineups[0] ? S.lineups[0].id : null;
  persist(); toast('Lineup deleted'); render();
}

/* ---------- derived ---------- */
function rotOf(L, r) { L.rotations[r - 1] = L.rotations[r - 1] || { r, spots: {}, calls: {}, libero: null, note: '' }; return L.rotations[r - 1]; }
function ensureSpots(L, r) {
  const rot = rotOf(L, r), c = ENG.court(L, r);
  Object.entries(c.zones).forEach(([z, id]) => {
    if (rot.spots[id]) return;
    if (c.libero && id === c.libero.id && rot.spots[c.libero.replaces]) { rot.spots[id] = rot.spots[c.libero.replaces].slice(); return; }
    const zx = { 4: .17, 3: .5, 2: .83, 5: .17, 6: .5, 1: .83 }[z];
    rot.spots[id] = [zx, isF(+z) ? .15 : .75];
  });
  return rot;
}
function issuesFor(L, r) { const rot = ensureSpots(L, r); return ENG.callCheck(L, r, S.team, rot); }
function statusOf(iss) {
  const e = iss.filter(i => i.level === 'error').length, w = iss.filter(i => i.level === 'warn').length;
  return e ? { cls: 'err', t: `${e} to fix` } : w ? { cls: 'warn', t: `${w} to check` } : { cls: 'ok', t: 'Legal' };
}
function lineupStatus(L) {
  let e = 0, w = 0;
  for (let r = 1; r <= 6; r++) issuesFor(L, r).forEach(i => { if (i.level === 'error') e++; else if (i.level === 'warn') w++; });
  return { e, w };
}


/* ---------- free attack lines (Board): one per player, stored per rotation as rot.lines[id] = { to: [x, y], off: [dx, dy] }.
   off bends the line: the curve's control point is the straight midpoint plus off. Until a rotation's lines are edited they come from the set calls. */
function derivedLines(L, r) {
  const rot = rotOf(L, r), c = ENG.court(L, r), out = {};
  Object.entries(c.zones).forEach(([z, id]) => {
    const code = rot.calls[id], g = code && S.team.glossary.find(x => x.code === code), sp = rot.spots[id];
    if (!g || !sp || id === c.setter) return;
    const to = g.row === 'F' ? [g.x, 0.05] : [g.x, ENG.ATTACK_LINE + 0.07];
    const ctrl = [sp[0], to[1] + (sp[1] - to[1]) * 0.45], mid = [(sp[0] + to[0]) / 2, (sp[1] + to[1]) / 2];
    out[id] = { to, off: [+(ctrl[0] - mid[0]).toFixed(3), +(ctrl[1] - mid[1]).toFixed(3)] };
  });
  return out;
}
function linesOf(L, r) { const rot = rotOf(L, r); return rot.lines || derivedLines(L, r); }
function linesMat(L, r) { const rot = rotOf(L, r); if (!rot.lines) rot.lines = derivedLines(L, r); return rot.lines; }
function lineGeo(from, ln) {
  const mid = [(from[0] + ln.to[0]) / 2, (from[1] + ln.to[1]) / 2], ctl = [mid[0] + ln.off[0], mid[1] + ln.off[1]];
  const F = [X(from[0]), Y(from[1])], C = [X(ctl[0]), Y(ctl[1])], T = [X(ln.to[0]), Y(ln.to[1])];
  let dx = C[0] - F[0], dy = C[1] - F[1], d = Math.hypot(dx, dy);
  if (d < 1) { dx = T[0] - F[0]; dy = T[1] - F[1]; d = Math.hypot(dx, dy) || 1; }
  const S0 = [F[0] + dx / d * 15, F[1] + dy / d * 15];
  const M = [.25 * F[0] + .5 * C[0] + .25 * T[0], .25 * F[1] + .5 * C[1] + .25 * T[1]];
  return { d: `M${S0[0].toFixed(1)},${S0[1].toFixed(1)} Q${C[0].toFixed(1)},${C[1].toFixed(1)} ${T[0].toFixed(1)},${T[1].toFixed(1)}`, T, M, short: Math.hypot(T[0] - S0[0], T[1] - S0[1]) < 6 };
}
function toggleLine(L, r, id) {
  const lines = linesMat(L, r), sp = rotOf(L, r).spots[id], z = ENG.court(L, r).zoneOf[id];
  if (lines[id]) delete lines[id];
  else if (sp) lines[id] = { to: [sp[0], isF(z) ? 0.05 : ENG.ATTACK_LINE + 0.07], off: [0, 0] };
  saveLineup(L);
}

/* ---------- court svg ---------- */
let svgN = 0;
const X0 = 24, Y0 = 22, CW = 252, CH = 180;
const X = x => X0 + x * CW, Y = y => Y0 + y * CH;
function courtSVG(L, r, opt = {}) {
  const id = 'c' + (++svgN);
  const rot = ensureSpots(L, r), c = ENG.court(L, r);
  const iss = opt.issues || ENG.callCheck(L, r, S.team, rot);
  const bad = new Set(), tight = new Set();
  iss.filter(i => i.kind === 'overlap').forEach(i => i.ids.forEach(x => (i.level === 'error' ? bad : tight).add(x)));
  const zoneNums = [[4, 1 / 6, 1 / 6], [3, .5, 1 / 6], [2, 5 / 6, 1 / 6], [5, 1 / 6, 2 / 3], [6, .5, 2 / 3], [1, 5 / 6, 2 / 3]];
  let s = `<svg class="courtsvg${opt.drag ? ' drag' : ''}${opt.board ? ' board-svg' : ''}" viewBox="0 0 300 ${Y0 + CH + 16}" role="img" aria-label="Rotation ${r} serve-receive formation" data-r="${r}" data-svg="${id}">`;
  s += `<defs>${['front', 'back', 'set'].map(k => `<marker id="${id}${k}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="h-${k}"/></marker>`).join('')}</defs>`;
  s += `<rect class="c-surface" x="${X0}" y="${Y0}" width="${CW}" height="${CH}" rx="1.5"/>`;
  zoneNums.forEach(([z, x, y]) => s += `<text class="c-zone" x="${X(x)}" y="${Y(y)}" text-anchor="middle" dominant-baseline="central">${z}</text>`);
  s += `<line class="c-ten" x1="${X0}" x2="${X0 + CW}" y1="${Y(1 / 3)}" y2="${Y(1 / 3)}"/>`;
  s += `<rect class="c-net" x="${X0 - 4}" y="${Y0 - 7}" width="${CW + 8}" height="6" rx="1.5"/>`;
  for (let i = 1; i < 26; i++) s += `<line class="c-mesh" x1="${X0 - 4 + i * (CW + 8) / 26}" x2="${X0 - 4 + i * (CW + 8) / 26}" y1="${Y0 - 6}" y2="${Y0 - 2}"/>`;
  s += `<rect x="${X0 - 1}" y="${Y0 - 15}" width="2" height="14" fill="var(--ten)"/><rect x="${X0 + CW - 1}" y="${Y0 - 15}" width="2" height="14" fill="var(--ten)"/>`;
  if (c.setter) s += `<circle class="tgt" cx="${X(.67)}" cy="${Y(.05)}" r="6" stroke-dasharray="2 2"/>`;
  // routes: free lines once drawn on the Board, otherwise the set calls
  const useLines = opt.board || !!rot.lines, LN = useLines ? linesOf(L, r) : null;
  if (useLines) Object.entries(LN).forEach(([pid, ln]) => {
    const sp = rot.spots[pid], z = c.zoneOf[pid]; if (!sp || z === undefined || !ln) return;
    const g = lineGeo(sp, ln), k = isF(z) ? 'front' : 'back'; if (g.short) return;
    s += `<path class="r-${k}" data-line="${esc(pid)}" d="${g.d}" marker-end="url(#${id}${k})"/>`;
  });
  if (!useLines) Object.entries(c.zones).forEach(([z, pid]) => {
    const code = rot.calls[pid];
    const rt = ENG.route(pid, code, S.team, c, rot.spots);
    if (!rt) return;
    const [fx, fy] = [X(rt.from[0]), Y(rt.from[1])], [tx, ty] = [X(rt.to[0]), Y(rt.to[1])];
    const c1 = [fx, fy - (fy - ty) * .55], c2 = [tx, ty + (fy - ty) * .45];
    let dx = c1[0] - fx, dy = c1[1] - fy, d = Math.hypot(dx, dy) || 1;
    if (d < 1) { dx = tx - fx; dy = ty - fy; d = Math.hypot(dx, dy) || 1; }
    const sx = fx + dx / d * 15, sy = fy + dy / d * 15;
    if (Math.hypot(tx - sx, ty - sy) < 6) return;
    s += `<path class="r-${rt.kind}" d="M${sx.toFixed(1)},${sy.toFixed(1)} C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)}" marker-end="url(#${id}${rt.kind})"/>`;
  });
  // where players stood before a fix
  const gh = opt.ghosts || {};
  Object.entries(gh).forEach(([pid, [from, to]]) => {
    s += `<line x1="${X(from[0]).toFixed(1)}" y1="${Y(from[1]).toFixed(1)}" x2="${X(to[0]).toFixed(1)}" y2="${Y(to[1]).toFixed(1)}" stroke="var(--ok)" stroke-width="1.6" stroke-dasharray="3 3"/>`;
    s += `<circle cx="${X(from[0]).toFixed(1)}" cy="${Y(from[1]).toFixed(1)}" r="12" fill="none" stroke="var(--ink-3)" stroke-width="1.4" stroke-dasharray="3 3" opacity=".8"/><text x="${X(from[0]).toFixed(1)}" y="${Y(from[1]).toFixed(1)}" text-anchor="middle" dominant-baseline="central" style="font-family:var(--display);font-weight:700;font-size:10px;fill:var(--ink-3)">${esc(pid)}</text>`;
  });
  // tokens (back row first so front row draws on top)
  const ordered = Object.entries(c.zones).sort((a, b) => (isF(+a[0]) ? 1 : 0) - (isF(+b[0]) ? 1 : 0));
  ordered.forEach(([z, pid]) => {
    const sp = rot.spots[pid]; if (!sp) return;
    const lib = c.libero && c.libero.id === pid;
    const cls = ['tok', pid === c.setter ? 'setter' : '', lib ? 'libero' : '', pid === c.setter || lib ? '' : roleCls(L, pid), bad.has(pid) ? 'bad' : tight.has(pid) ? 'tight' : gh[pid] ? 'moved' : ''].join(' ');
    s += `<g class="${cls}" data-id="${esc(pid)}" transform="translate(${X(sp[0]).toFixed(1)},${Y(sp[1]).toFixed(1)})"><title>${esc(full(pid))} · zone ${z}</title><circle class="ring" r="17"/><circle class="base" r="13.5"/><text${lblStyle(pid)}>${esc(tokTxt(pid))}</text>${opt.big ? `<text class="zonetxt" y="24">Z${z}</text>` : ''}</g>`;
  });
  if (opt.board && opt.drag) Object.entries(LN).forEach(([pid, ln]) => {     // handles: the end of the line, and a bend point in the middle
    const sp = rot.spots[pid]; if (!sp || c.zoneOf[pid] === undefined || !ln) return;
    const g = lineGeo(sp, ln);
    s += `<g class="lhg" data-lh="to" data-id="${esc(pid)}" transform="translate(${g.T[0].toFixed(1)},${g.T[1].toFixed(1)})"><circle r="13" fill="transparent"/><circle class="lh" r="5.5"/></g>`;
    s += `<g class="lhg" data-lh="c" data-id="${esc(pid)}" transform="translate(${g.M[0].toFixed(1)},${g.M[1].toFixed(1)})"><circle r="12" fill="transparent"/><circle class="lh lh-mid" r="3.6"/></g>`;
  });
  s += '</svg>';
  return s;
}

/* ---------- combo analysis (cached) ---------- */
const comboCache = new Map();
let teamKey = '';
function analysis(L, r) {
  const rot = ensureSpots(L, r), c = ENG.court(L, r);
  const key = [L.id, r, teamKey, JSON.stringify([rot.spots, rot.calls, rot.libero, rot.passers, L.order, L.swaps, L.subs, L.setters, L.system])].join('|');
  if (comboCache.has(key)) return comboCache.get(key);
  const opts = ENG.recommendTop(L, r, S.team, rot, { n: 3 });
  const onCourt = Object.fromEntries(Object.entries(rot.calls).filter(([id, code]) => code && c.zoneOf[id] !== undefined));
  const cur = ENG.evaluate(L, r, S.team, rot, onCourt);
  const top = Math.max(opts.length ? opts[0].top : 0, cur.raw);
  cur.score = ENG.scale(cur.raw, top);
  opts.forEach(o => o.score = ENG.scale(o.raw, top));
  const out = { opts, cur, calls: onCourt };
  if (comboCache.size > 300) comboCache.clear();
  comboCache.set(key, out);
  return out;
}
const TEMPO = { 1: 'Quick', 2: 'Fast', 3: 'High' };
const tempoColor = t => t === 1 ? 'var(--set)' : t === 2 ? 'var(--front)' : 'var(--ink-3)';
const blockCls = lbl => lbl === 'Open look' ? 'ok' : lbl === '1-on-1' ? 'warn' : 'err';
const hOf = g => g.h || ({ 1: 1, 2: 2, 3: 4 })[g.tempo] || 2;

// top-down picture of one combo: their block, the ball's path, our hitters' routes
function comboSVG(L, r, calls, ev) {
  const rot = ensureSpots(L, r), c = ENG.court(L, r);
  const X2 = x => 22 + x * 276, Y2 = y => 70 + y * 205;
  const sx = X2(SXT()), sy = Y2(0.07);
  let s = `<svg class="combosvg" viewBox="0 0 320 290" role="img" aria-label="Set combo diagram for rotation ${r}">`;
  // their side
  s += `<rect x="16" y="6" width="288" height="50" rx="6" fill="var(--rule-2)"/><text x="160" y="18" text-anchor="middle" class="ctag">THEIR BLOCK</text>`;
  const read = ev.read, G = code => S.team.glossary.find(g => g.code === code);
  const att = Object.entries(calls).map(([id, code]) => ({ id, g: G(code), z: c.zoneOf[id] })).filter(a => a.g && a.z !== undefined);
  const lane = x => x < 0.42 ? 'L' : x > 0.62 ? 'R' : 'M';
  const frontAt = l => att.filter(a => a.g.row === 'F' && lane(a.g.x) === l && !(read.quickId === a.id));
  const q = att.find(a => a.id === read.quickId), sl = att.find(a => a.id === read.slideId);
  const dbl = att.find(a => read.per[a.id] && read.per[a.id].b >= 1.5);
  const blk = [
    { k: 'RS', home: 0.18, to: (frontAt('L')[0] || {}).g ? Math.max(0.08, frontAt('L')[0].g.x) : 0.18, t: 'Their right-side blocker' },
    { k: 'MB', home: SXT(), to: q ? q.g.x : sl ? Math.max(SXT(), Math.min(0.95, sl.g.x) - 0.14) : dbl ? (dbl.g.x + SXT()) / 2 : SXT(), t: q ? `Their middle jumps with ${nm(q.id)}` : sl ? `Their middle stays inside their outside blocker on ${nm(sl.id)}’s slide` : 'Their middle reads the set' },
    { k: 'OH', home: 0.82, to: sl ? Math.min(0.95, sl.g.x) : (frontAt('R')[0] || {}).g ? Math.min(0.92, frontAt('R')[0].g.x) : 0.82, t: sl ? `Their outside blocker follows ${nm(sl.id)}’s slide` : 'Their outside blocker' }
  ];
  blk.forEach(b => {
    if (Math.abs(b.to - b.home) > 0.03) s += `<rect x="${X2(b.home) - 13}" y="26" width="26" height="16" rx="4" fill="none" stroke="var(--ink-3)" stroke-dasharray="2 2"/><path d="M${X2(b.home)},34 L${X2(b.to) + (b.to > b.home ? -15 : 15)},34" stroke="var(--ink-3)" stroke-width="1.2" marker-end="url(#cm-arr)"/>`;
    s += `<g><title>${esc(b.t)}</title><rect x="${X2(b.to) - 14}" y="25" width="28" height="18" rx="4" fill="var(--ink)"/><text x="${X2(b.to)}" y="34" text-anchor="middle" dominant-baseline="central" style="font-family:var(--display);font-weight:700;font-size:10px;fill:var(--bg)">${b.k}</text></g>`;
  });
  s += `<defs><marker id="cm-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--ink-3)"/></marker></defs>`;
  // net + our court
  s += `<rect x="16" y="60" width="288" height="6" rx="1.5" fill="var(--net)"/><rect x="21" y="52" width="2" height="16" fill="var(--ten)"/><rect x="297" y="52" width="2" height="16" fill="var(--ten)"/>`;
  s += `<rect x="22" y="68" width="276" height="205" fill="var(--court)" stroke="var(--court-line)" stroke-width="1.4"/><line x1="22" x2="298" y1="${Y2(1 / 3)}" y2="${Y2(1 / 3)}" stroke="var(--ten)" stroke-width="2"/>`;
  // non-attackers faint
  Object.entries(c.zones).forEach(([z, id]) => {
    if (calls[id] || id === c.setter) return;
    const sp = rot.spots[id]; if (!sp) return;
    s += `<g opacity=".45"><circle cx="${X2(sp[0])}" cy="${Y2(sp[1])}" r="10" fill="${c.libero && c.libero.id === id ? 'var(--lib)' : 'var(--ink-3)'}"/><text x="${X2(sp[0])}" y="${Y2(sp[1])}" text-anchor="middle" dominant-baseline="central" style="font-family:var(--display);font-weight:700;font-size:9px;fill:var(--bg)">${esc(id)}</text></g>`;
  });
  // routes + ball flights
  att.forEach(a => {
    const sp = rot.spots[a.id]; const hx = X2(a.g.x), hy = a.g.row === 'F' ? Y2(0.05) : Y2(0.42);
    if (sp) s += `<path d="M${X2(sp[0])},${Y2(sp[1])} Q${X2(sp[0])},${(Y2(sp[1]) + hy) / 2} ${hx},${hy + 12}" fill="none" stroke="var(--ink-3)" stroke-width="1.2" stroke-dasharray="1.5 3"/>`;
    const bulge = 10 + hOf(a.g) * 13;
    const mx = (sx + hx) / 2, my = Math.max(sy, hy) + bulge;
    s += `<path d="M${sx},${sy} Q${mx},${my} ${hx},${hy}" fill="none" stroke="${tempoColor(a.g.tempo)}" stroke-width="2.4" stroke-linecap="round" ${a.g.row === 'B' ? 'stroke-dasharray="6 4"' : ''}/>`;
  });
  // setter
  if (c.setter) s += `<circle cx="${sx}" cy="${sy}" r="11" fill="var(--sun)"/><text x="${sx}" y="${sy}" text-anchor="middle" dominant-baseline="central" style="font-family:var(--display);font-weight:700;font-size:10px;fill:var(--sun-ink)">${esc(c.setter)}</text>`;
  // hitters at contact; flip a label above the token when it would collide with a neighbor's
  const labs = [];
  att.slice().sort((p, q) => p.g.x - q.g.x).forEach(a => {
    const hx = X2(a.g.x), hy = a.g.row === 'F' ? Y2(0.05) : Y2(0.42);
    const below = !labs.some(l => Math.abs(l[0] - hx) < 48 && Math.abs(l[1] - hy) < 20 && l[2]);
    labs.push([hx, hy, below]); a._lab = below ? hy + 17 : hy - 31;
  });
  att.forEach(a => {
    const hx = X2(a.g.x), hy = a.g.row === 'F' ? Y2(0.05) : Y2(0.42);
    const pr = read.per[a.id] || { label: '' };
    const col = pr.label === 'Open look' ? 'var(--ok)' : pr.label === '1-on-1' ? 'var(--warn)' : 'var(--err)';
    s += `<g><title>${esc(nm(a.id))} – ${esc(a.g.code)}: ${esc(pr.why || '')}</title><circle cx="${hx}" cy="${hy}" r="15" fill="none" stroke="${col}" stroke-width="3"/><circle cx="${hx}" cy="${hy}" r="12" fill="var(--ink)"/><text x="${hx}" y="${hy}" text-anchor="middle" dominant-baseline="central" style="font-family:var(--display);font-weight:700;font-size:10.5px;fill:var(--bg)">${esc(a.id)}</text>
      <rect x="${hx - 22}" y="${a._lab}" width="44" height="14" rx="3" fill="var(--card)" stroke="${tempoColor(a.g.tempo)}"/><text x="${hx}" y="${a._lab + 7}" text-anchor="middle" dominant-baseline="central" style="font-family:var(--display);font-weight:700;font-size:10px;fill:var(--ink)">${esc(a.g.code)}</text></g>`;
  });
  s += '</svg>';
  return s;
}
function comboLegend() {
  return `<div class="legend" style="justify-content:flex-start"><span><svg viewBox="0 0 26 8"><line x1="1" y1="4" x2="25" y2="4" stroke="var(--set)" stroke-width="2.4"/></svg>Quick</span><span><svg viewBox="0 0 26 8"><line x1="1" y1="4" x2="25" y2="4" stroke="var(--front)" stroke-width="2.4"/></svg>Fast</span><span><svg viewBox="0 0 26 8"><line x1="1" y1="4" x2="25" y2="4" stroke="var(--ink-3)" stroke-width="2.4"/></svg>High</span><span><svg viewBox="0 0 26 8"><line x1="1" y1="4" x2="25" y2="4" stroke="var(--ink-3)" stroke-width="2.4" stroke-dasharray="6 4"/></svg>Back row</span>
  <span><svg viewBox="0 0 12 12" style="width:12px;height:12px"><circle cx="6" cy="6" r="4.5" fill="none" stroke="var(--ok)" stroke-width="2.5"/></svg>Open look</span><span><svg viewBox="0 0 12 12" style="width:12px;height:12px"><circle cx="6" cy="6" r="4.5" fill="none" stroke="var(--warn)" stroke-width="2.5"/></svg>1-on-1</span><span><svg viewBox="0 0 12 12" style="width:12px;height:12px"><circle cx="6" cy="6" r="4.5" fill="none" stroke="var(--err)" stroke-width="2.5"/></svg>Double block</span></div>`;
}
/* ---------- animated combo: start spots, routes and tempo ---------- */
const T_PASS = 0.35, T_SET = 1.1;
const SXT = () => ENG.setterX(S.team);
const AX = x => 22 + x * 276, AY = y => 76 + y * 200;     // court → svg
const mkAnim = k => ({ k, model: null, t: 0, playing: true, speed: 1, feature: 0, cycle: true, raf: null, last: 0 });
const anims = { top: mkAnim('top'), opt: mkAnim('opt') };
anims.top.playing = false; anims.top.fresh = true;
const ease = u => u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
const accel = u => u * u;
function hitTimeOf(g) {
  if (g.row === 'B') return T_SET + (g.tempo === 1 ? 0.5 : 0.75);
  return T_SET + (g.tempo === 1 ? 0.28 : g.tempo === 2 ? 0.62 : 1.05);
}
const approachStart = g => ENG.approachStart(g);
function buildModel(L, r, calls, ev, spotsOverride) {
  const rot = ensureSpots(L, r), c = ENG.court(L, r), G = code => S.team.glossary.find(g => g.code === code);
  const spots = spotsOverride || rot.spots;
  const hitters = Object.entries(calls).map(([id, code]) => ({ id, g: G(code) })).filter(h => h.g && c.zoneOf[h.id] !== undefined && spots[h.id])
    .sort((p, q) => (p.g.row === q.g.row ? p.g.x - q.g.x : p.g.row === 'F' ? -1 : 1));
  const on = Object.values(c.zones).filter(id => spots[id]);
  const passers = ENG.passersOf(L, r, S.team, rot).filter(id => spots[id]), showGo = ENG.srOpts(L, r, rot).showGo;
  // show & go: once she leaves, the real passers re-split the court so her lane is covered (the one next to her slides over most)
  const cov = {};
  if (showGo && spots[showGo]) {
    const line = passers.filter(id => spots[id]).sort((a, b) => spots[a][0] - spots[b][0]), n = line.length;
    line.forEach((id, k) => { const x = (k + 0.5) / n; if (Math.abs(x - spots[id][0]) > 0.02) cov[id] = [x, spots[id][1]]; });
  }
  const players = on.map(id => {
    const h = hitters.find(x => x.id === id), p0 = spots[id];
    if (id === c.setter) return { id, kind: 'setter', p0, p2: [SXT(), 0.07], tGo: 0, tHit: 0.85 };
    if (!h) return { id, kind: 'still', p0, cov: cov[id], passer: passers.includes(id) };
    const tHit = hitTimeOf(h.g), p1 = approachStart(h.g), p2 = [h.g.x, h.g.row === 'F' ? 0.05 : 0.4];
    const dApp = h.g.tempo === 1 ? 0.42 : 0.55;
    const tGo = passers.includes(id) ? T_PASS + 0.05 : id === showGo ? 0 : 0.12;   // passers hold until the ball is passed; show & go leaves on the serve
    return { id, kind: 'hitter', g: h.g, p0, cov: cov[id], p1, p2, tHit, tA: Math.max(tGo + 0.15, tHit - dApp), tGo, passer: passers.includes(id), read: (ev.read.per[id] || {}), route: ENG.routeM(p0, h.g) };
  });
  const T = Math.max(...players.map(p => p.tHit || 0)) + 1.1;
  // before the serve, everyone holds the receive formation; longer when someone shows pass then goes
  const T0 = showGo ? 0.9 : 0.3;
  // libero coverage after the pass: shadow the middle's route (default), the hitter getting the set, or stay home
  const segs = routeSegs(players), isDef = id => (c.libero && c.libero.id === id) || P(id).roles.includes('DS') || (L.subs || []).some(s => s.in === id);
  const onRoute = q => segs.some(([s0, s1]) => segDist(q, s0, s1) < 0.07);
  players.forEach(p => {
    if (!p.cov || !isDef(p.id) || p.kind === 'hitter') return;
    if (onRoute(p.cov)) { for (let d = 0.01; d <= 0.3; d += 0.01) { const a = [p.cov[0] + d, p.cov[1]], z = [p.cov[0] - d, p.cov[1]]; const ok = [a, z].filter(q => q[0] >= 0.05 && q[0] <= 0.95 && !onRoute(q)).sort((u, v) => Math.abs(u[0] - p.p0[0]) - Math.abs(v[0] - p.p0[0]))[0]; if (ok) { p.cov = ok; break; } } }
    let pth = planPath(p.p0, p.cov, segs);
    if (!pathClear(pth, segs)) { const dir = Math.sign(p.p0[0] - p.cov[0]); for (let x = p.cov[0]; Math.sign(p.p0[0] - x) === dir; x += dir * 0.01) { const q = [x, p.cov[1]]; if (!onRoute(q) && pathClear([p.p0, q], segs)) { p.cov = q; pth = [p.p0, q]; break; } } if (!pathClear(pth, segs)) { p.cov = p.p0.slice(); pth = [p.p0, p.p0]; } }
    if (pth.length > 2) p.covPath = pth;
  });
  // coverage after the pass: the libero and any DS each cover a hitter (the middle, whoever gets the set, or one named hitter)
  const hs = players.filter(p => p.kind === 'hitter');
  const mid = hs.find(h => h.id === ev.read.quickId && h.g.row === 'F') || hs.find(h => h.g.row === 'F' && P(h.id).roles.includes('M')) || hs.find(h => h.g.row === 'F' && h.g.tempo === 1) || null;
  const libId = c.libero && c.libero.id;
  const coverers = players.filter(p => p.kind === 'still' && p.id !== c.setter && !isF(c.zoneOf[p.id]) && (p.id === libId || isDef(p.id)));
  coverers.forEach(p => {
    p.segs = segs; p.backLanes = hs.filter(h => h.g.row === 'B').map(h => h.g.x); p.libMid = mid;
    p.covMode = S.team.coverMode === 'quick' && p.id === libId ? 'mb' : 'set';   // coach's choice: libero on the quick, or everyone behind the set
    p.isLib = p.id === libId;
  });
  // lanes for coverers whose hitter doesn't depend on the set
  const covLanes = [];
  const fixedT = p => p.covMode === 'mb' ? mid : p.covMode !== 'set' && p.covMode !== 'home' ? hs.find(h => h.id === p.covMode) : null;
  const byH = {};
  coverers.forEach(p => { const H = fixedT(p); if (H) (byH[H.id] = byH[H.id] || []).push(p); });
  coverers.forEach(p => covLanes.push({ id: p.id, lib: p.isLib }));
  const lp = libId ? players.find(p => p.id === libId) : null;
  const mover = Object.keys(cov).sort((a, b) => Math.abs(cov[b][0] - spots[b][0]) - Math.abs(cov[a][0] - spots[a][0]))[0] || null;
  const serveOrder = mover ? [mover].concat(passers.filter(x => x !== mover)) : passers;     // first serve goes to the lane she just covered
  return { L, r, players, hitters: players.filter(p => p.kind === 'hitter'), passers: serveOrder, showGo, mover, lib: lp || null, coverers, covLanes, setter: c.setter, T, T0, read: ev.read };
}
const T_COV = T_PASS * 0.8;
const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
function covAt(p, t) { if (!p.cov || t <= 0) return p.p0; const k = ease(Math.min(1, t / T_COV)); return p.covPath ? alongPath(p.covPath, k) : lerp(p.p0, p.cov, k); }
/* ---------- paths that never cross a back-row hitter's route (libero, DS) ---------- */
function routeSegs(players) { const segs = []; players.forEach(p => { if (p.kind === 'hitter' && p.g.row === 'B') { const s0 = p.cov || p.p0; segs.push([s0, p.p1], [p.p1, p.p2], [p.p2, [p.p2[0], 0.03]]); } }); return segs; }   // her route plus the lane in front of her to the net
function segDist(q, a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy; let u = L2 ? ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / L2 : 0; u = Math.max(0, Math.min(1, u)); return Math.hypot(q[0] - a[0] - u * dx, q[1] - a[1] - u * dy); }
function pathClear(pts, segs, ex) {
  ex = ex || pts[0];
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], c = pts[i], n = Math.max(2, Math.ceil(Math.hypot(c[0] - a[0], c[1] - a[1]) / 0.01));
    for (let k = 0; k <= n; k++) { const q = lerp(a, c, k / n); if (Math.hypot(q[0] - ex[0], q[1] - ex[1]) < 0.07) continue; if (segs.some(([s, e]) => segDist(q, s, e) < 0.05)) return false; } }
  return true;
}
function planPath(s, f, segs) {
  if (!segs.length) return [s, f];
  const side = d => [Math.min(0.95, Math.max(0.05, s[0] + d)), s[1]];
  const cands = [[s, f], [s, [s[0], 0.28], [f[0], 0.28], f], [s, [f[0], s[1]], f], [s, [s[0], f[1]], f]];
  [0.08, -0.08, 0.14, -0.14].forEach(d => { const q = side(d); cands.push([s, q, f], [s, q, [q[0], 0.28], [f[0], 0.28], f]); });   // step out of a lane first
  cands.push([s, [s[0], 0.97], [f[0], 0.97], f]);
  return cands.find(c => pathClear(c, segs)) || gridPath(s, f, segs) || cands[1];
}
// fallback: shortest way around on a grid, then straightened
function gridPath(s, f, segs) {
  const N = 50, cell = v => Math.max(0, Math.min(N - 1, Math.round(v * (N - 1)))), pt = (i, j) => [i / (N - 1), j / (N - 1)];
  const free = (i, j) => { const q = pt(i, j); if (Math.hypot(q[0] - s[0], q[1] - s[1]) < 0.07 || Math.hypot(q[0] - f[0], q[1] - f[1]) < 0.03) return true; return !segs.some(([a, c]) => segDist(q, a, c) < 0.055); };
  const si = cell(s[0]), sj = cell(s[1]), fi = cell(f[0]), fj = cell(f[1]), key = (i, j) => i * N + j;
  const prev = new Map([[key(si, sj), -1]]), q = [[si, sj]];
  for (let h = 0; h < q.length; h++) {
    const [i, j] = q[h]; if (i === fi && j === fj) break;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const a = i + di, c = j + dj; if (a < 0 || c < 0 || a >= N || c >= N || prev.has(key(a, c)) || !free(a, c)) continue;
      prev.set(key(a, c), key(i, j)); q.push([a, c]);
    }
  }
  if (!prev.has(key(fi, fj))) return null;
  const raw = []; for (let k = key(fi, fj); k !== -1; k = prev.get(k)) raw.unshift(pt(Math.floor(k / N), k % N));
  raw[0] = s; raw[raw.length - 1] = f;
  const out = [s]; let i = 0;
  while (i < raw.length - 1) { let j = raw.length - 1; while (j > i + 1 && !pathClear([raw[i], raw[j]], segs, s)) j--; out.push(raw[j]); i = j; }
  return out;
}
function alongPath(pts, u) {
  const lens = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(d); tot += d; }
  if (!tot) return pts[0].slice(); let d = u * tot;
  for (let i = 0; i < lens.length; i++) { if (d <= lens[i] || i === lens.length - 1) return lerp(pts[i], pts[i + 1], lens[i] ? Math.min(1, d / lens[i]) : 1); d -= lens[i]; }
  return pts[pts.length - 1].slice();
}
// where the libero is at time t when she covers hitter H: a step behind H's route, clear of back-row approach lanes
const coverDx = k => k === 0 ? 0 : (k % 2 ? 0.11 : -0.11) * Math.ceil(k / 2);     // two players covering one hitter stand side by side
function coverTarget(p, m, f) { if (p.covMode === 'home') return null; if (p.covMode === 'set') return f; if (p.covMode === 'mb') return p.libMid || f; return m.hitters.find(h => h.id === p.covMode) || f; }
function libFinal(p, H, dx = 0) {
  const iv = (p.backLanes || []).map(bx => [bx - 0.14, bx + 0.14]), inside = v => iv.some(([a, c]) => v > a && v < c);
  const bx = Math.min(0.95, Math.max(0.05, H.p2[0]));
  let fx = bx + dx; if (fx > 0.95 || fx < 0.05) fx = bx - dx;          // near an antenna, stand on the inside instead
  if (inside(fx)) { const cands = iv.flatMap(([a, c]) => [a, c]).filter(v => !inside(v) && v >= 0.05 && v <= 0.95); if (cands.length) fx = cands.sort((u, v) => Math.abs(u - fx) - Math.abs(v - fx))[0]; }
  return [fx, 0.3];                                                         // just behind the 10-ft line, behind her hitter
}
function libPath(p, H, dx = 0) {
  p._paths = p._paths || {}; const k = H.id + '|' + dx;
  if (!p._paths[k]) {
    const t0 = T_PASS + 0.05, s = covAt(p, t0), segs = p.segs || [], f = libFinal(p, H, dx);
    // if back-row lanes wall off that spot, use the closest spot she can reach without crossing one
    const xs = [f[0]].concat((p.backLanes || []).flatMap(bx => [bx - 0.14, bx + 0.14, bx - 0.2, bx + 0.2]), [0.05, 0.95, s[0]]).filter(x => x >= 0.05 && x <= 0.95).sort((a, b) => Math.abs(a - f[0]) - Math.abs(b - f[0]));
    let best = null;
    for (const x of xs) { const pth = planPath(s, [x, f[1]], segs); if (pathClear(pth, segs)) { best = pth; break; } }
    p._paths[k] = best || [s, s];
  }
  return p._paths[k];
}
function libAt(p, t, H, dx = 0) {
  const t0 = T_PASS + 0.05;
  if (!H || t <= t0) return covAt(p, t);
  return alongPath(libPath(p, H, dx), ease(Math.min(1, (t - t0) / Math.max(0.2, H.tHit + 0.1 - t0))));
}
function posAt(p, t) {
  if (p.kind === 'still') return covAt(p, t);
  if (p.kind === 'setter') { const u = Math.min(1, Math.max(0, t / p.tHit)); const k = ease(u); return [p.p0[0] + (p.p2[0] - p.p0[0]) * k, p.p0[1] + (p.p2[1] - p.p0[1]) * k]; }
  if (t <= p.tGo) return covAt(p, t);
  const s0 = p.cov || p.p0;
  if (t <= p.tA) { const k = ease((t - p.tGo) / (p.tA - p.tGo)); return lerp(s0, p.p1, k); }
  if (t <= p.tHit) { const k = accel((t - p.tA) / (p.tHit - p.tA)); return [p.p1[0] + (p.p2[0] - p.p1[0]) * k, p.p1[1] + (p.p2[1] - p.p1[1]) * k]; }
  return p.p2;
}
function animSVG(m, A) {
  const K = A.k;
  const tok = (id, cls) => `<g id="${K}-p-${esc(id)}" class="an-tok ${cls}"><circle r="12"/><text>${esc(lbl(id))}</text></g>`;
  let s = `<svg class="combosvg" id="${K}-svg" viewBox="0 0 320 300" role="img" aria-label="Animated set combo for rotation ${m.r}"><defs><marker id="${K}-cov" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--sun)"/></marker></defs>`;
  s += `<rect x="16" y="6" width="288" height="52" rx="6" fill="var(--rule-2)"/><text x="160" y="17" text-anchor="middle" class="ctag">THEIR BLOCK</text>`;
  ['RS', 'MB', 'OH'].forEach((k, i) => s += `<g id="${K}-b-${i}" transform="translate(${AX([0.18, 0.5, 0.82][i])},38)"><rect x="-14" y="-9" width="28" height="18" rx="4" fill="var(--ink)"/><text text-anchor="middle" dominant-baseline="central" style="font-family:var(--display);font-weight:700;font-size:10px;fill:var(--bg)">${k}</text></g>`);
  s += `<rect x="16" y="64" width="288" height="6" rx="1.5" fill="var(--net)"/><rect x="21" y="56" width="2" height="16" fill="var(--ten)"/><rect x="297" y="56" width="2" height="16" fill="var(--ten)"/>`;
  s += `<rect x="22" y="72" width="276" height="204" fill="var(--court)" stroke="var(--court-line)" stroke-width="1.4"/><line x1="22" x2="298" y1="${AY(1 / 3)}" y2="${AY(1 / 3)}" stroke="var(--ten)" stroke-width="2"/>`;
  s += `<circle cx="${AX(SXT())}" cy="${AY(0.07)}" r="7" fill="none" stroke="var(--set)" stroke-dasharray="2 2"/>`;
  // start spots (always visible) and route trails (revealed as each player runs)
  m.players.forEach(p => {
    if (p.kind === 'still' && !p.passer) return;
    s += `<circle cx="${AX(p.p0[0])}" cy="${AY(p.p0[1])}" r="11" fill="none" stroke="${p.passer || p.id === m.showGo ? 'var(--sun)' : 'var(--ink-3)'}" stroke-width="${p.passer ? 2 : 1.2}" stroke-dasharray="${p.id === m.showGo ? '6 3' : '2 2.5'}"/>`;
    if (p.id === m.showGo) s += `<text x="${AX(p.p0[0])}" y="${AY(p.p0[1]) - 16}" text-anchor="middle" style="font-family:var(--display);font-weight:700;font-size:9px;fill:var(--ink-2)">SHOW &amp; GO</text>`;
    if (p.cov) s += `<path d="M${(p.covPath || [p.p0, p.cov]).map(q => `${AX(q[0]).toFixed(1)},${AY(q[1]).toFixed(1)}`).join(' L')}" stroke="var(--sun)" stroke-width="2" stroke-dasharray="3 3" fill="none" marker-end="url(#${K}-cov)"/>`;
    if (p.kind === 'hitter') {
      const s0 = p.cov || p.p0;
      const d = `M${AX(s0[0])},${AY(s0[1])} L${AX(p.p1[0])},${AY(p.p1[1])} L${AX(p.p2[0])},${AY(p.p2[1])}`;
      s += `<path class="an-ghost${A.changed === p.id ? ' chg' : ''}" d="${d}" stroke="${tempoColor(p.g.tempo)}"/>`;
      s += `<path id="${K}-tr-${esc(p.id)}" class="an-trail" d="${d}" stroke="${tempoColor(p.g.tempo)}" ${p.g.row === 'B' ? 'data-back="1"' : ''}/>`;
    }
  });
  (m.covLanes || []).forEach(l => s += `<polyline id="${K}-cl-${esc(l.id)}" points="" fill="none" stroke="${l.lib ? 'var(--lib)' : 'var(--ink-2)'}" stroke-width="1.6" stroke-dasharray="3 3" opacity=".8"/>`);
  // contact labels (fade in at contact)
  m.hitters.forEach(p => {
    const x = AX(p.p2[0]), y = AY(p.p2[1]);
    const col = p.read.label === 'Open look' ? 'var(--ok)' : p.read.label === '1-on-1' ? 'var(--warn)' : 'var(--err)';
    const above = p.g.row === 'B';
    s += `<g id="${K}-l-${esc(p.id)}" opacity="0"><circle cx="${x}" cy="${y}" r="16" fill="none" stroke="${col}" stroke-width="3"/><rect x="${x - 21}" y="${above ? y + 17 : y + 16}" width="42" height="14" rx="3" fill="var(--card)" stroke="${tempoColor(p.g.tempo)}"/><text x="${x}" y="${(above ? y + 17 : y + 16) + 7}" text-anchor="middle" dominant-baseline="central" style="font-family:var(--display);font-weight:700;font-size:10px;fill:var(--ink)">${esc(p.g.code)}</text></g>`;
  });
  const mc = ENG.court(m.L, m.r);
  m.players.forEach(p => s += tok(p.id, (p.kind === 'setter' ? 'setter' : mc.libero && mc.libero.id === p.id ? 'libero' : roleCls(null, p.id)) + (p.kind === 'still' ? ' still' : '')));
  s += `<g id="${K}-ball"><ellipse id="${K}-shadow" rx="5" ry="2.2" fill="var(--ink)" opacity=".25"/><circle id="${K}-bc" r="5.2" fill="#FFFFFF" stroke="var(--sun)" stroke-width="2.2"/></g>`;
  s += '</svg>';
  return s;
}
function featureHitter(m, A) { if (A.featId) { const h = m.hitters.find(x => x.id === A.featId); if (h) return h; } return m.hitters.length ? m.hitters[((A.feature % m.hitters.length) + m.hitters.length) % m.hitters.length] : null; }
function ballAt(m, t, A) {
  const f = featureHitter(m, A); if (!f) return null;
  if (t < 0) return { x: AX(0.5), y: 2, lift: 0 };                 // in the server's hand
  const rid = m.passers.length ? m.passers[(A.serve || 0) % m.passers.length] : null;
  const pas = m.players.find(p => p.id === rid), pp = pas ? posAt(pas, T_PASS) : [0.5, 0.7];
  const tgt = [SXT(), 0.07];
  const arc = (a, b, u, hpx) => ({ x: AX(a[0] + (b[0] - a[0]) * u), y: AY(a[1] + (b[1] - a[1]) * u), lift: Math.sin(Math.PI * u) * hpx });
  if (t < T_PASS) { const u = t / T_PASS; return { x: AX(0.5) + (AX(pp[0]) - AX(0.5)) * u, y: 0 + (AY(pp[1]) - 0) * u, lift: Math.sin(Math.PI * u) * 10 }; }
  if (t < T_SET) return arc(pp, tgt, (t - T_PASS) / (T_SET - T_PASS), 34);
  if (t < f.tHit) return arc(tgt, f.p2, (t - T_SET) / (f.tHit - T_SET), 6 + hOf(f.g) * 9);
  const u = Math.min(1, (t - f.tHit) / 0.25), land = [f.p2[0] + (0.5 - f.p2[0]) * 0.15, -0.28];
  return u >= 1 ? null : { x: AX(f.p2[0] + (land[0] - f.p2[0]) * u), y: AY(f.p2[1] + (land[1] - f.p2[1]) * u), lift: 0 };
}
function blockAt(m, t, i, A) {
  const home = [0.18, SXT(), 0.82][i];
  const q = m.read.quickId && m.hitters.find(h => h.id === m.read.quickId), f = featureHitter(m, A);
  const lane = x => x < 0.42 ? 0 : x > 0.62 ? 2 : 1;
  let to = home, when = T_SET + 0.6;
  const sl = m.read.slideId && m.hitters.find(h => h.id === m.read.slideId);
  // their outside blocker mirrors the slide along the net; their middle stays just inside her unless a middle quick holds her
  // she picks up the slider as the slider leaves for her approach, then runs with her along the net
  const ohX = tt => Math.min(0.95, Math.max(0.45, posAt(sl, tt)[0]));
  const s0 = sl ? Math.max(T_PASS, sl.tGo) : 0;
  if (sl && i === 2) { if (t <= s0) return home; const u = Math.min(1, (t - s0) / 0.35); return home + (ohX(t) - home) * ease(u); }
  if (sl && i === 1 && !q) { if (t <= s0) return home; const u = Math.min(1, (t - s0) / 0.35); return home + (Math.min(home + 0.2, Math.max(0.3, ohX(t) - 0.14)) - home) * ease(u); }
  if (i === 1) { if (q) { to = q.g.x; when = q.tHit; } else if (f) { to = (f.g.x + home) / 2; when = f.tHit + 0.15; } }
  else { const h = m.hitters.find(x => x.g.row === 'F' && lane(x.g.x) === i && x !== q); if (h) { to = Math.min(0.92, Math.max(0.08, h.g.x)); when = h.tHit; } }
  const start = T_SET - 0.05; if (t <= start) return home;
  const u = Math.min(1, (t - start) / Math.max(0.1, when - start));
  return home + (to - home) * ease(u);
}
function drawFrame(A) {
  const m = A.model, K = A.k, $id = s => document.getElementById(K + s); if (!m || !$id('-svg')) return;
  const t = A.t - (m.T0 || 0), f = featureHitter(m, A);
  const covNow = new Map(), seen = {};
  (m.coverers || []).forEach(p => { const H = coverTarget(p, m, f); if (!H) return; const k = seen[H.id] = (seen[H.id] === undefined ? 0 : seen[H.id] + 1); covNow.set(p, { H, dx: coverDx(k) });
    const ln = $id('-cl-' + p.id); if (ln) { const key = H.id + '|' + coverDx(k); if (ln._k !== key) { ln._k = key; ln.setAttribute('points', libPath(p, H, coverDx(k)).map(q => `${AX(q[0]).toFixed(1)},${AY(q[1]).toFixed(1)}`).join(' ')); } } });
  m.players.forEach(p => {
    const g = $id('-p-' + p.id); if (!g) return;
    g.classList.toggle('showing', p.id === m.showGo && t < 0.05);
    const cv = covNow.get(p), pos = cv ? libAt(p, t, cv.H, cv.dx) : posAt(p, t); g.setAttribute('transform', `translate(${AX(pos[0]).toFixed(1)},${AY(pos[1]).toFixed(1)})`);
    if (p.kind === 'hitter') {
      const tr = $id('-tr-' + p.id);
      if (tr) { const len = tr._len || (tr._len = tr.getTotalLength()); const u = t <= p.tGo ? 0 : Math.min(1, (t - p.tGo) / (p.tHit - p.tGo)); tr.style.strokeDasharray = `${len}`; tr.style.strokeDashoffset = `${len * (1 - u)}`; }
      const lab = $id('-l-' + p.id); if (lab) lab.setAttribute('opacity', t >= p.tHit ? '1' : '0');
      g.classList.toggle('feat', f === p);
    }
  });
  [0, 1, 2].forEach(i => { const b = $id('-b-' + i); if (b) b.setAttribute('transform', `translate(${AX(blockAt(m, t, i, A)).toFixed(1)},38)`); });
  const ball = ballAt(m, t, A), bg = $id('-ball');
  if (bg) {
    bg.style.display = ball ? '' : 'none';
    if (ball) { $id('-shadow').setAttribute('cx', ball.x); $id('-shadow').setAttribute('cy', ball.y + 3); const bc = $id('-bc'); bc.setAttribute('cx', ball.x); bc.setAttribute('cy', ball.y - ball.lift); }
  }
  const prog = $id('-prog'); if (prog) prog.style.width = `${Math.max(0, Math.min(100, (t / m.T) * 100))}%`;
  const ph = $id('-phase');
  const rcv = m.passers.length ? m.passers[(A.serve || 0) % m.passers.length] : null;
  if (ph) ph.textContent = t < 0 ? (m.showGo ? `Show: ${nm(m.showGo)} lines up like a passer…` : 'Serve receive formation') : m.showGo && t < T_PASS ? `Go: ${nm(m.showGo)} leaves for her approach${m.mover ? `; ${nm(m.mover)} slides over to cover her lane` : ''}. Serve to ${rcv ? nm(rcv) : 'the passers'}` : t < T_PASS ? `Serve to ${rcv ? nm(rcv) : 'the passers'}` : t < T_SET ? 'Pass to the setter; hitters move to their approach' : f && t < f.tHit ? `Set to ${nm(f.id)} – ${f.g.code} (${TEMPO[f.g.tempo].toLowerCase()})${[...covNow.entries()].map(([p, v]) => ` · ${nm(p.id)} covers ${nm(v.H.id)}`).join('')}` : f ? `${nm(f.id)} hits: ${f.read.label || ''}` : '';
  const pb = $id('-play'); if (pb) pb.textContent = A.playing ? 'Pause' : 'Play';
}
function tickFor(A) {
  return now => {
    A.raf = null;
    const m = A.model; if (!m || !document.getElementById(A.k + '-svg')) return;
    const dt = A.last ? Math.min(0.05, (now - A.last) / 1000) : 0; A.last = now;
    if (A.playing) {
      A.t += dt * A.speed * 0.55;          // real volleyball is fast; slow it down to read
      if (A.t > m.T + (m.T0 || 0)) { A.t = 0; A.serve = (A.serve || 0) + 1; if (A.cycle) A.feature++; }
    }
    drawFrame(A);
    if (A.playing) A.raf = requestAnimationFrame(tickFor(A));
  };
}
function startAnim() {
  Object.values(anims).forEach(A => {
    if (A.raf) { cancelAnimationFrame(A.raf); A.raf = null; }
    if (!A.model || !document.getElementById(A.k + '-svg')) return;
    A.last = 0;
    if (A.fresh) { A.fresh = false; if (!A.playing) A.t = A.model.T + (A.model.T0 || 0) - 0.6; }   // top court opens on the finished picture
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches && A.t === 0) { A.playing = false; A.t = A.model.T + (A.model.T0 || 0) - 0.6; }
    drawFrame(A);
    if (A.playing) A.raf = requestAnimationFrame(tickFor(A));
  });
}
function timeline(m, A) {
  const K = A.k;
  let lastX = -1, alt = false;
  const mk = (t, label, col) => { const x = (t / m.T) * 100; alt = x - lastX < 9 ? !alt : false; lastX = x; return `<span class="tl-mk" style="left:${x}%"><i style="background:${col}"></i><b style="top:${alt ? 46 : 32}px">${label}</b></span>`; };
  const f = featureHitter(m, A);
  return `<div class="tl"><div class="tl-bar"><i id="${K}-prog" class="tl-prog"></i>${mk(T_PASS, 'Pass', 'var(--ink-3)')}${mk(T_SET, 'Set', 'var(--sun)')}${[...new Set(m.hitters.map(h => h.tHit))].map(tt => { const hs = m.hitters.filter(h => h.tHit === tt); return mk(tt, hs.map(h => esc(h.id)).join(' · '), tempoColor(hs[0].g.tempo)); }).join('')}</div>
    <div class="tl-ctl"><button class="btn primary" id="${K}-play" data-act="an-play" data-ak="${K}">${A.playing ? 'Pause' : 'Play'}</button><button class="btn ghost" data-act="an-replay" data-ak="${K}">Replay</button>
    <span class="small">Ball to:</span><button class="rchip" aria-pressed="${A.cycle}" data-act="an-cycle" data-ak="${K}">Each in turn</button>${m.hitters.map((h, i) => `<button class="rchip" aria-pressed="${!A.cycle && f === h}" data-act="an-feat" data-ak="${K}" data-i="${i}">${esc(nm(h.id))}</button>`).join('')}
     <button class="rchip" aria-pressed="${A.speed === 0.5}" data-act="an-speed" data-ak="${K}">Slow-mo</button></div>
    <p class="small" id="${K}-phase" style="margin:6px 0 0;min-height:18px"></p></div>`;
}

function designer(L, r) {
  const an = analysis(L, r), pick = S.ed.opt === undefined ? 'cur' : S.ed.opt;
  const list = [{ k: 'cur', label: 'Current', o: { calls: an.calls, ...an.cur } }].concat(an.opts.map((o, i) => ({ k: i, label: `Option ${'ABC'[i]}`, o })));
  const sel = list.find(x => x.k === pick) || list[0];
  const o = sel.o, read = o.read;
  const G = code => S.team.glossary.find(g => g.code === code);
  const c = ENG.court(L, r);
  const rows = Object.entries(o.calls).map(([id, code]) => ({ id, code, g: G(code), pr: read.per[id], f: o.fits[id], z: c.zoneOf[id] })).filter(x => x.g)
    .sort((a, b) => (a.g.row === b.g.row ? a.g.x - b.g.x : a.g.row === 'F' ? -1 : 1));
  const same = sel.k !== 'cur' && JSON.stringify(Object.entries(o.calls).sort()) === JSON.stringify(Object.entries(an.calls).sort());
  return `<div class="designer">
    <div class="dhead"><h3 style="margin:0">Set combos for rotation ${r}</h3><span class="small">Click through the options to watch each one. When you’ve picked a combo, use <b>Set as rotation ${r}</b> and it moves to the top. Players start in their serve-receive spots (dashed circles) and run their routes on the tempo of their set.</span></div>
    <div class="dtabs" role="tablist">${list.map(x => `<button role="tab" aria-selected="${x.k === sel.k}" data-opt="${x.k}"><b>${x.label}</b><span class="mono">${x.o.score}</span><small>${esc((x.o.plays || [])[0] || (x.k === 'cur' ? 'what you have' : ''))}</small></button>`).join('')}</div>
    <div class="dgrid"><div class="dsvg">${(() => { const A = anims.opt; A.model = buildModel(L, r, o.calls, o, o.spots); return animSVG(A.model, A) + timeline(A.model, A); })()}${comboLegend()}</div>
    <div class="ddetail">
      <div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap"><span class="bignum mono">${o.score}</span>${(o.plays || []).map(p => `<span class="pill neutral">${esc(p)}</span>`).join('')}</div>
      <p class="small" style="margin:6px 0 4px"><b>Passers:</b> ${ENG.passersOf(L, r, S.team, rotOf(L, r)).map(nm).join(', ')}${o.spots ? ' · <b>lined up for these sets</b>: yellow dashed rings are passers’ start spots' : ''}</p>
      <p class="small" style="margin:0 0 10px">${read.quickId ? `Their middle has to jump with <b>${esc(nm(read.quickId))}</b>’s quick, which frees the others.${read.slideId ? ` Their outside blocker follows <b>${esc(nm(read.slideId))}</b>’s slide.` : ''}` : read.slideId ? `Their outside blocker follows <b>${esc(nm(read.slideId))}</b>’s slide and their middle stays just inside her, which pulls the block right and thins out our left side.` : '<b>Nothing holds their middle blocker</b>, so she can help on every set.'} ${read.attackers} attackers against 3 blockers.${o.crossings ? ` ${o.crossings} route${o.crossings > 1 ? 's' : ''} cross.` : ''}</p>
      ${sel.k !== 'cur' && S.canWrite ? (same ? '<p class="small" style="margin:0 0 10px">This is already rotation ' + r + '’s combo.</p>' : `<div class="btnrow" style="margin:0 0 12px"><button class="btn primary" data-act="use-opt" data-k="${sel.k}">Set ${sel.label} as rotation ${r}</button></div>`) : ''}
      <ul class="hitlist">${rows.map(x => `<li><span class="chipi">${esc(lbl(x.id))}</span><div><div><b>${esc(nm(x.id))}</b> <span class="what">${esc(x.code)}</span> <span class="tag ${x.g.row}">${x.g.row === 'F' ? 'FRONT' : 'BACK'}</span> <span class="tag" style="color:${tempoColor(x.g.tempo)}">${TEMPO[x.g.tempo].toUpperCase()}</span>${x.pr ? ` <span class="pill ${blockCls(x.pr.label)}" style="padding:1px 8px;font-size:12px">${esc(x.pr.label)}</span>` : ''}</div>
        <div class="small"><b>${(() => { const sp = (o.spots || rotOf(L, r).spots)[x.id]; return sp ? ENG.routeM(sp, x.g).toFixed(1) + ' m route' : ''; })()}</b>${ENG.passersOf(L, r, S.team, rotOf(L, r)).includes(x.id) ? ' · passing first' : ''} · ${esc(x.pr ? x.pr.why : '')}${x.f && x.f.why.length ? ` · ${esc(x.f.why.join(', '))}` : ''}</div>${x.f && x.f.warn.length ? `<div class="small" style="color:var(--warn)">${esc(x.f.warn.join('. '))}</div>` : ''}</div></li>`).join('')}</ul>

    </div></div></div>`;
}

/* ---------- set library ---------- */
function libraryView() {
  S.lib = S.lib || { f: 'all', who: '', sel: null };
  const F = S.lib, gl = S.team.glossary;
  const show = gl.filter(g => F.f === 'all' || (F.f === 'front' && g.row === 'F') || (F.f === 'back' && g.row === 'B') || (F.f === 'quick' && g.tempo === 1) || (F.f === 'pins' && (g.x < 0.15 || g.x > 0.85)));
  const W = 640, X3 = x => 34 + x * 572, netTop = 206, hitY = 176;
  const px = X3(SXT()), py = 198;
  const who = F.who ? P(F.who) : null;
  const fitOf = g => who ? ENG.setFit(who, g, null, null, SXT()) : null;
  let s = `<svg class="libsvg" viewBox="0 0 ${W} 290" role="img" aria-label="Every set, seen from the front of the net">`;
  s += `<text x="${X3(0)}" y="284" class="ctag">LEFT (ZONE 4)</text><text x="${X3(0.5)}" y="284" text-anchor="middle" class="ctag">MIDDLE (ZONE 3)</text><text x="${X3(1)}" y="284" text-anchor="end" class="ctag">RIGHT (ZONE 2)</text>`;
  for (let i = 0; i <= 40; i++) s += `<line x1="${X3(i / 40)}" x2="${X3(i / 40)}" y1="${netTop}" y2="262" stroke="var(--rule)" stroke-width="1"/>`;
  for (let j = 0; j < 6; j++) s += `<line x1="${X3(0)}" x2="${X3(1)}" y1="${netTop + 10 + j * 9}" y2="${netTop + 10 + j * 9}" stroke="var(--rule)" stroke-width="1"/>`;
  s += `<rect x="${X3(0)}" y="${netTop - 4}" width="${X3(1) - X3(0)}" height="8" fill="var(--net)"/>`;
  [0, 1].forEach(e => { for (let k = 0; k < 9; k++) s += `<rect x="${X3(e) - 2}" y="${netTop - 70 + k * 10}" width="4" height="10" fill="${k % 2 ? 'var(--card)' : 'var(--ten)'}"/>`; });
  // arcs: peak height by set height; labels at the peak, nudged apart
  const placed = [];
  const arcs = show.map(g => {
    const hx = X3(g.x), hy = g.row === 'B' ? hitY + 8 : hitY, peak = hitY - 18 - hOf(g) * 26;
    const cyy = 2 * peak - (py + hy) / 2, cx = (px + hx) / 2;
    let lx = cx, ly = peak - 8;
    for (let t = 0; t < 14 && placed.some(p => Math.abs(p[0] - lx) < 44 && Math.abs(p[1] - ly) < 19); t++) ly += (t % 2 ? -1 : 1) * 19 * (t + 1) / 1, ly = Math.max(14, Math.min(hitY - 24, ly));
    placed.push([lx, ly]);
    const f = fitOf(g);
    const col = who ? (f.s >= 1 ? 'var(--ok)' : f.warn.some(w => /off-hand/.test(w)) || f.s < -3 ? 'var(--err)' : 'var(--ink-3)') : tempoColor(g.tempo);
    return { g, d: `M${px},${py} Q${cx},${cyy} ${hx},${hy}`, hx, hy, lx, ly, col };
  });
  arcs.forEach(a => {
    const on = !F.sel || F.sel === a.g.code;
    s += `<g class="arc" data-set="${esc(a.g.code)}" opacity="${on ? 1 : 0.18}" style="cursor:pointer"><path d="${a.d}" fill="none" stroke="transparent" stroke-width="6"/><path d="${a.d}" fill="none" stroke="${a.col}" stroke-width="${F.sel === a.g.code ? 3.6 : 2.2}" stroke-linecap="round" ${a.g.row === 'B' ? 'stroke-dasharray="7 5"' : ''}/>
      <circle cx="${a.hx}" cy="${a.hy}" r="4" fill="${a.col}"/>
      <rect x="${a.lx - 19}" y="${a.ly - 9}" width="38" height="17" rx="4" fill="var(--card)" stroke="${a.col}"/><text x="${a.lx}" y="${a.ly}" text-anchor="middle" dominant-baseline="central" style="font-family:var(--display);font-weight:700;font-size:11px;fill:var(--ink)">${esc(a.g.code)}</text></g>`;
  });
  s += `<circle cx="${px}" cy="${py}" r="9" fill="var(--sun)"/><text x="${px}" y="${py + 20}" text-anchor="middle" class="ctag">SETTER</text></svg>`;
  const selG = F.sel && gl.find(g => g.code === F.sel);
  const players = S.team.players.filter(p => !p.roles.includes('L'));
  let detail = `<div class="card"><div class="eyebrow">Pick a set</div><p class="small" style="margin:6px 0 0">Tap any arc to see what it is and who on the roster fits it best. Every player can be given any set; the tool just ranks who fits.</p></div>`;
  if (selG) {
    const ranked = players.filter(p => selG.row === 'F' || p.backRow || p.roles.includes('S')).map(p => ({ p, f: ENG.setFit(p, selG, null, null, SXT()) })).sort((a, b) => b.f.s - a.f.s);
    const usedN = S.lineups.reduce((n, L) => n + L.rotations.filter(r => r && Object.values(r.calls || {}).includes(selG.code)).length, 0);
    detail = `<div class="card"><div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><span style="font-family:var(--display);font-weight:800;font-size:34px;line-height:1">${esc(selG.code)}</span><span class="tag ${selG.row}">${selG.row === 'F' ? 'FRONT ROW' : 'BACK ROW'}</span><span class="tag" style="color:${tempoColor(selG.tempo)}">${TEMPO[selG.tempo].toUpperCase()}</span>${selG.oneFoot ? '<span class="tag" style="color:var(--ink-2)">ONE-FOOT</span>' : ''}</div>
      <p style="margin:8px 0">${esc(selG.desc)}</p>
      <p class="small">${selG.x > SXT() + 0.02 ? 'Set behind the setter: on-hand for lefties.' : selG.x < SXT() - 0.1 ? 'Set in front of the setter: on-hand for righties; the ball crosses a lefty’s body.' : 'Set right at the setter.'} Used ${usedN} time${usedN === 1 ? '' : 's'} in your saved lineups.</p>
      <div class="sec"><h3>Best fits on ${esc(S.team.name)}</h3><ul class="hitlist">${ranked.slice(0, 5).map(x => `<li><span class="chipi ${x.p.roles.includes('S') ? 's' : ''}">${esc(lbl(x.p.id))}</span><div><b>${esc(x.p.first)}</b> <span class="small">${esc(x.p.roles.join('/'))}${x.p.hand === 'L' ? ' · lefty' : ''}</span><div class="small">${esc(x.f.why.join(', ') || 'Can run it')}</div>${x.f.warn.length ? `<div class="small" style="color:var(--warn)">${esc(x.f.warn.join('. '))}</div>` : ''}</div></li>`).join('')}</ul></div></div>`;
  }
  const chip = (k, t) => `<button class="rchip" aria-pressed="${F.f === k}" data-libf="${k}">${t}</button>`;
  return `<div class="card libcard"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center">
      <div><div class="eyebrow">Set library · seen from the front of the net</div><div class="small">Arc height shows how high the set goes. Dashed arcs are back-row attacks.</div></div>
      <div class="btnrow" style="align-items:center">${chip('all', 'All')}${chip('front', 'Front row')}${chip('back', 'Back row')}${chip('quick', 'Quicks')}${chip('pins', 'Pins')}
      <select id="libWho" style="width:auto"><option value="">Color by tempo</option>${players.map(p => `<option value="${esc(p.id)}" ${F.who === p.id ? 'selected' : ''}>Fit for ${esc(p.first)}${p.hand === 'L' ? ' (lefty)' : ''}</option>`).join('')}</select></div></div>
    <div class="tscroll">${s}</div>
    <div class="btnrow" style="margin:6px 0 4px" aria-label="Sets">${show.map(g => `<button class="rchip" aria-pressed="${F.sel === g.code}" data-set="${esc(g.code)}">${esc(g.code)}</button>`).join('')}</div>
    ${who ? `<div class="legend" style="justify-content:flex-start"><span style="color:var(--ok)">● Good fit for ${esc(who.first)}</span><span style="color:var(--ink-3)">● Neutral</span><span style="color:var(--err)">● Off-hand or hard to get to</span></div>` : comboLegend().replace(/<span><svg viewBox="0 0 12 12"[\s\S]*$/, '</div>')}
  </div>
  <div class="two" style="margin-top:16px">${detail}<div class="card"><div class="eyebrow">How we create open nets</div><ul class="rules" style="margin-top:8px">
    <li><b>Hold their middle.</b> A quick (1, 3, Back 1, Slide) makes their middle blocker jump with it, so the pins and the seam behind it face one blocker or none.</li>
    <li><b>Stretch the block.</b> Fast sets to both antennas (Go, Red) arrive before their middle can close.</li>
    <li><b>Overload one blocker.</b> Two hitters near one blocker (Gap-Go, Back 1 + Red, a quick with a pipe behind it) force her to guess.</li>
    <li><b>Add a fourth attacker.</b> A back-row Pipe or Bic gives four hitters against three blockers.</li>
    <li><b>Keep it reachable.</b> The best combo is one each hitter can get to from her serve-receive spot. Passers shouldn’t also run quicks.</li>
    <li><b>Mind handedness.</b> Lefties are on-hand behind the setter (Back 1, Slide, Red, D); sets in front of the setter cross their body.</li></ul></div></div>
  <details class="card" style="margin-top:16px"><summary style="cursor:pointer;font-family:var(--display);font-weight:700;font-size:16px">Edit set definitions</summary>${callsTable()}</details>`;
}

/* ---------- call list ---------- */
function callList(L, r, calls, iss) {
  const c = ENG.court(L, r);
  const badIds = new Set(iss.filter(i => ['backrow', 'notOnCourt', 'libero'].includes(i.kind)).flatMap(i => i.ids));
  const rows = Object.entries(calls).filter(([, code]) => code).map(([id, code]) => {
    const g = G(code); const z = c.zoneOf[id];
    return { id, code, row: g ? g.row : '?', k: (z && isF(z) ? 0 : 1) * 10 + (g ? g.x : .5) };
  }).sort((a, b) => a.k - b.k);
  if (!rows.length) return `<p class="small" style="padding:0 4px">No calls yet. Open the rotation to add them.</p>`;
  return `<ul class="calls">${rows.map(x => `<li class="${badIds.has(x.id) ? 'bad' : ''}"><span class="who">${esc(nm(x.id))}</span><span class="what">${esc(x.code)}</span><span class="tag ${x.row}">${x.row === 'F' ? 'FRONT' : x.row === 'B' ? 'BACK' : '?'}</span></li>`).join('')}</ul>`;
}


/* rotation cards: the front row under the court, one column per zone (4, 3, 2), lined up with the court above */
function frontRowList(L, r, calls, iss) {
  const c = ENG.court(L, r);
  const badIds = new Set(iss.filter(i => ['backrow', 'notOnCourt', 'libero'].includes(i.kind)).flatMap(i => i.ids));
  const cell = z => {
    const id = c.zones[z], code = calls[id];
    const what = id === c.setter ? '<span class="sets">sets</span>' : code ? `<span class="what">${esc(code)}</span>` : '<span class="none">–</span>';
    return `<li class="${badIds.has(id) ? 'bad' : ''}"><span class="who">${esc(nm(id))}</span>${what}</li>`;
  };
  const back = Object.entries(calls).filter(([id, code]) => code && c.zoneOf[id] !== undefined && !isF(c.zoneOf[id]));
  return `<ul class="front3">${[4, 3, 2].map(cell).join('')}</ul>${back.length ? `<p class="small back3">Back row: ${back.map(([id, code]) => `${esc(nm(id))} <b>${esc(code)}</b>`).join(' · ')}</p>` : ''}`;
}

/* ---------- views ---------- */
function header() {
  const L = curL();
  return `<div class="top"><div>
    <div class="brand"><button class="backlink" data-act="home" aria-label="All teams"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>All teams</button>
    <span class="eyebrow">${esc(S.team.name)}${S.team.season ? ` · ${esc(S.team.season)}` : ''}</span></div>
    <h1>${L ? `<span class="sys">${esc(L.system)} –</span> ${esc(L.name)}` : esc(S.team.name)}</h1>
    <div class="sub">${L ? esc(sysLine(L)) + (subLine(L) ? ` · ${esc(subLine(L))}` : '') + (L.source ? ` · <span class="small">${esc(L.source)}</span>` : '') : `${S.team.players.length} players`} ${saveBadge()}</div>
  </div>
  <div class="actions">
    <button class="btn primary" data-act="new">+ New lineup</button>
    ${L ? `<button class="btn" data-act="edit">Edit setup</button>` : ''}
    ${L && S.confirmDel ? `<span class="confirm">Delete “${esc(L.name)}”? <button class="btn danger" data-act="del-yes">Delete</button><button class="btn ghost" data-act="del-no">Keep</button></span>`
      : `<details class="more"><summary class="btn">More</summary><div class="menu">${L ? `<button data-act="dup">Duplicate lineup</button>` : ''}<button data-act="team-edit" data-id="${esc(S.team.id)}">Edit team name</button><button data-act="backup">Backup &amp; restore</button>${L ? `<button class="danger" data-act="del">Delete lineup</button>` : ''}</div></details>`}
  </div></div>`;
}
const dlIcon = () => `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12.5h10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const bubbleIcon = () => `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v6a1.5 1.5 0 01-1.5 1.5H7l-3.2 2.6c-.3.3-.8 0-.8-.4V11h0a1.5 1.5 0 01-1-1.4z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
function sandboxBar() { return ''; }
const starIcon = () => `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1l1.6 4.4L14 7l-4.4 1.6L8 13l-1.6-4.4L2 7l4.4-1.6z" fill="currentColor"/></svg>`;
function sysLine(L) {
  const s = L.setters || [];
  if (L.system === '5-2' && L.swaps && L.swaps[0]) return `${full(L.swaps[0].starter)} sets from the back row, ${full(L.swaps[0].sub)} subs in to set from the front row`;
  if (L.system === '6-2') { const sw = (L.swaps || []).filter(x => s.includes(x.starter)); return sw.length ? `${s.map(full).join(' and ')} set from the back row. In the front row ${sw.map(x => `${full(x.sub)} hits for ${nm(x.starter)}`).join(', ')}${sw.length < 2 ? `; ${nm(s.find(id => !sw.some(x => x.starter === id)))} hits for herself` : ''}` : `${s.map(full).join(' and ')} set from the back row and hit from the front row`; }
  if (L.system === '4-2') return `${s.map(full).join(' and ')} set from the front row`;
  return `${s.map(full).join(', ')} sets all six rotations`;
}
function subLine(L) { return (L.subs || []).filter(s => s.in && s.out).map(s => `${nm(s.in)} for ${nm(s.out)} (R${s.rs.join(', R')})`).join(' · '); }
function tabs() {
  const lus = S.lineups.map(L => { const st = lineupStatus(L); return `<button class="lu" role="tab" aria-selected="${L.id === S.cur}" data-lu="${esc(L.id)}"><span class="dot ${st.e ? 'err' : st.w ? 'warn' : ''}"></span>${esc(titleOf(L))}</button>`; }).join('');
  const v = [['board', 'Board'], ['rot', 'Rotations'], ['live', 'Live set'], ['roster', 'Roster'], ['calls', 'Set library']];
  return `${S.lineups.length > 1 ? `<div class="lineups" role="tablist" aria-label="Lineups">${lus}</div>` : ''}<div class="views" role="tablist">${v.map(([k, t]) => `<button class="vt" role="tab" aria-selected="${S.view === k}" data-view="${k}">${t}</button>`).join('')}</div>`;
}
function rotView() {
  const L = curL();
  if (!L) return `<div class="empty"><b>No lineups yet</b>Add your first lineup with “New lineup”.</div>`;
  let errs = 0, warns = 0; const chips = [];
  const cards = [1, 2, 3, 4, 5, 6].map(r => {
    const rot = ensureSpots(L, r), c = ENG.court(L, r), iss = ENG.callCheck(L, r, S.team, rot), st = statusOf(iss);
    const e = iss.filter(i => i.level === 'error').length, w = iss.filter(i => i.level === 'warn').length;
    errs += e; warns += w; if (e || w) chips.push(`<button class="pill ${e ? 'err' : 'warn'}" data-open="${r}">R${r}: ${esc((iss.find(i => i.level === 'error') || iss.find(i => i.level === 'warn')).msg.split('.')[0])}</button>`);
    const an = analysis(L, r), gr = an.cur, best = an.opts[0];
    const sz = c.setter ? c.zoneOf[c.setter] : null;
    const lib = c.libero ? ` · ${nm(c.libero.id)} in for ${nm(c.libero.replaces)}` : '';
    return `<div class="rot" role="button" tabindex="0" data-open="${r}" data-comment-target data-rot-card="${r}" aria-label="Open rotation ${r}">
      <div class="rothead"><div class="num">${r}</div><div class="meta"><b>${c.setter ? `${esc(nm(c.setter))} sets · zone ${sz}` : 'No setter on court'}${r === 1 ? ' · start' : ''}</b><span>${isF(sz) ? 'Setter front row' : 'Setter back row'}${esc(lib)}</span></div>${st.cls === 'ok' ? '' : `<span class="pill ${st.cls}">${st.t}</span>`}${(e || w) && S.canWrite ? `<button class="btn fixbtn" data-act="autofix" data-r="${r}">Fix it</button>` : ''}</div>
      ${courtSVG(L, r, { issues: iss, ghosts: ghostsFor(L, r) })}
      ${frontRowList(L, r, rot.calls, iss)}
      ${rot.note ? `<div class="note">${esc(rot.note)}</div>` : ''}
    </div>`;
  }).join('');
  const sum = errs || warns
    ? `${S.canWrite ? `<button class="btn primary" data-act="autofix-all">Fix all</button>` : ''}<span class="pill ${errs ? 'err' : 'warn'}">${errs ? `${errs} rule problem${errs > 1 ? 's' : ''}` : ''}${errs && warns ? ' · ' : ''}${warns ? `${warns} to check` : ''}</span>${chips.join('')}`
    : '';
  return `${sum ? `<div class="summary">${sum}</div>` : ''}${fixPanel(L)}${reviewPanel()}<div class="board">${cards}</div>
  <div class="legend" style="margin-top:22px">${legend()}</div>`;
}

/* ---------- Board: one rotation at a time, drag players, draw attack lines ---------- */
/* libero modes: none, in for the back-row MB, in for the back-row OH (zones 5, 6, 1 only, never the setter).
   Spots are shared: the libero stands where the player she replaces stood, and that player gets the libero's spot back when she returns. */
function libModeOf(L) {
  const R = L.rotations.find(x => x && x.libero && x.libero.id); if (!R) return 'none';
  return (P(R.libero.replaces).roles || []).includes('OH') ? 'oh' : 'mb';
}
function libIdOf(L) {
  const R = L.rotations.find(x => x && x.libero && x.libero.id);
  return (L.liberos || [])[0] || (R && R.libero.id) || (S.team.players.find(p => (p.roles || []).includes('L')) || {}).id || null;
}
function withLibMode(L0, mode) {
  const L = clone(L0), lid = libIdOf(L);
  L.rotations.forEach((R, i) => {
    if (!R) return;
    R.spots = R.spots || {}; R.calls = R.calls || {};
    if (R.libero && R.libero.id) {           // take the libero off
      const x = R.libero.replaces, l = R.libero.id;
      if (R.spots[l]) R.spots[x] = R.spots[l]; delete R.spots[l];
      R.passers = (R.passers || []).map(q => q === l ? x : q);
      const k = R.libKeep && R.libKeep[x];
      if (k) { if (k.call) R.calls[x] = k.call; if (k.line) { R.lines = R.lines || {}; R.lines[x] = k.line; } delete R.libKeep[x]; }
    }
    R.libero = null;
    if (mode === 'none' || !lid) return;
    const c = ENG.court(L, i + 1), want = mode === 'oh' ? 'OH' : 'M';
    const y = [5, 6, 1].map(z => c.zones[z]).find(id => id && id !== c.setter && (P(id).roles || []).includes(want));
    if (!y) return;
    if (R.spots[y]) R.spots[lid] = R.spots[y]; delete R.spots[y];
    R.passers = (R.passers || []).map(q => q === y ? lid : q);
    if (R.calls[y] || (R.lines && R.lines[y])) { R.libKeep = R.libKeep || {}; R.libKeep[y] = { call: R.calls[y], line: R.lines && R.lines[y] }; delete R.calls[y]; if (R.lines) delete R.lines[y]; }
    R.libero = { id: lid, replaces: y };
  });
  if (lid && !(L.liberos || []).includes(lid)) L.liberos = [lid].concat(L.liberos || []);
  return L;
}
function boardView() {
  let L = curL();
  if (!L) return `<div class="empty"><b>No lineups yet</b>Add your first lineup with “New lineup”.</div>`;
  S.bd = S.bd || { r: 1 };
  const saved = libModeOf(L);
  if (!S.bd.lib || S.bd.libFor !== L.id) { S.bd.lib = saved; S.bd.libFor = L.id; }
  const preview = S.bd.lib !== saved, L0 = L;
  L = preview ? withLibMode(L0, S.bd.lib) : L0; S.bdL = L;
  const r = S.bd.r, rot = ensureSpots(L, r), c = ENG.court(L, r);
  const iss = ENG.callCheck(L, r, S.team, rot).filter(i => i.kind === 'overlap' || i.kind === 'notOnCourt' || i.kind === 'libero' || i.level === 'error');
  const sz = c.setter ? c.zoneOf[c.setter] : null;
  const lib = c.libero ? ` · ${nm(c.libero.id)} in for ${nm(c.libero.replaces)}` : '';
  const st = iss.some(i => i.level === 'error') ? 'err' : iss.length ? 'warn' : '';
  return `<div class="bd">
    <div class="bd-head">
      <div class="rothead"><div class="num">${r}</div><div class="meta"><b>Rotation ${r}${r === 1 ? ' · start' : ''}</b><span>${c.setter ? `${esc(nm(c.setter))} sets from zone ${sz}` : 'No setter on court'}${esc(lib)}</span></div></div>
      <div class="bd-nav"><button class="btn" data-act="bd-go" data-r="${r === 1 ? 6 : r - 1}" aria-label="Previous rotation">‹</button>
        <div class="stepper" aria-label="Rotations">${[1, 2, 3, 4, 5, 6].map(k => `<button data-act="bd-go" data-r="${k}" aria-current="${k === r}">${k}</button>`).join('')}</div>
        <button class="btn" data-act="bd-go" data-r="${r === 6 ? 1 : r + 1}" aria-label="Next rotation">›</button></div>
    </div>
    ${st && !S.bd.def ? `<ul class="issues bd-iss">${iss.map(i => `<li class="${i.level}"><span class="ic">${i.level === 'error' ? '!' : '?'}</span><span>${esc(i.msg)}</span></li>`).join('')}</ul>` : ''}
    <div class="viewtog bd-mode" role="tablist" aria-label="Show"><button data-act="bd-mode" data-m="base" aria-selected="${!!S.bd.base}">Rotation base</button><button data-act="bd-mode" data-m="sr" aria-selected="${!S.bd.base && !S.bd.def}">Serve receive</button><button data-act="bd-mode" data-m="def" aria-selected="${!!S.bd.def}">Defense</button></div>
    <div class="bigcourt bd-court${S.bd.base ? ' base' : ''}${S.bd.def ? ' def' : ''}">${courtSVG(L, r, { big: true, drag: S.canWrite && !S.bd.base && !S.bd.def && !preview, board: true, issues: iss })}</div>
    <p class="hint">${S.bd.def ? 'Base defense after the serve: front row at the net, zones 5 and 1 up at the 10-foot line, zone 6 deep. Drag players to try other spots; moves aren’t saved.' : preview ? 'Preview only. Save it to use this libero setup on the Rotations cards and in the live set; dragging is off until then.' : S.bd.base ? 'Where each player stands in the rotation order before the serve. Switch back to Serve receive to see them move to their spots.' : 'Drag players to move them. Tap a player to add or remove her attack line, then drag the line’s end or its middle dot to shape it.'}</p>
    ${S.bd.def ? `<div class="btnrow" style="justify-content:center;margin-top:6px">${S.bd.defOv && Object.keys(S.bd.defOv).length ? '<button class="btn ghost" data-act="bd-def-reset">Reset defense</button>' : ''}</div>` : `<div class="btnrow" style="justify-content:center;margin-top:6px">${rot.lines ? `<button class="btn ghost" data-act="bd-reset">Reset lines to set calls</button>` : ''}<button class="btn ghost" data-act="bd-clear">Clear lines</button></div>`}
    <div class="libmode" role="radiogroup" aria-label="Libero">${[['none', 'No libero'], ['mb', 'Libero for MB'], ['oh', 'Libero for OH']].map(([v, t]) => `<label class="tog"><input type="radio" name="bdlib" value="${v}" ${S.bd.lib === v ? 'checked' : ''}> ${t}${v === saved ? ' <span class="small">(saved)</span>' : ''}</label>`).join('')}
      ${preview ? `<button class="btn primary" data-act="bd-lib-save">Save to rotations &amp; live set</button>` : ''}</div>
    <div class="legend">${legend()}</div>
  </div>`;
}
function legend() {
  return `<span><svg viewBox="0 0 26 8"><line x1="1" y1="4" x2="25" y2="4" class="r-front"/></svg>Front-row attack</span>
  <span><svg viewBox="0 0 26 8"><line x1="1" y1="4" x2="25" y2="4" class="r-back"/></svg>Back-row attack</span>
  <span><svg viewBox="0 0 26 8"><line x1="1" y1="4" x2="25" y2="4" class="r-set"/></svg>Setter release</span>
  <span><svg viewBox="0 0 26 8"><line x1="1" y1="4" x2="25" y2="4" class="c-ten"/></svg>10-ft line</span>
  ${[['--sun', 'Setter'], ['--r-opp', 'Opposite'], ['--r-out', 'Outside'], ['--r-mid', 'Middle'], ['--lib', 'Libero']].map(([v, t]) => `<span><svg viewBox="0 0 12 12" style="width:12px;height:12px"><circle cx="6" cy="6" r="5.5" fill="var(${v})"/></svg>${t}</span>`).join('')}`;
}
function reviewPanel() {
  if (!S.review) return '';
  const R = S.review;
  const body = R.error ? `<p class="err-text">${esc(R.error)}</p>` : R.text ? `<ul class="rules" style="margin-top:6px">${R.text.split('\n').map(l => l.replace(/^\s*[-•*]\s*/, '').trim()).filter(Boolean).map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : `<p><span class="spin"></span> Claude is reviewing all six rotations…</p>`;
  return `<div class="ai" style="margin:0 0 18px"><div style="display:flex;align-items:center;gap:8px"><h4 style="flex:1">${starIcon()} Claude’s review of ${esc(R.title)}</h4><button class="btn ghost" data-act="review-close">Close</button></div>${body}</div>`;
}

function serveView() {
  const L = curL(); if (!L) return '';
  const cy = ENG.cycle(L, S.team);
  const slots = L.order.map((id, i) => {
    const sw = (L.swaps || []).find(s => s.starter === id);
    return `<div class="slot"><div class="roman">${ROMAN[i]} · serves ${i === 0 ? 'first' : ordinal(i + 1)}</div><div class="pn">${esc(full(id))}</div><div class="pr">${esc(P(id).roles.join(' / '))}</div>${sw ? `<div class="swap">⇄ ${esc(nm(sw.sub))} in the front row</div>` : ''}</div>`;
  }).join('');
  const rows = cy.rows.map(x => {
    const c = x.c;
    const fr = [4, 3, 2].map(z => nameIn(c, z)).join(' · '), bk = [5, 6, 1].map(z => nameIn(c, z)).join(' · ');
    return `<tr><td><span class="num" style="width:28px;height:28px;font-size:16px">${x.r}</span></td><td>${c.setter ? `${esc(nm(c.setter))} <span class="small">z${c.zoneOf[c.setter]}</span>` : '—'}</td><td>${fr}</td><td>${bk}</td><td>${c.libero ? `${esc(nm(c.libero.id))} <span class="small">for ${esc(nm(c.libero.replaces))}</span>` : '<span class="small">None</span>'}</td><td>${esc(nm(x.server))}</td><td>${x.events.length ? x.events.map(e => `<span class="pill warn">${esc(e)}</span>`).join(' ') : '<span class="small">—</span>'}</td></tr>`;
  }).join('');
  const lib = new Set(L.rotations.filter(r => r && r.libero).map(r => r.libero.id));
  return `<div class="order">${slots}</div>
  <div class="two"><div class="card tscroll"><table><thead><tr><th>Rot</th><th>Setter</th><th>Front row (4 · 3 · 2)</th><th>Back row (5 · 6 · 1)</th><th>Libero</th><th>Serves</th><th>Subs on entry</th></tr></thead><tbody>${rows}</tbody></table></div>
  <div class="card"><div class="eyebrow">This lineup</div>
    <div style="display:flex;gap:24px;margin:8px 0 14px;flex-wrap:wrap"><div><div class="bignum mono">${cy.subsPerCycle}</div><div class="small">subs per full rotation</div></div><div><div class="bignum mono">${S.team.subLimit || 15}</div><div class="small">sub limit per set</div></div><div><div class="bignum mono">${lib.size}</div><div class="small">libero${lib.size === 1 ? '' : 's'} used</div></div></div>
    <ul class="rules">
      <li><b>Re-entry:</b> a sub comes back only into the same spot in the serving order, which is how a setter swap stays legal.</li>
      <li><b>Liberos:</b> two can be named, but only one is on the court at a time. Libero swaps don’t count as subs, and a libero can only replace a back-row player.</li>
      <li><b>Libero serving:</b> USAV lets the libero serve in one rotation only. The “Serves” column shows who serves if you don’t use that option.</li>
      <li><b>Sub limit:</b> ${S.team.subLimit || 15} per set. SCSN, USAV, AAU and NFHS all allow 15. Change it in the Set library tab if your event differs.</li>
    </ul></div></div>`;
}
const ordinal = n => n + (['th', 'st', 'nd', 'rd'][n % 10 > 3 || [11, 12, 13].includes(n % 100) ? 0 : n % 10] || 'th');
function nameIn(c, z) { const id = c.zones[z]; const cls = id === c.setter ? 'style="color:var(--warn);font-weight:700"' : c.libero && c.libero.id === id ? 'style="color:var(--lib);font-weight:700"' : ''; return `<span ${cls}>${esc(nm(id))}</span>`; }

/* ---------- live set ----------
   The set is tracked by serving-order spot ("slot" 0-5, the lineup's order). Each slot keeps its position (S1, OH1, MB1...),
   so whoever stands in a slot plays that position: spots, calls and lines follow the slot, not the player.
   Rule: once a player has played a slot this set she can only come back into that slot (override for injuries). */
const LKEY = 'courtside-live', OLD_LKEY = 'svbc-lineup-builder-live';
function liveLoad() { try { const v = JSON.parse(localStorage.getItem(LKEY) || localStorage.getItem(OLD_LKEY) || 'null'); if (v && v.slots) return v; } catch (e) {} return null; }
function liveSave() { try { localStorage.setItem(LKEY, JSON.stringify(S.live)); } catch (e) {} }
const zoneOfSlot = (k, r) => [1, 2, 3, 4, 5, 6][((k - (r - 1)) % 6 + 6) % 6];
const slotInZone = (z, r) => [0, 1, 2, 3, 4, 5].find(k => zoneOfSlot(k, r) === z);
const slotName = (L, k) => lblBase(L.order[k]);
const usName = () => (S.team && S.team.liveName) || shortName();
function histPush(st) { const snap = clone(st); delete snap.hist; st.hist.push(snap); if (st.hist.length > 80) st.hist.shift(); }

// the position a slot plays in rotation r. The lineup's own changes move with the spot (in a 6-2 the OP spot plays S2 in R4-6),
// whoever is standing there. Subs are only made by you, by hand or from your planned subs.
function labAt(L, k, r) {
  const t = L.order[k];
  const sw = (L.swaps || []).find(x => x.starter === t);
  if (sw && isF(zoneOfSlot(k, r))) return sw.sub;
  const sb = (L.subs || []).find(x => x.in && x.out === t && (x.rs || []).includes(r));
  return sb ? sb.in : t;
}
function syncLab(L, st) { st.lab = [0, 1, 2, 3, 4, 5].map(k => labAt(L, k, st.r)); }
// your planned subs ("P1 for P2 in R4") that are due in this rotation
function liveDue(L, st) {
  const ev = [], seen = new Set();
  (st.plans || []).forEach(p => {
    if (p.r !== st.r) return;
    const k = st.slots.indexOf(p.out);
    if (k < 0 || seen.has(k) || st.slots.includes(p.in) || p.in === st.lib) return;
    seen.add(k); const tie = st.tie[p.in];
    ev.push({ k, inId: p.in, outId: p.out, blocked: tie !== undefined && tie !== k, tieName: tie !== undefined ? slotName(L, tie) : '' });
  });
  return ev;
}
function pairUp(st, a, b) { st.partner = st.partner || {}; st.partner[a] = b; st.partner[b] = a; }
// the lineup as it really is on court this set
function liveLineup(L, st) {
  const slotOfT = t => { const k = L.order.indexOf(t); if (k >= 0) return k;
    const sb = (L.subs || []).find(x => x.in === t); if (sb) return L.order.indexOf(sb.out);
    const sw = (L.swaps || []).find(x => x.sub === t); if (sw) return L.order.indexOf(sw.starter);
    return -1; };
  const libT = new Set(L.liberos || []);
  const mapId = t => libT.has(t) ? st.lib : (k => k >= 0 ? st.slots[k] : null)(slotOfT(t));
  const mapObj = o => { const out = {}; Object.entries(o || {}).forEach(([t, v]) => { const id = mapId(t); if (id && out[id] === undefined) out[id] = clone(v); }); return out; };
  const rotations = L.rotations.map(R => {
    if (!R) return R;
    const spots = mapObj(R.spots);
    let libero = null;
    if (R.libero) { const rep = mapId(R.libero.replaces); if (st.lib && rep) libero = { id: st.lib, replaces: rep }; else if (rep && R.spots[R.libero.id]) spots[rep] = R.spots[R.libero.id].slice(); }
    return { ...R, spots, calls: mapObj(R.calls), lines: R.lines ? mapObj(R.lines) : undefined, passers: (R.passers || []).map(mapId).filter(Boolean), libero,
      sr: R.sr ? { showGo: mapId(R.sr.showGo), hide: (R.sr.hide || []).map(mapId).filter(Boolean) } : undefined };
  });
  const setters = st.slots.filter((id, k) => (L.setters || []).includes(st.lab[k]));
  return { ...L, order: st.slots.slice(), swaps: [], subs: [], setters, liberos: st.lib ? [st.lib] : [], rotations };
}
function liveOverrides(L, st) {
  const lo = {}, ro = {};
  st.slots.forEach((id, k) => { lo[id] = lblBase(st.lab[k]); ro[id] = roleOf(L, st.lab[k]); });
  if (st.lib) lo[st.lib] = lblBase((L.liberos || [])[0] || '') || 'L';
  return { lo, ro };
}

/* starting six (before the set) */
function setupFor(L) {
  const prev = S.live && S.live.lu === L.id ? S.live : S.lastSet && S.lastSet.lu === L.id ? S.lastSet : null;
  const ok = prev && prev.start && prev.start.length === 6 && prev.start.every(id => pool().some(p => p.id === id));
  return { lu: L.id, r: prev ? prev.startR || 1 : 1, slots: ok ? prev.start.slice() : L.order.map(tokP), lib: prev && ok ? prev.lib : tokP((L.liberos || [])[0] || null), them: prev && prev.names ? prev.names.them : 'Them', plans: prev && prev.plans ? clone(prev.plans) : [], sel: null };
}
function liveNew(serving) {
  const L = curL(), U = S.liveSetup;
  const st = { lu: L.id, r: U.r, startR: U.r, serving, us: 0, them: 0, subs: 0, start: U.slots.slice(), slots: U.slots.slice(), lab: [], lib: U.lib,
    tie: {}, partner: {}, plans: clone(U.plans || []), names: { them: U.them || 'Them' }, log: [], hist: [], pending: null };
  st.slots.forEach((id, k) => st.tie[id] = k);
  syncLab(L, st);
  st.log.unshift(`Start: ${serving === 'us' ? 'we serve' : 'we receive'} in rotation ${U.r}`);
  S.live = st; S.liveSetup = null; liveSave();
}
function afterRotate(L, st, why) {
  syncLab(L, st);
  const ev = liveDue(L, st);
  st.log.unshift(`${st.us}-${st.them} ${why}${ev.length ? `. Planned sub: ${ev.map(e => `${nm(e.inId)} for ${nm(e.outId)}`).join(', ')}` : ''}`);
  if (ev.length) st.pending = { ev };
}
function livePoint(us) {
  const L = curL(), st = S.live; if (!L || !st || st.pending) return;
  histPush(st);
  if (us) {
    st.us++;
    if (st.serving === 'them') { st.r = st.r % 6 + 1; st.serving = 'us'; afterRotate(L, st, `Side out → rotation ${st.r}`); }
    else st.log.unshift(`${st.us}-${st.them} Point on our serve`);
  } else {
    st.them++;
    if (st.serving === 'us') { st.serving = 'them'; st.log.unshift(`${st.us}-${st.them} Lost serve. Receiving in rotation ${st.r}`); }
    else st.log.unshift(`${st.us}-${st.them} Their point`);
  }
  liveSave(); render();
}
function liveSetRot(r, serving) {
  const L = curL(), st = S.live; if (!L || !st) return;
  histPush(st);
  st.r = r; st.serving = serving;
  afterRotate(L, st, `Rotation set to ${r} (${serving === 'us' ? 'we serve' : 'we receive'})`);
  S.liveRot = null; liveSave(); render();
}
function liveSubAnswer(yes) {
  const st = S.live; if (!st || !st.pending) return;
  const picked = yes ? new Set([...document.querySelectorAll('#subPick input[data-k]')].filter(i => i.checked).map(i => +i.dataset.k)) : new Set();
  histPush(st);
  const made = [], skipped = [];
  st.pending.ev.forEach(e => {
    const text = `${nm(e.inId)} in for ${nm(e.outId)} at ${lblBase(st.lab[e.k])}`;
    if (picked.has(e.k)) { st.slots[e.k] = e.inId; if (st.tie[e.inId] === undefined) st.tie[e.inId] = e.k; pairUp(st, e.inId, e.outId); st.subs++; made.push(text + (e.blocked ? ' (override)' : '')); }
    else skipped.push(text);
  });
  if (made.length) st.log.unshift(`Sub: ${made.join(', ')}`);
  if (skipped.length) st.log.unshift(`Sub skipped: ${skipped.join(', ')}`);
  st.pending = null; liveSave(); render();
}
function liveManualSub(k, id, override) {
  const L = curL(), st = S.live; if (!L || !st) return;
  histPush(st);
  const out = st.slots[k];
  st.slots[k] = id;
  if (st.tie[id] === undefined) st.tie[id] = k;
  pairUp(st, id, out);
  st.subs++;
  st.log.unshift(`Sub: ${nm(id)} in for ${nm(out)} at ${lblBase(st.lab[k])}${override ? ' (override, injury)' : ''}`);
  S.liveSub = null; liveSave(); render();
}

/* the base: rotation order, zone 4-3-2 on top (net), 5-6-1 below */
function baseGrid(L, st) {
  const cell = z => { const k = slotInZone(z, st.r), id = st.slots[k], isSet = (L.setters || []).includes(st.lab[k]);
    return `<button class="pzc bcell${isSet ? ' set' : ' ' + roleCls(L, id)}${z === 1 && st.serving === 'us' ? ' srv' : ''}" data-act="live-sub" data-k="${k}" ${st.pending ? 'disabled' : ''} aria-label="Zone ${z}: ${esc(nm(id))}, ${esc(lblBase(st.lab[k]))}. Tap to sub"><i>${z}</i><b>${esc(jer(id) || nm(id))}</b><span>${esc(lblBase(st.lab[k]))} · ${esc(nm(id))}</span></button>`; };
  return `<div class="basebox"><h3>Base · R${st.r} <span class="small" style="text-transform:none;letter-spacing:0;font-weight:500">tap to sub</span></h3><div class="pznet">Net</div><div class="pzcourt">${[4, 3, 2, 5, 6, 1].map(cell).join('')}</div></div>`;
}
// planned subs: set up on the Starting six page; during the set you can only remove them
function plansBox(plans, ctx, ins, outs, r0) {
  const pl = plans || [];
  const opt = id => `<option value="${esc(id)}">${esc((jer(id) ? jer(id) + ' ' : '') + nm(id))}</option>`;
  const chips = pl.length ? `<div class="planlist">${pl.map((p, i) => `<span class="plan"><b>${esc(nm(p.in))}</b> for <b>${esc(nm(p.out))}</b> · R${p.r}<button data-act="plan-del" data-ctx="${ctx}" data-i="${i}" aria-label="Remove planned sub">×</button></span>`).join('')}</div>` : '';
  if (ctx === 'live') return pl.length ? `<div class="sec plans"><h3>Planned subs</h3>${chips}</div>` : '';
  return `<div class="plans"><div class="lbl2">Planned subs</div>${chips}
    <div class="planrow"><select id="planIn" aria-label="Player in"><option value="">In (bench)</option>${ins.map(opt).join('')}</select><span>for</span>
    <select id="planOut" aria-label="Player out"><option value="">Out (on court)</option>${outs.map(opt).join('')}</select><span>in</span>
    <select id="planR" aria-label="Rotation">${[1, 2, 3, 4, 5, 6].map(r => `<option value="${r}" ${r === r0 ? 'selected' : ''}>R${r}</option>`).join('')}</select>
    <button class="btn" data-act="plan-add" data-ctx="setup">Add</button></div>
    <p class="small" style="margin:6px 0 0">When the rotation comes up, you're asked before the sub is made.</p></div>`;
}
function liveSetupView(L) {
  if (!S.liveSetup || S.liveSetup.lu !== L.id) S.liveSetup = setupFor(L);
  const U = S.liveSetup;
  const chip = (id, from, k) => `<span class="dchip${U.sel && U.sel.id === id ? ' sel' : ''}" data-drag="${esc(id)}" data-from="${from}" data-k="${k === undefined ? '' : k}">${esc(nm(id))}<small>${esc(jer(id))}</small></span>`;
  const cells = [4, 3, 2, 5, 6, 1].map(z => { const k = slotInZone(z, U.r), id = U.slots[k];
    return `<div class="pzc dz${(L.setters || []).includes(L.order[k]) ? ' set' : ''}" data-drop="slot" data-k="${k}"><i>${z}</i><b>${esc(slotName(L, k))}</b>${chip(id, 'slot', k)}</div>`; }).join('');
  const bench = pool().map(p => p.id).filter(id => !U.slots.includes(id) && id !== U.lib);
  const libs = pool().filter(p => !U.slots.includes(p.id));
  return `<div class="card lsetup">
    <div class="eyebrow">Live set · ${esc(titleOf(L))}</div>
    <h2 style="font-family:var(--display);font-size:28px;margin:6px 0 2px">Starting six</h2>
    <p class="small" style="margin:0 0 12px">Drag players into the spots, or tap a player and then tap a spot. Each spot keeps its position (S1, OH1, MB1…), so whoever you put there plays it this set.</p>
    <div class="lsetup-grid"><div>
      <div class="pznet">Net</div><div class="pzcourt">${cells}</div>
      <div class="lbl2" style="margin-top:10px">Bench</div><div class="bench" data-drop="bench">${bench.map(id => chip(id, 'bench')).join('') || '<span class="small">Everyone is on court.</span>'}</div>
    </div><div>
      <label class="lbl2">Starting rotation<select id="liveR">${[1, 2, 3, 4, 5, 6].map(r => `<option value="${r}" ${r === U.r ? 'selected' : ''}>R${r}</option>`).join('')}</select></label>
      <label class="lbl2" style="margin-top:8px">Libero<select id="liveLib"><option value="">No libero</option>${libs.map(p => `<option value="${esc(p.id)}" ${U.lib === p.id ? 'selected' : ''}>${esc(full(p.id))}${jer(p.id) ? ' · ' + esc(jer(p.id)) : ''}</option>`).join('')}</select></label>
      <label class="lbl2" style="margin-top:8px">Opponent<input type="text" id="liveThem" value="${esc(U.them || '')}" placeholder="Them"></label>
      <button class="btn ghost" style="margin-top:8px" data-act="live-setup-reset">Reset to lineup</button>
    </div></div>
    ${plansBox(U.plans, 'setup', bench, U.slots, 4)}
    <div class="row2" style="margin-top:16px"><button class="bigbtn" style="background:var(--sun);color:var(--sun-ink)" data-act="live-start" data-serve="us">We serve</button><button class="bigbtn" style="background:var(--ink);color:var(--bg)" data-act="live-start" data-serve="them">We receive</button></div></div>`;
}
function liveSetupDrop(src, kind, k2) {
  const U = S.liveSetup; if (!U || !src) return;
  if (kind === 'slot') {
    if (src.from === 'slot') { if (src.k === k2) return; const a = U.slots[src.k]; U.slots[src.k] = U.slots[k2]; U.slots[k2] = a; }
    else U.slots[k2] = src.id;
  } else if (kind === 'bench' && src.from === 'slot') { toast('Drop a bench player onto a spot to swap them'); return; }
  U.sel = null; render();
}
function liveView() {
  const L = curL(); if (!L) return '';
  const st = S.live && S.live.lu === L.id ? S.live : null;
  if (!st) return liveSetupView(L);
  syncLab(L, st); const ov = liveOverrides(L, st); S.lblOv = ov.lo; S.roleOv = ov.ro; S.liveTok = true;
  RT.liveEff = {}; st.slots.forEach((id, k) => { RT.liveEff[id] = P(st.lab[k]); }); if (st.lib) RT.liveEff[st.lib] = P((L.liberos || [])[0] || '');
  try {
    const E = liveLineup(L, st), c = ENG.court(E, st.r), rot = ensureSpots(E, st.r);
    const lim = S.team.subLimit || 15, dis = st.pending ? 'disabled' : '';
    const nameEl = side => S.liveRename === side
      ? `<input type="text" id="liveName-${side}" class="rename" value="${esc(side === 'us' ? usName() : st.names.them)}">`
      : `<button class="team tname" data-act="live-rename" data-side="${side}" title="Rename">${esc(side === 'us' ? usName() : st.names.them)}<span class="serve ${st.serving === side ? 'on' : ''}"></span></button>`;
    let modal = '';
    if (st.pending) modal = `<div class="sheet"><div class="panel subask" role="dialog" aria-modal="true" aria-label="Sub due">
      <div class="phead"><h2>Sub now?</h2></div>
      <p class="small" style="margin:0 0 10px">Rotation ${st.r} · ${st.subs} of ${lim} subs used. Nothing changes unless you tap Make sub.</p>
      <div id="subPick" class="zrows">${st.pending.ev.map(e => `<label class="tog" style="font-size:15px;color:var(--ink)"><input type="checkbox" data-k="${e.k}" ${e.blocked ? '' : 'checked'}> ${esc(nm(e.inId))} in for ${esc(nm(e.outId))} at ${esc(lblBase(st.lab[e.k]))}${e.blocked ? ` <span class="unc">she already played ${esc(e.tieName)} · check to override</span>` : ''}</label>`).join('')}</div>
      <div class="btnrow" style="margin-top:14px"><button class="btn primary" data-act="sub-yes">Make sub</button><button class="btn" data-act="sub-no">Not now</button></div></div></div>`;
    else if (S.liveRot) modal = `<div class="sheet" data-act="live-rot-close"><div class="panel subask" role="dialog" aria-modal="true" aria-label="Change rotation">
      <div class="phead"><h2>Change rotation</h2><span class="grow"></span><button class="btn" data-act="live-rot-close">Cancel</button></div>
      <p class="small" style="margin:0 0 10px">For when the ref corrects the rotation. Players stay in their spots; the court, base and calls move to the rotation you pick.</p>
      <div class="stepper" style="justify-content:center;margin-bottom:12px">${[1, 2, 3, 4, 5, 6].map(r => `<button data-act="live-rot-r" data-r="${r}" aria-current="${r === S.liveRot.r}">${r}</button>`).join('')}</div>
      <div class="viewtog" style="display:flex;justify-content:center"><button data-act="live-rot-s" data-s="us" aria-selected="${S.liveRot.serving === 'us'}">We serve</button><button data-act="live-rot-s" data-s="them" aria-selected="${S.liveRot.serving === 'them'}">We receive</button></div>
      <button class="btn primary" style="width:100%;margin-top:6px" data-act="live-rot-apply">Use rotation ${S.liveRot.r}</button></div></div>`;
    else if (S.liveSub) {
      const k = S.liveSub.k, cur = st.slots[k], pos = lblBase(st.lab[k]);
      const mate = st.partner && st.partner[cur]; const bench = pool().filter(p => !st.slots.includes(p.id) && p.id !== st.lib).sort((a, b) => (b.id === mate) - (a.id === mate));
      if (S.liveSub.block) {
        const id = S.liveSub.block, tie = st.tie[id];
        modal = `<div class="sheet" data-act="live-sub-close"><div class="panel subask" role="dialog" aria-modal="true" aria-label="Sub not allowed">
          <div class="phead"><h2>Can’t sub ${esc(nm(id))} here</h2></div>
          <p style="margin:0 0 8px">${esc(nm(id))} already played the <b>${esc(slotName(L, tie))}</b> spot this set. A player who subs into a spot can only come back into that same spot for the rest of the set, so she can’t come in for ${esc(nm(cur))} at ${esc(pos)}.</p>
          <p class="small" style="margin:0 0 12px">For an injury or another exceptional case, you can override. It’s logged and counts as a sub.</p>
          <div class="btnrow"><button class="btn danger" data-act="live-sub-override" data-id="${esc(id)}">Override (injury)</button><button class="btn" data-act="live-sub-back">Back</button></div></div></div>`;
      } else modal = `<div class="sheet" data-act="live-sub-close"><div class="panel subask" role="dialog" aria-modal="true" aria-label="Substitution">
          <div class="phead"><h2>Sub for ${esc(nm(cur))}</h2><span class="grow"></span><button class="btn" data-act="live-sub-close">Cancel</button></div>
          <p class="small" style="margin:0 0 10px">${esc(pos)} spot · zone ${zoneOfSlot(k, st.r)} · ${st.subs} of ${lim} subs used</p>
          <div class="sublist">${bench.length ? bench.map(p => { const tie = st.tie[p.id], ok = tie === undefined || tie === k;
            return `<button class="subopt${ok ? '' : ' no'}${p.id === mate ? ' pair' : ''}" data-act="${ok ? 'live-sub-pick' : 'live-sub-block'}" data-id="${esc(p.id)}"><b>${jer(p.id) ? esc(jer(p.id)) + ' ' : ''}${esc(full(p.id))}</b><span>${[p.id === mate ? `subbed with ${esc(nm(cur))}` : '', tie === k && p.id !== cur ? 'back into her spot' : '', ok ? '' : `played ${esc(slotName(L, tie))} this set`].filter(Boolean).join(' · ') || 'on the bench'}</span></button>`; }).join('') : '<p class="small">No one on the bench.</p>'}</div></div></div>`;
    }
    return `<div class="two"><div class="card">
      <div class="score"><div>${nameEl('us')}<button class="pts ptbtn us" data-act="pt-us" ${dis} aria-label="Point for us">${st.us}</button></div>
      <div><button class="num rotbtn" data-act="live-rot" ${dis} aria-label="Change rotation">${st.r}</button><div class="small" style="margin-top:4px">rotation</div></div>
      <div>${nameEl('them')}<button class="pts ptbtn them" data-act="pt-them" ${dis} aria-label="Point for them">${st.them}</button></div></div>
      ${st.subs >= lim - 2 ? `<div class="alert" style="margin-top:8px;background:var(--err-soft);color:var(--err)">${st.subs >= lim ? 'Sub limit reached.' : `${lim - st.subs} subs left this set.`}</div>` : ''}
      <div class="btnrow" style="margin-top:10px"><button class="btn" data-act="undo" ${st.hist.length ? '' : 'disabled'}>Undo</button><button class="btn ghost danger" data-act="live-reset">New set</button><span style="margin-left:auto" class="pill neutral mono">Subs ${st.subs} / ${lim}</span></div>
      <div class="sec">${baseGrid(L, st)}</div></div>
      <div class="card"><div class="eyebrow">${st.serving === 'us' ? `${esc(nm(c.libero && c.libero.zone === 1 ? c.libero.replaces : c.zones[1]))} serving · receive formation if we lose the rally` : `Serve receive · rotation ${st.r}`}</div>
      <div style="margin-top:8px">${courtSVG(E, st.r)}</div>${frontRowList(E, st.r, rot.calls, ENG.callCheck(E, st.r, S.team, rot))}
      ${c.libero ? `<p class="small" style="margin:8px 4px 0;text-align:center">${esc(nm(c.libero.id))} is in for ${esc(nm(c.libero.replaces))}.</p>` : ''}</div></div>
    <div class="card livelog">${plansBox(st.plans, 'live')}<div class="sec"><h3>Log</h3><ol class="log">${st.log.slice(0, 60).map(l => `<li>${esc(l)}</li>`).join('')}</ol></div></div>${modal}`;
  } finally { S.lblOv = null; S.roleOv = null; S.liveTok = false; RT.liveEff = null; }
}

/* live set: drag players in the starting six (pointer events, so it works with touch) */
let ldrag = null;
document.addEventListener('pointerdown', e => {
  const ch = e.target.closest('.lsetup [data-drag]'); if (!ch) return;
  ldrag = { id: ch.dataset.drag, from: ch.dataset.from, k: ch.dataset.k === '' ? undefined : +ch.dataset.k, x0: e.clientX, y0: e.clientY, ghost: null, el: ch };
  e.preventDefault();
});
document.addEventListener('pointermove', e => {
  if (!ldrag) return;
  if (!ldrag.ghost) {
    if (Math.hypot(e.clientX - ldrag.x0, e.clientY - ldrag.y0) < 6) return;
    const g = ldrag.el.cloneNode(true); g.classList.add('ghost'); document.body.appendChild(g); ldrag.ghost = g; ldrag.el.classList.add('lifting');
  }
  ldrag.ghost.style.left = e.clientX + 'px'; ldrag.ghost.style.top = e.clientY + 'px';
  document.querySelectorAll('.lsetup [data-drop].over').forEach(x => x.classList.remove('over'));
  const over = document.elementFromPoint(e.clientX, e.clientY); const dz = over && over.closest('.lsetup [data-drop]'); if (dz) dz.classList.add('over');
});
document.addEventListener('pointerup', e => {
  if (!ldrag) return;
  const d = ldrag; ldrag = null;
  if (d.ghost) {
    d.ghost.remove();
    const over = document.elementFromPoint(e.clientX, e.clientY), dz = over && over.closest('.lsetup [data-drop]');
    if (dz) liveSetupDrop(d, dz.dataset.drop, dz.dataset.k === undefined ? undefined : +dz.dataset.k); else render();
    return;
  }
  const U = S.liveSetup; if (!U) return;                   // a tap: pick a player, then tap where she goes
  if (!U.sel) { U.sel = { id: d.id, from: d.from, k: d.k }; render(); return; }
  if (U.sel.id === d.id) { U.sel = null; render(); return; }
  if (d.from === 'slot') liveSetupDrop(U.sel, 'slot', d.k);
  else if (U.sel.from === 'slot') liveSetupDrop({ id: d.id, from: 'bench' }, 'slot', U.sel.k);
  else { U.sel = { id: d.id, from: d.from, k: d.k }; render(); }
});
document.addEventListener('change', e => {
  const U = S.liveSetup;
  if (e.target.id === 'liveR' && U) { U.r = +e.target.value; render(); }
  if (e.target.id === 'liveLib' && U) { U.lib = e.target.value || null; render(); }
  if (e.target.id === 'liveThem' && U) { U.them = e.target.value.trim() || 'Them'; }
  if (e.target.id && e.target.id.startsWith('liveName-')) liveRenameSave(e.target);
});
document.addEventListener('change', e => {
  if (e.target.name === 'bdlib' && S.bd) { const prev = boardSnap(); S.bd.lib = e.target.value; S.bd.anim = 'rot'; S.bd.prev = prev; render(); }
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id && e.target.id.startsWith('liveName-')) { e.preventDefault(); e.target.blur(); } });
document.addEventListener('input', e => { if (e.target.id === 'liveThem' && S.liveSetup) S.liveSetup.them = e.target.value.trim() || 'Them'; });
function liveRenameSave(el) {
  const side = el.id.slice(9), v = el.value.trim();
  if (side === 'us') { S.team.liveName = v || ''; saveTeam(); }
  else if (S.live) { S.live.names.them = v || 'Them'; liveSave(); }
  S.liveRename = null; render();
}

/* ---------- roster ---------- */
function rosterView() {
  const isR = !!S.team.roster, PL = pool();
  const used = isR ? new Set() : new Set(S.lineups.flatMap(L => L.order.concat((L.swaps || []).map(s => s.sub), (L.subs || []).map(s => s.in), L.liberos || [])));
  const need = PL.filter(p => !p.roles.length).length;
  return `${need ? `<div class="alert warn" style="margin-bottom:12px"><span><b>${need} player${need > 1 ? 's need' : ' needs'} a position.</b> Tap S, OH, M, OPP, L or DS on each card. Lineups and set suggestions need these.</span></div>` : ''}<p class="small" style="margin:-4px 0 14px">Players aren’t tied to a spot. Lineups use position tokens (S, OH1, MB1…) and you choose who plays each one when you start a live set. Jersey numbers (or initials, if a player has no number) show on the live set tokens.</p>
  <div class="roster">${PL.map(p => `<div class="pc" data-pid="${esc(p.id)}">
    <div class="hd"><span class="chipi ${isR ? '' : p.roles.includes('S') ? 's' : p.roles.includes('L') ? 'l' : roleCls(null, p.id)}">${esc(isR ? jer(p.id) : lbl(p.id))}</span><div><b>${esc(p.first)} ${esc(p.last)}</b><small>${isR ? (p.jersey ? 'Jersey ' + esc(jer(p.id)) : 'No number yet, token shows initials') : used.has(p.id) ? 'In a saved lineup' : 'Not in a lineup yet'}${p.roles.length ? '' : ' · <span style="color:var(--warn)">needs a position</span>'}</small></div>${used.has(p.id) ? '' : `<button class="btn ghost danger" style="margin-left:auto" data-act="rm-player">Remove</button>`}</div>
    <div class="row2"><label class="lbl2">First<input type="text" data-pf="first" value="${esc(p.first)}"></label><label class="lbl2">Last<input type="text" data-pf="last" value="${esc(p.last)}"></label></div>
    <div class="f3" style="grid-template-columns:repeat(2,minmax(0,1fr))"><label>Jersey<input type="text" data-pf="jersey" value="${esc(p.jersey)}" placeholder="#"></label><label>Height<input type="text" data-pf="height" value="${esc(p.height)}" placeholder="5'8&quot;"></label></div>
    <div class="roles" aria-label="Positions">${ROLES.map(r => `<button class="rchip" aria-pressed="${p.roles.includes(r)}" data-role="${r}">${r}</button>`).join('')}</div>
  </div>`).join('')}
  <div class="pc" style="align-content:start"><b style="font-family:var(--display);font-size:20px">Add a player</b><div class="row2"><input type="text" id="npFirst" placeholder="First"><input type="text" id="npLast" placeholder="Last"></div><button class="btn primary" data-act="add-player">Add to roster</button>
    <details class="pastebox"><summary>Paste several players</summary><textarea id="pasteMore" rows="5" placeholder="${esc(PASTE_EXAMPLE)}"></textarea><button class="btn" data-act="paste-more">Add these players</button></details></div></div>`;
}

/* ---------- glossary ---------- */
function callsTable() {
  const gl = S.team.glossary;
  const used = new Set(S.lineups.flatMap(L => L.rotations.flatMap(r => Object.values((r && r.calls) || {}))));
  const marks = gl.map(g => `<span class="mk ${g.row}" style="left:${(4 + g.x * 92).toFixed(1)}%;${g.row === 'F' && g.tempo === 1 ? 'top:42px;' : ''}${g.row === 'B' && g.tempo === 1 ? 'top:96px;' : ''}">${esc(g.code)}</span>`).join('');
  const unconf = gl.filter(g => !g.confirmed).length;
  return `<div style="margin-top:12px">${unconf ? `<span class="unc">${unconf} of your team’s calls are still my best guess. Fix the lane and tempo, then tick Confirmed.</span>` : ''}
  <div class="tscroll" style="margin-top:10px"><table class="gl"><thead><tr><th>Call</th><th>Row</th><th>Lane (left → right)</th><th>Tempo</th><th>Positions</th><th>What it is</th><th title="Lane moves when you move the setter target">Moves with setter</th><th>Confirmed</th><th></th></tr></thead><tbody>
  ${gl.map((g, i) => `<tr data-gi="${i}"><td><b style="font-family:var(--display);font-size:18px">${esc(g.code)}</b></td>
    <td><select data-gf="row"><option value="F" ${g.row === 'F' ? 'selected' : ''}>Front</option><option value="B" ${g.row === 'B' ? 'selected' : ''}>Back</option></select></td>
    <td><input type="range" min="0" max="1" step="0.02" value="${g.x}" data-gf="x" aria-label="Lane for ${esc(g.code)}"></td>
    <td><select data-gf="tempo"><option value="1" ${g.tempo === 1 ? 'selected' : ''}>Quick</option><option value="2" ${g.tempo === 2 ? 'selected' : ''}>Medium</option><option value="3" ${g.tempo === 3 ? 'selected' : ''}>High</option></select></td>
    <td><div class="roles">${['OH', 'M', 'OPP'].map(r => `<button class="rchip" aria-pressed="${(g.roles || []).includes(r)}" data-grole="${r}">${r}</button>`).join('')}</div></td>
    <td><input type="text" data-gf="desc" value="${esc(g.desc)}"></td>
    <td><input type="checkbox" data-gf="rel" ${g.rel ? 'checked' : ''} aria-label="${esc(g.code)} moves with the setter"></td>
    <td><input type="checkbox" data-gf="confirmed" ${g.confirmed ? 'checked' : ''} aria-label="Confirmed"></td>
    <td>${used.has(g.code) ? '<span class="small">In use</span>' : `<button class="btn ghost danger" data-act="del-call" data-gi="${i}">Remove</button>`}</td></tr>`).join('')}
  </tbody></table></div>
  ${S.canWrite ? `<div class="btnrow" style="margin-top:12px;align-items:center"><input type="text" id="newCall" placeholder="New call, e.g. Pipe" style="max-width:200px"><button class="btn primary" data-act="add-call">Add call</button>
  <span style="margin-left:auto" class="lbl2">Subs allowed per set <input type="number" min="6" max="18" id="subLimit" value="${S.team.subLimit || 15}" style="width:80px"></span></div>` : ''}</div>`;
}
/* front-row sets that key off the setter (quicks, the 2, Back 1, Back Gap, Slide) move with the setter target.
   Pin sets stay at the antennas, and back-row sets (30, 40, Bic, Pipe, A, D) stay put: they're aimed at seams in their block, not at the setter */
const REL_CODES = ['3', 'Push 1', '1', 'Meter', '2', 'Back 1', 'Back Gap', 'Slide'];
const UNREL_V2 = ['30', '40', 'Bic'];
const DEFAULT_SX = 0.67;
function applyTarget(team) { const sx = ENG.setterX(team); (team.glossary || []).forEach(g => { if (g.rel && typeof g.off === 'number') g.x = +Math.min(0.97, Math.max(0.03, sx + g.off)).toFixed(3); }); }
function relInit(team) {
  if (!team) return false;
  let fixed = false;
  if (team.glossaryRel && !team.relV2) {     // earlier versions moved the 30, 40 and Bic with the setter: put them back on their seams
    (team.glossary || []).forEach(g => { if (UNREL_V2.includes(g.code) && g.rel) { g.rel = false; if (typeof g.off === 'number') g.x = +(DEFAULT_SX + g.off).toFixed(3); fixed = true; } });
  }
  team.relV2 = 1;
  if (team.glossaryRel) return fixed;
  (team.glossary || []).forEach(g => { if (g.rel === undefined) g.rel = REL_CODES.includes(g.code); if (g.rel && typeof g.off !== 'number') g.off = +(g.x - DEFAULT_SX).toFixed(3); });   // lanes were drawn for the default target
  team.glossaryRel = 1; applyTarget(team); return false;
}
function subInit(team) { if (team && !team.subV) { if (!team.subLimit || team.subLimit === 12) team.subLimit = 15; team.subV = 1; } }
function setTarget(x) {
  const before = S.team.glossary.filter(g => g.rel).map(g => g.x).join();
  const prevSx = S.team.setterX, prevSpots = S.lineups.map(L => L.rotations.map(rr => rr && clone(rr.spots)));
  S.team.setterX = +(+x).toFixed(2); applyTarget(S.team);
  // everyone's receive spot follows: the setter's release and each hitter's approach start moved
  let n = 0;
  S.lineups.forEach(L => { for (let r = 1; r <= 6; r++) { const rot = ensureSpots(L, r); rot.spots = ENG.formationFor(L, r, S.team, rot.calls, ENG.passersOf(L, r, S.team, rot), rot); n++; } L.updatedAt = new Date().toISOString(); });
  S.retarget = n ? { prevSx, prevSpots, prevGl: before, n } : null;
  saveTeam();
  const moved = S.team.glossary.filter(g => g.rel);
  return before !== moved.map(g => g.x).join() ? moved.length : 0;
}
const SX_PRESETS = [[0.5, 'Zone 3 (middle)'], [0.67, 'Between 2 and 3'], [0.8, 'Zone 2']];
function sxLabel(x) { const p = SX_PRESETS.find(q => Math.abs(q[0] - x) < 0.005); return `${p ? p[1] + ' · ' : ''}${(x * 9).toFixed(1)} m from the left sideline`; }
function setterTargetView() {
  const x = SXT();
  return `<div class="card sxcard" style="margin-bottom:16px"><div class="sxrow"><div><h3 style="margin:0 0 4px">Setter target</h3>
    <p class="small" style="margin:0">Where every pass goes. Their middle blocker lines up across from it, so moving it changes which pin she can reach. Zone 3 makes both pins the same distance from their middle. Quicks, the 2, Back 1, Back Gap and the slide move with her; pin sets and back-row sets (30, 40, Pipe, Bic, A, D) stay where they are (change which ones in the table below).</p></div>
    <svg viewBox="0 0 280 46" class="sxmini" aria-hidden="true"><rect x="10" y="8" width="260" height="30" rx="3" fill="var(--court)" stroke="var(--court-line)"/><rect x="10" y="4" width="260" height="4" fill="var(--net)"/>
      <text x="${10 + 260 / 6}" y="31" text-anchor="middle" class="ctag">4</text><text x="140" y="31" text-anchor="middle" class="ctag">3</text><text x="${10 + 260 * 5 / 6}" y="31" text-anchor="middle" class="ctag">2</text>
      <circle cx="${10 + x * 260}" cy="16" r="6" fill="none" stroke="var(--set)" stroke-width="2" stroke-dasharray="2 2"/></svg></div>
    <div class="btnrow" style="margin-top:8px;align-items:center">${SX_PRESETS.map(([v, l]) => `<button class="rchip" aria-pressed="${Math.abs(v - x) < 0.005}" data-sx="${v}">${l}</button>`).join('')}
      <input type="range" id="sxRange" min="0.4" max="0.85" step="0.01" value="${x}" aria-label="Setter target" style="max-width:220px"><span class="small">${esc(sxLabel(x))}</span></div>
    ${S.retarget ? `<div class="alert ok" style="margin-top:10px"><span>Receive spots re-lined in all ${S.retarget.n} rotations of ${S.lineups.length} lineup${S.lineups.length === 1 ? '' : 's'} for the new target.</span><span class="btnrow"><button class="btn" data-act="retarget-undo">Undo</button><button class="btn ghost" data-act="retarget-ok">OK</button></span></div>` : ''}</div>`;
}
function callsView() { return setterTargetView() + libraryView(); }

/* ---------- editor ---------- */
function editor() {
  if (!S.ed) return '';
  const L = curL(), r = S.ed.r, rot = ensureSpots(L, r), c = ENG.court(L, r);
  const iss = ENG.callCheck(L, r, S.team, rot);
  const front = S.team.glossary.filter(g => g.row === 'F'), back = S.team.glossary.filter(g => g.row === 'B');
  const onIds = new Set(Object.values(c.zones)), sb = (L.swaps || []).map(s => s.sub);
  const bench = S.team.players.filter(q => !onIds.has(q.id) && !L.order.includes(q.id) && !sb.includes(q.id) && !(L.liberos || []).includes(q.id));
  const zr = [4, 3, 2, 5, 6, 1].map(z => {
    const id = c.zones[z], p = P(id), f = isF(z);
    let ctl;
    if (id === c.setter) ctl = `<span class="pill neutral" style="justify-self:start">Setting</span>`;
    else if (c.libero && c.libero.id === id) ctl = `<span class="pill neutral" style="justify-self:start;color:var(--lib)">Libero</span>`;
    else ctl = `<select data-call="${esc(id)}" aria-label="Call for ${esc(nm(id))}"><option value="">No call</option>
      <optgroup label="${f ? 'Front-row calls' : 'Front-row (not allowed from back row)'}">${front.map(g => `<option value="${esc(g.code)}" ${rot.calls[id] === g.code ? 'selected' : ''} ${f ? '' : 'disabled'}>${esc(g.code)}${ENG.cantRun(p, g) ? ' (not for her)' : ''}</option>`).join('')}</optgroup>
      <optgroup label="Back-row calls">${back.map(g => `<option value="${esc(g.code)}" ${rot.calls[id] === g.code ? 'selected' : ''}>${esc(g.code)}</option>`).join('')}</optgroup></select>`;
    const subIn = (L.subs || []).find(s => s.in === id && (s.rs || []).includes(r));
    const canSub = !(c.libero && c.libero.id === id) && !(L.swaps || []).some(s => s.sub === id);
    const subCtl = subIn ? `<button class="btn ghost subbtn" data-act="unsub" data-id="${esc(id)}" title="Put ${esc(nm(subIn.out))} back in">↩ ${esc(nm(subIn.out))}</button>`
      : canSub && bench.length ? `<select class="subsel" data-subout="${esc(id)}" aria-label="Sub for ${esc(nm(id))}"><option value="">Sub…</option>${bench.map(q => `<option value="${esc(q.id)}">${esc(nm(q.id))}${q.roles.length ? ` (${esc(q.roles.join('/'))})` : ''}</option>`).join('')}</select>` : '<span></span>';
    return `<div class="zr"><span class="z ${f ? 'f' : ''}">Z${z}</span><span class="nm"><span class="chipi ${id === c.setter ? 's' : c.libero && c.libero.id === id ? 'l' : ''}">${esc(lbl(id))}</span><b>${esc(full(id))}</b><small>${esc(p.roles.join('/'))}${f ? '' : ' · back'}${subIn ? ` · sub for ${esc(nm(subIn.out))}` : ''}</small></span>${ctl}${subCtl}</div>`;
  }).join('');
  const stray = Object.keys(rot.calls).filter(id => rot.calls[id] && c.zoneOf[id] === undefined);
  const base = ENG.court({ ...L, rotations: L.rotations.map((x, i) => i === r - 1 ? { ...x, libero: null } : x) }, r);
  const backIds = [5, 6, 1].map(z => base.zones[z]).filter(id => id !== base.setter);
  const libs = S.team.players.filter(p => p.roles.includes('L'));
  const isu = iss.length ? iss.map(i => `<li class="${i.level}"><span class="ic">${i.level === 'error' ? '!' : i.level === 'warn' ? '?' : 'i'}</span><span>${esc(i.msg)}</span></li>`).join('') : `<li class="ok"><span class="ic">✓</span><span>Legal formation, and every attacker has a legal call.</span></li>`;
  const ro = !S.canWrite ? 'disabled' : '';
  return `<div class="sheet" data-act="close-bg"><div class="panel" role="dialog" aria-modal="true" aria-label="Rotation ${r} editor">
    <div class="phead"><div class="num" style="width:44px;height:44px;font-size:26px">${r}</div><div><h2>Rotation ${r}</h2><div class="small">${esc(titleOf(L))} · ${c.setter ? `${esc(nm(c.setter))} sets from zone ${c.zoneOf[c.setter]}` : 'no setter on court'}</div></div>
    <span class="grow"></span><div class="stepper" aria-label="Rotations">${[1, 2, 3, 4, 5, 6].map(k => `<button data-go="${k}" aria-current="${k === r}">${k}</button>`).join('')}</div><button class="btn" data-act="close">Done</button></div>
    ${S.ed.applied ? `<div class="alert ok" style="margin-bottom:12px"><span>${S.ed.applied.label === 'New lineup' ? 'Players are lined up for these sets.' : S.ed.applied.label === 'Receive' ? 'Serve receive changed and the formation re-lined up.' : S.ed.applied.label === 'Sub' ? 'Sub made for this rotation.' : `${esc(S.ed.applied.label)} is now rotation ${r}’s calls and serve-receive lineup.`}</span><span class="btnrow"><button class="btn" data-act="opt-undo">Undo</button><button class="btn ghost" data-act="opt-dismiss">OK</button></span></div>` : ''}
    <div class="edgrid"><div>
      <div class="viewtog" role="tablist"><button role="tab" aria-selected="${S.ed.view !== 'edit'}" data-act="ed-view" data-v="anim">Watch the play</button><button role="tab" aria-selected="${S.ed.view === 'edit'}" data-act="ed-view" data-v="edit">Edit spots</button></div>
      ${S.ed.view === 'edit' ? `<div class="bigcourt">${courtSVG(L, r, { big: true, drag: S.canWrite, issues: iss, ghosts: ghostsFor(L, r) })}</div>
      <p class="hint">${S.canWrite ? 'Drag players to their serve-receive spots. A red ring means an overlap problem; yellow means it’s too close to call.' : 'View only.'}</p>
      <div class="legend">${legend()}</div>` : (() => { const A = anims.top, an = analysis(L, r); A.model = buildModel(L, r, an.calls, an.cur); return `<div class="dsvg">${animSVG(A.model, A)}${timeline(A.model, A)}${comboLegend()}</div>${S.ed.changedMsg ? `<div class="alert ok" style="margin-top:8px"><span>${esc(S.ed.changedMsg)} Combo now scores <b>${an.cur.score}</b>.</span></div>` : ''}<p class="hint">This rotation’s current combo (scores ${an.cur.score}). Change any player’s set on the right and it replays here. Switch to Edit spots to move players. Setter target: ${esc(sxLabel(SXT()))} (change it in Set library).</p>`; })()}
      <div class="sec" style="margin-top:14px"><h3>Coach’s note</h3><textarea id="rotNote" placeholder="e.g. Hitters stay to block after they hit" ${ro}>${esc(rot.note || '')}</textarea></div>
    </div>
    <div>
      <div class="sec"><h3>Who’s where and their call</h3><div class="zrows">${zr}</div>
        ${stray.length ? `<p class="err-text" style="margin:8px 0 0">${stray.map(id => `${esc(nm(id))} – ${esc(rot.calls[id])}`).join(', ')} ${stray.length > 1 ? 'are' : 'is'} listed but not on the court. <button class="btn ghost" data-act="clear-stray">Remove</button></p>` : ''}</div>
      <div class="sec"><h3>Libero</h3><div class="row2"><select id="libId" ${ro}><option value="">No libero</option>${libs.map(p => `<option value="${esc(p.id)}" ${rot.libero && rot.libero.id === p.id ? 'selected' : ''}>${esc(full(p.id))}</option>`).join('')}</select>
        <select id="libFor" ${ro} ${rot.libero ? '' : 'disabled'}>${backIds.map(id => `<option value="${esc(id)}" ${rot.libero && rot.libero.replaces === id ? 'selected' : ''}>in for ${esc(nm(id))}</option>`).join('')}</select></div>
        <label class="lbl2" style="margin-top:8px">Coverage after the pass<select id="coverMode" ${ro}>
          <option value="set" ${S.team.coverMode !== 'quick' ? 'selected' : ''}>Libero and DS cover whoever gets the set</option>
          <option value="quick" ${S.team.coverMode === 'quick' ? 'selected' : ''}>Libero follows the quick hitter (1, Back 1, 31); DS covers the set</option></select></label>
        <p class="small" style="margin:4px 0 0">Applies to every rotation of this team. Lanes are the dashed lines in the play (red for the libero), and they never cross a back-row hitter’s route or the lane in front of her.</p>
      </div>
      <div class="sec"><h3>Serve receive</h3>
        ${(() => {
          const ps = ENG.passersOf(L, r, S.team, rot), o = ENG.srOpts(L, r, rot);
          const cand = Object.values(c.zones).filter(id => id !== c.setter && id !== o.showGo && !o.hide.includes(id));
          const fronts = [4, 3, 2].map(z => c.zones[z]).filter(id => id !== c.setter && !(c.libero && c.libero.id === id));
          const backs = [5, 6, 1].map(z => c.zones[z]).filter(id => id !== c.setter);
          const pre = (n, label) => `<button class="btn ghost" data-act="pass-pre" data-n="${n}" ${ro}>${label}</button>`;
          return `<p class="small" style="margin:-2px 0 8px">Tap players to pass. The formation re-lines up on its own, legal and spread out.</p>
          <div class="lbl2">Passers (${ps.length})<div class="roles" style="margin-top:4px">${cand.map(id => `<button class="rchip" aria-pressed="${ps.includes(id)}" data-act="pass-tog" data-id="${esc(id)}" ${ro}>${esc(nm(id))}${c.libero && c.libero.id === id ? ' (L)' : ''}</button>`).join('')}</div></div>
          <div class="btnrow" style="margin-top:8px"><span class="small" style="align-self:center">Presets:</span>${pre(2, '2 passers')}${pre(3, 'Best 3')}${pre(4, '4 passers')}${pre('lib2', 'Libero + 2 outsides')}</div>
          <div class="row2" style="margin-top:10px"><label class="lbl2">Show &amp; go<select id="srShow" ${ro}><option value="">None</option>${fronts.map(id => `<option value="${esc(id)}" ${o.showGo === id ? 'selected' : ''}>${esc(nm(id))} (${esc(P(id).roles.join('/') || 'front row')})</option>`).join('')}</select></label>
          <div class="lbl2">Hide from passing<div class="roles" style="margin-top:4px">${backs.length ? backs.map(id => `<button class="rchip" aria-pressed="${o.hide.includes(id)}" data-act="sr-hide" data-id="${esc(id)}" ${ro}>${esc(nm(id))}</button>`).join('') : '<span class="small">No back-row players to hide</span>'}</div></div></div>
          <p class="small" style="margin:6px 0 0">Show &amp; go: she lines up like a passer, then leaves for her approach on the serve. Hide: a back-row player tucks into the deep corner and stays out of the passing line.</p>`;
        })()}
      </div>
      <div class="sec"><h3>Rule check</h3><ul class="issues">${isu}</ul></div>
      <div class="sec"><h3>Tools</h3>
        <div class="btnrow">${S.canWrite ? `${iss.some(i => i.level !== 'info') ? `<button class="btn primary" data-act="autofix" data-r="${r}">Fix this rotation</button>` : ''}<button class="btn primary" data-act="lineup">Line up for these sets</button><button class="btn" data-act="rebuild">Rebuild formation</button>` : ''}${S.sample ? `<button class="btn sun" data-act="ask">${starIcon()} Ask Claude</button>` : ''}</div>
        ${fixPanel(L, r)}${aiPanel(L, r)}</div>
    </div></div>${designer(L, r)}</div></div>`;
}
function sugPanel(L, r) {
  if (!S.sug || S.sug.r !== r || S.sug.lu !== L.id) return '';
  const { calls, why } = S.sug, rot = rotOf(L, r);
  const g1 = ENG.grade(L, r, S.team, calls, rot.spots).score, g0 = ENG.grade(L, r, S.team, rot.calls, rot.spots).score;
  const same = JSON.stringify(Object.entries(calls).sort()) === JSON.stringify(Object.entries(rot.calls).filter(([, v]) => v).sort());
  return `<div class="ai" style="background:var(--rule-2);border-color:var(--rule)"><div class="lbl">Rules engine suggestion · combo ${g1} vs ${g0} now</div>
    <ul class="calls" style="grid-template-columns:1fr">${Object.entries(calls).map(([id, code]) => `<li><span class="who">${esc(nm(id))}</span><span class="what">${esc(code)}</span><span class="small">${esc((why[id] || []).slice(0, 2).join(', '))}</span></li>`).join('')}</ul>
    <div class="btnrow">${same ? '<span class="small">Same as what you have.</span>' : `<button class="btn primary" data-act="apply-sug">Use these calls</button>`}<button class="btn ghost" data-act="dismiss-sug">Dismiss</button></div></div>`;
}
function aiPanel(L, r) {
  const A = S.ai; if (!A || A.r !== r || A.lu !== L.id) return '';
  if (A.loading) return `<div class="ai"><p><span class="spin"></span> Claude is working through rotation ${r}…</p></div>`;
  if (A.error) return `<div class="ai"><p class="err-text">${esc(A.error)}</p></div>`;
  const d = A.data;
  const list = calls => `<ul class="calls" style="grid-template-columns:1fr 1fr">${Object.entries(calls).map(([id, code]) => `<li><span class="who">${esc(nm(id))}</span><span class="what">${esc(code)}</span></li>`).join('')}</ul>`;
  return `<div class="ai"><h4>${starIcon()} ${esc(d.headline || 'Claude’s recommendation')}</h4>${list(d.calls)}
    ${(d.reasoning || []).length ? `<ul class="rules">${d.reasoning.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    ${d.watch ? `<p><span class="lbl">Watch for</span><br>${esc(d.watch)}</p>` : ''}
    ${S.canWrite ? `<div class="btnrow"><button class="btn primary" data-act="apply-ai">Use these calls</button></div>` : ''}
    ${d.alternative && d.alternative.calls && Object.keys(d.alternative.calls).length ? `<div class="sec"><div class="lbl">Alternative${d.alternative.when ? ` · ${esc(d.alternative.when)}` : ''}</div>${list(d.alternative.calls)}${S.canWrite ? `<button class="btn" data-act="apply-ai-alt">Use the alternative</button>` : ''}</div>` : ''}</div>`;
}

/* ---------- new / edit lineup dialog ---------- */
function openDlg(mode) {
  const L = mode === 'new' ? null : curL();
  const court = S.team.players.filter(p => !p.roles.includes('L'));
  if (S.team.players.length - Math.min(2, S.team.players.length - court.length) < 6) { S.view = 'roster'; toast(`A lineup needs 6 players who aren’t liberos. ${S.team.name} has ${court.length}. Add players or fix positions on the Roster tab.`); render(); return; }
  const setters = court.filter(p => p.roles.includes('S')).map(p => p.id);
  const rest = court.filter(p => !setters.includes(p.id)).map(p => p.id);
  let order = setters.slice(0, 1).concat(rest).slice(0, 6), sys = '5-1';
  if (setters.length >= 2 && rest.length >= 4) { order = [setters[0], rest[0], rest[1], setters[1], rest[2], rest[3]]; sys = '6-2'; }
  const base = L ? clone(L) : { name: '', system: sys, order, setters: setters.slice(0, sys === '6-2' ? 2 : 1), swaps: [], liberos: [] };
  const libs = S.team.players.filter(p => p.roles.includes('L')).map(p => p.id);
  const used = L ? [...new Set(L.rotations.map(x => x && x.libero && x.libero.id).filter(Boolean))] : [];
  const l1 = (L ? (L.liberos || [])[0] || used[0] : libs[0]) || '', l2 = (L ? (L.liberos || [])[1] || used.find(x => x !== l1) : libs[1]) || '';
  const plan = {};
  for (let r = 1; r <= 6; r++) { const lb = L && L.rotations[r - 1] && L.rotations[r - 1].libero; plan[r] = lb ? { lib: lb.id, rep: lb.replaces } : { lib: L ? '' : l1, rep: '' }; }
  S.dlg = { mode, name: mode === 'new' ? '' : base.name, system: base.system, order: base.order.slice(),
    setterA: (base.system === '5-2' && base.swaps && base.swaps[0] && base.swaps[0].starter) || base.setters[0] || '', setterB: (base.system === '5-2' && base.swaps && base.swaps[0] && base.swaps[0].sub) || base.setters[1] || '',
    hitA: base.system === '6-2' ? ((base.swaps || []).find(x => x.starter === base.setters[0]) || {}).sub || '' : '', hitB: base.system === '6-2' ? ((base.swaps || []).find(x => x.starter === base.setters[1]) || {}).sub || '' : '',
    l1, l2, plan, subs: L ? clone(L.subs || []) : [], passers: 3, err: '', manual: false, start: 1, midFirst: false, pos: {} };
  if (!(L ? posFromOrder(S.dlg) : autoPos(S.dlg))) S.dlg.manual = true;
  if (!S.dlg.manual) syncPos(S.dlg);
  render();
}
/* positions → serving order. "Rotation N" = setter (A) in zone N; that rotation becomes R1 */
const two8 = sys => sys === '6-2' || sys === '4-2';
function posKeys(D) { return D.midFirst ? ['S', 'MB1', 'OH1', 'OPP', 'MB2', 'OH2'] : ['S', 'OH1', 'MB1', 'OPP', 'OH2', 'MB2']; }
function posLabel(D, k) { return { S: two8(D.system) ? 'Setter A' : 'Setter', OH1: 'Outside 1', OH2: 'Outside 2', MB1: 'Middle 1', MB2: 'Middle 2', OPP: two8(D.system) ? 'Setter B (opposite)' : 'Opposite' }[k]; }
function posRole(D, k) { return k === 'S' || (k === 'OPP' && two8(D.system)) ? 'S' : k === 'OPP' ? 'OPP' : k.startsWith('OH') ? 'OH' : 'M'; }
function posOrder(D) { const cyc = posKeys(D).map(k => D.pos[k] || ''), i0 = (D.start || 1) - 1, o = []; cyc.forEach((id, k) => o[(i0 + k) % 6] = id); return o; }
function syncPos(D) { D.order = posOrder(D); D.setterA = D.pos.S || ''; if (two8(D.system)) D.setterB = D.pos.OPP || ''; else if (D.setterB && D.setterB === D.pos.OPP) D.setterB = ''; }
function autoPos(D) {
  const court = dlgCourt(D).sort((a, b) => (a.roles.includes('L') ? 1 : 0) - (b.roles.includes('L') ? 1 : 0)), used = new Set(), pos = {};
  const take = (k, role) => { const pick = court.find(p => !used.has(p.id) && p.roles[0] === role) || court.find(p => !used.has(p.id) && p.roles.includes(role)); if (pick) { pos[k] = pick.id; used.add(pick.id); } };
  take('S', 'S'); if (two8(D.system)) take('OPP', 'S'); else take('OPP', 'OPP');
  take('MB1', 'M'); take('MB2', 'M'); take('OH1', 'OH'); take('OH2', 'OH');
  if (D.system === '5-2') { const b = court.find(p => !used.has(p.id) && p.roles.includes('S')); if (b) used.add(D.setterB = b.id); }
  ['S', 'OH1', 'MB1', 'OPP', 'OH2', 'MB2'].forEach(k => { if (!pos[k]) { const p = court.find(q => !used.has(q.id) && !q.roles.includes('S')) || court.find(q => !used.has(q.id)); if (p) { pos[k] = p.id; used.add(p.id); } } });
  D.pos = pos; D.start = 1; D.midFirst = false; return true;
}
function posFromOrder(D) {
  const i0 = D.order.indexOf(D.setterA); if (i0 < 0 || D.order.length !== 6) return false;
  const cyc = [0, 1, 2, 3, 4, 5].map(k => D.order[(i0 + k) % 6]), has = (id, r) => id && P(id).roles.includes(r);
  D.midFirst = has(cyc[1], 'M') && !has(cyc[1], 'OH') && (has(cyc[2], 'OH') || !has(cyc[2], 'M'));
  D.start = i0 + 1; D.pos = {}; posKeys(D).forEach((k, i) => D.pos[k] = cyc[i]); return true;
}
const ZDESC = { 1: 'right back, serving', 6: 'middle back', 5: 'left back', 4: 'left front', 3: 'middle front', 2: 'right front' };
function posView(D) {
  const keys = posKeys(D), court = dlgCourt(D);
  const sel = k => { const role = posRole(D, k), cur = D.pos[k] || '', mine = court.filter(p => p.roles.includes(role)), rest = court.filter(p => !p.roles.includes(role)).sort((a, b) => (a.roles.includes('L') ? 1 : 0) - (b.roles.includes('L') ? 1 : 0));
    const o = p => `<option value="${esc(p.id)}" ${p.id === cur ? 'selected' : ''}>${esc(full(p.id))}${p.roles.length ? ` · ${esc(p.roles.join('/'))}` : ''}</option>`;
    return `<label class="lbl2">${posLabel(D, k)}<select data-pos="${k}"><option value="">Choose</option>${mine.length ? `<optgroup label="Plays ${role === 'M' ? 'middle' : role === 'S' ? 'setter' : role}">${mine.map(o).join('')}</optgroup>` : ''}<optgroup label="${mine.length ? 'Everyone else' : 'Roster'}">${rest.map(o).join('')}</optgroup></select></label>`; };
  const ids = keys.map(k => D.pos[k]).filter(Boolean), dup = ids.length !== new Set(ids).size;
  const o = posOrder(D), full6 = o.every(Boolean) && !dup, pr = D.pvR || 1;
  // preview applies setter swaps, front-row hitter subs and DS subs for the rotation being viewed
  const c = full6 ? ENG.court(dlgLineup(D), pr) : null;
  const keyOf = id => keys.find(k => D.pos[k] === id), short = k => posLabel(D, k).replace(' (opposite)', '');
  const tagOf = (id, z) => {
    if (!c) { const k = keyOf(id); return k ? short(k) : ''; }
    const base = c.base[z], k = keyOf(base), sw = (D.system === '5-2' || D.system === '6-2') && id !== base && hitSwaps(D).concat(D.system === '5-2' && D.setterB ? [{ starter: D.setterA, sub: D.setterB }] : []).find(x => x.sub === id);
    const ds = !sw && id !== base ? (D.subs || []).find(x => x.in === id) : null;
    const role = two8(D.system) && sw ? 'Opposite' : k === 'S' && D.system === '5-2' && sw ? 'Setter' : k ? short(k) : '';
    return `${role}${sw ? ` · in for ${esc(nm(base))}` : ds ? ` · sub for ${esc(nm(base))}` : ''}${id === c.setter ? ' · setting' : ''}`;
  };
  const zoneName = z => { const id = c ? c.zones[z] : o[z - 1]; return id ? `<b>${esc(nm(id))}</b><span>${tagOf(id, z)}</span>` : '<span>—</span>'; };
  const cell = z => `<div class="pzc${z === 1 ? ' srv' : ''}${c && c.zones[z] === c.setter ? ' set' : ''}"><i>${z}</i>${zoneName(z)}</div>`;
  const tabs = full6 ? `<div class="roles pztabs">${[1, 2, 3, 4, 5, 6].map(r => { const cc = ENG.court(dlgLineup(D), r); return `<button class="rchip" aria-pressed="${r === pr}" data-act="pv-r" data-r="${r}" title="${cc.setter ? `${esc(nm(cc.setter))} sets from zone ${cc.zoneOf[cc.setter]}` : ''}">R${r}${r === 1 ? ' · start' : ''}</button>`; }).join('')}</div>` : '';
  return `<div class="sec"><h3>Positions</h3><p class="small" style="margin:-4px 0 8px">Pick who plays each spot and the rotation you start in. The serving order is set for you${D.midFirst ? ' (setter, then middle, then outside)' : ' (setter, outside, middle, opposite, outside, middle)'}.</p>
    <div class="posgrid">${keys.map(sel).join('')}</div>
    ${D.system === '5-2' ? `<div class="row2" style="margin-top:10px"><label class="lbl2">Front-row setter (from the bench)<select id="dSB"><option value="">Choose</option>${dlgCourt(D).filter(p => !ids.includes(p.id)).map(p => `<option value="${esc(p.id)}" ${p.id === D.setterB ? 'selected' : ''}>${esc(full(p.id))}</option>`).join('')}</select></label><span></span></div>` : ''}
    ${hitView(D)}
    <div class="row2" style="margin-top:10px"><label class="lbl2">Start in<select id="dStart">${[1, 6, 5, 4, 3, 2].map(z => `<option value="${z}" ${D.start === z ? 'selected' : ''}>Rotation ${z}: setter ${ZDESC[z]}</option>`).join('')}</select></label>
      <label class="chk" style="align-self:end"><input type="checkbox" id="dMid" ${D.midFirst ? 'checked' : ''}> Middle follows the setter</label></div>
    ${dup ? '<p class="err-text">The same player is in two positions.</p>' : ''}
    <div class="pzwrap">${tabs}<div class="pznet">Net</div><div class="pzcourt">${[4, 3, 2, 5, 6, 1].map(cell).join('')}</div>
      <p class="small">Serving order: ${o.map((id, i) => `${ROMAN[i]} ${id ? esc(nm(id)) : '—'}`).join(' → ')}. Your starting rotation is R1 in the tool, and R2–R6 follow in match order. Tap a rotation to see who's on the court, with subs in.</p></div>
    <button class="btn ghost" data-act="dlg-manual" style="margin-top:6px">Edit serving order by hand</button></div>`;
}
/* players who can take a court spot in this lineup: everyone but the liberos named for it */
function dlgCourt(D) { return S.team.players.filter(p => p.id !== D.l1 && p.id !== D.l2); }
/* 6-2: a hitter can sub in for each setter while she's in the front row */
function hitSwaps(D) { return D.system !== '6-2' ? [] : [[D.setterA, D.hitA], [D.setterB, D.hitB]].filter(([s, h]) => s && h && !D.order.includes(h)).map(([starter, sub]) => ({ starter, sub })); }
function hitView(D) {
  if (D.system !== '6-2') return '';
  const bench = dlgCourt(D).filter(p => !D.order.includes(p.id));
  const sel = (id, cur, who) => `<label class="lbl2">When ${who ? esc(nm(who)) : 'this setter'} is front row<select id="${id}"><option value="">She stays in and hits</option>${bench.map(p => `<option value="${esc(p.id)}" ${p.id === cur ? 'selected' : ''}>${esc(full(p.id))} subs in to hit${p.roles.length ? ` · ${esc(p.roles.join('/'))}` : ''}</option>`).join('')}</select></label>`;
  return `<div style="margin-top:10px"><p class="small" style="margin:0 0 6px">Front-row hitters (optional). Each setter can sub out for a hitter while she's in the front row, then come back in to set. Use two different hitters: a sub can only go back in for the player she replaced.</p>
    <div class="row2">${sel('dHA', D.hitA, D.setterA)}${sel('dHB', D.hitB, D.setterB)}</div></div>`;
}
/* libero plan: who the libero goes in for, rotation by rotation */
function dlgLineup(D) {
  const swaps = D.system === '5-2' && D.setterA && D.setterB && !D.order.includes(D.setterB) ? [{ starter: D.setterA, sub: D.setterB }] : hitSwaps(D);
  const setters = D.system === '5-1' ? [D.setterA].filter(Boolean) : [D.setterA, D.setterB].filter(Boolean);
  return { system: D.system, order: D.order.slice(), setters, swaps, subs: (D.subs || []).filter(s => s.in && s.out), rotations: [1, 2, 3, 4, 5, 6].map(r => ({ r, spots: {}, calls: {}, libero: null })) };
}
function libBack(D, r) { const c = ENG.court(dlgLineup(D), r); return [5, 6, 1].map(z => c.zones[z]).filter(id => id && id !== c.setter); }
function libDefault(D, r) { const ds = new Set((D.subs || []).map(s => s.in)), b = libBack(D, r), nb = b.filter(id => !ds.has(id)); return nb.find(id => P(id).roles.includes('M')) || nb.find(id => P(id).roles.includes('OH')) || nb.find(id => !P(id).roles.includes('S')) || b[0] || ''; }
function normalizePlan(D) {
  const libs = [D.l1, D.l2].filter(Boolean);
  for (let r = 1; r <= 6; r++) {
    const p = D.plan[r] || (D.plan[r] = { lib: '', rep: '' });
    if (p.lib && !libs.includes(p.lib)) p.lib = libs[0] || '';
    if (p.lib && !libBack(D, r).includes(p.rep)) p.rep = libDefault(D, r);
  }
}
function planView(D) {
  normalizePlan(D);
  const libs = [D.l1, D.l2].filter(Boolean);
  if (!libs.length) return '<p class="small" style="margin:8px 0 0">No libero picked. Mark a player as L on the Roster tab to use one.</p>';
  const rows = [1, 2, 3, 4, 5, 6].map(r => {
    const p = D.plan[r], back = libBack(D, r);
    return `<tr><td><b>R${r}</b></td>
      <td><select data-plib="${r}" aria-label="Libero in rotation ${r}"><option value="">No libero</option>${libs.map(id => `<option value="${esc(id)}" ${p.lib === id ? 'selected' : ''}>${esc(nm(id))}</option>`).join('')}</select></td>
      <td><select data-prep="${r}" aria-label="Libero replaces in rotation ${r}" ${p.lib ? '' : 'disabled'}>${back.map(id => `<option value="${esc(id)}" ${p.rep === id ? 'selected' : ''}>in for ${esc(nm(id))} (${esc(P(id).roles.join('/') || '?')})</option>`).join('')}</select></td></tr>`;
  }).join('');
  return `<div class="btnrow" style="margin:10px 0 6px;align-items:center"><span class="small">Quick fill:</span><button class="btn ghost" data-act="plan-mid">${esc(nm(libs[0]))} in for the middles</button>${libs[1] ? `<button class="btn ghost" data-act="plan-split">${esc(nm(libs[0]))} R1–3, ${esc(nm(libs[1]))} R4–6</button>` : ''}<button class="btn ghost" data-act="plan-none">No libero</button></div>
    <div class="tscroll"><table class="gl libplan"><thead><tr><th>Rotation</th><th>Libero</th><th>Goes in for</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="small" style="margin:6px 0 0">She can only go in for a back-row player, never the setter. The list updates when you change the serving order or setters.</p>`;
}
/* DS subs: who comes in, for whom, in which rotations */
const ZNAME = { 1: 'right back', 6: 'middle back', 5: 'left back', 4: 'left front', 3: 'middle front', 2: 'right front' };
const ZSHORT = { 1: 'RB', 6: 'MB', 5: 'LB', 4: 'LF', 3: 'MF', 2: 'RF' };
function dsBench(D) { const sb = D.system === '5-2' ? D.setterB : null, hs = hitSwaps(D).map(x => x.sub); return S.team.players.filter(p => !D.order.includes(p.id) && p.id !== sb && !hs.includes(p.id) && p.id !== D.l1 && p.id !== D.l2); }
function dsZone(D, out, r) { const c = ENG.court({ ...dlgLineup(D), subs: [] }, r); return c.zoneOf[out]; }
function dsBackRs(D, out) { return [1, 2, 3, 4, 5, 6].filter(r => { const z = dsZone(D, out, r); return z !== undefined && !ENG.isFront(z); }); }
function dsSummary(D, s) {
  if (!s.in || !s.out || !s.rs.length) return '';
  const role = P(s.out).roles.filter(x => x !== 'S')[0] || '';
  const parts = s.rs.slice().sort((a, b) => a - b).map(r => { const z = dsZone(D, s.out, r); return `R${r} ${z ? ZNAME[z] : '(not on court)'}`; });
  const allBack = s.rs.every(r => { const z = dsZone(D, s.out, r); return z && !ENG.isFront(z); });
  return `${allBack ? 'DS ' : ''}${nm(s.in)} in for ${role ? role + ' ' : ''}${nm(s.out)}: ${parts.join(', ')}`;
}
function dsView(D) {
  const bench = dsBench(D);
  const rows = (D.subs || []).map((s, i) => `<div class="dsrow">
      <label class="lbl2">DS<select data-dsin="${i}"><option value="">Choose</option>${bench.concat(s.in && !bench.some(p => p.id === s.in) ? [P(s.in)] : []).map(p => `<option value="${esc(p.id)}" ${s.in === p.id ? 'selected' : ''}>${esc(full(p.id))}${p.roles.length ? ` (${esc(p.roles.join('/'))})` : ''}</option>`).join('')}</select></label>
      <label class="lbl2">Goes in for<select data-dsout="${i}"><option value="">Choose</option>${D.order.map(id => `<option value="${esc(id)}" ${s.out === id ? 'selected' : ''}>${esc(P(id).roles.join('/') || '?')} ${esc(full(id))}</option>`).join('')}</select></label>
      <div class="lbl2">Rotations<div class="roles" style="margin-top:4px">${[1, 2, 3, 4, 5, 6].map(r => { const z = s.out ? dsZone(D, s.out, r) : undefined; return `<button class="rchip ${z && ENG.isFront(z) ? 'frontz' : ''}" aria-pressed="${s.rs.includes(r)}" data-act="ds-r" data-i="${i}" data-r="${r}" ${s.out ? '' : 'disabled'} title="${z ? ZNAME[z] : 'not on court'}">R${r}${z ? ` · ${ZSHORT[z]}` : ''}</button>`; }).join('')}</div></div>
      <button class="btn ghost danger" data-act="ds-rm" data-i="${i}" aria-label="Remove this sub">Remove</button>
      ${dsSummary(D, s) ? `<p class="small dssum">${esc(dsSummary(D, s))}</p>` : ''}</div>`).join('');
  return `<div class="sec"><h3>Subs</h3><p class="small" style="margin:-4px 0 8px">A DS for passing or a hitter for the front row: pick who comes in, for whom, and in which rotations. Back-row rotations are picked for you; front-row ones are marked. You can also sub right inside any rotation.</p>
    ${rows}${bench.length ? `<button class="btn" data-act="ds-add">+ Add a sub</button>` : '<p class="small">Everyone on the roster is already in the lineup.</p>'}</div>`;
}
function dlgView() {
  const D = S.dlg; if (!D) return '';
  const opts = (sel, filter = () => true, blank = '') => `${blank ? `<option value="">${blank}</option>` : ''}${S.team.players.filter(filter).map(p => `<option value="${esc(p.id)}" ${p.id === sel ? 'selected' : ''}>${esc(full(p.id))}</option>`).join('')}`;
  const two = D.system !== '5-1';
  const setterHelp = { '5-1': 'Pick the setter from the serving order.', '5-2': 'Setter A is in the serving order and sets from the back row. Setter B subs in for her whenever that spot is in the front row.', '6-2': 'Both setters go in the serving order, three spots apart. The back-row one sets and the front-row one hits.', '4-2': 'Both setters go in the serving order, three spots apart. The front-row one sets.' }[D.system];
  return `<div class="sheet" data-act="close-bg"><div class="panel" role="dialog" aria-modal="true" aria-label="Lineup setup" style="max-width:920px">
    <div class="phead"><h2>${D.mode === 'edit' ? 'Edit lineup setup' : 'New lineup'}</h2><span class="grow"></span><button class="btn" data-act="dlg-close">Cancel</button></div>
    <div class="sec"><h3>Name</h3><input type="text" id="dName" value="${esc(D.name)}" placeholder="e.g. Middle in 2 / OH1 starts"></div>
    <div class="sec"><h3>Offense</h3><div class="sysopts">${Object.entries(SYS).map(([k, v]) => `<button class="sysopt" aria-pressed="${D.system === k}" data-sys="${k}"><b>${v.label}</b><span>${v.d}</span></button>`).join('')}</div></div>
    ${D.manual ? `<div class="sec"><h3>Serving order</h3><p class="small" style="margin:-4px 0 8px">Spot I is in zone 1 in R1 and serves first. Each next spot is the next server. <button class="btn ghost" data-act="dlg-positions">Use positions instead</button></p>
      <div class="newgrid">${D.order.map((id, i) => `<label>${ROMAN[i]}<select data-ord="${i}">${opts(id, p => p.id !== D.l1 && p.id !== D.l2)}</select></label>`).join('')}</div></div>
    <div class="sec"><h3>Setter${two ? 's' : ''}</h3><p class="small" style="margin:-4px 0 8px">${setterHelp}</p><div class="row2"><label class="lbl2">${two ? 'Setter A' : 'Setter'}<select id="dSA">${opts(D.setterA, () => true, 'Choose')}</select></label>${two ? `<label class="lbl2">Setter B<select id="dSB">${opts(D.setterB, () => true, 'Choose')}</select></label>` : '<span></span>'}</div>${hitView(D)}</div>` : posView(D)}
    <div class="sec"><h3>Liberos</h3><div class="row2"><label class="lbl2">Libero 1<select id="dL1">${opts(D.l1, p => p.roles.includes('L') && !D.order.includes(p.id), 'None')}</select></label><label class="lbl2">Libero 2<select id="dL2">${opts(D.l2, p => p.roles.includes('L') && p.id !== D.l1 && !D.order.includes(p.id), 'None')}</select></label></div>
      ${planView(D)}</div>
    ${dsView(D)}
    <div class="sec"><h3>Serve receive</h3><label class="lbl2" style="max-width:220px">Passers<select id="dPass"><option value="3" ${D.passers === 3 ? 'selected' : ''}>3 passers</option><option value="4" ${D.passers === 4 ? 'selected' : ''}>4 passers</option><option value="2" ${D.passers === 2 ? 'selected' : ''}>2 passers</option></select></label></div>
    ${D.err ? `<p class="err-text">${esc(D.err)}</p>` : ''}
    <div class="btnrow" style="margin-top:16px;justify-content:flex-end">${D.mode === 'edit' ? '<span class="small" style="align-self:center">Rebuild redoes all six formations and calls. Save keeps them and only applies the name, libero plan and DS subs.</span><button class="btn" data-act="dlg-rename">Save without rebuilding</button>' : ''}<button class="btn primary" data-act="dlg-build">${D.mode === 'edit' ? 'Rebuild lineup' : 'Build lineup'}</button></div>
  </div></div>`;
}
function readDlg() {
  const D = S.dlg; if (!D) return;
  const v = id => { const el = document.getElementById(id); return el ? el.value : undefined; };
  if (v('dName') !== undefined) D.name = v('dName');
  if (v('dSA') !== undefined) D.setterA = v('dSA');
  if (v('dSB') !== undefined) D.setterB = v('dSB');
  if (v('dL1') !== undefined) D.l1 = v('dL1');
  if (v('dL2') !== undefined) D.l2 = v('dL2');
  if (v('dPass') !== undefined) D.passers = +v('dPass');
  if (v('dHA') !== undefined) D.hitA = v('dHA');
  if (v('dHB') !== undefined) D.hitB = v('dHB');
  document.querySelectorAll('[data-ord]').forEach(el => D.order[+el.dataset.ord] = el.value);
  if (!D.manual) {
    document.querySelectorAll('[data-pos]').forEach(el => D.pos[el.dataset.pos] = el.value);
    if (v('dStart') !== undefined) { if (+v('dStart') !== D.start) D.pvR = 1; D.start = +v('dStart'); }
    const m = document.getElementById('dMid');
    if (m) D.midFirst = m.checked;     // players keep their positions; only the serving order changes
    syncPos(D);
  }
  document.querySelectorAll('[data-plib]').forEach(el => { const p = D.plan[+el.dataset.plib]; if (p.lib !== el.value) { p.lib = el.value; p.rep = ''; } });
  document.querySelectorAll('[data-prep]').forEach(el => { const p = D.plan[+el.dataset.prep]; if (!el.disabled) p.rep = el.value; });
  document.querySelectorAll('[data-dsin]').forEach(el => { const s = D.subs[+el.dataset.dsin]; if (s) s.in = el.value; });
  document.querySelectorAll('[data-dsout]').forEach(el => { const s = D.subs[+el.dataset.dsout]; if (s && s.out !== el.value) { s.out = el.value; s.rs = el.value ? dsBackRs(D, el.value) : []; } });
  normalizePlan(D);
}
// apply the libero plan to an existing lineup without rebuilding calls; re-line up the rotations that changed
function applySubs(L, D) {
  const subs = (D.subs || []).filter(s => s.in && s.out && s.rs.length && !L.order.includes(s.in)).map(s => ({ in: s.in, out: s.out, rs: s.rs.slice().sort() }));
  const before = [1, 2, 3, 4, 5, 6].map(r => ENG.court(L, r));
  L.subs = subs;
  const changed = [];
  for (let r = 1; r <= 6; r++) {
    const c0 = before[r - 1], c1 = ENG.court(L, r), rot = rotOf(L, r);
    const gone = Object.values(c0.zones).filter(id => c1.zoneOf[id] === undefined), came = Object.values(c1.zones).filter(id => c0.zoneOf[id] === undefined);
    if (!gone.length && !came.length) continue;
    changed.push(r);
    gone.forEach(id => { const z = c0.zoneOf[id], nu = c1.zones[z]; if (rot.spots[id] && nu) rot.spots[nu] = rot.spots[id].slice(); delete rot.spots[id]; delete rot.calls[id]; if (rot.passers) rot.passers = rot.passers.map(x => x === id ? nu : x).filter(Boolean); if (rot.libero && rot.libero.replaces === id && nu) rot.libero.replaces = nu; });
    rot.spots = ENG.formationFor(L, r, S.team, rot.calls, ENG.passersOf(L, r, S.team, rot), rot);
  }
  return changed;
}
function applyLiberoPlan(L, D) {
  let n = 0;
  L.liberos = [D.l1, D.l2].filter(Boolean);
  for (let r = 1; r <= 6; r++) {
    const rot = rotOf(L, r), pl = D.plan[r] || {}, cur = rot.libero;
    const base = ENG.court({ ...L, rotations: L.rotations.map((x, i) => i === r - 1 ? { ...x, libero: null } : x) }, r);
    const back = [5, 6, 1].map(z => base.zones[z]).filter(id => id !== base.setter);
    const want = pl.lib && back.includes(pl.rep) ? { id: pl.lib, replaces: pl.rep } : null;
    if (JSON.stringify(want) === JSON.stringify(cur || null)) continue;
    n++;
    if (cur && cur.id && (!want || want.id !== cur.id)) delete rot.spots[cur.id];
    rot.libero = want;
    if (want) { delete rot.calls[want.id]; if (rot.calls[want.replaces]) delete rot.calls[want.replaces]; if (rot.passers) rot.passers = rot.passers.filter(x => x !== want.replaces); if (rot.spots[want.replaces]) rot.spots[want.id] = rot.spots[want.replaces].slice(); }
    rot.spots = ENG.formationFor(L, r, S.team, rot.calls, ENG.passersOf(L, r, S.team, rot), rot);
  }
  return n;
}
function buildFromDlg() {
  readDlg(); const D = S.dlg;
  if (!D.name.trim()) return D.err = 'Give the lineup a name.';
  if (!D.manual && !D.order.every(Boolean)) return D.err = 'Pick a player for every position.';
  if ([D.l1, D.l2].some(x => x && D.order.includes(x))) return D.err = `${nm([D.l1, D.l2].find(x => x && D.order.includes(x)))} is named as a libero and also has a court position. Pick one.`;
  if (new Set(D.order).size !== 6) return D.err = D.manual ? 'Each player can only be in the serving order once.' : 'The same player is in two positions.';
  const ia = D.order.indexOf(D.setterA), ib = D.order.indexOf(D.setterB);
  let setters = [], swaps = [];
  if (D.system === '5-1') { if (ia < 0) return D.err = 'Put the setter in the serving order.'; setters = [D.setterA]; }
  else if (D.system === '5-2') {
    if (ia < 0) return D.err = 'Setter A has to be in the serving order.';
    if (!D.setterB || ib >= 0) return D.err = 'Setter B has to be on the bench, not in the serving order.';
    setters = [D.setterA, D.setterB]; swaps = [{ starter: D.setterA, sub: D.setterB }];
  } else {
    if (ia < 0 || ib < 0) return D.err = 'Both setters have to be in the serving order.';
    if (Math.abs(ia - ib) !== 3) return D.err = `The two setters need to be opposite each other: three spots apart (now ${ROMAN[ia]} and ${ROMAN[ib]}).`;
    setters = [D.setterA, D.setterB];
    if (D.system === '6-2') {
      if (D.hitA && D.hitA === D.hitB) return D.err = `${nm(D.hitA)} can’t sub for both setters. A sub can only go back in for the player she replaced, so pick two different hitters.`;
      if ([D.hitA, D.hitB].some(h => h && D.order.includes(h))) return D.err = 'A front-row hitter sub has to come off the bench, not from the positions above.';
      swaps = hitSwaps(D);
    }
  }
  const subs = (D.subs || []).filter(s => s.in && s.out && s.rs.length).map(s => ({ in: s.in, out: s.out, rs: s.rs.slice().sort() }));
  if (subs.some(s => D.order.includes(s.in))) return D.err = 'A DS has to come off the bench, not from the serving order.';
  const L = { id: D.mode === 'edit' ? S.cur : 'l' + Date.now().toString(36), name: D.name.trim(), system: D.system, order: D.order.slice(), setters, swaps, subs,
    liberos: [D.l1, D.l2].filter(Boolean), rotations: [], source: `Built ${new Date().toLocaleDateString()}`, sort: D.mode === 'edit' ? (curL().sort || 0) : Date.now() };
  for (let r = 1; r <= 6; r++) {
    L.rotations.push({ r, spots: {}, calls: {}, libero: null, note: '' });
    const pl = D.plan[r];
    if (pl && pl.lib) {
      const c = ENG.court(L, r), back = [5, 6, 1].map(z => c.zones[z]).filter(id => id !== c.setter);
      if (back.includes(pl.rep)) L.rotations[r - 1].libero = { id: pl.lib, replaces: pl.rep };
    }
    const R = L.rotations[r - 1];
    R.passers = ENG.defaultPassers(L, r, S.team, D.passers);
    R.spots = ENG.formation(L, r, S.team, D.passers).spots;
    R.calls = ENG.defaultCalls(L, r, S.team);
    R.spots = ENG.formationFor(L, r, S.team, R.calls, ENG.passersOf(L, r, S.team, R), R);
    applySampleTemplate(L, r, R);
  }
  if (D.mode === 'edit') S.lineups = S.lineups.map(x => x.id === L.id ? L : x); else S.lineups.push(L);
  S.cur = L.id; S.dlg = null; S.view = 'board'; S.bd = { r: 1 }; saveLineup(L); toast(D.mode === 'edit' ? 'Lineup rebuilt' : 'Lineup built');
}

/* ---------- subs made right in a rotation (DS for passing, a new hitter for the front row) ---------- */
function migrateRot(L, r, c0) {
  const c1 = ENG.court(L, r), rot = rotOf(L, r);
  Object.entries(c0.zones).forEach(([z, oldId]) => {
    const nu = c1.zones[z]; if (nu === oldId) return;
    if (rot.spots[oldId]) rot.spots[nu] = rot.spots[oldId].slice();
    delete rot.spots[oldId];
    const code = rot.calls[oldId], g = code && G(code); delete rot.calls[oldId];
    if (g && (g.row === 'F' ? isF(+z) : (P(nu).backRow || isF(+z)))) rot.calls[nu] = code;     // she takes over the call if she can run it
    if (rot.passers) rot.passers = rot.passers.map(x => x === oldId ? nu : x);
    if (rot.cover) { if (rot.cover[oldId]) { rot.cover[nu] = rot.cover[oldId]; delete rot.cover[oldId]; } Object.keys(rot.cover).forEach(k => { if (rot.cover[k] === oldId) rot.cover[k] = nu; }); }
    if (rot.sr) { if (rot.sr.showGo === oldId) rot.sr.showGo = nu; if (rot.sr.hide) rot.sr.hide = rot.sr.hide.map(x => x === oldId ? nu : x); }
  });
  if (rot.libero && c1.zoneOf[rot.libero.id] === undefined && c0.zoneOf[rot.libero.id] !== undefined) rot.libero = null;
  rot.spots = ENG.formationFor(L, r, S.team, rot.calls, ENG.passersOf(L, r, S.team, rot), rot);
}
function subIn(L, r, out, inn) {
  const c0 = ENG.court(L, r), prev = clone(L.subs || []), prevRot = clone(rotOf(L, r));
  L.subs = L.subs || [];
  const cur = L.subs.find(s => s.in === out && s.rs.includes(r));                 // swapping one sub for another: the starter's spot
  const starter = cur ? cur.out : out;
  if (cur) cur.rs = cur.rs.filter(x => x !== r);
  let ex = L.subs.find(s => s.in === inn && s.out === starter);
  if (ex) { if (!ex.rs.includes(r)) ex.rs = ex.rs.concat(r).sort(); } else L.subs.push(ex = { in: inn, out: starter, rs: [r] });
  const code = rotOf(L, r).calls[starter]; if (code) { ex.keep = ex.keep || {}; ex.keep[r] = code; }     // remember her call for when she comes back
  L.subs = L.subs.filter(s => s.rs.length);
  migrateRot(L, r, c0);
  return { prev, prevRot };
}
function subOut(L, r, inn) {
  const c0 = ENG.court(L, r), prev = clone(L.subs || []), prevRot = clone(rotOf(L, r));
  let back = null;
  (L.subs || []).forEach(s => { if (s.in === inn && s.rs.includes(r)) { s.rs = s.rs.filter(x => x !== r); back = { id: s.out, code: s.keep && s.keep[r] }; if (s.keep) delete s.keep[r]; } });
  L.subs = (L.subs || []).filter(s => s.rs.length);
  migrateRot(L, r, c0);
  if (back && back.code) { const rot = rotOf(L, r); rot.calls[back.id] = back.code; rot.spots = ENG.formationFor(L, r, S.team, rot.calls, ENG.passersOf(L, r, S.team, rot), rot); }
  return { prev, prevRot };
}

/* ---------- serve receive changes re-line up the formation ---------- */
function applyReceive(L, r, mutate) {
  const rot = rotOf(L, r);
  const prev = { calls: clone(rot.calls), spots: clone(rot.spots), passers: rot.passers ? rot.passers.slice() : null, sr: rot.sr ? clone(rot.sr) : null };
  const msg = mutate(); if (msg === null) { render(); return; }
  rot.spots = ENG.formationFor(L, r, S.team, rot.calls, ENG.passersOf(L, r, S.team, rot), rot);
  saveLineup(L, [r]);
  S.ed.applied = { label: 'Receive', prev: prev.calls, prevSpots: prev.spots, prevRecv: prev };
  S.ed.changedMsg = `${msg} Players re-lined up.`;
  S.ed.view = 'anim'; S.ed.opt = 'cur';
  Object.assign(anims.top, { t: 0, playing: true, featId: null, cycle: true, serve: 0, fresh: false });
  render();
}

/* ---------- auto-fix ---------- */
function fixRotations(L, rs) {
  const items = [];
  rs.forEach(r => {
    ensureSpots(L, r);
    const f = ENG.autoFix(L, r, S.team);
    if (!f.changes.length) return;
    const prevSpots = L.rotations[r - 1].spots, moves = {};
    Object.keys(f.rot.spots).forEach(id => { const a0 = prevSpots[id], b0 = f.rot.spots[id]; if (a0 && (Math.abs(a0[0] - b0[0]) + Math.abs(a0[1] - b0[1]) > 0.005)) moves[id] = [a0, b0]; });
    items.push({ r, changes: f.changes, remaining: f.remaining, prev: clone(L.rotations[r - 1]), moves });
    L.rotations[r - 1] = f.rot;
  });
  if (!items.length) { toast('Nothing to fix'); return; }
  S.fixLog = { lu: L.id, items, fresh: true }; S.sug = null;
  dlog('fix', { id: L.id, rs: items.map(i => i.r), moved: items.map(i => Object.keys(i.moves).join('+')).join(','), sig: sig(L) });
  saveLineup(L, items.map(i => i.r)); render();
  toast(items.length === 1 ? `Fixed rotation ${items[0].r}` : `Fixed ${items.length} rotations`);
}
function ghostsFor(L, r) { const F = S.fixLog; if (!F || F.lu !== L.id) return null; const it = F.items.find(i => i.r === r); return it ? it.moves : null; }
function animateFix() {
  const F = S.fixLog; if (!F || !F.fresh) return; F.fresh = false;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  F.items.forEach(it => Object.entries(it.moves).forEach(([pid, [from, to]]) => {
    document.querySelectorAll(`svg[data-r="${it.r}"] .tok[data-id="${pid}"]`).forEach(g => {
      try { g.animate([{ transform: `translate(${X(from[0])}px, ${Y(from[1])}px)` }, { transform: `translate(${X(to[0])}px, ${Y(to[1])}px)` }], { duration: 900, delay: 200, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'backwards' }); } catch (e) {}
    });
  }));
}
function fixPanel(L, onlyR) {
  const F = S.fixLog; if (!F || F.lu !== L.id) return '';
  const items = onlyR ? F.items.filter(i => i.r === onlyR) : F.items;
  if (!items.length) return '';
  return `<div class="ai" style="background:var(--ok-soft);border-color:color-mix(in srgb,var(--ok) 40%,var(--rule));${onlyR ? '' : 'margin:0 0 18px'}">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><h4 style="flex:1;color:var(--ok)">✓ ${items.length === 1 ? `Rotation ${items[0].r} is fixed` : `${items.length} rotations fixed`}</h4>
    ${S.canWrite ? `<button class="btn" data-act="fix-undo">Undo</button>` : ''}<button class="btn ghost" data-act="fix-close">Close</button></div>
    <ul class="rules" style="margin-top:6px">${items.map(i => `<li><b>R${i.r}:</b> ${esc(i.changes.join('. '))}.${i.remaining.length ? ` <span class="err-text">Still needs you: ${esc(i.remaining.join(' '))}</span>` : ''}</li>`).join('')}</ul>
    <p class="small" style="margin:6px 0 0">Dashed circles show where players stood before. Calls that were still legal were kept.</p></div>`;
}

/* ---------- Claude ---------- */
function brief(L, r) {
  const rot = ensureSpots(L, r), c = ENG.court(L, r);
  const zl = { 1: 'right back', 2: 'right front', 3: 'middle front', 4: 'left front', 5: 'left back', 6: 'middle back' };
  const lines = [4, 3, 2, 5, 6, 1].map(z => {
    const id = c.zones[z], p = P(id), sp = rot.spots[id] || [.5, .5];
    const role = id === c.setter ? 'SETTING this rotation' : c.libero && c.libero.id === id ? 'libero' : `positions ${p.roles.join('/') || 'unknown'}${p.roles.includes('S') ? ' (setter not setting this rotation, so she can attack)' : ''}`;
    return `- Zone ${z} (${zl[z]}, ${isF(z) ? 'FRONT row' : 'BACK row'}): id ${id}, ${full(id)}; ${role}; ${p.hand === 'L' ? 'left' : 'right'}-handed; back-row attacker: ${p.backRow ? 'yes' : 'no'}; primary passer: ${p.passer ? 'yes' : 'no'}; receive spot ${Math.round(sp[0] * 100)}% from left sideline, ${(sp[1] * 9).toFixed(1)} m from net${p.notes ? `; coach notes: ${p.notes}` : ''}${(p.calls || []).length ? `; calls she already runs: ${p.calls.join(', ')}` : ''}`;
  });
  const gl = S.team.glossary.map(g => `- ${g.code}: ${g.row === 'F' ? 'front-row' : 'back-row'} attack, lane ${Math.round(g.x * 100)}% from left antenna, ${['', 'quick', 'medium', 'high'][g.tempo]} tempo, usually ${(g.roles || []).join('/')}: ${g.desc}`);
  const iss = ENG.callCheck(L, r, S.team, rot).map(i => `- ${i.level}: ${i.msg}`);
  return `Team: ${S.team.name} (club volleyball, USAV rules).
Lineup: "${L.name}". Offense ${L.system}. ${sysLine(L)}.
Rotation ${r} of 6, serve receive. ${c.setter ? `${full(c.setter)} sets from zone ${c.zoneOf[c.setter]} and releases to the target between zones 2 and 3.` : ''}${c.libero ? ` Libero ${full(c.libero.id)} is in for ${full(c.libero.replaces)}.` : ''}
Players on court:
${lines.join('\n')}
Team set-call glossary (only these codes exist):
${gl.join('\n')}
Current calls: ${Object.entries(rot.calls).filter(([, v]) => v).map(([id, code]) => `${id}=${code}`).join(', ') || 'none'}
Rule check results:
${iss.join('\n') || '- none, all legal'}
${rot.note ? `Coach note: ${rot.note}` : ''}`;
}
async function askClaude() {
  const L = curL(), r = S.ed.r;
  S.ai = { lu: L.id, r, loading: true }; render();
  const c = ENG.court(L, r);
  const prompt = `You are an expert club volleyball coach and USAV rules official helping a coach design first-ball (serve-receive) attack combinations.
${brief(L, r)}

Our offensive philosophy: get our hitters open nets or one-on-ones. Hold their middle blocker with a quick (1, 3, Back 1, Slide) so pins and the seam behind it face one blocker or none; stretch the block with fast sets to both antennas; overload one blocker with two nearby hitters (Gap-Go, Back 1 + Red, quick + pipe/bic); add a back-row fourth attacker. Every player may run any legal set; prefer sets each hitter can easily reach from her receive spot, don't give passers quicks, and respect handedness (lefties are on-hand on sets behind the setter; sets in front of the setter cross a lefty's body).
The rules engine's top options for this rotation (score 0-100; per-hitter block read):
${analysis(L, r).opts.map((o, i) => `- Option ${'ABC'[i]} (${o.score}${o.plays.length ? ', ' + o.plays.join(', ') : ''}): ` + Object.entries(o.calls).map(([id, code]) => `${id}=${code} [${(o.read.per[id] || {}).label || '?'}]`).join(', ')).join('\n')}

Task: recommend the best set-call combination for this rotation. You may agree with an engine option or improve on it. Hard rules: use only codes from the glossary; a BACK-row player may only get back-row calls; the libero and the player who is setting get no call; avoid two front-row attackers in the same lane unless it's a deliberate tandem/X behind a quick.
Respond with JSON only, in this shape:
{"calls": {"<player id>": "<code>"}, "headline": "one short sentence naming the plan", "reasoning": ["2 to 4 short bullets a coach can read courtside"], "watch": "one risk to watch for", "alternative": {"calls": {"<player id>": "<code>"}, "when": "when to switch to it"}}`;
  try {
    const data = await S.sample.json(prompt, { modelTier: 'default' });
    const clean = calls => {
      const out = {};
      Object.entries((calls && typeof calls === 'object') ? calls : {}).forEach(([id, code]) => {
        const g = G(String(code)), z = c.zoneOf[id];
        if (!g || z === undefined || id === c.setter || (c.libero && c.libero.id === id)) return;
        if (!isF(z) && g.row === 'F') return;
        out[id] = g.code;
      });
      return out;
    };
    data.calls = clean(data.calls);
    if (data.alternative) data.alternative.calls = clean(data.alternative.calls);
    if (!Object.keys(data.calls).length) throw { code: 'empty' };
    S.ai = { lu: L.id, r, data };
  } catch (e) {
    S.ai = { lu: L.id, r, error: e && e.code === 'rate_limited' ? 'Claude is busy right now. Try again in a minute.' : e && e.code === 'not_granted' ? 'Claude isn’t enabled for this page. Allow it from the page’s permissions to use this.' : 'Claude didn’t return a usable set of calls. Try again.' };
    if (e && e.code === 'not_granted') S.sample = null;
  }
  render();
}
async function reviewLineup() {
  const L = curL();
  S.review = { title: titleOf(L), text: '' }; render();
  const all = [1, 2, 3, 4, 5, 6].map(r => { const rot = ensureSpots(L, r); return `=== ROTATION ${r} ===\n${brief(L, r).split('Players on court:')[1].split('Team set-call glossary')[0]}Calls: ${Object.entries(rot.calls).filter(([, v]) => v).map(([id, code]) => `${nm(id)} ${code}`).join(', ')}\nCombo grade ${ENG.grade(L, r, S.team, rot.calls, rot.spots).score}/100\nIssues: ${ENG.callCheck(L, r, S.team, rot).filter(i => i.level !== 'info').map(i => i.msg).join(' ') || 'none'}`; }).join('\n');
  const prompt = `You are an expert club volleyball coach reviewing a lineup for ${S.team.name} (USAV rules). Offense ${L.system}: ${sysLine(L)}.
Glossary: ${S.team.glossary.map(g => `${g.code} (${g.row === 'F' ? 'front' : 'back'}, lane ${Math.round(g.x * 100)}%)`).join(', ')}.
${all}

Write a short review for the coach: the strongest and weakest rotations and why, the specific fixes to make (name players and calls), and any rule problems. Plain text only, no markdown headings or bold. 5 to 7 lines, each starting with "- ". Under 170 words.`;
  try {
    await S.sample(prompt, { modelTier: 'default', onText: ({ text }) => { S.review.text = text; softRender(); } });
  } catch (e) {
    S.review.error = e && e.code === 'rate_limited' ? 'Claude is busy right now. Try again in a minute.' : 'Claude couldn’t finish the review. Try again.';
    if (e && e.code === 'not_granted') S.sample = null;
  }
  render();
}

/* ---------- render ---------- */
let renderQueued = false;
function render() {
  const app = $('#app');
  if (S.home || !S.team) { app.innerHTML = homeView(); $('#overlay').innerHTML = teamDlgView() + backupView() + fbView(); document.body.style.overflow = S.tdlg || S.bk || S.fb ? 'hidden' : ''; return; }
  if (S.cur && !curL()) S.cur = null;
  if (!S.cur && S.lineups[0]) S.cur = S.lineups[0].id;
  const scrollY = window.scrollY;
  teamKey = JSON.stringify([S.team.glossary, S.team.players.map(p => [p.id, p.roles, p.hand, p.backRow, p.passer, p.calls, p.cant])]);
  const body = { board: boardView, rot: rotView, serve: serveView, live: liveView, roster: rosterView, calls: callsView }[S.view]();
  app.innerHTML = header() + sandboxBar() + tabs() + body;
  const oldSheet = document.querySelector('#overlay .sheet'), sheetY = oldSheet ? oldSheet.scrollTop : 0, sameSheet = oldSheet && !!S.ed === !!oldSheet.querySelector('[aria-label^="Rotation"]');
  $('#overlay').innerHTML = editor() + dlgView() + fbView() + backupView() + teamDlgView();
  const newSheet = document.querySelector('#overlay .sheet');
  if (newSheet && sameSheet && (S.ed ? S.ed.keepScroll !== false : !!S.dlg)) newSheet.scrollTop = sheetY;
  document.body.style.overflow = S.ed || S.dlg || S.fb || S.bk || S.tdlg ? 'hidden' : '';
  window.scrollTo(0, scrollY);
  animateFix();
  startAnim();
  boardAnim();
}
/* Board: slide the tokens between rotations, and between their serve-receive spots and their rotation base (zones 4-3-2 / 5-6-1) */
const BZ = { 4: [0.17, 0.24], 3: [0.5, 0.24], 2: [0.83, 0.24], 5: [0.17, 0.68], 6: [0.5, 0.68], 1: [0.83, 0.68] };
const srT = g => { const m = /translate\(([-\d.]+),\s*([-\d.]+)\)/.exec(g.getAttribute('transform') || ''); return m ? `translate(${m[1]}px, ${m[2]}px)` : ''; };
const bdMode = () => S.bd && S.bd.def ? 'def' : S.bd && S.bd.base ? 'base' : 'sr';
/* Defense: base defensive spots after the serve.
   Front row at the net: setter/opposite zone 2, middle zone 3, outside zone 4.
   Back row: setter/opposite zone 1 and zone 5 just behind the 10-foot line, zone 6 deep.
   The libero takes zone 5 first, so a back-row middle playing with her moves to zone 6. */
const DEF_XY = { 4: [0.13, 0.09], 3: [0.5, 0.09], 2: [0.87, 0.09], 5: [0.12, 0.43], 6: [0.5, 0.88], 1: [0.88, 0.43] };
const DEF_PREF = {
  F: { opp: [2, 3, 4], mid: [3, 4, 2], out: [4, 3, 2], '': [4, 3, 2] },
  B: { lib: [5, 6, 1], opp: [1, 6, 5], mid: [5, 6, 1], out: [6, 5, 1], '': [6, 5, 1] }
};
const DEF_ORDER = ['lib', 'opp', 'mid', 'out', ''];
function defenseSpots(L, r) {
  const c = ENG.court(L, r), out = {}, taken = new Set();
  const kindOf = id => c.libero && c.libero.id === id ? 'lib' : id === c.setter ? 'opp' : roleOf(L, id) || '';
  Object.entries(c.zones).map(([z, id]) => ({ id, row: isF(+z) ? 'F' : 'B', k: kindOf(id) }))
    .sort((a, b) => DEF_ORDER.indexOf(a.k) - DEF_ORDER.indexOf(b.k))
    .forEach(p => { const z = (DEF_PREF[p.row][p.k] || DEF_PREF[p.row]['']).find(z => !taken.has(z)); taken.add(z); out[p.id] = DEF_XY[z].slice(); });
  return out;
}
let ddrag = null;      // dragging a token in Defense (temporary: kept in S.bd.defOv, never saved)
document.addEventListener('pointerdown', e => {
  const g = e.target.closest('.bd-court.def:not(.moving) .tok'); if (!g) return;
  const svg = g.ownerSVGElement; ddrag = { g, svg, id: g.dataset.id, moved: false, x0: e.clientX, y0: e.clientY };
  g.classList.add('dragging'); svg.setPointerCapture && svg.setPointerCapture(e.pointerId); e.preventDefault();
});
document.addEventListener('pointermove', e => {
  const d = ddrag; if (!d) return;
  if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 5) return;
  d.moved = true;
  const [px, py] = svgXY(d.svg, e), x = Math.min(.98, Math.max(.02, px)), y = Math.min(.99, Math.max(.02, py));
  S.bd.defOv = S.bd.defOv || {}; S.bd.defOv[d.id] = [x, y];
  d.g.style.transition = 'none'; d.g.style.transform = `translate(${X(x).toFixed(1)}px, ${Y(y).toFixed(1)}px)`;
});
document.addEventListener('pointerup', () => {
  const d = ddrag; if (!d) return; ddrag = null;
  d.g.classList.remove('dragging');
  if (d.moved && !document.querySelector('[data-act="bd-def-reset"]')) render();     // show the Reset button
});
function boardSnap() {   // where every token is right now, before the board re-renders
  const out = {}; document.querySelectorAll('.bd-court svg .tok[data-id]').forEach(g => { out[g.dataset.id] = g.style.transform || srT(g); }); return out;
}
function boardAnim() {
  const box = S.view === 'board' && document.querySelector('.bd-court'), svg = box && box.querySelector('svg'), L = curL(); if (!svg || !L || !S.bd) return;
  const mode = S.bd.anim, prev = S.bd.prev || {}; S.bd.anim = null; S.bd.prev = null;
  if (!S.bd.base && !S.bd.def && !mode) return;
  const c = ENG.court(S.bdL || L, S.bd.r), D = S.bd.def || mode === 'from:def' ? defenseSpots(S.bdL || L, S.bd.r) : {};
  const toks = [...svg.querySelectorAll('.tok[data-id]')];
  const baseT = g => { const p = BZ[c.zoneOf[g.dataset.id]]; return p ? `translate(${X(p[0]).toFixed(1)}px, ${Y(p[1]).toFixed(1)}px)` : ''; };
  const defT = g => { const id = g.dataset.id, p = (S.bd.def && S.bd.defOv && S.bd.defOv[id]) || D[id]; return p ? `translate(${X(p[0]).toFixed(1)}px, ${Y(p[1]).toFixed(1)}px)` : ''; };
  const posT = (m, g) => m === 'base' ? baseT(g) : m === 'def' ? defT(g) : srT(g);
  const endT = g => posT(bdMode(), g);
  const fromT = g => mode && mode.startsWith('from:') ? posT(mode.slice(5), g) : mode === 'rot' ? prev[g.dataset.id] || null : endT(g);
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  toks.forEach(g => { g.style.transition = 'none'; const f = fromT(g); if (f === null) { g.style.opacity = '0'; g.style.transform = endT(g); } else g.style.transform = f; });
  const finish = () => toks.forEach(g => { if (!g.isConnected) return; g.style.transition = ''; g.style.opacity = ''; if (bdMode() === 'sr') g.style.transform = ''; });
  if (!mode || reduce) { toks.forEach(g => { g.style.transform = endT(g); }); finish(); return; }
  box.classList.add('moving');
  svg.getBoundingClientRect();
  requestAnimationFrame(() => toks.forEach(g => { g.style.transition = 'transform .7s cubic-bezier(.4,0,.2,1), opacity .5s'; g.style.opacity = '1'; g.style.transform = endT(g); }));
  clearTimeout(boardAnim.t); boardAnim.t = setTimeout(() => { box.classList.remove('moving'); finish(); }, 760);
}
function softRender() {
  const a = document.activeElement;
  if (dragging || (a && /INPUT|TEXTAREA/.test(a.tagName) && a.type !== 'checkbox' && a.type !== 'range')) { if (!renderQueued) { renderQueued = true; const f = () => { renderQueued = false; softRender(); }; setTimeout(f, 800); } return; }
  render();
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act],[data-lu],[data-view],[data-open],[data-go],[data-role],[data-grole],[data-sys],[data-opt],[data-libf],[data-set],[data-cant],[data-team],[data-club],[data-sx]');
  if (!t) return;
  const L = curL();
  if (homeClick(t, e)) return;
  if (t.dataset.sx) { const n = setTarget(+t.dataset.sx); const b1 = G('Back 1'); toast(`Setter target: ${sxLabel(SXT())}.${n ? ` ${n} sets that key off the setter moved with her${b1 && b1.rel ? ` (Back 1 is now ${(b1.x * 9).toFixed(1)} m from the left)` : ''}.` : ''}`); render(); return; }
  if (t.dataset.lu) { S.cur = t.dataset.lu; S.confirmDel = false; S.review = null; S.fixLog = null; render(); return; }
  if (t.dataset.view) { S.view = t.dataset.view; render(); return; }
  if (t.dataset.act === 'bd-go') { const r = +t.dataset.r, prev = boardSnap(); S.bd = { ...(S.bd || {}), r, anim: S.bd && S.bd.r !== r ? 'rot' : null, prev, defOv: S.bd && S.bd.r !== r ? {} : S.bd && S.bd.defOv }; render(); return; }
  if (t.dataset.act === 'bd-lib-save' && L) { const N = withLibMode(L, S.bd.lib); L.rotations = N.rotations; L.liberos = N.liberos; saveLineup(L); toast(S.bd.lib === 'none' ? 'Saved: no libero' : `Saved: libero for ${S.bd.lib === 'oh' ? 'OH' : 'MB'} in every rotation`); render(); return; }
  if (t.dataset.act === 'bd-mode') { const m = t.dataset.m, cur = bdMode(); if (m !== cur) { S.bd.base = m === 'base'; S.bd.def = m === 'def'; S.bd.defOv = {}; S.bd.anim = 'from:' + cur; } render(); return; }
  if (t.dataset.act === 'bd-def-reset') { const prev = boardSnap(); S.bd.defOv = {}; S.bd.anim = 'rot'; S.bd.prev = prev; render(); return; }
  if (t.dataset.act === 'bd-reset' && L) { delete rotOf(L, S.bd.r).lines; saveLineup(L); render(); return; }
  if (t.dataset.act === 'bd-clear' && L) { rotOf(L, S.bd.r).lines = {}; saveLineup(L); render(); return; }
  if (t.dataset.open) { S.ed = { r: +t.dataset.open, view: 'anim' }; S.sug = null; Object.assign(anims.top, { t: 0, feature: 0, playing: false, fresh: true, featId: null, cycle: true }); Object.assign(anims.opt, { t: 0, feature: 0, playing: true }); render(); return; }
  if (t.dataset.go) { S.ed = { r: +t.dataset.go, view: S.ed.view }; S.sug = null; Object.assign(anims.top, { t: 0, feature: 0, playing: false, fresh: true, featId: null, cycle: true }); Object.assign(anims.opt, { t: 0, feature: 0, playing: true }); render(); return; }
  if (t.dataset.opt !== undefined) { S.ed.opt = t.dataset.opt === 'cur' ? 'cur' : +t.dataset.opt; Object.assign(anims.opt, { t: 0, feature: 0, playing: true }); render(); return; }
  if (t.dataset.libf) { S.lib.f = t.dataset.libf; render(); return; }
  if (t.dataset.set) { S.lib.sel = S.lib.sel === t.dataset.set ? null : t.dataset.set; render(); return; }
  if (t.dataset.sys) { readDlg(); const D = S.dlg, was = D.system; D.system = t.dataset.sys; D.err = '';
    if (!D.manual && two8(D.system) !== two8(was)) {
      if (two8(D.system)) { const b = D.setterB && D.setterB !== D.pos.S ? D.setterB : (S.team.players.find(p => p.roles.includes('S') && p.id !== D.pos.S) || {}).id; if (b) { const k = posKeys(D).find(k => D.pos[k] === b); if (k) D.pos[k] = D.pos.OPP; D.pos.OPP = b; } }
      else { D.setterB = ''; if (D.pos.OPP && P(D.pos.OPP).roles[0] === 'S') { const o = S.team.players.find(p => !p.roles.includes('L') && p.roles.includes('OPP') && !Object.values(D.pos).includes(p.id)); if (o) { if (D.system === '5-2') D.setterB = D.pos.OPP; D.pos.OPP = o.id; } } }
    }
    if (!D.manual) syncPos(D); render(); return; }
  if (t.dataset.act === 'pv-r') { readDlg(); S.dlg.pvR = +t.dataset.r; render(); return; }
  if (t.dataset.act === 'dlg-manual') { readDlg(); S.dlg.manual = true; S.dlg.err = ''; render(); return; }
  if (t.dataset.act === 'dlg-positions') { readDlg(); const D = S.dlg; if (!posFromOrder(D)) { autoPos(D); toast('The setter wasn’t in the serving order, so positions were filled from player roles.'); } D.manual = false; D.err = ''; syncPos(D); render(); return; }
  if (t.dataset.cant) { if (!S.canWrite) return; const p = P(t.closest('[data-pid]').dataset.pid), c = t.dataset.cant; p.cant = (p.cant || []).includes(c) ? p.cant.filter(x => x !== c) : (p.cant || []).concat(c); saveTeam(); render(); return; }
  if (t.dataset.role) { if (!S.canWrite) return; const p = P(t.closest('[data-pid]').dataset.pid); const r = t.dataset.role; p.roles = p.roles.includes(r) ? p.roles.filter(x => x !== r) : p.roles.concat(r); saveTeam(); render(); return; }
  if (t.dataset.grole) { if (!S.canWrite) return; const g = S.team.glossary[+t.closest('[data-gi]').dataset.gi]; const r = t.dataset.grole; g.roles = (g.roles || []).includes(r) ? g.roles.filter(x => x !== r) : (g.roles || []).concat(r); saveTeam(); render(); return; }
  const a = t.dataset.act;
  if (a === 'close-bg') { if (e.target === t) { S.ed = null; S.dlg = null; render(); } return; }
  if (a === 'close') { S.ed = null; S.sug = null; render(); return; }
  if (a === 'new') { openDlg('new'); return; }
  if (a === 'edit') { openDlg('edit'); return; }
  if (a === 'dlg-close') { S.dlg = null; render(); return; }
  if (a === 'ds-add') { readDlg(); const D = S.dlg, bench = dsBench(D); const pick = bench.find(p => p.roles.includes('DS')) || bench.find(p => !p.roles.includes('S')) || bench[0];
    const out = D.order.find(id => P(id).roles.includes('OPP') && id !== D.setterA) || ''; D.subs.push({ in: pick ? pick.id : '', out, rs: out ? dsBackRs(D, out) : [] }); render(); return; }
  if (a === 'ds-rm') { readDlg(); S.dlg.subs.splice(+t.dataset.i, 1); render(); return; }
  if (a === 'ds-r') { readDlg(); const s = S.dlg.subs[+t.dataset.i], r = +t.dataset.r; s.rs = s.rs.includes(r) ? s.rs.filter(x => x !== r) : s.rs.concat(r).sort(); render(); return; }
  if (a === 'plan-mid' || a === 'plan-split' || a === 'plan-none') {
    readDlg(); const D = S.dlg;
    for (let r = 1; r <= 6; r++) D.plan[r] = a === 'plan-none' ? { lib: '', rep: '' } : { lib: a === 'plan-split' && r >= 4 ? D.l2 : D.l1, rep: libDefault(D, r) };
    normalizePlan(D); render(); return;
  }
  if (a === 'dlg-build') { const err = buildFromDlg(); if (typeof err === 'string') { render(); } else render(); return; }
  if (a === 'dlg-rename') { readDlg(); if (S.dlg.order.join() !== L.order.join() || S.dlg.system !== L.system || (L.system === '6-2' && JSON.stringify(hitSwaps(S.dlg)) !== JSON.stringify(L.swaps || []))) { S.dlg.err = 'You changed positions, the starting rotation, the offense or the front-row hitter subs. Use Rebuild lineup to apply that.'; render(); return; } if (!S.dlg.name.trim()) { S.dlg.err = 'Give the lineup a name.'; render(); return; } L.name = S.dlg.name.trim(); if ((S.dlg.subs || []).some(s => s.in && L.order.includes(s.in))) { S.dlg.err = 'A DS has to come off the bench, not from the serving order.'; render(); return; } const sc = applySubs(L, S.dlg); const n = applyLiberoPlan(L, S.dlg); S.dlg = null; saveLineup(L); toast(n || sc.length ? `Saved. ${sc.length ? `Subs changed in R${sc.join(', R')}. ` : ''}${n ? `Libero changed in ${n} rotation${n > 1 ? 's' : ''}. ` : ''}Those formations re-lined up.` : 'Saved'); render(); return; }
  if (a === 'dup' && L) { const d = clone(L); d.id = 'l' + Date.now().toString(36); d.name = L.name + ' (copy)'; d.sort = Date.now(); d.source = `Copied from ${L.name}`; S.lineups.push(d); S.cur = d.id; saveLineup(d); toast('Duplicated'); render(); return; }
  if (a === 'del') { S.confirmDel = true; render(); return; }
  if (a === 'del-no') { S.confirmDel = false; render(); return; }
  if (a === 'del-yes' && L) { S.confirmDel = false; deleteLineup(L); return; }
  if (a === 'review') { reviewLineup(); return; }
  if (a === 'review-close') { S.review = null; render(); return; }
  if (a === 'suggest') { const r = S.ed.r; const rec = ENG.recommend(L, r, S.team, rotOf(L, r)); S.sug = { lu: L.id, r, ...rec }; render(); return; }
  if (a === 'apply-sug') { const rot = rotOf(L, S.ed.r); rot.calls = { ...S.sug.calls }; S.sug = null; saveLineup(L, [S.ed.r]); render(); return; }
  if (a === 'dismiss-sug') { S.sug = null; render(); return; }
  if (a === 'ask') { askClaude(); return; }
  if (a === 'apply-ai' || a === 'apply-ai-alt') { const rot = rotOf(L, S.ed.r); rot.calls = { ...(a === 'apply-ai' ? S.ai.data.calls : S.ai.data.alternative.calls) }; saveLineup(L, [S.ed.r]); toast('Calls updated'); render(); return; }
  if (a === 'ed-view') { S.ed.view = t.dataset.v; if (S.ed.view === 'anim') Object.assign(anims.top, { fresh: true, playing: false }); render(); return; }
  if (a === 'pass-tog' || a === 'pass-pre' || a === 'sr-hide') {
    const r = S.ed.r, rot = rotOf(L, r), c = ENG.court(L, r);
    applyReceive(L, r, () => {
      let ps = ENG.passersOf(L, r, S.team, rot);
      if (a === 'sr-hide') {
        const id = t.dataset.id, sr = rot.sr = { showGo: null, hide: [], ...(rot.sr || {}) };
        sr.hide = sr.hide.includes(id) ? sr.hide.filter(x => x !== id) : sr.hide.concat(id);
        if (sr.hide.includes(id) && ps.includes(id)) { const n = ps.length; rot.passers = ENG.defaultPassers(L, r, S.team, n, ps.filter(x => x !== id), rot); }
        if (rot.passers && ENG.passersOf(L, r, S.team, rot).length < 2) delete rot.passers;
        return sr.hide.includes(id) ? `${nm(id)} is hidden from passing.` : `${nm(id)} is back in the passing pool.`;
      }
      if (a === 'pass-tog') {
        const id = t.dataset.id;
        if (ps.includes(id) && ps.length <= 2) { toast('Keep at least 2 passers.'); return null; }
        ps = ps.includes(id) ? ps.filter(x => x !== id) : ps.concat(id);
        if (ps.length > 5) { toast('5 passers is the most.'); return null; }
      } else if (t.dataset.n === 'lib2') {
        const o = ENG.srOpts(L, r, rot), ok = id => id !== c.setter && id !== o.showGo && !o.hide.includes(id);
        const lib = Object.values(c.zones).filter(id => ok(id) && c.libero && c.libero.id === id);
        const oh = Object.values(c.zones).filter(id => ok(id) && P(id).roles.includes('OH')).sort((x, y) => (isF(c.zoneOf[x]) ? 1 : 0) - (isF(c.zoneOf[y]) ? 1 : 0));
        ps = lib.concat(oh).slice(0, 3);
        if (ps.length < 2) ps = ENG.defaultPassers(L, r, S.team, 3, ps, rot);
      } else ps = ENG.defaultPassers(L, r, S.team, +t.dataset.n, [], rot);
      rot.passers = ps;
      return `${ps.length}-person pass: ${ps.map(nm).join(', ')}.`;
    });
    return;
  }
  if (a === 'lineup') {
    const r = S.ed.r, rot = rotOf(L, r), G = code => S.team.glossary.find(g => g.code === code);
    const before = clone(rot.spots), ps = ENG.passersOf(L, r, S.team, rot);
    rot.spots = ENG.formationFor(L, r, S.team, rot.calls, ps, rot); saveLineup(L, [r]);
    const diffs = Object.entries(rot.calls).filter(([id, code]) => G(code) && before[id] && rot.spots[id]).map(([id, code]) => `${nm(id)} ${ENG.routeM(before[id], G(code)).toFixed(1)} → ${ENG.routeM(rot.spots[id], G(code)).toFixed(1)} m`);
    S.ed.applied = { label: 'New lineup', prev: clone(rot.calls), prevSpots: before };
    S.ed.changedMsg = `Lined up for these sets. Routes: ${diffs.join(', ')}.`; S.ed.view = 'anim';
    Object.assign(anims.top, { t: 0, playing: true, featId: null, cycle: true, serve: 0 }); render(); return;
  }
  if (a === 'opt-undo' && S.ed.applied && S.ed.applied.prevSubs) { L.subs = S.ed.applied.prevSubs; L.rotations[S.ed.r - 1] = S.ed.applied.prevRotAll; S.ed.applied = null; S.ed.changedMsg = ''; saveLineup(L, [S.ed.r]); Object.assign(anims.top, { t: 0, playing: true }); render(); return; }
  if (a === 'opt-undo') { const rot = rotOf(L, S.ed.r); rot.calls = S.ed.applied.prev; if (S.ed.applied.prevSpots) rot.spots = S.ed.applied.prevSpots; if (S.ed.applied.prevRecv) { const pr = S.ed.applied.prevRecv; if (pr.passers) rot.passers = pr.passers; else delete rot.passers; if (pr.sr) rot.sr = pr.sr; else delete rot.sr; } S.ed.changedMsg = ''; S.ed.applied = null; saveLineup(L, [S.ed.r]); Object.assign(anims.top, { t: 0, playing: true }); render(); return; }
  if (a === 'opt-dismiss') { S.ed.applied = null; render(); return; }
  if (a === 'retarget-ok') { S.retarget = null; render(); return; }
  if (a === 'retarget-undo' && S.retarget) { const R = S.retarget; if (R.prevSx === undefined) delete S.team.setterX; else S.team.setterX = R.prevSx; applyTarget(S.team); S.lineups.forEach((L, i) => (R.prevSpots[i] || []).forEach((sp, k) => { if (sp && L.rotations[k]) L.rotations[k].spots = sp; })); S.retarget = null; saveTeam(); toast('Setter target and receive spots put back'); render(); return; }
  if (a === 'unsub') {
    const r = S.ed.r, id = t.dataset.id, s = (L.subs || []).find(x => x.in === id && x.rs.includes(r)), back = s && s.out;
    const u = subOut(L, r, id); saveLineup(L, [r]);
    S.ed.applied = { label: 'Sub', prev: u.prevRot.calls, prevSpots: u.prevRot.spots, prevSubs: u.prev, prevRotAll: u.prevRot };
    S.ed.changedMsg = `${nm(back)} is back in for ${nm(id)} this rotation. Players re-lined up.`;
    S.ed.view = 'anim'; Object.assign(anims.top, { t: 0, playing: true, featId: null, cycle: true, serve: 0, fresh: false }); render(); return;
  }
  if (a && a.startsWith('an-')) {
    const A = anims[t.dataset.ak]; if (!A) return;
    if (a === 'an-play') { A.playing = !A.playing; if (A.playing && A.model && A.t >= A.model.T + (A.model.T0 || 0) - 0.7) A.t = 0; startAnim(); return; }
    if (a === 'an-replay') { A.t = 0; A.playing = true; }
    if (a === 'an-cycle') { A.cycle = true; A.featId = null; A.t = 0; A.playing = true; }
    if (a === 'an-feat') { A.cycle = false; A.featId = null; A.feature = +t.dataset.i; A.t = 0; A.playing = true; }
    if (a === 'an-speed') A.speed = A.speed === 0.5 ? 1 : 0.5;
    render(); return;
  }
  if (a === 'use-opt') {
    const k = +t.dataset.k, an = analysis(L, S.ed.r), o = an.opts[k]; if (!o) return;
    const rot = rotOf(L, S.ed.r);
    S.ed.applied = { label: `Option ${'ABC'[k]}`, prev: clone(rot.calls), prevSpots: clone(rot.spots) };
    rot.calls = { ...o.calls }; if (o.spots) rot.spots = clone(o.spots); saveLineup(L, [S.ed.r]); S.ed.opt = 'cur'; S.ed.view = 'anim';
    Object.assign(anims.top, { t: 0, feature: 0, playing: true, featId: null, cycle: true }); Object.assign(anims.opt, { t: 0, feature: 0 });
    render();
    const sh = document.querySelector('.sheet'); if (sh) sh.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  if (a === 'retry-save') { setSave('saving'); retrySaves(); return; }
  if (a === 'autofix') { fixRotations(L, [+t.dataset.r]); return; }
  if (a === 'autofix-all') { fixRotations(L, [1, 2, 3, 4, 5, 6].filter(r => issuesFor(L, r).some(i => i.level !== 'info'))); return; }
  if (a === 'fix-close') { S.fixLog = null; render(); return; }
  if (a === 'fix-undo') { const F = S.fixLog; const LL = S.lineups.find(x => x.id === F.lu); if (LL) { F.items.forEach(i => LL.rotations[i.r - 1] = i.prev); saveLineup(LL, F.items.map(i => i.r)); } S.fixLog = null; toast('Fix undone'); render(); return; }
  if (a === 'fix') { const r = S.ed.r, rot = rotOf(L, r), c = ENG.court(L, r); const before = ENG.overlap(c, rot.spots, x => x).length; rot.spots = ENG.repair(c, rot.spots, new Set(), 0.06); saveLineup(L, [r]); toast(before ? 'Nudged players into legal spots' : 'Already legal'); render(); return; }
  if (a === 'rebuild') { const r = S.ed.r, rot = rotOf(L, r); rot.spots = ENG.formationFor(L, r, S.team, rot.calls, ENG.passersOf(L, r, S.team, rot), rot); saveLineup(L, [r]); toast('Formation rebuilt'); render(); return; }
  if (a === 'clear-stray') { const r = S.ed.r, rot = rotOf(L, r), c = ENG.court(L, r); Object.keys(rot.calls).forEach(id => { if (c.zoneOf[id] === undefined) delete rot.calls[id]; }); saveLineup(L, [r]); render(); return; }
  if (a === 'live-start') { const th = $('#liveThem'); if (th && S.liveSetup) S.liveSetup.them = th.value.trim() || 'Them'; liveNew(t.dataset.serve); render(); return; }
  if (a === 'live-setup-reset') { S.liveSetup = { ...S.liveSetup, slots: L.order.map(tokP), lib: tokP((L.liberos || [])[0] || null), sel: null }; render(); return; }
  if (a === 'live-rename') { S.liveRename = t.dataset.side; render(); setTimeout(() => { const el = $('#liveName-' + t.dataset.side); if (el) { el.focus(); el.select(); } }, 20); return; }
  if (a === 'live-rot') { S.liveRot = { r: S.live.r, serving: S.live.serving }; render(); return; }
  if (a === 'live-rot-r') { S.liveRot.r = +t.dataset.r; render(); return; }
  if (a === 'live-rot-s') { S.liveRot.serving = t.dataset.s; render(); return; }
  if (a === 'live-rot-apply') { liveSetRot(S.liveRot.r, S.liveRot.serving); return; }
  if (a === 'live-rot-close') { if (e.target === t || t.tagName === 'BUTTON') { S.liveRot = null; render(); } return; }
  if (a === 'live-sub') { S.liveSub = { k: +t.dataset.k }; render(); return; }
  if (a === 'live-sub-pick') { liveManualSub(S.liveSub.k, t.dataset.id, false); return; }
  if (a === 'live-sub-block') { S.liveSub.block = t.dataset.id; render(); return; }
  if (a === 'live-sub-back') { S.liveSub.block = null; render(); return; }
  if (a === 'live-sub-override') { liveManualSub(S.liveSub.k, t.dataset.id, true); return; }
  if (a === 'live-sub-close') { if (e.target === t || t.tagName === 'BUTTON') { S.liveSub = null; render(); } return; }
  if (a === 'sub-yes') { liveSubAnswer(true); return; }
  if (a === 'plan-add') {
    const U = S.liveSetup; if (!U) return;
    const i = $('#planIn').value, o = $('#planOut').value, r = +$('#planR').value;
    if (!i || !o) { toast('Pick who comes in and who goes out'); return; }
    U.plans = (U.plans || []).filter(p => !(p.r === r && p.out === o)).concat({ in: i, out: o, r }); render(); return;
  }
  if (a === 'plan-del') { const o = t.dataset.ctx === 'setup' ? S.liveSetup : S.live; if (o && o.plans) { o.plans.splice(+t.dataset.i, 1); if (o === S.live) liveSave(); } render(); return; }
  if (a === 'sub-no') { liveSubAnswer(false); return; }
  if (a === 'pt-us') { livePoint(true); return; }
  if (a === 'pt-them') { livePoint(false); return; }
  if (a === 'undo') { const h = S.live.hist.pop(); if (h) { h.hist = S.live.hist; h.plans = S.live.plans; S.live = h; liveSave(); } render(); return; }
  if (a === 'live-reset') { S.lastSet = S.live; S.live = null; S.liveSetup = null; S.liveSub = null; S.liveRot = null; liveSave(); render(); return; }
  if (a === 'add-player') {
    const f = ($('#npFirst').value || '').trim(), l = ($('#npLast').value || '').trim(); if (!f) { toast('Add a first name'); return; }
    let id = (f[0] + (l[0] || f[1] || 'X')).toUpperCase(), n = 2; while (pool().some(p => p.id === id)) id = (f[0] + (l[0] || '') + n++).toUpperCase();
    pool().push({ id, first: f, last: l, roles: [], backRow: false, passer: false, jersey: '', height: '', hand: 'R', notes: '', calls: [] }); saveTeam(); render(); return;
  }
  if (a === 'add-call') { const code = ($('#newCall').value || '').trim(); if (!code) return; if (G(code)) { toast(`“${code}” already exists`); return; } S.team.glossary.push({ code, row: 'F', x: .5, tempo: 2, roles: [], desc: '', confirmed: true }); saveTeam(); render(); return; }
  if (a === 'del-call') { S.team.glossary.splice(+t.dataset.gi, 1); saveTeam(); render(); return; }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && (S.ed || S.dlg)) { S.ed = null; S.dlg = null; render(); }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.rot[data-open]')) { e.preventDefault(); S.ed = { r: +e.target.dataset.open }; render(); }
});
document.addEventListener('change', e => {
  const t = e.target, L = curL();
  if (S.dlg && ((!S.dlg.manual && (t.dataset.pos !== undefined || t.id === 'dStart' || t.id === 'dMid' || t.id === 'dSB')) || t.id === 'dHA' || t.id === 'dHB' || t.id === 'dL1' || t.id === 'dL2')) { readDlg(); S.dlg.err = ''; render(); return; }
  if (t.dataset.call !== undefined) { const rot = rotOf(L, S.ed.r); if (t.value) rot.calls[t.dataset.call] = t.value; else delete rot.calls[t.dataset.call]; saveLineup(L, [S.ed.r]);
    // replay the play from the start with the ball going to the player whose set just changed
    Object.assign(anims.top, { t: 0, playing: true, cycle: false, featId: t.value ? t.dataset.call : null, fresh: false, changed: t.dataset.call }); if (S.ed.view === 'edit') S.ed.view = 'anim';
    S.ed.opt = 'cur'; S.ed.changedMsg = t.value ? `${nm(t.dataset.call)} now runs ${t.value}. Watch it at the top.` : `${nm(t.dataset.call)} has no call now.`;
    dlog('callChange', { r: S.ed.r, id: t.dataset.call, code: t.value }); render(); return; }
  if (t.id === 'libId' || t.id === 'libFor') {
    const r = S.ed.r, rot = rotOf(L, r), id = $('#libId').value;
    if (!id) rot.libero = null;
    else {
      const base = ENG.court({ ...L, rotations: L.rotations.map((x, i) => i === r - 1 ? { ...x, libero: null } : x) }, r);
      const opts = [5, 6, 1].map(z => base.zones[z]).filter(x => x !== base.setter);
      const rep = t.id === 'libFor' ? $('#libFor').value : (rot.libero && opts.includes(rot.libero.replaces) ? rot.libero.replaces : (opts.find(x => P(x).roles.includes('M')) || opts[0]));
      const prev = rot.libero; rot.libero = { id, replaces: rep };
      if (prev && prev.id !== id && rot.spots[prev.id] && !rot.spots[id]) rot.spots[id] = rot.spots[prev.id];
      if (rot.spots[rep] && !rot.spots[id]) rot.spots[id] = rot.spots[rep].slice();
      delete rot.calls[id];
    }
    saveLineup(L, [r]); render(); return;
  }
  if (t.dataset.cover) { const rot = rotOf(L, S.ed.r); rot.cover = { ...(rot.cover || {}), [t.dataset.cover]: t.value }; saveLineup(L, [S.ed.r]); Object.assign(anims.top, { t: 0, playing: true, fresh: false, featId: /^(mb|set|home)$/.test(t.value) ? anims.top.featId : t.value, cycle: /^(mb|set|home)$/.test(t.value) }); S.ed.view = 'anim'; render(); return; }
  if (t.id === 'coverMode') { S.team.coverMode = t.value; saveTeam(); Object.assign(anims.top, { t: 0, playing: true, fresh: false }); if (S.ed) S.ed.view = 'anim'; toast(t.value === 'quick' ? 'Libero now follows the quick hitter' : 'Libero and DS now cover whoever gets the set'); render(); return; }
  if (t.id === 'libCover') { const rot = rotOf(L, S.ed.r); rot.libCover = t.value; saveLineup(L, [S.ed.r]); Object.assign(anims.top, { t: 0, playing: true, fresh: false }); S.ed.view = 'anim'; render(); return; }
  if (t.id === 'sxRange') { setTarget(+t.value); render(); return; }
  if (t.dataset.subout !== undefined && t.value) {
    const r = S.ed.r, out = t.dataset.subout, inn = t.value, f = isF(ENG.court(L, r).zoneOf[out]);
    const u = subIn(L, r, out, inn); saveLineup(L, [r]);
    S.ed.applied = { label: 'Sub', prev: u.prevRot.calls, prevSpots: u.prevRot.spots, prevSubs: u.prev, prevRotAll: u.prevRot };
    S.ed.changedMsg = `${nm(inn)} in for ${nm(out)} ${f ? 'in the front row' : 'in the back row'} this rotation${rotOf(L, r).calls[inn] ? `, running ${rotOf(L, r).calls[inn]}` : ''}. Players re-lined up.`;
    S.ed.view = 'anim'; Object.assign(anims.top, { t: 0, playing: true, featId: null, cycle: true, serve: 0, fresh: false }); render(); return;
  }
  if (t.id === 'srShow') {
    const r = S.ed.r, rot = rotOf(L, r), id = t.value;
    applyReceive(L, r, () => {
      rot.sr = { showGo: null, hide: [], ...(rot.sr || {}), showGo: id || null };
      if (rot.passers) rot.passers = rot.passers.filter(x => x !== id);
      return id ? `${nm(id)} shows pass, then goes.` : 'No show & go.';
    });
    return;
  }
  if (t.id === 'rotNote') { rotOf(L, S.ed.r).note = t.value; saveLineup(L, [S.ed.r]); return; }
  if (t.dataset.pf) { const p = P(t.closest('[data-pid]').dataset.pid); p[t.dataset.pf] = t.type === 'checkbox' ? t.checked : t.value; saveTeam(); if (t.type === 'checkbox' || t.tagName === 'SELECT') render(); return; }
  if (t.dataset.gf === 'rel') { const g = S.team.glossary[+t.closest('[data-gi]').dataset.gi]; g.rel = t.checked; if (g.rel) g.off = +(g.x - SXT()).toFixed(3); else delete g.off; saveTeam(); render(); return; }
  if (t.dataset.gf === 'x') { const g = S.team.glossary[+t.closest('[data-gi]').dataset.gi]; g.x = +t.value; if (g.rel) g.off = +(g.x - SXT()).toFixed(3); saveTeam(); render(); return; }
  if (t.dataset.gf) { const g = S.team.glossary[+t.closest('[data-gi]').dataset.gi]; const f = t.dataset.gf; g[f] = f === 'x' ? +t.value : f === 'tempo' ? +t.value : f === 'confirmed' ? t.checked : t.value; saveTeam(); render(); return; }
  if (t.id === 'libWho') { S.lib.who = t.value; render(); return; }
  if (t.id === 'subLimit') { S.team.subLimit = Math.max(1, +t.value || 15); saveTeam(); return; }
  if (S.dlg && t.closest('.panel')) { readDlg(); if (t.tagName === 'SELECT') render(); }
});

/* drag tokens (and Board line handles) */
function svgXY(svg, e) { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const p = pt.matrixTransform(svg.getScreenCTM().inverse()); return [(p.x - X0) / CW, (p.y - Y0) / CH]; }
function liveLegal(d) {                 // re-ring tokens while dragging so an illegal spot shows right away
  const c = ENG.court(d.L, d.r), ov = ENG.overlap(c, d.rot.spots, x => x), bad = new Set(), tight = new Set();
  ov.forEach(o => [o.a, o.b].forEach(x => (o.tight ? tight : bad).add(x)));
  d.svg.querySelectorAll('.tok').forEach(g => { const id = g.dataset.id; g.classList.toggle('bad', bad.has(id)); g.classList.toggle('tight', !bad.has(id) && tight.has(id)); g.classList.remove('moved'); });
}
function redrawLine(d, id) {
  const ln = d.rot.lines && d.rot.lines[id], sp = d.rot.spots[id]; if (!ln || !sp) return;
  const g = lineGeo(sp, ln), path = d.svg.querySelector(`[data-line="${CSS.escape(id)}"]`);
  if (path) path.setAttribute('d', g.d);
  const to = d.svg.querySelector(`.lhg[data-lh="to"][data-id="${CSS.escape(id)}"]`), mid = d.svg.querySelector(`.lhg[data-lh="c"][data-id="${CSS.escape(id)}"]`);
  if (to) to.setAttribute('transform', `translate(${g.T[0].toFixed(1)},${g.T[1].toFixed(1)})`);
  if (mid) mid.setAttribute('transform', `translate(${g.M[0].toFixed(1)},${g.M[1].toFixed(1)})`);
}
document.addEventListener('pointerdown', e => {
  if (!S.canWrite) return;
  const h = e.target.closest('.board-svg .lhg'), g = h ? null : e.target.closest('.drag .tok'); if (!h && !g) return;
  const svg = (h || g).ownerSVGElement, L = curL(), r = +svg.dataset.r, rot = rotOf(L, r);
  if (h) { linesMat(L, r); }
  dragging = { g: h || g, svg, id: (h || g).dataset.id, hd: h ? h.dataset.lh : null, rot, L, r, moved: false, x0: e.clientX, y0: e.clientY, board: svg.classList.contains('board-svg') };
  (h || g).classList.add('dragging'); svg.setPointerCapture && svg.setPointerCapture(e.pointerId); e.preventDefault();
});
document.addEventListener('pointermove', e => {
  if (!dragging) return;
  const d = dragging;
  if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 5) return;       // small wobble is still a tap
  d.moved = true;
  const [px, py] = svgXY(d.svg, e);
  if (d.hd) {
    const ln = d.rot.lines[d.id], sp = d.rot.spots[d.id]; if (!ln || !sp) return;
    const x = Math.min(1.04, Math.max(-0.04, px)), y = Math.min(0.99, Math.max(0.01, py));
    if (d.hd === 'to') ln.to = [+x.toFixed(3), +y.toFixed(3)];
    else { const mid = [(sp[0] + ln.to[0]) / 2, (sp[1] + ln.to[1]) / 2]; ln.off = [+(2 * (x - mid[0])).toFixed(3), +(2 * (y - mid[1])).toFixed(3)]; }
    redrawLine(d, d.id); return;
  }
  const x = Math.min(.98, Math.max(.02, px)), y = Math.min(.99, Math.max(.02, py));
  d.rot.spots[d.id] = [+x.toFixed(3), +y.toFixed(3)];
  d.g.setAttribute('transform', `translate(${X(x).toFixed(1)},${Y(y).toFixed(1)})`);
  liveLegal(d);
  if (d.board) redrawLine(d, d.id);
});
document.addEventListener('pointerup', () => {
  if (!dragging) return;
  const d = dragging; dragging = null;
  const cur = S.lineups.find(x => x.id === d.L.id) || d.L;
  if (d.moved) {
    if (cur !== d.L) { const cr = rotOf(cur, d.r); cr.spots[d.id] = d.rot.spots[d.id]; if (d.rot.lines) cr.lines = d.rot.lines; }
    saveLineup(cur); render();
  } else if (d.board && !d.hd) { toggleLine(cur, d.r, d.id); render(); }
  else d.g.classList.remove('dragging');
});

function fbView() { return ''; }

/* ---------- teams, roster import, backups ---------- */
const PASTE_EXAMPLE = '12, Jane Smith, S\n7, Maya Lopez, M, lefty\nAva Chen, L\n3 Riley Park OH/OPP back row passer';
const POS = { S: 'S', SETTER: 'S', OH: 'OH', OUTSIDE: 'OH', LS: 'OH', M: 'M', MB: 'M', MH: 'M', MIDDLE: 'M', OPP: 'OPP', RS: 'OPP', RH: 'OPP', OPPOSITE: 'OPP', RIGHTSIDE: 'OPP', L: 'L', LIB: 'L', LIBERO: 'L', DS: 'DS' };
const HAND_L = ['LEFTY', 'LEFT', 'LEFTHANDED', 'LEFT-HANDED', 'LH', '(L)'];
const HAND_R = ['RIGHTY', 'RIGHT', 'RIGHTHANDED', 'RIGHT-HANDED', '(R)'];
const BR = ['BR', 'BACKROW', 'BACK-ROW', 'PIPE'];
const PASS = ['P', 'PASSER', 'PASSING', 'SR'];

function newPlayer(o) { return { id: '', first: '', last: '', roles: [], backRow: false, passer: false, jersey: '', height: '', hand: 'R', notes: '', calls: [], ...o }; }
function assignIds(list, taken) {
  const used = new Set(taken || []);
  list.forEach(p => {
    const f = (p.first || '?').replace(/[^A-Za-z]/g, '') || 'X', l = (p.last || '').replace(/[^A-Za-z]/g, '');
    let id = (f[0] + (l[0] || f[1] || 'X')).toUpperCase(), n = 2;
    while (used.has(id)) id = (f[0] + (l[0] || '')).toUpperCase() + n++;
    used.add(id); p.id = id;
  });
  return list;
}
function parseRoster(text) {
  const lines = String(text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const out = [], skipped = [];
  if (!lines.length) return { players: out, skipped };
  const split = l => l.split(/\t|,|;|\|/).map(c => c.trim());
  // spreadsheet with a header row
  let head = null;
  const h0 = split(lines[0]).map(c => c.toLowerCase());
  if (h0.length > 1 && h0.some(c => /^(name|first|first name|player|position|pos|jersey|#|number|no\.?|hand)$/.test(c))) {
    head = {};
    h0.forEach((c, i) => {
      if (/^(first|first name|firstname)$/.test(c)) head.first = i;
      else if (/^(last|last name|lastname|surname)$/.test(c)) head.last = i;
      else if (/^(name|player|full name)$/.test(c)) head.name = i;
      else if (/^(#|jersey|number|no\.?|num)$/.test(c)) head.jersey = i;
      else if (/^(pos|position|positions)$/.test(c)) head.pos = i;
      else if (/hand/.test(c)) head.hand = i;
      else if (/back/.test(c)) head.br = i;
      else if (/pass/.test(c)) head.pass = i;
    });
    lines.shift();
  }
  const yes = v => /^(y|yes|x|true|1|✓)$/i.test(String(v || '').trim());
  lines.forEach(line => {
    const p = newPlayer({});
    const cells = split(line);
    const words = [];
    const kw = tok => {
      const u = tok.toUpperCase().replace(/\.$/, '');
      if (POS[u]) { if (!p.roles.includes(POS[u])) p.roles.push(POS[u]); return true; }
      if (HAND_L.includes(u)) { p.hand = 'L'; return true; }
      if (HAND_R.includes(u)) { p.hand = 'R'; return true; }
      if (BR.includes(u)) { p.backRow = true; return true; }
      if (PASS.includes(u)) { p.passer = true; return true; }
      return false;
    };
    if (head) {
      const g = k => head[k] !== undefined ? (cells[head[k]] || '').trim() : '';
      if (head.first !== undefined) { p.first = g('first'); p.last = g('last'); }
      else { const n = g('name').split(/\s+/).filter(Boolean); p.first = n[0] || ''; p.last = n.slice(1).join(' '); }
      p.jersey = g('jersey').replace(/^#/, '');
      g('pos').split(/[\/\s,&+]+/).filter(Boolean).forEach(kw);
      const hd = g('hand').toUpperCase(); if (/^L/.test(hd)) p.hand = 'L';
      if (yes(g('br'))) p.backRow = true;
      if (yes(g('pass'))) p.passer = true;
    } else {
      cells.forEach(cell => {
        const toks = cell.replace(/back[\s-]?row/ig, 'BACKROW').split(/\s+/).filter(Boolean);
        toks.forEach(tok => {
          if (/^#?\d{1,3}$/.test(tok) && !p.jersey) { p.jersey = tok.replace('#', ''); return; }
          if (tok.includes('/') && tok.split('/').every(x => POS[x.toUpperCase()])) { tok.split('/').forEach(kw); return; }
          if (words.length && kw(tok)) return;
          if (!words.length && tok.length <= 3 && kw(tok)) return;
          words.push(tok);
        });
      });
      p.first = words[0] || ''; p.last = words.slice(1).join(' ');
    }
    if (!p.first) { skipped.push(line); return; }
    out.push(p);
  });
  return { players: out, skipped };
}
function teamFrom({ name, season, players, source, clubKey, glossary }) {
  return { id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name, season: season || '', source: source || 'custom', clubKey: clubKey || null,
    players, glossary: clone(glossary || GLOSSARY), subLimit: 15, createdAt: new Date().toISOString() };
}
function openTeam(id, quiet) {
  const t = DB.teams[id]; if (!t) return;
  if (t.glossary && !t.glossary.some(g => g.code === '4')) { const g4 = clone(GLOSSARY.find(g => g.code === '4')); g4.rel = false; t.glossary.push(g4); writeStore(); }   // older teams get the 4 set too
  const relFixed = relInit(t); subInit(t);
  S.team = t; S.lineups = DB.lineups[id] || (DB.lineups[id] = []);
  if (relFixed) {     // re-line the rotations where someone runs a set that just moved back to its seam
    S.lineups.forEach(L => L.rotations.forEach((rot, i) => { if (rot && Object.values(rot.calls || {}).some(c => UNREL_V2.includes(c))) rot.spots = ENG.formationFor(L, i + 1, t, rot.calls, ENG.passersOf(L, i + 1, t, rot), rot); }));
    writeStore();
  }
  S.lineups.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  S.cur = S.lineups[0] ? S.lineups[0].id : null; S.home = false; S.ed = null; S.dlg = null; S.confirmDel = false; S.view = S.lineups.length ? 'board' : 'roster'; S.live = liveLoad();
  if (S.live && S.lineups.some(l => l.id === S.live.lu)) { S.cur = S.live.lu; if (quiet) S.view = 'live'; }   // reopening mid-set lands back on the live set
  if (!quiet) { DB.cur = id; writeStore(); }
}
function addTeam(t, lineups) {
  DB.teams[t.id] = t; DB.lineups[t.id] = lineups || [];
  openTeam(t.id);
}

/* ---------- sample team: loaded on first visit so anyone can start without setup ---------- */
const SAMPLE_ROSTER = `1, S1, S
2, OH1, OH, passer
3, MB1, M
4, OP, OPP
5, OH2, OH, passer
6, MB2, M
7, L, L
8, DS, DS, passer
9, OH3, OH
10, MB3, M
11, S2, S
12, S3, S`;
// the sample team's players (made up). [id, first, last, jersey, positions]
const ROSTER14 = [['maya', 'Maya', 'Chen', '3', ['S']], ['riley', 'Riley', 'Brooks', '8', ['S']], ['ava', 'Ava', 'Thompson', '10', ['OH']], ['sofia', 'Sofia', 'Ramirez', '4', ['OH']],
  ['nora', 'Nora', 'Patel', '15', ['OH']], ['chloe', 'Chloe', 'Nguyen', '12', ['M']], ['zoe', 'Zoe', 'Martin', '22', ['M']], ['lena', 'Lena', 'Fischer', '19', ['M']],
  ['isla', 'Isla', 'Morgan', '7', ['OPP']], ['mia', 'Mia', 'Rossi', '1', ['L']], ['grace', 'Grace', 'Kim', '5', ['DS']], ['ella', 'Ella', 'Carter', '9', ['DS', 'L']], ['quinn', 'Quinn', 'Alvarez', '17', ['OH', 'OPP']]];
const SIX_MAP = { SS: 'r-maya', OH: 'r-ava', MB: 'r-chloe', RS: 'r-isla', OH2: 'r-sofia', MB2: 'r-zoe', LL: 'r-mia', DS: 'r-grace', S2: 'r-riley' };
/* v7: players and position tokens are separate. t.players = the tokens used by lineups (S1, OH1, MB1...), t.roster = the real players. */
function toRosterV7(t) {
  const inUse = new Set((DB.lineups[t.id] || []).flatMap(L => [].concat(L.order || [], L.setters || [], L.liberos || [], (L.swaps || []).flatMap(x => [x.starter, x.sub]), (L.subs || []).flatMap(x => [x.in, x.out]))));
  t.players = t.players.filter(p => !['OH3', 'MB3', 'S3'].includes(p.id) || inUse.has(p.id));
  const tot = {}, seen = {}, pre = p => POS_LABEL[(p.roles || [])[0]] || 'P';
  t.players.forEach(p => { tot[pre(p)] = (tot[pre(p)] || 0) + 1; });
  t.players.forEach(p => { const x = pre(p); seen[x] = (seen[x] || 0) + 1; p.first = tot[x] > 1 ? x + seen[x] : x; p.last = ''; p.jersey = ''; p.hand = 'R'; });
  t.roster = ROSTER14.map(([id, first, last, jersey, roles]) => ({ id: 'r-' + id, first, last, jersey, roles: (roles || []).slice(), backRow: false, passer: false, height: '', hand: 'R', notes: '', calls: [] }));
  t.sixMap = clone(SIX_MAP); t.liveName = t.liveName || ''; t.sampleV = 7;
}
const SAMPLE_IDS = { 1: 'SS', 2: 'OH', 3: 'MB', 4: 'RS', 5: 'OH2', 6: 'MB2', 7: 'LL', 8: 'DS', 9: 'OH3', 10: 'MB3', 11: 'S2', 12: 'S3' };
const SAMPLE_NAMES = {};
const SAMPLE_LINEUP = {"name":"Starting six","system":"5-1","order":["SS","OH","MB","RS","OH2","MB2"],"setters":["SS"],"swaps":[],"subs":[],"liberos":["LL"],"rotations":[{"r":1,"spots":{"SS":[0.913,0.69],"OH":[0.833,0.57],"MB":[0.267,0.358],"RS":[0.029,0.388],"OH2":[0.167,0.66],"LL":[0.5,0.68]},"calls":{"OH":"5","MB":"1","RS":"4"},"libero":{"id":"LL","replaces":"MB2"},"note":"","passers":["LL","OH2","OH"],"lines":{"OH":{"to":[0.95,0.05],"off":[0.211,0.056]},"MB":{"to":[0.548,0.057],"off":[0.032,0.261]},"RS":{"to":[0.04,0.05],"off":[-0.063,0.049]}}},{"r":2,"spots":{"OH":[0.833,0.66],"MB":[0.956,0.345],"RS":[0.832,0.095],"OH2":[0.167,0.57],"LL":[0.5,0.68],"SS":[0.711,0.229]},"calls":{"MB":"1","RS":"5","OH2":"4"},"libero":{"id":"LL","replaces":"MB2"},"note":"","passers":["LL","OH","OH2"],"lines":{"MB":{"to":[0.64,0.05],"off":[-0.41,0.304]},"RS":{"to":[0.95,0.05],"off":[0.229,0.416]},"OH2":{"to":[0.04,0.05],"off":[-0.287,0.032]}}},{"r":3,"spots":{"LL":[0.839,0.76],"RS":[0.956,0.306],"OH2":[0.203,0.698],"MB2":[0.098,0.115],"SS":[0.283,0.234],"OH":[0.559,0.772]},"calls":{"RS":"5","OH2":"4","MB2":"1"},"libero":{"id":"LL","replaces":"MB"},"note":"","passers":["LL","OH","OH2"],"lines":{"RS":{"to":[0.95,0.05],"off":[0,-0.02]},"OH2":{"to":[0.04,0.05],"off":[-0.221,0.14]},"MB2":{"to":[0.508,0.078],"off":[0.045,0.589]}}},{"r":4,"spots":{"RS":[0.93,0.874],"OH2":[0.24,0.632],"MB2":[0.165,0.275],"SS":[0.081,0.088],"OH":[0.529,0.715],"LL":[0.809,0.686]},"calls":{"OH2":"4","MB2":"1"},"libero":{"id":"LL","replaces":"MB"},"note":"","passers":["LL","OH","OH2"],"lines":{"OH2":{"to":[0.024,0.047],"off":[-0.275,0.097]},"MB2":{"to":[0.523,0.087],"off":[0.099,0.435]}}},{"r":5,"spots":{"OH2":[0.833,0.66],"MB2":[0.949,0.356],"SS":[0.59,0.08],"OH":[0.167,0.57],"LL":[0.5,0.68],"RS":[0.6,0.86]},"calls":{"MB2":"1","OH":"4"},"libero":{"id":"LL","replaces":"MB"},"note":"","passers":["LL","OH2","OH"],"lines":{"MB2":{"to":[0.684,0.081],"off":[0.154,-0.015]},"OH":{"to":[0.04,0.05],"off":[-0.149,0.077]}}},{"r":6,"spots":{"LL":[0.813,0.682],"SS":[0.676,0.088],"OH":[0.237,0.622],"MB":[0.15,0.101],"RS":[0.067,0.86],"OH2":[0.52,0.722]},"calls":{"OH":"4","MB":"1"},"libero":{"id":"LL","replaces":"MB2"},"note":"","passers":["LL","OH2","OH"],"lines":{"OH":{"to":[0.04,0.05],"off":[-0.274,0.069]},"MB":{"to":[0.6,0.05],"off":[0.013,0.475]}}}]};
const SAMPLE_LINEUP_62 = {"name":"Starting six","system":"6-2","order":["SS","OH","MB","RS","OH2","MB2"],"setters":["SS","S2"],"swaps":[],"subs":[{"in":"S2","out":"RS","rs":[4,5,6]}],"liberos":["LL"],"rotations":[{"r":1,"spots":{"SS":[0.913,0.69],"OH":[0.833,0.57],"MB":[0.267,0.358],"RS":[0.029,0.388],"OH2":[0.167,0.66],"LL":[0.5,0.68]},"calls":{"OH":"5","MB":"1","RS":"4"},"libero":{"id":"LL","replaces":"MB2"},"note":"","passers":["LL","OH2","OH"],"lines":{"OH":{"to":[0.95,0.05],"off":[0.211,0.056]},"MB":{"to":[0.548,0.057],"off":[0.032,0.261]},"RS":{"to":[0.04,0.05],"off":[-0.063,0.049]}}},{"r":2,"spots":{"OH":[0.833,0.66],"MB":[0.956,0.345],"RS":[0.832,0.095],"OH2":[0.167,0.57],"LL":[0.5,0.68],"SS":[0.711,0.229]},"calls":{"MB":"1","RS":"5","OH2":"4"},"libero":{"id":"LL","replaces":"MB2"},"note":"","passers":["LL","OH","OH2"],"lines":{"MB":{"to":[0.64,0.05],"off":[-0.41,0.304]},"RS":{"to":[0.95,0.05],"off":[0.229,0.416]},"OH2":{"to":[0.04,0.05],"off":[-0.287,0.032]}}},{"r":3,"spots":{"LL":[0.839,0.76],"RS":[0.956,0.306],"OH2":[0.203,0.698],"MB2":[0.098,0.115],"SS":[0.283,0.234],"OH":[0.559,0.772]},"calls":{"RS":"5","OH2":"4","MB2":"1"},"libero":{"id":"LL","replaces":"MB"},"note":"","passers":["LL","OH","OH2"],"lines":{"RS":{"to":[0.95,0.05],"off":[0,-0.02]},"OH2":{"to":[0.04,0.05],"off":[-0.221,0.14]},"MB2":{"to":[0.508,0.078],"off":[0.045,0.589]}}},{"r":4,"spots":{"S2":[0.913,0.69],"OH2":[0.833,0.57],"MB2":[0.267,0.358],"SS":[0.029,0.388],"OH":[0.167,0.66],"LL":[0.5,0.68]},"calls":{"OH2":"5","MB2":"1","SS":"4"},"libero":{"id":"LL","replaces":"MB"},"note":"","passers":["LL","OH","OH2"],"lines":{"OH2":{"to":[0.95,0.05],"off":[0.211,0.056]},"MB2":{"to":[0.548,0.057],"off":[0.032,0.261]},"SS":{"to":[0.04,0.05],"off":[-0.063,0.049]}}},{"r":5,"spots":{"OH2":[0.833,0.66],"MB2":[0.956,0.345],"SS":[0.832,0.095],"OH":[0.167,0.57],"LL":[0.5,0.68],"S2":[0.711,0.229]},"calls":{"MB2":"1","SS":"5","OH":"4"},"libero":{"id":"LL","replaces":"MB"},"note":"","passers":["LL","OH2","OH"],"lines":{"MB2":{"to":[0.64,0.05],"off":[-0.41,0.304]},"SS":{"to":[0.95,0.05],"off":[0.229,0.416]},"OH":{"to":[0.04,0.05],"off":[-0.287,0.032]}}},{"r":6,"spots":{"LL":[0.839,0.76],"SS":[0.956,0.306],"OH":[0.203,0.698],"MB":[0.098,0.115],"S2":[0.283,0.234],"OH2":[0.559,0.772]},"calls":{"SS":"5","OH":"4","MB":"1"},"libero":{"id":"LL","replaces":"MB2"},"note":"","passers":["LL","OH2","OH"],"lines":{"SS":{"to":[0.95,0.05],"off":[0,-0.02]},"OH":{"to":[0.04,0.05],"off":[-0.221,0.14]},"MB":{"to":[0.508,0.078],"off":[0.045,0.589]}}}]};
function buildSample62() { const L = clone(SAMPLE_LINEUP_62); L.id = 'l' + Date.now().toString(36) + 'b'; L.source = 'Sample lineup'; L.sort = Date.now() + 1; return L; }
function buildSampleLineup(team) {
  const L = clone(SAMPLE_LINEUP); L.id = 'l' + Date.now().toString(36); L.source = 'Sample lineup'; L.sort = Date.now(); return L;
}

/* new lineups reuse the sample lineup's hand-tuned positions, passers and attack calls for every rotation where the setter is in the back row
   (zone 1 = the sample's rotation 1, zone 6 = rotation 2, zone 5 = rotation 3). That makes a 6-2 look like the 5-1 in those rotations. */
function applySampleTemplate(L, r, R) {
  const c = ENG.court(L, r); if (!c.setter) return;
  const sz = c.zoneOf[c.setter], tr = { 1: 1, 6: 2, 5: 3 }[sz]; if (!tr) return;
  const T = SAMPLE_LINEUP, tc = ENG.court(T, tr), tR = T.rotations[tr - 1];
  const spots = {}, calls = {}, passers = [];
  for (let z = 1; z <= 6; z++) {
    const id = c.zones[z], tid = tc.zones[z];
    if (!id || !tid || !tR.spots[tid]) return;
    spots[id] = tR.spots[tid].slice();
    const code = tR.calls[tid], g = code && S.team.glossary.find(x => x.code === code);
    if (g && isF(z) && id !== c.setter && !ENG.cantRun(P(id), g)) calls[id] = code;
    if ((tR.passers || []).includes(tid)) passers.push(id);
  }
  if (ENG.overlap(c, spots, nm).some(o => !o.tight)) return;       // never swap in an illegal formation
  R.spots = spots; R.calls = calls; if (passers.length >= 2) R.passers = passers;
}

function sampleToV5(t) {
  const ren = { RS2: 'S2', OH4: 'S3' };
  t.players.forEach(p => { if (ren[p.id]) p.id = ren[p.id]; if (SAMPLE_NAMES[p.id]) { p.first = SAMPLE_NAMES[p.id]; p.last = ''; }
    if (p.id === 'S2' || p.id === 'S3') { p.roles = ['S']; p.backRow = false; p.passer = false; } p.hand = 'R'; });
  if (t.name === 'Sample Team') t.name = 'Team';
  (DB.lineups[t.id] || []).forEach(L => {
    if (L.system !== '6-2' || !(L.setters || []).includes('RS') || !t.players.some(p => p.id === 'S2')) return;
    L.setters = L.setters.map(x => x === 'RS' ? 'S2' : x);
    L.subs = (L.subs || []).concat([{ in: 'S2', out: 'RS', rs: [4, 5, 6] }]);
    L.rotations.forEach(R => { if (!R || R.r < 4) return;
      ['spots', 'calls'].forEach(k => { if (R[k] && R[k].RS !== undefined) { R[k].S2 = R[k].RS; delete R[k].RS; } });
      if (R.lines && R.lines.RS) { R.lines.S2 = R.lines.RS; delete R.lines.RS; }
      R.passers = (R.passers || []).map(x => x === 'RS' ? 'S2' : x); });
  });
  t.sampleV = 5;
}
function seedSample() {
  try {
    const { players } = parseRoster(SAMPLE_ROSTER);
    const roles = { SS: ['S'], OH: ['OH'], MB: ['M'], RS: ['OPP'], OH2: ['OH'], MB2: ['M'], LL: ['L'], DS: ['DS'], OH3: ['OH'], MB3: ['M'], S2: ['S'], S3: ['S'] };
    players.forEach(p => { p.id = SAMPLE_IDS[p.jersey] || p.id; p.first = SAMPLE_NAMES[p.id] || p.first; p.last = ''; if (roles[p.id]) p.roles = roles[p.id]; });
    const t = teamFrom({ name: 'Sample Team', season: SEASON_DEFAULT, source: 'sample', players }); t.sampleV = 6;
    relInit(t); subInit(t);
    t.setterX = 0.71; t.glossary.forEach(g => { if (g.rel && typeof g.off === 'number') g.x = +(0.71 + g.off).toFixed(2); });
    DB.teams[t.id] = t; DB.lineups[t.id] = [buildSampleLineup(t), buildSample62()]; toRosterV7(t); DB.seeded = true; writeStore();
  } catch (e) { DB.seeded = true; }
}

/* ---------- home ---------- */
function homeView() {
  const mine = Object.values(DB.teams).sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
  const myCards = mine.map(t => {
    const lu = (DB.lineups[t.id] || []).length, PL = t.roster || t.players, need = PL.filter(p => !p.roles.length).length;
    return `<div class="tcard" data-team="${esc(t.id)}" role="button" tabindex="0"><div class="tc-top"><b>${esc(t.name)}</b>${t.source === 'sample' ? '<span class="pill sunp">Sample</span>' : ''}</div>
      <span class="small">${(t.roster || t.players).length} players · ${lu} lineup${lu === 1 ? '' : 's'}${need ? ` · ${need} need positions` : ''}</span>
      <div class="tc-act">${S.confirmTeamDel === t.id ? `<span class="confirm">Delete this team and its lineups? <button class="btn danger" data-act="team-del-yes" data-id="${esc(t.id)}">Delete</button><button class="btn ghost" data-act="team-del-no">Keep</button></span>` : `<button class="btn primary" data-team="${esc(t.id)}">Open</button><button class="btn ghost" data-act="team-edit" data-id="${esc(t.id)}">Rename</button><button class="btn ghost danger" data-act="team-del" data-id="${esc(t.id)}">Delete</button>`}</div></div>`;
  }).join('');
  return `<div class="top home"><div>
    <div class="brand"><svg class="sunball" viewBox="0 0 26 26" aria-hidden="true"><defs><clipPath id="sb-c"><circle cx="13" cy="13" r="12"/></clipPath></defs><circle cx="13" cy="13" r="12" fill="var(--sun)"/><g clip-path="url(#sb-c)" fill="none" stroke="var(--sun-ink)" stroke-width="1.4" stroke-linecap="round" opacity=".6"><g id="sb-s"><path d="M13 13C9.6 10.4 8.6 5.7 10.6 0.5"/><path d="M6.8 2C4.6 6 4.9 11.5 7.6 15.6"/></g><use href="#sb-s" transform="rotate(120 13 13)"/><use href="#sb-s" transform="rotate(240 13 13)"/></g></svg><span class="eyebrow">Volleyball lineups</span></div>
    <h1>Courtside</h1>
    <div class="sub">Build serve-receive lineups and see every rotation. ${saveBadge()}</div></div>
    <div class="actions"><button class="btn primary" data-act="team-new">+ Add your team</button><details class="more"><summary class="btn">More</summary><div class="menu"><button data-act="backup">Backup &amp; restore</button></div></details></div></div>
    ${S.storeOk === false ? `<div class="alert" style="margin-bottom:14px"><span>This browser is blocking saved data, so nothing will be kept after you close the page. Use <b>Backup</b> to download your work.</span></div>` : ''}
    <section class="hsec"><h2>My teams</h2>
      ${mine.length ? `<div class="teamgrid">${myCards}</div>` : `<div class="empty" style="padding:28px 16px"><b>No teams yet</b>Add your roster to start building lineups.<div class="btnrow" style="justify-content:center;margin-top:12px"><button class="btn primary" data-act="team-new">+ Add your team</button><button class="btn" data-act="sample-add">Add the sample team</button></div></div>`}
      <p class="small" style="margin-top:10px">Saved in this browser. Use More &gt; Backup to move a team to another device.</p>
    </section>
    `;
}

/* ---------- add-team dialog ---------- */
function teamDlgView() {
  const D = S.tdlg; if (!D) return '';
  const fields = `<div class="sec"><div class="row2"><label class="lbl2">Team name<input type="text" id="tName" value="${esc(D.name)}" placeholder="e.g. 14 Black"></label><label class="lbl2">Season<input type="text" id="tSeason" value="${esc(D.season)}" placeholder="2026-27"></label></div></div>`;
  if (D.editId) return `<div class="sheet" data-act="tdlg-bg"><div class="panel" role="dialog" aria-modal="true" aria-label="Edit team" style="max-width:560px">
    <div class="phead"><h2>Edit team</h2><span class="grow"></span><button class="btn" data-act="tdlg-close">Cancel</button></div>
    ${fields}
    ${D.err ? `<p class="err-text">${esc(D.err)}</p>` : ''}
    <div class="btnrow" style="margin-top:14px;justify-content:flex-end"><button class="btn primary" data-act="tdlg-save">Save</button></div>
  </div></div>`;
  return `<div class="sheet" data-act="tdlg-bg"><div class="panel" role="dialog" aria-modal="true" aria-label="Add your team" style="max-width:860px">
    <div class="phead"><h2>Add your team</h2><span class="grow"></span><button class="btn" data-act="tdlg-close">Cancel</button></div>
    ${fields}
    <div class="sec"><h3>Roster</h3><p class="small" style="margin:-4px 0 8px">Paste from a spreadsheet or type one player per line: jersey, name, positions (S, OH, M, OPP, L, DS), then <b>lefty</b>, <b>back row</b> or <b>passer</b> if they apply. You can fix anything later on the Roster tab.</p>
      <textarea id="tRoster" rows="8" placeholder="${esc(PASTE_EXAMPLE)}">${esc(D.text)}</textarea>
      <div id="tPreview">${rosterPreview(D.text)}</div></div>
    ${D.err ? `<p class="err-text">${esc(D.err)}</p>` : ''}
    <div class="btnrow" style="margin-top:14px;justify-content:flex-end"><button class="btn primary" data-act="tdlg-create">Create team</button></div>
  </div></div>`;
}
function rosterPreview(text) {
  const { players, skipped } = parseRoster(text);
  if (!players.length) return `<p class="small" style="margin-top:8px">${text.trim() ? 'No players found yet. Put each player on their own line.' : 'You can also start with no players and add them one at a time.'}</p>`;
  return `<div class="tscroll" style="margin-top:10px"><table class="gl prev"><thead><tr><th>#</th><th>Name</th><th>Positions</th><th>Hand</th><th>Back row</th><th>Passer</th></tr></thead><tbody>
    ${players.map(p => `<tr><td>${esc(p.jersey)}</td><td><b>${esc(p.first)}</b> ${esc(p.last)}</td><td>${p.roles.length ? esc(p.roles.join('/')) : '<span class="small" style="color:var(--warn)">add later</span>'}</td><td>${p.hand === 'L' ? 'Left' : 'Right'}</td><td>${p.backRow ? '✓' : ''}</td><td>${p.passer ? '✓' : ''}</td></tr>`).join('')}
  </tbody></table></div><p class="small" style="margin-top:6px">${players.length} player${players.length > 1 ? 's' : ''} found${skipped.length ? ` · ${skipped.length} line${skipped.length > 1 ? 's' : ''} skipped` : ''}. A plain “L” means libero; write “lefty” for a left-handed hitter.</p>`;
}
function readTdlg() { const D = S.tdlg; if (!D) return; const g = id => { const el = document.getElementById(id); return el ? el.value : undefined; }; ['name:tName', 'season:tSeason', 'text:tRoster'].forEach(k => { const [f, id] = k.split(':'); const v = g(id); if (v !== undefined) D[f] = v; }); }

/* ---------- backup ---------- */
function backupView() {
  const B = S.bk; if (!B) return '';
  const n = Object.keys(DB.teams).length;
  return `<div class="sheet" data-act="bk-bg"><div class="panel" role="dialog" aria-modal="true" aria-label="Backup" style="max-width:640px">
    <div class="phead"><h2>Backup and restore</h2><span class="grow"></span><button class="btn" data-act="bk-close">Close</button></div>
    <p class="small" style="margin:-4px 0 12px">Your teams live in this browser only. A backup file keeps them safe, moves them to another device, or shares a team with another coach. ${DB.savedAt ? `Last saved ${esc(new Date(DB.savedAt).toLocaleString())}.` : ''}</p>
    <div class="sec"><h3>Download</h3><div class="btnrow"><button class="btn primary" data-act="bk-all" ${n ? '' : 'disabled'}>${dlIcon()} All my teams (${n})</button>${S.team && !S.home ? `<button class="btn" data-act="bk-one">${dlIcon()} Just ${esc(S.team.name)}</button>` : ''}</div></div>
    <div class="sec"><h3>Restore</h3><p class="small" style="margin:0 0 8px">Pick a backup file. Teams in it are added; a team you already have is replaced by the file’s copy.</p><input type="file" id="bkFile" accept=".json,application/json">
      <details class="pastebox" style="margin-top:10px"><summary>Or paste backup text</summary><textarea id="bkPaste" rows="5" placeholder='{"app":"courtside", ...}'></textarea><button class="btn" style="margin-top:6px" data-act="bk-paste">Restore from text</button></details></div>
    ${B.msg ? `<div class="alert ${B.ok ? 'ok' : ''}" style="margin-top:10px"><span>${esc(B.msg)}</span></div>` : ''}
    ${B.text ? `<div class="sec"><p class="small" style="margin:0 0 6px">Downloads are blocked here. Copy this text, paste it into a file, and save it as <b>${esc(B.file)}</b>.</p><textarea rows="6" readonly id="bkText">${esc(B.text)}</textarea><div class="btnrow" style="margin-top:8px"><button class="btn" data-act="bk-copy">Copy backup</button></div></div>` : ''}
  </div></div>`;
}
function backupData(ids) {
  const teams = {}, lineups = {};
  ids.forEach(id => { teams[id] = DB.teams[id]; lineups[id] = DB.lineups[id] || []; });
  return JSON.stringify({ app: 'courtside', v: 1, exportedAt: new Date().toISOString(), teams, lineups });
}
async function saveBackup(ids, label) {
  const data = backupData(ids), file = `${label.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'lineups'}-${new Date().toISOString().slice(0, 10)}.json`;
  S.bk = { ...S.bk, msg: '', text: '' };
  if (false) {
    try { await S.downloads.save({ filename: file, data }); S.bk.msg = `Saved ${file}.`; S.bk.ok = true; render(); return; }
    catch (e) { if (e && e.code === 'declined') { S.bk.msg = 'Download cancelled.'; S.bk.ok = false; render(); return; } }
  }
  try {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' })); a.download = file; document.body.appendChild(a); a.click(); a.remove();
    S.bk.msg = `If nothing downloaded, use the copy box below.`; S.bk.ok = true;
  } catch (e) { }
  S.bk.text = data; S.bk.file = file; render();
}
function restoreBackup(text) {
  let d; try { d = JSON.parse(text); } catch (e) { S.bk.msg = 'That file isn’t a lineup backup.'; S.bk.ok = false; render(); return; }
  if (!d || !['courtside', 'sunshine-lineup-builder'].includes(d.app) || !d.teams) { S.bk.msg = 'That file isn’t a lineup backup.'; S.bk.ok = false; render(); return; }
  let add = 0, upd = 0;
  Object.entries(d.teams).forEach(([id, t]) => {
    if (!t || !Array.isArray(t.players)) return;
    t.id = id; t.glossary = t.glossary || clone(GLOSSARY); if (t.source === 'sample') { t.source = 'backup'; delete t.sampleV; }
    if (DB.teams[id]) upd++; else add++;
    DB.teams[id] = t; DB.lineups[id] = (d.lineups && d.lineups[id]) || [];
  });
  if (S.team && DB.teams[S.team.id] && DB.teams[S.team.id] !== S.team) openTeam(S.team.id, true);
  writeStore();
  S.bk.msg = `Restored ${add + upd} team${add + upd === 1 ? '' : 's'}${upd ? ` (${upd} replaced)` : ''}.`; S.bk.ok = true; render();
}

/* ---------- home events ---------- */
function homeClick(t, e) {
  const a = t.dataset.act;
  if (t.dataset.team && !a) { openTeam(t.dataset.team); render(); window.scrollTo(0, 0); return true; }
  if (a === 'home') { S.home = true; S.ed = null; S.dlg = null; S.team = null; S.lineups = []; S.cur = null; DB.cur = null; writeStore(); render(); window.scrollTo(0, 0); return true; }
  if (a === 'team-new') { S.tdlg = { name: '', season: SEASON_DEFAULT, text: '', err: '' }; render(); setTimeout(() => { const el = document.getElementById('tName'); if (el) el.focus(); }, 30); return true; }
  if (a === 'team-edit') { const tm = DB.teams[t.dataset.id]; if (!tm) return true; t.closest('details')?.removeAttribute('open'); S.tdlg = { editId: tm.id, name: tm.name, season: tm.season || '', err: '' }; render(); setTimeout(() => { const el = document.getElementById('tName'); if (el) { el.focus(); el.select(); } }, 30); return true; }
  if (a === 'tdlg-save') {
    readTdlg(); const D = S.tdlg, tm = DB.teams[D.editId];
    if (!D.name.trim()) { D.err = 'Give the team a name.'; render(); return true; }
    if (tm) { tm.name = D.name.trim(); tm.season = D.season.trim(); tm.updatedAt = new Date().toISOString(); writeStore(); }
    S.tdlg = null; toast('Team updated'); render(); return true;
  }
  if (a === 'tdlg-close') { S.tdlg = null; render(); return true; }
  if (a === 'tdlg-bg') { if (e.target === t) { readTdlg(); S.tdlg = null; render(); } return true; }
  if (a === 'tdlg-create') {
    readTdlg(); const D = S.tdlg;
    if (!D.name.trim()) { D.err = 'Give the team a name.'; render(); return true; }
    const { players } = parseRoster(D.text);
    const t = teamFrom({ name: D.name.trim(), season: D.season.trim(), players: assignIds(players) });
    S.tdlg = null; addTeam(t, []); toast(players.length ? `${t.name} created with ${players.length} players` : `${t.name} created`); render(); return true;
  }
  if (a === 'sample-add') { DB.seeded = false; seedSample(); render(); return true; }
  if (a === 'team-del') { S.confirmTeamDel = t.dataset.id; render(); return true; }
  if (a === 'team-del-no') { S.confirmTeamDel = null; render(); return true; }
  if (a === 'team-del-yes') { const id = t.dataset.id; delete DB.teams[id]; delete DB.lineups[id]; if (DB.cur === id) DB.cur = null; S.confirmTeamDel = null; writeStore(); toast('Team deleted'); render(); return true; }
  if (a === 'backup') { S.bk = { msg: '', text: '' }; render(); return true; }
  if (a === 'bk-close') { S.bk = null; render(); return true; }
  if (a === 'bk-bg') { if (e.target === t) { S.bk = null; render(); } return true; }
  if (a === 'bk-all') { saveBackup(Object.keys(DB.teams), 'courtside-backup'); return true; }
  if (a === 'bk-one') { if (S.team) { persist(); saveBackup([S.team.id], S.team.name); } return true; }
  if (a === 'bk-paste') { const el = document.getElementById('bkPaste'); restoreBackup(el ? el.value.trim() : ''); return true; }
  if (a === 'bk-copy') { copyText(S.bk.text, 'Backup copied'); return true; }
  if (a === 'rm-player') {
    const id = t.closest('[data-pid]').dataset.pid;
    if (S.team.roster) S.team.roster = S.team.roster.filter(p => p.id !== id); else S.team.players = S.team.players.filter(p => p.id !== id); saveTeam(); toast('Player removed'); render(); return true;
  }
  if (a === 'paste-more') {
    const el = document.getElementById('pasteMore'); const { players } = parseRoster(el ? el.value : '');
    if (!players.length) { toast('No players found. One player per line.'); return true; }
    assignIds(players, pool().map(p => p.id)); pool().push(...players); saveTeam(); toast(`Added ${players.length} player${players.length > 1 ? 's' : ''}`); render(); return true;
  }
  return false;
}
document.addEventListener('input', e => {
  if (e.target.id === 'tRoster') { const p = document.getElementById('tPreview'); if (p) p.innerHTML = rosterPreview(e.target.value); if (S.tdlg) S.tdlg.text = e.target.value; }
});
document.addEventListener('change', e => {
  if (e.target.id === 'bkFile' && e.target.files && e.target.files[0]) {
    const r = new FileReader(); r.onload = () => restoreBackup(String(r.result)); r.onerror = () => { S.bk.msg = 'Couldn’t read that file.'; S.bk.ok = false; render(); }; r.readAsText(e.target.files[0]);
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && (S.tdlg || S.bk)) { S.tdlg = null; S.bk = null; render(); }
  if (e.key === 'Enter' && S.tdlg && S.tdlg.editId && (e.target.id === 'tName' || e.target.id === 'tSeason')) { e.preventDefault(); document.querySelector('[data-act="tdlg-save"]')?.click(); }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.tcard')) { e.preventDefault(); openTeam(e.target.dataset.team); render(); }
});

/* ---------- boot ---------- */
function boot() {
  loadStore();
  if (!Object.keys(DB.teams).length && !DB.seeded) seedSample();       // first visit: a ready-made team so nobody starts from a blank page
  if (DB.cur && DB.teams[DB.cur]) openTeam(DB.cur, true); else S.home = true;
  render();
}
boot();

})();
