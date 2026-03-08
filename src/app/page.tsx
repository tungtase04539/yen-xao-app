import HeroSlider from '@/components/home/HeroSlider';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoryTabs from '@/components/home/CategoryTabs';
import Certifications from '@/components/home/Certifications';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function Home() {
  return (
    <>
      <HeroSlider />
      <ScrollReveal><FeaturedProducts /></ScrollReveal>
      <ScrollReveal><CategoryTabs /></ScrollReveal>
      <ScrollReveal><Certifications /></ScrollReveal>
    </>
  );
}
