import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useVerifyEmail, useResendVerification } from '@/hooks/useAuth';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();

  // Get email and redirect-from from navigation state (passed from RegisterPage)
  const email = location.state?.email || '';
  const from = location.state?.from;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last digit
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on Backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split('');
    setOtp(digits);
    inputRefs.current[5]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số');
      return;
    }

    try {
      await verifyEmail.mutateAsync({ email, otpCode });
      navigate('/login', {
        replace: true,
        state: {
          message: 'Email đã được xác thực thành công! Vui lòng đăng nhập.',
          from,
        },
      });
    } catch {
      setError('Mã OTP không hợp lệ hoặc đã hết hạn');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await resendVerification.mutateAsync(email);
      setCanResend(false);
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      // Error handled by hook
    }
  };

  if (!email) return null;

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

      <div className="text-center">
        <div className="w-16 h-16 bg-[#ececec] rounded-full flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-8 h-8 text-[#d90f0f]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-[#222] mb-2">Xác thực email</h2>
        <p className="text-[#4f5562] mb-2">
          Chúng tôi đã gửi mã xác thực 6 chữ số đến
        </p>
        <p className="text-[#222] font-medium mb-8">{email}</p>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input Grid */}
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-14 text-center text-xl font-bold border-2 border-[#e0e0e0] rounded-xl 
                         focus:outline-none focus:border-[#d90f0f] focus:ring-2 focus:ring-[#d90f0f]/10 
                         bg-white transition-colors"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={verifyEmail.isPending || otp.join('').length !== 6}
          className="w-full bg-[#361414] text-white py-4 rounded-full font-medium hover:bg-[#0d1322] 
                     disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {verifyEmail.isPending ? 'Đang xác thực...' : 'Xác thực'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[#4f5562] text-sm">
          Chưa nhận được mã?{' '}
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resendVerification.isPending}
              className="text-[#d90f0f] hover:underline font-medium"
            >
              {resendVerification.isPending ? 'Đang gửi...' : 'Gửi lại mã'}
            </button>
          ) : (
            <span className="text-[#7b8494]">Gửi lại sau {countdown}s</span>
          )}
        </p>
      </div>

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

export default VerifyEmailPage;

