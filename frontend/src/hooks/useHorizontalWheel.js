import { useEffect } from 'react';

/**
 * Translate vertical wheel into horizontal scroll while the pointer is over
 * a horizontal track — only when the track can still scroll in that direction.
 * Releases the page to normal vertical scrolling at the ends (no scroll trap).
 * Compatible with Lenis: preventDefault only when consuming the gesture.
 */
export function useHorizontalWheel(ref, { enabled = true } = {}) {
    useEffect(() => {
        const el = ref?.current;
        if (!el || !enabled) return undefined;

        const onWheel = (e) => {
            // Prefer native horizontal / shift+wheel gestures
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

            const delta = e.deltaY;
            if (!delta) return;

            const max = el.scrollWidth - el.clientWidth;
            if (max <= 1) return;

            const atStart = el.scrollLeft <= 1;
            const atEnd = el.scrollLeft >= max - 1;
            const scrollingRight = delta > 0;
            const scrollingLeft = delta < 0;

            if ((scrollingRight && atEnd) || (scrollingLeft && atStart)) {
                return; // release to document / Lenis
            }

            e.preventDefault();
            el.scrollLeft += delta;
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [ref, enabled]);
}
