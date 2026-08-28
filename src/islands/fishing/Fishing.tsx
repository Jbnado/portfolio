import { useCallback, useState } from 'preact/hooks';
import { FISH, sizeOf } from './fish';
import type { Fish, TrackParams, Result } from './types';
import { TrackView } from './views/TrackView';
import {
  loadLog,
  saveLog,
  recordCatch,
  type Log,
} from './log';

type Texts = {
  cast: string;
  caught: string;
  escaped: string;
  log: string;
  logEmpty: string;
  times: string;
  largest: string;
  instruction: Record<string, string>;
  fish: Record<string, string>;
};

type Phase =
  | { kind: 'idle' }
  | { kind: 'playing'; fish: Fish }
  | { kind: 'result'; fish: Fish; result: Result; size: number };

// `loadLog` faz `JSON.parse` sem validar o formato: um valor gravado
// por fora (ou corrompido) pode virar array, string ou numero e passar direto
// pelo cast. `Object.entries` abaixo quebra num primitivo, entao qualquer
// resultado que nao seja um objeto simples vira caderno vazio aqui.
function validLog(c: Log): Log {
  return c && typeof c === 'object' && !Array.isArray(c) ? c : {};
}

export default function Fishing({ texts }: { texts: Texts }) {
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [log, setLog] = useState<Log>(() => validLog(loadLog()));

  // No v1 so os cinco peixes de TRAJETO entram no sorteio. As tarefas 8 e 9
  // liberam os outros quatro ao adicionarem as cascas que faltam.
  const cast = useCallback(() => {
    const pool = FISH.filter((p) => p.engine === 'track');
    const fish = pool[Math.floor(Math.random() * pool.length)];
    setPhase({ kind: 'playing', fish });
  }, []);

  const onDone = useCallback(
    (fish: Fish) => (result: Result) => {
      const size = sizeOf(fish, result.quality);
      if (result.caught) {
        const updated = recordCatch(log, fish.id, size);
        setLog(updated);
        saveLog(updated);
      }
      setPhase({ kind: 'result', fish, result, size });
    },
    [log],
  );

  return (
    <div>
      {phase.kind === 'idle' && (
        <button class="fishing-button" onClick={cast}>{texts.cast}</button>
      )}

      {phase.kind === 'playing' && (
        <>
          <p class="fishing-prompt">{texts.instruction[phase.fish.engine]}</p>
          <TrackView
            params={phase.fish.params as TrackParams}
            onDone={onDone(phase.fish)}
          />
        </>
      )}

      {phase.kind === 'result' && (
        <>
          <p>
            {phase.result.caught
              ? `${texts.caught}: ${texts.fish[phase.fish.id]}, ${phase.size} cm`
              : `${texts.escaped}: ${texts.fish[phase.fish.id]}`}
          </p>
          <button class="fishing-button" onClick={cast}>{texts.cast}</button>
        </>
      )}

      <section>
        <h2>{texts.log}</h2>
        {Object.keys(log).length === 0 ? (
          <p>{texts.logEmpty}</p>
        ) : (
          <ul>
            {Object.entries(log).map(([id, r]) => (
              <li key={id}>
                {texts.fish[id]} — {r.times} {texts.times}, {texts.largest} {r.largest} cm
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
