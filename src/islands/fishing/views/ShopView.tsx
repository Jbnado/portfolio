import { useEffect, useState } from 'preact/hooks';
import type { Depth } from '../world';
import {
  LINE_PRICE, BAIT_PRICE, BAIT_PACK, buyBait, buyLine, sellAll, hasLine, holdValue,
  type Progress,
} from '../shop';
import './ShopView.css';

type Props = {
  progress: Progress;
  onChange: (p: Progress) => void;
  onClose: () => void;
  texts: {
    title: string; coins: string; sell: string; nothingToSell: string;
    line: string; owned: string; bait: string; inStock: string;
    close: string; help: string; depth: Record<string, string>;
  };
};

const DEPTHS: Depth[] = ['raso', 'medio', 'abissal'];

export function ShopView({ progress, onChange, onClose, texts }: Props) {
  const [sel, setSel] = useState(0);

  const valor = holdValue(progress.hold);
  const itens = [
    {
      rotulo: `${texts.sell} (${progress.hold.length})`,
      detalhe: valor > 0 ? `+${valor}` : texts.nothingToSell,
      podeAgir: valor > 0,
      agir: () => onChange(sellAll(progress)),
    },
    ...DEPTHS.map((d) => ({
      rotulo: `${texts.line} — ${texts.depth[d]}`,
      detalhe: hasLine(progress, d) ? texts.owned : `${LINE_PRICE[d]}`,
      podeAgir: !hasLine(progress, d) && progress.coins >= LINE_PRICE[d],
      agir: () => onChange(buyLine(progress, d)),
    })),
    {
      rotulo: `${texts.bait} (+${BAIT_PACK})`,
      detalhe: `${BAIT_PRICE}`,
      podeAgir: progress.coins >= BAIT_PRICE,
      agir: () => onChange(buyBait(progress)),
    },
  ];

  useEffect(() => {
    // Fase de CAPTURA: a casca tambem ouve Espaco e Esc na window, e sem isto
    // o mesmo toque compraria aqui e lancaria a linha la fora. Capturar roda
    // antes, e parar a propagacao imediata impede o segundo dono da tecla.
    const onKey = (ev: KeyboardEvent) => {
      const teclas = ['ArrowUp', 'ArrowDown', 'KeyW', 'KeyS', 'Space', 'Escape'];
      if (!teclas.includes(ev.code)) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if (ev.code === 'Escape') { onClose(); return; }
      if (ev.code === 'ArrowUp' || ev.code === 'KeyW') { setSel((i) => (i + itens.length - 1) % itens.length); return; }
      if (ev.code === 'ArrowDown' || ev.code === 'KeyS') { setSel((i) => (i + 1) % itens.length); return; }
      const item = itens[sel];
      if (item?.podeAgir) item.agir();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [sel, itens.length, progress, onChange, onClose]);

  return (
    <div class="shop" role="dialog" aria-modal="true" aria-label={texts.title}>
      <header class="shop-head">
        <h3>{texts.title}</h3>
        <span class="shop-coins">{texts.coins}: {progress.coins}</span>
      </header>

      <ul class="shop-list">
        {itens.map((item, i) => (
          <li key={item.rotulo} class="shop-item" data-sel={String(i === sel)} data-off={String(!item.podeAgir)}>
            <span class="shop-mark" aria-hidden="true" />
            <span class="shop-name">{item.rotulo}</span>
            <span class="shop-price">{item.detalhe}</span>
          </li>
        ))}
      </ul>

      <p class="shop-foot">
        <span>{texts.inStock}: {progress.bait}</span>
        <span>{texts.help}</span>
      </p>
    </div>
  );
}
