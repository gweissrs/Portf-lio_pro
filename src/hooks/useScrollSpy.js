import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollSpy(sectionIds, options = {}) {
  const [activeId, setActiveId] = useState(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const rootMargin = options.rootMargin ?? '-20% 0px -70% 0px';

    setActiveId(null);

    let observer;
    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveId(entry.target.id);
          });
        },
        { rootMargin }
      );

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [pathname, sectionIds]); // eslint-disable-line react-hooks/exhaustive-deps

  return activeId;
}
