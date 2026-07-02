import HeroSlider from '../components/home/HeroSlider';
import ProductGrid from '../components/home/ProductGrid';
import CategoriesShowcase from '../components/home/CategoriesShowcase';
import CollectionsBanner from '../components/home/CollectionsBanner';

export default function Home() {
  return (
    <>
      {/* 1. Full-viewport hero image / slider */}
      <HeroSlider />

      {/* 2. 12-product 4-column NEW ARRIVALS grid */}
      <ProductGrid />

      {/* 3. 4-tile category showcase (Sweatshirts, Jackets, Polo, Accessories) */}
      <CategoriesShowcase />

      {/* 4. 44 LUXURY Collections editorial banner */}
      <CollectionsBanner />
    </>
  );
}
