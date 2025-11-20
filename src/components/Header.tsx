import { useState, useEffect } from 'react';
import { Menu, X, Home } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Início', href: '#home' },
    { label: 'Sobre', href: '#about' },
    { label: 'Localização', href: '#location' },
    { label: 'Preços', href: '#pricing' },
    { label: 'Contato', href: '#contact' }
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <Home className={`w-6 h-6 ${isScrolled ? 'text-[#0A7B9B]' : 'text-white'}`} />
            <span className={`font-bold text-xl ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
              Casa Itaquanduba
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className={`font-medium transition-colors hover:text-[#0A7B9B] ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            <a
              href="https://wa.me/5511992364885?text=Olá!%20Gostaria%20de%20consultar%20disponibilidade%20para%20a%20Casa%20Itaquanduba"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#2EC4B6] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#26a89c] transition-colors"
            >
              Consultar Disponibilidade
            </a>
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden ${isScrolled ? 'text-gray-900' : 'text-white'}`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <nav className="flex flex-col px-4 py-4">
            {menuItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-left py-3 text-gray-700 hover:text-[#0A7B9B] font-medium transition-colors"
              >
                {item.label}
              </button>
            ))}
            <a
              href="https://wa.me/5511992364885?text=Olá!%20Gostaria%20de%20consultar%20disponibilidade%20para%20a%20Casa%20Itaquanduba"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 bg-[#2EC4B6] text-white px-6 py-3 rounded-full font-semibold text-center hover:bg-[#26a89c] transition-colors"
            >
              Consultar Disponibilidade
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
