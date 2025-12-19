import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { supabase } from '../lib/supabase'; // Conexão com o Banco
import { ArrowLeft, Calendar, Clock, ChevronRight } from 'lucide-react';
import BlogInteractions from '../components/BlogInteractions';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  created_at: string;
  published_at: string;
}

export default function PublicBlog() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const slug = currentPath.includes('/blog/') ? currentPath.split('/blog/')[1] : null;
  const currentPost = slug ? posts.find(p => p.slug === slug) : null;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      if (data) setPosts(data);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const onLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#0A7B9B] font-medium animate-pulse">Carregando novidades de Ilhabela...</div>
      </div>
    );
  }

  if (currentPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 pb-16">
          <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Helmet>
              <title>{currentPost.title} | Blog Casa Itaquanduba</title>
              <meta name="description" content={currentPost.excerpt} />
              <meta property="og:title" content={currentPost.title} />
              <meta property="og:description" content={currentPost.excerpt} />
              <meta property="og:image" content={currentPost.image_url} />
              <meta property="og:url" content={`https://casaitaquanduba.com.br/blog/${currentPost.slug}`} />
              <meta name="twitter:card" content="summary_large_image" />
              <link rel="canonical" href={`https://casaitaquanduba.com.br/blog/${currentPost.slug}`} />
            </Helmet>

            <button
              onClick={() => navigate('/blog')}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Voltar para o Blog
            </button>

            <img
              src={currentPost.image_url}
              alt={currentPost.title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg mb-8"
            />

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(currentPost.published_at || currentPost.created_at)}
              </span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> Leitura rápida</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{currentPost.title}</h1>

            <div
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12"
              dangerouslySetInnerHTML={{ __html: currentPost.content }}
            />

            <BlogInteractions slug={currentPost.slug} />

          </article>
        </div>
        <Footer />
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Dicas de Ilhabela | Blog Casa Itaquanduba</title>
        <meta name="description" content="Descubra os melhores passeios, praias e segredos de Ilhabela com a curadoria exclusiva da Casa Itaquanduba." />
        <link rel="canonical" href="https://casaitaquanduba.com.br/blog" />
      </Helmet>
      <Header />

      <div className="pt-24 pb-12 bg-blue-900 text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Dicas de Ilhabela</h1>
        <p className="text-blue-100 max-w-2xl mx-auto px-4">
          Descubra os melhores passeios, praias e segredos da ilha com a curadoria da Casa Itaquanduba.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-xl">Em breve publicaremos nossas melhores dicas aqui!</p>
            <p className="text-sm mt-2">Volte daqui a pouco.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(post.published_at || post.created_at)}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center text-blue-600 font-medium text-sm group-hover:underline">
                    Ler artigo completo <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
