// Operations Shipping Page - Giao vận & Tracking
import {
  Search,
  Truck,
  MapPin,
  CheckCircle,
  AlertCircle,
  Package,
  Eye,
  CreditCard,
  Banknote,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import OrderDetailModal from '@/components/sale/OrderDetailModal';
import Pagination from '@/components/ui/Pagination';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useOrder';

const SHIPPING_CARRIERS = [
  { value: 'Giao hàng tiết kiệm', label: 'Giao hàng tiết kiệm' },
  { value: 'Giao hàng nhanh', label: 'Giao hàng nhanh' },
];

const PAGE_SIZES = [5, 10, 15, 20, 30, 50];

const OperationsShippingPage = () => {
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    orderId: null,
    action: null,
  });
  const [trackingModal, setTrackingModal] = useState({
    isOpen: false,
    orderId: null,
    tracking: '',
  });
  const { user } = useAuth();
  const { data: orderData } = useAdminOrders({ size: 1000 });
  const updateStatusMutation = useUpdateOrderStatus();
  const orders = orderData?.items || orderData || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all | SHIPPED | DELIVERED
  const [sortParam, setSortParam] = useState('date_desc');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Include both SHIPPED and DELIVERED orders
  const shippingOrders = useMemo(() => {
    return orders.filter((o) => {
      const s = (o.status || '').toUpperCase();
      return s === 'SHIPPED' || s === 'DELIVERED';
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = shippingOrders.filter((order) => {
      const id = (order.code || order.orderId || order.id || '')
        .toString()
        .toLowerCase();
      const name = (order.recipientName || '').toLowerCase();
      const tracking = (order.trackingNumber || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      const matchSearch =
        id.includes(term) || tracking.includes(term) || name.includes(term);

      // Filter by status tab
      const s = (order.status || '').toUpperCase();
      if (statusFilter !== 'all' && s !== statusFilter) return false;

      // Filter by carrier
      if (carrierFilter !== 'all') {
        const tn = order.trackingNumber || '';
        return matchSearch && tn.includes(`[${carrierFilter}]`);
      }
      return matchSearch;
    });

    result.sort((a, b) => {
      const nameA = (a.recipientName || '').toLowerCase();
      const nameB = (b.recipientName || '').toLowerCase();
      const amountA = a.finalAmount || a.totalAmount || 0;
      const amountB = b.finalAmount || b.totalAmount || 0;
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      switch (sortParam) {
        case 'name_asc': return nameA.localeCompare(nameB, 'vi');
        case 'name_desc': return nameB.localeCompare(nameA, 'vi');
        case 'amount_asc': return amountA - amountB;
        case 'amount_desc': return amountB - amountA;
        case 'date_asc': return dateA - dateB;
        case 'date_desc':
        default:
          return dateB - dateA;
      }
    });

    return result;
  }, [shippingOrders, searchTerm, statusFilter, carrierFilter, sortParam]);

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleUpdateStatus = (orderId) => {
    setConfirmModal({
      isOpen: true,
      type: 'info',
      title: 'Xác nhận giao hàng',
      message: `Xác nhận rằng đơn hàng ${orderId} đã được giao thành công cho khách hàng?`,
      onConfirm: () => {
        updateStatusMutation.mutate(
          { id: orderId, status: 'DELIVERED' },
          {
            onSuccess: () =>
              toast.success(`Đã cập nhật đơn ${orderId} thành đã giao`),
          }
        );
        setConfirmModal((m) => ({ ...m, isOpen: false }));
      },
    });
  };

  const handleGenerateLabel = (orderId) => {
    toast.info(
      `Đang tạo mã vận đơn từ đơn vị vận chuyển cho đơn ${orderId}...`
    );
    // NOTE: No BE endpoint for shipping labels; this is a placeholder
    toast.success('Tính năng tạo vận đơn chưa được tích hợp API');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#222]">Giao vận & Tracking</h1>
        <p className="text-[#4f5562]">
          Quản lý hành trình đơn hàng và đơn vị vận chuyển
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => { setStatusFilter('SHIPPED'); setPage(1); }}
          className={`bg-white rounded-2xl p-6 shadow-sm border cursor-pointer transition ${statusFilter === 'SHIPPED' ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-100 hover:border-orange-200'}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {
                  shippingOrders.filter(
                    (o) => (o.status || '').toUpperCase() === 'SHIPPED'
                  ).length
                }
              </p>
              <p className="text-sm text-[#4f5562] font-medium">
                Đang giao hàng
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div
          onClick={() => { setStatusFilter('DELIVERED'); setPage(1); }}
          className={`bg-white rounded-2xl p-6 shadow-sm border cursor-pointer transition ${statusFilter === 'DELIVERED' ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-100 hover:border-green-200'}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {
                  shippingOrders.filter(
                    (o) => (o.status || '').toUpperCase() === 'DELIVERED'
                  ).length
                }
              </p>
              <p className="text-sm text-[#4f5562] font-medium">
                Đã giao thành công
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div
          onClick={() => { setStatusFilter('all'); setPage(1); }}
          className={`bg-white rounded-2xl p-6 shadow-sm border cursor-pointer transition ${statusFilter === 'all' ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100 hover:border-blue-200'}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold text-[#d90f0f]">
                {shippingOrders.length}
              </p>
              <p className="text-sm text-[#4f5562] font-medium">Tổng vận đơn</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <MapPin className="w-6 h-6 text-[#d90f0f]" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, mã vận đơn (GHN, GHTK)..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-[#f9f9f9] border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0f5dd9] text-sm"
            />
          </div>
          
          <select
            value={sortParam}
            onChange={(e) => { setSortParam(e.target.value); setPage(1); }}
            className="bg-[#f9f9f9] border border-gray-200 rounded-full px-6 py-3 text-sm focus:outline-none"
          >
            <option value="date_desc">Ngày mới nhất</option>
            <option value="date_asc">Ngày cũ nhất</option>
            <option value="amount_desc">Tổng tiền giảm dần</option>
            <option value="amount_asc">Tổng tiền tăng dần</option>
            <option value="name_asc">Tên A-Z</option>
            <option value="name_desc">Tên Z-A</option>
          </select>

          <select
            value={carrierFilter}
            onChange={(e) => { setCarrierFilter(e.target.value); setPage(1); }}
            className="bg-[#f9f9f9] border border-gray-200 rounded-full px-6 py-3 text-sm focus:outline-none"
          >
            <option value="all">Tất cả đơn vị</option>
            {SHIPPING_CARRIERS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {paginatedOrders.map((order) => (
          <div
            key={order.orderId || order.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${(order.status || '').toUpperCase() === 'DELIVERED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}
                >
                  <Truck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-[#222]">
                      {order.code || order.orderId || order.id}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        (order.status || '').toUpperCase() === 'DELIVERED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {(order.status || '').toUpperCase() === 'DELIVERED'
                        ? 'Đã giao'
                        : 'Đang giao'}
                    </span>
                  </div>
                  <p className="text-sm text-[#4f5562] mt-0.5">
                    {order.recipientName} • {order.shippingPhone}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-lg font-bold text-[#222]">
                  {formatCurrency(order.finalAmount || order.totalAmount)}
                </p>
                {order.shippingFee != null && order.shippingFee > 0 && (
                  <p className="text-xs text-orange-500 font-medium">
                    (Phí ship: {formatCurrency(order.shippingFee)})
                  </p>
                )}
                <p className="text-xs text-[#4f5562]">
                  {new Date(order.createdAt).toLocaleString('vi-VN', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-4 mb-4">
              <div className="lg:col-span-2">
                <div className="bg-[#fcfcfc] rounded-xl p-4 border border-gray-50 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-[#d90f0f]" />
                    <p className="text-sm font-bold text-[#222]">
                      Hành trình vận chuyển
                    </p>
                  </div>

                  {/* Timeline */}
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                    <div className="relative">
                      <div className="absolute -left-5 top-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                      <p className="text-xs font-bold text-[#222]">
                        Đã lấy hàng thành công
                      </p>
                      <p className="text-[10px] text-[#4f5562]">
                        Kho tổng CClearly
                      </p>
                    </div>
                    <div className="relative">
                      <div
                        className={`absolute -left-5 top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${(order.status || '').toUpperCase() === 'DELIVERED' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}
                      ></div>
                      <p className="text-xs font-bold text-[#222]">
                        {(order.status || '').toUpperCase() === 'DELIVERED'
                          ? 'Giao hàng thành công'
                          : 'Đang vận chuyển'}
                      </p>
                      <p className="text-[10px] text-[#4f5562]">
                        Cập nhật lần cuối •{' '}
                        {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-[#fcfcfc] rounded-xl p-4 border border-gray-50 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="w-4 h-4 text-[#d90f0f]" />
                    <p className="text-sm font-bold text-[#222]">
                      Thông tin vận đơn
                    </p>
                  </div>
                  <div className="space-y-4 flex-1">
                    <div>
                      <p className="text-[10px] text-[#4f5562] uppercase font-bold tracking-wider">
                        Đơn vị vận chuyển
                      </p>
                      <p className="text-sm font-medium text-[#222]">
                        {(() => {
                          const tn = order.trackingNumber || '';
                          const match = tn.match(/^\[(.+?)\]/);
                          return match ? match[1] : 'Chưa chỉ định';
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#4f5562] uppercase font-bold tracking-wider">
                        Mã vận đơn
                      </p>
                      {order.trackingNumber ? (
                        <p className="text-sm font-mono font-bold text-[#d90f0f] bg-blue-50 px-2 py-1 rounded inline-block mt-1">
                          {order.trackingNumber.replace(/^\[.+?\]\s*/, '')}
                        </p>
                      ) : (
                        <p className="text-sm text-red-500 italic mt-1">
                          Chưa cập nhật
                        </p>
                      )}
                    </div>
                  </div>
                  {order.trackingNumber && (
                    <button className="mt-4 w-full text-[11px] font-bold text-[#d90f0f] flex items-center justify-center gap-1 hover:underline">
                      Xem hành trình thực tế
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <div className="bg-[#fcfcfc] rounded-xl p-4 border border-gray-50 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-4 h-4 text-[#d90f0f]" />
                    <p className="text-sm font-bold text-[#222]">Thanh toán</p>
                  </div>
                  <div className="space-y-2 flex-1">
                    <div>
                      <p className="text-[10px] text-[#4f5562] uppercase font-bold tracking-wider">
                        Hình thức
                      </p>
                      <p className="text-sm font-medium text-[#222]">
                        {order.paymentMethod === 'PAYOS'
                          ? 'Chuyển khoản (PayOS)'
                          : order.paymentMethod === 'COD'
                            ? 'Thanh toán khi nhận hàng'
                            : order.paymentMethod === 'BANK_TRANSFER'
                              ? 'Chuyển khoản'
                              : order.isPreorder
                                ? 'Đặt cọc + COD'
                                : order.paymentMethod || 'Chưa xác định'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#4f5562] uppercase font-bold tracking-wider">
                        Đã thanh toán
                      </p>
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency(order.paidAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#4f5562] uppercase font-bold tracking-wider">
                        Cần thu (COD)
                      </p>
                      <p
                        className={`text-sm font-bold ${(order.codAmount || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}
                      >
                        {(order.codAmount || 0) > 0
                          ? formatCurrency(order.codAmount)
                          : 'Đã thanh toán đủ'}
                      </p>
                    </div>
                    {order.shippingFee != null && (
                      <div>
                        <p className="text-[10px] text-[#4f5562] uppercase font-bold tracking-wider">
                          Phí vận chuyển
                        </p>
                        <p
                          className={`text-sm font-bold ${order.shippingFee > 0 ? 'text-orange-600' : 'text-green-600'}`}
                        >
                          {order.shippingFee > 0
                            ? formatCurrency(order.shippingFee)
                            : 'Miễn phí'}
                        </p>
                      </div>
                    )}
                    {order.isPreorder && (
                      <div className="mt-1 px-2 py-1 bg-blue-50 rounded-lg">
                        <p className="text-[10px] font-bold text-red-700">
                          <Banknote className="w-3 h-3 inline mr-1" />
                          Đơn Pre-order — Đặt cọc 50%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 font-bold items-center">
              {!order.trackingNumber ? (
                <button
                  onClick={() => handleGenerateLabel(order.orderId || order.id)}
                  className="bg-[#361414] text-white px-6 py-3 rounded-full text-sm hover:bg-black transition flex items-center gap-2"
                >
                  <Package className="w-4 h-4" /> Lấy mã vận đơn (GHN/GHTK)
                </button>
              ) : (
                <button
                  className="bg-gray-100 text-gray-500 px-6 py-3 rounded-full text-sm cursor-not-allowed flex items-center gap-2"
                  disabled
                >
                  <CheckCircle className="w-4 h-4" /> Đã lấy vận đơn
                </button>
              )}

              {(order.status || '').toUpperCase() !== 'DELIVERED' && (
                <button
                  onClick={() => handleUpdateStatus(order.orderId || order.id)}
                  className="bg-[#d90f0f] text-white px-6 py-3 rounded-full text-sm hover:bg-[#b00c0c] transition"
                >
                  Xác nhận giao thành công
                </button>
              )}

              <button
                onClick={() => setSelectedOrder(order)}
                className="flex items-center gap-2 text-sm text-[#4f5562] hover:text-[#222] transition"
              >
                <Eye className="w-4 h-4" /> Xem chi tiết
              </button>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-[#4f5562] font-medium">
              Không tìm thấy đơn hàng nào khớp với tìm kiếm
            </p>
          </div>
        )}
      </div>

      {/* pagination */}
      {totalItems > 0 && (
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
            <span className="text-sm text-gray-500">/ {totalItems} kết quả</span>
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((m) => ({ ...m, isOpen: false }))}
      />

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

export default OperationsShippingPage;

