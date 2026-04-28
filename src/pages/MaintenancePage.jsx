import { Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MaintenancePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Top bar with login button */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => navigate('/login')}
          className="text-sm text-gray-400 hover:text-gray-600 px-4 py-2 rounded-lg hover:bg-white/60 transition-colors"
        >
          Đăng nhập
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
            <Wrench className="w-10 h-10 text-amber-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Hệ thống đang bảo trì
          </h1>

          {/* Description */}
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            Chúng tôi đang nâng cấp hệ thống để mang đến trải nghiệm tốt hơn.
            <br />
            Vui lòng quay lại sau ít phút.
          </p>

          {/* Decorative dots */}
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-gray-400">
        © {new Date().getFullYear()} CClearly. All rights reserved.
      </div>
    </div>
  );
};

export default MaintenancePage;

