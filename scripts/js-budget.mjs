// Orcamento de JS por PAGINA, nao por pasta.
//
// A metrica antiga somava todos os dist/_astro/*.js, o que incluia chunks que
// so uma rota usa (o BlogFeed, por exemplo) e portanto nunca correspondeu ao
// que um visitante baixa. Esta aqui segue os imports a partir do HTML de cada
// pagina e soma o fecho transitivo — o numero que o navegador realmente puxa.
//
// Dois orcamentos separados de proposito: o site precisa continuar leve, e o
// jogo cresce (loja, mapa, barco). Somar os dois faria o jogo pesar contra
// paginas que nem o carregam.
import { readFileSync, existsSync } from 'node:fs';

const BUDGETS = [
  { nome: 'site (home)', html: 'dist/index.html', capKB: 32 },
  { nome: 'pagina do jogo', html: 'dist/jogo/pesca/index.html', capKB: 80 },
];

function closure(html) {
  const seen = new Set();
  const queue = [...readFileSync(html, 'utf8').matchAll(/\/_astro\/[\w.-]+\.js/g)].map((m) => m[0]);
  let total = 0;
  while (queue.length) {
    const ref = queue.pop();
    if (seen.has(ref)) continue;
    seen.add(ref);
    const file = 'dist' + ref;
    if (!existsSync(file)) continue;
    const src = readFileSync(file, 'utf8');
    total += Buffer.byteLength(src);
    for (const m of src.matchAll(/["'](?:\.\.?\/(?:_astro\/)?)([\w.-]+\.js)["']/g)) {
      queue.push('/_astro/' + m[1]);
    }
  }
  return { total, count: seen.size };
}

let falhou = false;
for (const b of BUDGETS) {
  if (!existsSync(b.html)) { console.log(`- ${b.nome}: ${b.html} nao existe (rode pnpm build)`); continue; }
  const { total, count } = closure(b.html);
  const kb = total / 1024;
  const ok = kb <= b.capKB;
  if (!ok) falhou = true;
  console.log(
    `${ok ? 'ok  ' : 'ESTOUROU'} ${b.nome.padEnd(16)} ${kb.toFixed(1).padStart(6)} KB de ${b.capKB} KB` +
    `  (${count} arquivos, folga ${(b.capKB * 1024 - total).toFixed(0)} bytes)`,
  );
}
process.exit(falhou ? 1 : 0);
