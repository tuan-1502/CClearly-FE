import { useQuery } from '@tanstack/react-query';
import {
  Glasses,
  Tag,
  FileText,
  Check,
  MapPin,
  Plus,
  ChevronDown,
  Loader2,
  X,
  Eye,
  Image,
  Pencil,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { productRequest } from '@/api/product';
import { uploadRequest } from '@/api/upload';
import { useAuth } from '@/contexts/AuthContext';
import { useCart, useClearCart } from '@/hooks/useCart';
import { useCreateOrder, useSavePrescription } from '@/hooks/useOrder';
import { useAddresses, useCreateAddress } from '@/hooks/useUser';
import { QUERY_KEYS } from '@/utils/endpoints';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thanh toán');
      navigate('/login', {
        state: { from: { pathname: '/checkout' } },
        replace: true,
      });
    }
  }, [isAuthenticated, navigate]);

  const { data: cartData } = useCart();
  const createOrder = useCreateOrder();
  const clearCart = useClearCart();

  const cart = cartData?.data || cartData;
  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Fetch shipping config from server
  const { data: shippingConfig } = useQuery({
    queryKey: QUERY_KEYS.SHIPPING_CONFIG,
    queryFn: () => productRequest.getShippingConfig(),
    staleTime: 5 * 60 * 1000,
  });

  const defaultShippingFee = shippingConfig?.data?.defaultShippingFee ?? 30000;
  const freeShippingThreshold =
    shippingConfig?.data?.freeShippingThreshold ?? 500000;
  const shippingFee =
    subtotal >= freeShippingThreshold ? 0 : defaultShippingFee;

  // Get prescriptions from sessionStorage (passed from PrescriptionFormPage)
  const [prescriptions, setPrescriptions] = useState({});

  useEffect(() => {
    const savedPrescriptions = sessionStorage.getItem('cartPrescriptions');
    if (savedPrescriptions) {
      try {
        setPrescriptions(JSON.parse(savedPrescriptions));
      } catch { /* ignore */ }
    }
  }, [items]);

  // Prescription edit state
  const [expandedPrescription, setExpandedPrescription] = useState({});
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [reUploadFile, setReUploadFile] = useState(null);
  const [reUploadLoading, setReUploadLoading] = useState(false);

  const SPH_VALUES = Array.from({ length: 81 }, (_, i) =>
    (i * 0.25 - 10).toFixed(2)
  );
  const CYL_VALUES = Array.from({ length: 25 }, (_, i) =>
    (i * 0.25 - 3).toFixed(2)
  );
  const AXS_VALUES = Array.from({ length: 181 }, (_, i) => i.toString());

  const toggleExpandPrescription = (key) => {
    setExpandedPrescription((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStartEdit = (key, rx) => {
    setEditingPrescription(key);
    setEditValues({ ...rx });
    setReUploadFile(null);
  };

  const handleCancelEdit = () => {
    setEditingPrescription(null);
    setEditValues({});
    setReUploadFile(null);
  };

  const handleSaveEdit = async (key) => {
    let updatedValues = { ...editValues };
    if (reUploadFile) {
      setReUploadLoading(true);
      try {
        const imageUrl = await uploadRequest.uploadImage(
          reUploadFile,
          'prescriptions'
        );
        updatedValues.imageUrl = imageUrl;
      } catch {
        toast.error('Lỗi tải ảnh lên, vui lòng thử lại');
        setReUploadLoading(false);
        return;
      }
      setReUploadLoading(false);
    }
    const updated = { ...prescriptions, [key]: updatedValues };
    setPrescriptions(updated);
    sessionStorage.setItem('cartPrescriptions', JSON.stringify(updated));
    setEditingPrescription(null);
    setEditValues({});
    setReUploadFile(null);
    toast.success('Đã cập nhật đơn kính');
  };

  // Prescription helpers
  const isLens = (item) => item.productType?.toLowerCase() === 'lens';
  const hasPrescription = (item) =>
    !!(prescriptions[item.variantId] || prescriptions[item.cartItemId]);
  const hasPrescriptionItems = items.some(hasPrescription);

  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);

  // Restore voucher from CartPage sessionStorage
  useEffect(() => {
    const savedVoucher = sessionStorage.getItem('cartVoucher');
    if (savedVoucher && !appliedVoucher) {
      try {
        const v = JSON.parse(savedVoucher);
        setVoucherCode(v.code || '');
        setDiscount(v.discountAmount || 0);
        setAppliedVoucher(v);
      } catch { /* ignore */ }
    }
  }, []);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address: '',
    isDefault: false,
  });
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Fetch saved addresses
  const { data: addressesData } = useAddresses();
  const addresses = addressesData?.data || addressesData || [];
  const createAddress = useCreateAddress();
  const savePrescription = useSavePrescription();

  // Auto-select default address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault);
      setSelectedAddressId(defaultAddr?.addressId || addresses[0].addressId);
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress = addresses.find(
    (a) => a.addressId === selectedAddressId
  );

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
        sessionStorage.setItem('cartVoucher', JSON.stringify(data));

        // Build detailed success message
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
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Mã giảm giá không hợp lệ';
      toast.error(msg);
      setDiscount(0);
      setAppliedVoucher(null);
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

  const handleSaveNewAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address) {
      toast.error('Vui lòng điền đầy đủ thông tin địa chỉ');
      return;
    }
    try {
      const res = await createAddress.mutateAsync(newAddress);
      const created = res?.data || res;
      if (created?.addressId) {
        setSelectedAddressId(created.addressId);
      }
      setShowAddressForm(false);
      setNewAddress({ name: '', phone: '', address: '', isDefault: false });
    } catch {
      // Error handled by hook
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (!selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }



    try {
      const orderRes = await createOrder.mutateAsync({
        addressId: selectedAddress.addressId,
        recipientName: selectedAddress.name,
        phone: selectedAddress.phone,
        street: selectedAddress.address,
        couponCode: appliedVoucher?.code || null,
        notes,
        paymentMethod,
      });

      // Save prescriptions for lens items if any
      const orderId = orderRes?.orderId || orderRes?.data?.orderId;
      if (orderId && Object.keys(prescriptions).length > 0) {
        for (const item of items) {
          const rx =
            prescriptions[item.variantId] || prescriptions[item.cartItemId];
          if (rx) {
            try {
              await savePrescription.mutateAsync({
                orderId,
                data: {
                  sphOd: rx.od_sph ? parseFloat(rx.od_sph) : null,
                  cylOd: rx.od_cyl ? parseFloat(rx.od_cyl) : null,
                  axisOd: rx.od_axs ? parseInt(rx.od_axs) : null,
                  addOd: rx.od_add ? parseFloat(rx.od_add) : null,
                  sphOs: rx.os_sph ? parseFloat(rx.os_sph) : null,
                  cylOs: rx.os_cyl ? parseFloat(rx.os_cyl) : null,
                  axisOs: rx.os_axs ? parseInt(rx.os_axs) : null,
                  addOs: rx.os_add ? parseFloat(rx.os_add) : null,
                  pd: rx.pd ? parseFloat(rx.pd) : null,
                  imageUrl: rx.imageUrl || '',
                  salesNote: rx.note || '',
                },
              });
            } catch (err) {
              console.error(
                'Failed to save prescription for item',
                item.cartItemId,
                err
              );
            }
          }
        }
      }

      sessionStorage.removeItem('cartPrescriptions');
      sessionStorage.removeItem('cartVoucher');
      await clearCart.mutateAsync();
      navigate('/profile');
    } catch (error) {
      // Error handled by hook
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#ececec] min-h-screen py-10">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 text-center py-20">
          <h2 className="text-3xl font-bold text-[#222] mb-4">
            Giỏ hàng trống
          </h2>
          <button
            onClick={() => navigate('/products')}
            className="text-[#d90f0f] hover:underline font-medium"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#ececec] min-h-screen py-10">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#222] tracking-[-0.02em]">
            Thanh toán
          </h1>
          <p className="text-[#4f5562] mt-2">Hoàn tất đơn hàng của bạn</p>
        </div>

        {hasPrescriptionItems && (
          <div className="bg-blue-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">Đơn kính đính kèm</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {items.filter((item) => hasPrescription(item)).map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-700"
                  >
                    <Check size={12} />
                    {item.productName.substring(0, 20)}...
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Prescription detail cards */}
        {hasPrescriptionItems &&
          items.filter((item) => hasPrescription(item)).map((item) => {
            const rxKey = item.variantId || item.cartItemId;
            const rx =
              prescriptions[item.variantId] || prescriptions[item.cartItemId];
            if (!rx) return null;
            const isExpanded = expandedPrescription[rxKey];
            const isEditing = editingPrescription === rxKey;

            return (
              <div
                key={rxKey}
                className="bg-white rounded-xl border border-gray-200 mb-3 overflow-hidden"
              >
                {/* Header - click to expand */}
                <button
                  type="button"
                  onClick={() => toggleExpandPrescription(rxKey)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-sm text-[#222]">
                      {item.productName}
                    </span>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={10} /> Có đơn kính
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t px-4 pb-4">
                    {isEditing ? (
                      /* EDIT MODE */
                      <div className="pt-4 space-y-4">
                        {/* OD/OS Table */}
                        <div>
                          <div className="grid grid-cols-5 gap-2 mb-2 text-center">
                            <div></div>
                            <div className="text-xs font-bold text-gray-400">
                              SPH
                            </div>
                            <div className="text-xs font-bold text-gray-400">
                              CYL
                            </div>
                            <div className="text-xs font-bold text-gray-400">
                              AXS
                            </div>
                            <div className="text-xs font-bold text-gray-400">
                              ADD
                            </div>
                          </div>
                          {/* OD */}
                          <div className="grid grid-cols-5 gap-2 mb-2 items-center">
                            <div className="text-sm font-semibold text-[#222]">
                              OD
                            </div>
                            {['od_sph', 'od_cyl', 'od_axs', 'od_add'].map(
                              (f) => (
                                <select
                                  key={f}
                                  value={editValues[f] || ''}
                                  onChange={(e) =>
                                    setEditValues((prev) => ({
                                      ...prev,
                                      [f]: e.target.value,
                                    }))
                                  }
                                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#d90f0f]"
                                >
                                  <option value="">0.00</option>
                                  {(f.includes('sph')
                                    ? SPH_VALUES
                                    : f.includes('cyl')
                                      ? CYL_VALUES
                                      : AXS_VALUES
                                  ).map((v) => (
                                    <option key={v} value={v}>
                                      {v}
                                    </option>
                                  ))}
                                </select>
                              )
                            )}
                          </div>
                          {/* OS */}
                          <div className="grid grid-cols-5 gap-2 items-center">
                            <div className="text-sm font-semibold text-[#222]">
                              OS
                            </div>
                            {['os_sph', 'os_cyl', 'os_axs', 'os_add'].map(
                              (f) => (
                                <select
                                  key={f}
                                  value={editValues[f] || ''}
                                  onChange={(e) =>
                                    setEditValues((prev) => ({
                                      ...prev,
                                      [f]: e.target.value,
                                    }))
                                  }
                                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#d90f0f]"
                                >
                                  <option value="">0.00</option>
                                  {(f.includes('sph')
                                    ? SPH_VALUES
                                    : f.includes('cyl')
                                      ? CYL_VALUES
                                      : AXS_VALUES
                                  ).map((v) => (
                                    <option key={v} value={v}>
                                      {v}
                                    </option>
                                  ))}
                                </select>
                              )
                            )}
                          </div>
                        </div>

                        {/* PD */}
                        <div>
                          <label className="text-sm font-medium text-[#222] block mb-1">
                            Khoảng cách đồng tử (PD)
                          </label>
                          <input
                            type="number"
                            value={editValues.pd || ''}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                pd: e.target.value,
                              }))
                            }
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-28 focus:outline-none focus:border-[#d90f0f]"
                            placeholder="62"
                          />
                        </div>

                        {/* Note */}
                        <div>
                          <label className="text-sm font-medium text-[#222] block mb-1">
                            Ghi chú
                          </label>
                          <textarea
                            value={editValues.note || ''}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                note: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm resize-none focus:outline-none focus:border-[#d90f0f]"
                            rows={2}
                            placeholder="Ghi chú thêm..."
                          />
                        </div>

                        {/* Image */}
                        <div>
                          <label className="text-sm font-medium text-[#222] block mb-1">
                            Ảnh đơn kính
                          </label>
                          {editValues.imageUrl && !reUploadFile && (
                            <img
                              src={editValues.imageUrl}
                              alt="Đơn kính"
                              className="w-28 h-28 object-cover rounded-lg border mb-2"
                            />
                          )}
                          {reUploadFile && (
                            <img
                              src={URL.createObjectURL(reUploadFile)}
                              alt="Ảnh mới"
                              className="w-28 h-28 object-cover rounded-lg border mb-2"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setReUploadFile(e.target.files?.[0] || null)
                            }
                            className="text-xs text-gray-500"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(rxKey)}
                            disabled={reUploadLoading}
                            className="bg-[#d90f0f] text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#b00c0c] transition disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {reUploadLoading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />{' '}
                                Đang tải...
                              </>
                            ) : (
                              'Lưu thay đổi'
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-1.5 rounded-full text-sm font-medium text-[#4f5562] hover:bg-gray-100 transition"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* VIEW MODE */
                      <div className="pt-4">
                        {/* OD/OS Table */}
                        <div className="bg-[#f9f9f9] rounded-xl p-3 mb-4">
                          <div className="grid grid-cols-5 gap-2 mb-2 text-center">
                            <div></div>
                            <div className="text-xs font-bold text-gray-400">
                              SPH
                            </div>
                            <div className="text-xs font-bold text-gray-400">
                              CYL
                            </div>
                            <div className="text-xs font-bold text-gray-400">
                              AXS
                            </div>
                            <div className="text-xs font-bold text-gray-400">
                              ADD
                            </div>
                          </div>
                          <div className="grid grid-cols-5 gap-2 mb-1 text-center text-sm">
                            <div className="text-left font-semibold text-[#222]">
                              OD
                            </div>
                            <div>{rx.od_sph || '0.00'}</div>
                            <div>{rx.od_cyl || '0.00'}</div>
                            <div>{rx.od_axs || '0'}</div>
                            <div>{rx.od_add || '0.00'}</div>
                          </div>
                          <div className="grid grid-cols-5 gap-2 text-center text-sm">
                            <div className="text-left font-semibold text-[#222]">
                              OS
                            </div>
                            <div>{rx.os_sph || '0.00'}</div>
                            <div>{rx.os_cyl || '0.00'}</div>
                            <div>{rx.os_axs || '0'}</div>
                            <div>{rx.os_add || '0.00'}</div>
                          </div>
                        </div>

                        {/* PD & Note */}
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">PD: </span>
                            <span className="font-medium text-[#222]">
                              {rx.pd || '—'}
                            </span>
                          </div>
                          {rx.note && (
                            <div>
                              <span className="text-gray-500">Ghi chú: </span>
                              <span className="text-[#222]">{rx.note}</span>
                            </div>
                          )}
                        </div>

                        {/* Image */}
                        {rx.imageUrl && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                              <Image className="w-3 h-3" /> Ảnh đơn kính:
                            </p>
                            <img
                              src={rx.imageUrl}
                              alt="Đơn kính"
                              className="w-28 h-28 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition"
                              onClick={() => window.open(rx.imageUrl, '_blank')}
                            />
                          </div>
                        )}

                        {/* Edit button */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(rxKey, rx)}
                          className="text-[#d90f0f] text-sm font-medium hover:underline flex items-center gap-1.5"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(13,22,39,0.06)] p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ADDRESS SECTION */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#222] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#d90f0f]" />
                    Địa chỉ giao hàng
                  </h3>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="text-sm text-[#d90f0f] font-medium hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm mới
                    </button>
                  )}
                </div>

                {addresses.length === 0 && !showAddressForm ? (
                  /* No addresses - prompt to add */
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
                    <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-[#4f5562] mb-4">
                      Bạn chưa có địa chỉ nào trong sổ địa chỉ
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="bg-[#d90f0f] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#b00c0c] transition"
                    >
                      Thêm địa chỉ mới
                    </button>
                    <p className="text-xs text-[#4f5562] mt-3">
                      Hoặc{' '}
                      <Link
                        to="/profile"
                        className="text-[#d90f0f] hover:underline"
                      >
                        quản lý sổ địa chỉ
                      </Link>
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Address selector dropdown */}
                    {addresses.length > 0 && (
                      <div className="relative mb-3">
                        <button
                          type="button"
                          onClick={() =>
                            setShowAddressDropdown(!showAddressDropdown)
                          }
                          className="w-full text-left border-2 border-[#e0e0e0] rounded-2xl p-4 hover:border-[#d90f0f] transition flex items-start justify-between gap-3"
                        >
                          {selectedAddress ? (
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-[#222] text-sm">
                                  {selectedAddress.name}
                                </span>
                                {selectedAddress.isDefault && (
                                  <span className="text-[9px] bg-blue-50 text-[#d90f0f] px-1.5 py-0.5 rounded font-bold uppercase">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-[#4f5562] truncate">
                                {selectedAddress.address}
                              </p>
                              <p className="text-xs text-[#4f5562] mt-1">
                                SĐT: {selectedAddress.phone}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-[#4f5562]">
                              Chọn địa chỉ giao hàng
                            </span>
                          )}
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-1 transition-transform ${showAddressDropdown ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {showAddressDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-[#e0e0e0] rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                            {addresses.map((addr) => (
                              <button
                                key={addr.addressId}
                                type="button"
                                onClick={() => {
                                  setSelectedAddressId(addr.addressId);
                                  setShowAddressDropdown(false);
                                }}
                                className={`w-full text-left p-4 hover:bg-[#f0f7ff] transition border-b border-gray-50 last:border-0 ${selectedAddressId === addr.addressId ? 'bg-[#f0f7ff]' : ''}`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-[#222] text-sm">
                                    {addr.name}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[9px] bg-blue-50 text-[#d90f0f] px-1.5 py-0.5 rounded font-bold uppercase">
                                      Mặc định
                                    </span>
                                  )}
                                  {selectedAddressId === addr.addressId && (
                                    <Check className="w-4 h-4 text-[#d90f0f] ml-auto" />
                                  )}
                                </div>
                                <p className="text-sm text-[#4f5562]">
                                  {addr.address}
                                </p>
                                <p className="text-xs text-[#4f5562] mt-1">
                                  SĐT: {addr.phone}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* New address form */}
                    {showAddressForm && (
                      <div className="border border-[#e0e0e0] rounded-2xl p-4 space-y-3 bg-[#f9f9f9]">
                        <h4 className="text-sm font-semibold text-[#222]">
                          Thêm địa chỉ mới
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Tên gợi nhớ (VD: Nhà riêng)"
                            value={newAddress.name}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                name: e.target.value,
                              })
                            }
                            className="px-4 py-2.5 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#d90f0f] bg-white text-sm"
                          />
                          <input
                            type="tel"
                            placeholder="Số điện thoại"
                            value={newAddress.phone}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                phone: e.target.value,
                              })
                            }
                            className="px-4 py-2.5 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#d90f0f] bg-white text-sm"
                          />
                        </div>
                        <textarea
                          placeholder="Địa chỉ chi tiết"
                          value={newAddress.address}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              address: e.target.value,
                            })
                          }
                          rows={2}
                          className="w-full px-4 py-2.5 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#d90f0f] bg-white text-sm resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-sm text-[#4f5562]">
                            <input
                              type="checkbox"
                              checked={newAddress.isDefault}
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  isDefault: e.target.checked,
                                })
                              }
                              className="rounded"
                            />
                            Đặt làm mặc định
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddressForm(false);
                                setNewAddress({
                                  name: '',
                                  phone: '',
                                  address: '',
                                  isDefault: false,
                                });
                              }}
                              className="px-4 py-2 rounded-full text-sm font-medium text-[#4f5562] hover:bg-gray-200 transition"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveNewAddress}
                              disabled={createAddress.isPending}
                              className="bg-[#d90f0f] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#b00c0c] transition disabled:opacity-50"
                            >
                              {createAddress.isPending
                                ? 'Đang lưu...'
                                : 'Lưu địa chỉ'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* NOTES */}
              <div>
                <label className="block text-sm font-medium text-[#222] mb-2">
                  Ghi chú đơn hàng
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-5 py-3 border border-[#e0e0e0] rounded-2xl focus:outline-none focus:border-[#d90f0f] bg-[#f9f9f9]"
                  placeholder="Ghi chú thêm cho đơn hàng..."
                />
              </div>

              {/* PAYMENT METHOD */}
              <div>
                <h3 className="font-semibold text-[#222] mb-4">
                  Phương thức thanh toán
                </h3>
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition ${paymentMethod === 'cod' ? 'border-[#d90f0f] bg-[#f0f7ff]' : 'border-[#e0e0e0] hover:border-[#bbb]'}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-[#d90f0f]"
                    />
                    <div>
                      <span className="font-medium text-[#222]">
                        Thanh toán khi nhận hàng (COD)
                      </span>
                      <p className="text-sm text-[#4f5562]">
                        Trả tiền mặt khi nhận được hàng
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-4 p-4 border-2 rounded-2xl cursor-not-allowed transition border-[#e0e0e0] opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      disabled
                      className="w-5 h-5 text-gray-300"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#222]">Ví MoMo</span>
                        <span className="text-[10px] bg-gray-100 text-[#4f5562] px-2 py-0.5 rounded-full font-medium">
                          Sắp ra mắt
                        </span>
                      </div>
                      <p className="text-sm text-[#4f5562]">
                        Thanh toán qua ví điện tử MoMo
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  createOrder.isPending || !selectedAddress
                }
                className="w-full py-4 rounded-full font-medium transition disabled:bg-gray-300 disabled:text-gray-500 bg-[#361414] text-white hover:bg-[#0d1322]"
              >
                {createOrder.isPending
                  ? 'Đang xử lý...'
                  : !selectedAddress
                    ? 'Vui lòng chọn địa chỉ giao hàng'
                    : 'Đặt hàng'}
              </button>
            </form>
          </div>

          <div>
            <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(13,22,39,0.06)] p-6 sticky top-4">
              <h2 className="text-xl font-bold text-[#222] mb-6">
                Đơn hàng ({items.length} sản phẩm)
              </h2>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4">
                    <div className="w-16 h-16 bg-[#f3f3f3] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Glasses className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#222] text-sm line-clamp-1">
                        {item.productName}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#4f5562]">
                        <span>x{item.quantity}</span>
                        {item.colorName && <span>· {item.colorName}</span>}
                        {item.refractiveIndex && <span>· CS {item.refractiveIndex}</span>}
                      </div>
                      {(prescriptions[item.variantId] ||
                          prescriptions[item.cartItemId]) && (
                          <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                            <FileText size={10} /> Có đơn kính
                          </p>
                        )}
                    </div>
                    <p className="font-medium text-[#222] text-sm">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-b border-gray-100 py-4 my-4">
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
                      type="button"
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

              <div className="space-y-3 pt-4">
                <div className="flex justify-between text-[#4f5562] text-sm">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#4f5562] text-sm">
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
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 text-sm font-medium">
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xl pt-3 border-t">
                  <span className="text-[#222]">Tổng cộng:</span>
                  <span className="text-[#d90f0f]">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

