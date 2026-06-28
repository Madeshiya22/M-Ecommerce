import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiChevronDown, FiGrid, FiList, FiSliders } from 'react-icons/fi';
import { productService, categoryService } from '../services';
import ProductCard from '../components/ProductCard/ProductCard';
import './Shop.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Best Rating', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);

  const type = searchParams.get('type') || '';
  const keyword = searchParams.get('keyword') || '';
  const newArrival = searchParams.get('newArrival') || '';
  const featured = searchParams.get('featured') || '';

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', type],
    queryFn: () => categoryService.getAll(type ? { type } : {}),
    select: (res) => res.data.data,
  });

  // Fetch products
  const { data: productsData, isLoading, isFetching } = useQuery({
    queryKey: ['products', { type, keyword, selectedCategory, selectedSizes, priceRange, sort, page, newArrival, featured }],
    queryFn: () =>
      productService.getAll({
        type: type || undefined,
        keyword: keyword || undefined,
        category: selectedCategory || undefined,
        size: selectedSizes.length ? selectedSizes.join(',') : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 10000 ? priceRange[1] : undefined,
        sort,
        page,
        limit: 12,
        newArrival: newArrival || undefined,
        featured: featured || undefined,
      }),
    select: (res) => res.data,
    keepPreviousData: true,
  });

  const products = productsData?.data || [];
  const pagination = productsData?.pagination || {};

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setPriceRange([0, 10000]);
    setSelectedCategory('');
    setPage(1);
  };

  const pageTitle = keyword ? `Search: "${keyword}"` : type === 'tshirt' ? 'T-Shirts' : type === 'shirt' ? 'Shirts' : 'All Products';

  return (
    <div className="shop-page">
      {/* Header */}
      <div className="shop-header">
        <div className="container">
          <div className="shop-header__inner">
            <div>
              <h1 className="shop-header__title">{pageTitle}</h1>
              {pagination.total !== undefined && (
                <p className="shop-header__count">{pagination.total} products</p>
              )}
            </div>
            <div className="shop-header__controls">
              <select
                className="form-input form-select shop-sort"
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button className="btn btn-ghost btn-sm shop-filter-toggle" onClick={() => setFiltersOpen(true)}>
                <FiSliders size={16} /> Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container shop-layout">
        {/* Sidebar */}
        <AnimatePresence>
          {(filtersOpen || true) && (
            <motion.aside
              className={`shop-sidebar ${filtersOpen ? 'shop-sidebar--mobile-open' : ''}`}
              initial={false}
            >
              <div className="shop-sidebar__header">
                <h3 className="shop-sidebar__title">Filters</h3>
                <button className="shop-sidebar__mobile-close" onClick={() => setFiltersOpen(false)}>
                  <FiX size={20} />
                </button>
                {(selectedSizes.length > 0 || selectedCategory) && (
                  <button className="shop-sidebar__clear" onClick={clearFilters}>Clear All</button>
                )}
              </div>

              {/* Type filter */}
              <div className="filter-group">
                <h4 className="filter-group__title">Type</h4>
                <div className="filter-group__options">
                  {['', 'tshirt', 'shirt'].map((t) => (
                    <button
                      key={t}
                      className={`filter-chip ${(type === t || (!type && !t)) ? 'filter-chip--active' : ''}`}
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        if (t) newParams.set('type', t); else newParams.delete('type');
                        newParams.delete('category');
                        setSelectedCategory('');
                        setPage(1);
                        setSearchParams(newParams);
                      }}
                    >
                      {t === '' ? 'All' : t === 'tshirt' ? 'T-Shirts' : 'Shirts'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              {categoriesData && categoriesData.length > 0 && (
                <div className="filter-group">
                  <h4 className="filter-group__title">Category</h4>
                  <div className="filter-group__list">
                    <button
                      className={`filter-list-item ${!selectedCategory ? 'filter-list-item--active' : ''}`}
                      onClick={() => { setSelectedCategory(''); setPage(1); }}
                    >
                      All
                    </button>
                    {categoriesData.map((cat) => (
                      <button
                        key={cat._id}
                        className={`filter-list-item ${selectedCategory === cat._id ? 'filter-list-item--active' : ''}`}
                        onClick={() => { setSelectedCategory(cat._id); setPage(1); }}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div className="filter-group">
                <h4 className="filter-group__title">Size</h4>
                <div className="filter-group__sizes">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      className={`size-chip ${selectedSizes.includes(size) ? 'size-chip--active' : ''}`}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <h4 className="filter-group__title">Price Range</h4>
                <div className="price-range">
                  <div className="price-range__labels">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => { setPriceRange([priceRange[0], Number(e.target.value)]); setPage(1); }}
                    className="price-range__slider"
                  />
                </div>
              </div>

              {/* Mobile overlay */}
              {filtersOpen && (
                <div className="shop-sidebar__overlay" onClick={() => setFiltersOpen(false)} />
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Products */}
        <div className="shop-products">
          {isLoading ? (
            <div className="product-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="product-card">
                  <div className="product-card__image-wrap skeleton" style={{ aspectRatio: '3/4' }} />
                  <div className="product-card__body">
                    <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 8, borderRadius: 6 }} />
                    <div className="skeleton" style={{ height: 16, width: '85%', marginBottom: 8, borderRadius: 6 }} />
                    <div className="skeleton" style={{ height: 16, width: '40%', borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="shop-empty">
              <span className="shop-empty__icon">🔍</span>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="shop-pagination">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`shop-pagination__btn ${p === page ? 'shop-pagination__btn--active' : ''}`}
                      onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
