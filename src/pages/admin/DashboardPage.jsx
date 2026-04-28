// Dashboard theo Flup style
import {
  Users,
  DollarSign,
  Package,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardStats } from '@/mocks/data';

const DashboardPage = () => {
  const { user } = useAuth();

  const stats = dashboardStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#222]">Dashboard</h1>
          <p className="text-[#4f5562]">
            Welcome back, {user?.name || 'Admin'}!
          </p>
        </div>
        <button className="bg-[#d90f0f] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#b00c0c] transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Data
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 2.5%
            </span>
          </div>
          <p className="text-3xl font-bold text-[#222]">
            {stats.totalCustomers.toLocaleString()}
          </p>
          <p className="text-[#4f5562] text-sm">Total Customers</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 0.5%
            </span>
          </div>
          <p className="text-3xl font-bold text-[#222]">
            {(stats.totalRevenue / 1000000).toFixed(1)}M
          </p>
          <p className="text-[#4f5562] text-sm">Total Revenue</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-red-500 text-sm font-medium flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> 0.2%
            </span>
          </div>
          <p className="text-3xl font-bold text-[#222]">{stats.totalOrders}</p>
          <p className="text-[#4f5562] text-sm">Total Orders</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 0.12%
            </span>
          </div>
          <p className="text-3xl font-bold text-[#222]">
            {stats.ordersByStatus.cancelled}
          </p>
          <p className="text-[#4f5562] text-sm">Total Returns</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)]">
          <h3 className="text-lg font-semibold text-[#222] mb-4">
            Product Sales
          </h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 70].map(
              (height, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full bg-[#d90f0f] rounded-t-lg"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-[#4f5562]">{i + 1}th</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)]">
          <h3 className="text-lg font-semibold text-[#222] mb-4">
            Sales by Category
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Gọng kính cận', value: 25, color: '#d90f0f' },
              { name: 'Gọng kính râm', value: 17, color: '#22c55e' },
              { name: 'Tròng cận', value: 20, color: '#f59e0b' },
              { name: 'Tròng râm', value: 15, color: '#8b5cf6' },
              { name: 'Kính trẻ em', value: 8, color: '#ef4444' },
            ].map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#222]">{cat.name}</span>
                  <span className="text-[#4f5562]">{cat.value}%</span>
                </div>
                <div className="h-2 bg-[#ececec] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${cat.value}%`,
                      backgroundColor: cat.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#222]">Recent Orders</h3>
          <Link
            to="/admin/orders"
            className="text-[#d90f0f] text-sm font-medium hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#ececec]">
              <tr>
                <th className="text-left py-3 text-sm font-medium text-[#4f5562]">
                  Order ID
                </th>
                <th className="text-left py-3 text-sm font-medium text-[#4f5562]">
                  Customer
                </th>
                <th className="text-left py-3 text-sm font-medium text-[#4f5562]">
                  Status
                </th>
                <th className="text-left py-3 text-sm font-medium text-[#4f5562]">
                  Amount
                </th>
                <th className="text-left py-3 text-sm font-medium text-[#4f5562]">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: 'ORD001',
                  customer: 'Khách Hàng Demo',
                  status: 'pending',
                  amount: 1340000,
                  date: '2024-01-15',
                },
                {
                  id: 'ORD002',
                  customer: 'Nguyễn Văn B',
                  status: 'processing',
                  amount: 2230000,
                  date: '2024-01-14',
                },
                {
                  id: 'ORD003',
                  customer: 'Trần Thị C',
                  status: 'shipped',
                  amount: 2130000,
                  date: '2024-01-10',
                },
                {
                  id: 'ORD004',
                  customer: 'Lê Văn D',
                  status: 'delivered',
                  amount: 1150000,
                  date: '2024-01-05',
                },
              ].map((order) => (
                <tr key={order.id} className="border-b border-[#ececec]">
                  <td className="py-3 text-[#222] font-medium">{order.id}</td>
                  <td className="py-3 text-[#4f5562]">{order.customer}</td>
                  <td className="py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'processing'
                            ? 'bg-red-100 text-red-800'
                            : order.status === 'shipped'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-[#222] font-medium">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(order.amount)}
                  </td>
                  <td className="py-3 text-[#4f5562]">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

