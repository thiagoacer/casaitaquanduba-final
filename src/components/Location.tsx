import { MapPin, Utensils, ShoppingCart, Waves, MapPinned } from 'lucide-react';

const nearbyPlaces = [
  {
    icon: Waves,
    name: 'Praia do Itaguaçu',
    distance: '300m (5 min a pé)',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Waves,
    name: 'Praia do Perequê',
    distance: '800m',
    color: 'from-teal-500 to-emerald-500'
  },
  {
    icon: MapPinned,
    name: 'Centro Histórico (Vila)',
    distance: '2,5km',
    color: 'from-orange-500 to-amber-500'
  },
  {
    icon: ShoppingCart,
    name: 'Supermercados',
    distance: '600m',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Utensils,
    name: 'Restaurantes',
    distance: '300m',
    color: 'from-red-500 to-rose-500'
  }
];

export default function Location() {
  return (
    <section id="location" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Localização Privilegiada
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Próximo a tudo que você precisa para aproveitar Ilhabela
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          <div className="space-y-4">
            {nearbyPlaces.map((place, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 group"
              >
                <div className={`bg-gradient-to-br ${place.color} w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <place.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{place.name}</h3>
                  <p className="text-sm text-gray-600">{place.distance}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[450px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.6084280180557!2d-45.36622112466264!3d-23.796954278638612!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94d29992c5dc224f%3A0xec28093c541895ee!2sAv.%20Alm.%20Tamandar%C3%A9%2C%20117%20-%20Itaquanduba%2C%20Ilhabela%20-%20SP%2C%2011630-000!5e0!3m2!1spt-BR!2sbr!4v1761775179674!5m2!1spt-BR!2sbr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização Casa Itaquanduba"
            ></iframe>
          </div>
        </div>

        <div className="bg-[#0A7B9B] text-white p-8 rounded-2xl text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Endereço Completo</h3>
          <p className="text-lg text-white/90">
            Av. Almirante Tamandaré, 117 - Itaquanduba, Ilhabela/SP
          </p>
        </div>
      </div>
    </section>
  );
}
