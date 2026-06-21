import { useEffect, useRef } from 'react';

// Observe a sentinel element and invoke `onIntersect` when it scrolls into view.
// `enabled` lets callers stop observing once the last page has been reached.
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>(
  onIntersect: () => void,
  enabled = true
) {
  const ref = useRef<T>(null);
  // Keep the latest callback without re-subscribing the observer each render.
  const callbackRef = useRef(onIntersect);
  useEffect(() => {
    callbackRef.current = onIntersect;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callbackRef.current();
      },
      { rootMargin: '200px' } // prefetch slightly before the sentinel is visible
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  return ref;
}
