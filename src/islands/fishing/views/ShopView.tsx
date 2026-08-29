import { useEffect, useState } from 'preact/hooks';
import {
  LINES, LINE_PRICE, BAITS, buyBait, buyLine, equipBait, equipLine, sellAll, holdValue,
  type BaitId, type LineId, type Progress,
} from '../shop';
import './ShopView.css';

type Props = {
  progress: Progress;
  onChange: (p: Progress) => void;
  onClose: () => void;
  texts: {
    title: string; coins: string; sell: string; nothingToSell: string;
    line: string; equip: string; equipped: string;
    close: string; choose: string; act: string;
    /** As teclas vao em cracha DENTRO do painel, uma por acao. A versao
        anterior tinha uma frase solta no rodape ("setas escolhem, espaco
        age") — o formato que o dono ja tinha recusado no mundo, e que aqui
        ainda por cima nao dizia que Esc fecha. */
    keyClose: string; keyPick: string; keyAct: string;
    depth: Record<string, string>; baitName: Record<string, string>;
  };
};

type Item = { rotulo: string; detalhe: string; podeAgir: boolean; agir: () => void };

export function ShopView({ progress, onChange, onClose, texts }: Props) {
  const [sel, setSel] = useState(0);
  const valor = holdValue(progress.hold);

  /** Um item por coisa comprável. Se ainda não tem, o preço; se tem mas não
      está na vara, "equipar"; se está, "equipada". Uma linha por estado. */
  const doDono = (
    rotulo: string, preco: number, tem: boolean, posto: boolean,
    comprar: () => Progress, equipar: () => Progress,
  ): Item => ({
    rotulo,
    detalhe: posto ? texts.equipped : tem ? texts.equip : `${preco}`,
    podeAgir: posto ? false : tem ? true : progress.coins >= preco,
    agir: () => onChange(tem ? equipar() : comprar()),
  });

  const itens: Item[] = [
    {
      rotulo: `${texts.sell} (${progress.hold.length})`,
      detalhe: valor > 0 ? `+${valor}` : texts.nothingToSell,
      podeAgir: valor > 0,
      agir: () => onChange(sellAll(progress)),
    },
    ...LINES.map((d: LineId) =>
      doDono(
        `${texts.line} — ${texts.depth[d]}`, LINE_PRICE[d],
        progress.lines.includes(d), progress.line === d,
        () => buyLine(progress, d), () => equipLine(progress, d),
      ),
    ),
    ...BAITS.map((b) =>
      doDono(
        texts.baitName[b.id], b.price,
        progress.baits.includes(b.id), progress.bait === b.id,
        () => buyBait(progress, b.id as BaitId), () => equipBait(progress, b.id as BaitId),
      ),
    ),
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
          <li
            key={item.rotulo}
            class="shop-item"
            data-sel={String(i === sel)}
            data-off={String(!item.podeAgir)}
            onClick={() => { setSel(i); if (item.podeAgir) item.agir(); }}
          >
            <span class="shop-mark" aria-hidden="true" />
            <span class="shop-name">{item.rotulo}</span>
            <span class="shop-price">{item.detalhe}</span>
          </li>
        ))}
      </ul>

      <p class="shop-foot">
        <button class="shop-close" onClick={onClose}>
          {texts.close}<kbd class="key">{texts.keyClose}</kbd>
        </button>
        <span class="shop-keys">
          <kbd class="key">{texts.keyPick}</kbd>{texts.choose}
          <kbd class="key">{texts.keyAct}</kbd>{texts.act}
        </span>
      </p>
    </div>
  );
}
