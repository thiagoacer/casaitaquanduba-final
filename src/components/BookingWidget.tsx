import { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, Loader2, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PricingRules {
  base_price: number;
  weekend_multiplier: number;
  cleaning_fee: number;
  min_nights: number;
}

interface Totals {
  nights: number;
  total: number;
  perNight: number;
}

export default function BookingWidget() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [totals, setTotals] = useState<Totals | null>(null);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  const [pricing, setPricing] = useState<PricingRules>({
    base_price: 800,
    weekend_multiplier: 1.2,
    cleaning_fee: 250,
    min_nights: 2
  });
  
  // 1. Carregar Dados (Banco de Dados)
  useEffect(() => {
    async function loadData() {
      try {
        const { data: prices } = await supabase.from('pricing_rules').select('*').maybeSingle();
        if (prices) {
          setPricing({
            base_price: Number(prices.base_price) || 800,
            weekend_multiplier: Number(prices.weekend_multiplier) || 1,
            cleaning_fee: Number(prices.cleaning_fee) || 0,
            min_nights: Number(prices.min_nights) || 2
          });
        }
        const { data: blocks } = await supabase.from('blocked_dates').select('date');
        if (blocks) setBlockedDates(blocks.map(b => b.date));
      } catch (error) {
        console.error("Erro ao carregar:", error);
      }
    }
    loadData();
  }, []);

  // 2. Cálculo Seguro (Sem Loop)
  const calculateValues = useCallback(() => {
    if (!checkIn || !checkOut) return null;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < pricing.min_nights) return null;
    if (diffDays > 45) return null; 

    let totalPrice = 0;
    let currentDate = new Date(start);

    for (let i = 0; i < diffDays; i++) {
      const dayOfWeek = currentDate.getDay(); 
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
      
      totalPrice += isWeekend 
        ? pricing.base_price * pricing.weekend_multiplier 
        : pricing.base_price;

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      nights: diffDays,
      total: totalPrice + pricing.cleaning_fee,
      perNight: Math.round(totalPrice / diffDays)
    };
  }, [checkIn, checkOut, pricing]);

  useEffect(() => {
    const result = calculateValues();
    setTotals(result);
  }, [calculateValues]);

  // 3. Validação de Datas
  const isDateBlocked = (dateStr: string) => blockedDates.includes(dateStr);

  const checkAvailability = () => {
    if (!checkIn || !checkOut) return true;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (end <= start) return false;

    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      if (isDateBlocked(d.toISOString().split('T')[0])) return false;
    }
    return true;
  };

  const isAvailable = checkAvailability();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable) return;
    setLoading(true);
    
    const { error } = await supabase.from('booking_inquiries').insert([{
        guest_name: name, guest_email: email, guest_phone: phone,
        check_in: checkIn, check_out: checkOut, num_guests: parseInt(guests),
        num_nights: totals?.nights, calculated_price: totals?.total, status: 'pending'
    }]);

    if (error) {
      setStatus('error');
      setErrorMessage('Erro técnico. Tente novamente.');
    } else {
      setStatus('success');
    }
    setLoading(false);
  };
  // --- TELA DE SUCESSO ---
  if (status === 'success') {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center border-2 border-[#2EC4B6]/20 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-[#E5F6F5] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[#2EC4B6]" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Solicitação Enviada!</h3>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Recebemos seu pedido para <strong>{new Date(checkIn).toLocaleDateString('pt-BR')}</strong>.<br/>
          Vamos verificar a disponibilidade final e te chamar no WhatsApp em instantes.
        </p>
        <button onClick={() => setStatus('idle')} className="text-[#0A7B9B] font-bold hover:text-[#08607a] transition-colors">
          Fazer nova simulação
        </button>
      </div>
    );
  }

  // --- WIDGET PRINCIPAL ---
  return (
    <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 sticky top-24">
      
      {/* CABEÇALHO DE PREÇO */}
      <div className="flex items-baseline justify-between mb-6 border-b border-gray-100 pb-6">
        <div>
          <span className="text-3xl font-bold text-gray-900">R$ {pricing.base_price}</span>
          <span className="text-gray-500 ml-1">/ noite</span>
        </div>
        <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
          Min. {pricing.min_nights} noites
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* DATAS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Check-in</label>
            <div className="relative group">
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent outline-none transition-all text-gray-700 font-medium"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Check-out</label>
            <div className="relative group">
              <input
                type="date"
                min={checkIn || new Date().toISOString().split('T')[0]}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent outline-none transition-all text-gray-700 font-medium"
                required
              />
            </div>
          </div>
        </div>

        {/* HÓSPEDES */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Hóspedes</label>
          <div className="relative">
            <Users className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
            <select 
              value={guests} 
              onChange={(e) => setGuests(e.target.value)} 
              className="w-full p-3 pl-11 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent outline-none appearance-none text-gray-700 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
            >
              {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>{num} pessoas</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* RESUMO DE VALORES (Animado) */}
        {totals && isAvailable && (
          <div className="mt-6 pt-6 border-t border-gray-100 animate-in slide-in-from-top-4 fade-in duration-300 space-y-4">
            
            {/* Linhas de Cálculo */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>{totals.nights} noites x R$ {totals.perNight} (médio)</span>
                <span>R$ {(totals.total - pricing.cleaning_fee).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de limpeza</span>
                <span>R$ {pricing.cleaning_fee.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {/* Total Final */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="font-bold text-gray-900">Total estimado</span>
              <span className="text-xl font-bold text-[#0A7B9B]">R$ {totals.total.toLocaleString('pt-BR')}</span>
            </div>

            {/* Inputs de Contato */}
            <div className="space-y-3 pt-2">
              <input type="text" placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} 
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2EC4B6] outline-none transition-shadow" required />
              <input type="email" placeholder="Seu melhor email" value={email} onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2EC4B6] outline-none transition-shadow" required />
              <input type="tel" placeholder="WhatsApp / Celular" value={phone} onChange={(e) => setPhone(e.target.value)} 
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2EC4B6] outline-none transition-shadow" required />
            </div>
          </div>
        )}

        {/* AVISO DE INDISPONIBILIDADE */}
        {!isAvailable && checkIn && checkOut && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm flex items-center gap-3 border border-red-100 animate-in shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Ops! Essas datas já estão reservadas. Tente outros dias.</span>
          </div>
        )}

        {/* BOTÃO DE AÇÃO */}
        <button
          type="submit"
          disabled={loading || !isAvailable || !totals}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 transform
            ${loading || !isAvailable || !totals
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-[#0A7B9B] to-[#2EC4B6] text-white hover:shadow-xl hover:-translate-y-1 active:translate-y-0'
            }`}
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Solicitar Reserva'}
        </button>

        <p className="text-xs text-center text-gray-400 font-medium">
          Nenhuma cobrança será feita agora.
        </p>
      </form>
    </div>
  );
}
