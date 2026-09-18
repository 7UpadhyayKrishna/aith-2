import { useEffect } from 'react';

/**
 * Click/drag horizontal scroll for mouse users.
 * Does not interfere with touch (native swipe) or link clicks (small movement threshold).
 */
export function usePointerDragScroll(ref, { enabled = true, threshold = 6 } = {}) {
    useEffect(() => {
        const el = ref?.current;
        if (!el || !enabled) return undefined;

        let active = false;
        let startX = 0;
        let startScroll = 0;
        let moved = false;
        let pointerId = null;

        const onDown = (e) => {
            if (e.pointerType === 'touch') return;
            if (e.button !== 0) return;
            active = true;
            moved = false;
            pointerId = e.pointerId;
            startX = e.clientX;
            startScroll = el.scrollLeft;
            el.setPointerCapture?.(pointerId);
            el.style.cursor = 'grabbing';
        };

        const onMove = (e) => {
            if (!active) return;
            const dx = e.clientX - startX;
            if (Math.abs(dx) > threshold) moved = true;
            if (moved) {
                el.scrollLeft = startScroll - dx;
            }
        };

        const onUp = (e) => {
            if (!active) return;
            active = false;
            el.style.cursor = '';
            try {
                if (pointerId != null) el.releasePointerCapture?.(pointerId);
            } catch {
                /* already released */
            }
            pointerId = null;
            if (moved) {
                // Suppress the click that would follow a drag
                const suppress = (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    el.removeEventListener('click', suppress, true);
                };
                el.addEventListener('click', suppress, true);
            }
        };

        el.addEventListener('pointerdown', onDown);
        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerup', onUp);
        el.addEventListener('pointercancel', onUp);

        return () => {
            el.removeEventListener('pointerdown', onDown);
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerup', onUp);
            el.removeEventListener('pointercancel', onUp);
        };
    }, [ref, enabled, threshold]);
}
