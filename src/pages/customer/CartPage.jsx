import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart,
  Glasses,
  Minus,
  Plus,
  Trash2,
  FileText,
  Check,
  ChevronDown,
  Eye,
  Tag,
  X,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { productRequest } from '@/api/product';
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from '@/hooks/useCart';
import { QUERY_KEYS } from '@/utils/endpoints';

const CartPage = () => {
  const navigate = useNavigate();
  const { data: cartData, isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const clearCart = useClearCart();

  // Get prescriptions from sessionStorage
  const [prescriptions, setPrescriptions] = useState({});
  const [expandedRx, setExpandedRx] = useState({});

  const cart_temp = cartData?.data || cartData;
  const items_temp = cart_temp?.items || [];

  useEffect(() => {
    const saved = sessionStorage.getItem('cartPrescriptions');
    if (saved) {
      try {
        setPrescriptions(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, [items_temp]);

  const getRx = (item) =>
    prescriptions[item.variantId] || prescriptions[item.cartItemId] || null;

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem.mutateAsync({ itemId, quantity: newQuantity });
  };

  const handleRemove = async (itemId) => {
    await removeCartItem.mutateAsync(itemId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm?')) {
      await clearCart.mutateAsync();
    }
  };

  const cart = cartData?.data || cartData;
  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Fetch shipping config from server (same as CheckoutPage)
  const { data: shippingConfigData } = useQuery({
    queryKey: QUERY_KEYS.SHIPPING_CONFIG,
    queryFn: () => productRequest.getShippingConfig(),
    staleTime: 5 * 60 * 1000,
  });
  const defaultShippingFee =
    shippingConfigData?.data?.defaultShippingFee ?? 30000;
  const freeShippingThreshold =
    shippingConfigData?.data?.freeShippingThreshold ?? 500000;
  const shippingFee =
    subtotal >= freeShippingThreshold ? 0 : defaultShippingFee;
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);

  // Restore voucher from sessionStorage on mount
  useEffect(() => {
    const savedVoucher = sessionStorage.getItem('cartVoucher');
    if (savedVoucher) {
      try {
        const v = JSON.parse(savedVoucher);
        setVoucherCode(v.code || '');
        setDiscount(v.discountAmount || 0);
        setAppliedVoucher(v);
      } catch { /* ignore */ }
    }
  }, []);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    setVoucherLoading(true);
    try {
      const res = await productRequest.validateVoucher(
        voucherCode.trim(),
        subtotal
      );
      const data = res?.data || res;
      if (data?.discountAmount != null) {
        setDiscount(data.discountAmount);
        setAppliedVoucher(data);
        // Save to sessionStorage so CheckoutPage can pick it up
        sessionStorage.setItem('cartVoucher', JSON.stringify(data));

        let msg = '';
        const isPercent =
          data.discountType === 'PERCENTAGE' || data.discountType === 'PERCENT';
        if (isPercent) {
          msg = `Đã áp dụng mã giảm ${data.value}%`;
          if (data.maxDiscount) {
            msg += ` (tối đa ${formatCurrency(data.maxDiscount)})`;
          }
          msg += ` — Giảm ${formatCurrency(data.discountAmount)}`;
        } else {
          msg = `Đã áp dụng mã giảm ${formatCurrency(data.discountAmount)}`;
        }
        toast.success(msg);
      } else {
        toast.error(res?.message || 'Mã giảm giá không hợp lệ');
        setDiscount(0);
        setAppliedVoucher(null);
        sessionStorage.removeItem('cartVoucher');
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Mã giảm giá không hợp lệ';
      toast.error(msg);
      setDiscount(0);
      setAppliedVoucher(null);
      sessionStorage.removeItem('cartVoucher');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode('');
    setDiscount(0);
    setAppliedVoucher(null);
    sessionStorage.removeItem('cartVoucher');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const finalShippingFee = shippingFee;
  const totalAmount = Math.max(0, subtotal + finalShippingFee - discount);

  if (isLoading) {
    return (
      <div className="bg-[#ececec] min-h-screen py-10">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#4f5562]">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#ececec] min-h-screen py-10">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 text-center py-20">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-500" />
          </div>
          <h2 className="text-3xl font-bold text-[#222] mb-4">
            Giỏ hàng trống
          </h2>
          <p className="text-[#4f5562] mb-8">Hãy thêm sản phẩm vào giỏ hàng</p>
          <Link
            to="/products"
            className="inline-block bg-[#d90f0f] text-white px-10 py-4 rounded-full font-medium hover:bg-[#b00c0c] transition"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#ececec] min-h-screen py-10">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#222] tracking-[-0.02em]">
            Giỏ hàng
          </h1>
          <p className="text-[#4f5562] mt-2">{items.length} sản phẩm</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const rx = getRx(item);
              const rxKey = item.variantId || item.cartItemId;
              const isExpanded = expandedRx[rxKey];

              return (
              <div
                key={item.cartItemId}
                className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(13,22,39,0.06)] overflow-hidden"
              >
                <div className="p-5 flex gap-5">
                {/* Image */}
                <div className="w-28 h-28 bg-[#f3f3f3] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Glasses className="w-10 h-10 text-gray-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-[#222]">
                    {item.productName}
                  </h3>
                  {item.colorName && (
                    <p className="text-sm text-[#4f5562] mt-0.5">
                      Màu: {item.colorName}
                    </p>
                  )}
                  {item.refractiveIndex && (
                    <p className="text-sm text-[#4f5562] mt-0.5">
                      Chiết suất: {item.refractiveIndex}
                    </p>
                  )}
                  {item.variantSku && (
                    <p className="text-xs text-[#4f5562] mt-0.5">
                      SKU: {item.variantSku}
                    </p>
                  )}
                  <p className="text-[#d90f0f] font-bold mt-1">
                    {formatCurrency(item.price)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                  {item.isPreorder && (
                    <span className="inline-block text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      Đặt trước
                    </span>
                  )}
                  {rx && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      <Check size={10} /> Có đơn kính
                    </span>
                  )}
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border-2 border-[#e0e0e0] rounded-full">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.cartItemId,
                            item.quantity - 1
                          )
                        }
                        className="px-4 py-2 hover:bg-[#f3f3f3] rounded-l-full transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-medium text-[#222]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.cartItemId,
                            item.quantity + 1
                          )
                        }
                        className="px-4 py-2 hover:bg-[#f3f3f3] rounded-r-full transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.cartItemId)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-[#222] text-lg">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
                </div>

                {/* Prescription expandable section */}
                {rx && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedRx((prev) => ({
                          ...prev,
                          [rxKey]: !prev[rxKey],
                        }))
                      }
                      className="w-full flex items-center justify-between px-5 py-2.5 bg-blue-50 hover:bg-red-100 transition border-t border-red-100"
                    >
                      <div className="flex items-center gap-2 text-sm text-red-700 font-medium">
                        <Eye className="w-4 h-4" />
                        Xem đơn kính
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-red-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="px-5 py-4 bg-blue-50/50 border-t border-red-100">
                        <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold text-gray-400 mb-2">
                          <div></div>
                          <div>SPH</div>
                          <div>CYL</div>
                          <div>AXS</div>
                          <div>ADD</div>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-center text-sm mb-1">
                          <div className="text-left font-semibold text-[#222]">OD</div>
                          <div>{rx.od_sph || '0.00'}</div>
                          <div>{rx.od_cyl || '0.00'}</div>
                          <div>{rx.od_axs || '0'}</div>
                          <div>{rx.od_add || '0.00'}</div>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-center text-sm mb-3">
                          <div className="text-left font-semibold text-[#222]">OS</div>
                          <div>{rx.os_sph || '0.00'}</div>
                          <div>{rx.os_cyl || '0.00'}</div>
                          <div>{rx.os_axs || '0'}</div>
                          <div>{rx.os_add || '0.00'}</div>
                        </div>
                        {rx.pd && (
                          <p className="text-sm text-[#4f5562]">
                            <span className="font-medium">PD:</span> {rx.pd}
                          </p>
                        )}
                        {rx.note && (
                          <p className="text-sm text-[#4f5562] mt-1">
                            <span className="font-medium">Ghi chú:</span> {rx.note}
                          </p>
                        )}
                        {rx.imageUrl && (
                          <div className="mt-2">
                            <img
                              src={rx.imageUrl}
                              alt="Đơn kính"
                              className="w-32 h-auto rounded-lg border"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              );
            })}

            <button
              onClick={handleClearCart}
              className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Xóa tất cả
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(13,22,39,0.06)] p-6 sticky top-4">
              <h2 className="text-xl font-bold text-[#222] mb-6">
                Tổng quan đơn hàng
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-[#4f5562]">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#4f5562]">
                  <span>Phí vận chuyển:</span>
                  <span
                    className={
                      finalShippingFee === 0 ? 'text-green-600 font-medium' : ''
                    }
                  >
                    {finalShippingFee === 0
                      ? 'Miễn phí'
                      : formatCurrency(finalShippingFee)}
                  </span>
                </div>

                {/* Voucher Section */}
                <div className="border-t border-b border-gray-100 py-4 my-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-[#222]" />
                    <p className="text-sm font-bold text-[#222]">Mã giảm giá</p>
                  </div>
                  {appliedVoucher ? (
                    <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-bold text-green-700">
                            {appliedVoucher.code}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveVoucher}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-1.5 text-xs text-green-600 space-y-0.5">
                        {appliedVoucher.discountType === 'PERCENTAGE' ||
                        appliedVoucher.discountType === 'PERCENT' ? (
                          <>
                            <p>
                              Giảm {appliedVoucher.value}% đơn hàng
                              {appliedVoucher.maxDiscount
                                ? ` (tối đa ${formatCurrency(appliedVoucher.maxDiscount)})`
                                : ''}
                            </p>
                            <p className="font-semibold">
                              Tiết kiệm: {formatCurrency(discount)}
                            </p>
                          </>
                        ) : (
                          <p className="font-semibold">
                            Giảm trực tiếp: {formatCurrency(discount)}
                          </p>
                        )}
                        {appliedVoucher.minOrder > 0 && (
                          <p className="text-[#4f5562]">
                            Đơn tối thiểu:{' '}
                            {formatCurrency(appliedVoucher.minOrder)}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập mã..."
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          (e.preventDefault(), handleApplyVoucher())
                        }
                        className="flex-1 bg-[#f9f9f9] border border-[#e0e0e0] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#d90f0f]"
                      />
                      <button
                        onClick={handleApplyVoucher}
                        disabled={voucherLoading}
                        className="bg-[#361414] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-[#0d1322] transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {voucherLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Đang kiểm
                            tra...
                          </>
                        ) : (
                          'Áp dụng'
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {subtotal < freeShippingThreshold && (
                  <p className="text-xs text-[#4f5562] bg-[#f3f3f3] p-3 rounded-xl">
                    Mua thêm {formatCurrency(freeShippingThreshold - subtotal)} để được miễn
                    phí vận chuyển
                  </p>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 text-sm font-medium">
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="border-t pt-4 flex justify-between font-bold text-xl">
                  <span className="text-[#222]">Tổng cộng:</span>
                  <span className="text-[#d90f0f]">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#361414] text-white py-4 rounded-full font-medium hover:bg-[#0d1322] transition"
              >
                Tiến hành thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

