import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, NotebookPen, Heart } from 'lucide-react';
import { useFontSize, type FontSizePreset } from '../../hooks/useFontSize';

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/pces', label: 'PCEs', icon: BookOpen },
  { path: '/diario', label: 'Diário', icon: NotebookPen },
  { path: '/casal', label: 'Casal', icon: Heart },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { preset, setPreset, presets, labels } = useFontSize();
  const [showPicker, setShowPicker] = useState(false);

  // Hide nav during prayer flows
  const flowPaths = ['/oracao-pessoal', '/oracao-conjugal', '/dever-sentar', '/regra-vida', '/retiro-anual'];
  if (flowPaths.some(path => location.pathname.startsWith(path))) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg
                transition-colors min-w-[60px]
                ${active ? 'text-ens-blue' : 'text-gray-400'}
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[0.6875rem] font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Font size — blends in as a 5th nav item */}
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className={`
              flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg
              transition-colors min-w-[60px]
              ${showPicker ? 'text-ens-blue' : 'text-gray-400'}
            `}
          >
            <span className="text-base font-bold leading-6">Aa</span>
            <span className="text-[0.6875rem] font-medium">Texto</span>
          </button>

          {showPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
              <div className="absolute bottom-full right-0 mb-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-2 w-40">
                {presets.map((p: FontSizePreset) => (
                  <button
                    key={p}
                    onClick={() => { setPreset(p); setShowPicker(false); }}
                    className={`
                      w-full py-1.5 px-3 rounded-lg text-xs font-medium text-left transition-all
                      ${preset === p
                        ? 'bg-ens-blue text-white'
                        : 'text-ens-text hover:bg-gray-100'
                      }
                    `}
                  >
                    {labels[p]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
