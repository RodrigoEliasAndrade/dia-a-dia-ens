import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { getPCEContent, type PCESection } from '../../data/pceContent';

function Section({ section, defaultOpen }: { section: PCESection; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{section.emoji}</span>
          <h3 className="font-semibold text-ens-blue text-sm">{section.title}</h3>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-ens-text-light" />
        ) : (
          <ChevronDown className="w-4 h-4 text-ens-text-light" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {section.items.map((item, i) => (
            <div key={i}>
              {item.quote ? (
                <div className="bg-ens-blue/5 rounded-lg p-3 border-l-[3px] border-ens-gold">
                  <p className="text-xs text-ens-text italic leading-relaxed">{item.text}</p>
                  {item.author && (
                    <p className="text-[0.625rem] text-ens-text-light mt-1 text-right">— {item.author}</p>
                  )}
                </div>
              ) : (
                <div className={`rounded-lg p-3 ${item.highlight ? 'bg-ens-gold/10 border border-ens-gold/30' : 'bg-ens-cream'}`}>
                  <p className={`text-xs leading-relaxed ${item.highlight ? 'text-ens-text font-medium' : 'text-ens-text'}`}>
                    {item.text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PCEDetailPage() {
  const navigate = useNavigate();
  const { pceId } = useParams<{ pceId: string }>();
  const content = getPCEContent(pceId || '');

  if (!content) {
    return (
      <div className="pb-24 px-4 pt-16 text-center">
        <p className="text-ens-text-light">PCE não encontrado.</p>
        <button onClick={() => navigate('/pces')} className="mt-4 text-ens-blue font-medium text-sm">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fade-in">
      {/* Header */}
      <div className="bg-ens-blue px-4 pt-3 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/pces')} className="text-white/70">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold">{content.title}</h1>
            <p className="text-white/60 text-xs">{content.subtitle}</p>
          </div>
          <span className="text-3xl">{content.emoji}</span>
        </div>
      </div>

      {/* Intro */}
      <div className="px-4 mt-5">
        <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-5 mb-5">
          <p className="text-sm text-ens-text leading-relaxed">{content.intro}</p>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {content.sections.map((section, i) => (
            <Section key={section.title} section={section} defaultOpen={i === 0} />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate(content.flowRoute)}
          className="w-full mt-6 py-4 rounded-xl bg-ens-blue text-white font-bold text-lg shadow-lg transition-all active:scale-[0.97]"
        >
          {content.ctaLabel}
        </button>
      </div>
    </div>
  );
}
