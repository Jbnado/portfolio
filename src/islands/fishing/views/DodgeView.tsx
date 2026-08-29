import { useEffect, useRef, useState } from 'preact/hooks';
import type { DodgeParams, Result } from '../types';
import { startDodge, switchLane, stepDodge, type DodgeState } from '../engines/dodge';
import './DodgeView.css';

type Props = {
  params: DodgeParams;
  texts: { clean: string; falls: string; fallsUnlimited: string };
  onDone: (r: Result) => void;
  onMiss: () => void;
};

const BASE_RADIUS = 20;
const RADIUS_STEP = 12;
const MARKER_R = 4;

/** Ponto do anel na fase `ph` (0..1 da volta), no raio `r`. */
function point(ph: number, r: number): [number, number] {
  const a = ph * 2 * Math.PI - Math.PI / 2;
  return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
}

/** Arco de `from` ate `to` (em fracao da volta, `to` pode passar de 1). */
function arc(r: number, from: number, to: number): string {
  const [x0, y0] = point(from, r);
  const [x1, y1] = point(to, r);
  const large = to - from > 0.5 ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/** Os pedacos de pista que SOBRAM na pista `lane`: o anel e desenhado
    quebrado, com um buraco de gapWidth em cada portao que fecha esta pista.
    O caminho acaba mesmo — nao ha obstaculo pintado por cima dele, e por isso
    o sinal nao depende de cor nenhuma, so da presenca ou ausencia de trilho. */
function laneArcs(params: DodgeParams, lane: number, r: number): string[] {
  const closed = params.gates
    .filter((g) => !g.open.includes(lane))
    .map((g) => g.pos)
    .sort((a, b) => a - b);
  // Pista sem nenhum portao fechado vira um anel praticamente inteiro (o
  // vao de 0.001 nao se ve). Fica aqui, e nao num ramo do JSX, porque o
  // desenho nao pode depender de a tabela nunca ter uma pista assim.
  if (closed.length === 0) return [arc(r, 0, 0.999)];
  const half = params.gapWidth / 2;
  return closed.map((pos, i) => {
    const last = i + 1 === closed.length;
    const from = pos + half;
    const to = (last ? closed[0] + 1 : closed[i + 1]) - half;
    return arc(r, from, to);
  });
}

export function DodgeView({ params, texts, onDone, onMiss }: Props) {
  const [state, setState] = useState<DodgeState>(() => startDodge(params));
  const [angle, setAngle] = useState(0);
  const stateRef = useRef(startDodge(params));

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const onMissRef = useRef(onMiss);
  onMissRef.current = onMiss;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    stateRef.current = startDodge(params);

    const loop = (now: number) => {
      const t = now - start;
      const next = stepDodge(params, stateRef.current, t);
      if (next.bumps > stateRef.current.bumps) onMissRef.current();
      stateRef.current = next;
      setState(next);
      setAngle((t % params.periodMs) / params.periodMs);
      if (next.done) { onDoneRef.current(next.done); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (ev: KeyboardEvent) => {
      if (ev.code !== 'Space' || ev.repeat) return;
      ev.preventDefault();
      stateRef.current = switchLane(params, stateRef.current);
      setState(stateRef.current);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  }, [params]);

  const rad = angle * 2 * Math.PI - Math.PI / 2;
  const radius = BASE_RADIUS + state.lane * RADIUS_STEP;

  return (
    <div class="dodge">
      <svg class="dodge-ring" viewBox="0 0 100 100" role="presentation">
        {Array.from({ length: params.lanes }, (_, lane) => {
          const r = BASE_RADIUS + lane * RADIUS_STEP;
          const width = lane === state.lane ? 3 : 2;
          return laneArcs(params, lane, r).map((d, i) => (
            <path key={`${lane}-${i}`} d={d} fill="none"
              stroke="var(--fishing-rule)" stroke-width={width} stroke-linecap="round" />
          ));
        })}
        <circle
          cx={50 + radius * Math.cos(rad)}
          cy={50 + radius * Math.sin(rad)}
          r={MARKER_R} fill="var(--fishing-marker)"
        />
      </svg>
      {/* <p> tem role paragraph, que esta na lista "Name Prohibited" da ARIA:
          aria-label ali e pra ser ignorado. Entao a frase por extenso vai
          escondida VISUALMENTE (o leitor le como conteudo normal) e o glifo
          compacto vai escondido DO LEITOR. */}
      <p class="dodge-count">
        <span class="fishing-live">
          {`${texts.clean}: ${state.streak} de ${params.cleanToCatch}`}
          {params.bumpsAllowed === null
            ? `. ${texts.fallsUnlimited}`
            : `. ${texts.falls}: ${state.bumps} de ${params.bumpsAllowed + 1}`}
        </span>
        <span aria-hidden="true">
          {`${state.streak}/${params.cleanToCatch}`}
          <span class="dodge-falls">
            {params.bumpsAllowed === null ? ' \u221e' : ` \u2715${state.bumps}/${params.bumpsAllowed + 1}`}
          </span>
        </span>
      </p>
    </div>
  );
}
