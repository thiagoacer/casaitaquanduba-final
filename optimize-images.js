
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

async function optimizeImages() {
    console.log('Starting advanced image optimization...');

    if (!fs.existsSync(publicDir)) {
        console.error('Public directory not found!');
        process.exit(1);
    }

    const files = fs.readdirSync(publicDir);
    // Find png and jpg files, excluding existing optimized versions
    const imageFiles = files.filter(file =>
        (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) &&
        !file.includes('copy') &&
        !file.match(/-\d+w\.(webp|avif)$/)
    );

    console.log(`Found ${imageFiles.length} original files to process.`);

    const sizes = [320, 640, 768, 1024, 1280];

    for (const file of imageFiles) {
        const inputPath = path.join(publicDir, file);
        const filename = path.basename(file, path.extname(file));

        console.log(`Processing: ${file}`);

        try {
            // 1. Generate core WebP (original size)
            // Skip if already exists to save time on re-runs
            if (!fs.existsSync(path.join(publicDir, `${filename}.webp`))) {
                await sharp(inputPath)
                    .webp({ quality: 80 })
                    .toFile(path.join(publicDir, `${filename}.webp`));
                console.log(`  -> Generated ${filename}.webp`);
            }

            // 2. Generate core AVIF (original size)
            if (!fs.existsSync(path.join(publicDir, `${filename}.avif`))) {
                await sharp(inputPath)
                    .avif({ quality: 75, effort: 4 }) // Effort 4 for speed/size balance
                    .toFile(path.join(publicDir, `${filename}.avif`));
                console.log(`  -> Generated ${filename}.avif`);
            }

            // 3. Generate Responsive Sizes
            for (const size of sizes) {
                // WebP resized
                const webpOutput = path.join(publicDir, `${filename}-${size}w.webp`);
                if (!fs.existsSync(webpOutput)) {
                    await sharp(inputPath)
                        .resize(size, null, { withoutEnlargement: true })
                        .webp({ quality: 80 })
                        .toFile(webpOutput);
                    console.log(`  -> Generated ${filename}-${size}w.webp`);
                }

                // AVIF resized (Optional: can save more space but takes longer)
                const avifOutput = path.join(publicDir, `${filename}-${size}w.avif`);
                if (!fs.existsSync(avifOutput)) {
                    await sharp(inputPath)
                        .resize(size, null, { withoutEnlargement: true })
                        .avif({ quality: 70, effort: 3 })
                        .toFile(avifOutput);
                    console.log(`  -> Generated ${filename}-${size}w.avif`);
                }
            }

        } catch (err) {
            console.error(`Error converting ${file}:`, err);
        }
    }

    console.log('Advanced image optimization complete!');
}

optimizeImages();
