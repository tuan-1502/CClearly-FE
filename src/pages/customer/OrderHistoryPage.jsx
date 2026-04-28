import { Lock, Package, X, MapPin, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUserOrders, useCancelOrder } from '@/hooks/useOrder';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: ordersData, isLoading } = useUserOrders();
  const cancelOrder = useCancelOrder();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState({
    isOpen: false,
    orderId: null,
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
          <p className="text-[#4f5562] mb-8">
            Đăng nhập để xem lịch sử đơn hàng
          </p>
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

  const orders = ordersData?.data || ordersData || [];

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

  const steps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

  if (isLoading) {
    return (
      <div className="bg-[#ececec] min-h-screen py-10">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#4f5562]">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#ececec] min-h-screen py-10">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#222] tracking-[-0.02em]">
            Lịch sử đơn hàng
          </h1>
          <p className="text-[#4f5562] mt-2">
            Theo dõi và quản lý đơn hàng của bạn
          </p>
        </div>

        {orders.length === 0 ? (
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
            {orders.map((order) => {
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
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
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
                        {steps.map((step, index) => {
                          const orderStatusIndex = steps.indexOf(orderStatus);
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
                        <div className="flex justify-between py-2 border-b border-[#ececec]">
                          <span className="text-[#222]">
                            {order.items[0]?.productName} x
                            {order.items[0]?.quantity}
                          </span>
                          <span className="font-medium text-[#222]">
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
                          onClick={() => handleCancelClick(order.orderId)}
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
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#222]">
                Chi tiết đơn hàng #{selectedOrder.code || selectedOrder.orderId}
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
                    {new Date(selectedOrder.createdAt).toLocaleDateString(
                      'vi-VN',
                      {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
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
                    {[selectedOrder.shippingStreet, selectedOrder.shippingCity]
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
                <h3 className="font-medium text-[#222] mb-3">Sản phẩm</h3>
                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <div>
                        <p className="text-[#222]">{item.productName}</p>
                        <p className="text-sm text-[#4f5562]">
                          x{item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-[#222]">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.shippingFee != null && (
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#4f5562]">Phí vận chuyển</span>
                    <span>{formatCurrency(selectedOrder.shippingFee)}</span>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span>{formatCurrency(selectedOrder.finalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={cancelConfirm.isOpen}
        onClose={() => setCancelConfirm({ isOpen: false, orderId: null })}
        onConfirm={handleConfirmCancel}
        title="Xác nhận hủy đơn"
        message="Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác."
        confirmText="Hủy đơn"
        cancelText="Giữ đơn"
        type="danger"
      />
    </div>
  );
};

export default OrderHistoryPage;

