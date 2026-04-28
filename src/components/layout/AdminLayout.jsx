import {
  Home,
  ShoppingCart,
  Package,
  Tag,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BarChart3,
  FileText,
  Truck,
  TestTube,
  ClipboardList,
  MessageCircle,
  DollarSign,
  Warehouse,
  LogOut,
  Image,
} from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '@/contexts/AuthContext';

const ROLE_LABELS = {
  [ROLES.SALES]: 'Nhân viên bán hàng',
  [ROLES.OPERATIONS]: 'Nhân viên vận hành',
  [ROLES.MANAGER]: 'Quản lý',
  [ROLES.ADMIN]: 'Quản trị viên',
  [ROLES.CUSTOMER]: 'Khách hàng',
};

const getMenuItems = (role) => {
  const items = {
    // Sales: Order Management
    [ROLES.SALES]: [
      { path: '/sales', label: 'Tổng quan', icon: Home },
      { path: '/sales/orders', label: 'Quản lý đơn hàng', icon: ShoppingCart },
      { path: '/sales/returns', label: 'Đổi trả & Khiếu nại', icon: RotateCcw },
      { path: '/sales/customers', label: 'Khách hàng', icon: Users },
    ],

    // Operations: Kho & Gia công
    [ROLES.OPERATIONS]: [
      {
        path: '/operations',
        label: 'Điều phối đơn',
        icon: ClipboardList,
      },
      { path: '/operations/orders', label: 'Xử lý đơn hàng', icon: Package },
      { path: '/operations/lens-lab', label: 'Gia công tròng', icon: TestTube },
      {
        path: '/operations/shipping',
        label: 'Giao vận & Tracking',
        icon: Truck,
      },
      {
        path: '/operations/preorder',
        label: 'Nhận hàng Pre-order',
        icon: Package,
      },
      { path: '/operations/inventory', label: 'Quản lý kho', icon: Warehouse },
    ],

    // Manager: Full Admin (trừ System)
    [ROLES.MANAGER]: [
      { path: '/manager', label: 'Tổng quan', icon: Home },
      {
        path: '/manager/orders',
        label: 'Quản lý đơn hàng',
        icon: ShoppingCart,
      },
      { path: '/manager/products', label: 'Sản phẩm', icon: Package },
      { path: '/manager/inventory', label: 'Quản lý kho', icon: Warehouse },
      { path: '/manager/promotions', label: 'Khuyến mãi', icon: Tag },
      { path: '/manager/staff', label: 'Nhân sự', icon: Users },
      { path: '/manager/reports', label: 'Báo cáo', icon: BarChart3 },
    ],

    // System Admin: Full Access
    [ROLES.ADMIN]: [
      { path: '/admin', label: 'Tổng quan', icon: Home },
      { path: '/admin/orders', label: 'Quản lý đơn hàng', icon: ShoppingCart },
      { path: '/admin/products', label: 'Sản phẩm', icon: Package },
      { path: '/admin/promotions', label: 'Khuyến mãi', icon: Tag },
      { path: '/admin/staff', label: 'Nhân sự', icon: Users },
      { path: '/admin/reports', label: 'Báo cáo', icon: BarChart3 },
      { path: '/admin/logs', label: 'Nhật ký hệ thống', icon: FileText },
      { path: '/admin/banners', label: 'Quản lý banner', icon: Image },
      { path: '/admin/settings', label: 'Cấu hình', icon: Settings },
    ],
  };

  return items[role] || items[ROLES.MANAGER];
};

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = user?.role || ROLES.ADMIN;
  const menuItems = getMenuItems(userRole);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#ececec] overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={`bg-white shadow-[0_10px_30px_rgba(13,22,39,0.06)] transition-all duration-300 flex flex-col h-full ${
          sidebarOpen ? 'w-[260px]' : 'w-[80px]'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ececec] shrink-0">
          {sidebarOpen && (
            <Link
              to="/"
              className="flex items-center gap-2 group transition-opacity hover:opacity-80"
            >
              <svg
                viewBox="0 0 120 40"
                className="h-7 w-12 text-[#1f7a5a]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="34" cy="20" r="12" />
                <circle cx="66" cy="20" r="12" />
                <path d="M46 20h8" strokeLinecap="round" />
              </svg>
              <span className="text-xl font-bold tracking-tight text-[#1f7a5a]">
                CCLEARLY
              </span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[#4f5562] hover:text-[#222] p-1"
          >
            {sidebarOpen ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                location.pathname === item.path
                  ? 'bg-[#1f7a5a] text-white'
                  : 'text-[#4f5562] hover:bg-[#f3f3f3]'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* USER FOOTER */}
        <div className="p-4 border-t border-[#ececec] shrink-0 bg-white">
          <div className="flex items-center justify-between gap-3 px-1">
            <Link
              to="/profile"
              className="flex items-center gap-3 overflow-hidden hover:opacity-80 transition-opacity"
              title="Trang cá nhân"
            >
              <div className="w-10 h-10 bg-[#1f7a5a] rounded-full flex items-center justify-center text-white font-bold shrink-0">
                {(user?.fullName || user?.name || 'A').charAt(0)}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#222] truncate">
                    {user?.fullName || user?.name || 'Nhân viên'}
                  </p>
                  <p className="text-[11px] text-[#717171] truncate">
                    {ROLE_LABELS[user?.role] || user?.role || ''}
                  </p>
                </div>
              )}
            </Link>
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="p-2 text-[#4f5562] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                title="Đăng xuất"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-full overflow-y-auto p-8 relative">
        <div className="max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

