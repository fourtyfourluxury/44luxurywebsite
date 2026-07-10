import HeroSlider from '../components/home/HeroSlider';
import ProductGrid from '../components/home/ProductGrid';
import CategoriesShowcase from '../components/home/CategoriesShowcase';
import StoreMap from '../components/home/StoreMap';

export default function Home() {
  return (
    <>
      {/* 1. Full-viewport CMS campaign carousel */}
      <HeroSlider />

      {/* 2. 12-product 4-column NEW ARRIVALS grid */}
      <ProductGrid />

      {/* 3. 4-tile category showcase */}
      <CategoriesShowcase />

      {/* 4. Flagship store interactive map */}
      <StoreMap />
    </>
  );
}
