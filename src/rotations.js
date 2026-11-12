export function createRotations(ctx) {
  const { P, ROMAN, S, analysis, courtSVG, curL, ensureSpots, esc, fixPanel, frontRowList, full, ghostsFor, isF, legend, nm, statusOf, ENG } = ctx;
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
  return `${sum ? `<div class="summary">${sum}</div>` : ''}${fixPanel(L)}<div class="board">${cards}</div>
  <div class="legend" style="margin-top:22px">${legend()}</div>`;
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


  return { rotView, serveView };
}
