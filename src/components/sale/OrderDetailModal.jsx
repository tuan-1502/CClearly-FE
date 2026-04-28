import {
  X,
  Package,
  User,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  RotateCcw,
  Mail,
} from 'lucide-react';

const STATUS_MAP = {
  PENDING: {
    label: 'Chờ xác nhận',
    bg: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    bg: 'bg-blue-50 text-red-700 border-red-200',
    icon: CheckCircle,
  },
  SHIPPED: {
    label: 'Đang giao hàng',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Đã giao',
    bg: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Đã hủy',
    bg: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
  },
  RETURN_REQUESTED: {
    label: 'Yêu cầu trả hàng',
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: RotateCcw,
  },
  RETURNED: {
    label: 'Đã trả hàng',
    bg: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: RotateCcw,
  },
};

const TYPE_MAP = {
  standard: {
    label: 'Thường',
    bg: 'bg-green-50 text-green-700 border-green-200',
  },
  prescription: {
    label: 'Có toa',
    bg: 'bg-blue-50 text-red-700 border-red-200',
  },
};

const fmt = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    amount || 0
  );

const OrderDetailModal = ({ order, onClose, onConfirm, onCancel }) => {
  if (!order) return null;

  const statusInfo = STATUS_MAP[order.status] || {
    label: order.status,
    bg: 'bg-gray-50 text-gray-600 border-gray-200',
  };
  const typeInfo = TYPE_MAP[order.type] || {
    label: order.type || 'Thường',
    bg: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-[#222]">Chi tiết đơn hàng</h2>
            <p className="text-sm text-[#4f5562]">
              #{order.code || order.orderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 bg-[#d90f0f] rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border ${typeInfo.bg}`}
                >
                  {typeInfo.label}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.bg}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-sm text-[#4f5562] mt-1">
                Ngày đặt:{' '}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('vi-VN')
                  : '—'}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#222] mb-3">
              <User className="w-4 h-4" /> Thông tin khách hàng
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium">Tên:</span>{' '}
                {order.recipientName || '—'}
              </p>
              {order.customerEmail && (
                <p className="text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {order.customerEmail}
                </p>
              )}
              {order.shippingPhone && (
                <p className="text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {order.shippingPhone}
                </p>
              )}
              {(order.shippingStreet || order.shippingCity) && (
                <p className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {[order.shippingStreet, order.shippingCity]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#222] mb-3">
              <Package className="w-4 h-4" /> Sản phẩm (
              {order.items?.length || 0})
            </h3>
            <div className="border rounded-xl overflow-hidden">
              {order.items?.map((item, index) => (
                <div
                  key={item.orderItemId || index}
                  className="flex items-center justify-between p-4 border-b last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-[#222]">
                        {item.productName}
                      </p>
                      <p className="text-xs text-[#4f5562]">
                        {[item.variantSku, item.colorName]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-[#222]">
                    {fmt(item.unitPrice)}
                  </p>
                </div>
              ))}
              {(!order.items || order.items.length === 0) && (
                <p className="text-sm text-[#4f5562] text-center py-4">
                  Không có sản phẩm
                </p>
              )}
            </div>
          </div>

          {/* Payment */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#222] mb-3">
              <CreditCard className="w-4 h-4" /> Thanh toán
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {order.paymentMethod && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#4f5562]">Phương thức:</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#4f5562]">Mã vận đơn:</span>
                  <span className="font-medium">{order.trackingNumber}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                <span>Tổng cộng:</span>
                <span className="text-[#d90f0f]">{fmt(order.finalAmount)}</span>
              </div>
              {order.shippingFee != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#4f5562]">
                    Phí vận chuyển (đã tính trong tổng):
                  </span>
                  <span
                    className={`font-medium ${order.shippingFee > 0 ? 'text-orange-600' : 'text-green-600'}`}
                  >
                    {order.shippingFee > 0
                      ? fmt(order.shippingFee)
                      : 'Miễn phí'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Prescription Info */}
          {order.prescription && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#222] mb-3">
                <FileText className="w-4 h-4" /> Thông tin đơn kính
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#4f5562]">Mắt phải (OD):</p>
                    <p className="font-medium">
                      SPH: {order.prescription.sphOd ?? '—'} | CYL:{' '}
                      {order.prescription.cylOd ?? '—'} | AXIS:{' '}
                      {order.prescription.axisOd ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#4f5562]">Mắt trái (OS):</p>
                    <p className="font-medium">
                      SPH: {order.prescription.sphOs ?? '—'} | CYL:{' '}
                      {order.prescription.cylOs ?? '—'} | AXIS:{' '}
                      {order.prescription.axisOs ?? '—'}
                    </p>
                  </div>
                  {order.prescription.pd && (
                    <div>
                      <p className="text-[#4f5562]">PD:</p>
                      <p className="font-medium">{order.prescription.pd}mm</p>
                    </div>
                  )}
                  {order.prescription.addOd && (
                    <div>
                      <p className="text-[#4f5562]">ADD:</p>
                      <p className="font-medium">+{order.prescription.addOd}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div>
              <h3 className="text-sm font-semibold text-[#222] mb-2">
                Ghi chú
              </h3>
              <p className="text-sm text-[#4f5562] bg-gray-50 rounded-xl p-4">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex gap-3">
          {order.status === 'PENDING' && onConfirm && (
            <button
              onClick={() => onConfirm(order.orderId)}
              className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" /> Xác nhận đơn
            </button>
          )}
          {order.status === 'PENDING' && onCancel && (
            <button
              onClick={() => onCancel(order.orderId)}
              className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" /> Hủy đơn
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-[#222] py-3 rounded-xl font-medium hover:bg-gray-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;

