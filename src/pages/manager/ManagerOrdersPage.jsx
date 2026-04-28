// Manager Orders Page - Synchronized with Operations Board UI/UX
import {
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  Box,
  ShoppingCart,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/ConfirmModal';
import OrderDetailModal from '@/components/sale/OrderDetailModal';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useOrder';

const ManagerOrdersPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortParam, setSortParam] = useState('date_desc');
  const [status, setStatus] = useState('all');

  // Fetch orders (requesting a larger size for the board view)
  const { data: ordersData, isLoading } = useAdminOrders({
    size: 200,
  });
  const allOrders = ordersData?.items || ordersData || [];
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
  });

  // Filter orders by search term
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return allOrders;
    const term = searchTerm.toLowerCase();
    return allOrders.filter((order) => {
      const code = (order.code || order.orderId || '').toLowerCase();
      const name = (order.recipientName || '').toLowerCase();
      return code.includes(term) || name.includes(term);
    });
  }, [allOrders, searchTerm]);

  // Group orders by status
  const groupedOrders = useMemo(() => {
    const groups = {
      PENDING: [],
      CONFIRMED: [],
      PROCESSING: [],
      SHIPPED: [],
      DELIVERED: [],
      CANCELLED: [],
    };

    filteredOrders.forEach((order) => {
      const status = (order.status || 'PENDING').toUpperCase();
      if (groups[status]) {
        groups[status].push(order);
      }
    });

    return groups;
  }, [filteredOrders]);

  const columns = [
    {
      id: 'PENDING',
      title: 'Chờ xác nhận',
      icon: Clock,
      color: 'yellow',
      orders: groupedOrders.PENDING,
    },
    {
      id: 'CONFIRMED',
      title: 'Đã xác nhận',
      icon: CheckCircle,
      color: 'blue',
      orders: groupedOrders.CONFIRMED,
    },
    {
      id: 'PROCESSING',
      title: 'Đang xử lý',
      icon: Box,
      color: 'purple',
      orders: groupedOrders.PROCESSING,
    },
    {
      id: 'SHIPPED',
      title: 'Đang giao',
      icon: Truck,
      color: 'orange',
      orders: groupedOrders.SHIPPED,
    },
    {
      id: 'DELIVERED',
      title: 'Hoàn thành',
      icon: CheckCircle,
      color: 'green',
      orders: groupedOrders.DELIVERED,
    },
    {
      id: 'CANCELLED',
      title: 'Đã hủy',
      icon: XCircle,
      color: 'red',
      orders: groupedOrders.CANCELLED,
    },
  ];

  const colorMap = {
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-600',
      section: 'bg-yellow-100/50',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      section: 'bg-blue-100/50',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      section: 'bg-purple-100/50',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-600',
      section: 'bg-orange-100/50',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      section: 'bg-green-100/50',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600',
      section: 'bg-red-100/50',
    },
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  const handleAction = (order, newStatus, actionTitle) => {
    setConfirmModal({
      isOpen: true,
      type: newStatus === 'CANCELLED' ? 'warning' : 'info',
      title: actionTitle,
      message: `Bạn có chắc chắn muốn chuyển đơn hàng ${order.code || order.orderId} sang trạng thái "${actionTitle}"?`,
      onConfirm: () => {
        updateOrderStatusMutation.mutate({
          id: order.orderId,
          status: newStatus,
        });
        setConfirmModal((m) => ({ ...m, isOpen: false }));
      },
    });
  };

  const renderActions = (order) => {
    const status = (order.status || '').toUpperCase();
    if (status === 'PENDING') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleAction(order, 'CONFIRMED', 'Xác nhận đơn')}
            className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Xác nhận
          </button>
          <button
            onClick={() => handleAction(order, 'CANCELLED', 'Hủy đơn')}
            className="px-3 bg-red-50 text-red-600 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Hủy
          </button>
        </div>
      );
    }
    if (status === 'CONFIRMED') {
      return (
        <button
          onClick={() => handleAction(order, 'PROCESSING', 'Chuyển xử lý')}
          className="w-full bg-purple-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          Chuyển xử lý
        </button>
      );
    }
    return (
      <button
        onClick={() => setSelectedOrder(order)}
        className="w-full border border-gray-200 text-gray-600 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        Xem chi tiết
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#222]">Quản lý đơn hàng</h1>
          <p className="text-[#4f5562]">Xin chào, {user?.name || 'Manager'}!</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm mã đơn, tên khách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#f9f9f9] border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0f5dd9] text-sm"
              />
            </div>

            <select
              value={sortParam}
              onChange={(e) => setSortParam(e.target.value)}
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
              onChange={(e) => setStatus(e.target.value)}
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
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {columns.map((col) => {
          const style = colorMap[col.color];
          return (
            <div
              key={col.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.bg}`}
              >
                <col.icon className={`w-5 h-5 ${style.text}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{col.title}</p>
                <p className={`text-xl font-bold ${style.text}`}>
                  {col.orders.length}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Board - Swimlanes */}
      <div className="space-y-8">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`rounded-2xl p-4 md:p-6 border ${colorMap[column.color].border} ${colorMap[column.color].section}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`p-2 rounded-lg bg-white shadow-sm ${colorMap[column.color].text}`}
              >
                <column.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#222] text-lg">{column.title}</h3>
              <span className="bg-white/80 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                {column.orders.length}
              </span>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-4 min-h-[200px] custom-scrollbar scroll-smooth">
              {column.orders.map((order) => (
                <div
                  key={order.orderId || order.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-[300px] w-[300px] shrink-0 flex flex-col hover:shadow-md transition-shadow group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Mã đơn hàng
                      </span>
                      <p className="font-bold text-[#222] text-lg">
                        {order.code || order.orderId}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                        {order.recipientName?.charAt(0) || 'C'}
                      </div>
                      <span className="text-[#4f5562] font-medium truncate">
                        {order.recipientName}
                      </span>
                    </div>

                    {order.type === 'prescription' && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-50 border border-red-100 w-fit">
                        <ShoppingCart className="w-3 h-3 text-red-500" />
                        <span className="text-[10px] font-bold text-red-600 uppercase">
                          Có toa kính
                        </span>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                      {order.items?.slice(0, 2).map((item, idx) => (
                        <p
                          key={idx}
                          className="text-xs text-gray-600 truncate flex justify-between"
                        >
                          <span className="truncate flex-1 pr-2">
                            • {item.productName || item.name}
                          </span>
                          <span className="font-bold text-gray-400 text-[10px]">
                            x{item.quantity}
                          </span>
                        </p>
                      ))}
                      {order.items?.length > 2 && (
                        <p className="text-[10px] text-gray-400 pl-3 font-medium">
                          và {order.items.length - 2} sản phẩm khác...
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-center py-3 border-t border-gray-100 mb-3">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          Tổng cộng
                        </p>
                        <p className="font-bold text-red-600">
                          {formatCurrency(
                            order.finalAmount || order.totalAmount
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          Ngày tạo
                        </p>
                        <p className="text-xs font-medium text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString(
                            'vi-VN'
                          )}
                        </p>
                      </div>
                    </div>
                    {renderActions(order)}
                  </div>
                </div>
              ))}
              {column.orders.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-40">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mb-2" />
                  <p className="text-sm font-medium">Trống</p>
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

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default ManagerOrdersPage;

