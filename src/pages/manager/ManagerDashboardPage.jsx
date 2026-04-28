import {
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  AlertTriangle,
  Tag,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import {
  useAdminDashboard,
  useAdminUsers,
  usePromotions,
} from '@/hooks/useAdmin';
import { useInventory } from '@/hooks/useInventory';
import { useAdminOrders } from '@/hooks/useOrder';

const ROLE_LABEL = {
  ADMIN: 'Admin',
  MANAGER: 'Quản lý',
  SALES_STAFF: 'NV Bán hàng',
  OPERATION_STAFF: 'NV Vận hành',
};

const STATUS_LABEL = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  RETURN_REQUESTED: 'Yêu cầu trả',
  RETURNED: 'Đã trả hàng',
};

const STATUS_COLOR = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-red-100 text-red-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  RETURN_REQUESTED: 'bg-pink-100 text-pink-800',
  RETURNED: 'bg-gray-200 text-gray-800',
};

const PIE_COLORS = [
  '#dc2626',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#64748b',
];

const ManagerDashboardPage = () => {
  const { user } = useAuth();

  const { data: stats, isLoading: loadingStats } = useAdminDashboard();
  const { data: allUsers = [] } = useAdminUsers({ page: 1, size: 100 });
  const { data: allPromotions = [] } = usePromotions();
  const { data: ordersData } = useAdminOrders({ page: 1, size: 5 });
  const { data: inventoryItems = [] } = useInventory();

  const staffList = (
    Array.isArray(allUsers) ? allUsers : allUsers?.content || []
  ).filter((u) => u.role !== 'CUSTOMER');
  const activeStaff = staffList.filter(
    (u) => u.status?.toUpperCase() === 'ACTIVE'
  );
  const activeCoupons = (allPromotions || []).filter((c) => c.isActive);
  const recentOrders = ordersData?.items || [];
  const lowStock = inventoryItems
    .filter((item) => item.totalStock < 20)
    .slice(0, 5);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  // Chart data
  const revenueData = (stats?.revenueByMonth || []).map((item) => ({
    name: `T${item.month}`,
    revenue: item.revenue,
  }));

  const statusMap = {
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    PROCESSING: 'Đang xử lý',
    SHIPPED: 'Đang giao',
    DELIVERED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };

  const ordersStatusData = Object.entries(stats?.ordersByStatus || {}).map(
    ([key, value]) => ({ name: statusMap[key] || key, value })
  );

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-[#222]">Tổng quan</h1>
        <p className="text-[#4f5562] mt-1">
          Xin chào, {user?.name || 'Manager'}!
        </p>
      </div>

      {/* KPI STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          icon={<DollarSign className="text-green-600" />}
          bgColor="bg-green-50"
          title="Doanh thu"
          value={formatCurrency(Number(stats?.totalRevenue ?? 0))}
        />
        <StatCard
          icon={<ShoppingCart className="text-red-600" />}
          bgColor="bg-blue-50"
          title="Tổng đơn hàng"
          value={stats?.totalOrders ?? 0}
        />
        <StatCard
          icon={<Users className="text-purple-600" />}
          bgColor="bg-purple-50"
          title="Khách hàng"
          value={(stats?.totalCustomers ?? 0).toLocaleString()}
        />
        <StatCard
          icon={<Package className="text-orange-600" />}
          bgColor="bg-orange-50"
          title="Sản phẩm"
          value={stats?.totalProducts ?? 0}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REVENUE CHART */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#222]">
              Doanh thu theo tháng
            </h3>
            <Link
              to="/manager/reports"
              className="text-red-600 text-sm flex items-center gap-1 hover:underline"
            >
              Xem chi tiết <ChevronRight size={14} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip formatter={(v) => [formatCurrency(v), 'Doanh thu']} />
              <Bar dataKey="revenue" fill="#dc2626" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ORDER STATUS PIE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0]">
          <h3 className="text-lg font-bold text-[#222] mb-6">Tỷ lệ đơn hàng</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={ordersStatusData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
              >
                {ordersStatusData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT ORDERS + TOP PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECENT ORDERS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#222]">Đơn hàng gần đây</h3>
            <Link
              to="/manager/orders"
              className="text-red-600 text-sm flex items-center gap-1 hover:underline"
            >
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left">
                <tr>
                  <th className="py-2 font-medium text-gray-500">Mã đơn</th>
                  <th className="font-medium text-gray-500">Khách hàng</th>
                  <th className="font-medium text-gray-500">Tổng tiền</th>
                  <th className="font-medium text-gray-500">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => {
                    const s = order.status?.toUpperCase();
                    return (
                      <tr
                        key={order.orderId || order.id}
                        className="border-b last:border-0"
                      >
                        <td className="py-3 font-medium">
                          {order.code || order.orderId}
                        </td>
                        <td className="text-[#4f5562]">
                          {order.recipientName || 'N/A'}
                        </td>
                        <td className="font-medium">
                          {formatCurrency(order.finalAmount || 0)}
                        </td>
                        <td>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[s] || 'bg-gray-100 text-gray-800'}`}
                          >
                            {STATUS_LABEL[s] || order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOP PRODUCTS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#222]">Sản phẩm bán chạy</h3>
            <Link
              to="/manager/products"
              className="text-red-600 text-sm flex items-center gap-1 hover:underline"
            >
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {(stats?.topProducts || []).length > 0 ? (
              stats.topProducts.slice(0, 5).map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-8 h-8 bg-red-600 text-white rounded-lg text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#222] truncate">{p.name}</p>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                      <div
                        className="h-full bg-red-600 rounded-full"
                        style={{
                          width: `${stats.topProducts[0]?.sold ? (p.sold / stats.topProducts[0].sold) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-red-600 font-bold text-sm whitespace-nowrap">
                    {p.sold} đã bán
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">Không có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* STAFF + PROMOTIONS + LOW STOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* STAFF */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#222]">
              Nhân viên ({activeStaff.length})
            </h3>
            <Link
              to="/manager/staff"
              className="text-red-600 text-sm flex items-center gap-1 hover:underline"
            >
              Quản lý <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {activeStaff.length > 0 ? (
              activeStaff.slice(0, 4).map((member) => (
                <div
                  key={member.userId || member.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-9 h-9 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {(member.fullName || member.name || '?').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#222] truncate">
                      {member.fullName || member.name}
                    </p>
                    <p className="text-xs text-[#4f5562]">
                      {ROLE_LABEL[member.role] || member.role}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    Hoạt động
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4 text-sm">
                Không có nhân viên
              </p>
            )}
          </div>
        </div>

        {/* PROMOTIONS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#222]">
              Khuyến mãi ({activeCoupons.length})
            </h3>
            <Link
              to="/manager/promotions"
              className="text-red-600 text-sm flex items-center gap-1 hover:underline"
            >
              Quản lý <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {activeCoupons.length > 0 ? (
              activeCoupons.slice(0, 4).map((coupon) => (
                <div
                  key={coupon.promotionId || coupon.code}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Tag className="text-orange-600 w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#222] truncate">
                      {coupon.code}
                    </p>
                    <p className="text-xs text-[#4f5562] truncate">
                      {coupon.description || 'Mã giảm giá'}
                    </p>
                  </div>
                  <span className="text-red-600 font-bold text-sm whitespace-nowrap">
                    {coupon.discountType === 'PERCENT' ||
                    coupon.discountType === 'PERCENTAGE'
                      ? `${coupon.value}%`
                      : formatCurrency(coupon.value || 0)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4 text-sm">
                Không có khuyến mãi
              </p>
            )}
          </div>
        </div>

        {/* LOW STOCK ALERTS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#222] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Tồn kho thấp
            </h3>
            <Link
              to="/manager/inventory"
              className="text-red-600 text-sm flex items-center gap-1 hover:underline"
            >
              Kho hàng <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {lowStock.length > 0 ? (
              lowStock.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#222] truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-[#4f5562]">
                      SKU: {item.variantSku}
                    </p>
                  </div>
                  <span className="bg-red-200 text-red-700 px-2.5 py-1 rounded-lg text-sm font-bold">
                    {item.totalStock}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4 text-sm">
                Tất cả sản phẩm đủ hàng
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;

function StatCard({ icon, bgColor, title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
      <div
        className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-[#94a3b8] font-medium">{title}</p>
        <p className="text-xl font-bold text-[#222]">{value}</p>
      </div>
    </div>
  );
}

