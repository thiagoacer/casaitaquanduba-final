import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function usePostInteractions(slug: string) {
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);

  // 1. Carregar dados iniciais e incrementar views
  useEffect(() => {
    if (!slug) return;

    const fetchStats = async () => {
      try {
        let { data: stats, error } = await supabase
          .from('post_stats')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error && error.code === 'PGRST116') {
          const { data: newStats } = await supabase
            .from('post_stats')
            .insert([{ slug, views: 1, likes: 0 }])
            .select()
            .single();
          stats = newStats;
        } else if (stats) {
          await supabase
            .from('post_stats')
            .update({ views: stats.views + 1 })
            .eq('slug', slug);
          stats.views += 1;
        }

        if (stats) {
          setViews(stats.views || 0);
          setLikes(stats.likes || 0);
        }

        const { data: commentsData } = await supabase
          .from('post_comments')
          .select('*')
          .eq('post_slug', slug)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        setComments(commentsData || []);
        
        const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
        if (likedPosts.includes(slug)) {
          setHasLiked(true);
        }

      } catch (err) {
        console.error('Erro ao carregar interações:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [slug]);

  // 2. Função de Like
  const handleLike = async () => {
    if (hasLiked) return;
    setLikes(prev => prev + 1);
    setHasLiked(true);

    await supabase.rpc('increment_likes', { row_slug: slug }).catch(err => {
        supabase.from('post_stats').update({ likes: likes + 1 }).eq('slug', slug);
    });

    const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
    likedPosts.push(slug);
    localStorage.setItem('liked_posts', JSON.stringify(likedPosts));
  };

  // 3. Função de Comentar
  const handleComment = async (userName: string, text: string, rating: number) => {
    const { data, error } = await supabase
      .from('post_comments')
      .insert([{ 
        post_slug: slug, 
        user_name: userName, 
        comment_text: text, 
        rating,
        is_approved: true
      }])
      .select()
      .single();

    if (data) {
      setComments([data, ...comments]);
      return true;
    }
    return false;
  };

  return { views, likes, comments, loading, hasLiked, handleLike, handleComment };
}
