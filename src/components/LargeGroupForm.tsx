import { useState } from 'react';
import { User, Mail, Phone, Users, Calendar, MessageCircle, Check, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LargeGroupFormProps {
  onBack?: () => void;
}

interface LargeGroupFormData {
  name: string;
  email: string;
  phone: string;
  numGuests: string;
  desiredDates: string;
  notes: string;
}

export default function LargeGroupForm({ onBack }: LargeGroupFormProps) {
  const [formData, setFormData] = useState<LargeGroupFormData>({
    name: '',
    email: '',
    phone: '',
    numGuests: '',
    desiredDates: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<LargeGroupFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleChange = (field: keyof LargeGroupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<LargeGroupFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Telefone inválido';
    }

    if (!formData.numGuests.trim()) {
      newErrors.numGuests = 'Número de pessoas é obrigatório';
    }

    if (!formData.desiredDates.trim()) {
      newErrors.desiredDates = 'Datas desejadas são obrigatórias';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);

      const { error } = await supabase
        .from('booking_inquiries')
        .insert({
          guest_name: formData.name,
          guest_email: formData.email,
          guest_phone: formData.phone,
          check_in: today.toISOString().split('T')[0],
          check_out: futureDate.toISOString().split('T')[0],
          num_guests: parseInt(formData.numGuests) || 11,
          num_nights: 1,
          calculated_price: 0,
          discount_applied: false,
          status: 'pending',
          is_large_group: true,
          notes: `Datas desejadas: ${formData.desiredDates}\nObservações: ${formData.notes || 'Nenhuma'}`
        });

      if (error) throw error;

      setIsSuccess(true);
    } catch (err) {
      console.error('Error submitting large group form:', err);
      alert('Erro ao enviar solicitação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppLink = () => {
    const message = `Olá! Gostaria de fazer uma reserva para grupo grande na Casa Itaquanduba.\n\nDados:\nNome: ${formData.name}\nPessoas: ${formData.numGuests}\nDatas: ${formData.desiredDates}\n${formData.notes ? `Observações: ${formData.notes}` : ''}`;
    return `https://wa.me/5511992364885?text=${encodeURIComponent(message)}`;
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Solicitação Enviada!
          </h3>
          <p className="text-gray-600 mb-6">
            Recebemos sua solicitação para grupo grande. Entraremos em contato em breve com uma proposta personalizada.
          </p>

          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#20BA5A] transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            Contactar via WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-[#0A7B9B] to-[#2EC4B6] p-6">
        <div className="flex items-center justify-between mb-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
          )}
          {!onBack && <div />}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
          Grupos Acima de 10 Pessoas
        </h2>
        <p className="text-white/90 text-center mt-2">
          Entre em contato para uma proposta personalizada
        </p>
      </div>

      <div className="p-6 md:p-8">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            Para grupos acima de 10 pessoas, oferecemos condições especiais e preços personalizados.
            Preencha o formulário abaixo e entraremos em contato rapidamente.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Seu nome completo"
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl transition-colors outline-none ${
                  errors.name ? 'border-red-300' : 'border-gray-200 focus:border-[#2EC4B6]'
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="seu@email.com"
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl transition-colors outline-none ${
                  errors.email ? 'border-red-300' : 'border-gray-200 focus:border-[#2EC4B6]'
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone/WhatsApp *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl transition-colors outline-none ${
                  errors.phone ? 'border-red-300' : 'border-gray-200 focus:border-[#2EC4B6]'
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Pessoas *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Users className="w-5 h-5" />
              </div>
              <input
                type="number"
                value={formData.numGuests}
                onChange={(e) => handleChange('numGuests', e.target.value)}
                placeholder="Ex: 15"
                min="11"
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl transition-colors outline-none ${
                  errors.numGuests ? 'border-red-300' : 'border-gray-200 focus:border-[#2EC4B6]'
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.numGuests && <p className="mt-1 text-sm text-red-600">{errors.numGuests}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Datas Desejadas *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <Calendar className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={formData.desiredDates}
                onChange={(e) => handleChange('desiredDates', e.target.value)}
                placeholder="Ex: 15 a 20 de Janeiro de 2026"
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl transition-colors outline-none ${
                  errors.desiredDates ? 'border-red-300' : 'border-gray-200 focus:border-[#2EC4B6]'
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.desiredDates && <p className="mt-1 text-sm text-red-600">{errors.desiredDates}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Informações adicionais sobre sua reserva..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-colors outline-none focus:border-[#2EC4B6] resize-none"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0A7B9B] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#2EC4B6] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
          </button>
        </form>
      </div>
    </div>
  );
}
