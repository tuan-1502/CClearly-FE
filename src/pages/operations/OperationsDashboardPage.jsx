// Operations Dashboard Page
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Clock, Box, Truck, RefreshCw } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Pagination from '@/components/ui/Pagination';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useOrder';
import {
  useReturns,
  useApproveReturn,
  useRejectReturn,
} from '@/hooks/useReturn';

const PAGE_SIZES = [6, 12, 18, 30, 60];

const OperationsDashboardPage = () => {
  const [tab, setTab] = useState('pending');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [trackingModal, setTrackingModal] = useState({
    isOpen: false,
    orderId: null,
    tracking: '',
  });

  const { data: ordersData } = useAdminOrders({ size: 1000 });
  const orders = ordersData?.items || ordersData || [];
  const { data: allReturns = [] } = useReturns();
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const approveReturnMutation = useApproveReturn();
  const rejectReturnMutation = useRejectReturn();

  const pendingOrders = orders.filter(
    (o) => o.status === 'pending' || o.status === 'confirmed'
  );
  const processingOrders = orders.filter((o) => o.status === 'processing');
  const shippedOrders = orders.filter((o) => o.status === 'shipped');
  const pendingReturns = allReturns.filter(
    (r) => r.status === 'pending' || r.status === 'PENDING'
  );

  const getStatusBadge = (status) => {
    const map = {
      pending: {
        label: 'Chờ xác nhận',
        class: 'bg-yellow-100 text-yellow-800',
      },
      confirmed: { label: 'Đã xác nhận', class: 'bg-red-100 text-red-800' },
      processing: {
        label: 'Đang gia công',
        class: 'bg-purple-100 text-purple-800',
      },
      shipped: { label: 'Đang giao', class: 'bg-orange-100 text-orange-800' },
      delivered: { label: 'Hoàn thành', class: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-800' },
    };
    return map[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
  };

  const getReturnStatusBadge = (status) => {
    const map = {
      pending: { label: 'Chờ xử lý', class: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Đã duyệt', class: 'bg-red-100 text-red-800' },
      completed: { label: 'Hoàn thành', class: 'bg-green-100 text-green-800' },
      rejected: { label: 'Từ chối', class: 'bg-red-100 text-red-800' },
    };
    return map[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
  };

  const tabs = [
    { key: 'pending', label: 'Chờ xử lý', count: pendingOrders.length },
    {
      key: 'processing',
      label: 'Đang gia công',
      count: processingOrders.length,
    },
    { key: 'shipping', label: 'Đang giao', count: shippedOrders.length },
    { key: 'returns', label: 'Đổi trả', count: pendingReturns.length },
  ];

  const currentOrders =
    tab === 'pending'
      ? pendingOrders
      : tab === 'processing'
        ? processingOrders
        : tab === 'shipping'
          ? shippedOrders
          : [];

  const totalReturns = pendingReturns.length;
  const totalReturnsPages = Math.ceil(totalReturns / pageSize);
  const paginatedReturns = pendingReturns.slice((page - 1) * pageSize, page * pageSize);

  const totalOrders = currentOrders.length;
  const totalOrdersPages = Math.ceil(totalOrders / pageSize);
  const paginatedOrders = currentOrders.slice((page - 1) * pageSize, page * pageSize);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleConfirmOrder = (orderId) => {
    updateOrderStatusMutation.mutate({ id: orderId, status: 'confirmed' });
  };

  const handleCompleteOrder = (orderId) => {
    updateOrderStatusMutation.mutate({ id: orderId, status: 'shipped' });
  };

  const handleUpdateTracking = (orderId) => {
    setTrackingModal({ isOpen: true, orderId, tracking: '' });
  };

  const confirmUpdateTracking = () => {
    if (trackingModal.tracking) {
      toast.success(
        `Đã cập nhật mã vận đơn ${trackingModal.tracking} cho đơn hàng ${trackingModal.orderId}`
      );
      setTrackingModal({ isOpen: false, orderId: null, tracking: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#222]">Operations Dashboard</h1>
        <p className="text-[#4f5562]">Bảng điều phối đơn hàng</p>
      </div>

      {/* Stats as Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tabs.map((t) => {
          const isSelected = tab === t.key;
          let colorStyles = { active: 'border-blue-300 ring-2 ring-blue-100', text: 'text-blue-600', bg: 'bg-blue-50' };
          let Icon = Clock;
          
          if (t.key === 'pending') { colorStyles = { active: 'border-yellow-300 ring-2 ring-yellow-100 hover:border-yellow-200', text: 'text-yellow-600', bg: 'bg-yellow-50' }; Icon = Clock; }
          if (t.key === 'processing') { colorStyles = { active: 'border-purple-300 ring-2 ring-purple-100 hover:border-purple-200', text: 'text-purple-600', bg: 'bg-purple-50' }; Icon = Box; }
          if (t.key === 'shipping') { colorStyles = { active: 'border-orange-300 ring-2 ring-orange-100 hover:border-orange-200', text: 'text-orange-600', bg: 'bg-orange-50' }; Icon = Truck; }
          if (t.key === 'returns') { colorStyles = { active: 'border-red-300 ring-2 ring-red-100 hover:border-red-200', text: 'text-red-500', bg: 'bg-red-50' }; Icon = RefreshCw; }

          return (
            <div
              key={t.key}
              onClick={() => { setTab(t.key); setPage(1); }}
              className={`bg-white rounded-2xl p-6 shadow-sm border cursor-pointer transition ${isSelected ? colorStyles.active : 'border-gray-100 hover:border-gray-200'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-2xl font-bold ${colorStyles.text}`}>
                    {t.count}
                  </p>
                  <p className="text-sm text-[#4f5562] font-medium">{t.label}</p>
                </div>
                <div className={`p-3 rounded-xl flex items-center justify-center ${colorStyles.bg}`}>
                  <Icon className={`w-6 h-6 ${colorStyles.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Returns Section */}
      {tab === 'returns' && (
        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)]">
          <h3 className="text-lg font-semibold text-[#222] mb-4">
            Yêu cầu đổi trả
          </h3>
          <div className="space-y-3">
            {paginatedReturns.length > 0 ? (
              paginatedReturns.map((ret) => {
                const statusBadge = getReturnStatusBadge(ret.status);
                return (
                  <div
                    key={ret.refundId || ret.id}
                    className="p-4 bg-[#f9f9f9] rounded-xl"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-[#222]">
                          {ret.refundId || ret.id}
                        </p>
                        <p className="text-sm text-[#4f5562]">
                          Order: {ret.orderCode || ret.orderId}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>
                    <div className="space-y-1 mb-3">
                      <p className="text-sm">
                        <span className="font-medium">Khách:</span>{' '}
                        {ret.customerName}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Lý do:</span> {ret.reason}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          approveReturnMutation.mutate(ret.refundId || ret.id)
                        }
                        className="flex-1 bg-green-500 text-white py-2 rounded-full text-sm font-medium hover:bg-green-600"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() =>
                          rejectReturnMutation.mutate({
                            id: ret.refundId || ret.id,
                            reason: 'Từ chối bởi vận hành',
                          })
                        }
                        className="flex-1 bg-red-500 text-white py-2 rounded-full text-sm font-medium hover:bg-red-600"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-[#4f5562] py-8">
                Không có yêu cầu đổi trả nào
              </p>
            )}
          </div>

          {/* pagination */}
          {totalReturns > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 border-t pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Hiển thị:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-500">/ {totalReturns} kết quả</span>
              </div>
              {totalReturnsPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalReturnsPages}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Orders Board */}
      {tab !== 'returns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedOrders.length === 0 ? (
              <div className="col-span-full text-center py-12 text-[#4f5562] bg-white rounded-2xl shadow-sm border border-gray-50">
                Không có đơn hàng nào
              </div>
            ) : (
              paginatedOrders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              return (
                <div
                  key={order.orderId || order.id}
                  className="bg-white rounded-2xl p-5 shadow-[0_10px_30px_rgba(13,22,39,0.06)]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-[#222]">
                        {order.code || order.orderId || order.id}
                      </p>
                      <p className="text-sm text-[#4f5562]">
                        {order.recipientName || order.shippingAddress?.name}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-[#4f5562]">{item.name}</span>
                        <span className="text-[#222]">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-3 mb-3">
                    <p className="text-sm font-medium text-[#222]">
                      Tổng:{' '}
                      {formatCurrency(order.finalAmount || order.totalAmount)}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-xs text-[#4f5562]">
                        Mã vận đơn: {order.trackingNumber}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {tab === 'pending' && (
                      <button
                        onClick={() =>
                          handleConfirmOrder(order.orderId || order.id)
                        }
                        className="flex-1 bg-[#d90f0f] text-white py-2 rounded-full text-sm font-medium hover:bg-[#b00c0c]"
                      >
                        Xác nhận
                      </button>
                    )}
                    {tab === 'processing' && (
                      <button
                        onClick={() =>
                          handleCompleteOrder(order.orderId || order.id)
                        }
                        className="flex-1 bg-[#d90f0f] text-white py-2 rounded-full text-sm font-medium hover:bg-[#b00c0c]"
                      >
                        Hoàn thành đóng gói
                      </button>
                    )}
                    {tab === 'shipping' && (
                      <button
                        onClick={() =>
                          handleUpdateTracking(order.orderId || order.id)
                        }
                        className="flex-1 bg-[#d90f0f] text-white py-2 rounded-full text-sm font-medium hover:bg-[#b00c0c]"
                      >
                        Cập nhật tracking
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          </div>

          {/* pagination */}
          {totalOrders > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Hiển thị:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-500">/ {totalOrders} kết quả</span>
              </div>
              {totalOrdersPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalOrdersPages}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OperationsDashboardPage;

