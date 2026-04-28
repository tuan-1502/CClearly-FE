import { AlertTriangle } from 'lucide-react';
import React from 'react';
import { SectionHeader, FormField } from '@/components/common/CommonControls';

const PaymentTab = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <SectionHeader
        title="Cấu hình thanh toán PayOS"
        description="Quản lý cổng thanh toán trực tuyến VietQR qua PayOS"
      />

      <div className="bg-blue-50 border border-red-100 rounded-xl p-5 flex items-center gap-4">
        <img
          src="https://about.cas.so/wp-content/uploads/sites/11/2023/08/cropped-Untitled-1.png"
          alt="PayOS"
          className="h-8 object-contain"
        />
        <div>
          <p className="text-sm font-bold text-red-700">
            Tích hợp thanh toán QR Code
          </p>
          <p className="text-xs text-red-600">
            Nhận tiền ngay qua tài khoản ngân hàng với phí 0%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <FormField label="Client ID" placeholder="Nhập Client ID từ PayOS" />
        <div className="grid grid-cols-2 gap-6">
          <FormField
            label="API Key"
            type="password"
            placeholder="Nhập API Key"
          />
          <FormField
            label="Checksum Key"
            type="password"
            placeholder="Nhập Checksum Key"
          />
        </div>
        <FormField
          label="Webhook URL"
          defaultValue="https://api.cclearly.com/v1/payments/payos-webhook"
          readOnly
          className="bg-gray-50 text-gray-500 italic"
        />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700">
          <p className="font-bold">Lưu ý bảo mật:</p>
          <p>
            Không chia sẻ các thông tin API Key và Checksum Key cho bất kỳ ai.
            Các thông tin này được lấy từ trang Dashboard của PayOS.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentTab;

