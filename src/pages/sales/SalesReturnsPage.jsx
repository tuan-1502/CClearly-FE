// Sales Returns Page - Xử lý đổi trả & khiếu nại
import {
  Search,
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  Package,
  Filter,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  useReturns,
  useApproveReturn,
  useRejectReturn,
  useCompleteReturn,
} from '@/hooks/useReturn';

const STATUS_MAP = {
  PENDING: {
    label: 'Chờ xử lý',
    css: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
  },
  APPROVED: {
    label: 'Đã duyệt',
    css: 'bg-red-100 text-red-700 border-red-200',
    icon: CheckCircle,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    css: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
  },
  REJECTED: {
    label: 'Từ chối',
    css: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
  },
};

const TYPE_MAP = {
  refund: {
    label: 'Hoàn tiền',
    css: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  return: {
    label: 'Đổi hàng',
    css: 'bg-purple-100 text-purple-700 border-purple-200',
  },
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    amount || 0
  );

const SalesReturnsPage = () => {
  const { user } = useAuth();
  const { data: returns = [], isLoading } = useReturns();
  const approveReturnMutation = useApproveReturn();
  const rejectReturnMutation = useRejectReturn();
  const completeReturnMutation = useCompleteReturn();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: null,
  });

  // --- Derived data ---
  const filteredReturns = returns.filter((ret) => {
    const retId = String(ret.refundId || ret.id || '');
    const orderId = String(ret.orderCode || ret.orderId || '');
    
    // Search in: refund ID, order ID, customer name, phone, email, product name
    const matchesSearch =
      retId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.customerPhone?.includes(searchTerm) ||
      ret.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.items?.some(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
    
    // Date range filter
    let matchesDate = true;
    if (startDate || endDate) {
      const retDate = new Date(ret.requestDate);
      if (startDate) {
        const start = new Date(startDate);
        matchesDate = matchesDate && retDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && retDate <= end;
      }
    }
    
    // Price range filter
    let matchesPrice = true;
    if (minPrice || maxPrice) {
      const amount = Number(ret.refundAmount || 0);
      if (minPrice) {
        matchesPrice = matchesPrice && amount >= parseFloat(minPrice);
      }
      if (maxPrice) {
        matchesPrice = matchesPrice && amount <= parseFloat(maxPrice);
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate && matchesPrice;
  });

  const stats = [
    {
      label: 'Chờ xử lý',
      val: returns.filter((r) => r.status === 'PENDING').length,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Đã duyệt',
      val: returns.filter((r) => r.status === 'APPROVED').length,
      icon: CheckCircle,
      color: 'text-red-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Hoàn thành',
      val: returns.filter((r) => r.status === 'COMPLETED').length,
      icon: Package,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Tổng yêu cầu',
      val: returns.length,
      icon: RotateCcw,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
  ];

  // --- Helpers ---
  const getStatusInfo = (status) =>
    STATUS_MAP[status] || {
      label: status,
      css: 'bg-gray-100 text-gray-600',
      icon: Clock,
    };

  const getTypeInfo = (type) =>
    TYPE_MAP[type] || { label: type || '—', css: 'bg-gray-100 text-gray-600' };

  // --- Handlers ---
  const handleApprove = (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'success',
      title: 'Duyệt yêu cầu',
      message: 'Bạn có muốn duyệt yêu cầu đổi trả này không?',
      onConfirm: () => {
        approveReturnMutation.mutate(id, {
          onSettled: () =>
            setConfirmModal((prev) => ({ ...prev, isOpen: false })),
        });
      },
    });
  };

  const handleReject = (id) => {
    setRejectReason('');
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Từ chối yêu cầu',
      message: 'Bạn có chắc chắn muốn từ chối yêu cầu đổi trả này?',
      onConfirm: () => {
        rejectReturnMutation.mutate(
          { id, reason: rejectReason || 'Từ chối bởi nhân viên' },
          {
            onSettled: () =>
              setConfirmModal((prev) => ({ ...prev, isOpen: false })),
          }
        );
      },
    });
  };

  const handleComplete = (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'success',
      title: 'Hoàn thành xử lý',
      message: 'Đánh dấu yêu cầu này đã hoàn thành xử lý?',
      onConfirm: () => {
        completeReturnMutation.mutate(id, {
          onSettled: () =>
            setConfirmModal((prev) => ({ ...prev, isOpen: false })),
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#222]">Đổi trả & Khiếu nại</h1>
        <p className="text-[#4f5562]">
          Xin chào, {user?.fullName || user?.name || 'Sales'}!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
              <item.icon size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#222]">{item.val}</p>
              <p className="text-xs text-[#4f5562]">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
        {/* Main Search */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm: mã yêu cầu, mã đơn, tên khách, SĐT, email, tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
            />
          </div>
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="outline-none bg-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </div>
        </div>

        {/* Range Filters - Date & Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-[#222] mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Khoảng ngày
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
              />
              <span className="text-gray-400">—</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
              />
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-[#222] mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Khoảng giá hoàn lại (VND)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Từ"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
              />
              <span className="text-gray-400">—</span>
              <input
                type="number"
                placeholder="Đến"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || statusFilter !== 'all' || startDate || endDate || minPrice || maxPrice) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setStartDate('');
              setEndDate('');
              setMinPrice('');
              setMaxPrice('');
            }}
            className="text-sm text-[#d90f0f] hover:text-[#b00c0c] font-medium"
          >
            Xóa tất cả bộ lọc
          </button>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Returns list */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredReturns.map((ret) => {
            const statusInfo = getStatusInfo(ret.status);
            const typeInfo = getTypeInfo(ret.type);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={ret.refundId || ret.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                {/* Card header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <RotateCcw className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[#222] text-sm">
                          #{ret.orderCode || ret.orderId}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${typeInfo.css}`}
                        >
                          {typeInfo.label}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${statusInfo.css}`}
                        >
                          <StatusIcon size={12} />
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#4f5562]">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {ret.requestDate
                            ? new Date(ret.requestDate).toLocaleDateString(
                                'vi-VN'
                              )
                            : '—'}
                        </span>
                        {ret.processedDate && (
                          <span className="flex items-center gap-1">
                            <CheckCircle size={12} />
                            Xử lý:{' '}
                            {new Date(ret.processedDate).toLocaleDateString(
                              'vi-VN'
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#222]">
                      {formatCurrency(Number(ret.refundAmount))}
                    </p>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-5 pb-4 grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#4f5562] uppercase tracking-wider">
                      Khách hàng
                    </p>
                    <div className="space-y-0.5 text-sm text-[#222]">
                      {ret.customerName && (
                        <p className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          {ret.customerName}
                        </p>
                      )}
                      {ret.customerPhone && (
                        <p className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          {ret.customerPhone}
                        </p>
                      )}
                      {ret.customerEmail && (
                        <p className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          {ret.customerEmail}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#4f5562] uppercase tracking-wider">
                      Lý do
                    </p>
                    <p className="text-sm text-[#222]">{ret.reason || '—'}</p>
                  </div>
                </div>

                {/* Items */}
                {ret.items?.length > 0 && (
                  <div className="px-5 pb-4">
                    <p className="text-xs font-semibold text-[#4f5562] uppercase tracking-wider mb-2">
                      Sản phẩm
                    </p>
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      {ret.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-sm px-3 py-2 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-[#222]">
                            {item.name}{' '}
                            <span className="text-[#4f5562]">
                              x{item.quantity}
                            </span>
                          </span>
                          <span className="font-medium text-[#222]">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {ret.status === 'PENDING' && (
                  <div className="px-5 pb-5 flex gap-3">
                    <button
                      onClick={() => handleApprove(ret.refundId || ret.id)}
                      disabled={approveReturnMutation.isPending}
                      className="flex-1 bg-green-500 text-white py-2.5 rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Duyệt
                    </button>
                    <button
                      onClick={() => handleReject(ret.refundId || ret.id)}
                      disabled={rejectReturnMutation.isPending}
                      className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Từ chối
                    </button>
                  </div>
                )}
                {ret.status === 'APPROVED' && (
                  <div className="px-5 pb-5">
                    <button
                      onClick={() => handleComplete(ret.refundId || ret.id)}
                      disabled={completeReturnMutation.isPending}
                      className="w-full bg-[#d90f0f] text-white py-2.5 rounded-xl font-medium hover:bg-[#b00c0c] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                    >
                      <DollarSign className="w-4 h-4" /> Hoàn thành xử lý
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {filteredReturns.length === 0 && !isLoading && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-[#4f5562] font-medium">
                Không tìm thấy yêu cầu nào
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.type === 'danger' ? 'Từ chối' : 'Xác nhận'}
      />
    </div>
  );
};

export default SalesReturnsPage;

