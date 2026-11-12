export function createLiveSet(ctx) {
  const { P, S, boardSnap, clone, courtSVG, curL, ensureSpots, esc, frontRowList, full, isF, jer, lblBase, nm, pool, render, roleCls, roleOf, saveLineup, saveTeam, shortName, titleOf, toast, tokP, ENG, RT } = ctx;
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
  // last set's setup: the one in progress or just ended, else the last one started with this lineup (saved on the lineup)
  const prev = S.live && S.live.lu === L.id ? S.live : S.lastSet && S.lastSet.lu === L.id ? S.lastSet : L.liveStart || null;
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
  L.liveStart = { start: st.start.slice(), startR: st.startR, lib: st.lib, plans: clone(st.plans), names: { them: st.names.them } };   // remembered for the next set
  saveLineup(L);
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


  return { liveLoad, liveSave, liveNew, livePoint, liveSetRot, liveSubAnswer, liveManualSub, liveView };
}
