import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useRegister } from '@/hooks/useAuth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const register = useRegister();

  const from = location.state?.from;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await register.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      // Redirect to verify email page with email in state
      navigate('/verify-email', {
        replace: true,
        state: { email: formData.email, from },
      });
    } catch (error) {
      // Error handled by hook
    }
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

      <h2 className="text-3xl font-bold text-[#222] mb-2">Tạo tài khoản</h2>
      <p className="text-[#4f5562] mb-8">
        Đăng ký để trải nghiệm mua sắm tiện lợi
      </p>

      {error && (
        <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#222] mb-2">
            Họ tên *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-5 py-3.5 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#d90f0f] focus:ring-2 focus:ring-[#d90f0f]/10 bg-white"
            placeholder="Nguyễn Văn A"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#222] mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-5 py-3.5 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#d90f0f] focus:ring-2 focus:ring-[#d90f0f]/10 bg-white"
            placeholder="email@cuaban.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#222] mb-2">
            Số điện thoại
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-5 py-3.5 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#d90f0f] focus:ring-2 focus:ring-[#d90f0f]/10 bg-white"
            placeholder="0912 345 678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#222] mb-2">
            Mật khẩu *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-5 py-3.5 pr-12 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#d90f0f] focus:ring-2 focus:ring-[#d90f0f]/10 bg-white"
              placeholder="Nhập mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7b8494] hover:text-[#222]"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#222] mb-2">
            Xác nhận mật khẩu *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-5 py-3.5 pr-12 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#d90f0f] focus:ring-2 focus:ring-[#d90f0f]/10 bg-white"
              placeholder="Nhập lại mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7b8494] hover:text-[#222]"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={register.isPending}
          className="w-full bg-[#361414] text-white py-4 rounded-xl font-medium hover:bg-[#0d1322] disabled:bg-gray-300 transition mt-2"
        >
          {register.isPending ? 'Đang đăng ký...' : 'Tạo tài khoản'}
        </button>
      </form>

      <p className="mt-8 text-center text-[#4f5562]">
        Đã có tài khoản?{' '}
        <Link
          to="/login"
          state={{ from }}
          className="text-[#d90f0f] hover:underline font-medium"
        >
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;

