import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminPricing() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | null, msg: string}>({ type: null, msg: '' });
  
  // Guardamos o ID para saber qual linha atualizar
  const [priceId, setPriceId] = useState<string | null>(null);

  const [prices, setPrices] = useState({
    base_price: '0',
    weekend_multiplier: '1.2',
    cleaning_fee: '0',
    min_nights: '2',
    holiday_multiplier: '1.5'
  });

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('pricing_rules').select('*').maybeSingle();

    if (data) {
      setPriceId(data.id); // Importante: Guarda o ID da linha
      setPrices({
        base_price: data.base_price.toString(),
        weekend_multiplier: data.weekend_multiplier.toString(),
        cleaning_fee: data.cleaning_fee.toString(),
        min_nights: data.min_nights.toString(),
        holiday_multiplier: (data.holiday_multiplier || 1.5).toString()
      });
    } else if (error) {
      console.error('Erro ao carregar:', error);
    }
    setLoading(false);
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
      // CENÁRIO 1: Já existe preço, vamos ATUALIZAR
      const { error: updateError } = await supabase
        .from('pricing_rules')
        .update(payload)
        .eq('id', priceId);
      error = updateError;
    } else {
      // CENÁRIO 2: Tabela vazia, vamos CRIAR
      const { error: insertError, data } = await supabase
        .from('pricing_rules')
        .insert([payload])
        .select()
        .single();
      
      if (data) setPriceId(data.id); // Guarda o ID novo
      error = insertError;
    }

    if (!error) {
      setStatus({ type: 'success', msg: 'Preços atualizados com sucesso!' });
      // Remove mensagem de sucesso após 3 segundos
      setTimeout(() => setStatus({ type: null, msg: '' }), 3000);
    } else {
      setStatus({ type: 'error', msg: `Erro ao salvar: ${error.message || error.details}` });
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando configurações...</div>;

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
            saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2EC4B6] hover:bg-[#25a094] shadow-lg hover:shadow-xl'
          }`}
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      {status.msg && (
        <div className={`p-4 rounded-lg flex items-center gap-2 font-medium ${
          status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
          {status.msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Preços Base */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Valores Base</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diária Padrão (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">R$</span>
              <input
                type="number"
                value={prices.base_price}
                onChange={(e) => setPrices({...prices, base_price: e.target.value})}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B]"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Valor cobrado em dias de semana comuns.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Taxa de Limpeza (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">R$</span>
              <input
                type="number"
                value={prices.cleaning_fee}
                onChange={(e) => setPrices({...prices, cleaning_fee: e.target.value})}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B]"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Cobrado uma vez por reserva.</p>
          </div>
        </div>

        {/* Card: Regras e Multiplicadores */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Regras e Multiplicadores</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo de Noites</label>
            <input
              type="number"
              value={prices.min_nights}
              onChange={(e) => setPrices({...prices, min_nights: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Multiplicador de Fim de Semana</label>
            <input
              type="number"
              step="0.1"
              value={prices.weekend_multiplier}
              onChange={(e) => setPrices({...prices, weekend_multiplier: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ex: 1.2 aumenta o preço em 20% nas sextas, sábados e domingos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
