import { gsap } from 'gsap'

const OVERSHOOT = 60
const BLADE_BG_UP   = 'linear-gradient(to bottom, rgba(10,10,10,0) 0px, rgba(10,10,10,0.6) 15px, rgba(10,10,10,0.92) 32px, #0A0A0A 48px)'
const BLADE_BG_DOWN = 'linear-gradient(to top,   rgba(10,10,10,0) 0px, rgba(10,10,10,0.6) 15px, rgba(10,10,10,0.92) 32px, #0A0A0A 48px)'

export const playProjectTransition = (rowEl, onComplete) => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) {
    onComplete()
    return
  }

  const rowRect = rowEl.getBoundingClientRect()
  const lineY = rowRect.bottom
  const vh = window.innerHeight

  sessionStorage.setItem('lastSplitY', String(lineY))

  const tl = gsap.timeline({ onComplete })

  const contents = rowEl.querySelectorAll('[data-project-content]')
  tl.to(contents, {
    x: 160,
    opacity: 0,
    duration: 0.32,
    ease: 'power3.in',
    stagger: 0.05,
  })

  tl.add(() => {
    const bladeUp = document.createElement('div')
    bladeUp.setAttribute('data-blade', 'transition')
    bladeUp.style.cssText = `
      position: fixed;
      left: 0;
      right: 0;
      bottom: ${vh - lineY}px;
      height: 0px;
      background: ${BLADE_BG_UP};
      z-index: 9998;
      pointer-events: none;
      will-change: height;
    `

    const bladeDown = document.createElement('div')
    bladeDown.setAttribute('data-blade', 'transition')
    bladeDown.style.cssText = `
      position: fixed;
      left: 0;
      right: 0;
      top: ${lineY}px;
      height: 0px;
      background: ${BLADE_BG_DOWN};
      z-index: 9998;
      pointer-events: none;
      will-change: height;
    `

    document.body.appendChild(bladeUp)
    document.body.appendChild(bladeDown)

    gsap.to(bladeUp, {
      height: lineY + OVERSHOOT,
      duration: 0.7,
      ease: 'power2.inOut',
    })

    gsap.to(bladeDown, {
      height: vh - lineY + OVERSHOOT,
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete: () => {
        setTimeout(() => {
          document.querySelectorAll('[data-blade="transition"]').forEach(el => el.remove())
        }, 600)
      },
    })
  }, '-=0.05')

  tl.to({}, { duration: 0.75 })
}

export const playProjectEntrance = (onComplete) => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) {
    onComplete?.()
    return
  }

  const savedSplitY = sessionStorage.getItem('lastSplitY')
  const vh = window.innerHeight
  const splitY = savedSplitY
    ? Math.min(Math.max(parseFloat(savedSplitY), 50), vh - 50)
    : vh / 2

  const bladeUp = document.createElement('div')
  bladeUp.setAttribute('data-blade', 'entrance')
  bladeUp.style.cssText = `
    position: fixed;
    left: 0;
    right: 0;
    bottom: ${vh - splitY}px;
    height: ${splitY + OVERSHOOT}px;
    background: ${BLADE_BG_UP};
    opacity: 1;
    z-index: 9998;
    pointer-events: none;
    will-change: height;
  `

  const bladeDown = document.createElement('div')
  bladeDown.setAttribute('data-blade', 'entrance')
  bladeDown.style.cssText = `
    position: fixed;
    left: 0;
    right: 0;
    top: ${splitY}px;
    height: ${vh - splitY + OVERSHOOT}px;
    background: ${BLADE_BG_DOWN};
    opacity: 1;
    z-index: 9998;
    pointer-events: none;
    will-change: height;
  `

  document.body.appendChild(bladeUp)
  document.body.appendChild(bladeDown)

  const rows = document.querySelectorAll('[data-project-row]')
  const header = document.querySelector('[data-project-header]')

  gsap.set([header, ...rows], {
    opacity: 0,
    y: 30,
    filter: 'blur(6px)',
  })

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      gsap.to(bladeUp, {
        height: 0,
        duration: 0.7,
        ease: 'power2.inOut',
        delay: 0.1,
      })

      gsap.to(bladeDown, {
        height: 0,
        duration: 0.7,
        ease: 'power2.inOut',
        delay: 0.1,
        onComplete: () => {
          document.querySelectorAll('[data-blade="entrance"]').forEach(el => el.remove())
          sessionStorage.removeItem('lastSplitY')
          onComplete?.()
        },
      })

      gsap.to([header, ...rows], {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'expo.out',
        stagger: 0.08,
        delay: 0.2,
        clearProps: 'filter',
      })
    })
  })
}
