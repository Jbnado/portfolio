import { useEffect, useRef, useState } from 'preact/hooks';
import type { DodgeParams, Result } from '../types';
import {
  startDodge,
  switchLane,
  stepDodge,
  type DodgeState,
} from '../engines/dodge';
import './DodgeView.css';

type Props = {
  params: DodgeParams;
  texts: { bumps: string; bumpsUnlimited: string };
  onDone: (r: Result) => void;
};

const STEPS = 36;
const BASE_RADIUS = 20;
const RADIUS_STEP = 12;

// Portao fechado e o marcador nunca podem depender so da cor pra se
// diferenciar: o marcador e um disco redondo (MARKER_R), o portao fechado
// e um quadrado menor (GATE_CLOSED_HALF) e o portao aberto e um aro oco
// (GATE_OPEN_R). Tres formas, tres tamanhos.
const MARKER_R = 4;
const GATE_OPEN_R = 2;
const GATE_CLOSED_HALF = 2.5;

export function DodgeView({ params, texts, onDone }: Props) {
  const [est, setEst] = useState<DodgeState>(() => startDodge(params));
  const [angle, setAng] = useState(0);
  const stateRef = useRef(startDodge(params));

  // Mesma razao do TRAJETO e do SUSTENTACAO.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    // Preact reusa a instancia entre peixes do mesmo motor, entao o estado
    // TEM que reiniciar aqui. Sem isto o segundo peixe herda o do primeiro.
    const stepped = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const inicio = performance.now();
    stateRef.current = startDodge(params);

    const loop = (now: number) => {
      const t = now - inicio;
      const next = stepDodge(params, stateRef.current, t);
      stateRef.current = next;
      setEst(next);
      const p = (t % params.periodMs) / params.periodMs;
      setAng(stepped ? Math.round(p * STEPS) / STEPS : p);
      if (next.done) { onDoneRef.current(next.done); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (ev: KeyboardEvent) => {
      if (ev.code !== 'Space' || ev.repeat) return;
      ev.preventDefault();
      stateRef.current = switchLane(params, stateRef.current);
      setEst(stateRef.current);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  }, [params]);

  const rad = angle * 2 * Math.PI - Math.PI / 2;
  const raio = BASE_RADIUS + est.lane * RADIUS_STEP;

  return (
    <div class="dodge">
      <svg class="dodge-ring" viewBox="0 0 100 100" role="presentation">
        {Array.from({ length: params.lanes }, (_, i) => (
          <circle
            key={i}
            cx="50" cy="50" r={BASE_RADIUS + i * RADIUS_STEP}
            fill="none" stroke="var(--fishing-rule)" stroke-width="2"
          />
        ))}
        {params.gates.map((portao, i) =>
          Array.from({ length: params.lanes }, (_, lane) => {
            const aberto = portao.open.includes(lane);
            const r = BASE_RADIUS + lane * RADIUS_STEP;
            const a = portao.pos * 2 * Math.PI - Math.PI / 2;
            const cx = 50 + r * Math.cos(a);
            const cy = 50 + r * Math.sin(a);
            // Aberto: aro oco, pequeno. Fechado: quadrado solido, forma
            // diferente do marcador redondo, nao so cor diferente.
            return aberto ? (
              <circle
                key={`${i}-${lane}`}
                cx={cx} cy={cy} r={GATE_OPEN_R}
                fill="none" stroke="var(--fishing-zone)" stroke-width="1.5"
              />
            ) : (
              <rect
                key={`${i}-${lane}`}
                x={cx - GATE_CLOSED_HALF} y={cy - GATE_CLOSED_HALF}
                width={GATE_CLOSED_HALF * 2} height={GATE_CLOSED_HALF * 2}
                fill="var(--fishing-danger)"
              />
            );
          }),
        )}
        <circle
          cx={50 + raio * Math.cos(rad)}
          cy={50 + raio * Math.sin(rad)}
          r={MARKER_R} fill="var(--fishing-marker)"
        />
      </svg>
      {/* aria-label da o nome acessivel nos dois casos: numero cru nao diz
          nada pra leitor de tela. No ilimitado o infinito e so visual — o
          rotulo por extenso e quem carrega o significado pro leitor. */}
      <p
        class="dodge-bumps"
        aria-label={
          params.bumpsAllowed === null
            ? `${texts.bumps}: ${est.bumps}, ${texts.bumpsUnlimited}`
            : `${texts.bumps}: ${est.bumps} / ${params.bumpsAllowed + 1}`
        }
      >
        {params.bumpsAllowed === null
          ? `${est.bumps} ∞`
          : `${est.bumps} / ${params.bumpsAllowed + 1}`}
      </p>
    </div>
  );
}
