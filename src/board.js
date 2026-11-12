export function createBoard(ctx) {
  const { P, S, bdHist, clone, courtSVG, curL, ensureSpots, esc, nm, undoBtn, ENG } = ctx;
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
    ${S.bd.def ? `<div class="btnrow" style="justify-content:center;margin-top:6px">${undoBtn((S.bd.defHist || []).length)}${S.bd.defOv && Object.keys(S.bd.defOv).length ? '<button class="btn ghost" data-act="bd-def-reset">Reset defense</button>' : ''}</div>` : `<div class="btnrow" style="justify-content:center;margin-top:6px">${!S.bd.base && !preview && S.canWrite ? undoBtn(bdHist(L.id, r).length) : ''}${!S.bd.base && !preview && S.canWrite ? (S.bd.srConfirm === r ? `<span class="confirm">Reset rotation ${r} to the default formation? <button class="btn danger" data-act="bd-sr-reset-yes">Reset</button><button class="btn ghost" data-act="bd-sr-reset-no">Keep</button></span>` : `<button class="btn ghost" data-act="bd-sr-reset">Reset positions</button>`) : ''}${rot.lines ? `<button class="btn ghost" data-act="bd-reset">Reset lines to set calls</button>` : ''}<button class="btn ghost" data-act="bd-clear">Clear lines</button></div>`}
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


  return { withLibMode, boardView, legend };
}
