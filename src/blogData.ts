export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  readTime: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'roteiro-3-dias-ilhabela',
    title: 'Roteiro de 3 dias em Ilhabela: O que fazer e onde ficar',
    excerpt: 'Vai passar o final de semana na ilha? Preparamos um guia completo para você aproveitar as melhores praias e gastronomia sem perder tempo.',
    date: '20 de Novembro, 2025',
    readTime: '5 min de leitura',
    image: 'https://images.unsplash.com/photo-1590523741831-ab7f8512d568?q=80&w=1000&auto=format&fit=crop',
    content: `
      <p class="mb-4">Ilhabela é um paraíso, mas é grande! Para não perder tempo no trânsito ou escolhendo onde ir, montamos este roteiro estratégico para 3 dias perfeitos.</p>
      
      <h3 class="text-2xl font-bold text-blue-900 mt-8 mb-4">Dia 1: Chegada e o Charme do Centro</h3>
      <p class="mb-4">Após fazer o check-in na <strong>Casa Itaquanduba</strong> (aproveite para deixar as malas e descansar um pouco na nossa varanda), a dica é explorar o Centro Histórico (Vila).</p>
      <ul class="list-disc pl-6 my-4 space-y-2 text-gray-700">
        <li>Caminhe pelo píer da Vila.</li>
        <li>Visite a Igreja Matriz.</li>
        <li>Jante em um dos restaurantes charmosos da Rua do Meio.</li>
      </ul>

      <h3 class="text-2xl font-bold text-blue-900 mt-8 mb-4">Dia 2: As Praias do Sul e Pôr do Sol</h3>
      <p class="mb-4">Acorde cedo e prepare o café na nossa cozinha completa. Hoje é dia de explorar o Sul da Ilha. A Praia da Feiticeira e a Praia do Julião são paradas obrigatórias.</p>

      <h3 class="text-2xl font-bold text-blue-900 mt-8 mb-4">Dia 3: Norte e Despedida</h3>
      <p class="mb-4">Antes de ir embora, conheça a Praia do Sino. É um passeio rápido e cultural.</p>
      
      <div class="bg-blue-50 p-6 rounded-lg mt-8 border border-blue-100">
        <p class="font-semibold text-blue-800">Procurando hospedagem confortável? A Casa Itaquanduba tem a localização central perfeita.</p>
      </div>
    `
  },
  {
    id: '2',
    slug: 'melhores-praias-norte',
    title: 'Top 5 Praias do Norte de Ilhabela',
    excerpt: 'Descubra o lado mais tranquilo e familiar da ilha. Jabaquara, Pacuíba e outras joias escondidas.',
    date: '18 de Novembro, 2025',
    readTime: '4 min de leitura',
    image: 'https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?q=80&w=1000&auto=format&fit=crop',
    content: `<p>Conteúdo completo em breve...</p>`
  },
  {
    id: '3',
    slug: 'dias-de-chuva',
    title: 'Choveu em Ilhabela? Saiba o que fazer',
    excerpt: 'Não deixe o tempo fechado estragar sua viagem. Museus, cachoeiras e gastronomia para dias nublados.',
    date: '15 de Novembro, 2025',
    readTime: '3 min de leitura',
    image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1000&auto=format&fit=crop',
    content: `<p>Conteúdo completo em breve...</p>`
  }
];
