import {
  CreditCard,
  Truck,
  MessageSquare,
  Code,
  X,
  Save,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

const IntegrationPage = () => {
  const [showPayOSModal, setShowPayOSModal] = useState(false);
  const [payOSConfig, setPayOSConfig] = useState({
    clientId: 'PAYOS_CLIENT_ID',
    apiKey: '',
    checksumKey: '',
    environment: 'sandbox',
    webhookUrl: 'https://cclearly.com/api/payment/webhook',
    isConnected: false,
  });

  const handleSavePayOS = () => {
    toast.success('Đã lưu cấu hình PayOS!');
    setShowPayOSModal(false);
  };

  const handleTestConnection = () => {
    toast.info('Đang kiểm tra kết nối...');
    setTimeout(() => {
      setPayOSConfig({ ...payOSConfig, isConnected: true });
      toast.success('Kết nối PayOS thành công!');
    }, 1500);
  };

  const integrations = [
    {
      icon: CreditCard,
      title: 'Cổng thanh toán',
      services: ['VNPay', 'Momo', 'PayOS'],
      status: 'active',
      color: 'bg-emerald-50 text-emerald-600',
      hasConfig: true,
      onConfig: () => setShowPayOSModal(true),
    },
    {
      icon: Truck,
      title: 'Đơn vị vận chuyển',
      services: ['Giao Hàng Nhanh', 'Giao Hàng Tiết Kiệm'],
      status: 'setup',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: MessageSquare,
      title: 'Dịch vụ Tin nhắn (SMS/Zalo)',
      services: ['eSMS', 'Zalo OA'],
      status: 'inactive',
      color: 'bg-gray-100 text-gray-500',
    },
    {
      icon: Code,
      title: 'API & Webhooks',
      services: ['Cấu hình hệ thống API'],
      status: 'active',
      color: 'bg-blue-50 text-red-600',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#222]">Cấu hình tích hợp</h1>
        <p className="text-[#4f5562] mt-1">
          Kết nối và quản lý các dịch vụ bên thứ ba (Thanh toán, Vận chuyển,
          Marketing)
        </p>
      </div>

      <div className="space-y-6">
        {integrations.map((item, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                <item.icon className="w-7 h-7 text-[#222]" />
              </div>
              <div>
                <h3 className="font-bold text-[#222] text-lg">{item.title}</h3>
                <div className="flex gap-2 mt-1">
                  {item.services.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span
                className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${item.color}`}
              >
                {item.status === 'active'
                  ? 'Đã kết nối'
                  : item.status === 'setup'
                    ? 'Đang thiết lập'
                    : 'Chưa kích hoạt'}
              </span>
              <button
                onClick={item.onConfig}
                className="bg-[#f3f3f3] text-[#222] px-5 py-2 rounded-full text-xs font-bold hover:bg-[#ececec] transition"
              >
                Cấu hình
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PayOS Modal */}
      {showPayOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-[#222]">Cấu hình PayOS</h3>
              <button
                onClick={() => setShowPayOSModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Connection Status */}
              <div
                className={`p-4 rounded-xl flex items-center gap-3 ${payOSConfig.isConnected ? 'bg-green-50' : 'bg-gray-50'}`}
              >
                {payOSConfig.isConnected ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
                <span
                  className={
                    payOSConfig.isConnected ? 'text-green-700' : 'text-gray-500'
                  }
                >
                  {payOSConfig.isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222] mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  value={payOSConfig.clientId}
                  onChange={(e) =>
                    setPayOSConfig({ ...payOSConfig, clientId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222] mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={payOSConfig.apiKey}
                  onChange={(e) =>
                    setPayOSConfig({ ...payOSConfig, apiKey: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
                  placeholder="Nhập API Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222] mb-1">
                  Checksum Key
                </label>
                <input
                  type="password"
                  value={payOSConfig.checksumKey}
                  onChange={(e) =>
                    setPayOSConfig({
                      ...payOSConfig,
                      checksumKey: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
                  placeholder="Nhập Checksum Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222] mb-1">
                  Môi trường
                </label>
                <select
                  value={payOSConfig.environment}
                  onChange={(e) =>
                    setPayOSConfig({
                      ...payOSConfig,
                      environment: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
                >
                  <option value="sandbox">Sandbox (Thử nghiệm)</option>
                  <option value="production">Production (Thực tế)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222] mb-1">
                  Webhook URL
                </label>
                <input
                  type="text"
                  value={payOSConfig.webhookUrl}
                  onChange={(e) =>
                    setPayOSConfig({
                      ...payOSConfig,
                      webhookUrl: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
                  placeholder="https://your-domain.com/api/webhook"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL nhận thông báo thanh toán từ PayOS
                </p>
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <button
                onClick={handleTestConnection}
                className="flex-1 px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
              >
                Kiểm tra kết nối
              </button>
              <button
                onClick={handleSavePayOS}
                className="flex-1 px-5 py-2.5 bg-[#d90f0f] text-white rounded-xl hover:bg-[#b00c0c] font-medium flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationPage;

