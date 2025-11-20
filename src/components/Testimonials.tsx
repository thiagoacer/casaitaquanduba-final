import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Maria Silva',
    location: 'São Paulo',
    rating: 5,
    text: 'Localização perfeita! Fomos a pé para a praia todos os dias. Casa espaçosa e confortável para nossa família de 8 pessoas.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
  },
  {
    name: 'João Santos',
    location: 'Campinas',
    rating: 5,
    text: 'Excelente custo-benefício. A casa tem tudo que precisávamos e o jardim foi perfeito para nossos churrascos.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
  },
  {
    name: 'Ana Costa',
    location: 'Rio de Janeiro',
    rating: 5,
    text: 'Anfitriões muito atenciosos. Casa limpa, organizada e bem localizada. Voltaremos com certeza!',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            O Que Nossos Hóspedes Dizem
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experiências reais de quem já se hospedou conosco
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 relative hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className="absolute top-6 right-6 text-[#0A7B9B] opacity-20">
                <Quote className="w-12 h-12" />
              </div>

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-[#2EC4B6]/20"
                />
                <div>
                  <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed italic">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0A7B9B] to-[#2EC4B6] text-white px-6 py-3 rounded-full">
            <Star className="w-5 h-5 fill-white" />
            <span className="font-bold text-lg">5.0</span>
            <span className="text-white/90">de 5 estrelas (47 avaliações)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
