import { useState, useMemo } from 'react';
import { Sparkles, BookOpen, Footprints, ThumbsUp, ThumbsDown, RotateCcw, FlaskConical } from 'lucide-react';
import { FICHAS } from '../../motor/conteudo';
import { selecionar, degrauAlvo, MODO_TESTE } from '../../motor/seletor';
import { perfilNeutro } from '../../motor/types';
import type { Ficha, Registro, Fonte, Disposicao, Perfil, Momento } from '../../motor/types';

// ═══════════════════════════════════════════════════
// SABEDORIAS — Primeiro teste do motor espiritual
// Fatia vertical mínima: estado → motor → ficha → feedback → variação.
// (motor-espiritual/07-primeiro-teste.md)
// ═══════════════════════════════════════════════════

const ESTADO_PILOTO = 'abandono-oracao-pessoal';

/**
 * Normaliza o texto para leitura limpa: troca aspas angulares «» (estilo
 * litúrgico) por aspas comuns e remove espaços estranhos junto a elas.
 * Não altera o conteúdo canônico — só a exibição.
 */
function limparTexto(s: string): string {
  return s
    .replace(/«\s*/g, '"')
    .replace(/\s*»/g, '"')
    .replace(/ /g, ' '); // espaço não-quebrável → espaço normal
}

const REGISTROS: { id: Registro; label: string }[] = [
  { id: 'coracao', label: 'Coração' },
  { id: 'cotidiano', label: 'Cotidiano' },
  { id: 'reflexivo', label: 'Reflexivo' },
];

const FONTES: { id: Fonte; label: string }[] = [
  { id: 'Evangelho', label: 'Evangelho' },
  { id: 'Catecismo', label: 'Catecismo' },
  { id: 'ENS', label: 'ENS' },
  { id: 'Santo', label: 'Santo' },
];

const DISPOSICOES: { id: Disposicao; label: string }[] = [
  { id: 'neutro', label: 'Neutro' },
  { id: 'consolacao', label: 'Consolação' },
  { id: 'desolacao', label: 'Desolação' },
];

const REPETICOES = [1, 2, 4, 6];

/** Constrói um perfil simulado enfatizando um registro e uma fonte. */
function perfilSimulado(registro: Registro, fonte: Fonte): Perfil {
  const base = perfilNeutro();
  // Enfatiza o registro escolhido
  const reg: Record<Registro, number> = { coracao: 0.15, cotidiano: 0.15, reflexivo: 0.15 };
  reg[registro] = 0.7;
  // Enfatiza a fonte escolhida
  const fon: Record<Fonte, number> = { Evangelho: 0.1, Catecismo: 0.1, ENS: 0.1, Santo: 0.1 };
  fon[fonte] = 0.7;
  return { ...base, pref_registro: reg, pref_fonte: fon };
}

export default function SabedoriasPage() {
  // Simulação de perfil/momento (painel de teste)
  const [registro, setRegistro] = useState<Registro>('cotidiano');
  const [fonte, setFonte] = useState<Fonte>('Evangelho');
  const [disposicao, setDisposicao] = useState<Disposicao>('neutro');
  const [repeticao, setRepeticao] = useState<number>(1);
  const [estacaoFilhos, setEstacaoFilhos] = useState(false);

  // Estado da interação
  const [iniciado, setIniciado] = useState(false);
  const [vistas, setVistas] = useState<string[]>([]); // ids já mostrados (variação)
  const [fichaAtual, setFichaAtual] = useState<Ficha | null>(null);
  const [respondido, setRespondido] = useState<null | 'sim' | 'nao'>(null);
  const [semMais, setSemMais] = useState(false);

  const perfil = useMemo(() => perfilSimulado(registro, fonte), [registro, fonte]);

  const momento: Momento = useMemo(
    () => ({
      estado_pastoral: ESTADO_PILOTO,
      disposicao,
      estacao_de_vida: estacaoFilhos ? ['filhos-pequenos'] : [],
      repeticao,
    }),
    [disposicao, estacaoFilhos, repeticao],
  );

  // Ranking completo para transparência do teste (debug)
  const ranking = useMemo(
    () => selecionar(FICHAS, perfil, momento, vistas),
    [perfil, momento, vistas],
  );

  // Quais fontes existem no degrau alvo (explica por que mudar a fonte pode
  // não mudar a escolha — há lacuna de conteúdo nesse degrau).
  const fontesNoDegrau = useMemo(() => {
    const alvoLocal = degrauAlvo(repeticao);
    const set = new Set(
      FICHAS.filter(
        f =>
          f.estado.includes(ESTADO_PILOTO) &&
          f.degrau === alvoLocal &&
          !(disposicao === 'desolacao' && f.tom === 'exortar'),
      ).map(f => f.fonte),
    );
    return Array.from(set);
  }, [repeticao, disposicao]);

  const rodarMotor = (excluir: string[]) => {
    const ranking = selecionar(FICHAS, perfil, momento, excluir);
    if (ranking.length === 0) {
      setFichaAtual(null);
      setSemMais(true);
      return;
    }
    const escolhida = ranking[0].ficha;
    setFichaAtual(escolhida);
    setVistas(prev => [...prev, escolhida.id]);
    setRespondido(null);
    setSemMais(false);
  };

  const handleIniciar = () => {
    setIniciado(true);
    setVistas([]);
    setSemMais(false);
    const ranking = selecionar(FICHAS, perfil, momento, []);
    if (ranking.length === 0) {
      setFichaAtual(null);
      setSemMais(true);
      return;
    }
    const escolhida = ranking[0].ficha;
    setFichaAtual(escolhida);
    setVistas([escolhida.id]);
    setRespondido(null);
  };

  const handleReset = () => {
    setIniciado(false);
    setFichaAtual(null);
    setVistas([]);
    setRespondido(null);
    setSemMais(false);
  };

  const handleOutraAbordagem = () => rodarMotor(vistas);

  const alvo = degrauAlvo(repeticao);

  return (
    <div className="pb-24 px-4 pt-14 min-h-dvh bg-ens-cream">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-ens-gold" />
        <h1 className="text-xl font-bold text-ens-blue">Sabedorias</h1>
      </div>
      <p className="text-xs text-ens-text-light mb-4">
        Uma palavra para o momento que você vive.
      </p>

      {MODO_TESTE && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
          <FlaskConical className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            <strong>Modo de teste do motor.</strong> As fichas ainda são rascunho
            (sem revisão doutrinal) e o painel abaixo simula o perfil só para
            validar o funcionamento.
          </p>
        </div>
      )}

      {/* ─── Painel de simulação ─────────────────── */}
      <details className="bg-white rounded-xl shadow-sm mb-4" open>
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-ens-blue">
          🧪 Simulação de perfil & momento
        </summary>
        <div className="px-4 pb-4 space-y-3">
          <SimRow label="Registro (linguagem)">
            {REGISTROS.map(r => (
              <Chip key={r.id} active={registro === r.id} onClick={() => setRegistro(r.id)}>
                {r.label}
              </Chip>
            ))}
          </SimRow>
          <SimRow label="Fonte preferida">
            {FONTES.map(f => (
              <Chip key={f.id} active={fonte === f.id} onClick={() => setFonte(f.id)}>
                {f.label}
              </Chip>
            ))}
          </SimRow>
          <p className="text-[0.625rem] text-ens-text-light -mt-1">
            No degrau alvo {alvo} só há fichas de: <strong>{fontesNoDegrau.join(', ') || '—'}</strong>.
            Escolher outra fonte não muda a escolha se não houver ficha dela neste degrau
            (o motor usa a mais próxima).
          </p>
          <SimRow label="Disposição">
            {DISPOSICOES.map(d => (
              <Chip key={d.id} active={disposicao === d.id} onClick={() => setDisposicao(d.id)}>
                {d.label}
              </Chip>
            ))}
          </SimRow>
          <SimRow label={`Repetição → degrau alvo ${alvo}`}>
            {REPETICOES.map(n => (
              <Chip key={n} active={repeticao === n} onClick={() => setRepeticao(n)}>
                {n}ª vez
              </Chip>
            ))}
          </SimRow>
          <SimRow label="Estação de vida">
            <Chip active={estacaoFilhos} onClick={() => setEstacaoFilhos(v => !v)}>
              Filhos pequenos
            </Chip>
          </SimRow>
        </div>
      </details>

      {/* ─── Botão do estado-piloto ──────────────── */}
      {!iniciado && (
        <button
          onClick={handleIniciar}
          className="w-full bg-ens-blue text-white rounded-2xl shadow-md p-5 text-left transition-all active:scale-[0.98]"
        >
          <h3 className="font-bold text-base">Deixei de rezar sozinho</h3>
          <p className="text-white/70 text-xs mt-1">
            Parei a oração pessoal e ando desanimado.
          </p>
          <span className="inline-block mt-3 text-xs font-semibold bg-white/15 px-3 py-1.5 rounded-lg">
            Receber uma palavra →
          </span>
        </button>
      )}

      {/* ─── Ficha escolhida ─────────────────────── */}
      {iniciado && fichaAtual && (
        <div className="bg-white rounded-2xl shadow-md p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-semibold text-ens-gold bg-ens-gold/10 px-2 py-1 rounded-full">
              {fichaAtual.fonte}
            </span>
            <span className="text-xs text-ens-text-light bg-gray-100 px-2 py-1 rounded-full">
              degrau {fichaAtual.degrau} · {fichaAtual.tom}
            </span>
            <span className="text-xs text-ens-text-light bg-gray-100 px-2 py-1 rounded-full">
              {fichaAtual.registro}
            </span>
          </div>

          <p className="text-lg text-ens-text leading-loose whitespace-pre-line">
            {limparTexto(fichaAtual.texto)}
          </p>

          <div className="flex items-center gap-1.5 mt-4">
            <BookOpen className="w-4 h-4 text-ens-gold shrink-0" />
            <span className="text-sm text-ens-gold font-semibold">{fichaAtual.referencia}</span>
          </div>

          {fichaAtual.proximo_passo && (
            <div className="mt-4 bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Footprints className="w-4 h-4 text-ens-blue" />
                <span className="text-sm font-semibold text-ens-blue">Próximo passo</span>
              </div>
              <p className="text-base text-ens-text leading-relaxed">{limparTexto(fichaAtual.proximo_passo)}</p>
            </div>
          )}

          {/* Feedback */}
          {respondido === null && (
            <div className="mt-5">
              <p className="text-sm font-medium text-ens-text text-center mb-3">
                Isto te ajudou?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRespondido('sim')}
                  className="py-2.5 rounded-xl bg-green-50 text-green-700 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" /> Sim
                </button>
                <button
                  onClick={() => setRespondido('nao')}
                  className="py-2.5 rounded-xl bg-gray-100 text-ens-text text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" /> Não
                </button>
              </div>
            </div>
          )}

          {respondido === 'sim' && (
            <div className="mt-5 text-center">
              <p className="text-sm text-green-700 font-medium">Que bom. 🙏</p>
              <p className="text-xs text-ens-text-light mt-1">
                Que esta palavra te acompanhe hoje.
              </p>
              <button onClick={handleReset} className="mt-4 text-xs text-ens-blue font-medium flex items-center gap-1 mx-auto">
                <RotateCcw className="w-3.5 h-3.5" /> Recomeçar teste
              </button>
            </div>
          )}

          {respondido === 'nao' && (
            <div className="mt-5 text-center">
              <p className="text-sm text-ens-text font-medium mb-3">
                Quer outra abordagem?
              </p>
              <button
                onClick={handleOutraAbordagem}
                className="w-full py-2.5 rounded-xl bg-ens-blue text-white text-sm font-semibold"
              >
                Mostrar outra palavra
              </button>
              <button onClick={handleReset} className="mt-3 text-xs text-ens-text-light flex items-center gap-1 mx-auto">
                <RotateCcw className="w-3.5 h-3.5" /> Recomeçar teste
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Sem mais fichas ─────────────────────── */}
      {iniciado && semMais && (
        <div className="bg-white rounded-2xl shadow-md p-5 text-center animate-fade-in">
          <p className="text-sm text-ens-text">
            Não há outra abordagem diferente para este momento agora.
          </p>
          <p className="text-xs text-ens-text-light mt-2">
            (No app real, aqui entraria a recondução à equipe/conselheiro — degrau 4.)
          </p>
          <button onClick={handleReset} className="mt-4 text-xs text-ens-blue font-medium flex items-center gap-1 mx-auto">
            <RotateCcw className="w-3.5 h-3.5" /> Recomeçar teste
          </button>
        </div>
      )}

      {/* Debug: quantas fichas já foram vistas nesta sessão */}
      {iniciado && vistas.length > 0 && (
        <p className="text-[0.625rem] text-ens-text-light text-center mt-3">
          Vistas nesta sessão: {vistas.length} · degrau alvo {alvo}
        </p>
      )}

      {/* Ranking transparente — mostra por que uma ficha venceu */}
      <details className="bg-white rounded-xl shadow-sm mt-4">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-ens-blue">
          🔍 Ver ranking do motor ({ranking.length} candidatas)
        </summary>
        <div className="px-4 pb-4">
          <p className="text-[0.625rem] text-ens-text-light mb-2">
            Candidatas no degrau alvo {alvo}, ordenadas por nota. A de maior nota é
            a escolhida. Mudar perfil/momento muda as notas.
          </p>
          {ranking.length === 0 ? (
            <p className="text-xs text-ens-text-light">Nenhuma candidata (tudo já visto ou filtrado).</p>
          ) : (
            <div className="space-y-1.5">
              {ranking.map((r, i) => (
                <div
                  key={r.ficha.id}
                  className={`flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5 ${
                    i === 0 ? 'bg-ens-blue/10' : 'bg-gray-50'
                  }`}
                >
                  <span className="font-bold text-ens-blue w-10 shrink-0">
                    {r.nota.toFixed(1)}
                  </span>
                  <span className="flex-1 min-w-0 truncate text-ens-text">
                    {r.ficha.referencia}
                  </span>
                  <span className="text-ens-text-light shrink-0">
                    {r.ficha.fonte} · {r.ficha.registro}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </details>
    </div>
  );
}

// ─── Helpers de UI ─────────────────────────────────

function SimRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[0.6875rem] text-ens-text-light mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
        active ? 'bg-ens-blue text-white' : 'bg-gray-100 text-ens-text'
      }`}
    >
      {children}
    </button>
  );
}
