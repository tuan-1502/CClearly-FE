import {
  Package,
  CheckCircle,
  Users,
  DollarSign as DollarSignIcon,
  AlertTriangle,
  Loader2,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth, ROLES } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useAdminDashboard, useAdminRevenue } from '@/hooks/useAdmin';
import { useAdminOrders } from '@/hooks/useOrder';
import { QUERY_KEYS } from '@/utils/endpoints';

const AdminDashboard = () => {
  const { user, hasRole } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleDashboardUpdate = () => {
      console.log('Real-time dashboard update received');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_DASHBOARD });
      setCurrentTime(new Date()); // Update time on data refresh
    };

    const handleOrdersUpdate = () => {
      console.log('Real-time orders update received');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_ORDERS });
    };

    socket.on('dashboard_stats_updated', handleDashboardUpdate);
    socket.on('order_status_updated', handleOrdersUpdate);
    socket.on('new_order_placed', handleOrdersUpdate);

    return () => {
      socket.off('dashboard_stats_updated', handleDashboardUpdate);
      socket.off('order_status_updated', handleOrdersUpdate);
      socket.off('new_order_placed', handleOrdersUpdate);
    };
  }, [socket, queryClient]);

  const { data: stats, isLoading: loadingStats } = useAdminDashboard();
  const { data: revenueData, isLoading: loadingRevenue } = useAdminRevenue({
    days: 7,
  });
  const { data: ordersData, isLoading: loadingOrders } = useAdminOrders({
    page: 1,
    size: 5,
  });

  const recentOrders = ordersData?.items || [];

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  const COLORS = [
    '#d90f0f',
    '#22c55e',
    '#f59e0b',
    '#8b5cf6',
    '#ef4444',
    '#64748b',
  ];

  const statusData = stats?.ordersByStatus
    ? Object.entries(stats.ordersByStatus).map(([name, value]) => ({
        name:
          name === 'PENDING'
            ? 'Chờ xử lý'
            : name === 'PROCESSING'
              ? 'Đang gia công'
              : name === 'DELIVERED'
                ? 'Hoàn thành'
                : name === 'CANCELLED'
                  ? 'Đã hủy'
                  : name,
        value,
      }))
    : [];

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    const map = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-red-100 text-red-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-orange-100 text-orange-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      RETURN_REQUESTED: 'bg-pink-100 text-pink-800',
      RETURNED: 'bg-gray-200 text-gray-800',
    };

    return map[s] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const s = status?.toUpperCase();
    const map = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PROCESSING: 'Đang xử lý',
      SHIPPED: 'Đang giao',
      DELIVERED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      RETURN_REQUESTED: 'Yêu cầu đổi trả',
      RETURNED: 'Đã trả hàng',
    };
    return map[s] || status;
  };

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#222]">Dashboard</h1>
        <p className="text-[#4f5562] mt-1">Xin chào {user?.name || 'Admin'}</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Package className="text-red-600" />}
          title="Đơn hàng mới"
          value={stats?.pendingOrders ?? 0}
          detail={`${Math.floor((stats?.pendingOrders || 0) * 0.4)} đơn chưa thanh toán`}
          detailColor="text-orange-600"
        />

        <StatCard
          icon={<CheckCircle className="text-green-600" />}
          title="Đã hoàn thành"
          value={stats?.deliveredOrders ?? 0}
          detail={`${stats?.ordersByStatus?.delivered || 0} tổng đơn`}
          detailColor="text-green-600"
        />

        {hasRole([ROLES.MANAGER, ROLES.ADMIN]) && (
          <>
            <StatCard
              icon={<Users className="text-purple-600" />}
              title="Khách hàng"
              value={(stats?.totalCustomers ?? 0).toLocaleString()}
              detail="Tăng trưởng ổn định"
              detailColor="text-purple-600"
            />

            <StatCard
              icon={<DollarSignIcon className="text-orange-600" />}
              title="Doanh thu"
              value={
                (Number(stats?.totalRevenue ?? 0) / 1000000).toFixed(0) + 'M'
              }
              detail={`Cập nhật: ${currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${currentTime.toLocaleDateString('vi-VN')}`}
              detailColor="text-gray-400"
            />
          </>
        )}
      </div>

      {/* NEW BLOCKS FROM REPORTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)] border border-[#f0f0f0]">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#222]">Sản phẩm bán chạy</h3>
          </div>
          <div className="space-y-4">
            {(stats?.topProducts || []).slice(0, 5).map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 group cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition"
              >
                <div className="w-10 h-10 bg-[#f3f3f3] rounded-lg flex items-center justify-center font-bold text-[#d90f0f]">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#222] group-hover:text-[#d90f0f] transition">
                    {item.name}
                  </p>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1.5">
                    <div
                      className="h-full bg-[#d90f0f] rounded-full transition-all duration-1000"
                      style={{
                        width: `${stats?.topProducts?.[0]?.sold ? (item.sold / stats.topProducts[0].sold) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#222]">{item.sold}</p>
                  <p className="text-[10px] text-[#4f5562] uppercase tracking-wider">
                    Đã bán
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)] border border-[#f0f0f0]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#222]">
              Tổng quan doanh thu
            </h3>
          </div>
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div>
                <p className="text-sm text-[#4f5562]">Tổng doanh thu</p>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(Number(revenueData?.totalRevenue ?? 0))}
                </p>
              </div>
              <DollarSignIcon className="text-green-600" size={28} />
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div>
                <p className="text-sm text-[#4f5562]">Tháng này</p>
                <p className="text-xl font-bold text-red-700">
                  {formatCurrency(Number(revenueData?.thisMonthRevenue ?? 0))}
                </p>
              </div>
              <TrendingUpIcon className="text-red-600" size={28} />
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
              <div>
                <p className="text-sm text-[#4f5562]">Tháng trước</p>
                <p className="text-xl font-bold text-purple-700">
                  {formatCurrency(Number(revenueData?.lastMonthRevenue ?? 0))}
                </p>
              </div>
              <CalendarIcon className="text-purple-600" size={28} />
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
              <div>
                <p className="text-sm text-[#4f5562]">Tăng trưởng</p>
                <p
                  className={`text-xl font-bold ${Number(revenueData?.growthPercent ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}
                >
                  {Number(revenueData?.growthPercent ?? 0) >= 0 ? '+' : ''}
                  {Number(revenueData?.growthPercent ?? 0).toFixed(1)}%
                </p>
              </div>
              {Number(revenueData?.growthPercent ?? 0) >= 0 ? (
                <TrendingUpIcon className="text-green-600" size={28} />
              ) : (
                <TrendingDownIcon className="text-red-600" size={28} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* REVENUE & STATUS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend Line */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)] border border-[#f0f0f0]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#222]">
              Xu hướng doanh thu
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#d90f0f] rounded-full"></span>
                <span className="text-[#4f5562]">Doanh thu</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.revenueByMonth || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d90f0f" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#d90f0f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                  tickFormatter={(val) => `Tháng ${val}`}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                  formatter={(val) => [formatCurrency(val), 'Doanh thu']}
                  labelFormatter={(val) => `Tháng ${val}`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#d90f0f"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)] border border-[#f0f0f0]">
          <h3 className="text-lg font-bold text-[#222] mb-8">Tỷ lệ đơn hàng</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-[#4f5562] flex items-center justify-between">
              <span>Năng suất trung bình:</span>
              <span className="font-semibold text-green-600">85%</span>
            </p>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-semibold mb-4">Đơn hàng gần đây</h3>

        {loadingOrders ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left">
                <tr>
                  <th className="py-2">Order</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {(Array.isArray(recentOrders) ? recentOrders : []).map(
                  (order) => (
                    <tr key={order.orderId || order.id} className="border-b">
                      <td className="py-3 font-medium">
                        {order.code || order.orderId}
                      </td>

                      <td>{order.recipientName || 'N/A'}</td>

                      <td>{formatCurrency(order.finalAmount)}</td>

                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(order.status)}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

function StatCard({ icon, title, value, detail, detailColor = 'text-gray-500' }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4 transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div className="flex-1 overflow-hidden">
        <p className="text-gray-500 text-sm truncate">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {detail && (
          <p className={`text-[11px] mt-1 font-medium ${detailColor} truncate`}>
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}

