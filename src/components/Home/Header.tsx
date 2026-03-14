import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Cross } from 'lucide-react';

export default function Header() {
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <header className="bg-ens-blue text-white px-5 pt-12 pb-6">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Cross className="w-6 h-6 text-ens-gold" />
        <h1 className="text-2xl font-bold tracking-wide">ENS DIA A DIA</h1>
        <Cross className="w-6 h-6 text-ens-gold" />
      </div>
      <p className="text-center text-sm text-white/70 capitalize">{today}</p>
    </header>
  );
}
