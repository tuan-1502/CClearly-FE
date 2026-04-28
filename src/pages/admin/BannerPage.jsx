import {
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Loader2,
  Eye,
  EyeOff,
  GripVertical,
} from 'lucide-react';
import { useState } from 'react';
import BannerModal from '@/components/admin/bannar/BannerModal';
import {
  useBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
} from '@/hooks/useAdmin';

const POSITIONS = [
  { value: 'HEADER', label: 'Header (Banner trên cùng)' },
  { value: 'HOME_MAIN', label: 'Trang chủ - Banner chính' },
  { value: 'HOME_PROMO', label: 'Trang chủ - Khuyến mãi' },
];

const BannerPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    position: 'HOME_MAIN',
    displayOrder: 1,
    isActive: true,
  });

  const { data: bannersData, isLoading } = useBanners();
  const createBannerMutation = useCreateBanner();
  const updateBannerMutation = useUpdateBanner();
  const deleteBannerMutation = useDeleteBanner();

  const banners = Array.isArray(bannersData) ? bannersData : [];

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        imageUrl: banner.imageUrl || '',
        position: banner.position || 'HOME_MAIN',
        displayOrder: banner.displayOrder ?? 1,
        isActive: banner.isActive ?? true,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        imageUrl: '',
        position: 'HOME_MAIN',
        displayOrder: 1,
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (submittedData) => {
    if (editingBanner) {
      updateBannerMutation.mutate(
        { id: editingBanner.bannerId, data: submittedData },
        { onSuccess: () => setShowModal(false) }
      );
    } else {
      createBannerMutation.mutate(submittedData, {
        onSuccess: () => setShowModal(false),
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Xóa banner này?')) {
      deleteBannerMutation.mutate(id);
    }
  };

  const handleToggleActive = (banner) => {
    updateBannerMutation.mutate({
      id: banner.bannerId,
      data: { isActive: !banner.isActive },
    });
  };

  const activeCount = banners.filter((b) => b.isActive).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#222]">Quản lý Banner</h1>
          <p className="text-[#4f5562]">
            Cấu hình hình ảnh quảng cáo hiển thị trên website
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#d90f0f] text-white rounded-xl font-medium hover:bg-[#b00c0c]"
        >
          <Plus size={18} /> Thêm banner
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{banners.length}</p>
          <p className="text-sm text-gray-500">Tổng banner</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-red-600">{activeCount}</p>
          <p className="text-sm text-gray-500">Đang hiển thị</p>
        </div>
        {POSITIONS.map((pos) => {
          const count = banners.filter((b) => b.position === pos.value).length;
          if (count === 0) return null;
          return (
            <div
              key={pos.value}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <p className="text-2xl font-bold text-red-600">{count}</p>
              <p className="text-sm text-gray-500">
                {pos.label.split(' - ').pop() || pos.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        {POSITIONS.map((pos) => {
          const items = banners.filter((b) => b.position === pos.value);
          if (items.length === 0) return null;

          return (
            <div
              key={pos.value}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-4 bg-gray-50/50 border-b flex justify-between items-center">
                <h3 className="font-bold text-[#222]">{pos.label}</h3>
                <span className="text-xs bg-white px-2.5 py-1 rounded-lg border text-gray-500 font-medium">
                  {items.length} Banner
                </span>
              </div>
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-100">
                  {items.map((banner) => (
                    <tr
                      key={banner.bannerId}
                      className="group hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 w-8">
                        <GripVertical className="w-4 h-4 text-gray-300" />
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                            {banner.imageUrl ? (
                              <img
                                src={banner.imageUrl}
                                className="w-full h-full object-cover"
                                alt={banner.title}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="text-gray-300 w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-[#222] text-sm">
                            {banner.title || '(Chưa đặt tiêu đề)'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                        Thứ tự: {banner.displayOrder ?? 1}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleToggleActive(banner)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            banner.isActive
                              ? 'bg-green-50 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {banner.isActive ? (
                            <>
                              <Eye size={12} /> ĐANG HIỆN
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} /> ĐÃ ẨN
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(banner)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-blue-50 rounded-xl transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(banner.bannerId)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <BannerModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSubmit}
        editingBanner={editingBanner}
        formData={formData}
        setFormData={setFormData}
        isSaving={
          createBannerMutation.isPending || updateBannerMutation.isPending
        }
      />
    </div>
  );
};

export default BannerPage;

