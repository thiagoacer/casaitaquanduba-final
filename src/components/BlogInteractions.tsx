import { useState } from 'react';
import { Heart, MessageCircle, Eye, Star, Send } from 'lucide-react';
import { usePostInteractions } from '../hooks/usePostInteractions';

interface BlogInteractionsProps {
  slug: string;
}

export default function BlogInteractions({ slug }: BlogInteractionsProps) {
  const { views, likes, comments, hasLiked, handleLike, handleComment } = usePostInteractions(slug);
  
  // Form states
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;

    setIsSubmitting(true);
    await handleComment(name, comment, rating);
    setIsSubmitting(false);
    setComment(''); // Limpa campo
    alert('Comentário enviado com sucesso!');
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-gray-200">
      
      {/* Barra de Estatísticas */}
      <div className="flex items-center gap-6 mb-8 text-gray-600">
        <div className="flex items-center gap-2" title="Visualizações">
          <Eye className="w-5 h-5" />
          <span className="font-medium">{views}</span>
        </div>
        
        <button 
          onClick={handleLike}
          disabled={hasLiked}
          className={`flex items-center gap-2 transition-colors ${hasLiked ? 'text-red-500' : 'hover:text-red-500'}`}
        >
          <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
          <span className="font-medium">{likes}</span>
        </button>

        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">{comments.length}</span>
        </div>
      </div>

      {/* Formulário de Comentário */}
      <div className="bg-gray-50 p-6 rounded-xl mb-8">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Deixe seu comentário</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sua Avaliação</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <Star className="w-full h-full fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Seu Nome"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2EC4B6] outline-none"
              required
            />
            <textarea
              placeholder="O que você achou?"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2EC4B6] outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#2EC4B6] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#25a094] transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Enviando...' : 'Enviar Comentário'}
          </button>
        </form>
      </div>

      {/* Lista de Comentários */}
      <div className="space-y-6">
        {comments.map((c) => (
          <div key={c.id} className="border-b border-gray-100 pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-gray-900">{c.user_name}</div>
              <div className="flex text-yellow-400">
                {[...Array(c.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-gray-600">{c.comment_text}</p>
            <div className="text-xs text-gray-400 mt-2">
              {new Date(c.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
