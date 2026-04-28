import {
  Glasses,
  Scan,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  Package,
  Clock,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAddToCart } from '@/hooks/useCart';
import { useProductDetail } from '@/hooks/useProduct';

// Vietnamese labels for frame specs
const FRAME_SPEC_LABELS = {
  material: 'Chất liệu',
  shape: 'Dáng kính',
  lensWidthMm: 'Chiều rộng mắt kính (mm)',
  bridgeWidthMm: 'Chiều rộng cầu kính (mm)',
  templeLengthMm: 'Chiều dài càng kính (mm)',
};

// Vietnamese labels for lens specs
const LENS_SPEC_LABELS = {
  lensType: 'Loại tròng',
  material: 'Chất liệu',
  technologies: 'Công nghệ',
};

const TYPE_LABELS = {
  frame: 'Gọng kính',
  lens: 'Tròng kính',
  accessory: 'Phụ kiện',
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: product, isLoading, error } = useProductDetail(id);
  const addToCart = useAddToCart();

  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('regular');
  const [activeTab, setActiveTab] = useState('description');
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  // Determine the selected variant
  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    if (selectedVariantId) {
      return (
        product.variants.find((v) => v.variantId === selectedVariantId) ||
        product.variants[0]
      );
    }
    return product.variants[0];
  }, [product, selectedVariantId]);

  // Get display price based on selected variant
  const displayPrice = useMemo(() => {
    if (selectedVariant?.salePrice) return selectedVariant.salePrice;
    return product?.basePrice;
  }, [selectedVariant, product]);

  // Get images to display
  const displayImages = useMemo(() => {
    if (selectedVariant?.images?.length) return selectedVariant.images;
    if (product?.images?.length) return product.images;
    return [];
  }, [selectedVariant, product]);

  // Whether the product can be purchased (has variant or is a no-variant product)
  const canPurchase = !!selectedVariant || (product && !product.variants?.length);

  // Build cart item data (includes product info for guest cart)
  const buildCartData = () => ({
    variantId: selectedVariant?.variantId || undefined,
    productId: !selectedVariant ? product?.id : undefined,
    quantity,
    productName: product?.name || '',
    variantSku: selectedVariant?.sku || '',
    colorName: selectedVariant?.colorName || '',
    productType: product?.type || '',
    price: displayPrice || 0,
    imageUrl: displayImages?.[0]?.url || displayImages?.[0] || '',
    isPreorder: selectedVariant?.isPreorder || false,
  });

  const handleAddToCart = async () => {
    if (!canPurchase) return;
    try {
      await addToCart.mutateAsync(buildCartData());
    } catch (err) { }
  };

  const handleBuyNow = async () => {
    if (!canPurchase) return;
    try {
      await addToCart.mutateAsync(buildCartData());
      navigate('/checkout');
    } catch (err) { }
  };

  if (isLoading) {
    return (
      <div className="bg-[#ececec] min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-6 animate-pulse">
          <div className="h-[500px] bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[#ececec] min-h-screen py-10 text-center">
        <h2 className="text-2xl font-bold text-red-500">
          Sản phẩm không tồn tại
        </h2>
      </div>
    );
  }

  // Build specs data for display
  const specsData = [];
  if (product.type === 'frame' && product.frame) {
    Object.entries(product.frame).forEach(([key, value]) => {
      if (value != null) {
        specsData.push({
          label: FRAME_SPEC_LABELS[key] || key,
          value: String(value),
        });
      }
    });
  } else if (product.type === 'lens' && product.lens) {
    Object.entries(product.lens).forEach(([key, value]) => {
      if (value != null) {
        const displayValue = Array.isArray(value)
          ? value.join(', ')
          : String(value);
        specsData.push({
          label: LENS_SPEC_LABELS[key] || key,
          value: displayValue,
        });
      }
    });
  }

  const hasSpecs = specsData.length > 0;

  return (
    <div className="bg-[#ececec] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-[#4f5562]">
          <Link to="/">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link to="/products">Sản phẩm</Link>
          <span className="mx-2">/</span>
          <span className="text-[#222]">{product.name}</span>
        </div>

        {/* PRODUCT HERO */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* IMAGE */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow p-10 flex items-center justify-center min-h-[400px]">
              {displayImages.length > 0 ? (
                <img
                  src={mainImage || displayImages[0]}
                  alt={product.name}
                  className="max-h-[380px] object-contain"
                />
              ) : product.type === 'frame' ? (
                <Glasses className="w-40 h-40 text-gray-300" />
              ) : product.type === 'lens' ? (
                <Scan className="w-40 h-40 text-gray-300" />
              ) : (
                <Package className="w-40 h-40 text-gray-300" />
              )}
            </div>
            {/* Thumbnail gallery */}
            {displayImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 ${(mainImage || displayImages[0]) === img
                        ? 'border-red-500'
                        : 'border-transparent'
                      }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT INFO */}
          <div>
            {/* BADGES */}
            <div className="flex gap-2 mb-4">
              <span className="text-xs bg-blue-50 text-red-600 px-3 py-1 rounded-full">
                {TYPE_LABELS[product.type] || product.type}
              </span>

              {product.isSale && (
                <span className="bg-yellow-400 text-xs px-3 py-1 rounded-full">
                  Giảm giá
                </span>
              )}

              {selectedVariant?.isPreorder && (
                <span className="flex items-center gap-1 bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
                  <Clock className="w-3 h-3" /> Đặt trước
                </span>
              )}
            </div>

            {/* NAME */}
            <h1 className="text-3xl font-bold text-[#222] mb-4">
              {product.name}
            </h1>

            {/* PRICE */}
            <div className="mb-6 flex items-center gap-4">
              <span className="text-3xl font-bold text-[#d90f0f]">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(displayPrice)}
              </span>

              {product.isSale && product.basePrice > displayPrice && (
                <span className="text-lg line-through text-gray-400">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(product.basePrice)}
                </span>
              )}
            </div>

            {/* PREORDER NOTICE */}
            {selectedVariant?.isPreorder && (
              <div className="mb-6 flex items-start gap-3 rounded-xl bg-purple-50 border border-purple-200 p-4">
                <Clock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-purple-800">
                    Sản phẩm đặt trước (Pre-order)
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Sản phẩm chưa có hàng sẵn. Thanh toán COD khi nhận hàng.
                  </p>
                </div>
              </div>
            )}

            {/* VARIANT SELECTOR */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {product.type === 'lens' ? 'Chỉ số khúc xạ' : 'Màu sắc'}
                </label>
                <div className="flex flex-wrap gap-3">
                  {[...product.variants]
                    .sort((a, b) => {
                      if (product.type === 'lens') {
                        return (
                          (a.refractiveIndex || 0) - (b.refractiveIndex || 0)
                        );
                      }
                      return 0;
                    })
                    .map((variant, index) => {
                      const isSelected =
                        selectedVariant?.variantId === variant.variantId;
                      const label =
                        product.type === 'lens'
                          ? variant.refractiveIndex
                            ? `${variant.refractiveIndex}`
                            : variant.colorName || variant.sku
                          : variant.colorName || variant.sku;

                      return (
                        <button
                          key={variant.variantId}
                          onClick={() => {
                            setSelectedVariantId(variant.variantId);
                            if (!variant.images?.length && product.images?.length) {
                              setMainImage(
                                product.images[Math.min(index, product.images.length - 1)]
                              );
                            } else {
                              setMainImage(null);
                            }
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition ${isSelected
                              ? 'border-red-600 bg-blue-50 text-red-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ORDER TYPE — only lenses support prescription */}
            {product.type === 'lens' && (
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setOrderType('regular')}
                  className={`px-5 py-2 rounded-full text-sm font-semibold ${orderType === 'regular'
                      ? 'bg-black text-white'
                      : 'bg-gray-100'
                    }`}
                >
                  Mua ngay
                </button>

                <button
                  onClick={() => setOrderType('prescription')}
                  className={`px-5 py-2 rounded-full text-sm font-semibold ${orderType === 'prescription'
                      ? 'bg-black text-white'
                      : 'bg-gray-100'
                    }`}
                >
                  Theo đơn kính
                </button>
              </div>
            )}

            {/* QUANTITY */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex border rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  <Minus size={16} />
                </button>

                <div className="px-6 flex items-center font-semibold">
                  {quantity}
                </div>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* ACTION BUTTON */}
            {product.type === 'lens' && orderType === 'prescription' ? (
              <button
                onClick={() =>
                  navigate(
                    `/prescription-form?productId=${product.id}&variantId=${selectedVariant?.variantId}&quantity=${quantity}`
                  )
                }
                className="w-full bg-red-600 text-white py-4 rounded-full font-semibold hover:bg-red-700"
              >
                Nhập đơn kính
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!canPurchase}
                  className="flex-1 border-2 border-black text-black py-4 rounded-full font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Thêm vào giỏ
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!canPurchase}
                  className="flex-1 bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mua ngay
                </button>
              </div>
            )}

            {/* BENEFITS */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
                <Truck size={18} />
                <span className="text-sm">Giao hàng toàn quốc</span>
              </div>

              <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
                <ShieldCheck size={18} />
                <span className="text-sm">Bảo hành 12 tháng</span>
              </div>
            </div>
          </div>
        </div>

        {/* EXTRA INFO TABS */}
        <div className="bg-white rounded-3xl shadow p-10">
          {/* TAB HEADER */}
          <div className="flex gap-8 border-b mb-8 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-3 ${activeTab === 'description'
                  ? 'border-b-2 border-black'
                  : 'text-gray-400'
                }`}
            >
              Mô tả chi tiết
            </button>

            {hasSpecs && (
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 ${activeTab === 'specs'
                    ? 'border-b-2 border-black'
                    : 'text-gray-400'
                  }`}
              >
                Thông số kỹ thuật
              </button>
            )}

            <button
              onClick={() => setActiveTab('warranty')}
              className={`pb-3 ${activeTab === 'warranty'
                  ? 'border-b-2 border-black'
                  : 'text-gray-400'
                }`}
            >
              Bảo hành
            </button>
          </div>

          {/* TAB CONTENT */}

          {activeTab === 'description' && (
            <div className="text-gray-600 leading-relaxed overflow-hidden">
              {product.description ? (
                <div
                  className="prose prose-sm max-w-none break-words overflow-wrap-anywhere
                    [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3
                    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2
                    [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2
                    [&_p]:mb-3 [&_p]:leading-relaxed [&_p]:break-words
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3
                    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3
                    [&_li]:mb-1
                    [&_strong]:font-bold
                    [&_em]:italic
                    [&_u]:underline
                    [&_s]:line-through
                    [&_a]:text-red-600 [&_a]:underline [&_a]:break-all
                    [&_img]:rounded-lg [&_img]:my-4 [&_img]:max-w-full [&_img]:h-auto [&_img]:block
                    [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500
                    [&_*]:max-w-full"
                  style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-gray-400 italic">
                  Chưa có mô tả cho sản phẩm này.
                </p>
              )}
            </div>
          )}

          {activeTab === 'specs' && hasSpecs && (
            <div className="border rounded-xl overflow-hidden">
              {specsData.map((spec, index) => (
                <div
                  key={spec.label}
                  className={`grid grid-cols-2 px-6 py-3 text-sm ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}
                >
                  <span className="text-gray-500">{spec.label}</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'warranty' && (
            <div className="text-gray-600 space-y-3">
              <p>✔ Bảo hành sản phẩm 12 tháng.</p>

              <p>✔ Hỗ trợ chỉnh sửa miễn phí tại cửa hàng.</p>

              <p>✔ Đổi mới trong 7 ngày nếu lỗi sản xuất.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

