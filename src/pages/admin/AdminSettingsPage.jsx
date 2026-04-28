import {
  Globe,
  CreditCard,
  Truck,
  Save,
  ChevronRight,
  Mail,
  Wrench,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import PaymentTab from '@/components/admin/setting/PaymentTab';
import { SectionHeader, FormField } from '@/components/common/CommonControls';
import { useAdminSettings, useUpdateSettings } from '@/hooks/useAdmin';

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [localSettings, setLocalSettings] = useState({});

  const { data: settingsData, isLoading } = useAdminSettings();
  const updateSettingsMutation = useUpdateSettings();

  useEffect(() => {
    if (settingsData) {
      const settingsArray = Array.isArray(settingsData) ? settingsData : [];
      const map = {};
      settingsArray.forEach((s) => {
        map[s.key] = s.value;
      });
      setLocalSettings(map);
    }
  }, [settingsData]);

  const getSetting = (key, fallback = '') => localSettings[key] ?? fallback;

  const updateLocal = (key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const maintenanceMode = getSetting('maintenance_mode', 'false') === 'true';

  const tabs = [
    {
      key: 'general',
      label: 'Cấu hình chung',
      icon: Globe,
      description: 'Tên cửa hàng, SEO, liên hệ',
    },
    {
      key: 'payments',
      label: 'Thanh toán',
      icon: CreditCard,
      description: 'Cổng thanh toán PayOS',
    },
    {
      key: 'shipping',
      label: 'Vận chuyển',
      icon: Truck,
      description: 'Phí vận chuyển',
    },
    {
      key: 'email',
      label: 'Email',
      icon: Mail,
      description: 'Header & footer email hệ thống',
    },
  ];

  const handleSave = () => {
    updateSettingsMutation.mutate(localSettings);
  };

  const handleToggleMaintenance = () => {
    const newValue = maintenanceMode ? 'false' : 'true';
    const updated = { ...localSettings, maintenance_mode: newValue };
    setLocalSettings(updated);
    updateSettingsMutation.mutate(updated);
  };

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      );
    }

    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-8">
            <SectionHeader
              title="Cấu hình chung"
              description="Thông tin cơ bản website"
            />
            <div className="grid grid-cols-2 gap-6">
              <FormField
                label="Tên cửa hàng"
                defaultValue={getSetting(
                  'store_name',
                  'CClearly - Eye Care Center'
                )}
                onChange={(e) => updateLocal('store_name', e.target.value)}
              />
              <FormField
                label="Slogan"
                defaultValue={getSetting('slogan', 'See Clearly, Live Better')}
                onChange={(e) => updateLocal('slogan', e.target.value)}
              />
              <FormField
                label="Email hỗ trợ"
                defaultValue={getSetting(
                  'support_email',
                  'support@cclearly.com'
                )}
                onChange={(e) => updateLocal('support_email', e.target.value)}
              />
              <FormField
                label="Số điện thoại"
                defaultValue={getSetting('support_phone', '091 234 5678')}
                onChange={(e) => updateLocal('support_phone', e.target.value)}
              />
            </div>
          </div>
        );

      case 'payments':
        return <PaymentTab />;

      case 'shipping':
        return (
          <div className="space-y-8">
            <SectionHeader
              title="Cấu hình vận chuyển"
              description="Thiết lập phí vận chuyển cho đơn hàng"
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                label="Phí vận chuyển mặc định (₫)"
                type="number"
                defaultValue={getSetting('shipping_fee', '30000')}
                onChange={(e) => updateLocal('shipping_fee', e.target.value)}
                placeholder="VD: 30000"
              />
              <FormField
                label="Miễn phí ship từ (₫)"
                type="number"
                defaultValue={getSetting('free_shipping_threshold', '500000')}
                onChange={(e) =>
                  updateLocal('free_shipping_threshold', e.target.value)
                }
                placeholder="VD: 500000"
              />
            </div>

            <div className="bg-blue-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
              <p className="font-medium mb-1">Lưu ý:</p>
              <p>
                Đơn hàng có tổng giá trị lớn hơn hoặc bằng mức "Miễn phí ship
                từ" sẽ được miễn phí vận chuyển.
              </p>
            </div>
          </div>
        );

      case 'email': {
        const bannerTitle = getSetting('email_banner_title', 'CClearly');
        const bannerSubtitle = getSetting('email_banner_subtitle', '');
        const bannerColor = getSetting('email_banner_color', '#4F46E5');
        const footerText = getSetting(
          'email_footer_text',
          '© 2024 CClearly. All rights reserved.'
        );

        const presetColors = [
          { color: '#4F46E5', label: 'Mặc định' },
          { color: '#DC2626', label: 'Tết / Giáng Sinh' },
          { color: '#059669', label: 'Lễ hội mùa xuân' },
          { color: '#D97706', label: 'Halloween' },
          { color: '#7C3AED', label: 'Ngày Phụ nữ' },
          { color: '#0284C7', label: 'Mùa hè' },
        ];

        return (
          <div className="space-y-8">
            <SectionHeader
              title="Tuỳ chỉnh email hệ thống"
              description="Thay đổi banner và chân trang cho tất cả email gửi ra (OTP, đặt lại mật khẩu, chào mừng). Phù hợp để cập nhật theo các dịp lễ, sự kiện trong năm."
            />

            {/* Banner settings */}
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Banner (Header)
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  label="Tiêu đề banner"
                  value={bannerTitle}
                  placeholder="VD: CClearly 🎄 Merry Christmas"
                  onChange={(e) =>
                    updateLocal('email_banner_title', e.target.value)
                  }
                />
                <FormField
                  label="Phụ đề / thông điệp (tuỳ chọn)"
                  value={bannerSubtitle}
                  placeholder="VD: Chúc mừng năm mới 2026!"
                  onChange={(e) =>
                    updateLocal('email_banner_subtitle', e.target.value)
                  }
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu nền banner
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  {presetColors.map((p) => (
                    <button
                      key={p.color}
                      onClick={() => updateLocal('email_banner_color', p.color)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        bannerColor === p.color
                          ? 'border-gray-800 shadow-sm ring-1 ring-gray-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: p.color }}
                      />
                      {p.label}
                    </button>
                  ))}
                  <div className="flex items-center gap-2 ml-2">
                    <input
                      type="color"
                      value={bannerColor}
                      onChange={(e) =>
                        updateLocal('email_banner_color', e.target.value)
                      }
                      className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                    />
                    <input
                      type="text"
                      value={bannerColor}
                      onChange={(e) =>
                        updateLocal('email_banner_color', e.target.value)
                      }
                      className="w-24 border rounded-lg px-2 py-1.5 text-xs font-mono text-center"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Chân trang (Footer)
              </h3>
              <div>
                <textarea
                  value={footerText}
                  onChange={(e) =>
                    updateLocal('email_footer_text', e.target.value)
                  }
                  rows={2}
                  placeholder="VD: © 2024 CClearly. All rights reserved."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-200 outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Hiển thị ở cuối mỗi email. Có thể ghi bản quyền, địa chỉ,
                  hotline, hoặc lời chúc theo dịp lễ.
                </p>
              </div>
            </div>

            {/* Live preview */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Xem trước email mẫu
              </h3>
              <div className="border rounded-xl overflow-hidden shadow-sm max-w-lg mx-auto">
                {/* Header banner */}
                <div
                  className="text-white text-center py-5 px-4"
                  style={{ backgroundColor: bannerColor }}
                >
                  <h1 className="text-xl font-bold m-0">
                    {bannerTitle || 'CClearly'}
                  </h1>
                  {bannerSubtitle && (
                    <p className="text-sm opacity-85 mt-1">{bannerSubtitle}</p>
                  )}
                </div>

                {/* Content preview */}
                <div className="bg-gray-50 px-5 py-4 text-sm text-gray-700 space-y-2">
                  <p>
                    Xin chào <strong>Nguyễn Văn A</strong>,
                  </p>
                  <p>
                    Cảm ơn bạn đã đăng ký tài khoản tại CClearly. Vui lòng sử
                    dụng mã OTP bên dưới để xác thực email của bạn:
                  </p>
                  <div
                    className="text-center text-2xl font-bold tracking-[5px] py-4 bg-white rounded-lg my-3"
                    style={{ color: bannerColor }}
                  >
                    123456
                  </div>
                  <p>
                    Mã OTP này có hiệu lực trong <strong>5 phút</strong>.
                  </p>
                </div>

                {/* Footer */}
                <div className="text-center py-4 px-4 text-xs text-gray-400">
                  <p className="whitespace-pre-line">
                    {footerText || '© 2024 CClearly. All rights reserved.'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Bản xem trước mô phỏng email OTP — tất cả loại email đều dùng
                chung header & footer.
              </p>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Cấu hình hệ thống
          </h1>
          <p className="text-gray-500 text-sm">
            Quản lý toàn bộ cấu hình hệ thống
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Maintenance toggle */}
          <button
            onClick={handleToggleMaintenance}
            disabled={updateSettingsMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              maintenanceMode
                ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
            }`}
          >
            <Wrench size={16} />
            <span>{maintenanceMode ? 'Đang bảo trì' : 'Hoạt động'}</span>
            <span
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                maintenanceMode ? 'bg-red-500' : 'bg-green-500'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  maintenanceMode ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {updateSettingsMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-12 gap-6 text-left">
        {/* Sidebar */}
        <div className="col-span-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                activeTab === tab.key
                  ? 'bg-white border-gray-200 shadow-sm'
                  : 'border-transparent hover:bg-gray-50'
              }`}
            >
              <tab.icon
                size={18}
                className={
                  activeTab === tab.key ? 'text-red-600' : 'text-gray-400'
                }
              />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">{tab.label}</div>
                <div className="text-xs text-gray-400 truncate">
                  {tab.description}
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>

        {/* Main panel */}
        <div className="col-span-9 bg-white border border-gray-100 rounded-xl p-8 min-h-[500px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;

