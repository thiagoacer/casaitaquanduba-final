import { Home, Instagram, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-6 h-6 text-[#2EC4B6]" />
              <span className="font-bold text-xl">Casa Itaquanduba</span>
            </div>
            <p className="text-gray-400 text-sm">
              Sua casa de férias em Ilhabela. Conforto, localização e hospitalidade.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <button
                  onClick={() => document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-[#2EC4B6] transition-colors"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-[#2EC4B6] transition-colors"
                >
                  Sobre
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-[#2EC4B6] transition-colors"
                >
                  Preços
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-[#2EC4B6] transition-colors"
                >
                  Contato
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Contato</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                (12) 3199-0710
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                contato@thiagoac.com.br
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Redes Sociais</h3>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/casaitaquanduba"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#2EC4B6] transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/551231990710"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#2EC4B6] transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© 2025 Casa Itaquanduba. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#2EC4B6] transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-[#2EC4B6] transition-colors">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
