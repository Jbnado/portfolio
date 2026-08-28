import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { FISH, sizeOf } from './fish';
import { mountSea, unmountSea } from './sea';
import type { Fish, TrackParams, HoldParams, DodgeParams, Result } from './types';
import { TrackView } from './views/TrackView';
import { HoldView } from './views/HoldView';
import { DodgeView } from './views/DodgeView';
import { weightedPick } from './draw';
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
  guaranteedMode: string;
  guaranteedModeHelp: string;
  bumps: string;
  bumpsUnlimited: string;
  play: string;
  exit: string;
  exitHelp: string;
  gameArea: string;
  howToPlay: string;
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
  const [guaranteed, setGuaranteed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const castBtnRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // O <canvas> pertence a pagina Astro, nao a ilha, entao a ilha o alcanca por
  // seletor. Efeito de montagem unica: nao ha loop de animacao no v1.
  useEffect(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('.fishing-sea');
    if (canvas) mountSea(canvas);
    return () => unmountSea();
  }, []);

  // A sobreposicao e um dialogo modal: enquanto ela esta aberta o documento
  // atras nao rola, Esc fecha, o foco entra nela e VOLTA para o botao Jogar ao
  // sair — sem isso quem navega por teclado e largado no meio da pagina.
  useEffect(() => {
    if (!playing) return;
    document.body.classList.add('fishing-locked');
    overlayRef.current?.focus();

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== 'Escape') return;
      ev.preventDefault();
      setPlaying(false);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.classList.remove('fishing-locked');
      window.removeEventListener('keydown', onKey);
      playBtnRef.current?.focus();
    };
  }, [playing]);

  // O botao de lancar desmonta a cada troca de fase (idle -> playing ->
  // result), e sem foco explicito o navegador devolve o foco para <body>,
  // vazando do dialogo. No playing nao ha controle proprio — os tres motores
  // ouvem Espaco na window — entao o foco fica no container da sobreposicao.
  useEffect(() => {
    if (!playing) return;
    if (phase.kind === 'playing') {
      overlayRef.current?.focus();
    } else {
      castBtnRef.current?.focus();
    }
  }, [playing, phase.kind]);

  // Sem mapa no v1, a profundidade e simulada pelo caderno: as faixas abrem
  // conforme se pesca. Sem isto a curva de aprendizado da matriz nao aparece.
  const cast = useCallback(() => {
    const known = Object.keys(log).length;
    const maxTier = known >= 6 ? 3 : known >= 3 ? 2 : 1;
    const pool = FISH.filter((f) => f.tier <= maxTier);
    // Sorteio ponderado: sorteio uniforme faria o peixe raro (HOLD na faixa 1)
    // aparecer um em tres, e ele precisa ser raro pra ensinar por surpresa.
    const fish = weightedPick(pool, Math.random);
    setPhase({ kind: 'playing', fish });
  }, [log]);

  const enter = useCallback(() => {
    setPlaying(true);
    setPhase({ kind: 'idle' });
  }, []);

  const onDone = useCallback(
    (fish: Fish) => (raw: Result) => {
      // Modo garantido forca a captura mas nao mexe em quality: o tamanho
      // continua refletindo o desempenho do jogador, so a perda e desligada.
      const result = guaranteed ? { caught: true, quality: raw.quality } : raw;
      const size = sizeOf(fish, result.quality);
      if (result.caught) {
        const updated = recordCatch(log, fish.id, size);
        setLog(updated);
        saveLog(updated);
      }
      setPhase({ kind: 'result', fish, result, size });
    },
    [log, guaranteed],
  );

  return (
    <div>
      <p class="fishing-prompt">{texts.howToPlay}</p>

      <button class="fishing-button" ref={playBtnRef} onClick={enter}>
        {texts.play}
      </button>

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

      {playing && (
        <div
          class="fishing-overlay"
          ref={overlayRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={texts.gameArea}
        >
          <div class="fishing-overlay-bar">
            <button class="fishing-exit" onClick={() => setPlaying(false)}>
              {texts.exit} <small>{texts.exitHelp}</small>
            </button>
          </div>

          {/* role=dialog com aria-modal esconde tudo fora da subarvore para
              leitores de tela: a live region tem que morar aqui dentro, senao
              o anuncio de captura nunca chega enquanto a sobreposicao esta
              aberta. */}
          <p class="fishing-live" role="status" aria-live="polite">
            {phase.kind === 'result'
              ? phase.result.caught
                ? `${texts.caught}: ${texts.fish[phase.fish.id]}, ${phase.size} cm`
                : `${texts.escaped}: ${texts.fish[phase.fish.id]}`
              : ''}
          </p>

          <div class="fishing-arena">
            <label class="fishing-option">
              <input
                type="checkbox"
                checked={guaranteed}
                onChange={(e) => setGuaranteed((e.target as HTMLInputElement).checked)}
              />
              <span>{texts.guaranteedMode}</span>
              <small>{texts.guaranteedModeHelp}</small>
            </label>

            {phase.kind === 'idle' && (
              <button class="fishing-button" ref={castBtnRef} onClick={cast}>
                {texts.cast}
              </button>
            )}

            {phase.kind === 'playing' && (
              <>
                <p class="fishing-prompt">{texts.instruction[phase.fish.engine]}</p>
                {phase.fish.engine === 'track' && (
                  <TrackView
                    params={phase.fish.params as TrackParams}
                    onDone={onDone(phase.fish)}
                  />
                )}
                {phase.fish.engine === 'hold' && (
                  <HoldView
                    params={phase.fish.params as HoldParams}
                    color={phase.fish.color}
                    onDone={onDone(phase.fish)}
                  />
                )}
                {phase.fish.engine === 'dodge' && (
                  <DodgeView
                    params={phase.fish.params as DodgeParams}
                    texts={{ bumps: texts.bumps, bumpsUnlimited: texts.bumpsUnlimited }}
                    onDone={onDone(phase.fish)}
                  />
                )}
              </>
            )}

            {phase.kind === 'result' && (
              <>
                <p>
                  {phase.result.caught
                    ? `${texts.caught}: ${texts.fish[phase.fish.id]}, ${phase.size} cm`
                    : `${texts.escaped}: ${texts.fish[phase.fish.id]}`}
                </p>
                <button class="fishing-button" ref={castBtnRef} onClick={cast}>
                  {texts.cast}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
