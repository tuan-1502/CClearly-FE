import {
  Glasses,
  Scan,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Package,
} from 'lucide-react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '@/components/ui/Pagination';
import { useProducts } from '@/hooks/useProduct';

const pageSizeOptions = [4, 8, 12];
const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const ProductImageFallback = ({ images, alt, IconComponent, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!images || !Array.isArray(images) || images.length === 0 || currentIndex >= images.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <IconComponent className="h-20 w-20 text-[#c5cdd8] transition-transform duration-300 group-hover:scale-110 group-hover:text-[#d90f0f]" />
      </div>
    );
  }

  return (
    <img
      key={currentIndex}
      src={images[currentIndex]}
      alt={alt}
      className={className}
      onError={() => setCurrentIndex(prev => prev + 1)}
    />
  );
};

const BestSellerPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: allProductsData = {}, isLoading, isError } = useProducts();
  const allProducts = Array.isArray(allProductsData.content)
    ? allProductsData.content
    : [];

  if (!Array.isArray(allProducts)) {
    console.error('Invalid data format for allProducts:', allProductsData);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold text-red-500">
          Dữ liệu sản phẩm không hợp lệ. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Loading products...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold text-red-500">
          Failed to load products. Please try again later.
        </p>
      </div>
    );
  }

  console.log('All Products Data:', allProductsData);
  console.log('All Products Count:', allProducts.length);

  if (allProducts.length > 0) {
    console.log('First Product Structure:', allProducts[0]);
    console.log('First Product Keys:', Object.keys(allProducts[0]));
  }

  if (!allProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold text-red-500">
          Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  // Improved filter criteria for Best Sellers
  const bestSellers = useMemo(() => {
    console.log('Filtering products for Best Sellers...');

    // Try multiple filter strategies
    let filtered = [];

    // Strategy 1: Filter by isSale or high rating
    const bySaleOrRating = allProducts.filter((product) => {
      return product.isSale || (product.rating && product.rating >= 4.5);
    });
    console.log(`Strategy 1 (isSale or rating>=4.5): ${bySaleOrRating.length} products`);

    if (bySaleOrRating.length > 0) {
      filtered = bySaleOrRating;
    } else {
      // Strategy 2: Filter by stock and category (frames and lenses)
      const byStockAndCategory = allProducts.filter((product) => {
        return product.stock > 0 && (product.type === 'frame' || product.type === 'lens');
      });
      console.log(`Strategy 2 (stock>0 and frame/lens): ${byStockAndCategory.length} products`);

      if (byStockAndCategory.length > 0) {
        filtered = byStockAndCategory;
      } else {
        // Strategy 3: Just use products with stock
        const byStock = allProducts.filter((product) => product.stock > 0);
        console.log(`Strategy 3 (stock>0): ${byStock.length} products`);
        filtered = byStock.length > 0 ? byStock : allProducts;
      }
    }

    // Scoring function for sorting
    const getScore = (product) => {
      let score = 0;

      // Higher score for sale items
      if (product.isSale) score += 1000;

      // Higher score for products with better ratings
      if (product.rating) score += product.rating * 100;

      // Higher score for products with more reviews
      if (product.reviewCount) score += product.reviewCount * 10;

      // Higher score for higher price (premium products)
      if (product.price) score += product.price / 1000;

      // Higher score for more stock
      if (product.stock) score += Math.min(product.stock, 100);

      return score;
    };

    return filtered.sort((a, b) => getScore(b) - getScore(a));
  }, [allProducts]);

  console.log('Best Sellers Count:', bestSellers.length);
  console.log('Best Sellers:', bestSellers);

  const summaryStats = useMemo(() => {
    const saleCount = bestSellers.filter((product) => product.isSale).length;
    const avgRating = bestSellers.length
      ? (
        bestSellers.reduce(
          (total, product) => total + (product.rating || 0),
          0
        ) / bestSellers.length
      ).toFixed(1)
      : '0.0';

    return {
      saleCount,
      avgRating,
      frameCount: bestSellers.filter((product) => product.type === 'frame')
        .length,
      lensCount: bestSellers.filter((product) => product.type === 'lens')
        .length,
    };
  }, [bestSellers]);

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả', count: bestSellers.length },
      { value: 'frame', label: 'Gọng kính', count: summaryStats.frameCount },
      { value: 'lens', label: 'Tròng kính', count: summaryStats.lensCount },
    ],
    [bestSellers.length, summaryStats.frameCount, summaryStats.lensCount]
  );

  const filteredProducts = useMemo(() => {
    let result = [...bestSellers];

    if (searchTerm) {
      const search = searchTerm.toLowerCase().trim();
      result = result.filter(
        (product) =>
          product.name?.toLowerCase().includes(search) ||
          product.description?.toLowerCase().includes(search) ||
          product.sku?.toLowerCase().includes(search)
      );
    }

    if (categoryFilter) {
      result = result.filter((product) => product.type === categoryFilter);
    }

    return result;
  }, [bestSellers, searchTerm, categoryFilter]);

  console.log('Filtered Products:', filteredProducts);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const normalizedCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const startIndex = (normalizedCurrentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, normalizedCurrentPage, pageSize]);

  console.log('Paginated Products:', paginatedProducts);

  const shownFrom =
    filteredProducts.length === 0
      ? 0
      : (normalizedCurrentPage - 1) * pageSize + 1;
  const shownTo = Math.min(
    normalizedCurrentPage * pageSize,
    filteredProducts.length
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
  };

  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      <section className="border-b border-[#dbe4f4] bg-white">
        <div className="mx-auto max-w-[1180px] px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-[#606b7f]">
            <Link to="/" className="hover:text-[#d90f0f]">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="font-medium text-[#1d2433]">Best Sellers</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold uppercase tracking-tight text-[#1d2433]">
            Best Sellers
          </h1>
          <p className="mt-2 text-[#606b7f]">
            Những thiết kế biểu tượng được khách hàng CClearly lựa chọn nhiều nhất
          </p>
        </div>
      </section>

      <section className="sticky top-0 z-30 border-b border-[#dbe4f4] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div ref={searchContainerRef} className="relative w-full lg:max-w-lg">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b8494]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  handleSearchChange(e);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Tìm sản phẩm hot theo tên, mô tả hoặc mã SKU..."
                className="w-full rounded-2xl border border-[#d8e2f2] bg-[#f8fbff] py-3 pl-12 pr-4 text-sm text-[#1f2937] outline-none transition focus:border-[#d90f0f] focus:ring-2 focus:ring-[#d90f0f]/20"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && searchTerm.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[320px] overflow-hidden rounded-2xl border border-[#dbe4f4] bg-white/95 shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      <div className="p-2">
                        {filteredProducts.slice(0, 6).map((product) => (
                          <div
                            key={product.id}
                            onClick={() => {
                              setSearchTerm(product.name || '');
                              setShowSuggestions(false);
                              setCurrentPage(1);
                            }}
                            className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#eff4ff] group"
                          >
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#f0f5ff] text-[#d90f0f] group-hover:bg-white transition-colors">
                              {product.type === 'frame' ? (
                                <Glasses className="h-5 w-5" />
                              ) : (
                                <Scan className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-[#1d2433] group-hover:text-[#d90f0f]">
                                {product.name}
                              </span>
                              <span className="text-[10px] font-medium uppercase tracking-wider text-[#7b8494]">
                                {product.type === 'frame' ? 'Gọng kính' : 'Tròng kính'} • {product.sku}
                              </span>
                            </div>
                          </div>
                        ))}
                        {filteredProducts.length > 6 && (
                          <div className="border-t border-[#f0f5ff] px-4 py-2 text-center">
                            <span className="text-xs font-medium text-[#606b7f]">
                              Xem tất cả {filteredProducts.length} kết quả
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="px-6 py-8 text-center text-[#606b7f]">
                        <p className="text-sm">Không tìm thấy sản phẩm nào</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#d8e2f2] bg-white px-3 py-2 text-sm text-[#4f5562]">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="bg-transparent font-semibold text-[#d90f0f] outline-none"
                >
                  {pageSizeOptions.map((value) => (
                    <option key={value} value={value}>
                      {value}/ trang
                    </option>
                  ))}
                </select>
              </div>
              <p className="rounded-xl bg-[#eff4ff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#d90f0f]">
                {shownFrom}-{shownTo} / {filteredProducts.length} SẢN PHẨM
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categoryOptions.map((option) => {
              const isActive = categoryFilter === option.value;
              return (
                <button
                  key={option.value || 'all'}
                  onClick={() => handleCategoryChange(option.value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${isActive
                      ? 'border-[#d90f0f] bg-[#d90f0f] text-white shadow-[0_8px_20px_rgba(15,93,217,0.3)]'
                      : 'border-[#d8e2f2] bg-white text-[#4f5562] hover:border-[#d90f0f]/35 hover:text-[#d90f0f]'
                    }`}
                >
                  <span>{option.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-white/20' : 'bg-[#eff4ff] text-[#d90f0f]'}`}
                  >
                    {option.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-[1180px] px-4">
          {paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedProducts.map((product) => {
                  const hasDiscount =
                    product.originalPrice &&
                    product.originalPrice > product.basePrice;
                  const discountPercent = hasDiscount
                    ? Math.round(
                      ((product.originalPrice - product.basePrice) /
                        product.originalPrice) *
                      100
                    )
                    : 0;

                  const IconComponent =
                    product.type === 'frame'
                      ? Glasses
                      : product.type === 'lens'
                        ? Scan
                        : Package;

                  // Collect all possible images for this product (product-level + all variant-level)
                  const allImages = [
                    ...(product.images || []),
                    ...(product.variants || []).flatMap((v) => v.images || []),
                  ];
                  const uniqueImages = [...new Set(allImages)];

                  return (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="group overflow-hidden rounded-3xl border border-[#e4eaf6] bg-white shadow-[0_12px_30px_rgba(15,35,95,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_35px_rgba(15,35,95,0.14)]"
                    >
                      <div className="relative aspect-square overflow-hidden bg-[linear-gradient(145deg,#f7f9ff,#edf2ff)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(15,93,217,0.12),transparent_50%)]" />
                        <div className="relative flex h-full items-center justify-center">
                          <ProductImageFallback
                            images={uniqueImages}
                            alt={product.name}
                            IconComponent={IconComponent}
                            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        <div className="absolute left-3 top-3 flex flex-col gap-2">
                          {product.isSale && (
                            <span className="rounded-full bg-[#f7c948] px-3 py-1 text-xs font-bold text-[#222]">
                              Sale
                            </span>
                          )}
                          {product.rating >= 4.5 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#d90f0f] px-3 py-1 text-xs font-bold text-white">
                              <Sparkles className="h-3 w-3" />
                              Hot
                            </span>
                          )}
                        </div>

                        {hasDiscount && (
                          <div className="absolute right-3 top-3 rounded-full bg-[#ef4444] px-3 py-1 text-xs font-bold text-white">
                            -{discountPercent}%
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <span className="mb-3 inline-flex rounded-full bg-[#eff4ff] px-3 py-1 text-xs font-semibold text-[#d90f0f]">
                          {product.type === 'frame'
                            ? 'Gọng kính'
                            : 'Tròng kính'}
                        </span>
                        <h3 className="line-clamp-1 text-lg font-semibold text-[#1d2433]">
                          {product.name}
                        </h3>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[#f7b500]">
                            {[...Array(5)].map((_, index) => (
                              <Star
                                key={index}
                                className={`h-4 w-4 ${index < Math.round(product.rating || 0) ? 'fill-current' : 'text-[#d3d9e6]'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium text-[#606b7f]">
                            ({product.reviewCount || 0} đánh giá)
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <span className="text-xl font-bold text-[#1d2433]">
                            {currencyFormatter.format(product.basePrice || 0)}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-[#7b8494] line-through">
                              {currencyFormatter.format(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 space-y-3">
                  <p className="text-center text-sm text-[#606b7f]">
                    Trang {normalizedCurrentPage} / {totalPages}
                  </p>
                  <Pagination
                    currentPage={normalizedCurrentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    className="justify-center"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#cad7ed] bg-white px-6 py-20 text-center">
              <p className="text-lg font-semibold text-[#1d2433]">
                Không tìm thấy sản phẩm phù hợp
              </p>
              <p className="mt-2 text-sm text-[#606b7f]">
                Thử đổi từ khóa hoặc chọn lại danh mục để xem thêm gợi ý.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setCurrentPage(1);
                }}
                className="mt-6 rounded-full bg-[#d90f0f] px-6 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#0b4caf]"
              >
                Xem Tất cả best sellers
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BestSellerPage;
