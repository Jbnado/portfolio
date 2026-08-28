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
  | { tipo: 'parado' }
  | { tipo: 'pescando'; fish: Fish }
  | { tipo: 'resultado'; fish: Fish; result: Result; size: number };

// A chave de i18n de cada motor nao bate com o literal do `engine`: o motor
// interno continua 'trajeto'/'sustentacao'/'dragagem', mas o texto mora em
// instruction.track/hold/dodge. Este mapa e so essa ponte.
const INSTRUCTION_KEY: Record<Fish['engine'], string> = {
  trajeto: 'track',
  sustentacao: 'hold',
  dragagem: 'dodge',
};

// `loadLog` faz `JSON.parse` sem validar o formato: um valor gravado
// por fora (ou corrompido) pode virar array, string ou numero e passar direto
// pelo cast. `Object.entries` abaixo quebra num primitivo, entao qualquer
// resultado que nao seja um objeto simples vira caderno vazio aqui.
function validLog(c: Log): Log {
  return c && typeof c === 'object' && !Array.isArray(c) ? c : {};
}

export default function Fishing({ textos }: { textos: Texts }) {
  const [phase, setPhase] = useState<Phase>({ tipo: 'parado' });
  const [log, setLog] = useState<Log>(() => validLog(loadLog()));

  // No v1 so os cinco peixes de TRAJETO entram no sorteio. As tarefas 8 e 9
  // liberam os outros quatro ao adicionarem as cascas que faltam.
  const cast = useCallback(() => {
    const pool = FISH.filter((p) => p.engine === 'trajeto');
    const fish = pool[Math.floor(Math.random() * pool.length)];
    setPhase({ tipo: 'pescando', fish });
  }, []);

  const onDone = useCallback(
    (fish: Fish) => (result: Result) => {
      const size = sizeOf(fish, result.quality);
      if (result.caught) {
        const novo = recordCatch(log, fish.id, size);
        setLog(novo);
        saveLog(novo);
      }
      setPhase({ tipo: 'resultado', fish, result, size });
    },
    [log],
  );

  return (
    <div>
      {phase.tipo === 'parado' && (
        <button class="fishing-button" onClick={cast}>{textos.cast}</button>
      )}

      {phase.tipo === 'pescando' && (
        <>
          <p class="fishing-prompt">{textos.instruction[INSTRUCTION_KEY[phase.fish.engine]]}</p>
          <TrackView
            params={phase.fish.params as TrackParams}
            onDone={onDone(phase.fish)}
          />
        </>
      )}

      {phase.tipo === 'resultado' && (
        <>
          <p>
            {phase.result.caught
              ? `${textos.caught}: ${textos.fish[phase.fish.id]}, ${phase.size} cm`
              : `${textos.escaped}: ${textos.fish[phase.fish.id]}`}
          </p>
          <button class="fishing-button" onClick={cast}>{textos.cast}</button>
        </>
      )}

      <section>
        <h2>{textos.log}</h2>
        {Object.keys(log).length === 0 ? (
          <p>{textos.logEmpty}</p>
        ) : (
          <ul>
            {Object.entries(log).map(([id, r]) => (
              <li key={id}>
                {textos.fish[id]} — {r.times} {textos.times}, {textos.largest} {r.largest} cm
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
