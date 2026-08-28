import { useEffect, useRef, useState } from 'preact/hooks';
import type { ParamsTrajeto, Resultado } from '../tipos';
import {
  iniciarTrajeto,
  apertarTrajeto,
  posicaoEm,
  type EstadoTrajeto,
} from './trajeto';
import './trajeto.css';

type Props = { params: ParamsTrajeto; aoTerminar: (r: Resultado) => void };

/** Movimento reduzido: o marcador anda em degraus em vez de deslizar. */
const DEGRAUS = 24;

export function TrajetoView({ params, aoTerminar }: Props) {
  const [pos, setPos] = useState(0);
  const estadoRef = useRef<EstadoTrajeto>(iniciarTrajeto(params));
  const [zonaAtiva, setZonaAtiva] = useState(0);
  const inicioRef = useRef(0);

  // O pai monta `aoTerminar` a cada render. Se ela entrar nas dependencias do
  // efeito, o efeito reinicia a cada render e o minigame se reinicia sozinho.
  // A ref mantem a chamada atual sem prender o efeito a ela.
  const fimRef = useRef(aoTerminar);
  fimRef.current = aoTerminar;

  useEffect(() => {
    // Preact reusa a instancia entre peixes do mesmo motor, entao o estado
    // TEM que reiniciar aqui. Sem isto o segundo peixe herda o do primeiro e
    // aparece ja fisgado.
    estadoRef.current = iniciarTrajeto(params);
    setZonaAtiva(0);

    const passos = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    inicioRef.current = performance.now();

    const laco = (agora: number) => {
      const t = agora - inicioRef.current;
      const p = posicaoEm(params, t);
      setPos(passos ? Math.round(p * DEGRAUS) / DEGRAUS : p);
      raf = requestAnimationFrame(laco);
    };
    raf = requestAnimationFrame(laco);

    const aoTeclar = (ev: KeyboardEvent) => {
      if (ev.code !== 'Space' || ev.repeat) return;
      ev.preventDefault();
      const t = performance.now() - inicioRef.current;
      const proximo = apertarTrajeto(params, estadoRef.current, t);
      estadoRef.current = proximo;
      setZonaAtiva(proximo.zonaAtiva);
      if (proximo.terminado) fimRef.current(proximo.terminado);
    };
    window.addEventListener('keydown', aoTeclar);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', aoTeclar);
    };
  }, [params]);

  if (params.caminho === 'radial') {
    const ang = pos * 2 * Math.PI;
    return (
      <div class="tj">
        <svg class="tj-anel" viewBox="0 0 100 100" role="presentation">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--pesca-linha)" stroke-width="6" />
          {params.zonas.map((z, i) => (
            <circle
              key={i}
              cx="50" cy="50" r="40" fill="none"
              stroke="var(--pesca-zona)"
              stroke-width={i === zonaAtiva ? 8 : 4}
              stroke-dasharray={`${z.tamanho * 251} 251`}
              stroke-dashoffset={-((z.pos - z.tamanho / 2) * 251)}
              opacity={i === zonaAtiva ? 1 : 0.25}
              transform="rotate(-90 50 50)"
            />
          ))}
          <circle
            cx={50 + 40 * Math.cos(ang - Math.PI / 2)}
            cy={50 + 40 * Math.sin(ang - Math.PI / 2)}
            r="6" fill="var(--pesca-marcador)"
          />
        </svg>
      </div>
    );
  }

  const vertical = params.caminho === 'subida';
  return (
    <div class="tj">
      <div class="tj-pista">
        {params.zonas.map((z, i) => (
          <div
            key={i}
            class="tj-zona"
            data-ativa={String(i === zonaAtiva)}
            style={{ left: `${(z.pos - z.tamanho / 2) * 100}%`, width: `${z.tamanho * 100}%` }}
          />
        ))}
        <div
          class="tj-marcador"
          style={{ left: `${(vertical ? 1 - pos : pos) * 100}%` }}
        />
      </div>
    </div>
  );
}
