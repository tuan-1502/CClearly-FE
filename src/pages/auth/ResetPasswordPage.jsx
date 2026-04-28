import { Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPassword } from '@/hooks/useAuth';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetPassword = useResetPassword();

  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      navigate('/forgot-password', { replace: true });
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      await resetPassword.mutateAsync({
        token,
        newPassword: formData.newPassword,
      });
      setSuccess(true);
    } catch {
      setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-[#ececec] rounded-full flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-[#222]">
          Đặt lại mật khẩu thành công!
        </h2>
        <p className="text-[#4f5562] mb-6">
          Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập với mật khẩu
          mới.
        </p>
        <Link
          to="/login"
          className="inline-block bg-[#361414] text-white px-8 py-3 rounded-full font-medium hover:bg-[#0d1322] transition"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div>
      {/* Logo */}
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

      <h2 className="text-3xl font-bold text-[#222] mb-2">Đặt lại mật khẩu</h2>
      <p className="text-[#4f5562] mb-8">
        Nhập mật khẩu mới cho tài khoản của bạn
      </p>

      {error && (
        <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#222] mb-2">
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-5 py-3.5 pr-12 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#d90f0f] focus:ring-2 focus:ring-[#d90f0f]/10 bg-white"
              placeholder="Nhập mật khẩu mới"
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
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-5 py-3.5 pr-12 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#d90f0f] focus:ring-2 focus:ring-[#d90f0f]/10 bg-white"
              placeholder="Nhập lại mật khẩu mới"
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
          disabled={resetPassword.isPending}
          className="w-full bg-[#361414] text-white py-4 rounded-full font-medium hover:bg-[#0d1322] disabled:bg-gray-300 transition"
        >
          {resetPassword.isPending ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        </button>
      </form>

      <p className="mt-8 text-center text-[#4f5562]">
        <Link
          to="/login"
          className="text-[#d90f0f] hover:underline font-medium"
        >
          ← Quay lại đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default ResetPasswordPage;

