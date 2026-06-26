import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getLenis } from '../../lib/lenisInstance'

export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const lenis = getLenis()

    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash)
        if (el) {
          lenis
            ? lenis.scrollTo(el, { offset: -100, immediate: false, duration: 1.2 })
            : el.scrollIntoView({ behavior: 'smooth' })
        }
      }, 350)
    } else {
      lenis
        ? lenis.scrollTo(0, { immediate: true })
        : window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return null
}
