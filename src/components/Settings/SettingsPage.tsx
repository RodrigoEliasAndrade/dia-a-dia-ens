import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, User as UserIcon, Type, Mail, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFontSize } from '../../hooks/useFontSize';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { preset, setPreset, presets, labels } = useFontSize();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const handleSaveName = async () => {
    setSaving(true);
    setSaveMsg('');
    await updateProfile({ display_name: displayName.trim() || null });
    setSaving(false);
    setSaveMsg('Salvo!');
    setTimeout(() => setSaveMsg(''), 2000);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleExportData = () => {
    const keys = [
      'ens-oracao-conjugal',
      'ens-oracao-pessoal',
      'ens-diario-pessoal',
      'ens-retiro-anual',
      'ens-dever-sentar',
      'ens-regra-vida',
    ];
    const data: Record<string, unknown> = {};
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          data[key] = JSON.parse(raw);
        } catch {
          // skip
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ens-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-24 px-4 pt-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-ens-blue text-sm font-medium mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <h1 className="text-xl font-bold text-ens-blue mb-6">Configurações</h1>

      <section className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <UserIcon className="w-4 h-4 text-ens-blue" />
          <h2 className="font-semibold text-ens-blue text-sm">Perfil</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-ens-text-light block mb-1">E-mail</label>
            <div className="text-sm text-ens-text bg-gray-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {user?.email}
            </div>
          </div>
          <div>
            <label className="text-xs text-ens-text-light block mb-1">Nome de exibição</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Como gostaria de ser chamado?"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-ens-blue/30"
            />
          </div>
          <button
            onClick={handleSaveName}
            disabled={saving || displayName.trim() === (profile?.display_name ?? '').trim()}
            className="w-full py-2.5 rounded-lg bg-ens-blue text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Salvando...' : saveMsg || 'Salvar nome'}
          </button>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-4 h-4 text-ens-blue" />
          <h2 className="font-semibold text-ens-blue text-sm">Tamanho do texto</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {presets.map(p => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                preset === p ? 'bg-ens-blue text-white' : 'bg-gray-100 text-ens-text'
              }`}
            >
              {labels[p]}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Download className="w-4 h-4 text-ens-blue" />
          <h2 className="font-semibold text-ens-blue text-sm">Backup local</h2>
        </div>
        <p className="text-xs text-ens-text-light mb-3">
          Baixe uma cópia dos seus dados (diário, orações, regra de vida, retiros) como JSON.
        </p>
        <button
          onClick={handleExportData}
          className="w-full py-2.5 rounded-lg bg-gray-100 text-ens-blue text-sm font-semibold"
        >
          Baixar meus dados
        </button>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <LogOut className="w-4 h-4 text-red-500" />
          <h2 className="font-semibold text-red-500 text-sm">Sair da conta</h2>
        </div>
        {!confirmingLogout ? (
          <button
            onClick={() => setConfirmingLogout(true)}
            className="w-full py-2.5 rounded-lg bg-red-50 text-red-500 text-sm font-semibold"
          >
            Sair
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-ens-text-light">
              Tem certeza? Faça backup dos seus dados antes se ainda não fez.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmingLogout(false)}
                className="py-2.5 rounded-lg bg-gray-100 text-ens-text text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold"
              >
                Sair
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
