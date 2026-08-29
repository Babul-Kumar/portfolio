import type { Metadata } from 'next'
import { getProfile } from '@/lib/data'
import HeroSection from '@/components/sections/Hero'
import HomeAboutSection from '@/components/home/HomeAboutSection'
import HomeTechStackSection from '@/components/home/HomeTechStackSection'
import HomeModuleRadarSection from '@/components/home/HomeModuleRadarSection'

export const revalidate = 60 // Revalidate every 60 seconds
 
export const metadata: Metadata = {
  title: 'Babul Kumar — AI / ML & Full-Stack Software Engineer',
  description:
    'Computer Science student at Lovely Professional University. Engineering intelligent AI/ML systems, developer tooling, and modern full-stack architectures.',
}

export default async function HomePage() {
  const profile = await getProfile()

  return (
    <>
      {/* 01: Hero Section with 3D Avatar & Core Focus */}
      <HeroSection profile={profile} />

      {/* 02: About Me (Profile, Education, Focus, Career Direction) */}
      <HomeAboutSection />

      {/* 03: Futuristic Tech Stack (12 Core Technologies) */}
      <HomeTechStackSection />

      {/* 04: Navigation Radar (Jump Links to Dedicated Modules) */}
      <HomeModuleRadarSection />
    </>
  )
}
