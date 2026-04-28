// Sales Dashboard Page
import {
  Clock,
  CheckCircle,
  Package,
  Search,
  Filter,
  Eye,
  Truck,
  XCircle,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderDetailModal from '@/components/sale/OrderDetailModal';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminOrders } from '@/hooks/useOrder';

const STATUS_MAP = {
  PENDING: {
    label: 'Chờ xác nhận',
    bg: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Clock,
    color: 'text-yellow-600',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    bg: 'bg-blue-50 text-red-700 border-red-200',
    icon: CheckCircle,
    color: 'text-red-600',
  },
  SHIPPED: {
    label: 'Đang giao hàng',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Truck,
    color: 'text-purple-600',
  },
  DELIVERED: {
    label: 'Đã giao',
    bg: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle,
    color: 'text-green-600',
  },
  CANCELLED: {
    label: 'Đã hủy',
    bg: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
    color: 'text-red-600',
  },
  RETURN_REQUESTED: {
    label: 'Yêu cầu trả hàng',
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: RotateCcw,
    color: 'text-orange-600',
  },
  RETURNED: {
    label: 'Đã trả hàng',
    bg: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: RotateCcw,
    color: 'text-gray-600',
  },
};

const SalesDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: ordersData, isLoading } = useAdminOrders({ size: 1000 });
  const orders = ordersData?.items || [];

  const filteredOrders = orders.filter((order) => {
    const code = order.code || '';
    const recipient = order.recipientName || '';
    const email = order.customerEmail || '';
    const matchesSearch =
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const countByStatus = (status) =>
    orders.filter((o) => o.status === status).length;
  const totalRevenue = orders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + (o.finalAmount || 0), 0);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const s = STATUS_MAP[status] || {
      label: status,
      bg: 'bg-gray-50 text-gray-600 border-gray-200',
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${s.bg}`}
      >
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#222]">Bảng điều khiển</h1>
          <p className="text-[#4f5562]">
            Xin chào, {user?.fullName || user?.name || 'Sales'}!
          </p>
        </div>
        <button
          onClick={() => navigate('/sales/orders')}
          className="px-4 py-2 bg-[#d90f0f] text-white rounded-xl text-sm font-medium hover:bg-[#b00c0c] transition"
        >
          Quản lý đơn hàng
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#222]">
                {countByStatus('PENDING')}
              </p>
              <p className="text-xs text-[#4f5562]">Chờ xác nhận</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#222]">
                {countByStatus('CONFIRMED')}
              </p>
              <p className="text-xs text-[#4f5562]">Đã xác nhận</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#222]">
                {countByStatus('DELIVERED')}
              </p>
              <p className="text-xs text-[#4f5562]">Đã giao</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#222]">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-xs text-[#4f5562]">Doanh thu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm: mã đơn, tên người nhận, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="SHIPPED">Đang giao hàng</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="RETURN_REQUESTED">Yêu cầu trả hàng</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#222]">
            Đơn hàng gần đây ({filteredOrders.length})
          </h3>
          <button
            onClick={() => navigate('/sales/orders')}
            className="text-sm text-[#d90f0f] hover:underline font-medium"
          >
            Xem tất cả →
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/3 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.slice(0, 20).map((order) => {
              const statusInfo = STATUS_MAP[order.status];
              const StatusIcon = statusInfo?.icon || Package;
              return (
                <div
                  key={order.orderId}
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusInfo ? statusInfo.bg.split(' ')[0] : 'bg-gray-100'}`}
                    >
                      <StatusIcon
                        className={`w-6 h-6 ${statusInfo?.color || 'text-gray-500'}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-[#222]">
                        {order.code || order.orderId?.slice(0, 8)}
                      </p>
                      <p className="text-sm text-[#4f5562]">
                        {order.recipientName || order.customerEmail || '—'}
                      </p>
                      <p className="text-xs text-[#4f5562]">
                        {order.items?.length || 0} sản phẩm ·{' '}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-[#222]">
                        {formatCurrency(order.finalAmount)}
                      </p>
                      <div className="mt-1">{getStatusBadge(order.status)}</div>
                    </div>
                    <Eye className="w-5 h-5 text-gray-300 group-hover:text-[#d90f0f] transition shrink-0" />
                  </div>
                </div>
              );
            })}
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-[#4f5562]">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>Không tìm thấy đơn hàng nào</p>
              </div>
            )}
            {filteredOrders.length > 20 && (
              <button
                onClick={() => navigate('/sales/orders')}
                className="w-full py-3 text-center text-sm text-[#d90f0f] font-medium hover:bg-blue-50 rounded-xl transition"
              >
                Xem thêm {filteredOrders.length - 20} đơn hàng →
              </button>
            )}
          </div>
        )}
      </div>

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

export default SalesDashboardPage;

