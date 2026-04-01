import HeroSection from '@/components/home/HeroSection'
import FeaturedVehicles from '@/components/home/FeaturedVehicles'
import BrandsSection from '@/components/home/BrandsSection'
import HowItWorks from '@/components/home/HowItWorks'
import WhyDrazono from '@/components/home/WhyDrazono'
import ComparisonTable from '@/components/home/ComparisonTable'
import AfterWhatsApp from '@/components/home/AfterWhatsApp'
import Testimonials from '@/components/home/Testimonials'
import FounderSection from '@/components/home/FounderSection'

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedVehicles />
      <BrandsSection />
      <HowItWorks />
      <WhyDrazono />
      <ComparisonTable />
      <AfterWhatsApp />
      <Testimonials />
      <FounderSection />
    </>
  )
}
