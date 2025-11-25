import {
  MapPin,
  Users,
  DollarSign,
  Car,
  Trees,
  Check,
  ShoppingCart,
  Shield,
  MapPinned,
  Wifi,
  PawPrint,
  Clock
} from 'lucide-react';

const benefits = [
  {
    icon: MapPin,
    title: 'Localização Privilegiada',
    description: 'Mais perto da praia que a maioria'
  },
  {
    icon: Users,
    title: 'Espaço Generoso',
    description: 'Até 10 pessoas confortavelmente'
  },
  {
    icon: DollarSign,
    title: 'Custo-Benefício',
    description: 'Melhor preço por pessoa da região'
  },
  {
    icon: Car,
    title: '3 Vagas de Garagem',
    description: 'Segurança e comodidade'
  },
  {
    icon: Trees,
    title: 'Jardim Privativo',
    description: 'Perfeito para churrasco e lazer'
  },
  {
    icon: Check,
    title: 'Check-in Facilitado',
    description: 'Processo simples e rápido'
  },
  {
    icon: ShoppingCart,
    title: 'Próximo a Tudo',
    description: 'Mercados, restaurantes e atrações'
  },
  {
    icon: Shield,
    title: 'Região Segura',
    description: 'Tranquila e familiar'
  },
  {
    icon: MapPinned,
    title: 'Centro e Balsa Próximos',
    description: '2km do Centro e 4km da Balsa'
  },
  {
    icon: Wifi,
    title: 'Wi-Fi Gratuito',
    description: 'Internet de alta velocidade'
  },
  {
    icon: PawPrint,
    title: 'Aceita Pets',
    description: 'Seu amigo é bem-vindo'
  },
  {
    icon: Clock,
    title: 'Check-in Flexível',
    description: 'Mediante aviso prévio'
  }
];

export default function Benefits() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Por Que Escolher Nossa Casa?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Oferecemos o equilíbrio perfeito entre localização, conforto e valor
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="bg-gradient-to-br from-[#0A7B9B] to-[#2EC4B6] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
