// Manager Products Page - Quản lý sản phẩm
import { Search, Plus, Edit2, Trash2, Glasses, Scan } from 'lucide-react';
import { useState } from 'react';
import ProductModal from '@/components/admin/product/ProductModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Pagination from '@/components/ui/Pagination';
import { useAuth } from '@/contexts/AuthContext';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@/hooks/useProduct';
import { PAGE_SIZES } from '@/mocks/data';

const ManagerProductsPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    page: 1,
    size: 20,
    type: '',
    search: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    productId: null,
  });

  const { data, isLoading } = useProducts(filters);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [formData, setFormData] = useState({
    name: '',
    type: 'frame',
    price: '',
    description: '',
    material: '',
    shape: '',
    bridgeWidth: '',
    templeLength: '',
    lensWidth: '',
    lensMaterial: '',
    lensType: '',
    subCategory: '',
    images: [],
  });

  const [variants, setVariants] = useState([]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        type: product.type,
        price: product.basePrice,
        description: product.description,
        material: product.frame?.material || '',
        shape: product.frame?.shape || '',
        bridgeWidth: product.frame?.bridgeWidthMm || '',
        templeLength: product.frame?.templeLengthMm || '',
        lensWidth: product.frame?.lensWidthMm || '',
        lensMaterial: product.lens?.material || '',
        lensType: product.lens?.lensType || '',
        subCategory: product.subCategory || '',
        images:
          product.images?.map((url, idx) => ({ id: idx, url, preview: url })) ||
          [],
      });
      setVariants(
        product.variants?.map((v) => ({
          id: v.variantId,
          sku: v.sku,
          color: v.colorName || '',
          colorCode: '#000000',
          refractiveIndex: v.refractiveIndex || '',
          variantName: v.colorName || '',
          price: v.salePrice || product.basePrice,
          images: v.images?.map((url, idx) => ({ id: idx, url, preview: url })) || [],
        })) || []
      );
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        type: 'frame',
        price: '',
        description: '',
        material: '',
        shape: '',
        bridgeWidth: '',
        templeLength: '',
        lensWidth: '',
        lensMaterial: '',
        lensType: '',
        subCategory: '',
        images: [],
      });
      setVariants([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name,
        type: formData.type,
        price: formData.type === 'accessory' ? Number(formData.price) : 0,
        description: formData.description,
        subCategory:
          formData.type === 'accessory' ? null : formData.subCategory || null,
        imageUrls: formData.images?.map((img) => img.url).filter(Boolean) || [],
      };

      if (formData.type === 'frame') {
        productData.frameAttributes = {
          material: formData.material,
          shape: formData.shape,
          lensWidth: formData.lensWidth ? Number(formData.lensWidth) : null,
          bridgeWidth: formData.bridgeWidth
            ? Number(formData.bridgeWidth)
            : null,
          templeLength: formData.templeLength
            ? Number(formData.templeLength)
            : null,
        };
      } else if (formData.type === 'lens') {
        productData.lensAttributes = {
          material: formData.lensMaterial,
          type: formData.lensType,
        };
      }

      if (variants.length > 0) {
        productData.variants = variants.map((v) => ({
          variantId:
            (typeof v.id === 'string' && v.id.startsWith('v')) ||
            v.id?.toString().startsWith('lv') ||
            v.id?.toString().startsWith('av')
              ? null
              : v.id,
          sku: v.sku,
          colorName:
            formData.type === 'accessory'
              ? v.variantName || null
              : v.color || null,
          refractiveIndex: v.refractiveIndex ? Number(v.refractiveIndex) : null,
          salePrice: v.price ? Number(v.price) : null,
          isPreorder: false,
          images: (v.images || []).map((img) => img.url).filter(Boolean),
        }));
        // Fallback: nếu sản phẩm chưa có ảnh chung, gom tất cả ảnh biến thể
        const allVariantImageUrls = variants.flatMap((v) =>
          (v.images || []).map((img) => img.url).filter(Boolean)
        );
        if (allVariantImageUrls.length > 0 && productData.imageUrls.length === 0) {
          productData.imageUrls = allVariantImageUrls;
        }
      }

      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          data: productData,
        });
      } else {
        await createProduct.mutateAsync(productData);
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVariant = () => {
    let newVariant;
    if (formData.type === 'frame') {
      newVariant = {
        id: 'v' + Date.now(),
        color: '',
        colorCode: '#000000',
        sku: '',
        price: formData.price,
      };
    } else if (formData.type === 'lens') {
      newVariant = {
        id: 'lv' + Date.now(),
        refractiveIndex: '',
        sku: '',
        price: formData.price,
      };
    } else {
      newVariant = {
        id: 'av' + Date.now(),
        variantName: '',
        sku: '',
        price: formData.price,
      };
    }
    setVariants([...variants, newVariant]);
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleDeleteVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const products = data?.content || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#222]">Quản lý sản phẩm</h1>
        <p className="text-[#4f5562]">Xin chào, {user?.name || 'Manager'}!</p>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
              className="w-full pl-12 pr-4 py-3 bg-[#f9f9f9] border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0f5dd9] text-sm"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters({ ...filters, type: e.target.value, page: 1 })
            }
            className="bg-[#f9f9f9] border border-gray-200 rounded-full px-6 py-3 text-sm focus:outline-none"
          >
            <option value="">Tất cả loại</option>
            <option value="frame">Gọng kính</option>
            <option value="lens">Tròng kính</option>
            <option value="accessory">Phụ kiện</option>
          </select>
          <button
            onClick={() => handleOpenModal()}
            className="bg-red-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-red-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" /> Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(13,22,39,0.06)] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[#4f5562]">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-[#4f5562]">
            Không có sản phẩm nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f3f3f3]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                      Biến thể
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ececec]">
                  {products.map((product) => {
                    const allImages = [
                      ...(product.images || []),
                      ...(product.variants || []).flatMap((v) => v.images || []),
                    ];
                    const uniqueImages = [...new Set(allImages)];

                    return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center z-0">
                              {product.type === 'frame' ? (
                                <Glasses className="w-5 h-5 text-gray-400" />
                              ) : product.type === 'lens' ? (
                                <Scan className="w-5 h-5 text-gray-400" />
                              ) : (
                                <span className="text-gray-400 text-xs font-bold">PK</span>
                              )}
                            </div>
                            {uniqueImages.length > 0 && (
                              <img
                                src={uniqueImages[0]}
                                alt={product.name}
                                className="w-full h-full object-cover z-10"
                                data-images={JSON.stringify(uniqueImages)}
                                data-index="0"
                                onError={(e) => {
                                  const imgArray = JSON.parse(e.target.dataset.images || '[]');
                                  let idx = parseInt(e.target.dataset.index || '0', 10);
                                  idx++;
                                  if (idx < imgArray.length) {
                                    e.target.dataset.index = idx.toString();
                                    e.target.src = imgArray[idx];
                                  } else {
                                    e.target.style.display = 'none';
                                  }
                                }}
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#222] truncate group-hover:text-red-600 transition-colors">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                              {product.sku}
                            </p>
                            {product.variants?.length > 0 && (
                              <p className="text-[10px] text-red-500">
                                {product.variants.length} biến thể
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase">
                          {product.type === 'frame'
                            ? 'Gọng'
                            : product.type === 'lens'
                              ? 'Tròng'
                              : 'Phụ kiện'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-sm font-bold text-[#222]">
                        {product.variants?.length > 1 && (
                          <span className="text-xs font-normal text-gray-400 mr-0.5">
                            Từ{' '}
                          </span>
                        )}
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(product.basePrice)}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-center font-medium text-gray-600">
                        {product.variants?.length || 0}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${product.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
                        >
                          {product.isActive ? 'BẬT' : 'TẮT'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenModal(product)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-blue-50 rounded-lg transition"
                            >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                productId: product.id,
                              })
                            }
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-[#ececec] flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#4f5562]">Hiển thị:</span>
                <select
                  value={filters.size}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      size: Number(e.target.value),
                      page: 1,
                    })
                  }
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-600 bg-white cursor-pointer"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-[#4f5562]">sản phẩm</span>
              </div>
              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                onPageChange={(page) => setFilters({ ...filters, page })}
              />
            </div>
          </>
        )}
      </div>

      {/* Product Modal - Sử dụng chung component với Admin */}
      <ProductModal
        show={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
        formData={formData}
        setFormData={setFormData}
        variants={variants}
        handleAddVariant={handleAddVariant}
        handleVariantChange={handleVariantChange}
        handleDeleteVariant={handleDeleteVariant}
        isPending={createProduct.isPending || updateProduct.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={async () => {
          await deleteProduct.mutateAsync(confirmModal.productId);
          setConfirmModal({ ...confirmModal, isOpen: false });
        }}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        confirmText="Xóa sản phẩm"
        type="danger"
      />
    </div>
  );
};

export default ManagerProductsPage;

