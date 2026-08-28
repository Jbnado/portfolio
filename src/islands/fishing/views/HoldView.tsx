import { useEffect, useRef, useState } from 'preact/hooks';
import type { HoldParams, Result } from '../types';
import {
  startHold,
  stepHold,
  type HoldState,
} from '../engines/hold';
import './HoldView.css';

type Props = {
  params: HoldParams;
  color: string;
  onDone: (r: Result) => void;
};

/** Movimento reduzido: o peixe salta entre degraus. A FAIXA nao muda, porque
    ela e a mao do jogador e controle direto nao e animacao automatica. */
const STEPS = 12;

export function HoldView({ params, color, onDone }: Props) {
  const [state, setState] = useState<HoldState>(() => startHold(params));
  const holdingRef = useRef(false);

  // Mesma razao do TRACK: `onDone` fora das dependencias, senao o efeito
  // reinicia a cada render e o minigame nunca termina.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    // Mesma razao do TRAJETO (ver TrackView.tsx): a vista desmonta a cada
    // peixe, o Preact nao reusa instancia. O reset abaixo e redundancia
    // barata, nao defesa contra estado herdado.
    const stepped = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let previous = performance.now();
    let current = startHold(params);

    const loop = (now: number) => {
      const dt = Math.min(50, now - previous);
      previous = now;
      current = stepHold(params, current, dt, holdingRef.current, Math.random);
      setState(
        stepped
          ? { ...current, fishPos: Math.round(current.fishPos * STEPS) / STEPS }
          : current,
      );
      if (current.done) { onDoneRef.current(current.done); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.code !== 'Space') return;
      ev.preventDefault();
      holdingRef.current = true;
    };
    const onKeyUp = (ev: KeyboardEvent) => {
      if (ev.code !== 'Space') return;
      ev.preventDefault();
      holdingRef.current = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [params]);

  const half = params.bandHeight / 2;
  return (
    <div class="hold">
      <div class="hold-bar">
        <div
          class="hold-band"
          style={{
            bottom: `${(state.bandPos - half) * 100}%`,
            height: `${params.bandHeight * 100}%`,
          }}
        />
        <div
          class="hold-fish"
          style={{ bottom: `calc(${state.fishPos * 100}% - 8px)`, background: color }}
        />
      </div>
      <div class="hold-meter">
        <div class="hold-meter-fill" style={{ height: `${state.progress * 100}%` }} />
      </div>
      {/* graceMs null (achado I5): este peixe nunca escapa por carencia, entao
          nao ha contagem regressiva para mostrar mesmo que msAtZero suba. */}
      {params.graceMs !== null && state.msAtZero > 0 && (
        <div class="hold-escape" role="presentation">
          <div
            class="hold-escape-fill"
            style={{ height: `${Math.max(0, 1 - state.msAtZero / params.graceMs) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
