import { X, Image as ImageIcon, Upload, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { uploadRequest } from '@/api/upload';

const POSITIONS = [
  { value: 'HEADER', label: 'Header (Banner trên cùng)' },
  { value: 'HOME_MAIN', label: 'Trang chủ - Banner chính' },
  { value: 'HOME_PROMO', label: 'Trang chủ - Khuyến mãi' },
];

const BannerModal = ({
  show,
  onClose,
  onSave,
  editingBanner,
  formData,
  setFormData,
  isSaving,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  if (!show) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Upload to Cloudinary
    setUploading(true);
    try {
      const url = await uploadRequest.uploadImage(file, 'banners');
      setFormData({ ...formData, imageUrl: url });
    } catch (err) {
      console.error('Upload failed:', err);
      setPreviewUrl('');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.imageUrl && !uploading) return;
    onSave(formData);
  };

  const displayImage = previewUrl || formData.imageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-bold text-[#222]">
            {editingBanner ? 'Sửa banner' : 'Thêm banner mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#222] mb-1 text-left">
              Tiêu đề banner
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d90f0f]/20 outline-none"
              placeholder="Ví dụ: Khuyến mãi mùa hè"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#222] mb-2 text-left">
              Hình ảnh banner
            </label>
            <div className="relative group cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:bg-gray-50 transition-all">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {uploading ? (
                <div className="flex flex-col items-center py-6">
                  <Loader2 className="w-8 h-8 animate-spin text-[#d90f0f] mb-2" />
                  <p className="text-sm text-gray-500">
                    Đang tải ảnh lên Cloudinary...
                  </p>
                </div>
              ) : displayImage ? (
                <div className="relative h-32 w-full rounded-lg overflow-hidden">
                  <img
                    src={displayImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="text-white w-6 h-6" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                    <ImageIcon className="w-6 h-6 text-[#d90f0f]" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Nhấn để chọn ảnh từ máy tính (tự động upload lên Cloudinary)
                  </p>
                </div>
              )}
            </div>
            {formData.imageUrl && (
              <p className="mt-1.5 text-xs text-gray-400 truncate">
                {formData.imageUrl}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#222] mb-1 text-left">
                Vị trí
              </label>
              <select
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none bg-white"
              >
                {POSITIONS.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#222] mb-1 text-left">
                Thứ tự
              </label>
              <input
                type="number"
                min={1}
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayOrder: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d90f0f]"></div>
            </label>
            <span className="text-sm font-medium text-[#222]">
              {formData.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
            </span>
          </div>

          <div className="p-5 border-t flex gap-3 -mx-5 -mb-5 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-medium hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={uploading || isSaving || !formData.imageUrl}
              className="flex-1 px-5 py-2.5 bg-[#d90f0f] text-white rounded-xl font-medium hover:bg-[#b00c0c] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {editingBanner ? 'Cập nhật' : 'Lưu banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerModal;

