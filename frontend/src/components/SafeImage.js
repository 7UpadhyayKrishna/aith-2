import { useState } from 'react';

function isSafeImageSrc(src) {
    if (!src || typeof src !== 'string') return false;
    const value = src.trim();
    if (!value) return false;
    const lower = value.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:') || lower.startsWith('blob:')) {
        return false;
    }
    if (value.startsWith('//')) return false;
    if (value.startsWith('/')) return true;
    try {
        const u = new URL(value);
        return u.protocol === 'https:' || u.protocol === 'http:';
    } catch {
        return false;
    }
}

/**
 * Reserved-ratio image with muted fallback when remote assets fail.
 * Blocks unsafe URL schemes (javascript:, data:, etc.).
 */
export default function SafeImage({
    src,
    alt = '',
    className = '',
    aspectClass = '',
    loading = 'lazy',
    decoding = 'async',
    draggable = false,
    ...rest
}) {
    const [failed, setFailed] = useState(false);
    const safe = isSafeImageSrc(src);

    if (failed || !safe) {
        return (
            <div
                className={`bg-olive/40 ${aspectClass} ${className}`.trim()}
                role="img"
                aria-label={alt || 'Image unavailable'}
                data-image-fallback
            />
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            loading={loading}
            decoding={decoding}
            draggable={draggable}
            onError={() => setFailed(true)}
            {...rest}
        />
    );
}
