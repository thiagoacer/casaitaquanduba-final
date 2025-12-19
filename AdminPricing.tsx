import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { clearPricingCache } from '../lib/pricing';

interface Season {
  id: string;
  name: string;
  start_month: number;
  end_month: number;
  color: string;
}

interface PricingRule {
  id: string;
  season_id: string;
  min_guests: number;
  max_guests: number;
  price_per_night: number;
}

export default function AdminPricing() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({
    type: null,
    msg: ''
  });

  // Config geral
  const [cleaningFee, setCleaningFee] = useState('300');
  const [discountPercentage, setDiscountPercentage] = useState('15');
  const [discountThreshold, setDiscountThreshold] = useState('7');

  // Temporadas e regras
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);

      // Carregar config geral
      const { data: configData } = await supabase
        .from('pricing_config')
        .select('*');

      if (configData) {
        const getConfigValue = (key: string, defaultVal: string) => {
          const item = configData.find(c => c.key === key);
          return item ? String(item.value) : defaultVal;
        };

        setCleaningFee(getConfigValue('cleaning_fee', '300'));
        setDiscountPercentage(getConfigValue('discount_percentage', '15'));
        setDiscountThreshold(getConfigValue('discount_threshold_nights', '7'));
      }

      // Carregar temporadas
      const { data: seasonsData } = await supabase
        .from('pricing_seasons')
        .select('*')
        .order('start_month');

      if (seasonsData) setSeasons(seasonsData);

      // Carregar regras de preço
      const { data: rulesData } = await supabase
        .from('pricing_rules')
        .select('*');

      if (rulesData) setRules(rulesData);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setStatus({ type: 'error', msg: 'Erro ao carregar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    setStatus({ type: null, msg: '' });

    try {
      // Atualizar ou inserir configs
      const configs = [
        { key: 'cleaning_fee', value: parseFloat(cleaningFee) },
        { key: 'discount_percentage', value: parseFloat(discountPercentage) },
        { key: 'discount_threshold_nights', value: parseInt(discountThreshold) }
      ];

      for (const config of configs) {
        const { error } = await supabase
          .from('pricing_config')
          .upsert({
            key: config.key,
            value: config.value,
            description: `Configuração de ${config.key}`
          }, {
            onConflict: 'key'
          });

        if (error) throw error;
      }

      // Limpar cache
      clearPricingCache();

      setStatus({ type: 'success', msg: 'Configurações salvas com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setStatus({ type: 'error', msg: 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRule = async (ruleId: string, newPrice: number) => {
    try {
      const { error } = await supabase
        .from('pricing_rules')
        .update({ price_per_night: newPrice })
        .eq('id', ruleId);

      if (error) throw error;

      // Atualizar estado local
      setRules(prev => prev.map(rule =>
        rule.id === ruleId ? { ...rule, price_per_night: newPrice } : rule
      ));

      clearPricingCache();
      setStatus({ type: 'success', msg: 'Preço atualizado!' });
    } catch (error) {
      console.error('Erro ao atualizar regra:', error);
      setStatus({ type: 'error', msg: 'Erro ao atualizar preço' });
    }
  };

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months[month - 1];
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#0A7B9B]" />
        Carregando painel de preços...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-[#0A7B9B]" />
          Configuração de Preços Dinâmicos
        </h1>
      </div>

      {/* Status Messages */}
      {status.msg && (
        <div className={`p-4 rounded-lg flex items-center gap-2 font-medium ${status.type === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
          }`}>
          {status.type === 'success'
            ? <CheckCircle className="w-5 h-5" />
            : <AlertCircle className="w-5 h-5" />}
          {status.msg}
        </div>
      )}

      {/* Seção 1: Configurações Gerais */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Configurações Gerais
          </h2>
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className={`px-6 py-2 rounded-lg font-bold text-white flex items-center gap-2 transition-all ${saving ? 'bg-gray-400' : 'bg-[#2EC4B6] hover:bg-[#25a094]'
              }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxa de Limpeza (R$)
            </label>
            <input
              type="number"
              value={cleaningFee}
              onChange={(e) => setCleaningFee(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B] outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Cobrado uma única vez por reserva</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desconto (%)
            </label>
            <input
              type="number"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B] outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Para estadias longas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mínimo de Noites para Desconto
            </label>
            <input
              type="number"
              value={discountThreshold}
              onChange={(e) => setDiscountThreshold(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B] outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Noites necessárias para ganhar desconto</p>
          </div>
        </div>
      </div>

      {/* Seção 2: Preços por Temporada */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Preços por Temporada e Número de Hóspedes
        </h2>

        <div className="space-y-6">
          {seasons.map(season => {
            const seasonRules = rules.filter(r => r.season_id === season.id);

            return (
              <div key={season.id} className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{season.name}</h3>
                    <p className="text-sm text-gray-500">
                      {getMonthName(season.start_month)} - {getMonthName(season.end_month)}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {seasonRules.map(rule => (
                    <div key={rule.id} className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {rule.min_guests}-{rule.max_guests} hóspedes
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-medium">R$</span>
                        <input
                          type="number"
                          value={rule.price_per_night}
                          onChange={(e) => {
                            const newPrice = parseFloat(e.target.value);
                            if (!isNaN(newPrice)) {
                              handleUpdateRule(rule.id, newPrice);
                            }
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B] outline-none"
                        />
                        <span className="text-gray-500 text-sm">/noite</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Dica:</strong> Os preços são aplicados automaticamente no widget de reservas
          baseado na data de check-in e número de hóspedes selecionados.
        </p>
      </div>
    </div>
  );
}
