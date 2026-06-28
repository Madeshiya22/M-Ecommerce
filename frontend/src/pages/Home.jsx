import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiArrowRight, FiStar, FiTruck, FiRotateCcw, FiShield } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { productService } from '../services';
import ProductCard from '../components/ProductCard/ProductCard';
import './Home.css';
import leftImg from '../assets/left.png';
import rightImg from '../assets/right.png';
import shirtVideo from '../assets/shirt.mp4';

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES_DISPLAY = [
  { name: 'Oversized Tees', type: 'tshirt', tag: 'T-Shirt', href: '/shop?type=tshirt&category=oversized-tees', desc: 'Relaxed street-ready fits', img: 'https://images.unsplash.com/photo-1571455786673-9d9d6c194f90?q=80&w=800&auto=format&fit=crop' },
  { name: 'Graphic Tees', type: 'tshirt', tag: 'T-Shirt', href: '/shop?type=tshirt&category=graphic-tees', desc: 'Bold artistic expressions', img: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=800&auto=format&fit=crop' },
  { name: 'Casual Shirts', type: 'shirt', tag: 'Shirt', href: '/shop?type=shirt&category=casual-shirts', desc: 'Effortless everyday style', img: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=800&auto=format&fit=crop' },
  { name: 'Formal Shirts', type: 'shirt', tag: 'Shirt', href: '/shop?type=shirt&category=formal-shirts', desc: 'Sharp, sophisticated tailoring', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop' },
  { name: 'Denim Shirts', type: 'shirt', tag: 'Shirt', href: '/shop?type=shirt&category=denim-shirts', desc: 'Rugged premium denim', img: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?q=80&w=800&auto=format&fit=crop' },
  { name: 'Polo T-Shirts', type: 'tshirt', tag: 'T-Shirt', href: '/shop?type=tshirt&category=polo-t-shirts', desc: 'Classic elevated casuals', img: 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=800&auto=format&fit=crop' },
];

const FEATURES = [
  { icon: FiTruck, title: 'Complimentary Shipping', desc: 'Enjoy free shipping on orders over ₹999.' },
  { icon: FiRotateCcw, title: 'Hassle-Free Returns', desc: 'Seamless 7-day return and exchange policy.' },
  { icon: FiShield, title: 'Secure Checkout', desc: 'Encrypted transactions for complete security.' },
  { icon: FiStar, title: 'M-Luxury', desc: 'Flawless craftsmanship and superior fabrics.' },
];

export default function Home() {
  const { data: featuredData } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productService.getAll({ featured: true, limit: 8 }),
    select: (res) => res.data.data,
  });

  const { data: newArrivalsData } = useQuery({
    queryKey: ['products', 'new'],
    queryFn: () => productService.getAll({ newArrival: true, limit: 8 }),
    select: (res) => res.data.data,
  });

  useEffect(() => {
    // GSAP scroll animations
    gsap.utils.toArray('.gsap-fade-up').forEach((el) => {
      gsap.fromTo(
        el,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        }
      );
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <main className="home">
      {/* ── Premium Editorial Hero (M-COLLECTION) ── */}
      <section className="hero-editorial">
        <div className="container hero-editorial__inner">
          {/* Giant Title matching SWEATER vibe */}
          <div className="hero-editorial__title-wrap">
            <h1 className="hero-editorial__title">
              <span className="text-brown">M</span>-COLLECTION
            </h1>
          </div>

          {/* 2-Column Layout: Editorial Text (Left) + Floating Tilted Image Cards (Right) */}
          <div className="hero-editorial__content">
            {/* Left Column: Editorial Info */}
            <div className="hero-editorial__info-col" style={{ marginTop: '100px' }}>
              <div className="hero-editorial__block">
                <h4 className="hero-editorial__sub-title">Premium Collection</h4>
                <p className="hero-editorial__desc">
                  Discover the finest selection of premium shirts and t-shirts, crafted with meticulous attention to detail and designed for the modern trendsetter.
                </p>
              </div>

              <div className="hero-editorial__block">
                <h4 className="hero-editorial__sub-title">Our Legacy</h4>
                <p className="hero-editorial__desc">
                  A commitment to excellence, delivering high-quality fabrics and unparalleled comfort that redefines everyday fashion for you.
                </p>
              </div>
            </div>

            {/* Right Column: Floating Tilted Image Cards with smooth hover upward animation */}
            <div className="hero-editorial__visual-col">
              <div className="hero-editorial__card-wrapper hero-editorial__card-wrapper--1">
                <div className="hero-editorial__card hero-editorial__card--1">
                  <img src="https://i.pinimg.com/1200x/96/e7/b0/96e7b09ff2a8885e0ce2cbb119eb6584.jpg" alt="M-Collection Premium T-Shirt" />
                </div>
              </div>

              <div className="hero-editorial__card-wrapper hero-editorial__card-wrapper--2">
                <div className="hero-editorial__card hero-editorial__card--2">
                  <img src="https://i.pinimg.com/736x/80/a9/a8/80a9a8c6db47f9615f61fb2bcb6e1a3f.jpg" alt="M-Collection Casual Shirt" />
                </div>
              </div>

              <div className="hero-editorial__card-wrapper hero-editorial__card-wrapper--3">
                <div className="hero-editorial__card hero-editorial__card--3">
                  <img src="/third_hero_image.jpg" alt="M-Collection Premium Shirt" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="hero-editorial__bottom-bar">
            <Link to="/new-collection" className="hero-editorial__bottom-left" style={{ color: 'inherit', textDecoration: 'none' }}>New Collection</Link>
            <Link to="/shop" className="hero-editorial__bottom-right">Shop the Look →</Link>
          </div>
        </div>
      </section>

      {/* ── Premium Features ── */}
      <section className="features-minimal gsap-fade-up">
        <div className="container">
          <div className="features-minimal__grid">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-minimal-item">
                <div className="feature-minimal-item__icon"><Icon size={24} /></div>
                <h3 className="feature-minimal-item__title">{title}</h3>
                <p className="feature-minimal-item__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dual Image Section ── */}
      <section className="dual-image-section gsap-fade-up">
        <div className="dual-image-wrapper">
          <div className="dual-image-left">
            <img src={leftImg} alt="Left" />
          </div>
          <div className="dual-image-right">
            <img src={rightImg} alt="Right" />
          </div>
        </div>
      </section>

      {/* ── Editorial Category Grid ── */}
      <section className="categories-minimal">
        <div className="container">
          <div className="section-header gsap-fade-up">
            <p className="section-tag">Explore Collections</p>
            <h2 className="section-title">Essential Classifications</h2>
          </div>
          <div className="categories-minimal__grid">
            {CATEGORIES_DISPLAY.map(({ name, tag, desc, href, img }) => (
              <motion.div
                key={name}
                className="category-minimal-card gsap-fade-up"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                style={{ backgroundImage: `url(${img})` }}
              >
                <Link to={href} className="category-minimal-card__inner">
                  <div className="category-minimal-card__header">
                    <span className="category-minimal-card__tag">{tag}</span>
                    <FiArrowRight className="category-minimal-card__arrow" />
                  </div>
                  <h3 className="category-minimal-card__name">{name}</h3>
                  <p className="category-minimal-card__desc">{desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Auto-Play Video Banner ── */}
      <section className="video-banner-section gsap-fade-up">
        <video 
          className="promo-video" 
          src={shirtVideo} 
          autoPlay 
          loop 
          muted 
          playsInline
        />
      </section>

      {/* ── M-Favourites ── */}
      {featuredData && featuredData.length > 0 && (
        <section className="products-section">
          <div className="container">
            <div className="section-header section-header--row gsap-fade-up">
              <div>
                <p className="section-tag">Curated Picks</p>
                <h2 className="section-title">M-Favourites</h2>
                <p className="wrogn-curated-subtitle">Handpicked by M-experts. The definitive lineup of standout pieces.</p>
              </div>
              <Link to="/shop?featured=true" className="btn btn-secondary">View All <FiArrowRight /></Link>
            </div>
            <div className="product-grid">
              {featuredData.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Elegant Promo Banner ── */}
      <section className="promo-minimal gsap-fade-up">
        <div className="container">
          <div className="promo-minimal__inner">
            <div className="promo-minimal__content">
              <p className="section-tag">Limited Time Exclusive</p>
              <h2 className="promo-minimal__title">THE ARCHIVE SALE</h2>
              <p className="promo-minimal__sub">Take up to 50% off select archive signatures and seasonal essentials. Exceptional pieces at unprecedented value.</p>
              <Link to="/shop?sort=price_asc" className="btn btn-primary btn-lg">Explore Sale <FiArrowRight /></Link>
            </div>
            <div className="promo-minimal__visual">
              <img src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800&auto=format&fit=crop" alt="M-Archive Sale" />
            </div>
          </div>
        </div>
      </section>

      {/* ── New Arrivals ── */}
      {newArrivalsData && newArrivalsData.length > 0 && (
        <section className="products-section">
          <div className="container">
            <div className="section-header section-header--row gsap-fade-up">
              <div>
                <p className="section-tag">Just In</p>
                <h2 className="section-title">New Arrivals</h2>
                <p className="wrogn-curated-subtitle">The newest additions to our catalog. Uncompromising modern fits.</p>
              </div>
              <Link to="/shop?newArrival=true" className="btn btn-secondary">View All <FiArrowRight /></Link>
            </div>
            <div className="product-grid">
              {newArrivalsData.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Brand Strip ── */}
      <section className="brand-strip-minimal gsap-fade-up">
        <div className="container">
          <p className="brand-strip-minimal__text">M-ECOMMERCE — PURE ELEGANCE, UNCOMPROMISED QUALITY.</p>
        </div>
      </section>
    </main>
  );
}
