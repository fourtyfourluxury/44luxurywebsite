import { Link } from 'react-router-dom';
import { useSiteStore } from '../../store/useSiteStore';
import ProductCard from '../product/ProductCard';

/**
 * ProductGrid — renders one admin-managed homepage product section.
 * `section` comes from the `homepage_sections` table: { title, product_ids }.
 */
export default function ProductGrid({ section }) {
  const { products, collections, partnerships, _hasHydrated } = useSiteStore();

  if (!_hasHydrated || !section) return null;

  const productMap = Object.fromEntries(products.map(p => [p.id, p]));
  const displayProducts = (section.product_ids || [])
    .map(id => productMap[id])
    .filter(p => p && p.status !== 'DRAFT')
    .slice(0, 8);

  if (displayProducts.length === 0) return null;

  // "View All" goes to the linked Collection/Partnership's full page when
  // set, otherwise to this section's own dedicated page (not a generic
  // /shop fallback) so it only ever shows the products actually curated here.
  let viewAllLink = `/featured/${section.slug || ''}`;
  if (section.collection_id) {
    const linked = collections.find(c => c.id === section.collection_id);
    if (linked) viewAllLink = `/collections/${linked.slug}`;
  } else if (section.partnership_id) {
    const linked = partnerships.find(p => p.id === section.partnership_id);
    if (linked) viewAllLink = `/partnerships/${linked.slug}`;
  }

  return (
    <section className="py-20 md:py-28 px-5 md:px-8 lg:px-14 max-w-[1440px] mx-auto">

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 mb-10 pb-8 border-b border-[#1c1c18]/10">
        <h2 className="font-unica text-5xl md:text-6xl lg:text-7xl uppercase tracking-tighter text-[#1c1c18] leading-none">
          {section.title}
        </h2>
        <Link
          to={viewAllLink}
          className="inline-flex items-center gap-3 border-2 border-[#1c1c18] text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-[10px] px-7 py-3 hover:bg-[#1c1c18] hover:text-[#fcf9f3] transition-all duration-300 group shrink-0"
        >
          VIEW ALL
          <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
        </Link>
      </div>

      {/* 4-column Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 md:gap-x-4 gap-y-10 md:gap-y-14">
        {displayProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
