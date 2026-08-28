import { useCallback, useState } from 'preact/hooks';
import { PEIXES, tamanhoDe } from './peixes';
import type { Peixe, ParamsTrajeto, Resultado } from './tipos';
// Extensao explicita necessaria: './motores/trajeto' e ambiguo entre
// trajeto.ts (motor puro) e trajeto.tsx (casca visual), e a resolucao padrao
// do Vite prefere .ts, o que pegaria o arquivo errado (sem TrajetoView).
import { TrajetoView } from './motores/trajeto.tsx';
import {
  carregarCaderno,
  salvarCaderno,
  registrarCaptura,
  type Caderno,
} from './estado';

type Textos = {
  lancar: string;
  fisgou: string;
  escapou: string;
  caderno: string;
  cadernoVazio: string;
  vezes: string;
  maior: string;
  instrucao: Record<string, string>;
  peixes: Record<string, string>;
};

type Fase =
  | { tipo: 'parado' }
  | { tipo: 'pescando'; peixe: Peixe }
  | { tipo: 'resultado'; peixe: Peixe; resultado: Resultado; tamanho: number };

// `carregarCaderno` faz `JSON.parse` sem validar o formato: um valor gravado
// por fora (ou corrompido) pode virar array, string ou numero e passar direto
// pelo cast. `Object.entries` abaixo quebra num primitivo, entao qualquer
// resultado que nao seja um objeto simples vira caderno vazio aqui.
function cadernoValido(c: Caderno): Caderno {
  return c && typeof c === 'object' && !Array.isArray(c) ? c : {};
}

export default function Pesca({ textos }: { textos: Textos }) {
  const [fase, setFase] = useState<Fase>({ tipo: 'parado' });
  const [caderno, setCaderno] = useState<Caderno>(() => cadernoValido(carregarCaderno()));

  // No v1 so os cinco peixes de TRAJETO entram no sorteio. As tarefas 8 e 9
  // liberam os outros quatro ao adicionarem as cascas que faltam.
  const sortear = useCallback(() => {
    const posiveis = PEIXES.filter((p) => p.motor === 'trajeto');
    const peixe = posiveis[Math.floor(Math.random() * posiveis.length)];
    setFase({ tipo: 'pescando', peixe });
  }, []);

  const aoTerminar = useCallback(
    (peixe: Peixe) => (resultado: Resultado) => {
      const tamanho = tamanhoDe(peixe, resultado.qualidade);
      if (resultado.pego) {
        const novo = registrarCaptura(caderno, peixe.id, tamanho);
        setCaderno(novo);
        salvarCaderno(novo);
      }
      setFase({ tipo: 'resultado', peixe, resultado, tamanho });
    },
    [caderno],
  );

  return (
    <div>
      {fase.tipo === 'parado' && (
        <button class="pesca-botao" onClick={sortear}>{textos.lancar}</button>
      )}

      {fase.tipo === 'pescando' && (
        <>
          <p class="pesca-prompt">{textos.instrucao[fase.peixe.motor]}</p>
          <TrajetoView
            params={fase.peixe.params as ParamsTrajeto}
            aoTerminar={aoTerminar(fase.peixe)}
          />
        </>
      )}

      {fase.tipo === 'resultado' && (
        <>
          <p>
            {fase.resultado.pego
              ? `${textos.fisgou}: ${textos.peixes[fase.peixe.id]}, ${fase.tamanho} cm`
              : `${textos.escapou}: ${textos.peixes[fase.peixe.id]}`}
          </p>
          <button class="pesca-botao" onClick={sortear}>{textos.lancar}</button>
        </>
      )}

      <section>
        <h2>{textos.caderno}</h2>
        {Object.keys(caderno).length === 0 ? (
          <p>{textos.cadernoVazio}</p>
        ) : (
          <ul>
            {Object.entries(caderno).map(([id, r]) => (
              <li key={id}>
                {textos.peixes[id]} — {r.vezes} {textos.vezes}, {textos.maior} {r.maior} cm
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
