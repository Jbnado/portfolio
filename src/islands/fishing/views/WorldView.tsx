import type preact from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import {
  SPOTS, SHOP_X, SHORE_TO, BOAT_START, REACH, WORLD_MAX, TIER_BY_DEPTH,
  cameraAt, depthAt, moveBoat, spotUnder, atShop, type Depth,
} from '../world';
import './WorldView.css';

/** Quantas unidades de mundo cabem na tela. O resto do lago fica fora e vai
    aparecendo conforme o barco anda — e o que da a sensacao de viagem num
    mapa que, de proposito, e pequeno. */
const VIEW_W = 44;

const BANDS: { depth: Depth; from: number; to: number }[] = [
  { depth: 'raso', from: SHORE_TO, to: 44 },
  { depth: 'medio', from: 44, to: 72 },
  { depth: 'abissal', from: 72, to: WORLD_MAX },
];

type Props = {
  boat: number;
  reach: 1 | 2 | 3;
  /** Clicar no mundo navega ate la. E o que torna o jogo jogavel so com o
      mouse — antes o ponteiro nao fazia nada dentro da cena. */
  onSailTo: (x: number) => void;
  texts: {
    shop: string; cast: string; noSpot: string; needLine: string;
    clickHint: string; turnPhone: string; depth: Record<string, string>;
  };
  /** A caixa de fala do tutorial entra AQUI DENTRO, sobre a cena — e a
      convencao de novel, e faz a fala pertencer ao lago em vez de ficar
      solta no rodape da pagina. */
  children?: preact.ComponentChildren;
};

/** Cenario do fundo: morros e mata da outra margem. Sao so blocos, mas em
    posicoes irregulares — fila regular le como cerca, nao como paisagem. */
const FUNDO = [
  { x: 6, w: 14, h: 46 }, { x: 21, w: 9, h: 30 }, { x: 33, w: 18, h: 54 },
  { x: 49, w: 11, h: 34 }, { x: 62, w: 16, h: 62 }, { x: 80, w: 12, h: 40 },
  { x: 93, w: 15, h: 50 },
];

/** O fundo anda MENOS que a cena: e o parallax que da profundidade. Sem ele
    tudo desliza junto e a paisagem parece colada no barco. */
const PARALLAX = 0.35;

export function WorldView({ boat, reach, onSailTo, texts, children }: Props) {
  const cam = cameraAt(boat, VIEW_W);
  const sx = (x: number) => ((x - cam) / VIEW_W) * 100;
  const sxFar = (x: number) => ((x - cam * PARALLAX) / VIEW_W) * 100;

  const spot = spotUnder(boat);
  const naLoja = atShop(boat);
  const fundo = depthAt(boat);
  const podePescar = TIER_BY_DEPTH[fundo] <= reach;

  const visiveis = SPOTS.filter((s) => TIER_BY_DEPTH[depthAt(s.x)] <= reach);

  return (
    <div class="world">
      <div class="world-view">
        <div class="world-sky" />

        {/* A outra margem, la longe. */}
        {FUNDO.map((m, i) => (
          <div
            key={i}
            class="world-far"
            style={{ left: `${sxFar(m.x)}%`, width: `${(m.w / VIEW_W) * 100}%`, height: `${m.h * 0.18}%` }}
          />
        ))}

        {/* A linha d'agua. E ela que separa o longe do perto. */}
        <div class="world-horizon" />

        {BANDS.map((b) => (
          <div
            key={b.depth}
            class="world-water"
            data-depth={b.depth}
            data-locked={String(TIER_BY_DEPTH[b.depth] > reach)}
            style={{ left: `${sx(b.from)}%`, width: `${((b.to - b.from) / VIEW_W) * 100}%` }}
          />
        ))}

        <div class="world-shore" style={{ left: `${sx(0)}%`, width: `${(SHORE_TO / VIEW_W) * 100}%` }} />

        {/* Loja e marcas sao BOTOES de verdade: clicaveis com mouse, focaveis
            por teclado, e com o mesmo destino do teclado. Um alvo que so o
            teclado alcanca nao existe para metade das pessoas. */}
        <button
          type="button"
          class="world-hot world-shop"
          data-near={String(naLoja)}
          style={{ left: `${sx(SHOP_X)}%`, width: `${(5 / VIEW_W) * 100}%` }}
          onClick={() => onSailTo(SHOP_X)}
          aria-label={texts.shop}
        >
          <span class="world-tag" aria-hidden="true">{texts.shop}</span>
        </button>

        {visiveis.map((s) => (
          <button
            type="button"
            key={s.id}
            class="world-hot world-spot"
            data-here={String(spot?.id === s.id)}
            style={{ left: `${sx(s.x)}%`, width: `${((REACH * 2) / VIEW_W) * 100}%` }}
            onClick={() => onSailTo(s.x)}
            aria-label={texts.cast}
          >
            {/* Anel pulsante: a pista de que da para clicar. Sem ele nada na
                cena se anuncia como interativo. */}
            <span class="world-ping" aria-hidden="true" />
          </button>
        ))}

        <div
          class="world-boat"
          style={{ left: `${sx(boat)}%`, width: `${((REACH * 1.7) / VIEW_W) * 100}%` }}
        />

        <p class="world-turn">{texts.turnPhone}</p>

        {children}
      </div>

      <p class="world-hud">
        <span class="world-depth" data-depth={fundo}>{texts.depth[fundo]}</span>
        <span class="world-hint">
          {naLoja ? texts.shop : !podePescar ? texts.needLine : spot ? texts.cast : texts.clickHint}
        </span>
      </p>
    </div>
  );
}

/** Controles sempre visiveis. Nao sao "controles de toque": sao a interface
    de MOUSE tambem. Quem chega com ponteiro precisa ver onde clicar, e uma
    fileira de botoes e a resposta mais direta.

    A pokedex mora aqui, com contador, porque colecao escondida atras de uma
    tecla nao existe para quem nao adivinha a tecla. */
export function WorldPad({ setDir, onAct, onLog, actLabel, actEnabled, logLabel, keys }: {
  setDir: (d: number) => void;
  onAct: () => void;
  onLog: () => void;
  actLabel: string;
  actEnabled: boolean;
  logLabel: string;
  /** A tecla de cada botao vai NO botao. Legenda solta no rodape ninguem le:
      a dica precisa estar onde a acao esta. */
  keys: { move: string; act: string; log: string };
}) {
  // Segurar move; soltar para. `onPointerUp` no proprio botao nao basta: se o
  // ponteiro escorregar para fora antes de soltar, o botao nunca ve o evento
  // e o barco fica andando sozinho. Por isso a soltura escuta na janela.
  const segura = (d: number) => (ev: PointerEvent) => {
    ev.preventDefault();
    setDir(d);
    const solta = () => {
      setDir(0);
      window.removeEventListener('pointerup', solta);
      window.removeEventListener('pointercancel', solta);
    };
    window.addEventListener('pointerup', solta);
    window.addEventListener('pointercancel', solta);
  };

  return (
    <div class="world-pad">
      <div class="world-pad-move">
        <button type="button" class="world-pad-btn" aria-label="←" onPointerDown={segura(-1)}>
          &#9664;<kbd class="key">{keys.move}</kbd>
        </button>
        <button type="button" class="world-pad-btn" aria-label="→" onPointerDown={segura(1)}>
          &#9654;
        </button>
      </div>
      <button type="button" class="world-pad-act" onClick={onAct} disabled={!actEnabled}>
        {actLabel}<kbd class="key">{keys.act}</kbd>
      </button>
      <button type="button" class="world-pad-btn world-pad-log" onClick={onLog}>
        {logLabel}<kbd class="key">{keys.log}</kbd>
      </button>
    </div>
  );
}

/** Andar e um estado continuo: segurar a seta move. Devolve tambem `sailTo`,
    para o clique no mundo navegar sozinho ate o destino — e `setDir`, para o
    dedo e a tecla. Tres entradas, um laco so. */
export function useBoat(active: boolean): {
  boat: number;
  setDir: (d: number) => void;
  sailTo: (x: number) => void;
} {
  const [boat, setBoat] = useState(BOAT_START);
  const dirRef = useRef(0);
  const alvoRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) { dirRef.current = 0; alvoRef.current = null; return; }

    const dirOf = (code: string) =>
      code === 'ArrowRight' || code === 'KeyD' ? 1 : code === 'ArrowLeft' || code === 'KeyA' ? -1 : 0;

    const down = (ev: KeyboardEvent) => {
      const d = dirOf(ev.code);
      // Mexer na mao CANCELA o destino: quem pegou o leme quer o leme.
      if (d) { ev.preventDefault(); dirRef.current = d; alvoRef.current = null; }
    };
    const up = (ev: KeyboardEvent) => {
      if (dirOf(ev.code) === dirRef.current) dirRef.current = 0;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);

    let raf = 0;
    let previous = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(50, now - previous);
      previous = now;
      setBoat((x) => {
        if (dirRef.current) return moveBoat(x, dirRef.current, dt);
        const alvo = alvoRef.current;
        if (alvo === null) return x;
        const falta = alvo - x;
        // Chegou: para no ponto exato em vez de oscilar em volta dele.
        if (Math.abs(falta) < 0.6) { alvoRef.current = null; return alvo; }
        return moveBoat(x, Math.sign(falta), dt);
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [active]);

  const setDir = useCallback((d: number) => {
    dirRef.current = d;
    if (d) alvoRef.current = null;
  }, []);
  const sailTo = useCallback((x: number) => { alvoRef.current = x; }, []);

  return { boat, setDir, sailTo };
}
