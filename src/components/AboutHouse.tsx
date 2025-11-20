import { Check } from 'lucide-react';

const features = [
  '3 quartos amplos e arejados',
  'Cozinha completa equipada',
  'Sala de estar confortável',
  'Varanda com área de convivência',
  'Jardim privativo para churrasco',
  '3 vagas de garagem demarcadas',
  'Wi-Fi de alta velocidade',
  'Roupa de cama e banho inclusos'
];

export default function AboutHouse() {
  return (
    <section id="about" className="py-20 bg-gradient-to-br from-[#0A7B9B] to-[#2EC4B6] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Sobre a Casa
            </h2>
            <p className="text-lg text-white/90 mb-6 leading-relaxed">
              Descubra o equilíbrio perfeito entre conforto e localização em nossa casa espaçosa
              no coração de Itaquanduba. A apenas 300 metros da deslumbrante Praia do Itaguaçu,
              este é o refúgio ideal para famílias e grupos que buscam aproveitar o melhor de Ilhabela.
            </p>
            <p className="text-lg text-white/90 leading-relaxed">
              Com capacidade para até 10 pessoas, ambiente acolhedor e todas as comodidades que
              você precisa para uma estadia memorável, nossa casa oferece privacidade e conforto
              sem abrir mão da proximidade com as principais atrações da ilha.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-6">Comodidades Incluídas</h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-[#2EC4B6] rounded-full p-1 mt-0.5 flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
