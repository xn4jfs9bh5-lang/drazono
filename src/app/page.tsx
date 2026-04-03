import HeroSection from '@/components/home/HeroSection'
import TrustBanner from '@/components/home/TrustBanner'
import FeaturedVehicles from '@/components/home/FeaturedVehicles'
import BrandsSection from '@/components/home/BrandsSection'
import HowItWorks from '@/components/home/HowItWorks'
import CostSimulator from '@/components/home/CostSimulator'
import SavingsSection from '@/components/home/SavingsSection'
import Testimonials from '@/components/home/Testimonials'
import TrustProof from '@/components/home/TrustProof'
import FounderSection from '@/components/home/FounderSection'
import NewsletterSection from '@/components/home/NewsletterSection'

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustBanner />
      <FeaturedVehicles />
      <BrandsSection />
      <HowItWorks />
      <SavingsSection />
      <CostSimulator />
      <Testimonials />
      <TrustProof />
      <FounderSection />
      <div id="newsletter">
        <NewsletterSection />
      </div>
    </>
  )
}
