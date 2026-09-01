/**
 * Monta uma folha 384x64 a partir da imagem grande que o gerador devolve.
 *
 * A primeira versao cortava a fonte em seis fatias iguais, e isso quebrou:
 * a cauda de um peixe passa da fatia e entra na do vizinho, onde aparece
 * como caco solto e ainda estraga a caixa que decide a escala. Aqui os
 * peixes sao achados pela FORMA — componentes ligados — e nao pela posicao.
 *
 * Uso: node montar-lote.mjs <fonte.png> <saida.png> <l1,l2,...>
 *      onde cada valor e a largura, em pixels de 64, que aquele peixe deve
 *      ocupar. A altura sai da proporcao do desenho, nunca imposta.
 */
import sharp from 'sharp';

const CELULA = 64;
const [, , entrada, saida, largurasArg] = process.argv;
const larguras = largurasArg.split(',').map(Number);
const N = larguras.length;

const { data, info } = await sharp(entrada).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const at = (x, y) => (y * W + x) * 4;

// O xadrez que representa transparencia sai desenhado como pixel opaco, e a
// extracao que o gerador as vezes faz por conta propria deixa residuo de alfa
// baixo. Os dois somem aqui.
const neutroClaro = (i) =>
  data[i] >= 238 && data[i + 1] >= 238 && data[i + 2] >= 238 &&
  Math.abs(data[i] - data[i + 1]) <= 5 && Math.abs(data[i + 1] - data[i + 2]) <= 5;

const cheio = new Uint8Array(W * H);
for (let p = 0; p < W * H; p++) {
  const i = p * 4;
  cheio[p] = data[i + 3] >= 40 && !neutroClaro(i) ? 1 : 0;
}

/** Componentes ligados, incluindo na diagonal. */
const rotulo = new Int32Array(W * H).fill(-1);
const pecas = [];
for (let p0 = 0; p0 < W * H; p0++) {
  if (!cheio[p0] || rotulo[p0] >= 0) continue;
  const id = pecas.length;
  const peca = { id, area: 0, x0: W, x1: -1, y0: H, y1: -1 };
  const pilha = [p0];
  rotulo[p0] = id;
  while (pilha.length) {
    const p = pilha.pop();
    const x = p % W, y = (p / W) | 0;
    peca.area++;
    if (x < peca.x0) peca.x0 = x;
    if (x > peca.x1) peca.x1 = x;
    if (y < peca.y0) peca.y0 = y;
    if (y > peca.y1) peca.y1 = y;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
        const np = ny * W + nx;
        if (cheio[np] && rotulo[np] < 0) { rotulo[np] = id; pilha.push(np); }
      }
    }
  }
  pecas.push(peca);
}

// Os N maiores componentes sao os corpos. Todo o resto — uma nadadeira que se
// soltou, um ponto de sujeira — vai para o corpo mais proximo, e nao para o
// que calhar de partilhar a fatia.
const corpos = [...pecas].sort((a, b) => b.area - a.area).slice(0, N);
if (corpos.length < N) throw new Error(`achei so ${corpos.length} peixes de ${N}`);
corpos.sort((a, b) => (a.x0 + a.x1) - (b.x0 + b.x1));

const centro = (c) => [(c.x0 + c.x1) / 2, (c.y0 + c.y1) / 2];
const grupos = corpos.map((c) => ({ ...c, area: c.area }));
const dono = new Int32Array(pecas.length).fill(-1);
corpos.forEach((c, g) => { dono[c.id] = g; });

for (const peca of pecas) {
  if (dono[peca.id] >= 0) continue;
  if (peca.area < 4) continue; // sujeira solta, nao pertence a ninguem
  const [px, py] = centro(peca);
  let melhor = 0, dist = Infinity;
  grupos.forEach((g, i) => {
    const [gx, gy] = centro(g);
    const d = Math.hypot(px - gx, (py - gy) * 0.5);
    if (d < dist) { dist = d; melhor = i; }
  });
  dono[peca.id] = melhor;
  const g = grupos[melhor];
  g.x0 = Math.min(g.x0, peca.x0); g.x1 = Math.max(g.x1, peca.x1);
  g.y0 = Math.min(g.y0, peca.y0); g.y1 = Math.max(g.y1, peca.y1);
}

// Recorta cada grupo para um PNG proprio, com o que nao lhe pertence apagado.
const camadas = [];
for (let g = 0; g < N; g++) {
  const { x0, x1, y0, y1 } = grupos[g];
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const buf = Buffer.alloc(w * h * 4, 0);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y + y0) * W + (x + x0);
      if (!cheio[p] || dono[rotulo[p]] !== g) continue;
      const i = p * 4, o = (y * w + x) * 4;
      buf[o] = data[i]; buf[o + 1] = data[i + 1]; buf[o + 2] = data[i + 2]; buf[o + 3] = 255;
    }
  }

  let tw = larguras[g];
  let th = Math.round(h * (tw / w));
  if (th > 60) { th = 60; tw = Math.round(w * (th / h)); }
  console.log(`peixe ${g}: fonte ${w}x${h} -> ${tw}x${th}`);

  const pequeno = await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
    .resize(tw, th, { kernel: 'nearest' })
    .png()
    .toBuffer();

  camadas.push({
    input: pequeno,
    left: g * CELULA + ((CELULA - tw) >> 1),
    top: (CELULA - th) >> 1,
  });
}

await sharp({
  create: { width: CELULA * N, height: CELULA, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
}).composite(camadas).png().toFile(saida);

console.log(`escrito ${saida}`);
