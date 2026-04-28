// Notification Settings Page
import { Lock } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationSettings } from '@/mocks/data';

const NotificationPage = () => {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState(notificationSettings);

  if (!isAuthenticated) {
    return (
      <div className="bg-[#ececec] min-h-screen py-10">
        <div className="max-w-[1180px] mx-auto px-4 text-center py-20">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-12 h-12 text-gray-500" />
          </div>
          <h2 className="text-3xl font-bold text-[#222] mb-4">
            Vui lòng đăng nhập
          </h2>
          <p className="text-[#4f5562] mb-8">Đăng nhập để quản lý thông báo</p>
        </div>
      </div>
    );
  }

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="bg-[#ececec] min-h-screen py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-[#222] mb-8">
          Cài đặt thông báo
        </h1>

        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)] space-y-6">
          <h2 className="text-xl font-semibold text-[#222]">Email</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#222]">Thông báo đơn hàng</p>
              <p className="text-sm text-[#4f5562]">
                Nhận email về trạng thái đơn hàng
              </p>
            </div>
            <button
              onClick={() => handleToggle('emailOrder')}
              className={`w-12 h-6 rounded-full transition ${settings.emailOrder ? 'bg-[#d90f0f]' : 'bg-gray-300'}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition ${settings.emailOrder ? 'translate-x-6' : 'translate-x-0.5'}`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#222]">Khuyến mãi</p>
              <p className="text-sm text-[#4f5562]">
                Nhận email về khuyến mãi mới
              </p>
            </div>
            <button
              onClick={() => handleToggle('emailPromotion')}
              className={`w-12 h-6 rounded-full transition ${settings.emailPromotion ? 'bg-[#d90f0f]' : 'bg-gray-300'}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition ${settings.emailPromotion ? 'translate-x-6' : 'translate-x-0.5'}`}
              ></div>
            </button>
          </div>

          <h2 className="text-xl font-semibold text-[#222] pt-4">SMS</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#222]">Thông báo đơn hàng</p>
              <p className="text-sm text-[#4f5562]">
                Nhận SMS về trạng thái đơn hàng
              </p>
            </div>
            <button
              onClick={() => handleToggle('smsOrder')}
              className={`w-12 h-6 rounded-full transition ${settings.smsOrder ? 'bg-[#d90f0f]' : 'bg-gray-300'}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition ${settings.smsOrder ? 'translate-x-6' : 'translate-x-0.5'}`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#222]">Khuyến mãi</p>
              <p className="text-sm text-[#4f5562]">Nhận SMS về khuyến mãi</p>
            </div>
            <button
              onClick={() => handleToggle('smsPromotion')}
              className={`w-12 h-6 rounded-full transition ${settings.smsPromotion ? 'bg-[#d90f0f]' : 'bg-gray-300'}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition ${settings.smsPromotion ? 'translate-x-6' : 'translate-x-0.5'}`}
              ></div>
            </button>
          </div>

          <h2 className="text-xl font-semibold text-[#222] pt-4">In-App</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#222]">Thông báo đơn hàng</p>
              <p className="text-sm text-[#4f5562]">
                Nhận thông báo trong ứng dụng
              </p>
            </div>
            <button
              onClick={() => handleToggle('inAppOrder')}
              className={`w-12 h-6 rounded-full transition ${settings.inAppOrder ? 'bg-[#d90f0f]' : 'bg-gray-300'}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition ${settings.inAppOrder ? 'translate-x-6' : 'translate-x-0.5'}`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#222]">Khuyến mãi</p>
              <p className="text-sm text-[#4f5562]">
                Nhận thông báo khuyến mãi trong ứng dụng
              </p>
            </div>
            <button
              onClick={() => handleToggle('inAppPromotion')}
              className={`w-12 h-6 rounded-full transition ${settings.inAppPromotion ? 'bg-[#d90f0f]' : 'bg-gray-300'}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition ${settings.inAppPromotion ? 'translate-x-6' : 'translate-x-0.5'}`}
              ></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;

