import { useState, useRef, useEffect } from 'react';
import { Users, ChevronDown } from 'lucide-react';

interface GuestSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const guestOptions = [
  { value: '1-4', label: '1-4 pessoas', min: 1, max: 4 },
  { value: '5-8', label: '5-8 pessoas', min: 5, max: 8 },
  { value: '9-10', label: '9-10 pessoas', min: 9, max: 10 },
  { value: '10+', label: 'Mais de 10 pessoas', min: 11, max: 999 }
];

export default function GuestSelector({ value, onChange }: GuestSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = guestOptions.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Número de Pessoas
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between hover:border-[#2EC4B6] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-[#0A7B9B]" />
          <span className="text-gray-900 font-medium">
            {selectedOption ? selectedOption.label : 'Selecione o número de pessoas'}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {guestOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-4 py-3 text-left flex items-center gap-3 transition-colors
                ${value === option.value
                  ? 'bg-[#2EC4B6]/10 text-[#0A7B9B] font-semibold'
                  : 'hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              <Users className={`w-5 h-5 ${value === option.value ? 'text-[#0A7B9B]' : 'text-gray-400'}`} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { guestOptions };
