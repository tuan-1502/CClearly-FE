import { FileText, RefreshCcw, ShieldCheck, Clock } from 'lucide-react';

const PolicyPage = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#222]">Chính sách vận hành</h1>
        <p className="text-[#4f5562] mt-1">
          Cấu hình các quy định về đổi trả, bảo hành và cam kết dịch vụ
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {[
          {
            icon: RefreshCcw,
            title: 'Chính sách Đổi trả',
            desc: 'Quy định về thời gian và điều kiện hoàn tiền/đổi hàng.',
          },
          {
            icon: ShieldCheck,
            title: 'Chính sách Bảo hành',
            desc: 'Thời hạn bảo hành gọng, tròng và các lỗi kỹ thuật.',
          },
          {
            icon: Clock,
            title: 'Cam kết SLA',
            desc: 'Thời gian gia công kính và giao hàng dự kiến.',
          },
          {
            icon: FileText,
            title: 'Điều khoản Dịch vụ',
            desc: 'Các quy định chung khi mua sắm tại cửa hàng.',
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
              <item.icon className="w-7 h-7 text-gray-400 group-hover:text-[#d90f0f] transition-colors" />
            </div>
            <h3 className="font-bold text-[#222] text-xl mb-2">{item.title}</h3>
            <p className="text-sm text-[#4f5562] mb-6 leading-relaxed">
              {item.desc}
            </p>
            <button className="text-[#d90f0f] text-sm font-bold flex items-center gap-2">
              Chỉnh sửa nội dung <FileText className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PolicyPage;

