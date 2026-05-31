import { useState, useMemo } from 'react';
import { Search, X, BookOpen, Calendar, Pencil, Trash2, Check } from 'lucide-react';
import { useDiario } from '../../hooks/useDiario';
import type { DiarioEntry } from '../../hooks/useDiario';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * DIÁRIO DE ORAÇÃO — Spiritual Journal
 *
 * A beautiful journal where the user can browse, search, and re-read
 * all their daily prayer notes — organized by month, with method info
 * and Gospel references. A personal spiritual treasury.
 */

const monthNames: Record<string, string> = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
  '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
  '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro',
};

function formatDate(dateStr: string): string {
  try {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

function formatMonthHeader(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${monthNames[month] || month} ${year}`;
}

interface EntryCardProps {
  entry: DiarioEntry;
  onSave: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}

function EntryCard({ entry, onSave, onDelete }: EntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.notes);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const hasNotes = entry.notes.trim().length > 0;
  const isLong = entry.notes.length > 150;

  const handleSave = () => {
    onSave(entry.id, draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(entry.notes);
    setEditing(false);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-ens-blue capitalize">
            {formatDate(entry.date)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm">{entry.methodEmoji}</span>
            <span className="text-xs text-ens-text-light">{entry.methodName}</span>
            {entry.duration > 0 && (
              <span className="text-[0.625rem] text-ens-text-light">• {entry.duration} min</span>
            )}
          </div>
        </div>
        {!editing && !confirmDelete && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-md text-gray-400 hover:bg-gray-50 hover:text-ens-blue"
              aria-label="Editar"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500"
              aria-label="Apagar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {entry.gospelReference && (
        <div className="flex items-center gap-1.5 mb-2.5">
          <BookOpen className="w-3 h-3 text-ens-gold shrink-0" />
          <span className="text-xs text-ens-gold font-medium">{entry.gospelReference}</span>
        </div>
      )}

      {confirmDelete ? (
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <p className="text-xs text-red-700 mb-2">Apagar esta entrada permanentemente?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 py-1.5 rounded-md bg-white text-ens-text text-xs font-medium border border-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              className="flex-1 py-1.5 rounded-md bg-red-500 text-white text-xs font-semibold"
            >
              Apagar
            </button>
          </div>
        </div>
      ) : editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-ens-text focus:outline-none focus:ring-2 focus:ring-ens-blue/30 resize-none"
            placeholder="Suas reflexões..."
          />
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 py-1.5 rounded-md bg-gray-100 text-ens-text text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-1.5 rounded-md bg-ens-blue text-white text-xs font-semibold flex items-center justify-center gap-1"
            >
              <Check className="w-3 h-3" /> Salvar
            </button>
          </div>
        </div>
      ) : hasNotes ? (
        <div className="bg-[#faf8f3] rounded-lg p-3 border-l-[2px] border-ens-gold/40">
          <p className={`text-sm text-ens-text leading-relaxed whitespace-pre-line ${
            !expanded && isLong ? 'line-clamp-4' : ''
          }`}>
            {entry.notes}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-ens-blue font-medium mt-2"
            >
              {expanded ? 'Mostrar menos' : 'Ler mais...'}
            </button>
          )}
        </div>
      ) : (
        <p className="text-xs text-ens-text-light italic">Oração sem anotação</p>
      )}
    </div>
  );
}

export default function DiarioPage() {
  const { entries, getEntriesByMonth, searchEntries, updateEntry, deleteEntry } = useDiario();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);

  const handleSave = (id: string, notes: string) => updateEntry(id, { notes });
  const handleDelete = (id: string) => deleteEntry(id);

  const searchResults = useMemo(
    () => (searchQuery.trim() ? searchEntries(searchQuery) : []),
    [searchQuery, searchEntries]
  );

  const groupedEntries = useMemo(() => getEntriesByMonth(), [getEntriesByMonth]);
  const months = Object.keys(groupedEntries);

  const totalEntries = entries.length;
  const entriesWithNotes = entries.filter(e => e.notes.trim()).length;
  const methodCounts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.methodEmoji] = (acc[e.methodEmoji] || 0) + 1;
    return acc;
  }, {});

  // ─── EMPTY STATE ──────────────────────────────
  if (totalEntries === 0) {
    return (
      <div className="pb-24 px-4 pt-16">
        <h1 className="text-xl font-bold text-ens-blue mb-6">Diário de Oração</h1>
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
          <div className="text-5xl mb-4">📖</div>
          <h2 className="font-semibold text-ens-text text-lg mb-2">Seu diário está vazio</h2>
          <p className="text-sm text-ens-text-light max-w-[260px] mx-auto leading-relaxed">
            Quando você fizer a Oração Pessoal e escrever suas reflexões,
            elas aparecerão aqui — um tesouro espiritual que cresce a cada dia.
          </p>
          <div className="mt-6 bg-ens-blue/5 rounded-xl p-4 mx-4 border-l-4 border-ens-gold">
            <p className="text-xs text-ens-text italic">
              "Guardava Maria todas estas coisas, meditando-as em seu coração."
            </p>
            <p className="text-xs text-ens-text-light mt-1 text-right">— Lc 2,19</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── JOURNAL WITH ENTRIES ─────────────────────
  return (
    <div className="pb-24 px-4 pt-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-ens-blue">Diário de Oração</h1>
        <button
          onClick={() => { setSearchActive(!searchActive); setSearchQuery(''); }}
          className={`p-2 rounded-lg transition-colors ${
            searchActive ? 'bg-ens-blue text-white' : 'bg-ens-blue/10 text-ens-blue'
          }`}
        >
          {searchActive ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
        </button>
      </div>

      {/* Search bar */}
      {searchActive && (
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar nas suas reflexões..."
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30"
          />
          {searchQuery.trim() && (
            <p className="text-xs text-ens-text-light mt-2 ml-1">
              {searchResults.length} {searchResults.length === 1 ? 'resultado' : 'resultados'} encontrado{searchResults.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Stats summary */}
      {!searchActive && (
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-ens-blue" />
            <div>
              <p className="text-lg font-bold text-ens-blue">{totalEntries}</p>
              <p className="text-[0.625rem] text-ens-text-light">
                {totalEntries === 1 ? 'oração' : 'orações'}
              </p>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <p className="text-lg font-bold text-ens-gold">{entriesWithNotes}</p>
            <p className="text-[0.625rem] text-ens-text-light">com notas</p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div className="flex-1 flex items-center gap-1.5 flex-wrap justify-end">
            {Object.entries(methodCounts).map(([emoji, count]) => (
              <span key={emoji} className="text-xs bg-ens-blue/5 px-2 py-0.5 rounded-full">
                {emoji} {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      {searchActive && searchQuery.trim() ? (
        <div className="space-y-3">
          {searchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-ens-text-light text-sm">Nenhum resultado encontrado.</p>
              <p className="text-xs text-ens-text-light mt-1">Tente outra palavra ou expressão.</p>
            </div>
          ) : (
            searchResults.map(entry => (
              <EntryCard key={entry.id} entry={entry} onSave={handleSave} onDelete={handleDelete} />
            ))
          )}
        </div>
      ) : (
        /* Monthly grouped entries */
        <div className="space-y-6">
          {months.map(month => (
            <div key={month}>
              {/* Month header */}
              <div className="flex items-center gap-2 mb-3 sticky top-0 bg-ens-cream py-2 z-10">
                <div className="h-px flex-1 bg-ens-gold/30" />
                <h2 className="text-xs font-bold text-ens-blue uppercase tracking-wider px-2">
                  {formatMonthHeader(month)}
                </h2>
                <span className="text-[0.625rem] text-ens-text-light">
                  ({groupedEntries[month].length})
                </span>
                <div className="h-px flex-1 bg-ens-gold/30" />
              </div>

              {/* Entries */}
              <div className="space-y-3">
                {groupedEntries[month].map(entry => (
                  <EntryCard key={entry.id} entry={entry} onSave={handleSave} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
