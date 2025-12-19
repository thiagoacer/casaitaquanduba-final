
import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    sizes?: string;
    priority?: boolean;
}

export default function OptimizedImage({
    src,
    alt,
    className = '',
    sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    priority = false,
    ...props
}: OptimizedImageProps) {
    // Extract filename without extension
    const filename = src.replace(/\.(png|jpg|jpeg|webp)$/, '');

    // Base path for images (assuming they are in public root or subdirectory)
    // If src is "image.png", filename is "image". 
    // We expect "image-320w.avif", "image-320w.webp", etc to exist.

    const widthSizes = [320, 640, 768, 1024, 1280];

    const generateSrcSet = (ext: string) => {
        return widthSizes
            .map(size => `${filename}-${size}w.${ext} ${size}w`)
            .join(', ');
    };

    return (
        <picture>
            <source
                type="image/avif"
                srcSet={generateSrcSet('avif')}
                sizes={sizes}
            />
            <source
                type="image/webp"
                srcSet={generateSrcSet('webp')}
                sizes={sizes}
            />
            <img
                src={`${filename}.webp`} // Fallback to core WebP
                alt={alt}
                className={className}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                width="800" // Default width/height to reduce CLS (should be overridden by className or props if known)
                height="600"
                {...props}
            />
        </picture>
    );
}
