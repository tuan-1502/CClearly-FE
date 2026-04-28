// Manager Inventory Page - Quản lý kho chi tiết theo biến thể
import {
  Search,
  Package,
  Warehouse,
  AlertTriangle,
  X,
  Upload,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Pagination from '@/components/ui/Pagination';
import { useAuth } from '@/contexts/AuthContext';
import { useInventory, useImportStock } from '@/hooks/useInventory';

const PAGE_SIZES = [10, 20, 50, 100];

const ManagerInventoryPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'frame', 'lens', 'accessory'
  const [expandedProducts, setExpandedProducts] = useState({});

  // Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importForm, setImportForm] = useState({
    variantId: '',
    warehouseId: '',
    quantity: '',
    reason: '',
  });

  // Fetch inventory from API
  const { data: inventoryItems = [] } = useInventory({
    search: searchTerm || undefined,
  });
  const importStockMutation = useImportStock();

  // Stats from API data
  const totalStock = inventoryItems.reduce(
    (sum, item) => sum + (item.totalStock || 0),
    0
  );
  const lowStockItems = inventoryItems.filter(
    (item) => item.totalStock < 10
  ).length;
  const totalVariants = inventoryItems.length;

  // Toggle expand product
  const toggleExpandProduct = (productId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Filter inventory items
  const filteredProducts = inventoryItems.filter((item) => {
    const matchesSearch =
      item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.variantSku?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter theo loại sản phẩm
    const matchesType = typeFilter === 'all' || item.productType === typeFilter;

    // Filter theo tồn kho
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'low' && item.totalStock < 10) ||
      (stockFilter === 'out' && item.totalStock === 0) ||
      (stockFilter === 'available' && item.totalStock > 0);

    return matchesSearch && matchesType && matchesStock;
  });

  // Pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  const handleImport = () => {
    if (!importForm.variantId || !importForm.quantity) {
      toast.error('Vui lòng chọn biến thể và nhập số lượng');
      return;
    }
    importStockMutation.mutate(
      {
        variantId: importForm.variantId,
        warehouseId: importForm.warehouseId || undefined,
        quantity: parseInt(importForm.quantity),
        reason: importForm.reason || 'Nhập kho thủ công',
      },
      {
        onSuccess: () => {
          setShowImportModal(false);
          setImportForm({
            variantId: '',
            warehouseId: '',
            quantity: '',
            reason: '',
          });
        },
      }
    );
  };

  const selectedItem = inventoryItems.find(
    (item) => item.variantId === importForm.variantId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#222]">Quản lý kho</h1>
          <p className="text-[#4f5562]">
            Quản lý tồn kho chi tiết theo biến thể
          </p>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#d90f0f] text-white rounded-xl font-medium hover:bg-[#b00c0c]"
        >
          <Upload size={18} />
          Nhập kho
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-[#d90f0f]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#222]">
                {inventoryItems.length}
              </p>
              <p className="text-sm text-[#4f5562]">Tổng sản phẩm</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Warehouse className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#222]">{totalStock}</p>
              <p className="text-sm text-[#4f5562]">Tổng tồn kho</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#222]">{totalVariants}</p>
              <p className="text-sm text-[#4f5562]">Tổng biến thể</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#222]">{lowStockItems}</p>
              <p className="text-sm text-[#4f5562]">Sắp hết hàng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 flex-1">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
              />
            </div>
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
            >
              <option value="all">Tất cả tồn kho</option>
              <option value="available">Còn hàng</option>
              <option value="low">Sắp hết (&lt;10)</option>
              <option value="out">Hết hàng</option>
            </select>

            <select
              value={typeFilter}
              onChange={(a) => {
                setTypeFilter(a.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
            >
              <option value="all">Tất cả</option>
              <option value="available">Gọng Kính</option>
              <option value="low">Tròng kính</option>
              <option value="out">Phụ Kiện</option>
            </select>

          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sản phẩm
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Loại
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tồn kho
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Giá
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedProducts.map((item) => {
                const isExpanded = expandedProducts[item.variantId];
                const hasWarehouses =
                  item.warehouseStocks && item.warehouseStocks.length > 0;

                return (
                  <React.Fragment key={item.variantId}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {hasWarehouses && (
                          <button
                            onClick={() => toggleExpandProduct(item.variantId)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#222]">
                              {item.productName}
                            </p>
                            {item.colorName && (
                              <p className="text-xs text-gray-400">
                                {item.colorName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#4f5562]">
                        {item.variantSku}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {item.productType === 'frame'
                            ? 'Gọng'
                            : item.productType === 'lens'
                              ? 'Tròng'
                              : 'Phụ kiện'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-medium ${item.totalStock < 10 ? 'text-orange-600' : 'text-[#222]'}`}
                        >
                          {item.totalStock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#222]">
                        {formatCurrency(Number(item.price))}
                      </td>
                      <td className="px-4 py-3">
                        {item.totalStock === 0 ? (
                          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                            Hết hàng
                          </span>
                        ) : item.totalStock < 10 ? (
                          <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                            Sắp hết
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                            Còn hàng
                          </span>
                        )}
                      </td>
                    </tr>
                    {/* Warehouse rows */}
                    {isExpanded &&
                      hasWarehouses &&
                      item.warehouseStocks.map((ws) => (
                        <tr
                          key={ws.warehouseId}
                          className="bg-blue-50/50 hover:bg-blue-50"
                        >
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3 pl-12">
                            <div className="flex items-center gap-2">
                              <Warehouse className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-[#222]">
                                {ws.warehouseName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#4f5562]">
                            {ws.locationCode || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                              Kho
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-medium ${ws.quantityOnHand < 5 ? 'text-orange-600' : 'text-[#222]'}`}
                            >
                              {ws.quantityOnHand}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-[#222]">
                            -
                          </td>
                          <td className="px-4 py-3">
                            {ws.quantityOnHand === 0 ? (
                              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                                Hết hàng
                              </span>
                            ) : ws.quantityOnHand < 5 ? (
                              <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                                Sắp hết
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                                Còn hàng
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {paginatedProducts.length === 0 && (
          <div className="text-center py-12 text-[#4f5562]">
            Không tìm thấy sản phẩm nào
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#4f5562]">Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-[#4f5562]">
              / {totalItems} sản phẩm
            </span>
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-[#222]">Nhập kho</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#222] mb-1">
                  Biến thể sản phẩm
                </label>
                <select
                  value={importForm.variantId}
                  onChange={(e) =>
                    setImportForm({
                      ...importForm,
                      variantId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
                >
                  <option value="">Chọn biến thể</option>
                  {inventoryItems.map((item) => (
                    <option key={item.variantId} value={item.variantId}>
                      {item.productName} - {item.variantSku}{' '}
                      {item.colorName ? `(${item.colorName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedItem?.warehouseStocks &&
                selectedItem.warehouseStocks.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-[#222] mb-1">
                      Kho nhập
                    </label>
                    <select
                      value={importForm.warehouseId}
                      onChange={(e) =>
                        setImportForm({
                          ...importForm,
                          warehouseId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
                    >
                      <option value="">Chọn kho</option>
                      {selectedItem.warehouseStocks.map((ws) => (
                        <option key={ws.warehouseId} value={ws.warehouseId}>
                          {ws.warehouseName} (Hiện có: {ws.quantityOnHand})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              <div>
                <label className="block text-sm font-medium text-[#222] mb-1">
                  Số lượng
                </label>
                <input
                  type="number"
                  min="1"
                  value={importForm.quantity}
                  onChange={(e) =>
                    setImportForm({ ...importForm, quantity: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
                  placeholder="Nhập số lượng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222] mb-1">
                  Lý do nhập kho
                </label>
                <textarea
                  value={importForm.reason}
                  onChange={(e) =>
                    setImportForm({ ...importForm, reason: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]"
                  placeholder="Nhập lý do nhập kho..."
                />
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleImport}
                className="flex-1 px-5 py-2.5 bg-[#d90f0f] text-white rounded-xl hover:bg-[#b00c0c] font-medium"
              >
                Nhập kho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerInventoryPage;