export function createRoster(ctx) {
  const { PASTE_EXAMPLE, ROLES, S, esc, jer, lbl, pool, roleCls } = ctx;
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


  return { rosterView };
}
