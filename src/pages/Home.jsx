import HeroSlider from '../components/home/HeroSlider';
import ProductGrid from '../components/home/ProductGrid';
import CategoriesShowcase from '../components/home/CategoriesShowcase';
import StoreMap from '../components/home/StoreMap';
import { useSiteStore } from '../store/useSiteStore';

export default function Home() {
  const { homepageSections } = useSiteStore();
  const [firstSection, ...restSections] = homepageSections || [];

  return (
    <>
      {/* 1. Full-viewport CMS campaign carousel */}
      <HeroSlider />

      {/* 2. First admin-managed product section (e.g. NEW ARRIVALS) */}
      {firstSection && <ProductGrid section={firstSection} />}

      {/* 3. 4-tile category showcase */}
      <CategoriesShowcase />

      {/* 4. Remaining admin-managed product sections (e.g. CLOTHING SALES) */}
      {restSections.map(section => (
        <ProductGrid key={section.id} section={section} />
      ))}

      {/* 5. Flagship store interactive map */}
      <StoreMap />
    </>
  );
}
