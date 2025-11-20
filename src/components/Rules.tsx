import { Clock, XCircle, Volume2, Users, PawPrint, PartyPopper } from 'lucide-react';

const rules = [
  {
    icon: Clock,
    title: 'Horários',
    description: 'Check-in: 18h | Check-out: 14h',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: PartyPopper,
    title: 'Eventos',
    description: 'Não permitido eventos/festas',
    color: 'from-red-500 to-pink-500'
  },
  {
    icon: XCircle,
    title: 'Fumar',
    description: 'Não permitido fumar internamente',
    color: 'from-orange-500 to-amber-500'
  },
  {
    icon: PawPrint,
    title: 'Pets',
    description: 'Aceita pets (consultar condições)',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Volume2,
    title: 'Silêncio',
    description: 'Horário de silêncio: 22h às 8h',
    color: 'from-purple-500 to-violet-500'
  },
  {
    icon: Users,
    title: 'Capacidade',
    description: 'Capacidade máxima: 10 pessoas',
    color: 'from-teal-500 to-cyan-500'
  }
];

export default function Rules() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Regras da Casa
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Para garantir uma experiência agradável para todos
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map((rule, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all"
            >
              <div className={`bg-gradient-to-br ${rule.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
                <rule.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{rule.title}</h3>
              <p className="text-gray-600">{rule.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-br from-[#0A7B9B] to-[#2EC4B6] rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Política de Reserva</h3>
          <p className="text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
            Todas as regras são estabelecidas para garantir conforto, segurança e respeito mútuo.
            Ao fazer sua reserva, você concorda em seguir estas diretrizes.
            Qualquer dúvida, estamos à disposição para esclarecer!
          </p>
        </div>
      </div>
    </section>
  );
}
