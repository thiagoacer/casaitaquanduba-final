import { useState, useEffect } from 'react';
import { Menu, X, Home } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isBlogPage = window.location.pathname.startsWith('/blog');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    if (isBlogPage) {
      setIsScrolled(true);
    } else {
      window.addEventListener('scroll', handleScroll);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isBlogPage]);

  const menuItems = [
    { label: 'Início', href: '#home' },
    { label: 'Sobre', href: '#about' },
    { label: 'Dicas de Ilhabela', href: '/blog' },
    { label: 'Localização', href: '#location' },
    { label: 'Preços', href: '#pricing' },
    { label: 'Contato', href: '#contact' }
  ];

  const handleNavigation = (href: string) => {
    setIsMenuOpen(false);

    if (href.startsWith('/')) {
      window.history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo(0, 0);
      return;
    }

    if (isBlogPage) {
      window.location.href = '/' + href;
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const textColor = isScrolled || isMenuOpen ? 'text-gray-900' : 'text-white';
  const hoverColor = 'hover:text-[#0A7B9B]';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || isMenuOpen ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          <button 
            onClick={() => handleNavigation('#home')} 
            className="flex items-center gap-2 group"
          >
            <Home className={`w-6 h-6 ${isScrolled || isMenuOpen ? 'text-[#0A7B9B]' : 'text-white'}`} />
            <span className={`font-bold text-xl ${textColor}`}>
              Casa Itaquanduba
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.href)}
                className={`font-medium transition-colors ${hoverColor} ${textColor}`}
              >
                {item.label}
              </button>
            ))}
            <a
              href="https://wa.me/551231990710?text=Olá!%20Gostaria%20de%20consultar%20disponibilidade%20para%20a%20Casa%20Itaquanduba"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#2EC4B6] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#26a89c] transition-colors shadow-sm"
            >
              Consultar Disponibilidade
            </a>
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden ${textColor}`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 h-screen absolute w-full">
          <nav className="flex flex-col px-4 py-4 gap-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.href)}
                className="text-left py-4 text-lg text-gray-700 hover:text-[#0A7B9B] font-medium transition-colors border-b border-gray-50"
              >
                {item.label}
              </button>
            ))}
            <a
              href="https://wa.me/551231990710?text=Olá!%20Gostaria%20de%20consultar%20disponibilidade%20para%20a%20Casa%20Itaquanduba"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 bg-[#2EC4B6] text-white px-6 py-4 rounded-xl font-bold text-center text-lg hover:bg-[#26a89c] transition-colors"
            >
              Consultar Disponibilidade
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
