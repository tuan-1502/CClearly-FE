// Admin Reports Page - Báo cáo cho System Admin
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  ChevronRight,
  ChevronDown,
  Calendar,
  Loader2,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminDashboard, useAdminRevenue } from '@/hooks/useAdmin';

const FILTER_OPTIONS = [
  { value: 7, label: '7 ngày qua' },
  { value: 14, label: '14 ngày qua' },
  { value: 30, label: '30 ngày qua' },
  { value: 90, label: '90 ngày qua' },
];

const AdminReportsPage = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: loadingStats } = useAdminDashboard();

  const [filterDays, setFilterDays] = useState(7);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  const { data: revenueData, isLoading: loadingRevenue } = useAdminRevenue({
    days: filterDays,
  });

  const selectedLabel = FILTER_OPTIONS.find(
    (o) => o.value === filterDays
  )?.label;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const revenueByDay = revenueData?.revenueByDay || [];

  if (loadingStats || loadingRevenue) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#222]">
            Báo cáo & Phân tích
          </h1>
          <p className="text-[#4f5562] mt-1">
            Dữ liệu kinh doanh chi tiết của CClearly
          </p>
        </div>
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e0e0e0] rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            <Calendar size={16} className="text-[#d90f0f]" />
            {selectedLabel}
            <ChevronDown
              size={14}
              className={`transition-transform ${showFilter ? 'rotate-180' : ''}`}
            />
          </button>
          {showFilter && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-[#e0e0e0] rounded-xl shadow-lg z-20 overflow-hidden">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setFilterDays(opt.value);
                    setShowFilter(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition ${
                    filterDays === opt.value
                      ? 'bg-blue-50 text-[#d90f0f] font-semibold'
                      : 'text-[#222]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={<DollarSign className="text-green-600" />}
          title="Doanh thu tháng này"
          value={formatCurrency(Number(revenueData?.thisMonthRevenue ?? 0))}
          trend={`${Number(revenueData?.growthPercent ?? 0) >= 0 ? '+' : ''}${Number(revenueData?.growthPercent ?? 0).toFixed(1)}%`}
          isUp={Number(revenueData?.growthPercent ?? 0) >= 0}
          bgColor="bg-green-50"
        />
        <KPICard
          icon={<ShoppingCart className="text-red-600" />}
          title="Tổng đơn hàng"
          value={stats?.totalOrders ?? 0}
          trend=""
          isUp={true}
          bgColor="bg-blue-50"
        />
        <KPICard
          icon={<Users className="text-purple-600" />}
          title="Khách hàng"
          value={(stats?.totalCustomers ?? 0).toLocaleString()}
          trend=""
          isUp={true}
          bgColor="bg-purple-50"
        />
        <KPICard
          icon={<Package className="text-orange-600" />}
          title="Sản phẩm đang bán"
          value={stats?.totalProducts ?? 0}
          trend=""
          isUp={true}
          bgColor="bg-orange-50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Daily Revenue Line Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)] border border-[#f0f0f0]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#222] flex items-center gap-2">
              <Calendar size={20} className="text-[#d90f0f]" />
              Doanh thu {selectedLabel?.toLowerCase()}
            </h3>
            <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
              Tăng trưởng ổn định
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByDay}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
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
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#d90f0f"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: '#d90f0f',
                    strokeWidth: 2,
                    stroke: '#fff',
                  }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      {/* Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)] border border-[#f0f0f0]">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#222]">Sản phẩm bán chạy</h3>
          </div>
          <div className="space-y-4">
            {(stats?.topProducts || []).map((item, i) => (
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
              <DollarSign className="text-green-600" size={28} />
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div>
                <p className="text-sm text-[#4f5562]">Tháng này</p>
                <p className="text-xl font-bold text-red-700">
                  {formatCurrency(Number(revenueData?.thisMonthRevenue ?? 0))}
                </p>
              </div>
              <TrendingUp className="text-red-600" size={28} />
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
              <div>
                <p className="text-sm text-[#4f5562]">Tháng trước</p>
                <p className="text-xl font-bold text-purple-700">
                  {formatCurrency(Number(revenueData?.lastMonthRevenue ?? 0))}
                </p>
              </div>
              <Calendar className="text-purple-600" size={28} />
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
                <TrendingUp className="text-green-600" size={28} />
              ) : (
                <TrendingDown className="text-red-600" size={28} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ icon, title, value, trend, isUp, bgColor }) => (
  <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)] border border-[#f0f0f0] transition-transform hover:-translate-y-1">
    <div className="flex items-center justify-between mb-4">
      <div
        className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}
      >
        {icon}
      </div>
      <div
        className={`flex items-center gap-1 text-sm font-bold ${isUp ? 'text-green-600' : 'text-red-600'}`}
      >
        {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        {trend}
      </div>
    </div>
    <p className="text-2xl font-bold text-[#222]">{value}</p>
    <p className="text-sm text-[#94a3b8] font-medium mt-1">{title}</p>
  </div>
);

export default AdminReportsPage;

