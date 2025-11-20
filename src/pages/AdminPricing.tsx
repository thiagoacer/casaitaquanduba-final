import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminPricing() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | null, msg: string}>({ type: null, msg: '' });
  
  // Guardamos o ID para saber se é atualização ou criação
  const [priceId, setPriceId] = useState<string | null>(null);

  // Valores iniciais seguros (Strings para não travar o input)
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
      // Tenta buscar. Se der erro ou vier vazio, não tem problema, usamos os padrões acima.
      const { data } = await supabase.from('pricing_rules').select('*').maybeSingle();

      if (data) {
        setPriceId(data.id);
        // Preenchemos o estado garantindo que virou String
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
      // Destrava a tela de qualquer jeito
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus({ type: null, msg: '' });

    // Converte para números na hora de salvar
    const payload = {
      base_price: parseFloat(prices.base_price),
      weekend_multiplier: parseFloat(prices.weekend_multiplier),
      cleaning_fee: parseFloat(prices.cleaning_fee),
      min_nights: parseInt(prices.min_nights),
      holiday_multiplier: parseFloat(prices.holiday_multiplier)
    };

    let error;

    if (priceId) {
      // ATUALIZAR
      const { error: err } = await supabase
        .from('pricing_rules')
        .update(payload)
        .eq('id', priceId);
      error = err;
    } else {
      // CRIAR NOVO
      const { error: err, data } = await supabase
        .from('pricing_rules')
        .insert([payload])
        .select()
        .single();
      
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

  // Função genérica para atualizar os inputs sem travar
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
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-3 rounded-lg font-bold text-white flex items-center gap-2 transition-all ${
            saving ? 'bg-gray-400' : 'bg-[#2EC4B6] hover:bg-[#25a094]'
          }`}
        >
          {saving ? <Loader2 className="animate-spin"/> : <Save className="w-5 h-5"/>}
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {status.msg && (
        <div className={`p-4 rounded-lg flex items-center gap-2 font-medium ${
          status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
          {status.msg}
        </div>
