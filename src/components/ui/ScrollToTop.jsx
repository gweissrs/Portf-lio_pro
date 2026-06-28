import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getLenis } from '../../lib/lenisInstance'

export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      let attempts = 0
      const tryScroll = () => {
        const el = document.querySelector(hash)
        if (el) {
          const lenis = getLenis()
          lenis
            ? lenis.scrollTo(el, { offset: -100, immediate: false, duration: 1.0 })
            : el.scrollIntoView({ behavior: 'smooth' })
        } else if (attempts++ < 30) {
          setTimeout(tryScroll, 50)
        }
      }
      setTimeout(tryScroll, 100)
    } else {
      const lenis = getLenis()
      lenis
        ? lenis.scrollTo(0, { immediate: true })
        : window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return null
}
