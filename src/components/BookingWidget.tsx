import { useState, useEffect, useCallback } from 'react';
import { Users, Loader2, AlertCircle, CheckCircle, Calendar as CalendarIcon, ChevronDown, Star } from 'lucide-react';
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
  // Estados do Formulário
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  
  // Estados do Lead (Só aparecem depois)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Estados de Controle
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [totals, setTotals] = useState<Totals | null>(null);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  // Preços Padrão
  const [pricing, setPricing] = useState<PricingRules>({
    base_price: 800,
    weekend_multiplier: 1.2,
    cleaning_fee: 250,
    min_nights: 2
  });
  
  // 1. CARREGAR DADOS
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

  // 2. CÁLCULO DE PREÇO
  const calculateValues = useCallback(() => {
    if (!checkIn || !checkOut) return null;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < pricing.min_nights) return null;
    if (diffDays > 60) return null; 

    let totalPrice = 0;
    let currentDate = new Date(start);

    for (let i = 0; i < diffDays; i++) {
      const dayOfWeek = currentDate.getDay(); 
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
      totalPrice += isWeekend ? pricing.base_price * pricing.weekend_multiplier : pricing.base_price;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      nights: diffDays,
      total: totalPrice + pricing.cleaning_fee,
      perNight: Math.round(totalPrice / diffDays)
    };
  }, [checkIn, checkOut, pricing]);

  // Atualiza totais e controla a exibição do formulário de Lead
  useEffect(() => {
    const result = calculateValues();
    setTotals(result);
    
    // Se tiver datas válidas e totais calculados, mostramos o form de lead
    if (result && checkIn && checkOut) {
      setShowLeadForm(true);
    } else {
      setShowLeadForm(false);
    }
  }, [calculateValues, checkIn, checkOut]);

  // 3. VALIDAÇÃO
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

  // 4. ENVIO
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable) return;
    if (!name || !email || !phone) {
      setErrorMessage('Por favor, preencha seus dados de contato.');
      return;
    }

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

  // TELA DE SUCESSO
  if (status === 'success') {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center border-2 border-[#2EC4B6]/20 animate-in fade-in zoom-in">
        <div className="w-20 h-20 bg-[#E5F6F5] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[#2EC4B6]" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Reserva Solicitada!</h3>
        <p className="text-gray-600 mb-6">
          Recebemos seu pedido para <strong>{new Date(checkIn).toLocaleDateString('pt-BR')}</strong>.<br/>
          Verifique seu WhatsApp em breve.
        </p>
        <button onClick={() => setStatus('idle')} className="text-[#0A7B9B] font-bold hover:underline">
          Fazer nova simulação
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_6px_30px_rgba(0,0,0,0.12)] border border-gray-200 overflow-hidden sticky top-24">
      
      {/* HEADER DO CARD */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">R$ {pricing.base_price}</span>
            <span className="text-gray-500 text-sm"> noite</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Star className="w-4 h-4 fill-current text-[#0A7B9B]" />
            <span className="font-medium">Superhost</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        
        {/* BOX DE DATAS (ESTILO AIRBNB) */}
        <div className="border border-gray-400 rounded-xl overflow-hidden grid grid-cols-2 relative">
          {/* CHECK-IN */}
          <div className="p-3 border-r border-gray-400 hover:bg-gray-50 transition-colors relative">
            <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1">Check-in</label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent p-0 text-sm text-gray-700 font-medium outline-none cursor-pointer placeholder-transparent"
              required
            />
          </div>

          {/* CHECK-OUT */}
          <div className="p-3 hover:bg-gray-50 transition-colors relative">
            <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1">Check-out</label>
            <input
              type="date"
              min={checkIn || new Date().toISOString().split('T')[0]}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent p-0 text-sm text-gray-700 font-medium outline-none cursor-pointer"
              required
            />
          </div>

          {/* HÓSPEDES (LINHA DE BAIXO) */}
          <div className="col-span-2 border-t border-gray-400 p-3 hover:bg-gray-50 transition-colors relative flex items-center justify-between">
            <div className="w-full">
              <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1">Hóspedes</label>
              <select 
                value={guests} 
                onChange={(e) => setGuests(e.target.value)} 
                className="w-full bg-transparent text-sm text-gray-700 font-medium outline-none appearance-none cursor-pointer"
              >
                {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>{num} hóspedes</option>)}
              </select>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* MENSAGEM DE ERRO DE DATA */}
        {!isAvailable && checkIn && checkOut && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4" /> Datas indisponíveis.
          </div>
        )}

        {/* ÁREA EXPANSÍVEL (CAPTAÇÃO DO LEAD) */}
        {showLeadForm && isAvailable && totals && (
          <div className="animate-in slide-in-from-top-4 fade-in duration-500 pt-4 space-y-4">
            
            {/* Resumo de Preço */}
            <div className="space-y-2 pb-4 border-b border-gray-100">
              <div className="flex justify-between text-sm text-gray-600">
                <span className="underline decoration-gray-300">{totals.nights} noites x R$ {totals.perNight}</span>
                <span>R$ {(totals.total - pricing.cleaning_fee).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span className="underline decoration-gray-300">Taxa de limpeza</span>
                <span>R$ {pricing.cleaning_fee.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2">
                <span>Total</span>
                <span>R$ {totals.total.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {/* Inputs do Lead */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase">Seus dados para reserva</p>
              <input type="text" placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2EC4B6] outline-none" />
              
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2EC4B6] outline-none" />
              
              <input type="tel" placeholder="WhatsApp / Celular" value={phone} onChange={(e) => setPhone(e.target.value)} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2EC4B6] outline-none" />
            </div>
            
            {errorMessage && <p className="text-red-500 text-xs text-center">{errorMessage}</p>}
          </div>
        )}

        {/* BOTÃO PRINCIPAL */}
        <button
          type="submit"
          disabled={loading || !isAvailable}
          className={`w-full py-3.5 rounded-xl font-bold text-lg text-white shadow-md transition-all transform active:scale-95
            ${loading 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#E61E4D] to-[#D80565] hover:brightness-110' // Cor estilo Airbnb
            }`}
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (showLeadForm ? 'Reservar' : 'Verificar disponibilidade')}
        </button>
        
        <p className="text-xs text-center text-gray-500">
          Não cobraremos nada agora.
        </p>

      </form>
    </div>
  );
}
