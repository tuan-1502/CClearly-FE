import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '@/hooks/useAuth';

const ForgotPasswordPage = () => {
  const forgotPassword = useForgotPassword();

  const [formData, setFormData] = useState({
    email: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword.mutateAsync(formData.email);
      setSubmitted(true);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (submitted) {
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
          Kiểm tra email của bạn
        </h2>
        <p className="text-[#4f5562] mb-6">
          Chúng tôi đã gửi link khôi phục mật khẩu đến email của bạn.
        </p>
        <Link
          to="/login"
          className="text-[#d90f0f] hover:underline font-medium"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

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

      <h2 className="text-3xl font-bold text-[#222] mb-2">Quên mật khẩu</h2>
      <p className="text-[#4f5562] mb-8 text-center">
        Nhập email của bạn để nhận link khôi phục mật khẩu
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

        <button
          type="submit"
          disabled={forgotPassword.isPending}
          className="w-full bg-[#361414] text-white py-4 rounded-full font-medium hover:bg-[#0d1322] disabled:bg-gray-300 transition"
        >
          {forgotPassword.isPending ? 'Đang gửi...' : 'Gửi link khôi phục'}
        </button>
      </form>

      <p className="mt-8 text-center text-[#4f5562]">
        Nhớ mật khẩu rồi?{' '}
        <Link
          to="/login"
          className="text-[#d90f0f] hover:underline font-medium"
        >
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;

