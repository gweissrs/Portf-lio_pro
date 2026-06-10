import { useEffect, useRef } from 'react'
import styles from './CustomCursor.module.css'

export function CustomCursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    let mouseX = 0, mouseY = 0
    let curX = 0, curY = 0
    let animId

    const getLuminance = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b

    const parseRGB = (str) => {
      const match = str?.match(/\d+/g)
      if (!match || match.length < 3) return null
      return {
        r: parseInt(match[0]),
        g: parseInt(match[1]),
        b: parseInt(match[2]),
        a: match[3] ? parseFloat(match[3]) : 1
      }
    }

    const isLightOrCyan = (colorStr) => {
      const c = parseRGB(colorStr)
      if (!c || c.a < 0.1) return false
      const isCyan = c.r < 80 && c.g > 150 && c.b > 180
      const isLight = getLuminance(c.r, c.g, c.b) > 180
      return isCyan || isLight
    }

    const updateCursorColor = (e) => {
      cursor.style.visibility = 'hidden'
      const el = document.elementFromPoint(e.clientX, e.clientY)
      cursor.style.visibility = 'visible'

      if (!el) return

      let shouldBeBlack = false
      let node = el

      while (node && node !== document.body) {
        const bg = window.getComputedStyle(node).backgroundColor
        const bgC = parseRGB(bg)
        if (bgC && bgC.a > 0.5 && isLightOrCyan(bg)) {
          shouldBeBlack = true
          break
        }
        node = node.parentElement
      }

      cursor.style.backgroundColor = shouldBeBlack ? '#000000' : '#06B6D4'
    }

    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      updateCursorColor(e)
    }

    const animate = () => {
      curX += (mouseX - curX) * 0.1
      curY += (mouseY - curY) * 0.1
      cursor.style.transform = `translate(${curX}px, ${curY}px)`
      animId = requestAnimationFrame(animate)
    }

    const expand = () => cursor.classList.add(styles.expanded)
    const collapse = () => cursor.classList.remove(styles.expanded)

    const attachHover = () => {
      const els = document.querySelectorAll(
        'a, button, [role="button"], input, textarea, select, label'
      )
      els.forEach(el => {
        el.addEventListener('mouseenter', expand)
        el.addEventListener('mouseleave', collapse)
      })
      return els
    }

    const els = attachHover()

    window.addEventListener('mousemove', onMouseMove)
    animId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(animId)
      els.forEach(el => {
        el.removeEventListener('mouseenter', expand)
        el.removeEventListener('mouseleave', collapse)
      })
    }
  }, [])

  return <div ref={cursorRef} className={styles.cursor} />
}
