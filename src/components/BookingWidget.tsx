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
  const [calculating, setCalculating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [pricing, setPricing] = useState<PricingRules>({
    base_price: 800,
    weekend_multiplier: 1.2,
    cleaning_fee: 250,
    min_nights: 2
  });
  
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  // 1. Carregar Preços e Datas Bloqueadas ao abrir o site
  useEffect(() => {
    async function loadData() {
      // Carregar regras de preço
      const { data: prices } = await supabase.from('pricing_rules').select('*').single();
      if (prices) setPricing(prices);

      // Carregar datas bloqueadas (do Airbnb + Manuais)
      const { data: blocks } = await supabase.from('blocked_dates').select('date');
      if (blocks) {
        setBlockedDates(blocks.map(b => b.date)); // Cria uma lista simples de datas ['2025-12-25', '2025-12-26']
      }
    }
    loadData();
  }, []);

  // 2. Função Inteligente de Cálculo de Preço
  const calculateTotal = () => {
    if (!checkIn || !checkOut) return null;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    
    // Diferença em dias
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < pricing.min_nights) return null;

    let totalPrice = 0;
    let currentDate = new Date(start);

    // Loop dia a dia para ver se é fim de semana
    for (let i = 0; i < diffDays; i++) {
      const dayOfWeek = currentDate.getDay(); // 0 = Domingo, 6 = Sábado
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6; // Sex, Sab, Dom conta como FDS
      
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

  // 3. Validação de Datas (O Guardião)
  const isDateBlocked = (dateStr: string) => {
    return blockedDates.includes(dateStr);
  };

  const checkAvailability = () => {
    if (!checkIn || !checkOut) return true;
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    
    // Verifica se o check-out é antes do check-in
    if (end <= start) return false;

    // Verifica se tem algum bloqueio no meio do período escolhido
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
            <label className="block text-xs font-medium text-gray
