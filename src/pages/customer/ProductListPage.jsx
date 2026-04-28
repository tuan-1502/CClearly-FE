import {
  Glasses,
  Scan,
  Search,
  SlidersHorizontal,
  Package,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
} from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Pagination from '@/components/ui/Pagination';
import { useProducts } from '@/hooks/useProduct';

const ProductImageFallback = ({ images, alt, IconComponent, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // If no images array, or it's empty, or we've exhausted all images
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

const PAGE_SIZE_OPTIONS = [6, 12, 24, 48];
const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

// ─── Collapsible filter section ─────────────────────────────────
const FilterSection = ({ title, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-2.5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-[#1d2433]"
      >
        {title}
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        )}
      </button>
      {open && <div className="space-y-1.5">{children}</div>}
    </div>
  );
};

// ─── Checkbox item ──────────────────────────────────────────────
const CheckItem = ({ label, checked, onChange, count }) => (
  <label className="group flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm hover:bg-[#f0f5ff] transition">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-3.5 w-3.5 rounded border-gray-300 text-[#d90f0f] focus:ring-[#d90f0f]/30"
    />
    <span className="flex-1 text-[#4f5562] group-hover:text-[#d90f0f] transition-colors text-[13px]">
      {label}
    </span>
    {count !== undefined && (
      <span className="text-[11px] text-gray-400">({count})</span>
    )}
  </label>
);

// ─── Price Range Slider ─────────────────────────────────────────
const PriceRangeSlider = ({ min, max, value, onChange }) => {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const pct = (v) => ((v - min) / (max - min)) * 100;

  const commitChange = useCallback(
    (next) => {
      const clamped = [
        Math.max(min, Math.min(next[0], next[1])),
        Math.min(max, Math.max(next[0], next[1])),
      ];
      setLocal(clamped);
      onChange(clamped);
    },
    [min, max, onChange]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={currencyFormatter.format(local[0])}
          readOnly
          className="w-full rounded border border-gray-200 bg-[#f9f9f9] px-2 py-1.5 text-center text-xs text-[#1d2433]"
        />
        <span className="text-xs text-gray-400">—</span>
        <input
          type="text"
          value={currencyFormatter.format(local[1])}
          readOnly
          className="w-full rounded border border-gray-200 bg-[#f9f9f9] px-2 py-1.5 text-center text-xs text-[#1d2433]"
        />
      </div>
      <div className="relative h-1.5 rounded-full bg-gray-200">
        <div
          className="absolute h-full rounded-full bg-[#d90f0f]"
          style={{
            left: `${pct(local[0])}%`,
            width: `${pct(local[1]) - pct(local[0])}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={10000}
          value={local[0]}
          onChange={(e) => {
            const v = Number(e.target.value);
            setLocal((prev) => [Math.min(v, prev[1]), prev[1]]);
          }}
          onMouseUp={() => commitChange(local)}
          onTouchEnd={() => commitChange(local)}
          className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#d90f0f] [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={10000}
          value={local[1]}
          onChange={(e) => {
            const v = Number(e.target.value);
            setLocal((prev) => [prev[0], Math.max(v, prev[0])]);
          }}
          onMouseUp={() => commitChange(local)}
          onTouchEnd={() => commitChange(local)}
          className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#d90f0f] [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>
    </div>
  );
};

// ─── Helpers ────────────────────────────────────────────────────
const unique = (arr) =>
  [...new Set(arr.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), 'vi')
  );

const toggleSet = (prev, val) => {
  const next = new Set(prev);
  next.has(val) ? next.delete(val) : next.add(val);
  return next;
};

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
const ProductListPage = ({ type }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // Filters — sets of selected values
  const [selSubCat, setSelSubCat] = useState(new Set());
  const [selMaterial, setSelMaterial] = useState(new Set());
  const [selShape, setSelShape] = useState(new Set());
  const [selColor, setSelColor] = useState(new Set());
  const [selLensType, setSelLensType] = useState(new Set());
  const [selRefIndex, setSelRefIndex] = useState(new Set());
  const [priceRange, setPriceRange] = useState(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Reset filters when type changes
  useEffect(() => {
    setSelSubCat(new Set());
    setSelMaterial(new Set());
    setSelShape(new Set());
    setSelColor(new Set());
    setSelLensType(new Set());
    setSelRefIndex(new Set());
    setPriceRange(null);
    setPage(1);
    setSearch('');
  }, [type]);

  // ── Fetch all products of this type ──
  const { data: raw, isLoading } = useProducts({
    type: type || undefined,
    search: search || undefined,
    size: 500,
    page: 1,
  });

  const allProducts = useMemo(() => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.content)) return raw.content;
    return [];
  }, [raw]);

  // ── Derive unique filter facets from data ──
  const facets = useMemo(() => {
    const subCategories = unique(allProducts.map((p) => p.subCategory));
    const materials = unique(
      allProducts.map((p) =>
        type === 'lens' ? p.lens?.material : p.frame?.material
      )
    );
    const shapes = unique(allProducts.map((p) => p.frame?.shape));
    const lensTypes = unique(allProducts.map((p) => p.lens?.lensType));
    const colors = unique(
      allProducts.flatMap((p) => (p.variants || []).map((v) => v.colorName))
    );
    const refractiveIndexes = unique(
      allProducts
        .flatMap((p) => (p.variants || []).map((v) => v.refractiveIndex))
        .filter(Boolean)
        .map(String)
    );

    const prices = allProducts.map((p) => p.basePrice || 0);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 10000000;

    return {
      subCategories,
      materials,
      shapes,
      lensTypes,
      colors,
      refractiveIndexes,
      minPrice: Math.floor(minPrice / 10000) * 10000,
      maxPrice: Math.ceil(maxPrice / 10000) * 10000,
    };
  }, [allProducts, type]);

  // ── Apply client-side filters ──
  const filteredProducts = useMemo(() => {
    let result = allProducts;

    if (selSubCat.size > 0)
      result = result.filter((p) => selSubCat.has(p.subCategory));

    if (selMaterial.size > 0) {
      result = result.filter((p) => {
        const m = type === 'lens' ? p.lens?.material : p.frame?.material;
        return selMaterial.has(m);
      });
    }

    if (selShape.size > 0)
      result = result.filter((p) => selShape.has(p.frame?.shape));

    if (selLensType.size > 0)
      result = result.filter((p) => selLensType.has(p.lens?.lensType));

    if (selColor.size > 0) {
      result = result.filter((p) =>
        (p.variants || []).some((v) => selColor.has(v.colorName))
      );
    }

    if (selRefIndex.size > 0) {
      result = result.filter((p) =>
        (p.variants || []).some((v) =>
          selRefIndex.has(String(v.refractiveIndex))
        )
      );
    }

    if (priceRange) {
      result = result.filter(
        (p) => p.basePrice >= priceRange[0] && p.basePrice <= priceRange[1]
      );
    }

    return result;
  }, [
    allProducts,
    selSubCat,
    selMaterial,
    selShape,
    selColor,
    selLensType,
    selRefIndex,
    priceRange,
    type,
  ]);

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const shownFrom =
    filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const shownTo = Math.min(currentPage * pageSize, filteredProducts.length);

  // ── Handlers ──
  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    setPage(1);
    setSearchParams((prev) => {
      v ? prev.set('search', v) : prev.delete('search');
      return prev;
    });
  };

  const clearAllFilters = () => {
    setSelSubCat(new Set());
    setSelMaterial(new Set());
    setSelShape(new Set());
    setSelColor(new Set());
    setSelLensType(new Set());
    setSelRefIndex(new Set());
    setPriceRange(null);
    setPage(1);
  };

  const activeFilterCount =
    selSubCat.size +
    selMaterial.size +
    selShape.size +
    selColor.size +
    selLensType.size +
    selRefIndex.size +
    (priceRange ? 1 : 0);

  // ── Labels ──
  const getTitle = () => {
    if (type === 'frame') return 'Gọng kính';
    if (type === 'lens') return 'Tròng kính';
    if (type === 'accessory') return 'Phụ kiện';
    return 'Tất cả sản phẩm';
  };
  const getTypeLabel = (t) => {
    if (t === 'frame') return 'Gọng kính';
    if (t === 'lens') return 'Tròng kính';
    if (t === 'accessory') return 'Phụ kiện';
    return t;
  };
  const getProductIcon = (t) => {
    if (t === 'frame') return Glasses;
    if (t === 'lens') return Scan;
    return Package;
  };

  // count helpers
  const subCatCount = (val) =>
    allProducts.filter((p) => p.subCategory === val).length;

  // ── Sidebar content (reused for mobile drawer) ──
  const sidebarContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1d2433]">
          <SlidersHorizontal className="h-4 w-4" /> Bộ lọc
          {activeFilterCount > 0 && (
            <span className="ml-1 rounded-full bg-[#d90f0f] px-1.5 py-0.5 text-[10px] text-white">
              {activeFilterCount}
            </span>
          )}
        </h3>
        <button
          onClick={() => setShowMobileFilter(false)}
          className="lg:hidden p-1 hover:bg-gray-100 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ─ FRAME filters ─ */}
      {type === 'frame' && (
        <>
          {facets.subCategories.length > 0 && (
            <FilterSection title="Danh mục">
              {facets.subCategories.map((sc) => (
                <CheckItem
                  key={sc}
                  label={sc}
                  count={subCatCount(sc)}
                  checked={selSubCat.has(sc)}
                  onChange={() => {
                    setSelSubCat((p) => toggleSet(p, sc));
                    setPage(1);
                  }}
                />
              ))}
            </FilterSection>
          )}

          {facets.materials.length > 0 && (
            <FilterSection title="Chất liệu">
              {facets.materials.map((m) => (
                <CheckItem
                  key={m}
                  label={m}
                  checked={selMaterial.has(m)}
                  onChange={() => {
                    setSelMaterial((p) => toggleSet(p, m));
                    setPage(1);
                  }}
                />
              ))}
            </FilterSection>
          )}

          {facets.shapes.length > 0 && (
            <FilterSection title="Dáng kính">
              {facets.shapes.map((s) => (
                <CheckItem
                  key={s}
                  label={s}
                  checked={selShape.has(s)}
                  onChange={() => {
                    setSelShape((p) => toggleSet(p, s));
                    setPage(1);
                  }}
                />
              ))}
            </FilterSection>
          )}

          {facets.colors.length > 0 && (
            <FilterSection title="Màu sắc">
              {facets.colors.map((c) => (
                <CheckItem
                  key={c}
                  label={c}
                  checked={selColor.has(c)}
                  onChange={() => {
                    setSelColor((p) => toggleSet(p, c));
                    setPage(1);
                  }}
                />
              ))}
            </FilterSection>
          )}
        </>
      )}

      {/* ─ LENS filters ─ */}
      {type === 'lens' && (
        <>
          {facets.subCategories.length > 0 && (
            <FilterSection title="Danh mục">
              {facets.subCategories.map((sc) => (
                <CheckItem
                  key={sc}
                  label={sc}
                  count={subCatCount(sc)}
                  checked={selSubCat.has(sc)}
                  onChange={() => {
                    setSelSubCat((p) => toggleSet(p, sc));
                    setPage(1);
                  }}
                />
              ))}
            </FilterSection>
          )}

          {facets.materials.length > 0 && (
            <FilterSection title="Chất liệu">
              {facets.materials.map((m) => (
                <CheckItem
                  key={m}
                  label={m}
                  checked={selMaterial.has(m)}
                  onChange={() => {
                    setSelMaterial((p) => toggleSet(p, m));
                    setPage(1);
                  }}
                />
              ))}
            </FilterSection>
          )}

          {facets.lensTypes.length > 0 && (
            <FilterSection title="Loại tròng">
              {facets.lensTypes.map((lt) => (
                <CheckItem
                  key={lt}
                  label={lt}
                  checked={selLensType.has(lt)}
                  onChange={() => {
                    setSelLensType((p) => toggleSet(p, lt));
                    setPage(1);
                  }}
                />
              ))}
            </FilterSection>
          )}

          {facets.refractiveIndexes.length > 0 && (
            <FilterSection title="Chiết suất">
              {facets.refractiveIndexes.map((ri) => (
                <CheckItem
                  key={ri}
                  label={ri}
                  checked={selRefIndex.has(ri)}
                  onChange={() => {
                    setSelRefIndex((p) => toggleSet(p, ri));
                    setPage(1);
                  }}
                />
              ))}
            </FilterSection>
          )}
        </>
      )}

      {/* ─ ALL PRODUCTS filters (no type) ─ */}
      {!type && (
        <>
          {facets.subCategories.length > 0 && (
            <FilterSection title="Danh mục">
              {facets.subCategories.map((sc) => (
                <CheckItem
                  key={sc}
                  label={sc}
                  count={subCatCount(sc)}
                  checked={selSubCat.has(sc)}
                  onChange={() => {
                    setSelSubCat((p) => toggleSet(p, sc));
                    setPage(1);
                  }}
                />
              ))}
            </FilterSection>
          )}
        </>
      )}

      {/* ─ Price range (all types) ─ */}
      {facets.maxPrice > facets.minPrice && (
        <FilterSection title="Khoảng giá">
          <PriceRangeSlider
            min={facets.minPrice}
            max={facets.maxPrice}
            value={priceRange || [facets.minPrice, facets.maxPrice]}
            onChange={(v) => {
              setPriceRange(v);
              setPage(1);
            }}
          />
        </FilterSection>
      )}

      {/* Clear button */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full rounded border border-gray-200 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 transition hover:bg-gray-50"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      {/* ── Breadcrumb + Title ── */}
      <section className="border-b border-[#dbe4f4] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-[#606b7f]">
            <Link to="/" className="hover:text-[#d90f0f]">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="font-medium text-[#1d2433]">{getTitle()}</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold uppercase tracking-tight text-[#1d2433]">
            {getTitle()}
          </h1>
          <p className="mt-2 text-[#606b7f]">
            Khám phá bộ sưu tập kính mắt chất lượng cao
          </p>
        </div>
      </section>

      {/* ── Top bar: search + stats ── */}
      <section className="sticky top-0 z-30 border-b border-[#dbe4f4] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b8494]" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={handleSearch}
              className="w-full rounded-2xl border border-[#d8e2f2] bg-[#f8fbff] py-2.5 pl-12 pr-4 text-sm text-[#1f2937] outline-none transition focus:border-[#d90f0f] focus:ring-2 focus:ring-[#d90f0f]/20"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilter(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[#d8e2f2] bg-white px-3 py-2 text-sm text-[#4f5562] lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Lọc
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-[#d90f0f] px-1.5 py-0.5 text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div className="hidden items-center gap-3 sm:flex ml-auto">
              <p className="rounded-xl bg-[#eff4ff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#d90f0f]">
                {shownFrom}–{shownTo} / {filteredProducts.length} sản phẩm
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#606b7f] whitespace-nowrap">
                  Hiển thị
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-[#d8e2f2] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1d2433] outline-none cursor-pointer hover:border-[#d90f0f] focus:border-[#d90f0f] focus:ring-2 focus:ring-[#d90f0f]/20 transition"
                >
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s} / trang
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main: Sidebar + Products ── */}
      <main className="mx-auto flex max-w-7xl gap-8 px-4 py-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 flex-shrink-0 lg:block">
          <div className="sticky top-20">{sidebarContent}</div>
        </aside>

        {/* Mobile sidebar drawer */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowMobileFilter(false)}
            />
            <div className="relative z-10 w-72 overflow-y-auto bg-white p-5 shadow-xl">
              {sidebarContent}
            </div>
          </div>
        )}

        {/* Products grid */}
        <section className="flex-1 min-w-0">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#d90f0f]" />
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cad7ed] bg-white px-6 py-20 text-center">
              <p className="text-lg font-semibold text-[#1d2433]">
                Không tìm thấy sản phẩm phù hợp
              </p>
              <p className="mt-2 text-sm text-[#606b7f]">
                Thử đổi từ khóa hoặc xóa bộ lọc để xem thêm.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-6 rounded-full bg-[#d90f0f] px-6 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#0b4caf]"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedProducts.map((product) => {
                  const hasDiscount =
                    product.isSale &&
                    product.salePrice &&
                    product.salePrice < product.basePrice;
                  const discountPercent = hasDiscount
                    ? Math.round(
                        ((product.basePrice - product.salePrice) /
                          product.basePrice) *
                          100
                      )
                    : 0;

                  const IconComponent = getProductIcon(product.type);
                  const variantColors = unique(
                    (product.variants || []).map((v) => v.colorName)
                  );
                  const isPreorder = (product.variants || []).some(
                    (v) => v.isPreorder
                  );

                  // Collect all possible images for this product (product-level + all variant-level)
                  const allImages = [
                    ...(product.images || []),
                    ...(product.variants || []).flatMap((v) => v.images || []),
                  ];
                  // Remove duplicates to avoid unnecessary 404 retries
                  const uniqueImages = [...new Set(allImages)];

                  return (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="group overflow-hidden rounded-xl border border-[#e4eaf6] bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="relative aspect-square overflow-hidden bg-[#fafbfd]">
                        <ProductImageFallback
                          images={uniqueImages}
                          alt={product.name}
                          IconComponent={IconComponent}
                          className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                        />

                        <div className="absolute left-2 top-2 flex flex-col gap-1">
                          {product.isSale && (
                            <span className="rounded bg-[#f7c948] px-2 py-0.5 text-[10px] font-bold text-[#222]">
                              Giảm giá
                            </span>
                          )}
                          {isPreorder && (
                            <span className="flex items-center gap-0.5 rounded bg-[#7c3aed] px-2 py-0.5 text-[10px] font-bold text-white">
                              <Clock className="h-2.5 w-2.5" /> Đặt trước
                            </span>
                          )}
                        </div>
                        {hasDiscount && (
                          <span className="absolute right-2 top-2 rounded bg-[#ef4444] px-2 py-0.5 text-[10px] font-bold text-white">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 p-4">
                        <div className="flex flex-wrap gap-1">
                          <span className="inline-block rounded bg-[#eff4ff] px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[#d90f0f]">
                            {product.subCategory || getTypeLabel(product.type)}
                          </span>
                          {isPreorder && (
                            <span className="inline-block rounded bg-purple-50 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-purple-600">
                              Pre-order
                            </span>
                          )}
                        </div>
                        <h3 className="line-clamp-2 text-sm font-bold leading-tight text-[#1d2433]">
                          {product.name}
                        </h3>

                        <div className="flex items-center gap-2">
                          {hasDiscount ? (
                            <>
                              <span className="text-base font-black text-[#ef4444]">
                                {currencyFormatter.format(product.salePrice)}
                              </span>
                              <span className="text-xs text-[#999] line-through">
                                {currencyFormatter.format(product.basePrice)}
                              </span>
                            </>
                          ) : (
                            <span className="text-base font-black text-[#d90f0f]">
                              {currencyFormatter.format(product.basePrice)}
                            </span>
                          )}
                        </div>

                        {variantColors.length > 0 && (
                          <div className="flex gap-1 pt-1">
                            {variantColors.slice(0, 5).map((c) => (
                              <span
                                key={c}
                                title={c}
                                className="h-3 w-3 rounded-full border border-gray-200"
                                style={{ backgroundColor: c.toLowerCase() }}
                              />
                            ))}
                            {variantColors.length > 5 && (
                              <span className="text-[10px] text-gray-400 leading-3">
                                +{variantColors.length - 5}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 space-y-2">
                  <p className="text-center text-sm text-[#606b7f]">
                    Trang {currentPage} / {totalPages}
                  </p>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(p) =>
                      setPage(Math.min(Math.max(p, 1), totalPages))
                    }
                    className="justify-center"
                  />
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProductListPage;

