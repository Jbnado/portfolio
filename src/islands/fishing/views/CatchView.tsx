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
 * TODOS os degraus tem o clarao: e ele que diz "pegaste alguma coisa". Sem
 * ele, o comum era so um cartao a subir 18px, e o dono jogou e disse que nao
 * tinha visto animacao nenhuma. O que escala e o tamanho da luz e o que vem
 * depois dela — raios no raro, aura e giro no lendario.
 */
export function CatchView({ fish, cm, texts }: Props) {
  const rarity = rarityOf(fish);
  return (
    <div class="catch" data-rarity={rarity} style={{ '--catch-fish': fish.color }}>
      {/* Luz, raios e aura sao decoracao pura: o nome, o tamanho e a raridade
          estao no texto, e a regiao viva da casca ja anuncia a captura. */}
      <span class="catch-burst" aria-hidden="true" />
      {rarity !== 'comum' && <span class="catch-rays" aria-hidden="true" />}
      {rarity === 'lenda' && <span class="catch-aura" aria-hidden="true" />}

      <div class="catch-card">
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
