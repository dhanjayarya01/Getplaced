import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { StatsSection } from "@/components/landing/stats-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { BentoSection } from "@/components/landing/bento-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CTASection } from "@/components/landing/cta-section"

export default function HomePage() {

  
  return (
    <main className="min-h-screen bg-background">
      {/* <Navbar /> */}
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <BentoSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
