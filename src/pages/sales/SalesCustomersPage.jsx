// Sales Customers Page - Quản lý khách hàng
import {
  Search,
  User,
  Phone,
  Mail,
  ShoppingBag,
  DollarSign,
  MessageCircle,
  Calendar,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomers } from '@/hooks/useUser';
import { useAdminOrders } from '@/hooks/useOrder';

const SalesCustomersPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [minSpending, setMinSpending] = useState('');
  const [maxSpending, setMaxSpending] = useState('');
  const [minOrders, setMinOrders] = useState('');
  const [maxOrders, setMaxOrders] = useState('');

  const { data: allUsers = [], isLoading: usersLoading } = useCustomers();
  const { data: ordersData, isLoading: ordersLoading } = useAdminOrders({ size: 1000 });
  const allOrders = ordersData?.items || [];

  // Build customer list with order stats
  const customers = useMemo(() => {
    return allUsers
      .map((u) => {
        const custOrders = allOrders.filter((o) => o.userId === u.userId);
        const totalSpent = custOrders.reduce(
          (sum, o) => sum + (o.finalAmount || 0),
          0
        );
        return {
          ...u,
          totalOrders: custOrders.length,
          totalSpent,
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [allUsers, allOrders]);

  const filteredCustomers = customers.filter((cust) => {
    const matchSearch =
      (cust.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust.phoneNumber || '').includes(searchTerm);
    
    const matchStatus =
      statusFilter === 'all' ||
      cust.status?.toUpperCase() === statusFilter;
    
    // Range filter for spending
    const min = minSpending ? parseFloat(minSpending) : 0;
    const max = maxSpending ? parseFloat(maxSpending) : Infinity;
    const matchSpending = cust.totalSpent >= min && cust.totalSpent <= max;
    
    // Range filter for orders
    const minOrd = minOrders ? parseInt(minOrders) : 0;
    const maxOrd = maxOrders ? parseInt(maxOrders) : Infinity;
    const matchOrders = cust.totalOrders >= minOrd && cust.totalOrders <= maxOrd;
    
    return matchSearch && matchStatus && matchSpending && matchOrders;
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const getCustomerOrders = (customerId) =>
    allOrders.filter((o) => o.userId === customerId);

  const getStatusBadge = (status) => {
    const isActive = status?.toUpperCase() === 'ACTIVE';
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          isActive
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-gray-50 text-gray-600 border border-gray-200'
        }`}
      >
        {isActive ? 'Hoạt động' : 'Không hoạt động'}
      </span>
    );
  };

  const getOrderStatusBadge = (status) => {
    const map = {
      PENDING: { bg: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Chờ xử lý' },
      CONFIRMED: { bg: 'bg-blue-50 text-red-700 border-red-200', label: 'Đã xác nhận' },
      SHIPPED: { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Đang giao' },
      DELIVERED: { bg: 'bg-green-50 text-green-700 border-green-200', label: 'Đã giao' },
      CANCELLED: { bg: 'bg-red-50 text-red-700 border-red-200', label: 'Đã hủy' },
      RETURN_REQUESTED: { bg: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Yêu cầu trả' },
      RETURNED: { bg: 'bg-gray-50 text-gray-600 border-gray-200', label: 'Đã trả hàng' },
    };
    const s = map[status] || { bg: 'bg-gray-50 text-gray-600 border-gray-200', label: status };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${s.bg}`}>
        {s.label}
      </span>
    );
  };

  // Stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (c) => c.status?.toUpperCase() === 'ACTIVE'
  ).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  const isLoading = usersLoading || ordersLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#222]">Khách hàng</h1>
        <p className="text-[#4f5562]">Xin chào, {user?.fullName || user?.name || 'Sales'}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-[#d90f0f]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#222]">{totalCustomers}</p>
              <p className="text-xs text-[#4f5562]">Tổng khách hàng</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#222]">{activeCustomers}</p>
              <p className="text-xs text-[#4f5562]">Đang hoạt động</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#222]">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-xs text-[#4f5562]">Tổng doanh thu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
        {/* Main Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm: tên, email, SĐT..."
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
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Không hoạt động</option>
          </select>
        </div>

        {/* Range Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Spending Range */}
          <div>
            <label className="block text-sm font-medium text-[#222] mb-2">
              Khoảng tổng chi tiêu (VND)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Từ"
                value={minSpending}
                onChange={(e) => setMinSpending(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d90f0f]/20"
              />
              <span className="text-gray-400">—</span>
              <input
                type="number"
                placeholder="Đến"
                value={maxSpending}
                onChange={(e) => setMaxSpending(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d90f0f]/20"
              />
            </div>
          </div>

          {/* Orders Range */}
          <div>
            <label className="block text-sm font-medium text-[#222] mb-2">
              Khoảng số đơn hàng
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Từ"
                value={minOrders}
                onChange={(e) => setMinOrders(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d90f0f]/20"
                min="0"
              />
              <span className="text-gray-400">—</span>
              <input
                type="number"
                placeholder="Đến"
                value={maxOrders}
                onChange={(e) => setMaxOrders(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d90f0f]/20"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(minSpending || maxSpending || minOrders || maxOrders) && (
          <button
            onClick={() => {
              setMinSpending('');
              setMaxSpending('');
              setMinOrders('');
              setMaxOrders('');
            }}
            className="text-sm text-[#d90f0f] hover:text-[#b00c0c] font-medium"
          >
            Xóa bộ lọc nâng cao
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-gray-200 rounded" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm h-[300px] animate-pulse" />
        </div>
      ) : (
        /* Customers Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredCustomers.map((cust) => (
              <div
                key={cust.userId}
                onClick={() => setSelectedCustomer(cust)}
                className={`bg-white rounded-xl p-6 shadow-sm cursor-pointer transition ${
                  selectedCustomer?.userId === cust.userId
                    ? 'ring-2 ring-[#d90f0f]'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#d90f0f] rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {(cust.fullName || '?').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-[#222] truncate">
                        {cust.fullName}
                      </h3>
                      {getStatusBadge(cust.status)}
                    </div>
                    <p className="text-sm text-[#4f5562] flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{cust.email}</span>
                    </p>
                    <p className="text-sm text-[#4f5562] flex items-center gap-2">
                      <Phone className="w-4 h-4 shrink-0" />
                      {cust.phoneNumber || '—'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#222]">
                      {cust.totalOrders}
                    </p>
                    <p className="text-xs text-[#4f5562]">Đơn hàng</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#222]">
                      {formatCurrency(cust.totalSpent)}
                    </p>
                    <p className="text-xs text-[#4f5562]">Tổng chi tiêu</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#222]">
                      {cust.totalOrders > 0
                        ? formatCurrency(cust.totalSpent / cust.totalOrders)
                        : '—'}
                    </p>
                    <p className="text-xs text-[#4f5562]">Giá trị TB</p>
                  </div>
                </div>
              </div>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12 text-[#4f5562] bg-white rounded-xl">
                Không tìm thấy khách hàng nào
              </div>
            )}
          </div>

          {/* Customer Detail */}
          <div className="bg-white rounded-xl p-6 shadow-sm h-fit sticky top-6">
            {selectedCustomer ? (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-[#d90f0f] rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
                    {(selectedCustomer.fullName || '?').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-xl text-[#222] truncate">
                      {selectedCustomer.fullName}
                    </h3>
                    <p className="text-sm text-[#4f5562] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Khách hàng từ {formatDate(selectedCustomer.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#4f5562] shrink-0" />
                    <span className="text-[#222] text-sm truncate">
                      {selectedCustomer.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#4f5562] shrink-0" />
                    <span className="text-[#222] text-sm">
                      {selectedCustomer.phoneNumber || '—'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <ShoppingBag className="w-6 h-6 mx-auto text-[#d90f0f] mb-2" />
                    <p className="text-xl font-bold text-[#222]">
                      {selectedCustomer.totalOrders}
                    </p>
                    <p className="text-xs text-[#4f5562]">Đơn hàng</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <DollarSign className="w-6 h-6 mx-auto text-[#d90f0f] mb-2" />
                    <p className="text-xl font-bold text-[#222]">
                      {formatCurrency(selectedCustomer.totalSpent)}
                    </p>
                    <p className="text-xs text-[#4f5562]">Tổng chi tiêu</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-[#222] mb-3">
                    Lịch sử đơn hàng
                  </h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {getCustomerOrders(selectedCustomer.userId).map(
                      (order) => (
                        <div
                          key={order.orderId}
                          className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <span className="font-medium text-[#222]">
                              {order.code || order.orderId?.slice(0, 8)}
                            </span>
                            <p className="text-[11px] text-[#4f5562] mt-0.5">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-medium text-[#222]">
                              {formatCurrency(order.finalAmount)}
                            </span>
                            <div className="mt-1">
                              {getOrderStatusBadge(order.status)}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                    {getCustomerOrders(selectedCustomer.userId).length ===
                      0 && (
                      <p className="text-sm text-[#4f5562] text-center py-4">
                        Chưa có đơn hàng
                      </p>
                    )}
                  </div>
                </div>

                <button className="w-full mt-4 bg-[#d90f0f] text-white py-2.5 rounded-xl font-medium hover:bg-[#b00c0c] flex items-center justify-center gap-2 transition">
                  <MessageCircle className="w-4 h-4" /> Liên hệ khách
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-[#4f5562]">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Chọn khách hàng để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesCustomersPage;

