import { createStorage } from './storage.js';
import { createBoard } from './board.js';
import { createRotations } from './rotations.js';
import { createLiveSet } from './live-set.js';
import { createRoster } from './roster.js';
import { createSetLibrary } from './set-library.js';
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
const S = { team: null, lineups: [], cur: null, view: 'board', bd: { r: 1 }, ed: null, sug: null, dlg: null,
  confirmDel: false, fixLog: null, canWrite: true, live: null };
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

let DB = { v: 1, teams: {}, lineups: {}, cur: null };
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
/* ---------- Board undo: per lineup + rotation, in memory for this session ---------- */
const BD_HIST_MAX = 100;
S.bdHist = {};
const bdHist = (lid, r) => S.bdHist[lid + ':' + r] || (S.bdHist[lid + ':' + r] = []);
const rotSnap = rot => ({ spots: clone(rot.spots || {}), lines: rot.lines ? clone(rot.lines) : null });
function bdPush(L, r, snap) { const h = bdHist(L.id, r); h.push(snap || rotSnap(rotOf(L, r))); if (h.length > BD_HIST_MAX) h.shift(); }
const undoBtn = n => `<button class="btn ghost" data-act="bd-undo" ${n ? '' : 'disabled'} title="Undo (Ctrl/Cmd+Z)">↶ Undo</button>`;
function bdUndo() {
  const L = curL(); if (!L || S.view !== 'board' || !S.bd || S.bd.base) return;
  const prev = boardSnap();
  if (S.bd.def) { const h = S.bd.defHist || []; if (!h.length) return; S.bd.defOv = h.pop(); }
  else {
    const h = bdHist(L.id, S.bd.r); if (!h.length) return;
    const snap = h.pop(), rot = rotOf(L, S.bd.r);
    rot.spots = snap.spots; if (snap.lines) rot.lines = snap.lines; else delete rot.lines;
    saveLineup(L);
  }
  S.bd.srConfirm = null; S.bd.anim = 'rot'; S.bd.prev = prev; render();
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
        <div class="btnrow">${S.canWrite ? `${iss.some(i => i.level !== 'info') ? `<button class="btn primary" data-act="autofix" data-r="${r}">Fix this rotation</button>` : ''}<button class="btn primary" data-act="lineup">Line up for these sets</button><button class="btn" data-act="rebuild">Rebuild formation</button>` : ''}</div>
        ${fixPanel(L, r)}</div>
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
  S.cur = L.id; S.dlg = null; S.view = 'board'; S.bd = { r: 1 }; S.bdHist = {}; saveLineup(L); toast(D.mode === 'edit' ? 'Lineup rebuilt' : 'Lineup built');
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

/* ---------- render ---------- */
function privacyFooter() {
  return '<footer class="privacy-note">Privacy: Team, player, lineup, and live set data are saved in this browser on this device. Courtside has no account or server for your data. Download a backup to keep or move it.</footer>';
}
function render() {
  const app = $('#app');
  if (S.home || !S.team) { app.innerHTML = homeView() + privacyFooter(); $('#overlay').innerHTML = teamDlgView() + backupView(); document.body.style.overflow = S.tdlg || S.bk ? 'hidden' : ''; return; }
  if (S.cur && !curL()) S.cur = null;
  if (!S.cur && S.lineups[0]) S.cur = S.lineups[0].id;
  const scrollY = window.scrollY;
  teamKey = JSON.stringify([S.team.glossary, S.team.players.map(p => [p.id, p.roles, p.hand, p.backRow, p.passer, p.calls, p.cant])]);
  const body = { board: boardView, rot: rotView, serve: serveView, live: liveView, roster: rosterView, calls: callsView }[S.view]();
  app.innerHTML = header() + tabs() + body + privacyFooter();
  const oldSheet = document.querySelector('#overlay .sheet'), sheetY = oldSheet ? oldSheet.scrollTop : 0, sameSheet = oldSheet && !!S.ed === !!oldSheet.querySelector('[aria-label^="Rotation"]');
  $('#overlay').innerHTML = editor() + dlgView() + backupView() + teamDlgView();
  const newSheet = document.querySelector('#overlay .sheet');
  if (newSheet && sameSheet && (S.ed ? S.ed.keepScroll !== false : !!S.dlg)) newSheet.scrollTop = sheetY;
  document.body.style.overflow = S.ed || S.dlg || S.bk || S.tdlg ? 'hidden' : '';
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
  if (!d.moved) (S.bd.defHist = S.bd.defHist || []).push(clone(S.bd.defOv || {}));
  d.moved = true;
  const [px, py] = svgXY(d.svg, e), x = Math.min(.98, Math.max(.02, px)), y = Math.min(.99, Math.max(.02, py));
  S.bd.defOv = S.bd.defOv || {}; S.bd.defOv[d.id] = [x, y];
  d.g.style.transition = 'none'; d.g.style.transform = `translate(${X(x).toFixed(1)}px, ${Y(y).toFixed(1)}px)`;
});
document.addEventListener('pointerup', () => {
  const d = ddrag; if (!d) return; ddrag = null;
  d.g.classList.remove('dragging');
  if (d.moved) render();     // show Undo / Reset
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

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act],[data-lu],[data-view],[data-open],[data-go],[data-role],[data-grole],[data-sys],[data-opt],[data-libf],[data-set],[data-cant],[data-team],[data-club],[data-sx]');
  if (!t) return;
  const L = curL();
  if (homeClick(t, e)) return;
  if (t.dataset.sx) { const n = setTarget(+t.dataset.sx); const b1 = G('Back 1'); toast(`Setter target: ${sxLabel(SXT())}.${n ? ` ${n} sets that key off the setter moved with her${b1 && b1.rel ? ` (Back 1 is now ${(b1.x * 9).toFixed(1)} m from the left)` : ''}.` : ''}`); render(); return; }
  if (t.dataset.lu) { S.cur = t.dataset.lu; S.confirmDel = false; S.fixLog = null; render(); return; }
  if (t.dataset.view) { S.view = t.dataset.view; render(); return; }
  if (t.dataset.act === 'bd-go') { const r = +t.dataset.r, prev = boardSnap(); S.bd = { ...(S.bd || {}), r, anim: S.bd && S.bd.r !== r ? 'rot' : null, prev, srConfirm: null, defOv: S.bd && S.bd.r !== r ? {} : S.bd && S.bd.defOv, defHist: S.bd && S.bd.r !== r ? [] : S.bd && S.bd.defHist }; render(); return; }
  if (t.dataset.act === 'bd-lib-save' && L) { S.bdHist = {}; const N = withLibMode(L, S.bd.lib); L.rotations = N.rotations; L.liberos = N.liberos; saveLineup(L); toast(S.bd.lib === 'none' ? 'Saved: no libero' : `Saved: libero for ${S.bd.lib === 'oh' ? 'OH' : 'MB'} in every rotation`); render(); return; }
  if (t.dataset.act === 'bd-mode') { const m = t.dataset.m, cur = bdMode(); if (m !== cur) { S.bd.base = m === 'base'; S.bd.def = m === 'def'; S.bd.defOv = {}; S.bd.defHist = []; S.bd.srConfirm = null; S.bd.anim = 'from:' + cur; } render(); return; }
  if (t.dataset.act === 'bd-sr-reset') { S.bd.srConfirm = S.bd.r; render(); return; }
  if (t.dataset.act === 'bd-sr-reset-no') { S.bd.srConfirm = null; render(); return; }
  if (t.dataset.act === 'bd-sr-reset-yes' && L) {      // rebuild this rotation's serve-receive spots from its set calls and passers
    const r = S.bd.r, rot = rotOf(L, r), prev = boardSnap();
    bdPush(L, r); rot.spots = defaultSpots(L, r, rot);
    S.bd.srConfirm = null; S.bd.anim = 'rot'; S.bd.prev = prev; saveLineup(L); toast(`Rotation ${r} reset`); render(); return;
  }
  if (t.dataset.act === 'bd-def-reset') { const prev = boardSnap(); (S.bd.defHist = S.bd.defHist || []).push(clone(S.bd.defOv || {})); S.bd.defOv = {}; S.bd.anim = 'rot'; S.bd.prev = prev; render(); return; }
  if (t.dataset.act === 'bd-undo') { bdUndo(); return; }
  if (t.dataset.act === 'bd-reset' && L) { bdPush(L, S.bd.r); delete rotOf(L, S.bd.r).lines; saveLineup(L); render(); return; }
  if (t.dataset.act === 'bd-clear' && L) { bdPush(L, S.bd.r); rotOf(L, S.bd.r).lines = {}; saveLineup(L); render(); return; }
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
  if (a === 'suggest') { const r = S.ed.r; const rec = ENG.recommend(L, r, S.team, rotOf(L, r)); S.sug = { lu: L.id, r, ...rec }; render(); return; }
  if (a === 'apply-sug') { const rot = rotOf(L, S.ed.r); rot.calls = { ...S.sug.calls }; S.sug = null; saveLineup(L, [S.ed.r]); render(); return; }
  if (a === 'dismiss-sug') { S.sug = null; render(); return; }
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
    render(); return; }
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
  const snap = rotSnap(rot);
  if (h) { linesMat(L, r); }
  dragging = { snap, g: h || g, svg, id: (h || g).dataset.id, hd: h ? h.dataset.lh : null, rot, L, r, moved: false, x0: e.clientX, y0: e.clientY, board: svg.classList.contains('board-svg') };
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
  if (d.moved || (d.board && !d.hd)) bdPush(cur, d.r, d.snap);      // a drag, or a tap that toggles a line
  if (d.moved) {
    if (cur !== d.L) { const cr = rotOf(cur, d.r); cr.spots[d.id] = d.rot.spots[d.id]; if (d.rot.lines) cr.lines = d.rot.lines; }
    saveLineup(cur); render();
  } else if (d.board && !d.hd) { toggleLine(cur, d.r, d.id); render(); }
  else d.g.classList.remove('dragging');
});


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
function teamFrom({ name, season, players, source, glossary }) {
  return { id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name, season: season || '', source: source || 'custom',
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
const SAMPLE_LINEUP = {"name":"Starting six","system":"5-1","order":["SS","OH","MB","RS","OH2","MB2"],"setters":["SS"],"swaps":[],"subs":[],"liberos":["LL"],"rotations":[{"r":1,"spots":{"SS":[0.913,0.69],"OH":[0.833,0.57],"MB":[0.267,0.358],"RS":[0.029,0.388],"OH2":[0.167,0.66],"LL":[0.5,0.68]},"calls":{"OH":"5","MB":"1","RS":"4"},"libero":{"id":"LL","replaces":"MB2"},"note":"","passers":["LL","OH2","OH"],"lines":{"OH":{"to":[0.95,0.05],"off":[0.211,0.056]},"MB":{"to":[0.548,0.057],"off":[0.032,0.261]},"RS":{"to":[0.04,0.05],"off":[-0.063,0.049]}}},{"r":2,"spots":{"OH":[0.833,0.66],"MB":[0.956,0.345],"RS":[0.832,0.095],"OH2":[0.167,0.57],"LL":[0.5,0.68],"SS":[0.711,0.229]},"calls":{"MB":"1","RS":"5","OH2":"4"},"libero":{"id":"LL","replaces":"MB2"},"note":"","passers":["LL","OH","OH2"],"lines":{"MB":{"to":[0.64,0.05],"off":[-0.41,0.304]},"RS":{"to":[0.95,0.05],"off":[0.229,0.416]},"OH2":{"to":[0.04,0.05],"off":[-0.287,0.032]}}},{"r":3,"spots":{"LL":[0.839,0.76],"RS":[0.956,0.306],"OH2":[0.203,0.698],"MB2":[0.098,0.115],"SS":[0.283,0.234],"OH":[0.559,0.772]},"calls":{"RS":"5","OH2":"4","MB2":"1"},"libero":{"id":"LL","replaces":"MB"},"note":"","passers":["LL","OH","OH2"],"lines":{"RS":{"to":[0.95,0.05],"off":[0,-0.02]},"OH2":{"to":[0.04,0.05],"off":[-0.221,0.14]},"MB2":{"to":[0.508,0.078],"off":[0.045,0.589]}}},{"r":4,"spots":{"RS":[0.93,0.874],"OH2":[0.24,0.632],"MB2":[0.165,0.275],"SS":[0.081,0.088],"OH":[0.529,0.715],"LL":[0.809,0.686]},"calls":{"OH2":"4","MB2":"1"},"libero":{"id":"LL","replaces":"MB"},"note":"","passers":["LL","OH","OH2"],"lines":{"OH2":{"to":[0.024,0.047],"off":[-0.275,0.097]},"MB2":{"to":[0.523,0.087],"off":[0.099,0.435]}}},{"r":5,"spots":{"OH2":[0.833,0.66],"MB2":[0.949,0.356],"SS":[0.59,0.08],"OH":[0.167,0.57],"LL":[0.5,0.68],"RS":[0.6,0.86]},"calls":{"MB2":"1","OH":"4"},"libero":{"id":"LL","replaces":"MB"},"note":"","passers":["LL","OH2","OH"],"lines":{"MB2":{"to":[0.684,0.081],"off":[0.154,-0.015]},"OH":{"to":[0.04,0.05],"off":[-0.149,0.077]}}},{"r":6,"spots":{"LL":[0.813,0.682],"SS":[0.676,0.088],"OH":[0.237,0.622],"MB":[0.15,0.101],"RS":[0.067,0.86],"OH2":[0.52,0.722]},"calls":{"OH":"4","MB":"1"},"libero":{"id":"LL","replaces":"MB2"},"note":"","passers":["LL","OH2","OH"],"lines":{"OH":{"to":[0.04,0.05],"off":[-0.274,0.069]},"MB":{"to":[0.6,0.05],"off":[0.013,0.475]}}}]};
const SAMPLE_LINEUP_62 = {"name":"Starting six","system":"6-2","order":["SS","OH","MB","RS","OH2","MB2"],"setters":["SS","S2"],"swaps":[],"subs":[{"in":"S2","out":"RS","rs":[4,5,6]}],"liberos":["LL"],"rotations":[{"r":1,"spots":{"SS":[0.913,0.69],"OH":[0.833,0.57],"MB":[0.267,0.358],"RS":[0.029,0.388],"OH2":[0.167,0.66],"LL":[0.5,0.68]},"calls":{"OH":"5","MB":"1","RS":"4"},"libero":{"id":"LL","replaces":"MB2"},"note":"","passers":["LL","OH2","OH"],"lines":{"OH":{"to":[0.95,0.05],"off":[0.211,0.056]},"MB":{"to":[0.548,0.057],"off":[0.032,0.261]},"RS":{"to":[0.04,0.05],"off":[-0.063,0.049]}}},{"r":2,"spots":{"OH":[0.833,0.66],"MB":[0.956,0.345],"RS":[0.832,0.095],"OH2":[0.167,0.57],"LL":[0.5,0.68],"SS":[0.711,0.229]},"calls":{"MB":"1","RS":"5","OH2":"4"},"libero":{"id":"LL","replaces":"MB2"},"note":"","passers":["LL","OH","OH2"],"lines":{"MB":{"to":[0.64,0.05],"off":[-0.41,0.304]},"RS":{"to":[0.95,0.05],"off":[0.229,0.416]},"OH2":{"to":[0.04,0.05],"off":[-0.287,0.032]}}},{"r":3,"spots":{"LL":[0.839,0.76],"RS":[0.956,0.306],"OH2":[0.203,0.698],"MB2":[0.098,0.115],"SS":[0.283,0.234],"OH":[0.559,0.772]},"calls":{"RS":"5","OH2":"4","MB2":"1"},"libero":{"id":"LL","replaces":"MB"},"note":"","passers":["LL","OH","OH2"],"lines":{"RS":{"to":[0.95,0.05],"off":[0,-0.02]},"OH2":{"to":[0.04,0.05],"off":[-0.221,0.14]},"MB2":{"to":[0.508,0.078],"off":[0.045,0.589]}}},{"r":4,"spots":{"S2":[0.913,0.69],"OH2":[0.833,0.57],"MB2":[0.267,0.358],"SS":[0.029,0.388],"OH":[0.167,0.66],"LL":[0.5,0.68]},"calls":{"OH2":"5","MB2":"1","SS":"4"},"libero":{"id":"LL","replaces":"MB"},"note":"","passers":["LL","OH","OH2"],"lines":{"OH2":{"to":[0.95,0.05],"off":[0.211,0.056]},"MB2":{"to":[0.548,0.057],"off":[0.032,0.261]},"SS":{"to":[0.04,0.05],"off":[-0.063,0.049]}}},{"r":5,"spots":{"OH2":[0.833,0.66],"MB2":[0.956,0.345],"SS":[0.832,0.095],"OH":[0.167,0.57],"LL":[0.5,0.68],"S2":[0.711,0.229]},"calls":{"MB2":"1","SS":"5","OH":"4"},"libero":{"id":"LL","replaces":"MB"},"note":"","passers":["LL","OH2","OH"],"lines":{"MB2":{"to":[0.64,0.05],"off":[-0.41,0.304]},"SS":{"to":[0.95,0.05],"off":[0.229,0.416]},"OH":{"to":[0.04,0.05],"off":[-0.287,0.032]}}},{"r":6,"spots":{"LL":[0.839,0.76],"SS":[0.956,0.306],"OH":[0.203,0.698],"MB":[0.098,0.115],"S2":[0.283,0.234],"OH2":[0.559,0.772]},"calls":{"SS":"5","OH":"4","MB":"1"},"libero":{"id":"LL","replaces":"MB2"},"note":"","passers":["LL","OH2","OH"],"lines":{"SS":{"to":[0.95,0.05],"off":[0,-0.02]},"OH":{"to":[0.04,0.05],"off":[-0.221,0.14]},"MB":{"to":[0.508,0.078],"off":[0.045,0.589]}}}]};
function buildSample62() { const L = clone(SAMPLE_LINEUP_62); L.id = 'l' + Date.now().toString(36) + 'b'; L.source = 'Sample lineup'; L.sort = Date.now() + 1; return L; }
function buildSampleLineup(team) {
  const L = clone(SAMPLE_LINEUP); L.id = 'l' + Date.now().toString(36); L.source = 'Sample lineup'; L.sort = Date.now(); return L;
}

/* new lineups reuse the sample lineup's hand-tuned positions, passers and attack calls for every rotation where the setter is in the back row
   (zone 1 = the sample's rotation 1, zone 6 = rotation 2, zone 5 = rotation 3). That makes a 6-2 look like the 5-1 in those rotations. */
/* default serve-receive spots for a rotation, as building the lineup would place them: the formation for its set calls,
   or the hand-tuned template when it fits and its calls match this rotation's calls (so set calls are never changed) */
function defaultSpots(L, r, rot) {
  const spots = ENG.formationFor(L, r, S.team, rot.calls, ENG.passersOf(L, r, S.team, rot), rot);
  const T = { spots, calls: clone(rot.calls || {}), passers: rot.passers };
  applySampleTemplate(L, r, T);
  const key = o => JSON.stringify(Object.entries(o || {}).sort());
  return T.spots !== spots && key(T.calls) === key(rot.calls) ? T.spots : spots;
}
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

function seedSample() {
  try {
    const { players } = parseRoster(SAMPLE_ROSTER);
    const roles = { SS: ['S'], OH: ['OH'], MB: ['M'], RS: ['OPP'], OH2: ['OH'], MB2: ['M'], LL: ['L'], DS: ['DS'], OH3: ['OH'], MB3: ['M'], S2: ['S'], S3: ['S'] };
    players.forEach(p => { p.id = SAMPLE_IDS[p.jersey] || p.id; p.last = ''; if (roles[p.id]) p.roles = roles[p.id]; });
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
  if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z' && !e.target.closest('input,textarea,select,[contenteditable]') && S.view === 'board' && !S.ed && !S.dlg && !S.home) { e.preventDefault(); bdUndo(); return; }
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

let loadStore, writeStore, persist, saveLineup, saveTeam, saveBadge;
let withLibMode, boardView, legend;
let rotView, serveView;
let liveLoad, liveSave, liveNew, livePoint, liveSetRot, liveSubAnswer, liveManualSub, liveView;
let rosterView;
let UNREL_V2, applyTarget, relInit, subInit, setTarget, sxLabel, callsView;
const moduleContext = { DB, ENG, P, PASTE_EXAMPLE, ROLES, ROMAN, RT, S, SXT, TEMPO, analysis, bdHist, boardSnap, clone, comboLegend, courtSVG, curL, ensureSpots, esc, fixPanel, frontRowList, full, ghostsFor, hOf, isF, jer, lbl, lblBase, legend: (...args) => legend(...args), nm, pool, render, roleCls, roleOf, saveLineup: (...args) => saveLineup(...args), saveTeam: (...args) => saveTeam(...args), shortName, statusOf, tempoColor, titleOf, toast, tokP, undoBtn };
({ loadStore, writeStore, persist, saveLineup, saveTeam, saveBadge } = createStorage(moduleContext));
({ withLibMode, boardView, legend } = createBoard(moduleContext));
({ rotView, serveView } = createRotations(moduleContext));
({ liveLoad, liveSave, liveNew, livePoint, liveSetRot, liveSubAnswer, liveManualSub, liveView } = createLiveSet(moduleContext));
({ rosterView } = createRoster(moduleContext));
({ UNREL_V2, applyTarget, relInit, subInit, setTarget, sxLabel, callsView } = createSetLibrary(moduleContext));
boot();

})();
