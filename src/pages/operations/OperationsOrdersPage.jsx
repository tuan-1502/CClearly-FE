import { Search, Package, Truck, CheckCircle, Eye } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/ConfirmModal';
import OrderDetailModal from '@/components/sale/OrderDetailModal';
import Pagination from '@/components/ui/Pagination';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useOrder';

const PAGE_SIZES = [5, 10, 15, 20, 30, 50];

const OperationsOrdersPage = () => {
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortParam, setSortParam] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: ordersData } = useAdminOrders({
    status: status !== 'all' ? status : undefined,
    page: page,
    size: pageSize,
  });
  const orders = ordersData?.items || ordersData || [];
  const totalItems = ordersData?.meta?.totalElements || orders.length;
  const totalPages = ordersData?.meta?.totalPages || Math.ceil(totalItems / pageSize);

  const updateOrderStatusMutation = useUpdateOrderStatus();

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    id: null,
    action: null,
  });
  const [trackingModal, setTrackingModal] = useState({
    open: false,
    id: null,
    tracking: '',
    carrier: '',
  });

  const SHIPPING_CARRIERS = [
    { value: 'Giao hàng tiết kiệm', label: 'Giao hàng tiết kiệm' },
    { value: 'Giao hàng nhanh', label: 'Giao hàng nhanh' },
  ];

  const [selectedOrder, setSelectedOrder] = useState(null);

  const currency = (v) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(v);

  const statusMap = {
    PENDING: ['Chờ xác nhận', 'bg-yellow-100 text-yellow-700'],
    CONFIRMED: ['Đã xác nhận', 'bg-red-100 text-red-700'],
    PROCESSING: ['Đang xử lý', 'bg-purple-100 text-purple-700'],
    SHIPPED: ['Đang giao', 'bg-orange-100 text-orange-700'],
    DELIVERED: ['Hoàn thành', 'bg-green-100 text-green-700'],
    CANCELLED: ['Đã hủy', 'bg-red-100 text-red-700'],
    RETURN_REQUESTED: ['Yêu cầu đổi trả', 'bg-pink-100 text-pink-700'],
    RETURNED: ['Đã trả hàng', 'bg-gray-100 text-gray-700'],
  };

  const filtered = useMemo(() => {
    let result = orders.filter((o) => {
      const orderId = o.code || o.orderId || o.id || '';
      const customerName = o.recipientName || o.shippingAddress?.name || '';
      const searchMatch =
        orderId.toLowerCase().includes(search.toLowerCase()) ||
        customerName.toLowerCase().includes(search.toLowerCase());

      return searchMatch;
    });

    result.sort((a, b) => {
      const nameA = (a.recipientName || a.shippingAddress?.name || '').toLowerCase();
      const nameB = (b.recipientName || b.shippingAddress?.name || '').toLowerCase();
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
  }, [orders, search, sortParam]);

  // Pagination is server-side
  const paginated = filtered;

  const handlePageSizeChange = (e) => {
    const newSize = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
    setPageSize(newSize);
    setPage(1);
  };

  const updateStatus = (id, newStatus) => {
    updateOrderStatusMutation.mutate({ id, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold">Xử lý đơn hàng</h1>
        <p className="text-gray-500">Xin chào, {user?.name || 'Operations'}</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
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
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-[#f9f9f9] border border-gray-200 rounded-full px-6 py-3 text-sm focus:outline-none"
          >
            <option value="all">Tất cả</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="SHIPPED">Đang giao</option>
            <option value="DELIVERED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* header */}

        <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-gray-50 text-sm font-semibold text-gray-600">
          <div>Mã đơn</div>
          <div>Khách hàng</div>
          <div>Trạng thái</div>
          <div className="text-right">Tổng tiền</div>
          <div className="text-right">Ngày</div>
          <div className="text-right">Thao tác</div>
        </div>

        {/* rows */}

        {paginated.map((order) => {
          const s = (order.status || '').toUpperCase();
          const [label, color] = statusMap[s] || [
            'Không rõ',
            'bg-gray-100',
          ];

          return (
            <div
              key={order.orderId || order.id}
              className="grid grid-cols-6 gap-4 px-6 py-4 border-t items-center text-sm"
            >
              {/* id */}

              <div className="flex items-center gap-2 font-semibold">
                <Package size={16} className="text-purple-600" />

                {order.code || order.orderId || order.id}
              </div>

              {/* customer */}

              <div>
                <p>{order.recipientName || order.shippingAddress?.name}</p>

                <p className="text-xs text-gray-500">
                  {order.shippingPhone || order.shippingAddress?.phone}
                </p>
              </div>

              {/* status */}

              <div>
                <span className={`px-2 py-0.5 text-xs rounded ${color}`}>
                  {label}
                </span>
              </div>

              {/* price */}

              <div className="text-right font-medium">
                {currency(order.finalAmount || order.totalAmount)}
              </div>

              {/* date */}

              <div className="text-right text-gray-500 text-xs">
                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
              </div>

              {/* actions */}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs flex items-center gap-1 hover:bg-gray-200"
                  title="Xem chi tiết"
                >
                  <Eye size={12} />
                </button>

                {s === 'CONFIRMED' && (
                  <button
                    onClick={() => updateStatus(order.orderId || order.id, 'PROCESSING')}
                    className="bg-purple-500 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1"
                  >
                    <Package size={12} /> Lấy hàng
                  </button>
                )}

                {s === 'PROCESSING' && (
                  <button
                    onClick={() =>
                      setTrackingModal({
                        open: true,
                        id: order.orderId || order.id,
                        tracking: '',
                      })
                    }
                    className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1"
                  >
                    <CheckCircle size={12} /> Giao hàng
                  </button>
                )}

                {s === 'SHIPPED' && (
                  <button
                    onClick={() => updateStatus(order.orderId || order.id, 'DELIVERED')}
                    className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1"
                  >
                    <Truck size={12} /> Xác nhận giao
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!paginated.length && (
        <div className="bg-white rounded-xl py-10 text-center text-gray-500">
          Không tìm thấy đơn hàng
        </div>
      )}

      {/* pagination with page size */}

      {totalItems > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Hiển thị:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
              <option value="all">Tất cả</option>
            </select>
            <span className="text-sm text-gray-500">
              / {totalItems} kết quả
            </span>
          </div>

          {pageSize !== 'all' && totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* tracking modal */}

      {trackingModal.open && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setTrackingModal({ open: false, id: null, tracking: '', carrier: '' })
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
                  setTrackingModal({ ...trackingModal, carrier: e.target.value })
                }
                className="w-full border p-2 rounded"
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
                  setTrackingModal({ ...trackingModal, tracking: e.target.value })
                }
                placeholder="Nhập mã vận đơn"
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setTrackingModal({ open: false, id: null, tracking: '', carrier: '' })
                }
                className="flex-1 bg-gray-200 py-2 rounded"
              >
                Hủy
              </button>

              <button
                onClick={() => {
                  if (!trackingModal.carrier) {
                    toast.error('Vui lòng chọn đơn vị giao hàng');
                    return;
                  }
                  if (!trackingModal.tracking.trim()) {
                    toast.error('Vui lòng nhập mã vận đơn');
                    return;
                  }
                  updateOrderStatusMutation.mutate({
                    id: trackingModal.id,
                    status: 'SHIPPED',
                    note: `[${trackingModal.carrier}] ${trackingModal.tracking.trim()}`,
                  });
                  setTrackingModal({ open: false, id: null, tracking: '', carrier: '' });
                }}
                className="flex-1 bg-red-600 text-white py-2 rounded"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, id: null, action: null })}
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

export default OperationsOrdersPage;

