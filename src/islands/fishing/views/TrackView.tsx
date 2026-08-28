import { useEffect, useRef, useState } from 'preact/hooks';
import type { TrackParams, Result } from '../types';
import {
  startTrack,
  pressTrack,
  positionAt,
  type TrackState,
} from '../engines/track';
import './TrackView.css';

type Props = { params: TrackParams; onDone: (r: Result) => void };

/** Movimento reduzido: o marcador anda em degraus em vez de deslizar. */
const STEPS = 24;

export function TrackView({ params, onDone }: Props) {
  const [pos, setPos] = useState(0);
  const stateRef = useRef<TrackState>(startTrack(params));
  const [activeZone, setActiveZone] = useState(0);
  const startRef = useRef(0);

  // O pai monta `onDone` a cada render. Se ela entrar nas dependencias do
  // efeito, o efeito reinicia a cada render e o minigame se reinicia sozinho.
  // A ref mantem a chamada atual sem prender o efeito a ela.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    // A maquina de fases desmonta esta vista a cada peixe: nao e o Preact
    // reusando instancia, e o proprio JSX condicional trocando a subarvore
    // inteira (Fishing.tsx so renderiza a vista dentro de phase.kind ===
    // 'playing'). O useRef acima ja nasce com o estado certo a cada
    // montagem; este reset e so redundancia barata, contra o dia em que
    // essa garantia deixar de valer.
    stateRef.current = startTrack(params);
    setActiveZone(0);

    const stepped = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Quantum de tempo do movimento reduzido, nao de posicao (achado I1): o
    // motor e a tela agora recebem o MESMO tq, entao o que se ve e o que se
    // julga. Antes so a posicao exibida era arredondada e pressTrack recebia
    // o tempo cru, e os dois podiam discordar sobre o que era acerto.
    const stepMs = params.periodMs / STEPS;
    const quantize = (raw: number) => (stepped ? Math.round(raw / stepMs) * stepMs : raw);
    let raf = 0;
    startRef.current = performance.now();

    const loop = (now: number) => {
      const t = quantize(now - startRef.current);
      setPos(positionAt(params, t));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (ev: KeyboardEvent) => {
      if (ev.code !== 'Space' || ev.repeat) return;
      ev.preventDefault();
      const t = quantize(performance.now() - startRef.current);
      const next = pressTrack(params, stateRef.current, t);
      stateRef.current = next;
      setActiveZone(next.activeZone);
      if (next.done) onDoneRef.current(next.done);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  }, [params]);

  if (params.path === 'radial') {
    const angle = pos * 2 * Math.PI;
    return (
      <div class="track">
        <svg class="track-ring" viewBox="0 0 100 100" role="presentation">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--fishing-rule)" stroke-width="6" />
          {params.zones.map((z, i) => (
            <circle
              key={i}
              cx="50" cy="50" r="40" fill="none"
              stroke="var(--fishing-zone)"
              stroke-width={i === activeZone ? 8 : 4}
              stroke-dasharray={`${z.size * 251} 251`}
              stroke-dashoffset={-((z.pos - z.size / 2) * 251)}
              opacity={i === activeZone ? 1 : 0.25}
              transform="rotate(-90 50 50)"
            />
          ))}
          <circle
            cx={50 + 40 * Math.cos(angle - Math.PI / 2)}
            cy={50 + 40 * Math.sin(angle - Math.PI / 2)}
            r="6" fill="var(--fishing-marker)"
          />
        </svg>
      </div>
    );
  }

  return (
    <div class="track">
      <div class="track-rail">
        {params.zones.map((z, i) => (
          <div
            key={i}
            class="track-zone"
            data-active={String(i === activeZone)}
            style={{ left: `${(z.pos - z.size / 2) * 100}%`, width: `${z.size * 100}%` }}
          />
        ))}
        <div class="track-marker" style={{ left: `${pos * 100}%` }} />
      </div>
    </div>
  );
}
