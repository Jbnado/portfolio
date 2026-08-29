import { useEffect, useRef, useState } from 'preact/hooks';
import type { TrackParams, Result } from '../types';
import { startTrack, pressTrack, positionAt, type TrackState } from '../engines/track';
import './TrackView.css';

type Props = { params: TrackParams; onDone: (r: Result) => void };


export function TrackView({ params, onDone }: Props) {
  const [pos, setPos] = useState(0);
  const stateRef = useRef<TrackState>(startTrack(params, Math.random));
  const [zonePos, setZonePos] = useState(stateRef.current.zonePos);
  const startRef = useRef(0);

  // O pai monta `onDone` a cada render. Se ela entrar nas dependencias do
  // efeito, o efeito reinicia a cada render e o minigame se reinicia sozinho.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const fresh = startTrack(params, Math.random);
    stateRef.current = fresh;
    setZonePos(fresh.zonePos);

    let raf = 0;
    startRef.current = performance.now();

    const loop = (now: number) => {
      setPos(positionAt(params, now - startRef.current));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (ev: KeyboardEvent) => {
      if (ev.code !== 'Space' || ev.repeat) return;
      ev.preventDefault();
      const t = performance.now() - startRef.current;
      const next = pressTrack(params, stateRef.current, t, Math.random);
      stateRef.current = next;
      setZonePos(next.zonePos);
      if (next.done) onDoneRef.current(next.done);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  }, [params]);

  return (
    <div class="track">
      <div class="track-rail">
        <div
          class="track-zone"
          style={{
            left: `${(zonePos - params.zoneSize / 2) * 100}%`,
            width: `${params.zoneSize * 100}%`,
          }}
        />
        <div class="track-marker" style={{ left: `${pos * 100}%` }} />
      </div>
    </div>
  );
}
