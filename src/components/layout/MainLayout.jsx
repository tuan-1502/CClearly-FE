import {
  Search,
  ShoppingBag,
  User,
  Heart,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Settings,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useAuth, ROLES } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import SupportChat from '../common/SupportChat';

const navItems = [
  { to: '/best-sellers', label: 'Best seller' },
  { to: '/stores', label: 'Hệ thống cửa hàng' },
  { to: '/blog', label: 'Góc CClearly' },
];

const productLinks = [
  { to: '/frames', label: 'Gọng kính' },
  { to: '/lenses', label: 'Tròng kính' },
  { to: '/accessories', label: 'Phụ kiện' },
];

const getDashboardLink = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin';
    case ROLES.MANAGER:
      return '/manager';
    case ROLES.SALES:
      return '/sales';
    case ROLES.OPERATIONS:
      return '/operations';
    default:
      return '/profile';
  }
};

const getDashboardLabel = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return 'Admin Dashboard';
    case ROLES.MANAGER:
      return 'Manager Dashboard';
    case ROLES.SALES:
      return 'Sales Dashboard';
    case ROLES.OPERATIONS:
      return 'Operations Dashboard';
    default:
      return 'My Dashboard';
  }
};

const footerColumns = [
  {
    title: 'Shop',
    links: [
      { to: '/frames', label: 'Gọng kính' },
      { to: '/lenses', label: 'Tròng kính' },
      { to: '/products', label: 'Tất cả sản phẩm' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { to: '/returns', label: 'Chính sách đổi trả' },
      { to: '/faq', label: 'Câu hỏi thường gặp' },
      { to: '/contact', label: 'Liên hệ' },
    ],
  },
  {
    title: 'Về chúng tôi',
    links: [
      { to: '/about', label: 'Giới thiệu' },
      { to: '/stores', label: 'Hệ thống cửa hàng' },
      { to: '/careers', label: 'Tuyển dụng' },
    ],
  },
];

const socialLinks = [
  { label: 'Facebook' },
  { label: 'X' },
  { label: 'Instagram' },
];

const MainLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const isCustomer = !user?.role || user.role === ROLES.CUSTOMER;
  const { data: cartData } = useCart();
  const navigate = useNavigate();
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const cartItemCount = cartData?.items?.length || 0;
  const wishlistCount = 0; // Demo - can be connected to wishlist hook later

  const isStaffRole = user?.role && user.role !== ROLES.CUSTOMER;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileDropdownOpen(false);
  };

  const navClass = ({ isActive }) =>
    `text-[13px] font-medium transition ${isActive ? 'text-[#101010]' : 'text-[#666] hover:text-[#101010]'}`;

  const dashboardLink = isAuthenticated ? getDashboardLink(user?.role) : '#';
  const dashboardLabel = isAuthenticated
    ? getDashboardLabel(user?.role)
    : 'Dashboard';

  return (
    <div className="min-h-screen bg-white text-[#131313]">
      <header className="relative z-50 border-b border-[#efefef] bg-white">
        <div className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-4 sm:px-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl border border-[#e0e0e0] text-[#666]"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <Link
            to="/"
            className="shrink-0 flex items-center gap-2"
            aria-label="CClearly home"
          >
            <svg
              viewBox="0 0 120 40"
              className="h-8 w-12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="34" cy="20" r="12" />
              <circle cx="66" cy="20" r="12" />
              <path d="M46 20h8" strokeLinecap="round" />
            </svg>
            <span className="text-2xl font-bold text-[#101010]">CClearly</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setIsProductsOpen(true)}
              onMouseLeave={() => setIsProductsOpen(false)}
            >
              <button className="flex items-center gap-1 px-2 py-2 text-[13px] font-semibold text-[#666] hover:text-[#d90f0f]">
                Sản phẩm
                <ChevronDown
                  className={`h-4 w-4 transition ${isProductsOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                className={`absolute left-0 top-full mt-1 w-56 rounded-2xl border border-[#e0e0e0] bg-white p-2 shadow-xl transition-all ${isProductsOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'}`}
              >
                {productLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `block rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-[#d90f0f]/10 text-[#d90f0f]' : 'text-[#666] hover:bg-[#f3f3f3] hover:text-[#d90f0f]'}`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-[#171717] sm:gap-4">
            <Link
              to="/products"
              className="rounded-full p-1.5 hover:bg-[#f3f3f3]"
              aria-label="Search products"
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Cart icon — only for customers & guests */}
            {isCustomer && (
              <Link
                to="/cart"
                className="relative rounded-full p-1.5 hover:bg-[#f3f3f3]"
                aria-label="Giỏ hàng"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#d90f0f] px-1 text-[10px] font-bold text-white">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              {isAuthenticated ? (
                // Logged in - show user icon with dropdown
                <>
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center gap-2 rounded-full p-1.5 hover:bg-[#f3f3f3]"
                    aria-label="Profile"
                  >
                    <User className="h-5 w-5" />
                    <ChevronDown
                      className={`h-4 w-4 transition ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[#e0e0e0] bg-white shadow-xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-[#efefef]">
                        <p className="font-medium text-[#222]">{user?.name}</p>
                        <p className="text-sm text-[#666]">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-[#d90f0f]/10 text-[#d90f0f] text-xs rounded-full capitalize">
                          {user?.role === 'CUSTOMER'
                            ? 'Khách hàng'
                            : user?.role}
                        </span>
                      </div>

                      {/* Cart in dropdown - only for customers */}
                      {!isStaffRole && (
                        <Link
                          to="/cart"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center justify-between px-4 py-2.5 text-[#666] hover:bg-[#f3f3f3] hover:text-[#d90f0f]"
                        >
                          <div className="flex items-center gap-3">
                            <ShoppingBag className="h-4 w-4" />
                            <span className="text-sm">Giỏ hàng</span>
                          </div>
                          {cartItemCount > 0 && (
                            <span className="bg-[#d90f0f] text-white text-xs px-1.5 py-0.5 rounded-full">
                              {cartItemCount}
                            </span>
                          )}
                        </Link>
                      )}

                      <div className="pt-1">
                        <Link
                          to={dashboardLink}
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[#666] hover:bg-[#f3f3f3] hover:text-[#d90f0f]"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span className="text-sm">{dashboardLabel}</span>
                        </Link>

                        {(user?.role === ROLES.ADMIN ||
                          user?.role === ROLES.MANAGER) && (
                            <Link
                              to={
                                user?.role === ROLES.ADMIN
                                  ? '/admin/settings'
                                  : '/manager/settings'
                              }
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-[#666] hover:bg-[#f3f3f3] hover:text-[#d90f0f]"
                            >
                              <Settings className="h-4 w-4" />
                              <span className="text-sm">Cài đặt</span>
                            </Link>
                          )}

                        <div className="border-t border-[#efefef] mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm">Đăng xuất</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Not logged in - show Cart + Login buttons
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    state={{ from: location.pathname }}
                    className="flex items-center gap-2 px-5 py-2 bg-[#d90f0f] text-white rounded-full text-sm font-medium hover:bg-[#b00c0c] transition"
                  >
                    <User className="h-4 w-4" />
                    Đăng nhập
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-[#efefef] bg-white lg:hidden">
          <div className="mx-auto max-w-[1180px] px-4 py-4 space-y-2">
            <button
              onClick={() => setIsMobileProductsOpen(!isMobileProductsOpen)}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-[#666] hover:bg-[#f3f3f3]"
            >
              <span>Sản phẩm</span>
              <ChevronDown
                className={`h-4 w-4 transition ${isMobileProductsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isMobileProductsOpen && (
              <div className="space-y-1 rounded-xl border border-[#e0e0e0] p-2">
                {productLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-2 text-sm ${isActive ? 'bg-[#d90f0f]/10 text-[#d90f0f]' : 'text-[#666]'}`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-semibold ${isActive ? 'bg-[#d90f0f]/10 text-[#d90f0f]' : 'text-[#666]'}`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <div className="border-t border-[#efefef] pt-2 mt-2">
                <Link
                  to={dashboardLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#d90f0f]"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {dashboardLabel}
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#666]"
                >
                  <User className="h-4 w-4" />
                  Thông tin tài khoản
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-red-500"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="border-t border-[#efefef] pt-2 mt-2">
                <Link
                  to="/login"
                  state={{ from: location.pathname }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold bg-[#d90f0f] text-white"
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <main>
        <Outlet />
      </main>

      <footer className="bg-black pb-10 pt-14 text-white">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-lg font-semibold text-white">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-[#b7b7b7]">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h3 className="text-lg font-semibold text-white">Liên hệ</h3>
              <div className="mt-4 flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    aria-label={social.label}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#3a3a3a] text-[#d5d5d5] transition hover:border-white hover:text-white"
                  >
                    {social.label[0]}
                  </a>
                ))}
              </div>
              <p className="mt-4 text-sm text-[#b7b7b7]">
                admin@cclearly.com
              </p>
              <p className="text-sm text-[#b7b7b7]">+84 328679007 </p>
            </div>
          </div>

          <p className="mt-12 text-center text-xs text-[#7a7a7a]">
            © 1996-2024
          </p>
        </div>
      </footer>

      <SupportChat />
    </div>
  );
};

export { MainLayout };

