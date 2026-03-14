import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Check } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { format } from 'date-fns';
import type { DeverSentarData } from '../../types';

const topics = [
  { emoji: '💑', label: 'Como está nosso relacionamento?', desc: 'Avaliem a qualidade do tempo juntos' },
  { emoji: '🙏', label: 'Como está nossa vida de oração?', desc: 'Oração pessoal e conjugal' },
  { emoji: '👨‍👩‍👧‍👦', label: 'Como estão os filhos?', desc: 'Educação, fé, relacionamento' },
  { emoji: '💰', label: 'Finanças e vida material', desc: 'Organização, prioridades' },
  { emoji: '🤝', label: 'Vida social e de equipe', desc: 'ENS, amigos, comunidade' },
  { emoji: '📋', label: 'PCEs do mês', desc: 'Como estamos vivendo os pontos concretos?' },
];

const defaultData: DeverSentarData = {
  lastCompleted: '',
  scheduledDay: 15,
  completions: [],
};

export default function DeverSentarFlow() {
  const navigate = useNavigate();
  const [, setData] = useLocalStorage<DeverSentarData>('ens-dever-sentar', defaultData);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setData(prev => ({
      ...prev,
      lastCompleted: today,
      completions: [...prev.completions, { date: today, notes: notes || undefined }],
    }));
    setSaved(true);
  };

  return (
    <div className="min-h-dvh bg-ens-cream">
      {/* Header */}
      <div className="bg-ens-blue px-4 pt-12 pb-6">
        <button
          onClick={() => navigate('/')}
          className="absolute top-3 left-3 p-2 rounded-full bg-white/20 text-white"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center text-white">
          <div className="text-3xl mb-1">📋</div>
          <h1 className="text-xl font-bold">Dever de Sentar-se</h1>
          <p className="text-sm text-white/70">Balanço mensal da vida conjugal</p>
        </div>
      </div>

      <div className="px-4 py-6 pb-8 space-y-5">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">💡 O que é o Dever de Sentar-se?</p>
          <p>Um encontro mensal onde o casal avalia sua vida conjugal, familiar e espiritual. Sem pressa, sem interrupções.</p>
        </div>

        {/* Topics */}
        <div className="space-y-3">
          <h2 className="font-bold text-ens-blue">Temas para conversar:</h2>
          {topics.map((topic, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{topic.emoji}</span>
                <div>
                  <p className="font-semibold text-ens-text text-sm">{topic.label}</p>
                  <p className="text-xs text-ens-text-light mt-0.5">{topic.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div>
          <h3 className="font-semibold text-ens-blue text-sm mb-2">📝 Anotações (opcional)</h3>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Decisões tomadas, compromissos, observações..."
            className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm text-ens-text
              placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-ens-blue/30"
            rows={4}
            disabled={saved}
          />
        </div>

        {!saved ? (
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-xl bg-ens-gold text-white font-bold text-lg shadow-lg
              transition-all active:scale-[0.97]"
          >
            <Save className="w-5 h-5 inline mr-2" />
            Registrar Dever de Sentar
          </button>
        ) : (
          <div className="text-center py-4">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-green-600 font-semibold">Registrado com sucesso!</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-8 py-3 rounded-xl bg-ens-blue text-white font-semibold"
            >
              Voltar ao Início
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
