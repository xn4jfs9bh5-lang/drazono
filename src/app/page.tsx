import HeroSection from '@/components/home/HeroSection'
import TrustBanner from '@/components/home/TrustBanner'
import FeaturedVehicles from '@/components/home/FeaturedVehicles'
import BrandsSection from '@/components/home/BrandsSection'
import HowItWorks from '@/components/home/HowItWorks'
import WhyDrazono from '@/components/home/WhyDrazono'
import SavingsSection from '@/components/home/SavingsSection'
import CostSimulator from '@/components/home/CostSimulator'
import ComparisonTable from '@/components/home/ComparisonTable'
import AfterWhatsApp from '@/components/home/AfterWhatsApp'
import Testimonials from '@/components/home/Testimonials'
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
      <WhyDrazono />
      <SavingsSection />
      <CostSimulator />
      <ComparisonTable />
      <AfterWhatsApp />
      <Testimonials />
      <FounderSection />
      <NewsletterSection />
    </>
  )
}
