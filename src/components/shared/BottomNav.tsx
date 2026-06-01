import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Sparkles, NotebookPen, Heart, Settings } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/pces', label: 'PCEs', icon: BookOpen },
  { path: '/sabedorias', label: 'Sabedorias', icon: Sparkles },
  { path: '/diario', label: 'Diário', icon: NotebookPen },
  { path: '/casal', label: 'Casal', icon: Heart },
  { path: '/configuracoes', label: 'Ajustes', icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

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
                flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg
                transition-colors flex-1 min-w-0
                ${active ? 'text-ens-blue' : 'text-gray-400'}
              `}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[0.625rem] font-medium truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
