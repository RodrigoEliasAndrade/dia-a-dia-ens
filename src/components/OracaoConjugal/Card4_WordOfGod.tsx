import { BookOpen, WifiOff } from 'lucide-react';
import type { LiturgyData } from '../../types';

interface Card4Props {
  liturgy: LiturgyData | null;
  loading: boolean;
  isFromFallback: boolean;
}

export default function Card4_WordOfGod({ liturgy, loading, isFromFallback }: Card4Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-3 border-ens-blue border-t-transparent rounded-full" />
        <p className="text-sm text-ens-text-light mt-3">Carregando o Evangelho do dia...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {isFromFallback && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Evangelho de arquivo (API indisponível)</span>
        </div>
      )}

      {liturgy && (
        <>
          <div className="flex items-center gap-2 justify-center text-sm text-ens-text-light">
            <BookOpen className="w-4 h-4" />
            <span>Escuta da Palavra de Deus — ENS</span>
          </div>

          {liturgy.cor && (
            <div className="text-center">
              <span className="inline-block text-xs px-3 py-1 rounded-full bg-ens-blue/10 text-ens-blue font-medium">
                {liturgy.liturgia} • Cor: {liturgy.cor}
              </span>
            </div>
          )}

          <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-ens-blue text-sm mb-1 text-center">
              📖 Evangelho
            </h3>
            {liturgy.evangelhoReferencia && (
              <p className="text-xs text-ens-text-light text-center mb-3">
                {liturgy.evangelhoReferencia}
              </p>
            )}
            <p className="text-ens-text text-sm leading-relaxed whitespace-pre-line">
              {liturgy.evangelho}
            </p>
          </div>

          <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-gold">
            <h3 className="font-semibold text-ens-blue text-sm mb-2">
              Para refletir juntos:
            </h3>
            <p className="text-ens-text text-sm italic">
              "O que esta Palavra diz ao nosso casal hoje?"
            </p>
          </div>

          <p className="text-center text-xs text-ens-text-light">
            💡 Leiam em voz alta, alternando os parágrafos
          </p>
        </>
      )}
    </div>
  );
}
