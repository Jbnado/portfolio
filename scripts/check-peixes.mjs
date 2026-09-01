/**
 * Confere uma folha de sprites de peixes antes de ela entrar no jogo.
 *
 * Existe por causa de um defeito que se repetiu em varios lotes e que passa
 * despercebido a olho: a nadadeira caudal sai SEPARADA do corpo. O pedunculo,
 * que e a parte estreita entre o corpo e a cauda, tem um ou dois pixels nesta
 * escala, e o gerador perde-o. O peixe fica com a cauda a flutuar ao lado.
 *
 * A caixa delimitadora nao apanha isto, porque a peca solta cai dentro da
 * mesma caixa. Por isso a verificacao conta ILHAS de pixels opacos: um peixe
 * inteiro e uma ilha so.
 *
 * Uso: node scripts/check-peixes.mjs <folha.png> [nomes,separados,por,virgula]
 */
import sharp from 'sharp';

const CELULA = 64;

const [, , caminho, nomesArg] = process.argv;
if (!caminho) {
  console.error('uso: node scripts/check-peixes.mjs <folha.png> [nomes]');
  process.exit(1);
}

const { data, info } = await sharp(caminho).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const colunas = Math.round(info.width / CELULA);
const linhas = Math.round(info.height / CELULA);
const nomes = (nomesArg ?? '').split(',').filter(Boolean);

/** Pixels opacos ligados entre si, incluindo na diagonal. */
function ilhasDaCelula(cx, cy) {
  const visto = new Set();
  const opaco = (x, y) =>
    x >= 0 && x < CELULA && y >= 0 && y < CELULA &&
    data[((cy * CELULA + y) * info.width + cx * CELULA + x) * 4 + 3] > 128;

  const tamanhos = [];
  for (let y = 0; y < CELULA; y++) {
    for (let x = 0; x < CELULA; x++) {
      const k = y * CELULA + x;
      if (!opaco(x, y) || visto.has(k)) continue;
      let n = 0;
      const pilha = [[x, y]];
      visto.add(k);
      while (pilha.length) {
        const [px, py] = pilha.pop();
        n++;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          const nx = px + dx, ny = py + dy;
          const nk = ny * CELULA + nx;
          if (opaco(nx, ny) && !visto.has(nk)) { visto.add(nk); pilha.push([nx, ny]); }
        }
      }
      tamanhos.push(n);
    }
  }
  return tamanhos.sort((a, b) => b - a);
}

/** Caixa do que esta desenhado, para se ver se as formas variam entre si. */
function caixa(cx, cy) {
  let x0 = CELULA, x1 = -1, y0 = CELULA, y1 = -1;
  for (let y = 0; y < CELULA; y++) {
    for (let x = 0; x < CELULA; x++) {
      if (data[((cy * CELULA + y) * info.width + cx * CELULA + x) * 4 + 3] > 128) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  return x1 < 0 ? null : { w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

console.log(`\n${caminho} — ${info.width}x${info.height}, ${colunas}x${linhas} celulas de ${CELULA}\n`);

let problemas = 0;
let i = 0;
for (let cy = 0; cy < linhas; cy++) {
  for (let cx = 0; cx < colunas; cx++, i++) {
    const nome = nomes[i] ?? `celula ${i}`;
    const c = caixa(cx, cy);
    if (!c) { console.log(`${nome.padEnd(14)} VAZIA`); problemas++; continue; }

    const ilhas = ilhasDaCelula(cx, cy);
    // Ilha minuscula e sujeira; ilha grande e uma peca do peixe que se soltou.
    const soltas = ilhas.slice(1).filter((n) => n > 3);
    const sujeira = ilhas.slice(1).filter((n) => n <= 3).length;

    const aviso = soltas.length
      ? `  <-- ${soltas.length} peca(s) solta(s) de ${soltas.join(', ')} px`
      : sujeira ? `  <-- ${sujeira} pixel(s) de sujeira` : '';
    if (aviso) problemas++;

    console.log(`${nome.padEnd(14)} ${String(c.w).padStart(2)}x${String(c.h).padStart(2)}  ilhas: ${ilhas.length}${aviso}`);
  }
}

console.log(problemas ? `\n${problemas} celula(s) a corrigir.\n` : '\nTodas inteiras.\n');
process.exit(problemas ? 1 : 0);
