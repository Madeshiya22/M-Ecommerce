import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiArrowDown } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

export default function NewCollection() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'new-collection-page'],
    queryFn: () => productService.getAll({ newArrival: true, limit: 50 }),
    select: (res) => res.data.data,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isLoading && products) {
      gsap.fromTo(
        '.new-col-hero__title',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.new-col-hero__subtitle',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.2, ease: 'power3.out' }
      );
      gsap.utils.toArray('.gsap-fade-up').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }
  }, [isLoading, products]);

  return (
    <div className="new-collection-page">
      {/* Hero Section */}
      <section className="new-col-hero" style={{ 
        paddingTop: '140px',
        paddingBottom: 'var(--space-24)',
        textAlign: 'center',
        background: 'var(--clr-surface)',
        borderBottom: '1px solid var(--clr-border)',
        marginBottom: 'var(--space-16)'
      }}>
        <div className="container">
          <h1 className="new-col-hero__title" style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 'clamp(3rem, 6vw, 5rem)',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            lineHeight: 1,
            marginBottom: 'var(--space-4)'
          }}>
            New <span className="text-brown">Collection</span>
          </h1>
          <p className="new-col-hero__subtitle" style={{
            fontSize: '1.1rem',
            color: 'var(--clr-text-muted)',
            maxWidth: '600px',
            margin: '0 auto var(--space-8)'
          }}>
            Discover our latest arrivals. Impeccable craftsmanship meets modern aesthetics in our newest drop of premium apparel.
          </p>
          <div style={{ color: 'var(--clr-primary)', animation: 'bounce 2s infinite' }}>
            <FiArrowDown size={24} />
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="container" style={{ paddingBottom: 'var(--space-24)' }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-20)', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
            Loading latest arrivals...
          </div>
        ) : products && products.length > 0 ? (
          <div className="product-grid gsap-fade-up">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="gsap-fade-up" style={{ 
            textAlign: 'center', 
            padding: 'var(--space-24) 0',
            background: 'var(--clr-surface-2)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-4)', fontFamily: 'var(--font-display)' }}>Coming Soon</h3>
            <p style={{ color: 'var(--clr-text-muted)' }}>We are currently curating our new collection. Check back shortly.</p>
          </div>
        )}
      </section>
    </div>
  );
}
