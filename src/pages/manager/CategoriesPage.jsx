// Manager Categories Page - Quản lý danh mục & biến thể
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { categories as initialCategories } from '@/mocks/data'
import { Plus, Search, Edit2, Trash2, X, Tag, Palette, Save, Eye, Package } from 'lucide-react'
import { toast } from 'react-toastify'

const FRAME_VARIANTS = [
  { id: 'v1', name: 'Màu sắc gọng kính', values: ['Đen', 'Xám', 'Vàng Gold', 'Bạc', 'Xanh Navy', 'Nâu', 'Đỏ Burgundy'] },
  { id: 'v2', name: 'Chất liệu gọng', values: ['Titanium', 'Acetate', 'TR90', 'Steel', 'Beta Titanium', 'Optyl'] },
]

const LENS_VARIANTS = [
  { id: 'l1', name: 'Công nghệ tròng', values: ['Standard', 'Blue Light Filter', 'UV Protection', 'Anti-fog', 'Shock Resistant'] },
  { id: 'l2', name: 'Chiết suất', values: ['1.50', '1.56', '1.59', '1.60', '1.67', '1.74'] },
]

const ManagerCategoriesPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('products')
  const [categories, setCategories] = useState(initialCategories)
  const [searchTerm, setSearchTerm] = useState('')

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingVariantType, setEditingVariantType] = useState(null)
  const [variantForm, setVariantForm] = useState({ name: '', values: [] })
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '' })

  const handleSaveCategory = () => {
    if (!categoryForm.name) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...categoryForm } : c))
      toast.success('Đã cập nhật danh mục!')
    } else {
      setCategories([...categories, { id: 'cat' + Date.now(), ...categoryForm }])
      toast.success('Đã thêm danh mục mới!')
    }
    setShowCategoryModal(false)
    setEditingCategory(null)
    setCategoryForm({ name: '', slug: '', description: '' })
  }

  const handleDeleteCategory = (id) => {
    if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
      setCategories(categories.filter(c => c.id !== id))
      toast.success('Đã xóa danh mục!')
    }
  }

  const handleSaveVariant = (variantTypeId) => {
    const variantType = variantTypeId === 'frame' ? FRAME_VARIANTS : LENS_VARIANTS
    toast.success('Đã lưu biến thể!')
    setShowVariantModal(false)
  }

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#222]">Quản lý danh mục & biến thể</h1>
          <p className="text-[#4f5562]">Quản lý danh mục sản phẩm và biến thể</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium ${activeTab === 'products' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Danh mục sản phẩm
        </button>
        <button
          onClick={() => setActiveTab('frame')}
          className={`px-4 py-2 font-medium ${activeTab === 'frame' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Palette className="w-4 h-4 inline mr-2" />
          Biến thể gọng kính
        </button>
        <button
          onClick={() => setActiveTab('lens')}
          className={`px-4 py-2 font-medium ${activeTab === 'lens' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Eye className="w-4 h-4 inline mr-2" />
          Biến thể tròng kính
        </button>
      </div>

      {/* Search & Actions */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
        {activeTab === 'products' && (
            <button
              onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', slug: '', description: '' }); setShowCategoryModal(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
            <Plus className="w-5 h-5" />
            Thêm danh mục
          </button>
        )}
        {activeTab === 'frame' && (
            <button
              onClick={() => { setEditingVariantType('frame'); setShowVariantModal(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
            <Plus className="w-5 h-5" />
            Thêm biến thể
          </button>
        )}
        {activeTab === 'lens' && (
            <button
              onClick={() => { setEditingVariantType('lens'); setShowVariantModal(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
            <Plus className="w-5 h-5" />
            Thêm biến thể
          </button>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Danh mục</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Slug</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Mô tả</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCategories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{cat.name}</td>
                  <td className="px-6 py-4 text-gray-500">{cat.slug}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{cat.description}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingCategory(cat); setCategoryForm({ name: cat.name, slug: cat.slug, description: cat.description }); setShowCategoryModal(true) }} className="p-2 text-gray-400 hover:text-red-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'frame' && (
        <div className="space-y-4">
          {FRAME_VARIANTS.map(variant => (
            <div key={variant.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{variant.name}</h3>
                <button onClick={() => { setEditingVariantType('frame'); setShowVariantModal(true) }} className="text-red-600 text-sm hover:underline">
                  + Thêm giá trị
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {variant.values.map(val => (
                  <span key={val} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{val}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'lens' && (
        <div className="space-y-4">
          {LENS_VARIANTS.map(variant => (
            <div key={variant.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{variant.name}</h3>
                <button onClick={() => { setEditingVariantType('lens'); setShowVariantModal(true) }} className="text-red-600 text-sm hover:underline">
                  + Thêm giá trị
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {variant.values.map(val => (
                  <span key={val} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{val}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên danh mục</label>
                <input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl"
                  placeholder="VD: Gọng kính cận"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="width-full px-4 py-2 border rounded-xl"
                  placeholder="VD: goong-kinh-can"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={() => setShowCategoryModal(false)} className="flex-1 py-2 border rounded-xl hover:bg-gray-50">Hủy</button>
                  <button onClick={handleSaveCategory} className="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition-colors">
                  <Save className="w-4 h-4 inline mr-2" />
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variant Modal */}
      {showVariantModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Thêm biến thể</h2>
              <button onClick={() => setShowVariantModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giá trị mới (phân cách bằng dấu phẩy)</label>
              <input
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="VD: Đen, Xám, Vàng Gold"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <button onClick={() => setShowVariantModal(false)} className="flex-1 py-2 border rounded-xl hover:bg-gray-50">Hủy</button>
                <button onClick={() => handleSaveVariant(activeTab)} className="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition-colors">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerCategoriesPage

