import { rarityOf, type Kind } from '../shop';
import type { Fish } from '../types';
import './CatchView.css';

type Props = {
  fish: Fish;
  cm: number;
  /** Nome da especie e o rotulo da raridade, ja no idioma da pagina. */
  texts: { name: string; rarity: Record<Kind, string> };
};

/**
 * A revelacao da fisgada. Uma vista so para as tres raridades: o que muda e o
 * `data-rarity`, e a partir dele o CSS decide quanto tempo a coisa dura, se
 * ha raios atras e se ha aura. Tres componentes separados divergiriam na
 * primeira mudanca de layout.
 *
 * A escalada e proposital e e a unica coisa que diz, sem texto, que o peixe
 * que acabou de morder e diferente: comum sobe e assenta; raro entra com
 * raios; lendario ganha aura por cima disso.
 */
export function CatchView({ fish, cm, texts }: Props) {
  const rarity = rarityOf(fish);
  return (
    <div class="catch" data-rarity={rarity}>
      {/* Raios e aura sao decoracao pura: o nome, o tamanho e a raridade
          estao no texto, e a regiao viva da casca ja anuncia a captura. */}
      {rarity !== 'comum' && <span class="catch-rays" aria-hidden="true" />}
      {rarity === 'lenda' && <span class="catch-aura" aria-hidden="true" />}

      <div class="catch-card" style={{ '--catch-fish': fish.color }}>
        {/* Lugar guardado para o desenho do peixe. Por enquanto e o bloco de
            cor da especie, o mesmo que o minigame usa. */}
        <span class="catch-pic" aria-hidden="true" />
        <strong class="catch-name">{texts.name}</strong>
        <span class="catch-size">{cm} cm</span>
        <span class="catch-tag">{texts.rarity[rarity]}</span>
      </div>
    </div>
  );
}
