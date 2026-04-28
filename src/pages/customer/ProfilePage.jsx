import {
  Lock,
  User,
  LogOut,
  ShoppingBag,
  Edit2,
  MapPin,
  Loader2,
  Package,
  X,
  Phone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUserOrders, useCancelOrder } from '@/hooks/useOrder';
import {
  useUserProfile,
  useUpdateProfile,
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/hooks/useUser';

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user: jwtUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);

  // ── Profile API ──
  const { data: profileData, isLoading: profileLoading } = useUserProfile();
  const updateProfileMutation = useUpdateProfile();
  const profile = profileData; // { userId, email, fullName, phoneNumber, isEmailVerified, role }

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
  });

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
      });
    }
  }, [profile]);

  // ── Address API ──
  const { data: addressesData, isLoading: addressesLoading } = useAddresses();
  const addresses = addressesData || [];

  // ── Order API ──
  const { data: ordersData, isLoading: ordersLoading } = useUserOrders();
  const cancelOrder = useCancelOrder();
  const orders = [...(ordersData?.data || ordersData || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState({
    isOpen: false,
    orderId: null,
  });
  const [ordersPage, setOrdersPage] = useState(1);
  const ORDERS_PER_PAGE = 5;
  const totalOrderPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const paginatedOrders = orders.slice(
    (ordersPage - 1) * ORDERS_PER_PAGE,
    ordersPage * ORDERS_PER_PAGE
  );
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    phone: '',
    address: '',
    isDefault: false,
  });

  if (!isAuthenticated) {
    return (
      <div className="bg-[#ececec] min-h-screen py-10">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 text-center py-20">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-12 h-12 text-gray-500" />
          </div>
          <h2 className="text-3xl font-bold text-[#222] mb-4">
            Vui lòng đăng nhập
          </h2>
          <p className="text-[#4f5562] mb-8">Đăng nhập để quản lý tài khoản</p>
          <button
            onClick={() => navigate('/login', { state: { from: location.pathname } })}
            className="bg-[#361414] text-white px-10 py-4 rounded-full font-medium hover:bg-[#0d1322] transition"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // ── Handlers ──
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData, {
      onSuccess: () => setIsEditing(false),
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (editingAddress) {
      updateAddressMutation.mutate(
        { addressId: editingAddress.addressId, data: addressFormData },
        {
          onSuccess: () => {
            setShowAddressForm(false);
            setEditingAddress(null);
            resetAddressForm();
          },
        }
      );
    } else {
      createAddressMutation.mutate(addressFormData, {
        onSuccess: () => {
          setShowAddressForm(false);
          resetAddressForm();
        },
      });
    }
  };

  const handleDeleteAddress = (addressId) => {
    deleteAddressMutation.mutate(addressId);
  };

  const handleSetDefault = (addressId) => {
    setDefaultMutation.mutate(addressId);
  };

  const openEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressFormData({
      name: addr.name || '',
      phone: addr.phone || '',
      address: addr.address || '',
      isDefault: addr.isDefault || false,
    });
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setAddressFormData({
      name: '',
      phone: '',
      address: '',
      isDefault: false,
    });
  };

  // ── Order helpers ──
  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    const statusMap = {
      PENDING: {
        label: 'Chờ xác nhận',
        class: 'bg-yellow-100 text-yellow-800',
      },
      CONFIRMED: { label: 'Đã xác nhận', class: 'bg-red-100 text-red-800' },
      PROCESSING: {
        label: 'Đang xử lý',
        class: 'bg-purple-100 text-purple-800',
      },
      SHIPPED: { label: 'Đang giao', class: 'bg-orange-100 text-orange-800' },
      DELIVERED: { label: 'Hoàn thành', class: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Đã hủy', class: 'bg-red-100 text-red-800' },
    };
    const info = statusMap[s] || {
      label: status,
      class: 'bg-gray-100 text-gray-800',
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${info.class}`}
      >
        {info.label}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const typeMap = {
      regular: 'Mua hàng',
      standard: 'Mua hàng',
      preorder: 'Pre-order',
      prescription: 'Kính theo đơn',
    };
    return typeMap[type] || type;
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);

  const handleCancelClick = (orderId) => {
    setCancelConfirm({ isOpen: true, orderId });
  };

  const handleConfirmCancel = async () => {
    try {
      await cancelOrder.mutateAsync(cancelConfirm.orderId);
      toast.success('Đã hủy đơn hàng thành công');
      setCancelConfirm({ isOpen: false, orderId: null });
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const orderSteps = [
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
  ];

  const getRoleLabel = (role) => {
    const labels = {
      CUSTOMER: 'Khách hàng',
      SALES_STAFF: 'Nhân viên bán hàng',
      OPERATION_STAFF: 'Nhân viên vận hành',
      MANAGER: 'Quản lý',
      ADMIN: 'Quản trị viên',
    };
    return labels[role] || role;
  };

  const displayName = profile?.fullName || jwtUser?.sub || 'User';
  const displayEmail = profile?.email || jwtUser?.sub || '';
  const displayRole = profile?.role || jwtUser?.role || '';

  return (
    <div className="bg-[#ececec] min-h-screen py-10">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#222] tracking-[-0.02em]">
            Tài khoản
          </h1>
          <p className="text-[#4f5562] mt-2">Quản lý thông tin cá nhân</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(13,22,39,0.06)] p-6 sticky top-4">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-[#d90f0f] rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-[#222]">{displayName}</h2>
                <p className="text-[#4f5562]">{displayEmail}</p>
                <span className="inline-block mt-2 text-xs bg-[#ececec] px-3 py-1 rounded-full text-[#222]">
                  {getRoleLabel(displayRole)}
                </span>
              </div>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition ${activeTab === 'info' ? 'bg-[#d90f0f] text-white' : 'text-[#4f5562] hover:bg-[#f3f3f3]'}`}
                >
                  <User className="w-5 h-5" />
                  Thông tin tài khoản
                </button>
                {displayRole === 'CUSTOMER' && (
                  <>
                    <button
                      onClick={() => setActiveTab('addresses')}
                      className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition ${activeTab === 'addresses' ? 'bg-[#d90f0f] text-white' : 'text-[#4f5562] hover:bg-[#f3f3f3]'}`}
                    >
                      <MapPin className="w-5 h-5" />
                      Sổ địa chỉ
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition ${activeTab === 'orders' ? 'bg-[#d90f0f] text-white' : 'text-[#4f5562] hover:bg-[#f3f3f3]'}`}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Lịch sử đơn hàng
                    </button>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition font-medium flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Đăng xuất
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            {activeTab === 'orders' ? (
              /* ── Orders Tab ── */
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[#222]">
                    Lịch sử đơn hàng
                  </h2>
                  <p className="text-sm text-[#4f5562] mt-1">
                    Theo dõi và quản lý đơn hàng của bạn
                  </p>
                </div>

                {ordersLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-[#d90f0f]" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-[0_10px_30px_rgba(13,22,39,0.06)]">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="w-12 h-12 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#222] mb-4">
                      Bạn chưa có đơn hàng nào
                    </h2>
                    <p className="text-[#4f5562] mb-8">
                      Hãy khám phá bộ sưu tập kính mắt của chúng tôi
                    </p>
                    <Link
                      to="/products"
                      className="inline-block bg-[#361414] text-white px-10 py-4 rounded-full font-medium hover:bg-[#0d1322] transition"
                    >
                      Mua sắm ngay
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {paginatedOrders.map((order) => {
                      const orderStatus = (order.status || '').toUpperCase();
                      return (
                        <div
                          key={order.orderId}
                          className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(13,22,39,0.06)] overflow-hidden"
                        >
                          <div className="bg-[#f9f9f9] px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                            <div>
                              <p className="font-bold text-[#222]">
                                Đơn hàng #{order.code || order.orderId}
                              </p>
                              <p className="text-sm text-[#4f5562]">
                                {new Date(order.createdAt).toLocaleDateString(
                                  'vi-VN',
                                  {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  }
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-[#4f5562] bg-white px-3 py-1 rounded-full">
                                {getTypeLabel(order.type)}
                              </span>
                              {getStatusBadge(order.status)}
                            </div>
                          </div>

                          {orderStatus !== 'CANCELLED' && (
                            <div className="px-6 py-4 border-b border-[#ececec]">
                              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                {orderSteps.map((step, index) => {
                                  const orderStatusIndex =
                                    orderSteps.indexOf(orderStatus);
                                  const isCompleted = orderStatusIndex >= index;
                                  return (
                                    <div
                                      key={step}
                                      className="flex items-center flex-shrink-0"
                                    >
                                      <div
                                        className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-[#d90f0f]' : 'bg-gray-300'}`}
                                      ></div>
                                      {index < 4 && (
                                        <div
                                          className={`w-8 h-0.5 ${isCompleted ? 'bg-[#d90f0f]' : 'bg-gray-300'}`}
                                        ></div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex justify-between text-xs text-[#4f5562] mt-2">
                                <span>Chờ xác nhận</span>
                                <span>Hoàn thành</span>
                              </div>
                            </div>
                          )}

                          <div className="px-6 py-4">
                            {order.items && order.items.length > 0 && (
                              <>
                                <div className="flex items-center gap-3 py-2 border-b border-[#ececec]">
                                  {order.items[0]?.imageUrl && (
                                    <img
                                      src={order.items[0].imageUrl}
                                      alt=""
                                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[#222] block truncate">
                                      {order.items[0]?.productName}
                                    </span>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                      {order.items[0]?.colorName && (
                                        <span className="text-xs text-[#4f5562]">
                                          Màu: {order.items[0].colorName}
                                        </span>
                                      )}
                                      {order.items[0]?.refractiveIndex != null && (
                                        <span className="text-xs text-[#4f5562]">
                                          CS: {order.items[0].refractiveIndex}
                                        </span>
                                      )}
                                      {order.items[0]?.variantSku && (
                                        <span className="text-xs text-[#8a8f9a]">
                                          ({order.items[0].variantSku})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="font-medium text-[#222] flex-shrink-0">
                                    x{order.items[0]?.quantity} ·{' '}
                                    {formatCurrency(
                                      order.items[0]?.unitPrice *
                                        order.items[0]?.quantity
                                    )}
                                  </span>
                                </div>
                                {order.items.length > 1 && (
                                  <p className="text-sm text-[#4f5562] py-2">
                                    +{order.items.length - 1} sản phẩm khác
                                  </p>
                                )}
                              </>
                            )}
                          </div>

                          <div className="px-6 py-4 bg-[#f9f9f9] flex flex-wrap justify-between items-center gap-4">
                            <div className="font-bold text-xl text-[#222]">
                              Tổng: {formatCurrency(order.finalAmount)}
                            </div>
                            <div className="flex gap-3">
                              {orderStatus === 'PENDING' && (
                                <button
                                  onClick={() =>
                                    handleCancelClick(order.orderId)
                                  }
                                  className="px-5 py-2.5 text-red-600 border-2 border-red-200 rounded-full hover:bg-red-50 transition font-medium"
                                >
                                  Hủy đơn
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="px-5 py-2.5 text-[#d90f0f] border-2 border-[#d90f0f] rounded-full hover:bg-[#f0f7ff] transition font-medium"
                              >
                                Xem chi tiết
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Pagination */}
                    {totalOrderPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-4">
                        <button
                          onClick={() =>
                            setOrdersPage((p) => Math.max(1, p - 1))
                          }
                          disabled={ordersPage === 1}
                          className="p-2 rounded-full hover:bg-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-5 h-5 text-[#222]" />
                        </button>
                        {Array.from(
                          { length: totalOrderPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setOrdersPage(page)}
                            className={`w-10 h-10 rounded-full text-sm font-medium transition ${
                              page === ordersPage
                                ? 'bg-[#d90f0f] text-white'
                                : 'text-[#4f5562] hover:bg-white'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() =>
                            setOrdersPage((p) =>
                              Math.min(totalOrderPages, p + 1)
                            )
                          }
                          disabled={ordersPage === totalOrderPages}
                          className="p-2 rounded-full hover:bg-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-5 h-5 text-[#222]" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Detail Modal */}
                {selectedOrder && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                      className="absolute inset-0 bg-black/50"
                      onClick={() => setSelectedOrder(null)}
                    />
                    <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                      <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-[#222]">
                          Chi tiết đơn hàng #
                          {selectedOrder.code || selectedOrder.orderId}
                        </h2>
                        <button
                          onClick={() => setSelectedOrder(null)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-[#4f5562]">Trạng thái</p>
                            {getStatusBadge(selectedOrder.status)}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-[#4f5562]">Ngày đặt</p>
                            <p className="font-medium text-[#222]">
                              {new Date(
                                selectedOrder.createdAt
                              ).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="border-t pt-4">
                          <h3 className="font-medium text-[#222] mb-3">
                            Thông tin giao hàng
                          </h3>
                          <div className="space-y-2 text-sm">
                            {selectedOrder.recipientName && (
                              <p className="flex items-center gap-2 text-[#4f5562]">
                                <User className="w-4 h-4" />
                                {selectedOrder.recipientName}
                              </p>
                            )}
                            <p className="flex items-center gap-2 text-[#4f5562]">
                              <MapPin className="w-4 h-4" />
                              {[
                                selectedOrder.shippingStreet,
                                selectedOrder.shippingCity,
                              ]
                                .filter(Boolean)
                                .join(', ') || 'N/A'}
                            </p>
                            {selectedOrder.shippingPhone && (
                              <p className="flex items-center gap-2 text-[#4f5562]">
                                <Phone className="w-4 h-4" />
                                {selectedOrder.shippingPhone}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="border-t pt-4">
                          <h3 className="font-medium text-[#222] mb-3">
                            Sản phẩm
                          </h3>
                          <div className="space-y-3">
                            {(selectedOrder.items || []).map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3"
                              >
                                {item.imageUrl && (
                                  <img
                                    src={item.imageUrl}
                                    alt=""
                                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-[#222] truncate">
                                    {item.productName}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-[#4f5562]">
                                    {item.colorName && (
                                      <span>Màu: {item.colorName}</span>
                                    )}
                                    {item.refractiveIndex != null && (
                                      <span>CS: {item.refractiveIndex}</span>
                                    )}
                                    {item.variantSku && (
                                      <span className="text-xs">
                                        ({item.variantSku})
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-[#4f5562]">
                                    x{item.quantity}
                                  </p>
                                  {/* Prescription details */}
                                  {item.prescription && (
                                    <div className="mt-2 p-2.5 bg-blue-50 rounded-lg border border-red-100">
                                      <p className="text-xs font-medium text-red-700 mb-1.5">Đơn kính</p>
                                      {item.prescription.imageUrl && (
                                        <a href={item.prescription.imageUrl} target="_blank" rel="noreferrer"
                                          className="text-xs text-red-600 underline mb-1.5 block">Xem ảnh đơn thuốc</a>
                                      )}
                                      <div className="grid grid-cols-5 gap-0.5 text-[11px] text-center">
                                        <div></div>
                                        <div className="font-medium text-[#4f5562]">SPH</div>
                                        <div className="font-medium text-[#4f5562]">CYL</div>
                                        <div className="font-medium text-[#4f5562]">AXS</div>
                                        <div className="font-medium text-[#4f5562]">ADD</div>
                                        <div className="font-medium text-[#4f5562]">OD</div>
                                        <div>{item.prescription.sphOd ?? '–'}</div>
                                        <div>{item.prescription.cylOd ?? '–'}</div>
                                        <div>{item.prescription.axisOd ?? '–'}</div>
                                        <div>{item.prescription.addOd ?? '–'}</div>
                                        <div className="font-medium text-[#4f5562]">OS</div>
                                        <div>{item.prescription.sphOs ?? '–'}</div>
                                        <div>{item.prescription.cylOs ?? '–'}</div>
                                        <div>{item.prescription.axisOs ?? '–'}</div>
                                        <div>{item.prescription.addOs ?? '–'}</div>
                                      </div>
                                      {item.prescription.pd != null && (
                                        <p className="text-[11px] text-[#4f5562] mt-1">PD: {item.prescription.pd}</p>
                                      )}
                                      {item.prescription.salesNote && (
                                        <p className="text-[11px] text-[#4f5562] mt-0.5">Ghi chú: {item.prescription.salesNote}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <p className="font-medium text-[#222] flex-shrink-0">
                                  {formatCurrency(
                                    item.unitPrice * item.quantity
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        {selectedOrder.shippingFee != null && (
                          <div className="border-t pt-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#4f5562]">
                                Phí vận chuyển
                              </span>
                              <span>
                                {formatCurrency(selectedOrder.shippingFee)}
                              </span>
                            </div>
                          </div>
                        )}
                        {selectedOrder.discountAmount > 0 && (
                          <div className="border-t pt-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#4f5562]">
                                Giảm giá
                                {selectedOrder.couponCode && (
                                  <span className="ml-1 px-1.5 py-0.5 bg-green-50 text-green-700 text-xs rounded font-medium">
                                    {selectedOrder.couponCode}
                                  </span>
                                )}
                              </span>
                              <span className="text-green-600 font-medium">
                                -{formatCurrency(selectedOrder.discountAmount)}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="border-t pt-4">
                          <div className="flex justify-between text-lg font-bold">
                            <span>Tổng cộng</span>
                            <span>
                              {formatCurrency(selectedOrder.finalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <ConfirmModal
                  isOpen={cancelConfirm.isOpen}
                  onClose={() =>
                    setCancelConfirm({ isOpen: false, orderId: null })
                  }
                  onConfirm={handleConfirmCancel}
                  title="Xác nhận hủy đơn"
                  message="Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác."
                  confirmText="Hủy đơn"
                  cancelText="Giữ đơn"
                  type="danger"
                />
              </div>
            ) : activeTab === 'info' ? (
              <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(13,22,39,0.06)] p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#222]">
                    Thông tin cá nhân
                  </h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-[#d90f0f] hover:underline font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                  </button>
                </div>

                {profileLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-[#d90f0f]" />
                  </div>
                ) : isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[#222] mb-2">
                        Họ tên
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-5 py-3 border border-[#e0e0e0] rounded-full focus:outline-none focus:border-[#d90f0f] bg-[#f9f9f9]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#222] mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full px-5 py-3 border border-[#e0e0e0] rounded-full focus:outline-none focus:border-[#d90f0f] bg-[#f9f9f9]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="bg-[#361414] text-white px-8 py-3 rounded-full hover:bg-[#0d1322] transition font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Lưu thay đổi
                    </button>
                  </form>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="bg-[#f3f3f3] p-4 rounded-xl">
                        <p className="text-sm text-[#4f5562] mb-1">Họ tên</p>
                        <p className="font-semibold text-[#222]">
                          {profile?.fullName || 'Chưa cập nhật'}
                        </p>
                      </div>
                      <div className="bg-[#f3f3f3] p-4 rounded-xl">
                        <p className="text-sm text-[#4f5562] mb-1">Email</p>
                        <p className="font-semibold text-[#222]">
                          {profile?.email || displayEmail}
                        </p>
                      </div>
                      <div className="bg-[#f3f3f3] p-4 rounded-xl">
                        <p className="text-sm text-[#4f5562] mb-1">
                          Số điện thoại
                        </p>
                        <p className="font-semibold text-[#222]">
                          {profile?.phoneNumber || 'Chưa cập nhật'}
                        </p>
                      </div>
                      <div className="bg-[#f3f3f3] p-4 rounded-xl">
                        <p className="text-sm text-[#4f5562] mb-1">Vai trò</p>
                        <p className="font-semibold text-[#222]">
                          {getRoleLabel(displayRole)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(13,22,39,0.06)] p-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-[#222]">Sổ địa chỉ</h2>
                  {!showAddressForm && (
                    <button
                      onClick={() => {
                        setEditingAddress(null);
                        resetAddressForm();
                        setShowAddressForm(true);
                      }}
                      className="text-sm font-bold bg-[#361414] text-white px-6 py-2 rounded-full hover:bg-[#0d1322] transition"
                    >
                      Thêm địa chỉ mới
                    </button>
                  )}
                </div>

                {addressesLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-[#d90f0f]" />
                  </div>
                ) : showAddressForm ? (
                  <form
                    onSubmit={handleAddressSubmit}
                    className="bg-[#f9f9f9] p-6 rounded-2xl border border-[#e0e0e0] mb-8 space-y-4"
                  >
                    <h3 className="font-bold text-[#222] mb-4">
                      {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Địa chỉ mới'}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#4f5562] mb-2 uppercase">
                          Tên gợi nhớ (Ví dụ: Nhà riêng)
                        </label>
                        <input
                          type="text"
                          required
                          value={addressFormData.name}
                          onChange={(e) =>
                            setAddressFormData({
                              ...addressFormData,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#d90f0f]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#4f5562] mb-2 uppercase">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          required
                          value={addressFormData.phone}
                          onChange={(e) =>
                            setAddressFormData({
                              ...addressFormData,
                              phone: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#d90f0f]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4f5562] mb-2 uppercase">
                        Địa chỉ chi tiết
                      </label>
                      <textarea
                        required
                        value={addressFormData.address}
                        onChange={(e) =>
                          setAddressFormData({
                            ...addressFormData,
                            address: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#d90f0f] h-20 resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={addressFormData.isDefault}
                        onChange={(e) =>
                          setAddressFormData({
                            ...addressFormData,
                            isDefault: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-[#d90f0f]"
                      />
                      <label
                        htmlFor="isDefault"
                        className="text-sm text-[#4f5562]"
                      >
                        Đặt làm địa chỉ mặc định
                      </label>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={
                          createAddressMutation.isPending ||
                          updateAddressMutation.isPending
                        }
                        className="bg-[#d90f0f] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-[#0d4fb8] transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {(createAddressMutation.isPending ||
                          updateAddressMutation.isPending) && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        {editingAddress ? 'Cập nhật' : 'Thêm mới'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                        }}
                        className="bg-gray-200 text-[#222] px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-300 transition"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.addressId}
                        className="border border-[#e0e0e0] rounded-2xl p-6 relative hover:border-[#d90f0f] transition-colors group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-[#222]">
                              {addr.name}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-blue-50 text-[#d90f0f] px-2 py-0.5 rounded-md font-bold uppercase">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4">
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleSetDefault(addr.addressId)}
                                disabled={setDefaultMutation.isPending}
                                className="text-xs text-[#4f5562] font-medium hover:text-[#d90f0f] disabled:opacity-50"
                              >
                                Thiết lập mặc định
                              </button>
                            )}
                            <button
                              onClick={() => openEditAddress(addr)}
                              className="text-xs text-[#d90f0f] font-medium hover:underline"
                            >
                              Sửa
                            </button>
                            {!addr.isDefault && (
                              <button
                                onClick={() =>
                                  handleDeleteAddress(addr.addressId)
                                }
                                disabled={deleteAddressMutation.isPending}
                                className="text-xs text-red-500 font-medium hover:underline disabled:opacity-50"
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-[#4f5562] group-hover:text-[#222] transition-colors">
                          {addr.address}
                        </p>
                        <p className="text-xs text-[#4f5562] mt-2">
                          SĐT: {addr.phone}
                        </p>
                      </div>
                    ))}
                    {addresses.length === 0 && (
                      <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-sm text-gray-400">
                          Bạn chưa có địa chỉ nào trong sổ địa chỉ.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


