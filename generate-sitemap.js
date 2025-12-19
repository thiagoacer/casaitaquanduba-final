
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.');
    console.log('Ensure you have a .env file with these variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const DOMAIN = 'https://casaitaquanduba.com.br';

async function generateSitemap() {
    console.log('Generating sitemap...');

    // Páginas estáticas
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${DOMAIN}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;

    try {
        // Buscar posts do blog
        const { data: posts, error } = await supabase
            .from('blog_posts')
            .select('slug, updated_at, published_at')
            .eq('published', true);

        if (error) throw error;

        if (posts) {
            console.log(`Found ${posts.length} blog posts.`);
            posts.forEach(post => {
                const lastMod = new Date(post.updated_at || post.published_at).toISOString().split('T')[0];
                xml += `  <url>
    <loc>${DOMAIN}/blog/${post.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
            });
        }

        xml += `</urlset>`;

        // Salvar arquivo
        const publicDir = path.join(__dirname, '../public');
        fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);

        console.log('Sitemap generated successfully at public/sitemap.xml');

    } catch (error) {
        console.error('Error generating sitemap:', error);
        process.exit(1);
    }
}

generateSitemap();
