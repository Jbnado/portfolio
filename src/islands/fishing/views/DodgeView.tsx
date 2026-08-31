import { useEffect, useRef, useState } from 'preact/hooks';
import type { DodgeParams, Gate, Result } from '../types';
import { startDodge, switchLane, stepDodge, LANES, type DodgeState } from '../engines/dodge';
import './DodgeView.css';

type Props = {
  params: DodgeParams;
  texts: { reeling: string; falls: string; resets: string; fallsUnlimited: string };
  onDone: (r: Result) => void;
  onMiss: () => void;
};

const BASE_RADIUS = 24;
const RADIUS_STEP = 14;
const MARKER_R = 4;

/** Ponto do anel na fase `ph` (0..1 da volta), no raio `r`. */
function point(ph: number, r: number): [number, number] {
  const a = ph * 2 * Math.PI - Math.PI / 2;
  return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
}

/** Arco de `from` ate `to` (fracao da volta; `to` pode passar de 1). */
function arc(r: number, from: number, to: number): string {
  const [x0, y0] = point(from, r);
  const [x1, y1] = point(to, r);
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${to - from > 0.5 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/** Os pedacos de pista que sobram na pista `lane`: o anel e desenhado
    quebrado, com um buraco da largura do vao onde ele fecha esta pista. Cada
    vao tem largura propria, sorteada no lance. */
function laneArcs(gates: Gate[], lane: number, r: number): string[] {
  const closed = gates.filter((g) => g.open !== lane).sort((a, b) => a.pos - b.pos);
  if (closed.length === 0) return [arc(r, 0, 0.999)];
  return closed.map((g, i) => {
    const last = i + 1 === closed.length;
    const next = last ? closed[0] : closed[i + 1];
    const from = g.pos + g.width / 2;
    const to = (last ? next.pos + 1 : next.pos) - next.width / 2;
    return arc(r, from, to);
  });
}

export function DodgeView({ params, texts, onDone, onMiss }: Props) {
  const [state, setState] = useState<DodgeState>(() => startDodge(params, Math.random));
  const [angle, setAngle] = useState(0);
  /** Raio DESENHADO do marcador. Ele persegue o raio da pista logica em vez
      de saltar: trocar de pista mudava o raio inteiro num quadro so, e isso
      lia como piscada, nao como movimento. A pista logica (state.lane) e que
      decide o julgamento; esta e so a viagem ate la, curta o bastante para
      nao virar uma discordancia entre o que se ve e o que se julga. */
  const [drawR, setDrawR] = useState(BASE_RADIUS);
  const stateRef = useRef(state);

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const onMissRef = useRef(onMiss);
  onMissRef.current = onMiss;

  useEffect(() => {
    const fresh = startDodge(params, Math.random);
    stateRef.current = fresh;
    setState(fresh);

    let raf = 0;
    const start = performance.now();
    let previous = start;
    setDrawR(BASE_RADIUS);

    const loop = (now: number) => {
      const t = now - start;
      const dt = Math.min(50, now - previous);
      previous = now;
      const next = stepDodge(params, stateRef.current, t);
      if (next.bumps > stateRef.current.bumps) onMissRef.current();
      stateRef.current = next;
      setState(next);
      setAngle((t % params.periodMs) / params.periodMs);
      const alvo = BASE_RADIUS + next.lane * RADIUS_STEP;
      // dt ja vem limitado a 50ms, entao dt/90 nunca passa de 0.56: nao precisa
      // de teto. Perseguicao exponencial, independente da taxa de quadros.
      setDrawR((r) => r + (alvo - r) * (dt / 90));
      if (next.done) { onDoneRef.current(next.done); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (ev: KeyboardEvent) => {
      if (ev.code !== 'Space' || ev.repeat) return;
      ev.preventDefault();
      stateRef.current = switchLane(stateRef.current);
      setState(stateRef.current);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  }, [params]);

  const rad = angle * 2 * Math.PI - Math.PI / 2;
  const radius = drawR;
  const pct = Math.min(100, (state.cleanMs / params.holdMs) * 100);
  const segundos = Math.floor(state.cleanMs / 1000);

  return (
    <div class="dodge">
      <svg class="dodge-ring" viewBox="0 0 100 100" role="presentation">
        {Array.from({ length: LANES }, (_, lane) => {
          const r = BASE_RADIUS + lane * RADIUS_STEP;
          const width = lane === state.lane ? 3 : 2;
          return laneArcs(state.gates, lane, r).map((d, i) => (
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

      {/* A barrinha e o peixe sendo puxado: enche enquanto voce nao cai e
          volta a zero quando cai. */}
      <div class="dodge-meter">
        <div class="dodge-meter-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* <p> tem role paragraph, que esta na lista "Name Prohibited" da ARIA:
          aria-label ali e pra ser ignorado. Entao a frase por extenso vai
          escondida VISUALMENTE e o glifo compacto vai escondido DO LEITOR. */}
      <p class="dodge-count">
        <span class="fishing-live">
          {`${texts.reeling}: ${segundos} de ${Math.round(params.holdMs / 1000)} segundos`}
          {params.fallsToLose === null
            ? `. ${texts.fallsUnlimited}`
            : `. ${texts.falls} seguidas: ${state.streakFalls} de ${params.fallsToLose}. ${texts.resets}: ${state.zeroed} de ${params.zeroesToLose}`}
        </span>
        <span aria-hidden="true">
          {`${segundos}/${Math.round(params.holdMs / 1000)}s`}
          <span class="dodge-falls">
            {params.fallsToLose === null ? ' \u221e' : ` \u2715${state.streakFalls}/${params.fallsToLose} \u21ba${state.zeroed}/${params.zeroesToLose}`}
          </span>
        </span>
      </p>
    </div>
  );
}
