import { useEffect, useRef, useState } from 'preact/hooks';
import {
  SPOTS, SHOP_X, SHORE_TO, BOAT_START, REACH, WORLD_MAX,
  cameraAt, depthAt, moveBoat, spotUnder, atShop, type Depth,
} from '../world';
import './WorldView.css';

/** Quantas unidades de mundo cabem na tela. O resto do lago fica fora e vai
    aparecendo conforme o barco anda — e o que da a sensacao de viagem num
    mapa que, de proposito, e pequeno. */
const VIEW_W = 44;

/** Blocos de fundo, em unidades de mundo. Espelham world.ts de proposito:
    aqui e so desenho, la e a regra. */
const BANDS: { depth: Depth; from: number; to: number }[] = [
  { depth: 'raso', from: SHORE_TO, to: 44 },
  { depth: 'medio', from: 44, to: 72 },
  { depth: 'abissal', from: 72, to: WORLD_MAX },
];

type Props = {
  boat: number;
  texts: { shop: string; cast: string; noSpot: string; depth: Record<string, string> };
};

export function WorldView({ boat, texts }: Props) {
  const cam = cameraAt(boat, VIEW_W);
  /** Unidade de mundo -> porcentagem da tela. */
  const sx = (x: number) => ((x - cam) / VIEW_W) * 100;

  const spot = spotUnder(boat);
  const naLoja = atShop(boat);
  const fundo = depthAt(boat);

  return (
    <div class="world">
      <div class="world-view">
        <div class="world-sky" />

        {BANDS.map((b) => (
          <div
            key={b.depth}
            class="world-water"
            data-depth={b.depth}
            style={{ left: `${sx(b.from)}%`, width: `${((b.to - b.from) / VIEW_W) * 100}%` }}
          />
        ))}

        {/* A margem esquerda, com a loja. Quadrado mesmo. */}
        <div class="world-shore" style={{ left: `${sx(0)}%`, width: `${(SHORE_TO / VIEW_W) * 100}%` }} />
        <div
          class="world-shop"
          data-near={String(naLoja)}
          style={{ left: `${sx(SHOP_X)}%`, width: `${(5 / VIEW_W) * 100}%` }}
        />

        {/* Pontos de pesca: a marca fina sobre a agua. */}
        {SPOTS.map((s) => (
          <div
            key={s.id}
            class="world-spot"
            data-here={String(spot?.id === s.id)}
            style={{ left: `${sx(s.x)}%`, width: `${((REACH * 2) / VIEW_W) * 100}%` }}
          />
        ))}

        <div
          class="world-boat"
          style={{ left: `${sx(boat)}%`, width: `${((REACH * 1.7) / VIEW_W) * 100}%` }}
        />
      </div>

      <p class="world-hud">
        <span class="world-depth" data-depth={fundo}>{texts.depth[fundo]}</span>
        <span class="world-hint">
          {naLoja ? texts.shop : spot ? texts.cast : texts.noSpot}
        </span>
      </p>
    </div>
  );
}

/** Andar e um estado continuo, nao um evento por tecla: segurar a seta move.
    Fica aqui e nao na casca porque e a unica coisa da navegacao que precisa
    de laco de quadro. Devolve a posicao do barco. */
export function useBoat(active: boolean): number {
  const [boat, setBoat] = useState(BOAT_START);
  const dirRef = useRef(0);

  useEffect(() => {
    if (!active) { dirRef.current = 0; return; }

    const dirOf = (code: string) =>
      code === 'ArrowRight' || code === 'KeyD' ? 1 : code === 'ArrowLeft' || code === 'KeyA' ? -1 : 0;

    const down = (ev: KeyboardEvent) => {
      const d = dirOf(ev.code);
      if (d) { ev.preventDefault(); dirRef.current = d; }
    };
    const up = (ev: KeyboardEvent) => {
      // So zera se a tecla solta e a que esta mandando: soltar a esquerda
      // enquanto a direita esta pressionada nao pode parar o barco.
      if (dirOf(ev.code) === dirRef.current) dirRef.current = 0;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);

    let raf = 0;
    let previous = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(50, now - previous);
      previous = now;
      if (dirRef.current) setBoat((x) => moveBoat(x, dirRef.current, dt));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [active]);

  return boat;
}
