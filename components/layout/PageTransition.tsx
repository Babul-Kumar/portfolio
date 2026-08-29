'use client'

import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  // Ensure every route navigation reliably starts at the top of the viewport
  // without smooth scrolling delay or layout jumps.
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    })
  }, [pathname])

  const transitionVariants = {
    initial: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 8 },
    animate: shouldReduceMotion
      ? { opacity: 1 }
      : { opacity: 1, y: 0 },
    exit: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: -4 },
  }

  return (
    <motion.div
      key={pathname}
      variants={transitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: shouldReduceMotion ? 0.15 : 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        width: '100%',
        minHeight: 'calc(100vh - 68px)',
        position: 'relative',
      }}
    >
      {children}
    </motion.div>
  )
}
