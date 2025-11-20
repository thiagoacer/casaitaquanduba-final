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
    <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray
