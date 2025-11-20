import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminPricing() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | null, msg: string}>({ type: null, msg: '' });
  const [priceId, setPriceId] = useState<string | null>(null);

  const [prices, setPrices] = useState({
    base_price: '800',
    weekend_multiplier: '1.2',
    cleaning_fee: '250',
    min_nights: '2',
    holiday_multiplier: '1.5'
  });

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    try {
      const { data } = await supabase.from('pricing_rules').select('*').maybeSingle();
      if (data) {
        setPriceId(data.id);
        setPrices({
          base_price: String(data.base_price || '800'),
          weekend_multiplier: String(data.weekend_multiplier || '1.2'),
          cleaning_fee: String(data.cleaning_fee || '250'),
          min_nights: String(data.min_nights || '2'),
          holiday_multiplier: String(data.holiday_multiplier || '1.5')
        });
      }
    } catch (error) {
      console.error("Erro silencioso ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus({ type: null, msg: '' });

    const payload = {
      base_price: parseFloat(prices.base_price),
      weekend_multiplier: parseFloat(prices.weekend_multiplier),
      cleaning_fee: parseFloat(prices.cleaning_fee),
      min_nights: parseInt(prices.min_nights),
      holiday_multiplier: parseFloat(prices.holiday_multiplier)
    };

    let error;
    if (priceId) {
      const { error: err } = await supabase.from('pricing_rules').update(payload).eq('id', priceId);
      error = err;
    } else {
      const { error: err, data } = await supabase.from('pricing_rules').insert([payload]).select().single();
      if (data) setPriceId(data.id);
      error = err;
    }

    if (!error) {
      setStatus({ type: 'success', msg: 'Preços salvos com sucesso!' });
    } else {
      setStatus({ type: 'error', msg: 'Erro ao salvar. Tente novamente.' });
    }
    setSaving(false);
  };

  const handleChange = (field: string, value: string) => {
    setPrices(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="p-10 text-center">Carregando painel...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-[#0A7B9B]" />
          Configuração de Preços
        </h1>
        <button onClick={handleSave} disabled={saving} className={`px-6 py-3 rounded-lg font-bold text-white flex items-center gap-2 transition-all ${saving ? 'bg-gray-400' : 'bg-[#2EC4B6] hover:bg-[#25a094]'}`}>
          {saving ? <Loader2 className="animate-spin"/> : <Save className="w-5 h-5"/>}
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {status.msg && (
        <div className={`p-4 rounded-lg flex items-center gap-2 font-medium ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
          {status.msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Valores Base</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diária Padrão (R$)</label>
            <input type="number" value={prices.base_price} onChange={(e) => handleChange('base_price', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B]"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Taxa de Limpeza (R$)</label>
            <input type="number" value={prices.cleaning_fee} onChange={(e) => handleChange('cleaning_fee', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B]"/>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Regras</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo de Noites</label>
            <input type="number" value={prices.min_nights} onChange={(e) => handleChange('min_nights', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B]"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Multiplicador Fim de Semana</label>
            <input type="number" step="0.1" value={prices.weekend_multiplier} onChange={(e) => handleChange('weekend_multiplier', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B]"/>
          </div>
        </div>
      </div>
    </div>
  );
}
