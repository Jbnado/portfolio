// Gera public/og-image.png (1200×630) — card de preview social no visual
// "terminal CRT" do site. Rode com: node scripts/gen-og.mjs
import sharp from 'sharp';

const W = 1200;
const H = 630;

const mono =
  "'JetBrains Mono','DejaVu Sans Mono','Consolas','Liberation Mono','Courier New',monospace";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="78%" cy="18%" r="60%">
      <stop offset="0%" stop-color="#61ffca" stop-opacity="0.14"/>
      <stop offset="60%" stop-color="#61ffca" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#61ffca" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="7" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="#0a0f0c"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- prompt -->
  <text x="80" y="150" font-family="${mono}" font-size="30" fill="#42f59b">jbnado@rp:~$ whoami</text>

  <!-- nome (output) -->
  <text x="76" y="300" font-family="${mono}" font-size="104" font-weight="700" fill="#61ffca" filter="url(#soft)">João Bernardo</text>

  <!-- papel -->
  <text x="80" y="372" font-family="${mono}" font-size="34" fill="#7cf5ad">&gt; fullstack developer · Ribeirão Preto, BR</text>

  <!-- status -->
  <text x="80" y="446" font-family="${mono}" font-size="28" fill="#42f59b">● active (running) — aberto a projetos</text>

  <!-- stack -->
  <text x="80" y="506" font-family="${mono}" font-size="24" fill="#4fbf85">React · Node.js · TypeScript · Java · Python · AWS</text>

  <!-- statusline no rodapé -->
  <rect x="0" y="586" width="${W}" height="44" fill="#42f59b"/>
  <text x="28" y="616" font-family="${mono}" font-size="24" font-weight="700" fill="#06120b">jbnado@rp:~$ ./hire-me.sh</text>
  <text x="${W - 28}" y="616" text-anchor="end" font-family="${mono}" font-size="24" font-weight="700" fill="#06120b">jbnado.dev</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og-image.png');
console.log('og-image.png gerado (1200x630)');
