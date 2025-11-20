import { MapPin, Users, Waves, Shield, Clock, DollarSign } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 sm:py-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A7B9B] to-[#2EC4B6]">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1600&h=900&fit=crop')] bg-cover bg-center"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            <Shield className="w-4 h-4" />
            Cancelamento Flexível
          </span>
          <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            <DollarSign className="w-4 h-4" />
            Melhor Custo-Benefício
          </span>
          <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Resposta em 2h
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Sua Casa de Férias
          <br />
          <span className="text-[#FFD700]">em Ilhabela</span>
        </h1>

        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-white mb-8 text-base md:text-lg">
          <span className="flex items-center gap-2">
            <Waves className="w-5 h-5" />
            300m da praia
          </span>
          <span className="hidden sm:inline text-white/50">•</span>
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Até 10 pessoas
          </span>
          <span className="hidden sm:inline text-white/50">•</span>
          <span className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Jardim Privativo
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-2">
          <a
            href="https://wa.me/551231990710?text=Olá!%20Gostaria%20de%20consultar%20disponibilidade%20para%20a%20Casa%20Itaquanduba"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-[#2EC4B6] text-white px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white hover:text-[#0A7B9B] transition-all active:scale-95 shadow-2xl w-full sm:w-auto min-h-[56px] flex items-center justify-center"
          >
            Consultar Disponibilidade
          </a>
          <button
            onClick={() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white hover:text-[#0A7B9B] transition-all active:scale-95 border-2 border-white w-full sm:w-auto min-h-[56px]"
          >
            Ver Preços
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
