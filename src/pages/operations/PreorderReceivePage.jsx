// Nhận hàng Pre-order — Operations Staff
import {
  Package,
  Truck,
  Check,
  Search,
  AlertCircle,
  Clock,
  Eye,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/ConfirmModal';
import OrderDetailModal from '@/components/sale/OrderDetailModal';
import Pagination from '@/components/ui/Pagination';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useOrder';

const PAGE_SIZES = [5, 10, 15, 20, 30, 50];

const PreorderReceivePage = () => {
  const { data: orderData, isLoading } = useAdminOrders({ size: 1000 });
  const updateStatusMutation = useUpdateOrderStatus();
  const orders = orderData?.items || orderData || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | waiting | overdue | received
  const [sortParam, setSortParam] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
  });

  // Filter preorder orders only
  const preorderOrders = useMemo(() => {
    return orders.filter((o) => o.isPreorder === true);
  }, [orders]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Categorize preorder orders
  const stats = useMemo(() => {
    const waiting = preorderOrders.filter((o) => {
      const s = (o.status || '').toUpperCase();
      return s === 'PENDING' || s === 'CONFIRMED';
    });

    const overdue = waiting.filter((o) => {
      if (!o.preorderDeadline) return false;
      const deadline = new Date(o.preorderDeadline);
      return deadline < today;
    });

    const received = preorderOrders.filter((o) => {
      const s = (o.status || '').toUpperCase();
      return s === 'PROCESSING' || s === 'SHIPPED' || s === 'DELIVERED';
    });

    return { waiting: waiting.length, overdue: overdue.length, received: received.length };
  }, [preorderOrders]);

  // Apply filters
  const filteredOrders = useMemo(() => {
    let result = preorderOrders;

    // Status filter
    if (statusFilter === 'waiting') {
      result = result.filter((o) => {
        const s = (o.status || '').toUpperCase();
        return s === 'PENDING' || s === 'CONFIRMED';
      });
    } else if (statusFilter === 'overdue') {
      result = result.filter((o) => {
        const s = (o.status || '').toUpperCase();
        if (s !== 'PENDING' && s !== 'CONFIRMED') return false;
        if (!o.preorderDeadline) return false;
        return new Date(o.preorderDeadline) < today;
      });
    } else if (statusFilter === 'received') {
      result = result.filter((o) => {
        const s = (o.status || '').toUpperCase();
        return s === 'PROCESSING' || s === 'SHIPPED' || s === 'DELIVERED';
      });
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((o) => {
        const code = (o.code || o.orderId || '').toString().toLowerCase();
        const name = (o.recipientName || '').toLowerCase();
        const sku = (o.items || []).map((i) => (i.variantSku || '').toLowerCase()).join(' ');
        return code.includes(term) || name.includes(term) || sku.includes(term);
      });
    }

    // Sort
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
  }, [preorderOrders, statusFilter, searchTerm, sortParam]);

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;
    const d = new Date(deadline);
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleReceiveStock = (order) => {
    setConfirmModal({
      isOpen: true,
      type: 'info',
      title: 'Xác nhận nhập kho',
      message: `Xác nhận rằng hàng pre-order cho đơn ${order.code || order.orderId} đã về kho và sẵn sàng xử lý?`,
      onConfirm: () => {
        updateStatusMutation.mutate(
          { id: order.orderId || order.id, status: 'PROCESSING' },
          {
            onSuccess: () =>
              toast.success(`Đã xác nhận nhập kho cho đơn ${order.code || order.orderId}`),
            onError: () => toast.error('Có lỗi xảy ra khi cập nhật trạng thái'),
          }
        );
        setConfirmModal((m) => ({ ...m, isOpen: false }));
      },
    });
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    const map = {
      PENDING: { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-700' },
      CONFIRMED: { label: 'Chờ hàng về', cls: 'bg-red-100 text-red-700' },
      PROCESSING: { label: 'Đang xử lý', cls: 'bg-purple-100 text-purple-700' },
      SHIPPED: { label: 'Đã giao', cls: 'bg-orange-100 text-orange-700' },
      DELIVERED: { label: 'Hoàn thành', cls: 'bg-green-100 text-green-700' },
      CANCELLED: { label: 'Đã hủy', cls: 'bg-red-100 text-red-700' },
    };
    const info = map[s] || { label: s, cls: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${info.cls}`}>
        {info.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d90f0f]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#222]">Nhận hàng Pre-order</h1>
        <p className="text-[#4f5562]">
          Cập nhật hàng về kho cho các đơn đặt trước
        </p>
      </div>

      {/* Stats Cards — clickable filters */}
      <div className="grid md:grid-cols-3 gap-4">
        <div
          onClick={() => { setStatusFilter('waiting'); setPage(1); }}
          className={`bg-white p-6 rounded-2xl shadow-sm border cursor-pointer transition ${
            statusFilter === 'waiting' ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-100 hover:border-red-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold text-[#d90f0f]">{stats.waiting}</p>
              <p className="text-sm text-[#4f5562] font-medium">Đang chờ hàng về</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Clock className="w-6 h-6 text-[#d90f0f]" />
            </div>
          </div>
        </div>

        <div
          onClick={() => { setStatusFilter('overdue'); setPage(1); }}
          className={`bg-white p-6 rounded-2xl shadow-sm border cursor-pointer transition ${
            statusFilter === 'overdue' ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-100 hover:border-red-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold text-red-500">{stats.overdue}</p>
              <p className="text-sm text-[#4f5562] font-medium">Trễ hẹn (SLA)</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div
          onClick={() => { setStatusFilter('received'); setPage(1); }}
          className={`bg-white p-6 rounded-2xl shadow-sm border cursor-pointer transition ${
            statusFilter === 'received' ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-100 hover:border-green-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold text-emerald-600">{stats.received}</p>
              <p className="text-sm text-[#4f5562] font-medium">Đã nhập kho</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Sort & Filter UI */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder="Tìm theo mã đơn, tên khách, SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#f9f9f9] border border-gray-200 rounded-full px-6 py-3 text-sm focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="waiting">Đang chờ hàng về</option>
            <option value="overdue">Trễ hẹn (SLA)</option>
            <option value="received">Đã nhập kho</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-[#f9f9f9]/50">
          <h2 className="font-bold text-[#222]">
            Đơn Pre-order ({totalItems})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 border-b border-gray-50 uppercase text-[10px] font-bold">
                <th className="p-4">Mã đơn</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Sản phẩm</th>
                <th className="p-4">Thanh toán</th>
                <th className="p-4">Hạn giao</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedOrders.map((order) => {
                const daysLeft = getDaysLeft(order.preorderDeadline);
                const isWaiting =
                  (order.status || '').toUpperCase() === 'PENDING' ||
                  (order.status || '').toUpperCase() === 'CONFIRMED';
                const isOverdue = isWaiting && daysLeft !== null && daysLeft < 0;

                return (
                  <tr
                    key={order.orderId || order.id}
                    className={`hover:bg-gray-50/50 ${isOverdue ? 'bg-red-50/30' : ''}`}
                  >
                    {/* Code */}
                    <td className="p-4">
                      <p className="font-bold text-[#222]">
                        {order.code || order.orderId}
                      </p>
                      <p className="text-[11px] text-[#4f5562]">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <p className="font-medium text-[#222]">{order.recipientName || '—'}</p>
                      <p className="text-[11px] text-[#4f5562]">{order.customerEmail || ''}</p>
                    </td>

                    {/* Products */}
                    <td className="p-4">
                      {(order.items || []).slice(0, 2).map((item, idx) => (
                        <div key={idx} className="mb-1">
                          <p className="text-xs font-medium text-[#222] truncate max-w-[200px]">
                            {item.productName}
                          </p>
                          <p className="text-[10px] text-[#4f5562]">{item.variantSku}</p>
                        </div>
                      ))}
                      {(order.items || []).length > 2 && (
                        <p className="text-[10px] text-[#4f5562]">
                          +{order.items.length - 2} sản phẩm khác
                        </p>
                      )}
                    </td>

                    {/* Payment */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#4f5562]" />
                        <span className="text-xs font-medium">
                          Đặt cọc + COD
                        </span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        <p className="text-[11px] text-green-600 font-bold">
                          Đã cọc: {formatCurrency(order.paidAmount || 0)}
                        </p>
                        <p className="text-[11px] text-orange-600 font-bold">
                          Cần thu: {formatCurrency(order.codAmount || 0)}
                        </p>
                      </div>
                      <p className="text-[10px] text-[#4f5562] mt-0.5">
                        Tổng: {formatCurrency(order.finalAmount)}
                      </p>
                    </td>

                    {/* Deadline */}
                    <td className="p-4">
                      {order.preorderDeadline ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#4f5562]" />
                            <span className="text-xs">
                              {new Date(order.preorderDeadline).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          {isWaiting && daysLeft !== null && (
                            <p
                              className={`text-[10px] font-bold mt-1 ${
                                isOverdue
                                  ? 'text-red-500'
                                  : daysLeft <= 2
                                  ? 'text-orange-500'
                                  : 'text-green-600'
                              }`}
                            >
                              {isOverdue
                                ? `Trễ ${Math.abs(daysLeft)} ngày`
                                : daysLeft === 0
                                ? 'Hôm nay'
                                : `Còn ${daysLeft} ngày`}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[#4f5562]">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">{getStatusBadge(order.status)}</td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isWaiting && (
                          <button
                            onClick={() => handleReceiveStock(order)}
                            className="bg-[#d90f0f] text-white px-4 py-1.5 rounded-full text-[11px] font-bold hover:bg-[#0d4fb8] flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Nhập kho
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-full hover:bg-gray-100 transition"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4 text-[#4f5562]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-[#4f5562] font-medium">
              {preorderOrders.length === 0
                ? 'Chưa có đơn pre-order nào'
                : 'Không tìm thấy đơn pre-order khớp với bộ lọc'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
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

      {/* Confirm Modal */}
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

export default PreorderReceivePage;

