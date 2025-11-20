import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, Save, AlertCircle, CheckCircle, Calendar, Users, Settings } from 'lucide-react';

interface PricingConfig {
  id: string;
  key: string;
  value: number;
  description: string;
}

interface Season {
  id: string;
  name: string;
  start_month: number;
  end_month: number;
  start_day: number;
  end_day: number;
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
  const [configs, setConfigs] = useState<PricingConfig[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [priceData, setPriceData] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const guestRanges = [
    { min: 1, max: 6, label: '1-6 pessoas' },
    { min: 7, max: 8, label: '7-8 pessoas' },
    { min: 9, max: 10, label: '9-10 pessoas' },
  ];

  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = async () => {
    setLoading(true);
    try {
      const [configResult, seasonsResult, rulesResult] = await Promise.all([
        supabase.from('pricing_config').select('*').order('key'),
        supabase.from('pricing_seasons').select('*').order('start_month'),
        supabase.from('pricing_rules').select('*'),
      ]);

      if (configResult.data) setConfigs(configResult.data);
      if (seasonsResult.data) setSeasons(seasonsResult.data);
      if (rulesResult.data) {
        setPricingRules(rulesResult.data);
        const priceMap: { [key: string]: number } = {};
        rulesResult.data.forEach((rule) => {
          const key = `${rule.season_id}-${rule.min_guests}-${rule.max_guests}`;
          priceMap[key] = rule.price_per_night;
        });
        setPriceData(priceMap);
      }
    } catch (error) {
      console.error('Error loading pricing data:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados de preços' });
    } finally {
      setLoading(false);
    }
  };

  const getConfigValue = (key: string): number => {
    const config = configs.find((c) => c.key === key);
    return config ? config.value : 0;
  };

  const updateConfigValue = (key: string, value: number) => {
    setConfigs((prev) =>
      prev.map((c) => (c.key === key ? { ...c, value } : c))
    );
  };

  const updatePrice = (seasonId: string, minGuests: number, maxGuests: number, price: number) => {
    const key = `${seasonId}-${minGuests}-${maxGuests}`;
    setPriceData((prev) => ({ ...prev, [key]: price }));
  };

  const getPrice = (seasonId: string, minGuests: number, maxGuests: number): number => {
    const key = `${seasonId}-${minGuests}-${maxGuests}`;
    return priceData[key] || 0;
  };

  const handleSaveConfigs = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const updates = configs.map((config) =>
        supabase
          .from('pricing_config')
          .update({ value: config.value })
          .eq('id', config.id)
      );

      await Promise.all(updates);

      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving configs:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrices = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const updates: PromiseLike<any>[] = [];

      seasons.forEach((season) => {
        guestRanges.forEach((range) => {
          const price = getPrice(season.id, range.min, range.max);
          const existingRule = pricingRules.find(
            (r) =>
              r.season_id === season.id &&
              r.min_guests === range.min &&
              r.max_guests === range.max
          );

          if (existingRule) {
            updates.push(
              supabase
                .from('pricing_rules')
                .update({ price_per_night: price })
                .eq('id', existingRule.id)
                .then()
            );
          } else {
            updates.push(
              supabase.from('pricing_rules').insert({
                season_id: season.id,
                min_guests: range.min,
                max_guests: range.max,
                price_per_night: price,
              })
              .then()
            );
          }
        });
      });

      await Promise.all(updates);
      await loadPricingData();

      setMessage({ type: 'success', text: 'Preços atualizados com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving prices:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar preços' });
    } finally {
      setSaving(false);
    }
  };

  const getMonthName = (month: number): string => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months[month - 1] || '';
  };

  const getSeasonMonths = (season: Season): string[] => {
    const months: string[] = [];

    if (season.name === 'Alta Temporada') {
      return ['Dez', 'Jan', 'Fev', 'Jul'];
    } else if (season.name === 'Média Temporada') {
      return ['Mar', 'Abr', 'Mai', 'Jun', 'Ago', 'Set', 'Out'];
    } else if (season.name === 'Baixa Temporada') {
      return ['Nov'];
    }

    if (season.start_month === season.end_month) {
      months.push(getMonthName(season.start_month));
    } else if (season.start_month > season.end_month) {
      for (let m = season.start_month; m <= 12; m++) {
        months.push(getMonthName(m));
      }
      for (let m = 1; m <= season.end_month; m++) {
        months.push(getMonthName(m));
      }
    } else {
      for (let m = season.start_month; m <= season.end_month; m++) {
        months.push(getMonthName(m));
      }
    }

    return months;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando configurações de preços...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Preços</h1>
        <DollarSign className="w-8 h-8 text-[#0A7B9B]" />
      </div>

      {message && (
        <div
          className={`rounded-xl p-4 flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border-2 border-green-200'
              : 'bg-red-50 border-2 border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900">Configurações Gerais</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Taxa de Limpeza (R$)
            </label>
            <input
              type="number"
              value={getConfigValue('cleaning_fee')}
              onChange={(e) => updateConfigValue('cleaning_fee', Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B] focus:border-transparent"
              min="0"
              step="10"
            />
            <p className="text-xs text-gray-500 mt-1">Valor único por estadia</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Desconto (%)
            </label>
            <input
              type="number"
              value={getConfigValue('discount_percentage')}
              onChange={(e) => updateConfigValue('discount_percentage', Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B] focus:border-transparent"
              min="0"
              max="100"
              step="1"
            />
            <p className="text-xs text-gray-500 mt-1">Para estadias longas</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mínimo de Noites para Desconto
            </label>
            <input
              type="number"
              value={getConfigValue('discount_threshold_nights')}
              onChange={(e) => updateConfigValue('discount_threshold_nights', Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B] focus:border-transparent"
              min="1"
              step="1"
            />
            <p className="text-xs text-gray-500 mt-1">Número de noites</p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSaveConfigs}
            disabled={saving}
            className="bg-[#0A7B9B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2EC4B6] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Tabela de Preços por Temporada</h2>
          </div>
          <button
            onClick={handleSavePrices}
            disabled={saving}
            className="bg-[#0A7B9B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2EC4B6] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Salvando...' : 'Salvar Todos os Preços'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-4 px-6 font-bold text-gray-900 border-b-2 border-gray-200">
                  Temporada
                </th>
                {guestRanges.map((range) => (
                  <th key={`header-${range.min}-${range.max}`} className="text-center py-4 px-6 font-bold text-gray-900 border-b-2 border-gray-200">
                    <div className="flex flex-col items-center gap-1">
                      <Users className="w-5 h-5 text-gray-600" />
                      <span>{range.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seasons.map((season) => (
                <tr key={season.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-6 px-6">
                    <div className="flex flex-col gap-2">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${season.color} text-white font-bold text-sm w-fit`}>
                        {season.name}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getSeasonMonths(season).map((month) => (
                          <span
                            key={month}
                            className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
                          >
                            {month}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  {guestRanges.map((range) => (
                    <td key={`${season.id}-${range.min}-${range.max}`} className="py-6 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">R$</span>
                        <input
                          type="number"
                          value={getPrice(season.id, range.min, range.max)}
                          onChange={(e) =>
                            updatePrice(season.id, range.min, range.max, Number(e.target.value))
                          }
                          className="w-28 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A7B9B] focus:border-transparent text-right font-bold text-gray-900"
                          min="0"
                          step="50"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">por noite</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSavePrices}
            disabled={saving}
            className="bg-[#0A7B9B] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2EC4B6] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Salvando...' : 'Salvar Todos os Preços'}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Informações Importantes</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• As alterações são aplicadas imediatamente no site público após salvar</li>
              <li>• Os preços são exibidos para os visitantes em tempo real</li>
              <li>• Certifique-se de revisar todos os valores antes de salvar</li>
              <li>• O desconto é aplicado automaticamente para estadias acima do número mínimo de noites configurado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
