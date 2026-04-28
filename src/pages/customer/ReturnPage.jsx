// Return & Complaint Page
import { Lock, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserOrders, useRequestReturn } from '@/hooks/useOrder';

const ReturnPage = () => {
  const { isAuthenticated } = useAuth();
  const { data: orders = [], isLoading } = useUserOrders();
  const requestReturnMutation = useRequestReturn();
  const [formData, setFormData] = useState({
    orderId: '',
    type: 'return',
    reason: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);

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
          <p className="text-[#4f5562] mb-8">Đăng nhập để yêu cầu đổi trả</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    requestReturnMutation.mutate(
      {
        orderId: formData.orderId,
        data: {
          type: formData.type,
          reason: formData.reason,
          description: formData.description,
        },
      },
      {
        onSuccess: () => setSubmitted(true),
      }
    );
  };

  if (submitted) {
    return (
      <div className="bg-[#ececec] min-h-screen py-10">
        <div className="max-w-[1180px] mx-auto px-4 text-center py-20">
          <div className="bg-white rounded-2xl p-8 shadow-[0_10px_30px_rgba(13,22,39,0.06)]">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#222] mb-2">
              Yêu cầu đã được gửi!
            </h2>
            <p className="text-[#4f5562] mb-6">
              Chúng tôi sẽ xử lý trong 24-48 giờ.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-[#d90f0f] font-medium"
            >
              Gửi yêu cầu khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#ececec] min-h-screen py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-[#222] mb-8">
          Yêu cầu đổi trả & khiếu nại
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(13,22,39,0.06)] space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-[#222] mb-2">
              Chọn đơn hàng
            </label>
            <select
              value={formData.orderId}
              onChange={(e) =>
                setFormData({ ...formData, orderId: e.target.value })
              }
              className="w-full px-5 py-3 border border-[#e0e0e0] rounded-full focus:outline-none focus:border-[#d90f0f] bg-[#f9f9f9]"
              required
            >
              <option value="">Chọn đơn hàng...</option>
              {orders.map((order) => (
                <option
                  key={order.orderId || order.id}
                  value={order.orderId || order.id}
                >
                  {order.code || order.orderId || order.id} -{' '}
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(order.finalAmount || order.totalAmount)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#222] mb-2">
              Loại yêu cầu
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="return"
                  checked={formData.type === 'return'}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                />
                <span className="text-[#222]">Đổi trả hàng</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="complaint"
                  checked={formData.type === 'complaint'}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                />
                <span className="text-[#222]">Khiếu nại</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#222] mb-2">
              Lý do
            </label>
            <select
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="w-full px-5 py-3 border border-[#e0e0e0] rounded-full focus:outline-none focus:border-[#d90f0f] bg-[#f9f9f9]"
              required
            >
              <option value="">Chọn lý do...</option>
              <option value="wrong_product">Sản phẩm không đúng</option>
              <option value="damaged">Sản phẩm bị hư hỏng</option>
              <option value="not_fit">Không vừa size</option>
              <option value="other">Lý do khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#222] mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-5 py-3 border border-[#e0e0e0] rounded-2xl focus:outline-none focus:border-[#d90f0f] bg-[#f9f9f9]"
              placeholder="Mô tả chi tiết vấn đề..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#361414] text-white py-4 rounded-full font-medium hover:bg-[#0d1322]"
          >
            Gửi yêu cầu
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReturnPage;

