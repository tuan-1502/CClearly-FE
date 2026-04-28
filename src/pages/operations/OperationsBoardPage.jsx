// Operations Board Page - Kanban điều phối đơn hàng
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Box,
  TestTube,
  Eye,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/ConfirmModal';
import OrderDetailModal from '@/components/sale/OrderDetailModal';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useOrder';

const OperationsBoardPage = () => {
  const { user } = useAuth();

  const { data: ordersData } = useAdminOrders({ size: 1000 });
  const orders = ordersData?.items || ordersData || [];
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
  });

  const [trackingModal, setTrackingModal] = useState({
    isOpen: false,
    orderId: null,
    tracking: '',
    carrier: '',
  });

  const SHIPPING_CARRIERS = [
    { value: 'Giao hàng tiết kiệm', label: 'Giao hàng tiết kiệm' },
    { value: 'Giao hàng nhanh', label: 'Giao hàng nhanh' },
  ];

  const [selectedOrder, setSelectedOrder] = useState(null);

  // Phân loại đơn hàng theo trạng thái + loại (BE trả status UPPERCASE)
  const { pendingOrders, confirmedOrders, lensLabOrders, packingOrders, shippedOrders } =
    useMemo(() => {
      const pending = [];
      const confirmed = [];
      const lensLab = [];
      const packing = [];
      const shipped = [];

      orders.forEach((o) => {
        const status = (o.status || '').toUpperCase();
        if (status === 'PENDING') pending.push(o);
        else if (status === 'CONFIRMED') confirmed.push(o);
        else if (status === 'PROCESSING' && o.type === 'prescription')
          lensLab.push(o);
        else if (status === 'PROCESSING') packing.push(o);
        else if (status === 'SHIPPED') shipped.push(o);
      });

      return { pendingOrders: pending, confirmedOrders: confirmed, lensLabOrders: lensLab, packingOrders: packing, shippedOrders: shipped };
    }, [orders]);

  // Cột 1: đơn CONFIRMED ở trên (có nút), PENDING ở dưới (không có nút)
  const waitingOrders = [...confirmedOrders, ...pendingOrders];

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    const map = {
      PENDING: { label: 'Chờ xác nhận', class: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Đã xác nhận', class: 'bg-red-100 text-red-800' },
      PROCESSING: { label: 'Đang xử lý', class: 'bg-purple-100 text-purple-800' },
      SHIPPED: { label: 'Đang giao', class: 'bg-orange-100 text-orange-800' },
      DELIVERED: { label: 'Hoàn thành', class: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Đã hủy', class: 'bg-red-100 text-red-800' },
    };
    return map[s] || { label: status, class: 'bg-gray-100 text-gray-800' };
  };

  // — Action handlers —

  const handlePickOrder = (order) => {
    setConfirmModal({
      isOpen: true,
      type: 'info',
      title: 'Lấy hàng',
      message: `Xác nhận lấy hàng đơn ${order.code || order.orderId}?`,
      onConfirm: () => {
        updateOrderStatusMutation.mutate({ id: order.orderId, status: 'PROCESSING' });
        setConfirmModal((m) => ({ ...m, isOpen: false }));
      },
    });
  };

  const handleQcPass = (order) => {
    setTrackingModal({ isOpen: true, orderId: order.orderId, tracking: '' });
  };

  const handleQcFail = (order) => {
    setConfirmModal({
      isOpen: true,
      type: 'warning',
      title: 'QC Không đạt',
      message: `Đơn ${order.code || order.orderId} không đạt QC. Đơn sẽ được gia công lại.`,
      onConfirm: () => {
        toast.warning(`Đơn ${order.code || order.orderId} cần gia công lại`);
        setConfirmModal((m) => ({ ...m, isOpen: false }));
      },
    });
  };

  const handleShipPacking = (order) => {
    setTrackingModal({ isOpen: true, orderId: order.orderId, tracking: '' });
  };

  const handleConfirmDelivery = (order) => {
    setConfirmModal({
      isOpen: true,
      type: 'info',
      title: 'Xác nhận giao hàng',
      message: `Đơn ${order.code || order.orderId} đã giao thành công?`,
      onConfirm: () => {
        updateOrderStatusMutation.mutate({ id: order.orderId, status: 'DELIVERED' });
        setConfirmModal((m) => ({ ...m, isOpen: false }));
      },
    });
  };

  const handleTrackingConfirm = () => {
    if (!trackingModal.carrier) {
      toast.error('Vui lòng chọn đơn vị giao hàng');
      return;
    }
    if (!trackingModal.tracking.trim()) {
      toast.error('Vui lòng nhập mã vận đơn');
      return;
    }
    updateOrderStatusMutation.mutate({
      id: trackingModal.orderId,
      status: 'SHIPPED',
      note: `[${trackingModal.carrier}] ${trackingModal.tracking.trim()}`,
    });
    setTrackingModal({ isOpen: false, orderId: null, tracking: '', carrier: '' });
  };

  // — Render helpers —

  const renderActions = (columnId, order) => {
    const status = (order.status || '').toUpperCase();

    if (columnId === 'waiting') {
      if (status === 'CONFIRMED') {
        return (
          <button
            onClick={() => handlePickOrder(order)}
            className="w-full bg-purple-500 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-purple-600"
          >
            Lấy hàng
          </button>
        );
      }
      return (
        <p className="text-center text-xs text-gray-400 italic">
          Chờ Sales xác nhận
        </p>
      );
    }

    if (columnId === 'lenslab') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleQcPass(order)}
            className="flex-1 bg-green-500 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-green-600"
          >
            QC Pass
          </button>
          <button
            onClick={() => handleQcFail(order)}
            className="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-red-600"
          >
            QC Fail
          </button>
        </div>
      );
    }

    if (columnId === 'packing') {
      return (
        <button
          onClick={() => handleShipPacking(order)}
          className="w-full bg-orange-500 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-orange-600"
        >
          Chuyển giao hàng
        </button>
      );
    }

    if (columnId === 'shipping') {
      return (
        <button
          onClick={() => handleConfirmDelivery(order)}
          className="w-full bg-green-500 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-green-600"
        >
          Xác nhận đã giao
        </button>
      );
    }

    return null;
  };

  const columns = [
    {
      id: 'waiting',
      title: 'Chờ xử lý',
      icon: Clock,
      orders: waitingOrders,
      count: waitingOrders.length,
      color: 'yellow',
    },
    {
      id: 'lenslab',
      title: 'Đang gia công',
      icon: TestTube,
      orders: lensLabOrders,
      count: lensLabOrders.length,
      color: 'purple',
    },
    {
      id: 'packing',
      title: 'Đóng gói',
      icon: Box,
      orders: packingOrders,
      count: packingOrders.length,
      color: 'blue',
    },
    {
      id: 'shipping',
      title: 'Đang giao',
      icon: Truck,
      orders: shippedOrders,
      count: shippedOrders.length,
      color: 'orange',
    },
  ];

  const colorMap = {
    yellow: 'bg-yellow-100 border-yellow-200',
    purple: 'bg-purple-100 border-purple-200',
    blue: 'bg-red-100 border-red-200',
    orange: 'bg-orange-100 border-orange-200',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#222]">Điều phối đơn hàng</h1>
        <p className="text-[#4f5562]">
          Xin chào, {user?.name || 'Operations'}!
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {columns.map((col) => {
          const colorStyles = {
            yellow: { text: 'text-yellow-600', iconBg: 'bg-yellow-50' },
            purple: { text: 'text-purple-600', iconBg: 'bg-purple-50' },
            blue: { text: 'text-blue-600', iconBg: 'bg-blue-50' },
            orange: { text: 'text-orange-600', iconBg: 'bg-orange-50' },
          }[col.color];

          return (
            <div key={col.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-2xl font-bold ${colorStyles.text}`}>
                    {col.count}
                  </p>
                  <p className="text-sm text-[#4f5562] font-medium">{col.title}</p>
                </div>
                <div className={`p-3 rounded-xl flex items-center justify-center ${colorStyles.iconBg}`}>
                  <col.icon className={`w-6 h-6 ${colorStyles.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`rounded-xl p-4 md:p-6 ${colorMap[column.color]}`}
          >
            <div className="flex items-center gap-2 mb-4">
              <column.icon className={`w-5 h-5 text-${column.color}-600`} />
              <h3 className="font-bold text-[#222]">{column.title}</h3>
              <span className="ml-auto bg-white px-2 py-1 rounded-full text-sm font-medium">
                {column.count}
              </span>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-2 min-h-[200px] flex-nowrap custom-scrollbar">
              {column.orders.map((order) => {
                const badge = getStatusBadge(order.status);
                return (
                  <div
                    key={order.orderId || order.id}
                    className="bg-white rounded-xl p-4 shadow-sm min-w-[300px] w-[300px] shrink-0 flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-[#222]">
                        {order.code || order.orderId}
                      </span>
                      <div className="flex items-center gap-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${badge.class}`}
                        >
                          {badge.label}
                        </span>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-[#4f5562] mb-3 truncate">
                      {order.recipientName}
                    </p>
                    {order.type === 'prescription' && (
                      <span className="inline-block px-1.5 py-0.5 rounded text-xs bg-blue-50 text-red-600 mb-2">
                        Có toa kính
                      </span>
                    )}

                    <div className="text-xs text-[#4f5562] mb-3">
                      {order.items?.slice(0, 2).map((item, idx) => (
                        <p key={idx} className="truncate">
                          {item.productName || item.name} x{item.quantity}
                        </p>
                      ))}
                      {order.items?.length > 2 && (
                        <p className="text-gray-400">
                          +{order.items.length - 2} sản phẩm khác
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-medium text-sm">
                        {formatCurrency(order.finalAmount || order.totalAmount)}
                      </span>
                      <span className="text-xs text-[#4f5562]">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <div className="mt-auto pt-3 border-t">
                      {renderActions(column.id, order)}
                    </div>
                  </div>
                );
              })}
              {column.orders.length === 0 && (
                <div className="text-center py-8 text-[#4f5562] text-sm">
                  Không có đơn hàng
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((m) => ({ ...m, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      {/* Tracking Number Modal */}
      {trackingModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setTrackingModal({ isOpen: false, orderId: null, tracking: '', carrier: '' })
            }
          />
          <div className="relative bg-white p-6 rounded-xl w-full max-w-sm space-y-4">
            <h3 className="font-semibold text-lg">Tạo vận đơn</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị giao hàng <span className="text-red-500">*</span>
              </label>
              <select
                value={trackingModal.carrier}
                onChange={(e) =>
                  setTrackingModal((m) => ({ ...m, carrier: e.target.value }))
                }
                className="w-full border p-2 rounded-lg"
              >
                <option value="">-- Chọn đơn vị --</option>
                {SHIPPING_CARRIERS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã vận đơn <span className="text-red-500">*</span>
              </label>
              <input
                value={trackingModal.tracking}
                onChange={(e) =>
                  setTrackingModal((m) => ({ ...m, tracking: e.target.value }))
                }
                placeholder="Nhập mã vận đơn"
                className="w-full border p-2 rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setTrackingModal({ isOpen: false, orderId: null, tracking: '', carrier: '' })
                }
                className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleTrackingConfirm}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OperationsBoardPage;

