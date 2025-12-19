import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fetchCalendar, parseIcalDates } from '../lib/ical';
import { Calendar, RefreshCw, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminCalendar() {
  const [icalUrl, setIcalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{type: 'success' | 'error' | null, msg: string}>({ type: null, msg: '' });
  const [blockedCount, setBlockedCount] = useState(0);

  useEffect(() => {
    loadSettings();
    countBlockedDates();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase.from('calendar_settings').select('*').single();
    if (data && data.ical_url) setIcalUrl(data.ical_url);
  };

  const countBlockedDates = async () => {
    const { count } = await supabase.from('blocked_dates').select('*', { count: 'exact', head: true });
    setBlockedCount(count || 0);
  };

  const handleSaveUrl = async () => {
    setLoading(true);
    const { error } = await supabase.from('calendar_settings').update({ ical_url: icalUrl }).eq('platform_name', 'Airbnb');
    
    if (!error) {
      setSyncStatus({ type: 'success', msg: 'URL salva com sucesso!' });
    } else {
      setSyncStatus({ type: 'error', msg: 'Erro ao salvar URL.' });
    }
    setLoading(false);
  };

  const handleSync = async () => {
    if (!icalUrl) return alert('Salve uma URL primeiro.');
    
    setLoading(true);
    setSyncStatus({ type: null, msg: 'Baixando dados do Airbnb...' });

    try {
      // 1. Baixar e Ler
      const icalData = await fetchCalendar(icalUrl);
      const dates = parseIcalDates(icalData);

      if (dates.length === 0) throw new Error('Nenhuma data encontrada no calendário.');

      // 2. Limpar bloqueios antigos (do iCal)
      await supabase.from('blocked_dates').delete().eq('source', 'ical');

      // 3. Inserir novos bloqueios
      const records = dates.map(d => ({
        date: d.toISOString().split('T')[0], // YYYY-MM-DD
        source: 'ical'
      }));

      const { error } = await supabase.from('blocked_dates').insert(records);

      if (error) throw error;

      setSyncStatus({ type: 'success', msg: `Sincronizado! ${records.length} dias bloqueados.` });
      countBlockedDates();

    } catch (err: any) {
      console.error(err);
      setSyncStatus({ type: 'error', msg: 'Erro na sincronização: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
        <Calendar className="w-8 h-8 text-[#0A7B9B]" />
        Sincronização de Calendário
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Link do Calendário Airbnb (iCal / .ics)</label>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={icalUrl}
            onChange={(e) => setIcalUrl(e.target.value)}
            placeholder="https://www.airbnb.com.br/calendar/ical/..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B] outline-none"
          />
          <button 
            onClick={handleSaveUrl}
            disabled={loading}
            className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 flex items-center gap-2 font-medium"
          >
            <Save className="w-4 h-4" /> Salvar
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          No Airbnb vá em: Calendário {'>'} Configurações de disponibilidade {'>'} Conectar outro calendário {'>'} Exportar calendário.
        </p>
      </div>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-blue-900">Status da Sincronização</h3>
          <p className="text-blue-700">Atualmente existem <strong>{blockedCount} dias bloqueados</strong> no sistema vindos do Airbnb.</p>
          {syncStatus.msg && (
            <div className={`mt-2 flex items-center gap-2 text-sm font-medium ${syncStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {syncStatus.type === 'success' ? <CheckCircle className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
              {syncStatus.msg}
            </div>
          )}
        </div>
        <button 
          onClick={handleSync}
          disabled={loading}
          className="bg-[#2EC4B6] text-white px-8 py-4 rounded-xl hover:bg-[#25a094] flex items-center gap-2 font-bold shadow-lg transition-transform hover:scale-105"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Sincronizando...' : 'Sincronizar Agora'}
        </button>
      </div>
    </div>
  );
}
