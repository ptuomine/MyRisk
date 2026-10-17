/*
 * Generates src/mapdata.js: continents, region shapes, neighbours and sea routes.
 *
 * Each continent is a blob-shaped landmass. Its regions are Voronoi cells around
 * seed points inside the blob, so they come out in different sizes and shapes.
 * Shared borders get a gentle wiggle, identical on both sides.
 *
 * Run: node tools/genmap.js
 */
const fs = require('fs');
const path = require('path');

const WIDTH = 1000;
const HEIGHT = 1250;

// Deterministic random numbers, so the map is the same on every run
function rng(seed) {
    let s = seed >>> 0;
    return function () {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const CONTINENTS = [
    { id: 'nordhavn', name: 'Nordhavn', bonus: 3, cx: 440, cy: 225, rx: 270, ry: 160, seed: 11,
      regions: ['Frostgate', 'Ulvik', 'Skarholm', 'Mirefjord', 'Kaldvann'] },
    { id: 'ironreach', name: 'Ironreach', bonus: 2, cx: 822, cy: 470, rx: 140, ry: 200, seed: 23,
      regions: ['Anvil Peak', 'Rustmoor', 'Slagbridge', 'Coldforge'] },
    { id: 'ember', name: 'Ember Isles', bonus: 1, cx: 145, cy: 600, rx: 120, ry: 160, seed: 37,
      regions: ['Cinder Bay', 'Ashpoint', 'Kiln Rock'] },
    { id: 'verdant', name: 'Verdant', bonus: 3, cx: 490, cy: 680, rx: 210, ry: 175, seed: 41,
      regions: ['Hollow', 'Thornfield', 'Mossvale', 'Briarwood', 'Linden'] },
    { id: 'ashmarch', name: 'Ashmarch', bonus: 2, cx: 255, cy: 1050, rx: 220, ry: 155, seed: 53,
      regions: ['Dunmere', 'Saltwell', 'Graycliff', 'Ravensgate'] },
    { id: 'saltspire', name: 'Saltspire', bonus: 2, cx: 790, cy: 1045, rx: 160, ry: 165, seed: 67,
      regions: ['Tidewatch', 'Coralreach', 'Brinehold'] },
];

// Sea routes between continents: the closest pair of regions gets linked
const SEA_ROUTES = [
    ['nordhavn', 'ironreach'], ['nordhavn', 'ember'], ['nordhavn', 'verdant'],
    ['ironreach', 'verdant'], ['ironreach', 'saltspire'], ['ember', 'verdant'],
    ['ember', 'ashmarch'], ['verdant', 'ashmarch'], ['verdant', 'saltspire'],
    ['ashmarch', 'saltspire'],
];

// Blob outline: an ellipse with smooth bumps
function blob(c) {
    const r = rng(c.seed);
    const waves = [1, 2, 3, 5].map(k => ({ k, a: (0.08 + r() * 0.12) / Math.sqrt(k), p: r() * Math.PI * 2 }));
    const pts = [];
    const N = 72;
    for (let i = 0; i < N; i++) {
        const t = (i / N) * Math.PI * 2;
        let f = 1;
        waves.forEach(w => { f += w.a * Math.sin(w.k * t + w.p); });
        f += 0.02 * Math.sin(9 * t + c.seed) + 0.012 * Math.sin(17 * t + 2 * c.seed); // coastline texture
        pts.push([c.cx + Math.cos(t) * c.rx * f, c.cy + Math.sin(t) * c.ry * f]);
    }
    return pts;
}

function inside(poly, x, y) {
    let inn = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i], [xj, yj] = poly[j];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inn = !inn;
    }
    return inn;
}

function area(poly) {
    let a = 0;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) a += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
    return a / 2;
}

function centroid(poly) {
    let x = 0, y = 0, a = 0;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const f = poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
        x += (poly[j][0] + poly[i][0]) * f;
        y += (poly[j][1] + poly[i][1]) * f;
        a += f;
    }
    return [x / (3 * a), y / (3 * a)];
}

// Keep the part of `poly` closer to p than to q (Sutherland–Hodgman against the bisector)
function clipCloser(poly, p, q) {
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    const nx = q[0] - p[0], ny = q[1] - p[1];
    const side = pt => (pt[0] - mx) * nx + (pt[1] - my) * ny; // <= 0 means closer to p
    const out = [];
    for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length];
        const sa = side(a), sb = side(b);
        if (sa <= 0) out.push(a);
        if ((sa <= 0) !== (sb <= 0)) {
            const t = sa / (sa - sb);
            const pt = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
            pt.bisector = [p, q];
            out.push(pt);
        }
    }
    return out;
}

function voronoi(outline, seeds) {
    return seeds.map((s, i) => {
        let cell = outline.map(p => p.slice());
        seeds.forEach((o, j) => { if (j !== i) cell = clipCloser(cell, s, o); });
        return cell;
    });
}

// Seeds spread out inside the blob: random start + a few relaxation steps
function placeSeeds(outline, c) {
    const r = rng(c.seed * 7 + 1);
    const n = c.regions.length;
    let seeds = [];
    while (seeds.length < n) {
        const x = c.cx + (r() * 2 - 1) * c.rx * 0.8;
        const y = c.cy + (r() * 2 - 1) * c.ry * 0.8;
        if (inside(outline, x, y)) seeds.push([x, y]);
    }
    for (let it = 0; it < 3; it++) { // partial Lloyd relaxation keeps sizes uneven
        const cells = voronoi(outline, seeds);
        seeds = seeds.map((s, i) => {
            const c2 = centroid(cells[i]);
            return [s[0] + (c2[0] - s[0]) * 0.7, s[1] + (c2[1] - s[1]) * 0.7];
        });
    }
    return seeds;
}

// Which edges of each cell are shared with which neighbour
function sharedEdges(cells, seeds) {
    const onBisector = (pt, i, j) => {
        const p = seeds[i], q = seeds[j];
        const d1 = Math.hypot(pt[0] - p[0], pt[1] - p[1]);
        const d2 = Math.hypot(pt[0] - q[0], pt[1] - q[1]);
        return Math.abs(d1 - d2) < 0.01;
    };
    return cells.map((cell, i) => cell.map((a, k) => {
        const b = cell[(k + 1) % cell.length];
        for (let j = 0; j < cells.length; j++) {
            if (j === i) continue;
            if (onBisector(a, i, j) && onBisector(b, i, j) && Math.hypot(b[0] - a[0], b[1] - a[1]) > 1e-6) return j;
        }
        return -1;
    }));
}

// Wiggly line between a and b; identical whichever way round it is drawn
function wiggle(a, b, key) {
    const forward = a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
    const [s, e] = forward ? [a, b] : [b, a];
    const r = rng(key);
    const len = Math.hypot(e[0] - s[0], e[1] - s[1]);
    const nx = -(e[1] - s[1]) / len, ny = (e[0] - s[0]) / len;
    const steps = Math.max(2, Math.round(len / 14));
    const amp = Math.min(7, len * 0.08);
    const p1 = r() * 6.28, p2 = r() * 6.28;
    const pts = [];
    for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const off = amp * Math.sin(Math.PI * t) * (0.7 * Math.sin(2 * Math.PI * t + p1) + 0.5 * Math.sin(5 * Math.PI * t + p2));
        pts.push([s[0] + (e[0] - s[0]) * t + nx * off, s[1] + (e[1] - s[1]) * t + ny * off]);
    }
    return forward ? pts : pts.reverse();
}

const fmt = n => Math.round(n * 10) / 10;
const toPath = pts => 'M' + pts.map(p => fmt(p[0]) + ' ' + fmt(p[1])).join('L') + 'Z';

const regionsById = {};
const out = { width: WIDTH, height: HEIGHT, continents: [], seaRoutes: [] };

CONTINENTS.forEach((c, ci) => {
    const outline = blob(c);
    const seeds = placeSeeds(outline, c);
    const cells = voronoi(outline, seeds);
    const edges = sharedEdges(cells, seeds);

    const cont = {
        id: c.id, name: c.name, bonus: c.bonus,
        outline: toPath(outline),
        label: [c.cx, Math.min(...outline.map(p => p[1])) - 16].map(fmt),
        regions: [],
    };

    cells.forEach((cell, i) => {
        const id = c.id + '-' + i;
        const pts = [];
        const neighbours = new Set();
        cell.forEach((a, k) => {
            const b = cell[(k + 1) % cell.length];
            pts.push(a);
            const j = edges[i][k];
            if (j >= 0) {
                const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
                if (len > 6) neighbours.add(c.id + '-' + j);
                pts.push(...wiggle(a, b, (ci + 1) * 1000 + Math.min(i, j) * 31 + Math.max(i, j)));
            }
        });
        const ctr = centroid(cell);
        const region = {
            id, name: c.regions[i],
            path: toPath(pts),
            label: ctr.map(fmt),
            area: Math.round(Math.abs(area(cell))),
            neighbours: Array.from(neighbours),
        };
        regionsById[id] = region;
        cont.regions.push(region);
    });
    out.continents.push(cont);
});

// Sea routes: closest pair of regions between the two continents
SEA_ROUTES.forEach(([a, b]) => {
    const ca = out.continents.find(c => c.id === a);
    const cb = out.continents.find(c => c.id === b);
    let best = null;
    ca.regions.forEach(ra => cb.regions.forEach(rb => {
        const d = Math.hypot(ra.label[0] - rb.label[0], ra.label[1] - rb.label[1]);
        if (!best || d < best.d) best = { d, ra, rb };
    }));
    best.ra.neighbours.push(best.rb.id);
    best.rb.neighbours.push(best.ra.id);
    out.seaRoutes.push([best.ra.id, best.rb.id]);
});

// Sanity checks: every region has a neighbour, and the whole map is connected
const all = Object.values(regionsById);
all.forEach(r => { if (!r.neighbours.length) throw new Error('Region without neighbours: ' + r.id); });
const seen = new Set([all[0].id]);
const queue = [all[0].id];
while (queue.length) regionsById[queue.shift()].neighbours.forEach(n => { if (!seen.has(n)) { seen.add(n); queue.push(n); } });
if (seen.size !== all.length) throw new Error('Map is not connected');

const file = '// Generated by tools/genmap.js. Do not edit by hand; change the generator and run `node tools/genmap.js`.\n'
    + 'module.exports = ' + JSON.stringify(out) + ';\n';
fs.writeFileSync(path.join(__dirname, '..', 'src', 'mapdata.js'), file);

console.log(out.continents.map(c => `${c.name} (+${c.bonus}): ` + c.regions.map(r => `${r.name}[${r.area}] -> ${r.neighbours.length}`).join(', ')).join('\n'));
console.log('sea routes:', out.seaRoutes.length, 'regions:', all.length);
