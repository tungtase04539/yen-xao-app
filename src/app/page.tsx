import HeroSlider from '@/components/home/HeroSlider';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoryTabs from '@/components/home/CategoryTabs';
import PressSection from '@/components/home/PressSection';
import Certifications from '@/components/home/Certifications';
import HomeBlogSection from '@/components/home/HomeBlogSection';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function Home() {
  return (
    <>
      <HeroSlider />
      <ScrollReveal><FeaturedProducts /></ScrollReveal>
      <ScrollReveal><CategoryTabs /></ScrollReveal>
      <ScrollReveal><PressSection /></ScrollReveal>
      <ScrollReveal><Certifications /></ScrollReveal>
      <ScrollReveal><HomeBlogSection /></ScrollReveal>
    </>
  );
}
