import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase não configurado. Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
  console.warn('📝 Para obter essas variáveis:');
  console.warn('   1. Acesse https://app.supabase.com');
  console.warn('   2. Selecione seu projeto');
  console.warn('   3. Vá em Settings > API');
  console.warn('   4. Copie a "Project URL" e a "anon public" key');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
