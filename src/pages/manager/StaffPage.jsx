import {
  Plus,
  X,
  Save,
  Loader2,
  Search,
  Edit2,
  Lock,
  Unlock,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Pagination from '@/components/ui/Pagination';
import { PAGE_SIZES } from '@/mocks/data';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminUsers, useCreateUser, useUpdateUser } from '@/hooks/useAdmin';

const ROLES = [
  { value: 'MANAGER', label: 'Quản lý' },
  { value: 'SALES_STAFF', label: 'Nhân viên bán hàng' },
  { value: 'OPERATION_STAFF', label: 'Nhân viên vận hành' },
];

const ROLE_LABEL = {
  ADMIN: 'Admin',
  MANAGER: 'Quản lý',
  SALES_STAFF: 'NV Bán hàng',
  OPERATION_STAFF: 'NV Vận hành',
};

const ROLE_COLOR = {
  ADMIN: 'bg-red-100 text-red-700',
  MANAGER: 'bg-red-100 text-red-700',
  SALES_STAFF: 'bg-emerald-100 text-emerald-700',
  OPERATION_STAFF: 'bg-purple-100 text-purple-700',
};

const emptyForm = {
  email: '',
  fullName: '',
  phoneNumber: '',
  password: '',
  role: 'SALES_STAFF',
};

const StaffPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    size: 20,
    search: '',
    role: 'all',
  });
  const [sortOption, setSortOption] = useState('newest');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [lockModal, setLockModal] = useState({ isOpen: false, user: null });

  const { user: currentUser } = useAuth();
  const { data, isLoading } = useAdminUsers({
    page: filters.page,
    size: filters.size,
    search: filters.search,
    role: filters.role === 'all' ? '' : filters.role,
  });

  const allUsers = Array.isArray(data) ? data : data?.content || [];
  const totalPages = data?.totalPages || 1;

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const staff = (Array.isArray(allUsers) ? allUsers : allUsers || [])
    .filter((u) => {
      const role = u.role?.toUpperCase() || '';
      return role !== 'CUSTOMER';
    })
    .sort((a, b) => {
      if (sortOption === 'name-asc') return (a.fullName || '').localeCompare(b.fullName || '', 'vi');
      if (sortOption === 'name-desc') return (b.fullName || '').localeCompare(a.fullName || '', 'vi');
      if (sortOption === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return 0; // Default logic
    });

  // ── Open modal ──
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      password: '',
      role: user.role || 'SALES_STAFF',
    });
    setShowModal(true);
  };

  // ── Submit form ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const data = {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
        };
        await updateUser.mutateAsync({ userId: editingUser.userId, data });
      } else {
        await createUser.mutateAsync({
          email: formData.email,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          role: formData.role,
        });
      }
      setShowModal(false);
    } catch {
      // handled by hook onError
    }
  };

  // ── Lock / Unlock ──
  const handleToggleLock = async () => {
    const user = lockModal.user;
    if (!user) return;
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateUser.mutateAsync({
        userId: user.userId,
        data: { status: newStatus },
      });
    } catch {
      // handled by hook onError
    }
    setLockModal({ isOpen: false, user: null });
  };

  const isPending = createUser.isPending || updateUser.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#222]">Quản lý nhân sự</h1>
          <p className="text-[#4f5562]">Quản lý danh sách nhân viên trong hệ thống</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition flex items-center gap-2 shadow-lg shadow-red-100"
        >
          <Plus className="w-5 h-5" /> Thêm nhân viên
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-12 pr-4 py-3 bg-[#f9f9f9] border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0f5dd9] transition"
            />
          </div>

          {/* <div className="bg-[#f9f9f9] border border-gray-200 rounded-full px-6 py-3 text-sm flex items-center gap-2">
            <TrendingUp size={16} className="text-gray-400" /> */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-[#f9f9f9] border border-gray-200 rounded-full px-6 py-3 text-sm focus:outline-none"
            >
              <option value="newest">Mới nhất</option>
              <option value="name-asc">Tên (A-Z)</option>
              <option value="name-desc">Tên (Z-A)</option>
            </select>
          {/* </div> */}

          <div className="bg-[#f9f9f9] border border-gray-200 rounded-full px-6 py-3 text-sm flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
              className="outline-none bg-transparent"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Quản lý</option>
              <option value="SALES_STAFF">Bán hàng</option>
              <option value="OPERATION_STAFF">Vận hành</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(13,22,39,0.06)] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : staff.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            Không có nhân viên nào
          </div>
        ) : (
          <>
          <table className="w-full">
            <thead className="bg-[#f3f3f3]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  SĐT
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ececec]">
              {staff.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#361414] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="font-semibold text-[#222] text-sm">
                        {user.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-[#4f5562]">
                    {user.email}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${ROLE_COLOR[user.role?.toUpperCase()] || 'bg-gray-100 text-gray-600'}`}
                    >
                      {ROLE_LABEL[user.role?.toUpperCase()] || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-[#4f5562]">
                    {user.phoneNumber || '—'}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        user.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-blue-50 rounded-lg transition"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {String(user.userId) !== String(currentUser?.userId) && (
                        <button
                          onClick={() => setLockModal({ isOpen: true, user })}
                          className={`p-2 rounded-lg transition ${
                            user.status === 'ACTIVE'
                              ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={
                            user.status === 'ACTIVE'
                              ? 'Khóa tài khoản'
                              : 'Mở khóa tài khoản'
                          }
                        >
                          {user.status === 'ACTIVE' ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-6 border-t border-[#ececec] flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#4f5562]">Số nhân sự: <strong>{staff.length}</strong></span>
                <span className="text-sm text-[#4f5562] ml-4">Số bản ghi mỗi trang:</span>
                <select
                  value={filters.size}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      size: Number(e.target.value),
                      page: 1,
                    })
                  }
                  className="px-3 py-1.5 border border-[#e0e0e0] rounded-lg text-sm focus:outline-none focus:border-[#d90f0f] bg-white cursor-pointer"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#4f5562]">
                Trang <strong>{filters.page}</strong> / {totalPages}
              </span>
              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                onPageChange={(page) => setFilters({ ...filters, page })}
              />
            </div>
          </div>
          </>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {editingUser ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="email@cclearly.vn"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                    placeholder="0912 xxx xxx"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none bg-white"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-8 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition font-bold text-sm flex items-center gap-2 shadow-lg"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editingUser ? 'Cập nhật' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Lock / Unlock Confirm Modal ── */}
      <ConfirmModal
        isOpen={lockModal.isOpen}
        onClose={() => setLockModal({ isOpen: false, user: null })}
        onConfirm={handleToggleLock}
        title={
          lockModal.user?.status === 'ACTIVE'
            ? 'Khóa tài khoản'
            : 'Mở khóa tài khoản'
        }
        message={
          lockModal.user?.status === 'ACTIVE'
            ? `Bạn có chắc muốn khóa tài khoản "${lockModal.user?.fullName}"? Nhân viên sẽ không thể đăng nhập cho đến khi được mở khóa.`
            : `Bạn có chắc muốn mở khóa tài khoản "${lockModal.user?.fullName}"? Nhân viên sẽ có thể đăng nhập lại.`
        }
        confirmText={
          lockModal.user?.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'
        }
        type={lockModal.user?.status === 'ACTIVE' ? 'warning' : 'info'}
      />
    </div>
  );
};

export default StaffPage;
