import { Sparkles } from 'lucide-react';
import type { WisdomDrop } from '../../types';

interface Card1Props {
  wisdom: WisdomDrop;
}

export default function Card1_Wisdom({ wisdom }: Card1Props) {
  return (
    <div className="space-y-5">
      <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-ens-gold" />
          <span className="text-xs font-bold text-ens-gold uppercase tracking-wider">
            {wisdom.category}
          </span>
        </div>
        <blockquote className="text-ens-text italic text-base leading-relaxed">
          "{wisdom.quote}"
        </blockquote>
        <p className="text-right text-sm text-ens-text-light mt-2">
          — {wisdom.author}
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-ens-blue mb-2">Reflexão</h3>
        <p className="text-ens-text text-sm leading-relaxed">{wisdom.reflection}</p>
      </div>

      <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
        <h3 className="font-semibold text-ens-blue mb-1">🎯 Desafio do dia</h3>
        <p className="text-ens-text text-sm">{wisdom.challenge}</p>
      </div>
    </div>
  );
}
