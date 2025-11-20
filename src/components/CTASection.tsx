import { useState } from 'react';
import { Phone, Mail, Instagram, MessageCircle, Send, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CTASection() {
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Mensagem é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          status: 'pending'
        });

      if (error) throw error;

      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      alert('Erro ao enviar mensagem. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A7B9B] to-[#2EC4B6]">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&h=900&fit=crop')] bg-cover bg-center"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Reserve Sua Estadia em Ilhabela
        </h2>
        <p className="text-xl text-white/90 mb-12">
          Disponibilidade limitada - Consulte agora!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href="https://wa.me/551231990710?text=Olá!%20Gostaria%20de%20consultar%20disponibilidade%20para%20a%20Casa%20Itaquanduba"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-[#0A7B9B] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl inline-flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Solicitar Reserva via WhatsApp
          </a>

          <button
            onClick={() => setShowContactForm(true)}
            className="bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all transform hover:scale-105 inline-flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Enviar Mensagem
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-white">
          <a
            href="https://wa.me/551231990710"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white/80 transition-colors"
          >
            <Phone className="w-5 h-5" />
            <span>(12) 3199-0710</span>
          </a>
          <a
            href="mailto:contato@thiagoac.com.br"
            className="flex items-center gap-2 hover:text-white/80 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>contato@thiagoac.com.br</span>
          </a>
          <a
            href="https://instagram.com/casaitaquanduba"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white/80 transition-colors"
          >
            <Instagram className="w-5 h-5" />
            <span>@casaitaquanduba</span>
          </a>
        </div>
      </div>

      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-900">Entre em Contato</h3>
              <button
                onClick={() => {
                  setShowContactForm(false);
                  setIsSuccess(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {isSuccess ? (
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Mensagem Enviada!</h4>
                <p className="text-gray-600 mb-6">
                  Recebemos sua mensagem e entraremos em contato em breve.
                </p>
                <button
                  onClick={() => {
                    setShowContactForm(false);
                    setIsSuccess(false);
                  }}
                  className="bg-gradient-to-r from-[#0A7B9B] to-[#2EC4B6] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#2EC4B6] ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Seu nome completo"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#2EC4B6] ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="seu@email.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#2EC4B6] ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#2EC4B6] resize-none ${
                      errors.message ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Conte-nos como podemos ajudar..."
                  />
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#0A7B9B] to-[#2EC4B6] text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
