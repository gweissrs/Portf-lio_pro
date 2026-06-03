import { useState, useEffect } from 'react';

export function useScrollSpy(sectionIds, options = {}) {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const { rootMargin = '-20% 0px -70% 0px' } = options;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sectionIds, options.rootMargin]);

  return activeId;
}
