import { useState } from 'react';
import { X } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

const images = [
  {
    url: '/casa-itaquanduba-ilhabela-cozinha.webp',
    alt: 'Cozinha completa'
  },
  {
    url: '/casa-itaquanduba-ilhabela-sala-de-estar.webp',
    alt: 'Sala de estar com janela decorativa'
  },
  {
    url: '/casa-itaquanduba-ilhabela-garagem.webp',
    alt: 'Garagem e estacionamento'
  },
  {
    url: '/casa-itaquanduba-ilhabela-quintal.webp',
    alt: 'Quintal e área externa'
  },
  {
    url: '/casa-itaquanduba-ilhabela-quarto-1.webp',
    alt: 'Quarto principal'
  },
  {
    url: '/casa-itaquanduba-ilhabela-quarto-2.webp',
    alt: 'Segundo quarto'
  },
  {
    url: '/casa-itaquanduba-ilhabela-quarto-3.webp',
    alt: 'Quarto com beliche'
  },
  {
    url: '/casa-itaquanduba-ilhabela-sala.webp',
    alt: 'Sala de jantar e convivência'
  }
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Conheça Cada Detalhe
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Uma casa completa e aconchegante esperando por você
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className="relative aspect-square overflow-hidden rounded-xl group cursor-pointer w-full"
            >
              <OptimizedImage
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver imagem
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedImage !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <OptimizedImage
              src={images[selectedImage].url}
              alt={images[selectedImage].alt}
              className="max-w-full max-h-[85vh] object-contain"
              sizes="100vw"
              priority={true}
            />
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(index);
                }}
                className={`w-2 h-2 rounded-full transition-all flex-shrink-0 ${index === selectedImage ? 'bg-white w-8' : 'bg-white/50'
                  }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
