import HeroSlider from '@/components/home/HeroSlider';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoryTabs from '@/components/home/CategoryTabs';

import BrandStory from '@/components/home/BrandStory';
import Certifications from '@/components/home/Certifications';


import NewsletterCTA from '@/components/home/NewsletterCTA';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function Home() {
  return (
    <>
      <HeroSlider />
      <ScrollReveal><FeaturedProducts /></ScrollReveal>

      <ScrollReveal><CategoryTabs /></ScrollReveal>
      <ScrollReveal><BrandStory /></ScrollReveal>

      <ScrollReveal><Certifications /></ScrollReveal>

      <ScrollReveal><NewsletterCTA /></ScrollReveal>
    </>
  );
}
