import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiArrowRight, FiStar, FiTruck, FiRotateCcw, FiShield } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { productService } from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import './Home.css';
import leftImg from '../../assets/left.png';
import rightImg from '../../assets/right.png';
import shirtVideo from '../../assets/shirt.mp4';
import oversizedTeesImg from '../../assets/oversizedtees.png';
import graphicTeesImg from '../../assets/graphictees.png';
import casualShirtImg from '../../assets/casual_shirt.png';
import formalShirtImg from '../../assets/formal_shirt.png';
import denimShirtImg from '../../assets/denim_shirt.png';
import poloTshirtImg from '../../assets/polo_T-shirt.png';
import modelImg1 from '../../assets/model/image1.png';
import modelImg2 from '../../assets/model/image2.png';
import modelImg3 from '../../assets/model/image3.png';
import modelImg4 from '../../assets/model/image4.png';

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES_DISPLAY = [
  { name: 'Oversized Tees', type: 'tshirt', tag: 'T-Shirt', href: '/shop?type=tshirt&category=oversized-tees', desc: 'Relaxed street-ready fits', img: oversizedTeesImg },
  { name: 'Graphic Tees', type: 'tshirt', tag: 'T-Shirt', href: '/shop?type=tshirt&category=graphic-tees', desc: 'Bold artistic expressions', img: graphicTeesImg },
  { name: 'Casual Shirts', type: 'shirt', tag: 'Shirt', href: '/shop?type=shirt&category=casual-shirts', desc: 'Effortless everyday style', img: casualShirtImg, bgPosition: 'center 10%' },
  { name: 'Formal Shirts', type: 'shirt', tag: 'Shirt', href: '/shop?type=shirt&category=formal-shirts', desc: 'Sharp, sophisticated tailoring', img: formalShirtImg, bgPosition: 'center 10%' },
  { name: 'Denim Shirts', type: 'shirt', tag: 'Shirt', href: '/shop?type=shirt&category=denim-shirts', desc: 'Rugged premium denim', img: denimShirtImg },
  { name: 'Polo T-Shirts', type: 'tshirt', tag: 'T-Shirt', href: '/shop?type=tshirt&category=polo-t-shirts', desc: 'Classic elevated casuals', img: poloTshirtImg },
];

const FEATURES = [
  { icon: FiTruck, title: 'Complimentary Shipping', desc: 'Enjoy free shipping on orders over â‚¹999.' },
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
      {/* â”€â”€ Premium Editorial Hero (M-COLLECTION) â”€â”€ */}
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
            <Link to="/shop" className="hero-editorial__bottom-right">Shop the Look â†’</Link>
          </div>
        </div>
      </section>

      {/* â”€â”€ Premium Features â”€â”€ */}
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

      {/* â”€â”€ Dual Image Section â”€â”€ */}
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

      {/* â”€â”€ Editorial Category Grid â”€â”€ */}
      <section className="categories-minimal">
        <div className="container">
          <div className="section-header gsap-fade-up">
            <p className="section-tag">Explore Collections</p>
            <h2 className="section-title">Essential Classifications</h2>
          </div>
          <div className="categories-minimal__grid">
            {CATEGORIES_DISPLAY.map(({ name, tag, desc, href, img, bgPosition }) => (
              <motion.div
                key={name}
                className="category-minimal-card gsap-fade-up"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                style={{ 
                  backgroundImage: `url(${img})`,
                  backgroundPosition: bgPosition || 'center'
                }}
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

      {/* â”€â”€ Auto-Play Video Banner â”€â”€ */}
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

      {/* â”€â”€ M-Favourites â”€â”€ */}
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

      {/* â”€â”€ Elegant Promo Banner â”€â”€ */}
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

      {/* â”€â”€ New Arrivals â”€â”€ */}
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

      {/* â”€â”€ Brand Strip â”€â”€ */}
      <section className="brand-strip-minimal gsap-fade-up">
        <div className="container">
          <p className="brand-strip-minimal__text"><span style={{ color: '#8B5A2B' }}>M</span>-COLLECTION â€” PURE ELEGANCE, UNCOMPROMISED QUALITY.</p>
        </div>
      </section>

      {/* â”€â”€ Model Gallery â”€â”€ */}
      <section className="model-gallery-section">
        <div className="model-gallery-grid">
          <div className="model-gallery-item">
            <img src={modelImg2} alt="Model 2" className="model-gallery-img" />
          </div>
          <div className="model-gallery-item">
            <img src={modelImg4} alt="Model 4" className="model-gallery-img" />
          </div>
          <div className="model-gallery-item">
            <img src={modelImg3} alt="Model 3" className="model-gallery-img" />
          </div>
          <div className="model-gallery-item">
            <img src={modelImg1} alt="Model 1" className="model-gallery-img" style={{ objectPosition: 'top center' }} />
          </div>
        </div>
      </section>
    </main>
  );
}
