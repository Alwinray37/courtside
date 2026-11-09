export const RT = { liveEff: null };   // during the live set: real player id -> the position token she is playing (so roles, passing and attack rules follow the spot)
export function allP(t) { const e = RT.liveEff; return (t.players || []).concat((t.roster || []).map(p => { const k = e && e[p.id]; return k ? { ...p, roles: k.roles || [], backRow: k.backRow, passer: k.passer, hand: k.hand, cant: k.cant, calls: k.calls } : p; })); }
/* ===== Rotation engine: pure functions, no DOM ===== */
export const ENG = (() => {
  const FRONT = [4, 3, 2], BACK = [5, 6, 1];
  const isFront = z => z === 2 || z === 3 || z === 4;
  const ATTACK_LINE = 1 / 3;
  const ZX = { 4: 0.17, 3: 0.5, 2: 0.83, 5: 0.17, 6: 0.5, 1: 0.83 };

  // zone of serving-order slot i in rotation r (1..6); order[r-1] is in zone 1
  function slotZone(i, r) { return [1, 2, 3, 4, 5, 6][((i - (r - 1)) % 6 + 6) % 6]; }

  // who actually stands in each zone for rotation r (setter swap + libero applied)
  function court(lineup, r) {
    const rot = lineup.rotations[r - 1] || {};
    const zones = {}, base = {};
    lineup.order.forEach((pid, i) => {
      const z = slotZone(i, r);
      base[z] = pid;
      let who = pid;
      (lineup.swaps || []).forEach(s => { if (s.starter === pid && isFront(z)) who = s.sub; });
      zones[z] = who;
    });
    // DS / other subs the coach planned for this rotation
    (lineup.subs || []).forEach(s => { if (!s.in || !s.out || !(s.rs || []).includes(r)) return; const z = Object.keys(zones).find(k => zones[k] === s.out); if (z) zones[z] = s.in; });
    let libero = null;
    if (rot.libero && rot.libero.id) {
      const z = Object.keys(zones).find(k => zones[k] === rot.libero.replaces);
      if (z) { zones[z] = rot.libero.id; libero = { id: rot.libero.id, replaces: rot.libero.replaces, zone: +z }; }
    }
    const zoneOf = {}; Object.entries(zones).forEach(([z, p]) => zoneOf[p] = +z);
    return { zones, zoneOf, base, libero, setter: setterFor(lineup, zones, r) };
  }

  // who sets this rotation, by system
  function setterFor(lineup, zones, r) {
    const named = lineup.setters || [];
    // a player subbed in for a setter in this rotation sets in her place (swaps aren't: a 6-2 front-row hitter sub doesn't set)
    const setters = named.concat((lineup.subs || []).filter(s => s.in && !s.noSet && named.includes(s.out) && (s.rs || []).includes(r)).map(s => s.in));
    const on = Object.entries(zones).filter(([z, p]) => setters.includes(p));
    if (!on.length) return null;
    if (on.length === 1) return on[0][1];
    const sys = lineup.system;
    const want = sys === '4-2' ? isFront : z => !isFront(z);
    const pick = on.find(([z]) => want(+z));
    return (pick || on[0])[1];
  }

  // overlap constraints: [a, b, axis] => pos[a][axis] < pos[b][axis]
  const CONSTRAINTS = [
    [4, 5, 'y', 'front'], [3, 6, 'y', 'front'], [2, 1, 'y', 'front'],
    [4, 3, 'x', 'left'], [3, 2, 'x', 'left'], [5, 6, 'x', 'left'], [6, 1, 'x', 'left']
  ];
  const ZN = { 1: 'right back', 2: 'right front', 3: 'middle front', 4: 'left front', 5: 'left back', 6: 'middle back' };

  function overlap(c, spots, name) {
    const out = [];
    CONSTRAINTS.forEach(([za, zb, ax, kind]) => {
      const a = c.zones[za], b = c.zones[zb];
      const pa = spots[a], pb = spots[b];
      if (!pa || !pb) return;
      const ia = ax === 'x' ? 0 : 1;
      const d = pb[ia] - pa[ia];
      if (d > 0.004) return;
      const tight = d > -0.05;
      out.push({ za, zb, a, b, kind, tight, msg: tight
        ? (kind === 'front'
          ? `${name(a)} (zone ${za}) and ${name(b)} (zone ${zb}) are level. ${name(a)} needs to be clearly closer to the net.`
          : `${name(a)} (zone ${za}) and ${name(b)} (zone ${zb}) are stacked. ${name(a)} needs to stay to the left.`)
        : (kind === 'front'
          ? `${name(a)} (zone ${za}) must be closer to the net than ${name(b)} (zone ${zb}).`
          : `${name(a)} (zone ${za}) must be left of ${name(b)} (zone ${zb}).`) });
    });
    return out;
  }

  // nudge positions until legal. fixed = set of ids that should not move
  function repair(c, spots, fixed = new Set(), margin = 0.05) {
    const s = JSON.parse(JSON.stringify(spots));
    const cl = v => Math.min(0.97, Math.max(0.03, v));
    for (let it = 0; it < 60; it++) {
      let changed = false;
      CONSTRAINTS.forEach(([za, zb, ax]) => {
        const a = c.zones[za], b = c.zones[zb];
        if (!s[a] || !s[b]) return;
        const i = ax === 'x' ? 0 : 1;
        if (s[a][i] < s[b][i] - margin + 0.0001) return;
        const fa = fixed.has(a), fb = fixed.has(b);
        const mid = (s[a][i] + s[b][i]) / 2;
        if (fa && fb) return;
        if (fa) s[b][i] = cl(s[a][i] + margin);
        else if (fb) s[a][i] = cl(s[b][i] - margin);
        else { s[a][i] = cl(mid - margin / 2); s[b][i] = cl(mid + margin / 2); }
        changed = true;
      });
      if (!changed) break;
    }
    Object.keys(s).forEach(k => s[k] = [+s[k][0].toFixed(3), +s[k][1].toFixed(3)]);
    return s;
  }

  function permutations(a) {
    if (a.length <= 1) return [a.slice()];
    const out = [];
    a.forEach((v, i) => permutations(a.slice(0, i).concat(a.slice(i + 1))).forEach(p => out.push([v].concat(p))));
    return out;
  }

  // build a serve-receive formation from scratch
  function formation(lineup, r, team, nPassers = 3) {
    const c = court(lineup, r);
    const P = id => allP(team).find(p => p.id === id) || { roles: [] };
    const on = Object.values(c.zones);
    const setter = c.setter;
    let pool = on.filter(id => id !== setter);
    const score = id => {
      const p = P(id), z = c.zoneOf[id];
      let s = 0;
      if (c.libero && c.libero.id === id) s += 100; else if (p.roles.includes('L')) s += 30;
      if (p.passer) s += 40;
      if (p.roles.includes('OH')) s += 20;
      if (p.roles.includes('DS')) s += 30;
      if (!isFront(z)) s += 8;
      if (p.roles.includes('M')) s -= 30;
      if (p.roles.includes('S')) s -= 50;
      return s;
    };
    const passers = pool.sort((a, b) => score(b) - score(a)).slice(0, nPassers);
    const lanes = nPassers === 4 ? [0.13, 0.38, 0.62, 0.87] : nPassers === 2 ? [0.3, 0.7] : [0.2, 0.5, 0.8];
    const ideal = {};
    on.forEach(id => {
      const z = c.zoneOf[id];
      if (id === setter) ideal[id] = isFront(z) ? [ZX[z] + (z === 4 ? 0.03 : 0), 0.08] : [{ 1: 0.94, 6: 0.6, 5: 0.22 }[z], 0.3];
      else if (isFront(z)) ideal[id] = [ZX[z], 0.12];
      else ideal[id] = [ZX[z], 0.88];
    });
    let best = null;
    permutations(passers).forEach(perm => {
      const s = JSON.parse(JSON.stringify(ideal));
      perm.forEach((id, k) => s[id] = [lanes[k], k === 1 && nPassers === 3 ? 0.66 : 0.62]);
      const fixed = new Set(perm);
      const fixedSpots = repair(c, s, fixed, 0.1);
      const bad = overlap(c, fixedSpots, x => x).length;
      let move = 0;
      Object.keys(fixedSpots).forEach(id => { move += Math.abs(fixedSpots[id][0] - s[id][0]) + Math.abs(fixedSpots[id][1] - s[id][1]); });
      perm.forEach((id, k) => move += Math.abs(ZX[c.zoneOf[id]] - lanes[k]) * 0.6);
      const cost = bad * 100 + move;
      if (!best || cost < best.cost) best = { cost, spots: fixedSpots };
    });
    if (overlap(c, best.spots, x => x).length) best.spots = repair(c, best.spots, new Set(), 0.08);
    return { spots: best.spots, passers };
  }

  /* ---------- set calls ---------- */
  function attackers(lineup, r, team) {
    const c = court(lineup, r);
    const P = id => allP(team).find(p => p.id === id) || { roles: [] };
    return Object.entries(c.zones).map(([z, id]) => ({ id, z: +z, front: isFront(+z), p: P(id) }))
      .filter(a => a.id !== c.setter && !(c.libero && c.libero.id === a.id))
      .map(a => a.p.roles.includes('S') ? { ...a, p: { ...a.p, roles: ['OPP'], backRow: true } } : a);
  }

  function callCheck(lineup, r, team, rot) {
    const c = court(lineup, r);
    const G = code => team.glossary.find(g => g.code === code);
    const name = id => (allP(team).find(p => p.id === id) || { first: id }).first || id;
    const issues = [];
    const spots = rot.spots || {};
    overlap(c, spots, name).forEach(o => issues.push({ level: o.tight ? 'warn' : 'error', kind: 'overlap', msg: o.msg, ids: [o.a, o.b] }));
    const calls = rot.calls || {};
    const frontCalls = [];
    Object.entries(calls).forEach(([id, code]) => {
      if (!code) return;
      const z = c.zoneOf[id], g = G(code), p = allP(team).find(x => x.id === id) || { roles: [] };
      if (z === undefined) { issues.push({ level: 'error', kind: 'notOnCourt', msg: `${name(id)} has a call (${code}) but isn't on the court this rotation.`, ids: [id] }); return; }
      if (!g) { issues.push({ level: 'warn', kind: 'unknown', msg: `"${code}" isn't in your calls glossary yet.`, ids: [id] }); return; }
      if (c.libero && c.libero.id === id) issues.push({ level: 'error', kind: 'libero', msg: `${name(id)} is the libero and can't attack above the net.`, ids: [id] });
      else if (id === c.setter) issues.push({ level: 'warn', kind: 'setter', msg: `${name(id)} is setting this rotation but has a hitting call.`, ids: [id] });
      if (!isFront(z) && g.row === 'F') issues.push({ level: 'error', kind: 'backrow', msg: `${name(id)} is back row (zone ${z}); "${code}" is a front-row attack. She has to take off behind the 10-ft line.`, ids: [id] });
      if (isFront(z) && g.row === 'B') issues.push({ level: 'info', kind: 'frontBack', msg: `${name(id)} is front row but has a back-row call (${code}).`, ids: [id] });
      if (cantRun(p, g)) issues.push({ level: 'warn', kind: 'cant', msg: `${name(id)} – ${code}: ${cantRun(p, g)}.`, ids: [id] });
      if (isFront(z) && g.row === 'F') frontCalls.push({ id, g });
    });
    for (let i = 0; i < frontCalls.length; i++) for (let j = i + 1; j < frontCalls.length; j++) {
      const a = frontCalls[i], b = frontCalls[j];
      if (Math.abs(a.g.x - b.g.x) < MIN_GAP) issues.push({ level: 'warn', kind: 'lane', msg: `Traffic jam: ${name(a.id)} (${a.g.code}) and ${name(b.id)} (${b.g.code}) are going to the same spot. Give them more space.`, ids: [a.id, b.id] });
    }
    if (rot.passers && rot.passers.length) {
      const ps = passersOf(lineup, r, team, rot);
      if (ps.length === 2) issues.push({ level: 'warn', kind: 'passers', msg: `2-person pass: ${ps.map(name).join(' and ')} cover the whole court. Most rotations want at least 3.`, ids: ps });
    }
    (lineup.subs || []).forEach(s => {
      if (!s.in || !s.out || !(s.rs || []).includes(r)) return;
      const z = c.zoneOf[s.in];
      if (z === undefined) issues.push({ level: 'warn', kind: 'sub', msg: `${name(s.out)} isn’t on the court in this rotation, so the sub for ${name(s.in)} doesn’t happen.`, ids: [s.in] });
      else if (isFront(z) && ((allP(team).find(x => x.id === s.in) || { roles: [] }).roles || []).includes('DS')) issues.push({ level: 'info', kind: 'sub', msg: `${name(s.in)} is a DS playing the front row (zone ${z}). She’ll have to block.`, ids: [s.in] });
    });
    if (rot.libero && rot.libero.replaces && c.zoneOf[rot.libero.replaces] === undefined && (lineup.subs || []).some(s => s.out === rot.libero.replaces && (s.rs || []).includes(r)))
      issues.push({ level: 'warn', kind: 'libero', msg: `The libero is set to go in for ${name(rot.libero.replaces)}, but ${name(rot.libero.replaces)} is subbed out this rotation.`, ids: [] });
    const outsFor = {}; (lineup.subs || []).forEach(s => { if (s.in && s.out) (outsFor[s.in] = outsFor[s.in] || new Set()).add(s.out); });
    Object.entries(outsFor).forEach(([id, set]) => { if (set.size > 1 && c.zoneOf[id] !== undefined) issues.push({ level: 'warn', kind: 'sub', msg: `${name(id)} subs for more than one starter. Under standard rules a sub can only go in for the same starter.`, ids: [id] }); });
    const atk = attackers(lineup, r, team);
    atk.forEach(a => { if (!calls[a.id] && (a.front || a.p.backRow)) issues.push({ level: 'info', kind: 'noCall', msg: `${name(a.id)} doesn't have a call.`, ids: [a.id] }); });
    return issues;
  }

  function cross(p1, p2, p3, p4) {
    const d = (a, b, c) => (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
    return d(p1, p3, p4) !== d(p2, p3, p4) && d(p1, p2, p3) !== d(p1, p2, p4);
  }

  // combo grade 0-100 with plain-language parts
  function grade(lineup, r, team, calls, spots = {}) {
    const c = court(lineup, r);
    const G = code => team.glossary.find(g => g.code === code);
    const parts = [];
    let pts = 0;
    const f = Object.entries(calls).filter(([id, code]) => G(code) && G(code).row === 'F' && c.zoneOf[id] && isFront(c.zoneOf[id]));
    const b = Object.entries(calls).filter(([id, code]) => G(code) && G(code).row === 'B' && c.zoneOf[id] && !isFront(c.zoneOf[id]));
    const lanes = new Set(f.map(([, code]) => G(code).x < 0.33 ? 'L' : G(code).x > 0.67 ? 'R' : 'M'));
    pts += lanes.size * 12; parts.push({ ok: lanes.size === 3, t: `${lanes.size} of 3 front lanes covered` });
    const quick = f.some(([, code]) => G(code).tempo === 1);
    pts += quick ? 18 : 0; parts.push({ ok: quick, t: quick ? 'A quick holds their middle blocker' : 'No quick to hold their middle' });
    pts += b.length ? 14 : 0; parts.push({ ok: !!b.length, t: b.length ? `${b.length} back-row option${b.length > 1 ? 's' : ''}` : 'No back-row option' });
    const n = f.length + b.length;
    pts += Math.min(n, 4) * 8; parts.push({ ok: n >= 4, t: `${n} attackers available` });
    let conflicts = 0;
    for (let i = 0; i < f.length; i++) for (let j = i + 1; j < f.length; j++) if (Math.abs(G(f[i][1]).x - G(f[j][1]).x) < 0.14) conflicts++;
    if (conflicts) { pts -= conflicts * 15; parts.push({ ok: false, t: `${conflicts} lane conflict${conflicts > 1 ? 's' : ''}` }); }
    const tired = f.filter(([id, code]) => spots[id] && spots[id][1] > 0.5 && G(code).tempo === 1).length;
    if (tired) { pts -= tired * 8; parts.push({ ok: false, t: `${tired} passer${tired > 1 ? 's' : ''} also running a quick` }); }
    const rts = f.map(([id, code]) => spots[id] && [spots[id], [G(code).x, 0.05]]).filter(Boolean);
    let x = 0;
    for (let i = 0; i < rts.length; i++) for (let j = i + 1; j < rts.length; j++) if (cross(rts[i][0], rts[i][1], rts[j][0], rts[j][1])) x++;
    if (x) { pts -= x * 4; parts.push({ ok: false, t: `${x} crossing route${x > 1 ? 's' : ''}` }); }
    return { score: Math.max(0, Math.min(100, pts)), parts, front: f.length, back: b.length };
  }

  // rules engine: best set-call combo for a rotation
  /* ---------- set knowledge ---------- */
  const SETTER_X = 0.67;                 // default setter target, between zones 2 and 3
  const SX = team => (team && typeof team.setterX === 'number') ? team.setterX : SETTER_X;   // coach can move it (e.g. zone 3)
  const MIN_GAP = 0.16;            // minimum space between two front-row contact points (about 1.5 m)           // setter's target, between zones 2 and 3
  const laneOf = x => x < 0.42 ? 'L' : x > 0.62 ? 'R' : 'M';
  const LANE_NAME = { L: 'left', M: 'middle', R: 'right' };
  const isQuick = g => g.tempo === 1;

  // how well one player fits one set, with plain-language reasons
  // where a hitter starts her approach for a set (shared with the animation)
  function approachStart(g) {
    if (g.row === 'B') return [g.x, 0.74];
    if (g.oneFoot) return [Math.max(0.05, g.x - 0.3), 0.24];
    if (g.x < 0.12) return [-0.04, 0.46];
    if (g.x > 0.88) return [1.04, 0.46];
    if (g.tempo === 1) return [g.x - 0.03, 0.36];
    return [g.x - 0.08, 0.44];
  }

  /* ---------- serve receive: who passes, and where everyone lines up ---------- */
  function passScore(p, z) {
    const r = p.roles || [];
    let s = 0;
    if (r.includes('L')) s += 100;
    if (p.passer) s += 40;
    if (r.includes('DS')) s += 30;
    if (r.includes('OH')) s += 20;
    if (!isFront(z)) s += 8;
    if (r.includes('M')) s -= 30;
    if (r.includes('S')) s -= 50;
    return s;
  }
  // serve-receive options for a rotation: a front-row hitter who shows pass then goes (show & go),
  // and back-row players tucked out of the passing line (hide)
  function srOpts(lineup, r, rot) {
    const c = court(lineup, r), sr = (rot && rot.sr) || {};
    const showGo = sr.showGo && c.zoneOf[sr.showGo] !== undefined && isFront(c.zoneOf[sr.showGo]) && sr.showGo !== c.setter ? sr.showGo : null;
    const hide = (sr.hide || []).filter(id => c.zoneOf[id] !== undefined && !isFront(c.zoneOf[id]) && id !== c.setter);
    return { showGo, hide };
  }
  function defaultPassers(lineup, r, team, n = 3, seed = [], rot) {
    const c = court(lineup, r), P = id => allP(team).find(p => p.id === id) || { roles: [] }, o = srOpts(lineup, r, rot);
    const pool = Object.values(c.zones).filter(id => id !== c.setter && !seed.includes(id) && id !== o.showGo && !o.hide.includes(id))
      .sort((a, b) => passScore(P(b), c.zoneOf[b]) - passScore(P(a), c.zoneOf[a]));
    return seed.concat(pool).slice(0, Math.max(n, seed.length));
  }
  // the coach's passers for this rotation (2 or more), or the best 3 if none are picked
  function passersOf(lineup, r, team, rot) {
    const c = court(lineup, r), on = Object.values(c.zones), o = srOpts(lineup, r, rot);
    const set = ((rot && rot.passers) || []).filter(id => on.includes(id) && id !== c.setter && id !== o.showGo && !o.hide.includes(id));
    return set.length >= 2 ? set : defaultPassers(lineup, r, team, 3, set, rot);
  }
  // legal formation that keeps the passers spread across the court and puts every hitter
  // as close as possible to where her approach starts for her set
  function segD(q, a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy; let u = L2 ? ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / L2 : 0; u = Math.max(0, Math.min(1, u)); return Math.hypot(q[0] - a[0] - u * dx, q[1] - a[1] - u * dy); }
  function formationFor(lineup, r, team, calls, passers, rot) {
    const c = court(lineup, r), P = id => allP(team).find(p => p.id === id) || { roles: [] };
    const o = srOpts(lineup, r, rot);
    passers = passers.filter(id => id !== o.showGo && !o.hide.includes(id));
    const line = o.showGo ? passers.concat(o.showGo) : passers.slice();     // show & go stands in the passing line
    const G = code => team.glossary.find(g => g.code === code);
    const on = Object.values(c.zones);
    const ZXX = { 4: .17, 3: .5, 2: .83, 5: .17, 6: .5, 1: .83 };
    const tgt = {};
    on.forEach(id => { const g = calls[id] && G(calls[id]); if (g) { const a = approachStart(g); tgt[id] = [Math.min(.95, Math.max(.05, a[0])), a[1]]; } });
    const ideal = {};
    on.forEach(id => {
      const z = c.zoneOf[id], f = isFront(z);
      if (id === c.setter) ideal[id] = f ? [SX(team) - 0.04, 0.08] : [Math.min(0.9, SX(team) + 0.08), 0.26];
      else if (o.hide.includes(id)) ideal[id] = [tgt[id] ? tgt[id][0] : { 5: .08, 6: .5, 1: .92 }[z], 0.94];
      else if (tgt[id]) ideal[id] = f ? tgt[id].slice() : [tgt[id][0], Math.max(0.74, tgt[id][1])];   // hitters start at the top of their route
      else ideal[id] = [ZXX[z], f ? 0.14 : 0.86];
    });
    // a back-row setter tucks just behind and beside her front-row partner (hitter or passer)
    const sz = c.setter && !isFront(c.zoneOf[c.setter]) ? c.zoneOf[c.setter] : null, pid = sz && c.zones[{ 1: 2, 6: 3, 5: 4 }[sz]];
    const tuck = s => { if (!pid || !s[pid] || s[pid][1] <= 0.16) return; const p = s[pid], side = sz === 5 ? -1 : 1, x = p[0] + side * 0.08;
      s[c.setter] = [x > 0.95 || x < 0.05 ? p[0] - side * 0.08 : x, Math.min(0.8, p[1] + 0.12)]; };
    const n = line.length;
    // passers split the court into equal lanes: 2 → halves, 3 → thirds, 4 → quarters
    const base = Array.from({ length: Math.max(1, n) }, (_, k) => (k + 0.5) / Math.max(1, n));
    const configs = [];
    [0, -0.03, 0.03, -0.06, 0.06, -0.1, 0.1].forEach(sh => [1, 0.94, 0.88].forEach(sq => configs.push(base.map(x => Math.min(.94, Math.max(.06, .5 + (x - .5) * sq + sh))))));
    const near = (a, b) => Math.abs(a[0] - b[0]) * 252 < 32 && Math.abs(a[1] - b[1]) * 180 < 32;
    let best = null;
    permutations(line).forEach(perm => configs.forEach(lanes => {
      const s = JSON.parse(JSON.stringify(ideal));
      perm.forEach((id, k) => { s[id] = [lanes[k], c.libero && c.libero.id === id ? 0.68 : isFront(c.zoneOf[id]) ? 0.57 : 0.66]; });
      tuck(s);
      const rs = repair(c, s, new Set(perm), 0.1);
      if (overlap(c, rs, x => x).length) return;
      let cost = 0;
      on.forEach(id => {
        const sp = rs[id];
        if (tgt[id] && !o.hide.includes(id)) {
          const d = Math.hypot(sp[0] - tgt[id][0], sp[1] - tgt[id][1]);
          cost += perm.includes(id) ? d * 2.5 : d * 6 + Math.max(0, d - 0.25) * 8;   // non-passing hitters: start at the top of the route
        }
        if (!perm.includes(id)) cost += Math.hypot(sp[0] - ideal[id][0], sp[1] - ideal[id][1]) * (o.hide.includes(id) ? 2.5 : 0.8);
      });
      // nobody stands in a back-row hitter's approach lane (start → approach → contact)
      on.forEach(hid => { const g = calls[hid] && G(calls[hid]); if (!g || g.row !== 'B' || isFront(c.zoneOf[hid])) return;
        const a = approachStart(g), segs = [[rs[hid], a], [a, [g.x, 0.4]]];
        on.forEach(id => { if (id === hid || id === c.setter) return; const q = rs[id]; if (segs.some(([s0, s1]) => segD(q, s0, s1) < 0.07)) cost += 3; }); });
      // routes shouldn't cross: a passer on the Go passes left of a passer on the 30, and so on
      const rts = on.filter(id => tgt[id] && !o.hide.includes(id) && id !== c.setter).map(id => [rs[id], tgt[id]]);
      for (let i = 0; i < rts.length; i++) for (let j = i + 1; j < rts.length; j++) if (cross(rts[i][0], rts[i][1], rts[j][0], rts[j][1])) cost += 5;
      // keep hitters in the same left-to-right order as where they attack, so nobody runs across a teammate
      const hit = on.filter(id => calls[id] && G(calls[id]) && !o.hide.includes(id) && id !== c.setter);
      for (let i = 0; i < hit.length; i++) for (let j = i + 1; j < hit.length; j++) {
        const a = hit[i], b = hit[j], ga = G(calls[a]).x, gb = G(calls[b]).x, dx = rs[a][0] - rs[b][0];
        if (Math.abs(ga - gb) > 0.06 && Math.abs(dx) > 0.04 && Math.sign(dx) !== Math.sign(ga - gb) && Math.abs(rs[a][1] - rs[b][1]) < 0.3) cost += 4;
      }
      const xs = perm.map(id => rs[id][0]).sort((a, b) => a - b);
      xs.forEach((x, k) => { cost += Math.abs(x - base[k]) * 14; });                       // even split of the court
      const ys = perm.map(id => rs[id][1]);
      cost += (Math.max(...ys) - Math.min(...ys)) * 3;                                      // one passing line
      const ids = Object.keys(rs);
      for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) if (near(rs[ids[i]], rs[ids[j]])) cost += 1.2;
      if (!best || cost < best.cost) best = { cost, spots: rs };
    }));
    if (!best) return formation(lineup, r, team, Math.max(2, passers.length)).spots;
    Object.keys(best.spots).forEach(k => best.spots[k] = [+best.spots[k][0].toFixed(3), +best.spots[k][1].toFixed(3)]);
    return best.spots;
  }
  // route length in metres from a receive spot to the approach start for a set
  const routeM = (spot, g) => { const a = approachStart(g); return Math.hypot((spot[0] - a[0]) * 9, (spot[1] - a[1]) * 9); };

  // sets this player can't run: the coach's list, plus lefties don't take the one-foot slide
  function cantRun(p, g) {
    if ((p.cant || []).includes(g.code)) return 'Coach marked this as a set she doesn’t run';
    if (p.hand === 'L' && g.oneFoot) return 'Lefty: the one-foot slide doesn’t work for her';
    return '';
  }
  function setFit(p, g, spot, z, sx = SETTER_X) {
    let s = 0; const why = [], warn = [];
    const no = cantRun(p, g);
    if (no) { s -= 40; warn.push(no); }
    const roles = p.roles || [];
    if ((g.roles || []).some(x => roles.includes(x))) { s += 4; why.push('fits her position'); }
    if ((p.calls || []).includes(g.code)) { s += 2; why.push('already runs it'); }
    // handedness: a ball set in front of the setter travels right-to-left, so it reaches a lefty only after crossing her body
    const off = sx - g.x;                     // >0 = set in front of setter (toward zone 4)
    if (p.hand === 'L') {
      if (off < -0.02) { s += 5; why.push('on-hand for a lefty (ball comes to her left shoulder)'); }
      else if (off > 0.1) { const k = Math.min(1, off / 0.6); s -= 2 + k * 8; warn.push('off-hand for a lefty: the ball crosses her body'); }
    } else if (off < -0.12 && g.row === 'F') { s -= 1.5; }
    // route: distance from her receive spot to where her approach starts
    if (spot) {
      const a0 = approachStart(g);
      const d = Math.hypot(spot[0] - Math.min(1, Math.max(0, a0[0])), (spot[1] - a0[1]) * 0.7);
      s -= d * 14 + Math.max(0, d - 0.45) * 22;          // long runs get expensive fast
      if (d < 0.22) why.push('short route from her receive spot');
      else if (d > 0.5) warn.push(`long route from her receive spot (${(d * 9).toFixed(1)} m)`);
      // a passer needs time: quick tempo right after passing is hard
      if (spot[1] > 0.5 && isQuick(g) && g.row === 'F') { s -= 6; warn.push('she is passing, so a quick is hard to get to'); }
    }
    if (g.oneFoot && !roles.includes('M')) { s -= 1; }
    return { s, why, warn };
  }

  // read the opponent's three blockers against a set of calls
  // RB = their right blocker (across from our left), MB = middle, LB = their left blocker (across from our right)
  function blockRead(lineup, r, team, calls) {
    const c = court(lineup, r);
    const G = code => team.glossary.find(g => g.code === code);
    const atk = Object.entries(calls).map(([id, code]) => ({ id, g: G(code), z: c.zoneOf[id] }))
      .filter(a => a.g && a.z !== undefined && (a.g.row === 'B' || isFront(a.z)));
    const front = atk.filter(a => a.g.row === 'F'), back = atk.filter(a => a.g.row === 'B');
    // a slide doesn't hold their middle the way a middle quick does: their outside blocker follows the slide along the net
    // and their middle stays just inside her, so the middle drifts right and away from our left side
    const slide = front.find(a => a.g.oneFoot);
    const quick = front.find(a => isQuick(a.g) && a.g.x >= 0.35 && !a.g.oneFoot);
    const mbHeld = !!quick || !!slide;
    const per = {};
    // a pin blocker with nobody attacking in front of her is free to pinch into the middle
    const rsBusy = front.some(a => laneOf(a.g.x) === 'L'), ohBusy = front.some(a => laneOf(a.g.x) === 'R');
    const freePins = (rsBusy ? 0 : 1) + (ohBusy ? 0 : 1);
    // base read for each attacker
    front.forEach(a => {
      const lane = laneOf(a.g.x);
      let b, why;
      if (slide && a.id === slide.id) {
        if (quick) { b = 1; why = 'Their outside blocker follows the slide along the net; their middle has to stay with the quick, so it’s one-on-one'; }
        else { b = 1.5; why = 'Their outside blocker follows the slide and their middle stays just inside her: expect a late double unless a middle quick holds her'; }
      }
      else if (quick && a.id === quick.id) { b = 1; why = slide ? 'Holds their middle, so she can’t help on the slide' : 'Draws their middle blocker, which frees everyone else'; }
      else if (isQuick(a.g)) { b = 1; why = 'Quick tempo: their pin blocker has to react fast'; }
      else if (lane === 'M') {
        if (mbHeld) {
          b = 0.5 + freePins * 0.5;
          why = !quick ? (freePins ? `Their middle drifted right with the slide, but ${freePins === 2 ? 'both pin blockers have' : 'a pin blocker has'} nobody to guard and can pinch in` : 'Their middle drifted right with the slide, so this hits the open seam') : freePins ? `Their middle went with the quick, but ${freePins === 2 ? 'both pin blockers have' : 'a pin blocker has'} nobody to guard and can pinch in` : 'Their middle went with the quick and both pin blockers are held by our pins, so this hits the open seam';
        } else { b = a.g.tempo === 3 ? 2 : 1.5; why = 'Their middle can read it and set up a block'; }
      } else {
        b = 1; why = `One-on-one with their ${lane === 'L' ? 'right-side' : 'left-side'} blocker`;
        if (!mbHeld) {
          // their middle lines up across from our setter's target, so a pin set far from it gives her farther to travel
          const fastPin = a.g.tempo === 2 && (a.g.x < 0.12 || a.g.x > 0.88), far = Math.abs(a.g.x - SX(team)) > 0.4;
          b = Math.max(1, 2 - (fastPin ? 0.5 : 0) - (far ? 0.5 : 0));
          why = fastPin && far ? 'Fast to the far pin: their middle starts across from our setter and has a long way to close'
            : far ? 'Far pin from the setter: their middle has to travel, so she may close late'
            : fastPin ? 'Fast to the pin, but it’s close to our setter, so their middle may still get there'
            : 'Close to our setter and nothing holds their middle, so expect a double block';
        } else if (a.g.tempo === 3) { b = 1.5; why = 'High set: even with their middle held, she has time to help'; }
      }
      per[a.id] = { b, why };
    });
    back.forEach(a => {
      const lane = laneOf(a.g.x);
      let b, why;
      if (lane === 'M') {
        if (mbHeld && !quick) { b = 1; why = 'Their middle drifted right with the slide, so the middle of the net is thin'; }
        else if (mbHeld) { b = isQuick(a.g) ? 0.5 : 1; why = isQuick(a.g) ? 'Their middle went up with the quick; the back-row quick comes right behind her' : 'Fourth attacker through the middle; their middle has to stay home'; }
        else { b = 1.5; why = 'Back-row middle with no quick in front: their middle can wait for it'; }
      } else if (a.g.seam) {
        const pin = a.g.seam === 'L' ? 'right-side' : 'outside', pinBusy = a.g.seam === 'L' ? rsBusy : ohBusy;
        if (mbHeld && pinBusy) { b = 0.5; why = `Into the seam between their middle and ${pin} blocker: their middle is on the quick and their ${pin} blocker is guarding our pin`; }
        else if (pinBusy || mbHeld) { b = 1; why = `Into the seam between their middle and ${pin} blocker; one of them is free to close it`; }
        else { b = 1.5; why = `Their middle and ${pin} blocker are both free to close this seam`; }
      } else {
        b = mbHeld ? 1 : 1.5; why = mbHeld ? `Back-row ${LANE_NAME[lane]} attack against their pin blocker` : 'Their middle has time to help';
      }
      per[a.id] = { b, why };
    });
    // overload: two non-quick attackers close together facing the same blocker; the later one gets the better look
    const slow = atk.filter(a => !isQuick(a.g) && !(quick && a.id === quick.id));
    const used = new Set();
    for (let x = 0; x < atk.length; x++) for (let y = 0; y < atk.length; y++) {
      if (x === y) continue;
      const A = atk[x], B = atk[y];
      if (used.has(B.id) || used.has(A.id) || laneOf(A.g.x) !== laneOf(B.g.x) || Math.abs(A.g.x - B.g.x) > 0.3) continue;
      if (!(isQuick(A.g) || A.g.row === 'F') ) continue;
      if (isQuick(B.g) || !slow.includes(B)) continue;
      if (A.g.tempo >= B.g.tempo) continue;            // an overload needs one hitter to go first
      const lane = laneOf(B.g.x);
      if (lane === 'M' && mbHeld) continue;
      per[B.id].b = Math.max(0.5, per[B.id].b - 0.5);
      per[B.id].why = `Overload on the ${LANE_NAME[lane]}: ${A.g.code} goes first, so the blocker there has to commit before ${B.g.code} arrives`;
      used.add(B.id); used.add(A.id);
    }
    // with a slide and no middle quick, their middle stays inside the outside blocker: the right seam (40, D) is crowded
    if (slide && !quick) back.forEach(a => { if (a.g.seam === 'R' || laneOf(a.g.x) === 'R') { per[a.id].b = Math.max(per[a.id].b, 1.5); per[a.id].why = 'Behind the slide, where their outside blocker and middle are both shifting'; } });
    Object.values(per).forEach(v => v.label = v.b <= 0.5 ? 'Open look' : v.b <= 1 ? '1-on-1' : v.b < 2 ? 'Late double' : 'Double block');
    const n = front.length + back.length;
    return { per, mbHeld, quickId: quick ? quick.id : null, slideId: slide ? slide.id : null, attackers: n, front: front.length, back: back.length, extra: Math.max(0, n - 3) };
  }

  // named plays a coach would recognize
  function playNames(team, calls) {
    const codes = new Set(Object.values(calls));
    const G = code => team.glossary.find(g => g.code === code);
    const gs = [...codes].map(G).filter(Boolean);
    const out = [];
    const has = c => codes.has(c);
    const fq = gs.filter(g => g.row === 'F' && isQuick(g));
    if (has('3') && (has('Go') || has('Hut') || has('High'))) out.push('Gap-Go');
    if (has('1') && has('Back 1')) out.push('Double quick');
    if (has('Slide') && (has('Go') || has('Hut'))) out.push('Slide-Go');
    if (fq.some(g => g.x > 0.45 && g.x < 0.7) && gs.some(g => g.row === 'F' && !isQuick(g) && g.x > 0.4 && g.x < 0.65)) out.push('X / tandem');
    if (fq.length && gs.some(g => g.row === 'B' && g.x > 0.4 && g.x < 0.62)) out.push(gs.some(g => g.code === 'Bic') ? 'Quick-Bic' : 'Quick-Pipe');
    const pins = gs.filter(g => g.row === 'F' && (g.x < 0.12 || g.x > 0.88));
    if (pins.length >= 2) out.push('Spread');
    const tempos = l => new Set(gs.filter(g => laneOf(g.x) === l).map(g => g.tempo));
    if (tempos('L').size >= 2 && !out.includes('Gap-Go')) out.push('Left overload');
    if (tempos('R').size >= 2) out.push('Right overload');
    return out;
  }

  // full score for one combo: open nets + ease + fit
  function comboScore(lineup, r, team, calls, spots, fits) {
    const read = blockRead(lineup, r, team, calls);
    const G = code => team.glossary.find(g => g.code === code);
    let open = 0;
    Object.values(read.per).forEach(v => open += (2 - v.b));
    open += read.mbHeld ? 1.5 : 0;
    open += read.extra * 1.2;
    let fit = 0; Object.values(fits).forEach(f => fit += f.s);
    let crossings = 0;
    const rts = Object.entries(calls).map(([id, code]) => { const g = G(code); return g && g.row === 'F' && spots[id] ? [spots[id], [g.x, 0.05], g] : null; }).filter(Boolean);
    for (let a = 0; a < rts.length; a++) for (let b = a + 1; b < rts.length; b++) if (cross(rts[a][0], rts[a][1], rts[b][0], rts[b][1])) crossings++;
    // stretch the block: width across the net and attackers at the antennas
    const fx = Object.values(calls).map(G).filter(g => g && g.row === 'F').map(g => g.x);
    const span = fx.length > 1 ? Math.max(...fx) - Math.min(...fx) : 0;
    const pins = fx.filter(x => x < 0.12 || x > 0.88).length;
    let crowd = 0;
    const gs = Object.values(calls).map(G).filter(Boolean);
    for (let i = 0; i < gs.length; i++) for (let j = i + 1; j < gs.length; j++) {
      const A = gs[i], B = gs[j], d = Math.abs(A.x - B.x);
      if (A.row === B.row && d < 0.16 && A.tempo === B.tempo) crowd++;          // same lane, same moment: crowding, not a combo
      else if (A.row !== B.row && d < 0.08) crowd += 0.5;                        // back-row hitter right behind a front-row hitter
    }
    const raw = open * 9 + fit * 1.1 - crossings * 3 + span * 14 + pins * 4 - crowd * 6;
    return { raw, read, crossings, span, pins, crowd };
  }

  // top distinct, legal combos for a rotation
  function recommendTop(lineup, r, team, rot, opts = {}) {
    const keep = opts.keep || {}, n = opts.n || 3;
    const spots = rot.spots || {};
    const atk = attackers(lineup, r, team).filter(a => a.front || a.p.backRow || keep[a.id]);
    // every legal combo, scored with the given receive spots ({} = ignore where players stand now)
    const gen = sp => {
      const cands = atk.map(a => team.glossary
        .filter(g => keep[a.id] ? g.code === keep[a.id] : g.row === (a.front ? 'F' : 'B'))
        .filter(g => keep[a.id] || !cantRun(a.p, g))
        .map(g => ({ id: a.id, code: g.code, g, fit: setFit(a.p, g, sp[a.id], a.z, SX(team)) }))
        .sort((x, y) => y.fit.s - x.fit.s).slice(0, 7)).filter(o => o.length);
      const all = [];
      const walk = (i, pick) => {
        if (i === cands.length) {
          const fr = pick.filter(o => o.g.row === 'F'), bk = pick.filter(o => o.g.row === 'B');
          for (let a = 0; a < fr.length; a++) for (let b = a + 1; b < fr.length; b++) if (Math.abs(fr[a].g.x - fr[b].g.x) < MIN_GAP) return;
          for (let a = 0; a < bk.length; a++) for (let b = a + 1; b < bk.length; b++) if (Math.abs(bk[a].g.x - bk[b].g.x) < 0.12) return;
          const calls = {}, fits = {};
          pick.forEach(o => { calls[o.id] = o.code; fits[o.id] = o.fit; });
          all.push({ calls, fits, ...comboScore(lineup, r, team, calls, sp, fits) });
          return;
        }
        cands[i].forEach(o => { pick.push(o); walk(i + 1, pick); pick.pop(); });
      };
      walk(0, []);
      return all.sort((a, b) => b.raw - a.raw);
    };
    const differs = (p, o) => Object.keys(o.calls).filter(id => p.calls[id] !== o.calls[id]).length >= 2;
    const diverse = (list, k, into = []) => { for (const o of list) { if (into.length >= k) break; if (into.every(p => differs(p, o))) into.push(o); } return into; };
    if (opts.lineup === false) {
      const picked = diverse(gen(spots), n);
      const top = picked.length ? picked[0].raw : 0;
      return picked.map(o => ({ ...o, top, plays: playNames(team, o.calls), score: scale(o.raw, top) }));
    }
    // shortlist from both "where they stand now" and "where they could stand", then line each one up and re-rank
    const pool = diverse(gen(spots), 8);
    diverse(gen({}), 16, pool);
    const passers = passersOf(lineup, r, team, rot);
    pool.forEach(o => {
      o.spots = formationFor(lineup, r, team, o.calls, passers, rot);
      o.passers = passers;
      Object.assign(o, evaluate(lineup, r, team, { ...rot, spots: o.spots }, o.calls));
    });
    pool.sort((a, b) => b.raw - a.raw);
    const picked = diverse(pool, n);
    const top = picked.length ? picked[0].raw : 0;
    return picked.map(o => ({ ...o, top, plays: playNames(team, o.calls), score: scale(o.raw, top) }));
  }

  // 0-100 against the best combo found for this rotation
  function scale(raw, top) { return Math.max(5, Math.min(99, Math.round(95 - (top - raw) * 1.3))); }

  // compatibility: single best combo
  function recommend(lineup, r, team, rot, keep = {}) {
    const top = recommendTop(lineup, r, team, rot, { keep, n: 1, lineup: false })[0];
    const calls = {}, why = {};
    if (top) Object.entries(top.calls).forEach(([id, code]) => { calls[id] = code; why[id] = top.fits[id].why.concat(top.read.per[id] ? [top.read.per[id].label] : []); });
    return { calls, why };
  }

  // score any set of calls (current or suggested) on the same 0-100 scale as the options
  function evaluate(lineup, r, team, rot, calls) {
    const spots = rot.spots || {};
    const c = court(lineup, r);
    const fits = {};
    Object.entries(calls).forEach(([id, code]) => { const g = team.glossary.find(x => x.code === code); const p = allP(team).find(x => x.id === id); if (g && p && c.zoneOf[id] !== undefined) fits[id] = setFit(p, g, spots[id], c.zoneOf[id], SX(team)); });
    const sc = comboScore(lineup, r, team, calls, spots, fits);
    return { ...sc, fits, plays: playNames(team, calls) };
  }

  // arrows: from receive spot to takeoff point
  function route(id, code, team, c, spots) {
    const sp = spots[id]; if (!sp) return null;
    if (id === c.setter) return { kind: 'set', from: sp, to: [0.67, 0.05] };
    const g = team.glossary.find(x => x.code === code); if (!g) return null;
    if (g.row === 'F') return { kind: 'front', from: sp, to: [g.x, 0.05] };
    return { kind: 'back', from: sp, to: [g.x, ATTACK_LINE + 0.07] };
  }

  // subs + libero across one full cycle
  function cycle(lineup, team) {
    const name = id => (allP(team).find(p => p.id === id) || { first: id }).first || id;
    const rows = [];
    let subs = 0;
    for (let r = 1; r <= 6; r++) {
      const c = court(lineup, r), prev = court(lineup, r === 1 ? 6 : r - 1);
      const events = [];
      (lineup.swaps || []).concat((lineup.subs || []).filter(s => s.in && s.out).map(s => ({ starter: s.out, sub: s.in, ds: true }))).forEach(s => {
        const inNow = Object.values(c.zones).includes(s.sub) || (c.libero && c.libero.replaces === s.sub);
        const inPrev = Object.values(prev.zones).includes(s.sub) || (prev.libero && prev.libero.replaces === s.sub);
        if (inNow && !inPrev) { events.push(`${name(s.sub)} in for ${name(s.starter)}`); subs++; }
        if (!inNow && inPrev) { events.push(`${name(s.starter)} back in for ${name(s.sub)}`); subs++; }
      });
      const server = c.libero && c.libero.zone === 1 ? c.libero.replaces : c.zones[1];
      rows.push({ r, c, events, server, setter: c.setter });
    }
    return { rows, subsPerCycle: subs };
  }

  // move one player per problem, clearly into a legal spot, avoiding teammates
  function clearFix(c, spots) {
    const near = (p, q) => Math.abs(p[0] - q[0]) * 252 < 38 && Math.abs(p[1] - q[1]) * 180 < 38;
    const cl = v => Math.min(0.96, Math.max(0.04, v));
    const orig = spots;
    const score = s => {
      let d = 0, hits = 0;
      Object.keys(s).forEach(k => { d += Math.abs(s[k][0] - orig[k][0]) + Math.abs(s[k][1] - orig[k][1]); });
      const ids = Object.keys(s);
      for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) if (near(s[ids[a]], s[ids[b]])) hits++;
      return d + hits * 0.25;
    };
    // search: fix the first problem by moving one of its two players, then keep going (up to 4 moves)
    let best = null;
    // stricter than the rule itself: every pair ends up clearly separated, not just barely legal
    const strict = s => {
      const out = [];
      CONSTRAINTS.forEach(([za, zb, ax, kind]) => {
        const a = c.zones[za], b = c.zones[zb];
        if (!s[a] || !s[b]) return;
        const i = ax === 'x' ? 0 : 1;
        if (s[b][i] - s[a][i] < 0.06) out.push({ a, b, kind });
      });
      return out;
    };
    const walk = (s, depth) => {
      const v = strict(s);
      if (!v.length) { const sc = score(s); if (!best || sc < best.sc) best = { sc, s }; return; }
      if (depth === 4) return;
      const o = v[0], i = o.kind === 'front' ? 1 : 0;
      [o.a, o.b].forEach(id => [0.12, 0.18, 0.26].forEach(m => {
        const p = s[id].slice();
        p[i] = cl(id === o.a ? s[o.b][i] - m : s[o.a][i] + m);
        if (Math.abs(p[i] - s[id][i]) < 0.001) return;
        walk({ ...s, [id]: [+p[0].toFixed(3), +p[1].toFixed(3)] }, depth + 1);
      }));
    };
    walk(JSON.parse(JSON.stringify(spots)), 0);
    return best ? best.s : repair(c, spots, new Set(), 0.1);
  }

  // make a rotation legal: fix overlap, drop impossible calls, fill gaps with the rules engine
  function autoFix(lineup, r, team) {
    const name = id => (allP(team).find(p => p.id === id) || { first: id }).first || id;
    const G = code => team.glossary.find(g => g.code === code);
    const rot = JSON.parse(JSON.stringify(lineup.rotations[r - 1]));
    const L2 = { ...lineup, rotations: lineup.rotations.map((x, i) => i === r - 1 ? rot : x) };
    const c = court(L2, r);
    const changes = [];
    // 1. overlap
    const before = overlap(c, rot.spots, name);
    if (before.length) {
      const orig = JSON.parse(JSON.stringify(rot.spots));
      rot.spots = clearFix(c, rot.spots);
      // spread tokens that ended up on top of each other, without breaking legality
      const ids = Object.keys(rot.spots);
      const close = (a, b) => Math.abs(a[0] - b[0]) * 252 < 27 && Math.abs(a[1] - b[1]) * 180 < 27;
      for (let pass = 0; pass < 3; pass++) ids.forEach(id => {
        if (!ids.some(o => o !== id && close(rot.spots[id], rot.spots[o]))) return;
        if (Math.abs(orig[id][0] - rot.spots[id][0]) + Math.abs(orig[id][1] - rot.spots[id][1]) < 0.001) return;
        for (const step of [0.07, 0.12, 0.17]) {
          const tries = [[0, step], [0, -step], [step, 0], [-step, 0], [step, step], [-step, step], [step, -step], [-step, -step]];
          const ok = tries.map(([dx, dy]) => [rot.spots[id][0] + dx, rot.spots[id][1] + dy]).find(p => {
            if (p[0] < 0.03 || p[0] > 0.97 || p[1] < 0.04 || p[1] > 0.96) return false;
            const s2 = { ...rot.spots, [id]: p };
            return !overlap(c, s2, x => x).length && !ids.some(o => o !== id && close(p, rot.spots[o]));
          });
          if (ok) { rot.spots[id] = [+ok[0].toFixed(3), +ok[1].toFixed(3)]; break; }
        }
      });
      before.forEach(o => changes.push(o.kind === 'front'
        ? `${name(o.a)} moved in front of ${name(o.b)}`
        : `${name(o.a)} moved left of ${name(o.b)}`));
    }
    // 2. calls that can't happen
    const keep = {};
    let needFill = Object.entries(rot.calls || {}).some(([id, code]) => { const z = c.zoneOf[id], g = G(code); return z === undefined || (g && !isFront(z) && g.row === 'F'); });
    Object.entries(rot.calls || {}).forEach(([id, code]) => {
      if (!code) return;
      const z = c.zoneOf[id], g = G(code), p = allP(team).find(x => x.id === id) || { roles: [] };
      if (z === undefined) { changes.push(`Removed ${name(id)} – ${code} (she isn't on the court)`); return; }
      if (c.libero && c.libero.id === id) { changes.push(`Removed ${name(id)} – ${code} (libero can't attack)`); return; }
      if (id === c.setter) { changes.push(`Removed ${name(id)} – ${code} (she's setting)`); return; }
      if (g && !isFront(z) && g.row === 'F') { changes.push(`${name(id)} is back row, so ${code} (front-row) was swapped out`); return; }
      if (g && isFront(z) && g.row === 'B' && needFill) { changes.push(`${name(id)} is front row now, so ${code} was swapped out`); return; }
      keep[id] = code;
    });
    // 3. fill with the rules engine, keeping every legal call
    const before2 = JSON.stringify(keep);
    if (needFill || changes.length) {
      const rec = recommend(L2, r, team, { ...rot, calls: keep }, keep);
      const added = Object.entries(rec.calls).filter(([id]) => !keep[id]);
      added.forEach(([id, code]) => changes.push(`${name(id)} now runs ${code}`));
      rot.calls = { ...keep, ...Object.fromEntries(added) };
    }
    const after = callCheck(L2, r, team, rot).filter(i => i.level === 'error');
    return { rot, changes, remaining: after.map(i => i.msg) };
  }


  // default first-ball sets: outside = 4, opposite = 5, middle = 1 (the next free set if two hitters want the same one)
  function defaultCalls(lineup, r, team) {
    const G = code => team.glossary.find(g => g.code === code);
    const calls = {}, used = new Set();
    const alts = { '1': ['3', 'Back 1'], '4': ['5', 'Rip'], '5': ['4', 'Rip'] };
    attackers(lineup, r, team).filter(a => a.front).sort((a, b) => a.z - b.z).forEach(a => {
      const ro = a.p.roles || [];
      const want = ro.includes('M') ? '1' : (ro.includes('OPP') && !ro.includes('OH')) ? '5' : (ro.includes('OH') && !ro.includes('OPP')) ? '4' : a.z === 2 ? '5' : '4';
      const pick = [want].concat(alts[want] || []).find(code => G(code) && !used.has(code) && !cantRun(a.p, G(code)));
      if (pick) { calls[a.id] = pick; used.add(pick); }
    });
    return calls;
  }
  return { defaultCalls, approachStart, defaultPassers, passersOf, srOpts, formationFor, routeM, cantRun, MIN_GAP, scale, recommendTop, evaluate, blockRead, playNames, setFit, SETTER_X, setterX: SX, autoFix, cross, slotZone, court, overlap, repair, formation, callCheck, recommend, grade, route, cycle, isFront, ATTACK_LINE, ZN };
})();

