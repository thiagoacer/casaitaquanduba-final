import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Qual a política de cancelamento?',
    answer: 'Oferecemos cancelamento flexível. Cancelamentos com até 7 dias de antecedência recebem reembolso integral. Entre 3-7 dias, reembolso de 50%. Menos de 3 dias, sem reembolso.'
  },
  {
    question: 'Aceita pets?',
    answer: 'Sim! Aceitamos pets de pequeno e médio porte mediante consulta prévia. Entre em contato para discutirmos as condições específicas para seu animal de estimação.'
  },
  {
    question: 'Como funciona o check-in?',
    answer: 'O check-in é às 18h e o processo é muito simples. Enviaremos todas as instruções de acesso por WhatsApp com antecedência. Em casos especiais, podemos flexibilizar o horário mediante aviso prévio.'
  },
  {
    question: 'Tem roupa de cama e banho?',
    answer: 'Sim! Todas as roupas de cama, banho e toalhas estão incluídas no valor da diária. A casa é entregue totalmente equipada para sua comodidade.'
  },
  {
    question: 'Precisa de carro para se locomover?',
    answer: 'Não necessariamente. A casa está a apenas 300m da praia (5 min a pé) e próxima a supermercados e restaurantes. Porém, ter carro facilita para conhecer outras praias e pontos turísticos da ilha.'
  },
  {
    question: 'Tem Wi-Fi?',
    answer: 'Sim! Wi-Fi de alta velocidade gratuito em toda a casa, ideal para trabalho remoto ou entretenimento.'
  },
  {
    question: 'Quantas pessoas cabem confortavelmente?',
    answer: 'A casa acomoda confortavelmente até 10 pessoas. Temos 3 quartos espaçosos e áreas comuns amplas para todos aproveitarem com conforto.'
  },
  {
    question: 'Qual a distância real da praia?',
    answer: 'A casa está localizada a 300 metros (aproximadamente 5 minutos de caminhada) da Praia do Itaguaçu. É possível ir e voltar a pé facilmente.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-gray-600">
            Tire suas dúvidas antes de fazer sua reserva
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-bold text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-6 h-6 text-[#0A7B9B] flex-shrink-0 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Não encontrou a resposta que procura?</p>
          <a
            href="https://wa.me/5511992364885?text=Olá!%20Tenho%20uma%20dúvida%20sobre%20a%20Casa%20Itaquanduba"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#2EC4B6] text-white px-8 py-3 rounded-full font-bold hover:bg-[#26a89c] transition-all transform hover:scale-105"
          >
            Entre em Contato
          </a>
        </div>
      </div>
    </section>
  );
}
