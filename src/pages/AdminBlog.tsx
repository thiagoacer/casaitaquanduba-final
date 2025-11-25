import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Pencil, Trash2, Eye, X, Save, FileText } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  published: boolean;
  created_at: string;
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});

  // Carregar posts
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  // Salvar (Criar ou Atualizar)
  const handleSave = async () => {
    if (!currentPost.title || !currentPost.slug) return alert('Título e Slug são obrigatórios');

    const postData = {
      title: currentPost.title,
      slug: currentPost.slug,
      excerpt: currentPost.excerpt,
      content: currentPost.content,
      image_url: currentPost.image_url,
      published: currentPost.published || false
    };

    let error;
    if (currentPost.id) {
      // Atualizar
      const { error: err } = await supabase.from('blog_posts').update(postData).eq('id', currentPost.id);
      error = err;
    } else {
      // Criar Novo
      const { error: err } = await supabase.from('blog_posts').insert([postData]);
      error = err;
    }

    if (!error) {
      setIsEditing(false);
      setCurrentPost({});
      loadPosts();
    } else {
      alert('Erro ao salvar: ' + error.message);
    }
  };

  // Deletar
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (!error) loadPosts();
  };

  if (loading) return <div className="p-8 text-gray-500">Carregando posts...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Blog</h1>
        <button 
          onClick={() => { setCurrentPost({}); setIsEditing(true); }}
          className="bg-[#2EC4B6] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#25a094]"
        >
          <Plus className="w-4 h-4" /> Novo Post
        </button>
      </div>

      {/* LISTA DE POSTS */}
      {!isEditing ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Título</th>
                <th className="p-4">Data</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{post.title}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${post.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {post.published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => { setCurrentPost(post); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(post.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* FORMULÁRIO DE EDIÇÃO */
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{currentPost.id ? 'Editar Post' : 'Novo Post'}</h2>
            <button onClick={() => setIsEditing(false)}><X className="w-6 h-6 text-gray-400"/></button>
          </div>
          
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input 
                className="w-full p-2 border rounded-md" 
                value={currentPost.title || ''} 
                onChange={e => setCurrentPost({...currentPost, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug (URL amigável)</label>
              <input 
                className="w-full p-2 border rounded-md" 
                placeholder="ex: roteiro-3-dias-ilhabela"
                value={currentPost.slug || ''} 
                onChange={e => setCurrentPost({...currentPost, slug: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Resumo</label>
              <textarea 
                className="w-full p-2 border rounded-md" 
                rows={2}
                value={currentPost.excerpt || ''} 
                onChange={e => setCurrentPost({...currentPost, excerpt: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">URL da Imagem</label>
              <input 
                className="w-full p-2 border rounded-md" 
                value={currentPost.image_url || ''} 
                onChange={e => setCurrentPost({...currentPost, image_url: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Conteúdo (HTML simples)</label>
              <textarea 
                className="w-full p-2 border rounded-md font-mono text-sm" 
                rows={10}
                value={currentPost.content || ''} 
                onChange={e => setCurrentPost({...currentPost, content: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="published"
                checked={currentPost.published || false}
                onChange={e => setCurrentPost({...currentPost, published: e.target.checked})}
              />
              <label htmlFor="published" className="text-sm font-medium text-gray-700">Publicar agora?</label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-lg text-gray-600">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 bg-[#2EC4B6] text-white rounded-lg hover:bg-[#25a094]">Salvar Post</button>
          </div>
        </div>
      )}
    </div>
  );
}
