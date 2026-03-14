import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, NotebookPen, Heart } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/pces', label: 'PCEs', icon: BookOpen },
  { path: '/diario', label: 'Diário', icon: NotebookPen },
  { path: '/casal', label: 'Casal', icon: Heart },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide nav during prayer flows
  const flowPaths = ['/oracao-pessoal', '/oracao-conjugal', '/dever-sentar', '/regra-vida'];
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
              <span className="text-[11px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
