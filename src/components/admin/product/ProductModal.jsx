import {
  Glasses,
  Scan,
  Palette,
  X,
  Save,
  Trash2,
  Plus,
  Loader2,
} from 'lucide-react';
import React, { useState, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import { toast } from 'react-toastify';
import 'react-quill-new/dist/quill.snow.css';
import { uploadRequest } from '@/api/upload';
import {
  FRAME_MATERIALS,
  FRAME_SHAPES,
  FRAME_SUB_CATEGORIES,
  LENS_INDEXES,
  LENS_MATERIALS,
  LENS_TYPES,
  LENS_SUB_CATEGORIES,
} from '@/mocks/data';

const ProductModal = ({
  show,
  onClose,
  onSubmit,
  editingProduct,
  formData,
  setFormData,
  variants,
  handleAddVariant,
  handleVariantChange,
  handleDeleteVariant,
  isPending,
}) => {
  const [uploading, setUploading] = useState(false);
  const quillRef = useRef(null);

  // Quill image handler: upload to Cloudinary then insert URL
  const quillImageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const url = await uploadRequest.uploadImage(
          file,
          'products/description'
        );
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', url);
          quill.setSelection(range.index + 1);
        }
      } catch {
        toast.error('Upload ảnh thất bại');
      }
    };
  };

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: quillImageHandler,
        },
      },
    }),
    []
  );

  if (!show) return null;

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const url = await uploadRequest.uploadImage(file, 'products');
          return { id: Date.now() + Math.random(), url, preview: url };
        })
      );
      setFormData({
        ...formData,
        images: [...(formData.images || []), ...uploaded],
      });
    } catch (err) {
      toast.error('Upload ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (imageId) => {
    setFormData({
      ...formData,
      images: formData.images.filter((img) => img.id !== imageId),
    });
  };

  const handleVariantImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadRequest.uploadImage(file, 'products');
      const currentImages = variants[index].images || [];
      const newImages = [...currentImages, { id: Date.now(), url, preview: url }];
      handleVariantChange(index, 'images', newImages);
    } catch (err) {
      toast.error('Upload ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveVariantImage = (index, imageId) => {
    const newImages = (variants[index].images || []).filter((img) => img.id !== imageId);
    handleVariantChange(index, 'images', newImages);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl max-h-[95vh] flex flex-col">
        {/* Header - Cố định */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body - Có thể cuộn */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          <form id="product-form" onSubmit={onSubmit} className="space-y-6">
            {/* Section 1: Thông tin cơ bản */}
            <div className="grid grid-cols-1 gap-4">
              <div className={`grid ${formData.type === 'accessory' ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none transition"
                    placeholder="VD: Gọng kính Ray-Ban Aviator"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                    Loại
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none bg-gray-50"
                  >
                    <option value="frame">Gọng kính</option>
                    <option value="lens">Tròng kính</option>
                    <option value="accessory">Phụ kiện</option>
                  </select>
                </div>
                {formData.type === 'accessory' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                      Giá (VND)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section: Mô tả sản phẩm - Rich text editor */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                Mô tả sản phẩm
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50 [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:max-h-[300px] [&_.ql-editor]:overflow-y-auto">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={formData.description || ''}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      description: value === '<p><br></p>' ? '' : value,
                    })
                  }
                  modules={quillModules}
                  placeholder="Mô tả chi tiết về sản phẩm (hỗ trợ định dạng văn bản và hình ảnh)..."
                />
              </div>
            </div>

            {/* Section 2: Thông số kỹ thuật - Bố cục ngang */}
            {(formData.type === 'frame' || formData.type === 'lens') && (
              <div
                className={`p-4 rounded-xl border ${formData.type === 'frame' ? 'bg-blue-50/50 border-red-100' : 'bg-green-50/50 border-green-100'}`}
              >
                <div className="flex items-center gap-2 mb-3 font-bold text-gray-700 text-sm">
                  {formData.type === 'frame' ? (
                    <Glasses size={18} />
                  ) : (
                    <Scan size={18} />
                  )}
                  Thông số kỹ thuật
                </div>
                <div
                  className={`grid ${formData.type === 'frame' ? 'grid-cols-4' : 'grid-cols-3'} gap-4`}
                >
                  {formData.type === 'frame' && (
                    <>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">
                          Danh mục
                        </label>
                        <select
                          value={formData.subCategory || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              subCategory: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-md text-sm bg-white"
                        >
                          <option value="">Chọn...</option>
                          {FRAME_SUB_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">
                          Chất liệu
                        </label>
                        <select
                          value={formData.material}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              material: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-md text-sm bg-white"
                        >
                          <option value="">Chọn...</option>
                          {FRAME_MATERIALS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">
                          Dáng kính
                        </label>
                        <select
                          value={formData.shape}
                          onChange={(e) =>
                            setFormData({ ...formData, shape: e.target.value })
                          }
                          className="w-full p-2 border rounded-md text-sm bg-white"
                        >
                          <option value="">Chọn...</option>
                          {FRAME_SHAPES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <div>
                          <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">
                            Càng (mm)
                          </label>
                          <input
                            type="text"
                            value={formData.templeLength}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                templeLength: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded-md text-sm bg-white"
                            placeholder="140"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">
                            Mắt (mm)
                          </label>
                          <input
                            type="text"
                            value={formData.lensWidth}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                lensWidth: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded-md text-sm bg-white"
                            placeholder="50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">
                            Cầu (mm)
                          </label>
                          <input
                            type="text"
                            value={formData.bridgeWidth}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                bridgeWidth: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded-md text-sm bg-white"
                            placeholder="18"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {formData.type === 'lens' && (
                    <>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">
                          Danh mục
                        </label>
                        <select
                          value={formData.subCategory || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              subCategory: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-md text-sm bg-white"
                        >
                          <option value="">Chọn...</option>
                          {LENS_SUB_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">
                          Chất liệu
                        </label>
                        <select
                          value={formData.lensMaterial}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lensMaterial: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-md text-sm bg-white"
                        >
                          <option value="">Chọn...</option>
                          {LENS_MATERIALS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">
                          Loại tròng
                        </label>
                        <select
                          value={formData.lensType || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lensType: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-md text-sm bg-white"
                        >
                          <option value="">Chọn...</option>
                          {LENS_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Section 3: Biến thể - Table gọn hơn */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Palette size={18} /> Biến thể sản phẩm
                </h3>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-3 py-1.5 text-xs bg-blue-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition flex items-center gap-1"
                >
                  <Plus size={14} /> Thêm biến thể
                </button>
              </div>

              <div className="border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-gray-500 text-[11px] uppercase tracking-wider">
                      <th className="px-4 py-2 text-left">Mô tả biến thể</th>
                      <th className="px-4 py-2 text-left">SKU</th>
                      <th className="px-4 py-2 text-left">Giá niêm yết</th>
                      <th className="px-4 py-2 text-left">Ảnh màu</th>
                      <th className="px-4 py-2 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {variants.map((variant, index) => (
                      <tr key={variant.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2">
                          {formData.type === 'frame' ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Màu sắc"
                                value={variant.color}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    'color',
                                    e.target.value
                                  )
                                }
                                className="w-full p-1.5 border rounded"
                              />
                              <input
                                type="color"
                                value={variant.colorCode || '#000000'}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    'colorCode',
                                    e.target.value
                                  )
                                }
                                className="w-6 h-6 rounded-full overflow-hidden border-none p-0 cursor-pointer"
                              />
                            </div>
                          ) : formData.type === 'lens' ? (
                            <select
                              value={variant.refractiveIndex || ''}
                              onChange={(e) =>
                                handleVariantChange(
                                  index,
                                  'refractiveIndex',
                                  e.target.value
                                )
                              }
                              className="w-full p-1.5 border rounded"
                            >
                              <option value="">Chọn chiết suất...</option>
                              {LENS_INDEXES.map((i) => (
                                <option key={i} value={i}>
                                  {i}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              placeholder="Tên biến thể"
                              value={variant.variantName || ''}
                              onChange={(e) =>
                                handleVariantChange(
                                  index,
                                  'variantName',
                                  e.target.value
                                )
                              }
                              className="w-full p-1.5 border rounded"
                            />
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={variant.sku}
                            onChange={(e) =>
                              handleVariantChange(index, 'sku', e.target.value)
                            }
                            className="w-full p-1.5 border rounded bg-gray-50/50"
                            placeholder="SKU-AUTO"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                'price',
                                Number(e.target.value)
                              )
                            }
                            className="w-full p-1.5 border rounded"
                          />
                        </td>
                        {/* Ảnh theo màu */}
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap items-center gap-1">
                            {(variant.images || []).map((img) => (
                              <div key={img.id} className="relative group w-9 h-9 bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
                                <span className="text-[8px] text-gray-400 absolute z-0">Lỗi</span>
                                <img
                                  src={img.preview}
                                  alt=""
                                  className="w-full h-full object-cover relative z-10"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariantImage(index, img.id)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-px opacity-0 group-hover:opacity-100 transition"
                                >
                                  <X size={8} />
                                </button>
                              </div>
                            ))}
                            <label className="w-9 h-9 flex items-center justify-center border border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50 text-gray-400 flex-shrink-0">
                              {uploading ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Plus size={12} />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleVariantImageUpload(index, e)}
                                className="hidden"
                                disabled={uploading}
                              />
                            </label>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(index)}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {variants.length === 0 && (
                  <div className="py-6 text-center text-gray-400 text-xs italic">
                    Chưa có biến thể nào được tạo.
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Cố định */}
        <div className="p-4 border-t flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
          >
            Hủy bỏ
          </button>
          <button
            form="product-form"
            type="submit"
            disabled={isPending}
            className="px-8 py-2 bg-[#361414] text-white rounded-lg hover:bg-[#0d1322] disabled:bg-gray-400 transition font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-900/10"
          >
            {isPending ? (
              'Đang xử lý...'
            ) : (
              <>
                <Save size={16} />
                {editingProduct ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;

