import type preact from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import {
  SPOTS, SHOP_X, SHORE_TO, BOAT_START, REACH, WORLD_MAX, TIER_BY_DEPTH,
  cameraAt, depthAt, moveBoat, spotUnder, atShop, facingAfter, type Depth,
} from '../world';
import './WorldView.css';

/** Quantas unidades de mundo cabem na tela. O resto do lago fica fora e vai
    aparecendo conforme o barco anda — e o que da a sensacao de viagem num
    mapa que, de proposito, e pequeno. */
const VIEW_W = 44;

/* As fronteiras das faixas (raso 8-44, medio 44-72, abissal 72-100) ja nao
   vivem aqui: a agua e um gradiente unico e as paradas dele estao no CSS, em
   percentagem do lago. Quem manda na REGRA de profundidade continua a ser
   `depthAt` no world.ts — isto aqui era so pintura. */

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
  /** Quadro da folha do pescador: 0 parado, 1 levantando, 2 lancado, 3 na
      luta. Quem decide e a fase do jogo — a vista so desenha. */
  frame: 0 | 1 | 2 | 3;
  /** Multiplicador do vulto que se aproxima na agua, ou `null` fora da
      espera. Sai do tamanho da especie ja sorteada. */
  shadow: number | null;
  /** Para que lado o pescador olha: 1 direita, -1 esquerda. O desenho e
      virado para a direita, entao sem isto andar para a esquerda dava re. */
  facing: 1 | -1;
  /** Fora de `idle` o lago nao aceita ordens. Os alvos ficam desabilitados de
      verdade, e nao so inertes: um botao com cara de vivo que nao faz nada e
      pior do que botao nenhum, e ainda por cima o teclado continuaria a
      alcanca-lo por Tab. */
  paused: boolean;
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

export function WorldView({ boat, reach, onSailTo, texts, frame, shadow, facing, paused, children }: Props) {
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
            style={{ left: `${sxFar(m.x)}%`, width: `${(m.w / VIEW_W) * 100}%`, height: `${m.h * 0.3}%` }}
          />
        ))}

        {/* A linha d'agua. E ela que separa o longe do perto. */}
        <div class="world-horizon" />

        {/* UMA agua, nao tres. Eram tres divs, uma por faixa, cada uma com o
            seu gradiente a dissolver-se nas pontas — mas as faixas tem
            larguras muito diferentes (36, 28 e 28 unidades de mundo), entao
            "dissolver nos 18% da ponta" dava comprimentos de transicao
            diferentes em cada costura, e nenhuma delas suave. Um gradiente
            unico sobre o lago inteiro nao tem costura para suavizar. */}
        <div
          class="world-water"
          style={{
            left: `${sx(SHORE_TO)}%`,
            width: `${((WORLD_MAX - SHORE_TO) / VIEW_W) * 100}%`,
          }}
        />

        <div class="world-shore" style={{ left: `${sx(0)}%`, width: `${(SHORE_TO / VIEW_W) * 100}%` }} />

        {/* Loja e marcas sao BOTOES de verdade: clicaveis com mouse, focaveis
            por teclado, e com o mesmo destino do teclado. Um alvo que so o
            teclado alcanca nao existe para metade das pessoas. */}
        <button
          type="button"
          class="world-hot world-shop"
          disabled={paused}
          data-near={String(naLoja)}
          /* So a posicao vem daqui. A largura passou a ser px em degraus, no
             CSS, porque a loja e pixel art e so fica nitida em multiplo
             inteiro — o mesmo que ja vale para o barco. */
          style={{ left: `${sx(SHOP_X)}%` }}
          onClick={() => onSailTo(SHOP_X)}
          aria-label={texts.shop}
        >
          <span class="world-tag" aria-hidden="true">{texts.shop}</span>
        </button>

        {visiveis.map((s, i) => (
          <button
            type="button"
            key={s.id}
            class="world-hot world-spot"
            disabled={paused}
            data-here={String(spot?.id === s.id)}
            /* O atraso vem do indice: sem ele as tres sombras passavam em
               unissono e o lago parecia um semaforo. */
            style={{ left: `${sx(s.x)}%`, width: `${((REACH * 2) / VIEW_W) * 100}%`, '--atraso': `${i * 2.7}s` }}
            onClick={() => onSailTo(s.x)}
            aria-label={texts.cast}
          >
            {/* Bolhas de verdade, e nao gradientes no fundo do botao: cada uma
                precisa subir no seu proprio tempo, e uma camada de fundo so
                sabe mover-se inteira. Sao elas que dizem "ha peixe aqui" — e
                a ausencia delas, mais adiante, e que diz que ali nao ha. */}
            <span class="world-bolha" aria-hidden="true" />
            <span class="world-bolha" aria-hidden="true" />
            <span class="world-bolha" aria-hidden="true" />
          </button>
        ))}

        {/* O vulto vem ANTES do barco na ordem do documento, entao fica por
            baixo dele: e uma sombra sob a agua, nao um adesivo na proa. */}
        {shadow !== null && (
          <div
            class="world-shadow"
            aria-hidden="true"
            style={{ left: `${sx(boat) + 14}%`, '--vulto': shadow }}
          />
        )}

        {/* Largura ja nao sai de REACH: pixel art so fica nitida em multiplos
            inteiros do pixel de origem, entao o tamanho vem em degraus do CSS
            e a cena continua fluida em volta. */}
        <div
          class="world-boat"
          data-frame={frame}
          style={{ left: `${sx(boat)}%`, '--olha': facing }}
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
  /** A tecla de cada botao vai NO botao — UMA tecla por botao. O cracha era
      "A D" e ia so na seta da esquerda, entao a esquerda anunciava as duas
      teclas e a direita nenhuma. */
  keys: { left: string; right: string; act: string; log: string };
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
          &#9664;<kbd class="key">{keys.left}</kbd>
        </button>
        <button type="button" class="world-pad-btn" aria-label="→" onPointerDown={segura(1)}>
          &#9654;<kbd class="key">{keys.right}</kbd>
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
  facing: 1 | -1;
  setDir: (d: number) => void;
  sailTo: (x: number) => void;
} {
  const [boat, setBoat] = useState(BOAT_START);
  const dirRef = useRef(0);
  const alvoRef = useRef<number | null>(null);

  /** Para onde o pescador olha. Sai da posicao e nao de `dirRef`, que zera no
      keyup: derivado da tecla, ele voltaria a olhar para a direita toda vez
      que se soltasse o A. Vale tambem para o clique no mundo, que move sem
      tecla nenhuma. */
  const [facing, setFacing] = useState<1 | -1>(1);
  const anteriorRef = useRef(BOAT_START);
  useEffect(() => {
    setFacing((f) => facingAfter(f, boat - anteriorRef.current));
    anteriorRef.current = boat;
  }, [boat]);

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

  /** A pausa tem de valer para o comando, nao so para o laco.
      `active` cai durante a espera e a luta, e o efeito acima limpa as refs
      NO INSTANTE em que isso acontece — mas nao impedia que uma ordem nova
      entrasse depois. Um clique na agua durante a espera ficava guardado e o
      barco saia andando sozinho quando o minigame acabava. */
  const activeRef = useRef(active);
  activeRef.current = active;

  const setDir = useCallback((d: number) => {
    if (!activeRef.current) return;
    dirRef.current = d;
    if (d) alvoRef.current = null;
  }, []);
  const sailTo = useCallback((x: number) => {
    if (!activeRef.current) return;
    alvoRef.current = x;
  }, []);

  return { boat, facing, setDir, sailTo };
}
