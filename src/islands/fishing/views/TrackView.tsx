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
    // Preact reusa a instancia entre peixes do mesmo motor, entao o estado
    // TEM que reiniciar aqui. Sem isto o segundo peixe herda o do primeiro e
    // aparece ja fisgado.
    stateRef.current = startTrack(params);
    setActiveZone(0);

    const stepped = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    startRef.current = performance.now();

    const loop = (now: number) => {
      const t = now - startRef.current;
      const p = positionAt(params, t);
      setPos(stepped ? Math.round(p * STEPS) / STEPS : p);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (ev: KeyboardEvent) => {
      if (ev.code !== 'Space' || ev.repeat) return;
      ev.preventDefault();
      const t = performance.now() - startRef.current;
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

  const vertical = params.path === 'subida';
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
        <div
          class="track-marker"
          style={{ left: `${(vertical ? 1 - pos : pos) * 100}%` }}
        />
      </div>
    </div>
  );
}
