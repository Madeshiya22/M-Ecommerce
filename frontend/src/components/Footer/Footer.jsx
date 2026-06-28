import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiArrowRight } from 'react-icons/fi';
import './Footer.css';

const TSHIRT_LINKS = [
  { label: 'Oversized Tees', href: '/shop?type=tshirt&category=oversized-tees' },
  { label: 'Graphic Tees', href: '/shop?type=tshirt&category=graphic-tees' },
  { label: 'Polo T-Shirts', href: '/shop?type=tshirt&category=polo-t-shirts' },
  { label: 'Solid Tees', href: '/shop?type=tshirt&category=solid-tees' },
];

const SHIRT_LINKS = [
  { label: 'Casual Shirts', href: '/shop?type=shirt&category=casual-shirts' },
  { label: 'Formal Shirts', href: '/shop?type=shirt&category=formal-shirts' },
  { label: 'Denim Shirts', href: '/shop?type=shirt&category=denim-shirts' },
  { label: 'Printed Shirts', href: '/shop?type=shirt&category=printed-shirts' },
];

const HELP_LINKS = [
  { label: 'Size Guide', href: '/size-guide' },
  { label: 'Track Order', href: '/orders' },
  { label: 'Returns & Exchange', href: '/returns' },
  { label: 'FAQs', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top container">
        {/* Brand */}
        <div className="footer__brand">
          <div className="footer__logo">
            <span>M</span> <span style={{ marginLeft: 6 }}>COLLECTION</span>
          </div>
          <p className="footer__tagline">
            Premium streetwear meets elevated fashion. T-shirts and shirts crafted for those who live boldly.
          </p>
          <div className="footer__socials">
            {[FiInstagram, FiTwitter, FiFacebook, FiYoutube].map((Icon, i) => (
              <a key={i} href="#" className="footer__social-btn" aria-label="social">
                <Icon size={18} />
              </a>
            ))}
          </div>
          <div className="footer__newsletter">
            <p className="footer__newsletter-label">Get 15% off your first order</p>
            <form className="footer__newsletter-form" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" className="form-input footer__newsletter-input" />
              <button type="submit" className="footer__newsletter-btn"><FiArrowRight size={18} /></button>
            </form>
          </div>
        </div>

        {/* T-Shirts */}
        <div className="footer__col">
          <h4 className="footer__col-title">T-Shirts</h4>
          <ul className="footer__col-links">
            {TSHIRT_LINKS.map(l => (
              <li key={l.label}><Link to={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Shirts */}
        <div className="footer__col">
          <h4 className="footer__col-title">Shirts</h4>
          <ul className="footer__col-links">
            {SHIRT_LINKS.map(l => (
              <li key={l.label}><Link to={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div className="footer__col">
          <h4 className="footer__col-title">Help</h4>
          <ul className="footer__col-links">
            {HELP_LINKS.map(l => (
              <li key={l.label}><Link to={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer__bottom container">
        <p>© 2026 M-Collection. All rights reserved.</p>
        <div className="footer__bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
        </div>
        <div className="footer__payments">
          <span className="footer__payment-badge">VISA</span>
          <span className="footer__payment-badge">MC</span>
          <span className="footer__payment-badge">UPI</span>
          <span className="footer__payment-badge">COD</span>
        </div>
      </div>
    </footer>
  );
}
