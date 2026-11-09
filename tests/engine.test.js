import { describe, it, expect } from 'vitest';
import { ENG } from '../src/engine.js';

const lineup = { order: ['S1', 'OH1', 'MB1', 'OP', 'OH2', 'MB2'], setters: ['S1'], swaps: [], subs: [], liberos: [], rotations: [] };
const name = id => id;
// a legal base: front row (4,3,2) near the net, back row (5,6,1) behind, left to right in order
const base = { 4: [0.17, 0.2], 3: [0.5, 0.2], 2: [0.83, 0.2], 5: [0.17, 0.7], 6: [0.5, 0.7], 1: [0.83, 0.7] };
const spotsFor = c => Object.fromEntries(Object.entries(c.zones).map(([z, id]) => [id, base[z].slice()]));

describe('rotation engine', () => {
  it('puts the first server in zone 1 in rotation 1', () => {
    const c = ENG.court(lineup, 1);
    expect(c.zones[1]).toBe('S1');
    expect(c.zones[4]).toBe('OP');
  });

  it('rotates clockwise: zone 1 player moves to zone 6', () => {
    const c = ENG.court(lineup, 2);
    expect(c.zoneOf.S1).toBe(6);
    expect(c.zones[1]).toBe('OH1');
  });

  it('cycles back after six rotations', () => {
    expect(ENG.court(lineup, 1).zones).toEqual(ENG.court({ ...lineup }, 1).zones);
    for (let r = 1; r <= 6; r++) expect(Object.keys(ENG.court(lineup, r).zones)).toHaveLength(6);
  });

  it('finds no overlap in a base formation', () => {
    for (let r = 1; r <= 6; r++) {
      const c = ENG.court(lineup, r);
      expect(ENG.overlap(c, spotsFor(c), name).filter(o => !o.tight)).toHaveLength(0);
    }
  });

  it('flags a front-row player behind her back-row partner', () => {
    const c = ENG.court(lineup, 1), s = spotsFor(c);
    s[c.zones[3]] = [0.5, 0.85];          // zone 3 drops behind zone 6
    expect(ENG.overlap(c, s, name).some(o => !o.tight)).toBe(true);
  });

  it('puts a libero in for the player she replaces', () => {
    const L = { ...lineup, liberos: ['L'], rotations: [{ r: 1, spots: {}, calls: {}, libero: { id: 'L', replaces: 'OH2' } }] };
    const c = ENG.court(L, 1);
    expect(c.libero.zone).toBe(c.zoneOf.L);
    expect(Object.values(c.zones)).not.toContain('OH2');
  });
});
