import { Scan, Box, Plus, Search, Filter } from 'lucide-react';

const LensManagementPage = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#222]">Quản lý tròng kính</h1>
          <p className="text-[#4f5562] mt-1">
            Danh mục tròng kính và cấu hình combo
          </p>
        </div>
        <button className="bg-gray-900 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors">
          <Plus className="w-5 h-5" /> Thêm tròng mới
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tròng kính..."
            className="w-full pl-12 pr-4 py-3 bg-[#f9f9f9] border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0f5dd9] text-sm"
          />
        </div>
        <button className="px-6 py-3 border border-[#e0e0e0] rounded-full font-bold flex items-center gap-2 hover:bg-gray-50 transition">
          <Filter className="w-4 h-4" /> Bộ lọc
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f3f3f3] text-left">
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                Tên tròng
              </th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                Chiết suất
              </th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                Tính năng
              </th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                Giá
              </th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                name: 'Essilor Crizal Sapphire',
                index: '1.56',
                features: ['Chống phản quang', 'Lọc ánh sáng xanh'],
                price: 850000,
              },
              {
                name: 'Chemi U2',
                index: '1.60',
                features: ['Chống trầy xước', 'Mỏng'],
                price: 450000,
              },
              {
                name: 'Hoya Blue Control',
                index: '1.67',
                features: ['Lọc ánh sáng xanh', 'Siêu mỏng'],
                price: 1200000,
              },
            ].map((lens, i) => (
              <tr
                key={i}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-red-600">
                      <Scan className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-[#222] text-sm">
                      {lens.name}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-sm text-[#4f5562] font-medium">
                  {lens.index}
                </td>
                <td className="p-4">
                  <div className="flex gap-1 flex-wrap">
                    {lens.features.map((f) => (
                      <span
                        key={f}
                        className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-sm font-bold text-[#222]">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(lens.price)}
                </td>
                <td className="p-4 text-right">
                  <button className="text-red-600 text-xs font-bold hover:underline">
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-10 text-center">
          <Box className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-sm text-[#4f5562]">
            Sử dụng Admin Products để quản lý chi tiết hơn.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LensManagementPage;

