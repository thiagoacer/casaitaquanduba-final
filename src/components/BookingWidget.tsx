import { useState, useEffect } from 'react';
import { Calendar, Users, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PricingRules {
  base_price: number;
  weekend_multiplier: number;
  cleaning_fee: number;
  min_nights: number;
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
  
  const [pricing, setPricing] = useState<PricingRules>({
    base_price: 800,
    weekend_multiplier: 1.2,
    cleaning_fee: 250,
    min_nights: 2
  });
  
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  // 1. Carregar Preços e Datas Bloqueadas (VERSÃO BLINDADA)
  useEffect(() => {
    async function loadData() {
      try {
        // Carregar regras de preço
        const { data: prices } = await supabase.from('pricing_rules').select('*').maybeSingle();
        
        if (prices) {
          setPricing({
            base_price: Number(prices.base_price) || 800,
            weekend_multiplier: Number(prices.weekend_multiplier) || 1,
            cleaning_fee: Number(prices.cleaning_fee) || 0,
            min_nights: Number(prices.min_nights) || 2
          });
        }

        // Carregar datas bloqueadas
        const { data: blocks } = await supabase.from('blocked_dates').select('date');
        if (blocks) {
          setBlockedDates(blocks.map(b => b.date));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
    loadData();
  }, []);

  // 2. Função Inteligente de Cálculo de Preço
  const calculateTotal = () => {
    if (!checkIn || !checkOut) return null;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < pricing.min_nights) return null;

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
  };

  const totals = calculateTotal();

  // 3. Validação de Datas
  const isDateBlocked = (dateStr: string) => {
    return blockedDates.includes(dateStr);
  };

  const checkAvailability = () => {
    if (!checkIn || !checkOut) return true;
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    
    if (end <= start) return false;

    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      if (isDateBlocked(dateString)) {
        setErrorMessage(`A data ${new Date(d).toLocaleDateString('pt-BR')} já está ocupada.`);
        return false;
      }
    }
    
    setErrorMessage('');
    return true;
  };

  // 4. Enviar Pedido de Reserva
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAvailability()) return;
    
    setLoading(true);
    
    const { error } = await supabase.from('booking_inquiries').insert([
      {
        guest_name: name,
        guest_email: email,
        guest_phone: phone,
        check_in: checkIn,
        check_out: checkOut,
        num_guests: parseInt(guests),
        num_nights: totals?.nights,
        calculated_price: totals?.total,
        status: 'pending'
      }
    ]);

    if (error) {
      setStatus('error');
      setErrorMessage('Erro ao enviar reserva. Tente novamente.');
    } else {
      setStatus('success');
    }
    setLoading(false);
  };

  if (status === 'success') {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center border-2 border-green-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Solicitação Recebida!</h3>
        <p className="text-gray-600 mb-6">
          Obrigado, {name.split(' ')[0]}! Recebemos seu pedido para {new Date(checkIn).toLocaleDateString('pt-BR')}.
          <br/>Vamos verificar a disponibilidade e te chamar no WhatsApp em breve.
        </p>
        <button 
          onClick={() => setStatus('idle')}
          className="text-[#2EC4B6] font-semibold hover:underline"
        >
          Fazer nova simulação
        </button>
      </div>
    );
  }

  const isAvailable = checkAvailability();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-24">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          R$ {pricing.base_price} <span className="text-sm font-normal text-gray-500">/ noite</span>
        </h3>
        <p className="text-sm text-gray-500">Mínimo de {pricing.min_nights} noites</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase">Check-in</label>
            <div className="relative">
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent outline-none text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase">Check-out</label>
            <div className="relative">
              <input
                type="date"
                min={checkIn || new Date().toISOString().split('T')[0]}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent outline-none text-sm"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 uppercase">Hóspedes</label>
          <div className="relative">
            <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent outline-none appearance-none bg-white text-sm"
            >
              {[1,2,3,4,5,6,7,8].map(num => (
                <option key={num} value={num}>{num} pessoas</option>
              ))}
            </select>
          </div>
        </div>

        {totals && isAvailable && (
          <div className="space-y-3 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-4">
             <div className="flex justify-between text-sm text-gray-600">
              <span>{totals.nights} noites x R$ {totals.perNight} (méd)</span>
              <span>R$ {(totals.total - pricing.cleaning_fee).toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Taxa de limpeza</span>
              <span>R$ {pricing.cleaning_fee.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>R$ {totals.total.toLocaleString('pt-BR')}</span>
            </div>

            <div className="space-y-3 pt-2">
              <input
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                required
              />
              <input
                type="email"
                placeholder="Seu melhor email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                required
              />
              <input
                type="tel"
                placeholder="WhatsApp com DDD"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                required
              />
            </div>
          </div>
        )}

        {!isAvailable && errorMessage && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isAvailable || !totals}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2
            ${loading || !isAvailable || !totals
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#0A7B9B] to-[#2EC4B6] text-white hover:scale-[1.02]'
            }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Processando...
            </>
          ) : (
            'Solicitar Reserva'
          )}
        </button>
        
        <p className="text-xs text-center text-gray-500 mt-2">
          Você não será cobrado agora.
        </p>
      </form>
    </div>
  );
}
