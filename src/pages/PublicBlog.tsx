import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { blogPosts } from '../blogData';
import { ArrowLeft, Calendar, Clock, ChevronRight } from 'lucide-react';

export default function PublicBlog() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  const slug = currentPath.includes('/blog/') ? currentPath.split('/blog/')[1] : null;
  const currentPost = slug ? blogPosts.find(p => p.slug === slug) : null;

  // Função simples para navegar
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
    // Dispara evento para o App.tsx saber que mudou
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // --- TELA DO POST INDIVIDUAL (ARTIGO) ---
  if (currentPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 pb-16">
          <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <button 
              onClick={() => navigate('/blog')}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Voltar para o Blog
            </button>

            <img 
              src={currentPost.image} 
              alt={currentPost.title} 
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg mb-8"
            />

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {currentPost.date}</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {currentPost.readTime}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{currentPost.title}</h1>

            <div 
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: currentPost.content }}
            />
          </article>
        </div>
        <Footer />
        <WhatsAppButton />
      </div>
    );
  }

  // --- TELA DA LISTAGEM (HOME DO BLOG) ---
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-24 pb-12 bg-blue-900 text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Dicas de Ilhabela</h1>
        <p className="text-blue-100 max-w-2xl mx-auto px-4">
          Descubra os melhores passeios, praias e segredos da ilha com a curadoria da Casa Itaquanduba.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div 
              key={post.id} 
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden group"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {post.date}</span>
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
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
