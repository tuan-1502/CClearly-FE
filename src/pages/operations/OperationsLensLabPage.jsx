// Operations Lens Lab Page - Gia công tròng kính
import { TestTube, CheckCircle, XCircle, Eye, Truck, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import OrderDetailModal from '@/components/sale/OrderDetailModal';
import Pagination from '@/components/ui/Pagination';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useOrder';

const SHIPPING_CARRIERS = [
  { value: 'Giao hàng tiết kiệm', label: 'Giao hàng tiết kiệm' },
  { value: 'Giao hàng nhanh', label: 'Giao hàng nhanh' },
];

const PAGE_SIZES = [6, 12, 18, 30, 60];

const OperationsLensLabPage = () => {
  const { user } = useAuth();
  const { data: orderData } = useAdminOrders({ size: 1000 });
  const updateStatusMutation = useUpdateOrderStatus();
  const orders = orderData?.items || orderData || [];

  const [qcFailModal, setQcFailModal] = useState({
    isOpen: false,
    orderId: null,
    reason: '',
  });
  const [trackingModal, setTrackingModal] = useState({
    isOpen: false,
    orderId: null,
    tracking: '',
    carrier: '',
  });
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortParam, setSortParam] = useState('date_desc');
  const [statusFilter, setStatusFilter] = useState('all');

  // Lọc đơn prescription đang ở trạng thái gia công (PROCESSING + type=prescription)
  const basePrescriptionOrders = useMemo(() => {
    return orders.filter((o) => {
      const status = (o.status || '').toUpperCase();
      return (
        o.type === 'prescription' &&
        (status === 'PROCESSING' || status === 'CONFIRMED')
      );
    });
  }, [orders]);

  const prescriptionOrders = useMemo(() => {
    let result = basePrescriptionOrders.filter((order) => {
      const id = (order.code || order.orderId || order.id || '').toString().toLowerCase();
      const name = (order.recipientName || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      const matchSearch = id.includes(term) || name.includes(term);

      const s = (order.status || '').toUpperCase();
      if (statusFilter !== 'all' && s !== statusFilter) return false;

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
  }, [basePrescriptionOrders, searchTerm, statusFilter, sortParam]);

  const confirmedCount = basePrescriptionOrders.filter(
    (o) => (o.status || '').toUpperCase() === 'CONFIRMED'
  ).length;
  const processingCount = basePrescriptionOrders.filter(
    (o) => (o.status || '').toUpperCase() === 'PROCESSING'
  ).length;

  const totalItems = prescriptionOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  const paginatedOrders = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return prescriptionOrders.slice(startIndex, startIndex + pageSize);
  }, [prescriptionOrders, page, pageSize]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    const map = {
      CONFIRMED: { label: 'Chờ gia công', class: 'bg-red-100 text-red-800' },
      PROCESSING: { label: 'Đang gia công', class: 'bg-purple-100 text-purple-800' },
    };
    return map[s] || { label: status, class: 'bg-gray-100 text-gray-800' };
  };

  const handleStartWork = (order) => {
    updateStatusMutation.mutate(
      { id: order.orderId, status: 'PROCESSING' },
      {
        onSuccess: () =>
          toast.success(`Đã bắt đầu gia công đơn ${order.code || order.orderId}`),
      }
    );
  };

  const handleQcPass = (order) => {
    // QC Pass → mở tracking modal để tạo vận đơn → SHIPPED
    setTrackingModal({
      isOpen: true,
      orderId: order.orderId,
      tracking: '',
      carrier: '',
    });
  };

  const handleQcFail = (order) => {
    setQcFailModal({ isOpen: true, orderId: order.orderId, reason: '' });
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
    updateStatusMutation.mutate(
      {
        id: trackingModal.orderId,
        status: 'SHIPPED',
        note: `[${trackingModal.carrier}] ${trackingModal.tracking.trim()}`,
      },
      {
        onSuccess: () => toast.success('QC Pass - Đã tạo vận đơn thành công'),
      }
    );
    setTrackingModal({ isOpen: false, orderId: null, tracking: '', carrier: '' });
  };

  const confirmQCFail = () => {
    if (qcFailModal.reason.trim()) {
      toast.warning(
        `Đơn ${qcFailModal.orderId} fail QC: ${qcFailModal.reason}. Yêu cầu gia công lại.`
      );
      setQcFailModal({ isOpen: false, orderId: null, reason: '' });
    } else {
      toast.error('Vui lòng nhập lý do fail QC');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#222]">Gia công tròng kính</h1>
        <p className="text-[#4f5562]">
          Xin chào, {user?.name || 'Operations'}!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold text-blue-600">{confirmedCount}</p>
              <p className="text-sm text-[#4f5562] font-medium">Chờ gia công</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl flex items-center justify-center">
              <TestTube className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold text-purple-600">{processingCount}</p>
              <p className="text-sm text-[#4f5562] font-medium">Đang gia công</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl flex items-center justify-center">
              <TestTube className="w-6 h-6 text-purple-600" />
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
              placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
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
            <option value="all">Tất cả</option>
            <option value="CONFIRMED">Chờ gia công</option>
            <option value="PROCESSING">Đang gia công</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paginatedOrders.map((order) => {
          const s = (order.status || '').toUpperCase();
          const statusBadge = getStatusBadge(order.status);
          return (
            <div key={order.orderId} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <TestTube className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#222]">
                        {order.code || order.orderId}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                        Có toa kính
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${statusBadge.class}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-sm text-[#4f5562]">
                      {order.recipientName} - {order.shippingPhone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-5 h-5 text-gray-500" />
                  </button>
                  <div className="text-right">
                    <p className="font-bold text-[#222]">
                      {formatCurrency(order.finalAmount)}
                    </p>
                    <p className="text-xs text-[#4f5562]">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rx Info — hiển thị thông số toa từ items có prescription */}
              {order.items
                ?.filter((item) => item.prescription)
                .map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="font-medium text-[#222] mb-2">
                      Thông số đơn kính (Rx) - {item.productName}:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[#4f5562]">Mắt phải (OD):</p>
                        <p className="font-medium">
                          SPH: {item.prescription.sphOd} | CYL:{' '}
                          {item.prescription.cylOd} | AXIS:{' '}
                          {item.prescription.axisOd}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#4f5562]">Mắt trái (OS):</p>
                        <p className="font-medium">
                          SPH: {item.prescription.sphOs} | CYL:{' '}
                          {item.prescription.cylOs} | AXIS:{' '}
                          {item.prescription.axisOs}
                        </p>
                      </div>
                      {item.prescription.pd && (
                        <div>
                          <p className="text-[#4f5562]">
                            Khoảng cách đồng tử (PD):
                          </p>
                          <p className="font-medium">
                            {item.prescription.pd}mm
                          </p>
                        </div>
                      )}
                      {(item.prescription.addOd || item.prescription.addOs) && (
                        <div>
                          <p className="text-[#4f5562]">ADD:</p>
                          <p className="font-medium">
                            OD: +{item.prescription.addOd} | OS: +
                            {item.prescription.addOs}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              {/* Items */}
              <div className="border-t pt-4 mb-4">
                <p className="text-sm font-medium text-[#222] mb-2">
                  Sản phẩm:
                </p>
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span className="text-[#4f5562]">
                      {item.productName || item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatCurrency((item.unitPrice || item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {s === 'CONFIRMED' && (
                <button
                  onClick={() => handleStartWork(order)}
                  className="w-full bg-purple-500 text-white py-2 rounded-xl font-medium hover:bg-purple-600"
                >
                  Bắt đầu gia công
                </button>
              )}
              {s === 'PROCESSING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQcPass(order)}
                    className="flex-1 bg-green-500 text-white py-2 rounded-xl font-medium hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> QC Pass
                  </button>
                  <button
                    onClick={() => handleQcFail(order)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-xl font-medium hover:bg-red-600 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> QC Fail
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {prescriptionOrders.length === 0 && (
          <div className="text-center py-12 text-[#4f5562] bg-white rounded-xl">
            Không có đơn Rx nào cần xử lý
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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

      {/* QC Fail Modal */}
      {qcFailModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() =>
              setQcFailModal({ isOpen: false, orderId: null, reason: '' })
            }
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[#222] mb-4">
              QC Fail - Nhập lý do
            </h3>
            <textarea
              placeholder="Nhập lý do fail QC..."
              value={qcFailModal.reason}
              onChange={(e) =>
                setQcFailModal({ ...qcFailModal, reason: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-xl mb-4 h-24 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setQcFailModal({ isOpen: false, orderId: null, reason: '' })
                }
                className="flex-1 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={confirmQCFail}
                className="flex-1 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
              >
                Xác nhận Fail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal (when QC Pass) */}
      {trackingModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() =>
              setTrackingModal({ isOpen: false, orderId: null, tracking: '', carrier: '' })
            }
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-[#222]">
              QC Pass - Tạo vận đơn
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị giao hàng <span className="text-red-500">*</span>
              </label>
              <select
                value={trackingModal.carrier}
                onChange={(e) =>
                  setTrackingModal((m) => ({ ...m, carrier: e.target.value }))
                }
                className="w-full border p-2 rounded-xl"
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
                className="w-full border p-2 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setTrackingModal({ isOpen: false, orderId: null, tracking: '', carrier: '' })
                }
                className="flex-1 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleTrackingConfirm}
                className="flex-1 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" /> Xác nhận gửi hàng
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

export default OperationsLensLabPage;

