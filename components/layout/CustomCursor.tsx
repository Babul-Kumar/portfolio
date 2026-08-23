'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Strictly pointer-fine devices only (mouse / trackpad)
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let mouseX = -100, mouseY = -100
    let ringX = -100, ringY = -100
    let animId: number

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animate = () => {
      ringX += (mouseX - ringX) * 0.14
      ringY += (mouseY - ringY) * 0.14

      if (dotRef.current) {
        dotRef.current.style.left = `${mouseX}px`
        dotRef.current.style.top = `${mouseY}px`
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`
        ringRef.current.style.top = `${ringY}px`
      }
      if (badgeRef.current) {
        badgeRef.current.style.left = `${ringX}px`
        badgeRef.current.style.top = `${ringY}px`
      }

      animId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    animId = requestAnimationFrame(animate)

    // Hover state on interactive elements
    const handleElementEnter = (e: Event) => {
      document.body.classList.add('cursor-hover')
      const target = e.currentTarget as HTMLElement
      const label = target.getAttribute('data-cursor-label')
      if (label && badgeRef.current) {
        badgeRef.current.textContent = label
        document.body.classList.add('cursor-has-label')
      }
    }

    const handleElementLeave = () => {
      document.body.classList.remove('cursor-hover')
      document.body.classList.remove('cursor-has-label')
      if (badgeRef.current) {
        badgeRef.current.textContent = ''
      }
    }

    const addListeners = () => {
      document.querySelectorAll('a, button, [role="button"], [data-cursor="hover"], [data-cursor-label]').forEach((el) => {
        el.removeEventListener('mouseenter', handleElementEnter)
        el.removeEventListener('mouseleave', handleElementLeave)
        el.addEventListener('mouseenter', handleElementEnter)
        el.addEventListener('mouseleave', handleElementLeave)
      })
    }

    addListeners()
    const observer = new MutationObserver(addListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(animId)
      observer.disconnect()
      document.body.classList.remove('cursor-hover', 'cursor-has-label')
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="custom-cursor" aria-hidden="true" />
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden="true" />
      <div ref={badgeRef} className="custom-cursor-badge" aria-hidden="true" />
    </>
  )
}
