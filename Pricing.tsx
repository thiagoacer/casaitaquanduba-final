import { useState, useEffect } from 'react';
import { Users, Calendar, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/pricing';

interface Season {
  id: string;
  name: string;
  start_month: number;
  end_month: number;
  color: string;
}


interface PricingDisplay {
  season: string;
  period: string;
  color: string;
  featured?: boolean;
  prices: Array<{
    guests: string;
    price: string;
    unit: string;
  }>;
}

export default function Pricing() {
  const [pricingData, setPricingData] = useState<PricingDisplay[]>([]);
  const [cleaningFee, setCleaningFee] = useState(300);
  const [discountPercentage, setDiscountPercentage] = useState(15);
  const [discountThreshold, setDiscountThreshold] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = async () => {
    try {
      const [seasonsResult, rulesResult, configResult] = await Promise.all([
        supabase.from('pricing_seasons').select('*').order('start_month'),
        supabase.from('pricing_rules').select('*'),
        supabase.from('pricing_config').select('*'),
      ]);

      if (configResult.data) {
        const getConfigValue = (key: string, defaultValue: number): number => {
          const config = configResult.data?.find((c) => c.key === key);
          return config ? Number(config.value) : defaultValue;
        };

        setCleaningFee(getConfigValue('cleaning_fee', 300));
        setDiscountPercentage(getConfigValue('discount_percentage', 15));
        setDiscountThreshold(getConfigValue('discount_threshold_nights', 7));
      }

      if (seasonsResult.data && rulesResult.data) {
        const priceMap = new Map<string, number>();
        rulesResult.data.forEach((rule) => {
          const key = `${rule.season_id}-${rule.min_guests}-${rule.max_guests}`;
          priceMap.set(key, rule.price_per_night);
        });

        const guestRanges = [
          { min: 1, max: 6, label: '1-6 pessoas' },
          { min: 7, max: 8, label: '7-8 pessoas' },
          { min: 9, max: 10, label: '9-10 pessoas' },
        ];

        const getMonthName = (month: number): string => {
          const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          return months[month - 1] || '';
        };

        const getSeasonPeriod = (season: Season): string => {
          if (season.start_month === season.end_month) {
            return getMonthName(season.start_month);
          }
          if (season.start_month > season.end_month) {
            return `${getMonthName(season.start_month)}-${getMonthName(season.end_month)}`;
          }
          return `${getMonthName(season.start_month)}-${getMonthName(season.end_month)}`;
        };

        const displayData: PricingDisplay[] = seasonsResult.data.map((season, index) => ({
          season: season.name,
          period: getSeasonPeriod(season),
          color: season.color || 'from-blue-500 to-cyan-500',
          featured: index === 1,
          prices: guestRanges.map((range) => {
            const key = `${season.id}-${range.min}-${range.max}`;
            const price = priceMap.get(key) || 0;
            return {
              guests: range.label,
              price: formatCurrency(price),
              unit: '/noite',
            };
          }),
        }));

        setPricingData(displayData);
      }
    } catch (error) {
      console.error('Error loading pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-gray-600">Carregando preços...</div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Preços Transparentes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Valores justos e sem surpresas. Quanto mais tempo, maior o desconto!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {pricingData.map((season, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all hover:scale-105 ${
                season.featured ? 'ring-4 ring-[#2EC4B6] scale-105' : ''
              }`}
            >
              {season.featured && (
                <div className="absolute top-4 right-4">
                  <span className="bg-[#2EC4B6] text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Mais Popular
                  </span>
                </div>
              )}

              <div className={`bg-gradient-to-br ${season.color} p-6 text-white`}>
                <h3 className="text-2xl font-bold mb-2">{season.season}</h3>
                <p className="text-white/90 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {season.period}
                </p>
              </div>

              <div className="p-6 space-y-4">
                {season.prices.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{item.guests}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-gray-900">{item.price}</div>
                      <div className="text-sm text-gray-500">{item.unit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Informações Adicionais
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Taxa de limpeza: <span className="font-semibold">{formatCurrency(cleaningFee)}</span> (pagamento único)</li>
                <li>• <span className="font-semibold text-[#0A7B9B]">Desconto de {discountPercentage}%</span> para estadias acima de {discountThreshold} dias</li>
                <li>• Pagamento via PIX, transferência ou cartão</li>
              </ul>
            </div>
            <a
              href="https://wa.me/5511992364885?text=Olá!%20Gostaria%20de%20consultar%20disponibilidade%20e%20preços%20para%20a%20Casa%20Itaquanduba"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#2EC4B6] text-white px-8 py-4 rounded-full font-bold hover:bg-[#26a89c] transition-all transform hover:scale-105 whitespace-nowrap"
            >
              Solicitar Orçamento
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
