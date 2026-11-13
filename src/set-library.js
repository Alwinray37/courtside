export function createSetLibrary(ctx) {
  const { P, S, SXT, TEMPO, clone, comboLegend, ensureSpots, esc, hOf, lbl, legend, saveTeam, tempoColor, ENG } = ctx;
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
  <div class="btnrow" style="margin-top:12px;align-items:center"><input type="text" id="newCall" placeholder="New call, e.g. Pipe" style="max-width:200px"><button class="btn primary" data-act="add-call">Add call</button>
  <span style="margin-left:auto" class="lbl2">Subs allowed per set <input type="number" min="6" max="18" id="subLimit" value="${S.team.subLimit || 15}" style="width:80px"></span></div></div>`;
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


  return { UNREL_V2, applyTarget, relInit, subInit, setTarget, sxLabel, callsView };
}
