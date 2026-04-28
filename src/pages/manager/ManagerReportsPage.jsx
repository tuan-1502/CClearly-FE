import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminDashboard } from '@/hooks/useAdmin';
import { useInventory } from '@/hooks/useInventory';

const ManagerReportsPage = () => {
  const { user } = useAuth();
  const { data: stats = {} } = useAdminDashboard();
  const { data: inventoryItems = [] } = useInventory();

  const formatCurrency = (v) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(v);

  const orderStatusData = Object.entries(stats.ordersByStatus || {}).map(
    ([name, value]) => ({ name, value })
  );

  const lowStock = inventoryItems
    .filter((item) => item.totalStock < 20)
    .slice(0, 5);

  const COLORS = [
    '#2563eb',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-[#222]">Báo cáo & Thống kê</h1>

        <p className="text-[#4f5562]">Xin chào, {user?.name || 'Manager'}!</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between mb-3">
            <DollarSign className="text-green-600" />
            <span className="text-green-600 flex items-center gap-1 text-sm">
              <TrendingUp size={16} />
              12.5%
            </span>
          </div>

          <p className="text-2xl font-bold">
            {formatCurrency(stats.totalRevenue || 0)}
          </p>

          <p className="text-sm text-gray-500">Doanh thu</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between mb-3">
            <ShoppingCart className="text-red-600" />
            <span className="text-green-600 flex items-center gap-1 text-sm">
              <TrendingUp size={16} />
              5.2%
            </span>
          </div>

          <p className="text-2xl font-bold">{stats.totalOrders || 0}</p>

          <p className="text-sm text-gray-500">Đơn hàng</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between mb-3">
            <Users className="text-purple-600" />
            <span className="text-green-600 flex items-center gap-1 text-sm">
              <TrendingUp size={16} />
              8.3%
            </span>
          </div>

          <p className="text-2xl font-bold">
            {(stats.totalCustomers || 0).toLocaleString()}
          </p>

          <p className="text-sm text-gray-500">Khách hàng</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between mb-3">
            <Package className="text-orange-600" />
            <span className="text-red-500 flex items-center gap-1 text-sm">
              <TrendingDown size={16} />
              2.1%
            </span>
          </div>

          <p className="text-2xl font-bold">{stats.totalProducts || 0}</p>

          <p className="text-sm text-gray-500">Sản phẩm</p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* REVENUE */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4 flex gap-2 items-center">
            <BarChart3 size={18} /> Doanh thu theo tháng
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.revenueByMonth || []}>
              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="revenue" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ORDER STATUS */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4 flex gap-2 items-center">
            <BarChart3 size={18} /> Đơn hàng theo trạng thái
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={orderStatusData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
              >
                {orderStatusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* TOP PRODUCTS */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4">Top sản phẩm bán chạy</h3>

          <div className="space-y-3">
            {(stats.topProducts || []).map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
              >
                <span className="w-6 h-6 bg-red-600 text-white rounded-full text-xs flex items-center justify-center">
                  {i + 1}
                </span>

                <span className="flex-1">{p.name}</span>

                <span className="text-red-600 font-medium">{p.sold}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LOW STOCK */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4">Tồn kho thấp</h3>

          <div className="space-y-3">
            {lowStock.length === 0 ? (
              <p className="text-gray-500 text-center">
                Không có sản phẩm tồn kho thấp
              </p>
            ) : (
              lowStock.map((item) => (
                <div
                  key={item.variantId}
                  className="flex justify-between bg-red-50 p-3 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-gray-500">
                      SKU: {item.variantSku}
                    </p>
                  </div>

                  <span className="bg-red-200 text-red-700 px-2 py-1 rounded text-sm">
                    {item.totalStock}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerReportsPage;

