import { useState, useEffect } from 'react';
import { Check, MessageCircle, AlertCircle } from 'lucide-react';
import DatePicker from './DatePicker';
import GuestSelector, { guestOptions } from './GuestSelector';
import ContactForm, { ContactFormData } from './ContactForm';
import LargeGroupForm from './LargeGroupForm';
import { calculatePrice, formatCurrency, PriceBreakdown } from '../lib/pricing';
import { supabase } from '../lib/supabase';

type BookingStep = 'selection' | 'contact' | 'price' | 'success';

export default function BookingWidget() {
  const [showLargeGroupForm, setShowLargeGroupForm] = useState(false);
  const [step, setStep] = useState<BookingStep>('selection');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guestRange, setGuestRange] = useState<string>('');
  const [contactData, setContactData] = useState<ContactFormData | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBlockedDates();
  }, []);

  const loadBlockedDates = async () => {
    try {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('blocked_date');

      if (error) throw error;

      if (data) {
        const dates = data.map(item => new Date(item.blocked_date));
        setBlockedDates(dates);
      }
    } catch (err) {
      console.error('Error loading blocked dates:', err);
    }
  };

  useEffect(() => {
    if (guestRange === '10+') {
      setShowLargeGroupForm(true);
    } else {
      setShowLargeGroupForm(false);
    }
  }, [guestRange]);

  const canProceedToContact = () => {
    return checkIn && checkOut && guestRange && guestRange !== '10+';
  };

  const handleContactSubmit = async (data: ContactFormData) => {
    setContactData(data);
    setIsSubmitting(true);

    if (checkIn && checkOut && guestRange) {
      const breakdown = await calculatePrice(checkIn, checkOut, guestRange);
      setPriceBreakdown(breakdown);
      setStep('price');
    }

    setIsSubmitting(false);
  };

  const handleBookingSubmit = async () => {
    if (!checkIn || !checkOut || !contactData || !priceBreakdown) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const guestOption = guestOptions.find(opt => opt.value === guestRange);
      const avgGuests = guestOption ? Math.ceil((guestOption.min + guestOption.max) / 2) : 1;

      const { error: insertError } = await supabase
        .from('booking_inquiries')
        .insert({
          guest_name: contactData.name,
          guest_email: contactData.email,
          guest_phone: contactData.phone,
          check_in: checkIn.toISOString().split('T')[0],
          check_out: checkOut.toISOString().split('T')[0],
          num_guests: avgGuests,
          num_nights: priceBreakdown.numNights,
          calculated_price: priceBreakdown.total,
          discount_applied: priceBreakdown.discountApplied,
          status: 'pending',
          is_large_group: false
        });

      if (insertError) throw insertError;

      setStep('success');
    } catch (err) {
      console.error('Error submitting booking:', err);
      setError('Erro ao enviar solicitação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('selection');
    setCheckIn(null);
    setCheckOut(null);
    setGuestRange('');
    setContactData(null);
    setPriceBreakdown(null);
    setError(null);
  };

  const getWhatsAppLink = () => {
    if (!checkIn || !checkOut || !contactData) return '#';

    const message = `Olá! Gostaria de fazer uma reserva na Casa Itaquanduba.\n\nDados:\nNome: ${contactData.name}\nCheck-in: ${checkIn.toLocaleDateString('pt-BR')}\nCheck-out: ${checkOut.toLocaleDateString('pt-BR')}\nPessoas: ${guestRange}\n${priceBreakdown ? `Valor: ${formatCurrency(priceBreakdown.total)}` : ''}`;

    return `https://wa.me/5511992364885?text=${encodeURIComponent(message)}`;
  };

  const handleBackFromLargeGroup = () => {
    setGuestRange('');
    setShowLargeGroupForm(false);
  };

  if (showLargeGroupForm) {
    return <LargeGroupForm onBack={handleBackFromLargeGroup} />;
  }

  if (step === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Solicitação Enviada com Sucesso!
          </h3>
          <p className="text-gray-600 mb-6">
            Recebemos sua solicitação de reserva. Entraremos em contato em breve para confirmar os detalhes.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
            <h4 className="font-bold text-gray-900 mb-3">Resumo da Reserva</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Check-in:</span>
                <span className="font-semibold">{checkIn?.toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-out:</span>
                <span className="font-semibold">{checkOut?.toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Pessoas:</span>
                <span className="font-semibold">{guestOptions.find(opt => opt.value === guestRange)?.label}</span>
              </div>
              {priceBreakdown && (
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-[#0A7B9B]">{formatCurrency(priceBreakdown.total)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#20BA5A] transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Contactar via WhatsApp
            </a>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
            >
              Nova Consulta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-[#0A7B9B] to-[#2EC4B6] p-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
          Consultar Disponibilidade e Preços
        </h2>
        <p className="text-white/90 text-center mt-2">
          Selecione as datas e o número de pessoas para calcular o valor
        </p>
      </div>

      <div className="p-6 md:p-8">
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <DatePicker
              checkIn={checkIn}
              checkOut={checkOut}
              onCheckInChange={setCheckIn}
              onCheckOutChange={setCheckOut}
              blockedDates={blockedDates}
            />
          </div>

          <div className="space-y-6">
            <GuestSelector value={guestRange} onChange={setGuestRange} />

            {step === 'selection' && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  Selecione as datas e o número de pessoas para prosseguir com sua solicitação.
                </p>
              </div>
            )}

            {step === 'selection' && canProceedToContact() && (
              <button
                onClick={() => setStep('contact')}
                className="w-full bg-[#0A7B9B] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#2EC4B6] transition-all transform hover:scale-[1.02]"
              >
                Continuar
              </button>
            )}

            {step === 'contact' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Seus Dados de Contacto
                </h3>
                <ContactForm
                  onSubmit={handleContactSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}

            {step === 'price' && priceBreakdown && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Detalhes do Preço
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-700">
                      <span>{formatCurrency(priceBreakdown.pricePerNight)} × {priceBreakdown.numNights} noites</span>
                      <span className="font-semibold">{formatCurrency(priceBreakdown.subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-gray-700">
                      <span>Taxa de limpeza</span>
                      <span className="font-semibold">{formatCurrency(priceBreakdown.cleaningFee)}</span>
                    </div>

                    {priceBreakdown.discountApplied && (
                      <div className="flex justify-between text-green-600">
                        <span>Desconto (15% - 7+ noites)</span>
                        <span className="font-semibold">-{formatCurrency(priceBreakdown.discountAmount)}</span>
                      </div>
                    )}

                    <div className="border-t-2 border-gray-200 pt-3 flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-[#0A7B9B]">
                        {formatCurrency(priceBreakdown.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBookingSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-[#0A7B9B] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#2EC4B6] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? 'Enviando...' : 'Confirmar Solicitação'}
                </button>

                <button
                  onClick={handleReset}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Fazer Nova Consulta
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Informações Importantes
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Taxa de limpeza: <span className="font-semibold">R$ 300</span> (pagamento único)</li>
            <li>• <span className="font-semibold text-[#0A7B9B]">Desconto de 15%</span> para estadias acima de 7 dias</li>
            <li>• Pagamento via PIX, transferência ou cartão</li>
            <li>• Cancelamento flexível até 7 dias antes do check-in</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
