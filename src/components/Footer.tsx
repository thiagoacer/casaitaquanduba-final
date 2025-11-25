import { useState } from 'react';
import { Facebook, Instagram, Mail, MapPin, Phone, FileText, X, Clock, VolumeX, Ban, CheckCircle, BookOpen } from 'lucide-react';

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Coluna 1: Sobre */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">Casa Itaquanduba</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Seu refúgio em Ilhabela. Conforto, privacidade e localização estratégica para você aproveitar o melhor da ilha com sua família.
              </p>
              
              <div className="flex flex-col gap-3">
                {/* Link para o Blog (NOVO - Importante para SEO) */}
                <a 
                  href="/blog" 
                  className="flex items-center gap-2 text-[#2EC4B6] hover:text-white transition-colors text-sm font-medium group w-fit"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="border-b border-transparent group-hover:border-[#2EC4B6]">Dicas de Ilhabela (Blog)</span>
                </a>

                {/* Botão que abre as regras */}
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 text-[#2EC4B6] hover:text-white transition-colors text-sm font-medium group w-fit"
                >
                  <FileText className="w-4 h-4" />
                  <span className="border-b border-transparent group-hover:border-[#2EC4B6]">Ler Regras da Casa e Contrato</span>
                </button>
              </div>
            </div>

            {/* Coluna 2: Contato */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">Fale Conosco</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#2EC4B6]" />
                  <a href="https://wa.me/551231990710" target="_blank" rel="noopener noreferrer" className="hover:text-[#2EC4B6] transition-colors">
                    (12) 3199-0710
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#2EC4B6]" />
                  <span>contato@casaitaquanduba.com.br</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2EC4B6]" />
                  <span>Itaquanduba, Ilhabela - SP</span>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Redes Sociais */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">Siga-nos</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#2EC4B6] hover:text-white text-gray-400 transition-all transform hover:scale-110">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#2EC4B6] hover:text-white text-gray-400 transition-all transform hover:scale-110">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-600 text-xs gap-4">
            <p>&copy; {new Date().getFullYear()} Casa Itaquanduba. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <a href="/politica-privacidade.html" target="_blank" className="hover:text-[#2EC4B6] transition-colors">
                Política de Privacidade
              </a>
              <a href="/termos-uso.html" target="_blank" className="hover:text-[#2EC4B6] transition-colors">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL DE REGRAS E CONTRATO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-300">
            
            {/* Cabeçalho do Modal */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2EC4B6]" />
                Regras da Casa & Termos
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-8 text-gray-600">
              
              {/* Seção 1: Regras de Ouro */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Regras Fundamentais
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 font-semibold text-gray-900 mb-2">
                      <VolumeX className="w-4 h-4 text-orange-500" /> Lei do Silêncio
                    </div>
                    <p className="text-sm">Respeito total à vizinhança. Som alto proibido após às 22h. Multas aplicadas pelo condomínio/prefeitura serão repassadas.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 font-semibold text-gray-900 mb-2">
                      <Ban className="w-4 h-4 text-red-500" /> Proibições
                    </div>
                    <p className="text-sm">Proibido fumar dentro da casa. Proibido festas ou eventos com convidados externos sem autorização prévia.</p>
                  </div>
                </div>
              </section>

              {/* Seção 2: Horários */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Horários
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><strong>Check-in:</strong> A partir das 14:00 (Flexível mediante disponibilidade).</li>
                  <li><strong>Check-out:</strong> Até às 12:00 (Tolerância de 30min para limpeza).</li>
                  <li><strong>Late Check-out:</strong> Consulte valores para saída tardia (até 18h).</li>
                </ul>
              </section>

              {/* Seção 3: Termos e Condições */}
              <section className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo do Contrato de Locação</h3>
                <div className="space-y-4 text-sm text-justify">
                  <p>
                    <strong>1. Reserva e Pagamento:</strong> A reserva é confirmada mediante pagamento de 50% do valor total. O restante (50%) deve ser quitado até 2 dias antes do check-in.
                  </p>
                  <p>
                    <strong>2. Cancelamento:</strong> Cancelamentos até 15 dias antes do check-in têm reembolso integral. Entre 14 e 7 dias, reembolso de 50%. Menos de 7 dias, sem reembolso (o valor fica como crédito para outra data, exceto feriados).
                  </p>
                  <p>
                    <strong>3. Cuidado com o Imóvel:</strong> O locatário é responsável por qualquer dano causado à mobília, utensílios ou estrutura da casa durante a estadia. Uma vistoria será feita na saída.
                  </p>
                  <p>
                    <strong>4. Capacidade:</strong> A casa comporta estritamente o número de pessoas contratado na reserva (máximo 8/10 pessoas). Excedentes serão cobrados ou terão entrada negada.
                  </p>
                </div>
              </section>
            </div>

            {/* Rodapé do Modal */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="bg-[#2EC4B6] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#25a094] transition-colors"
              >
                Entendi e Concordo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
