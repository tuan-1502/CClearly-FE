import { GoogleLogin } from '@react-oauth/google';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLogin, useLoginWithGoogle } from '@/hooks/useAuth';
import { useSyncGuestCart } from '@/hooks/useCart';

const STAFF_DASHBOARDS = {
  ADMIN: '/admin',
  MANAGER: '/manager',
  SALES_STAFF: '/sales',
  OPERATION_STAFF: '/operations',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const loginWithGoogle = useLoginWithGoogle();
  const syncGuestCart = useSyncGuestCart();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const from = location.state?.from?.pathname || location.state?.from || '/';

  // Show success message from verify-email or reset-password redirect
  const toastShownRef = useRef(false);
  useEffect(() => {
    if (location.state?.message && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.success(location.state.message);
      window.history.replaceState({}, '');
    }
  }, [location.state?.message]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login.mutateAsync(formData);
      // If email is not verified, redirect to verify-email page
      if (data?.user?.isEmailVerified === false) {
        navigate('/verify-email', {
          replace: true,
          state: { email: formData.email },
        });
        return;
      }
      const role = data?.user?.role;
      // Sync guest cart to server after login (customer only)
      if (!role || role === 'CUSTOMER') {
        await syncGuestCart();
      }
      const dest = STAFF_DASHBOARDS[role] || from;
      navigate(dest, { replace: true });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await loginWithGoogle.mutateAsync(
        credentialResponse.credential
      );
      if (data?.user?.isEmailVerified === false) {
        navigate('/verify-email', {
          replace: true,
          state: { email: data.user.email },
        });
        return;
      }
      const role = data?.user?.role;
      // Sync guest cart to server after login (customer only)
      if (!role || role === 'CUSTOMER') {
        await syncGuestCart();
      }
      const dest = STAFF_DASHBOARDS[role] || from;
      navigate(dest, { replace: true });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleGoogleError = () => {
    toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
  };

  return (
    <div>
      {/* Logo - Desktop */}
      <Link
        to="/"
        className="hidden lg:flex items-center justify-center gap-2 mb-8 hover:opacity-80 transition-opacity"
      >
        <svg
          viewBox="0 0 120 40"
          className="h-10 w-24"
          fill="none"
          stroke="#222"
          strokeWidth="2"
        >
          <circle cx="34" cy="20" r="12" />
          <circle cx="66" cy="20" r="12" />
          <path d="M46 20h8" strokeLinecap="round" />
        </svg>
      </Link>

      <h2 className="text-3xl font-bold text-[#222] mb-2">Đăng nhập</h2>
      <p className="text-[#4f5562] mb-8">
        Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#222] mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-5 py-3 border border-[#e0e0e0] rounded-full focus:outline-none focus:border-[#d90f0f] bg-[#f9f9f9]"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#222] mb-2">
            Mật khẩu
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-5 py-3 border border-[#e0e0e0] rounded-full focus:outline-none focus:border-[#d90f0f] bg-[#f9f9f9]"
            placeholder="••••••••"
          />
        </div>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-[#d90f0f] hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full bg-[#361414] text-white py-4 rounded-full font-medium hover:bg-[#0d1322] disabled:bg-gray-300 transition"
        >
          {login.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="my-8 relative flex items-center">
        <div className="flex-1 h-px bg-[#e0e0e0]"></div>
        <span className="px-4 text-sm text-[#4f5562]">hoặc</span>
        <div className="flex-1 h-px bg-[#e0e0e0]"></div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          size="large"
          width="100%"
          text="continue_with"
          shape="pill"
          locale="vi"
        />
      </div>

      <p className="mt-8 text-center text-[#4f5562]">
        Chưa có tài khoản?{' '}
        <Link
          to="/register"
          state={{ from: location.state?.from?.pathname || location.state?.from }}
          className="text-[#d90f0f] hover:underline font-medium"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;

