import { Shield, User, Lock, Settings, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useAdminUsers,
  useAdminLogs,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '@/hooks/useAdmin';

const RolePermissionPage = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { data: usersData, isLoading: loadingUsers } = useAdminUsers({
    page: 1,
    size: 50,
  });
  const { data: logsData, isLoading: loadingLogs } = useAdminLogs({
    page: 1,
    size: 20,
  });
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const employees = Array.isArray(usersData)
    ? usersData
    : usersData?.content || [];
  const auditLogs = logsData?.items || [];

  // Count users per role
  const roleCounts = employees.reduce(
    (acc, u) => {
      const role = u.role?.toUpperCase() || '';
      if (role === 'ADMIN') acc.admin++;
      else if (role === 'MANAGER') acc.manager++;
      else acc.staff++;
      return acc;
    },
    { admin: 0, manager: 0, staff: 0 }
  );

  const handleDelete = (userId) => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#222]">Quản lý nội bộ</h1>
          <p className="text-[#4f5562] mt-1">
            Quản lý nhân sự và lịch sử thao tác hệ thống
          </p>
        </div>
        <button className="bg-[#361414] text-white px-6 py-3 rounded-full font-bold hover:bg-black transition flex items-center gap-2">
          <User className="w-5 h-5" /> Thêm nhân sự mới
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: Shield,
            title: 'Admin',
            desc: 'Toàn quyền hệ thống',
            count: roleCounts.admin,
            color: 'bg-red-50 text-red-600',
          },
          {
            icon: User,
            title: 'Manager',
            desc: 'Quản lý kho và báo cáo',
            count: roleCounts.manager,
            color: 'bg-blue-50 text-red-600',
          },
          {
            icon: Settings,
            title: 'Staff',
            desc: 'Xử lý đơn hàng & Sales',
            count: roleCounts.staff,
            color: 'bg-green-50 text-green-600',
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div
              className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mb-4`}
            >
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#222] text-lg">{item.title}</h3>
            <p className="text-xs text-[#4f5562] mt-1">{item.desc}</p>
            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
              <span className="text-sm font-medium text-[#222]">
                {item.count} nhân viên
              </span>
              <button className="text-[#d90f0f] text-xs font-bold hover:underline">
                Phân quyền
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="px-8 flex">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`py-5 px-6 font-bold text-sm border-b-2 transition ${activeTab === 'accounts' ? 'border-[#d90f0f] text-[#d90f0f]' : 'border-transparent text-[#666] hover:text-[#222]'}`}
            >
              Tài khoản nhân viên
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-5 px-6 font-bold text-sm border-b-2 transition ${activeTab === 'audit' ? 'border-[#d90f0f] text-[#d90f0f]' : 'border-transparent text-[#666] hover:text-[#222]'}`}
            >
              Audit Log (Lịch sử thao tác)
            </button>
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'accounts' ? (
            loadingUsers ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#999] uppercase tracking-wider text-[10px] font-bold">
                      <th className="px-4 py-3 pb-5">Email</th>
                      <th className="px-4 py-3 pb-5">Họ tên</th>
                      <th className="px-4 py-3 pb-5">Vai trò</th>
                      <th className="px-4 py-3 pb-5">Trạng thái</th>
                      <th className="px-4 py-3 pb-5">Đăng nhập cuối</th>
                      <th className="px-4 py-3 pb-5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {employees.map((emp) => (
                      <tr
                        key={emp.userId}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-4 font-mono text-sm text-[#666]">
                          {emp.email}
                        </td>
                        <td className="px-4 py-4 font-bold text-[#222]">
                          {emp.fullName}
                        </td>
                        <td className="px-4 py-4 text-[#4f5562]">{emp.role}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[#666] italic text-xs">
                          {emp.lastLogin
                            ? new Date(emp.lastLogin).toLocaleString('vi-VN')
                            : 'Chưa đăng nhập'}
                        </td>
                        <td className="px-4 py-4 text-right space-x-2">
                          <button
                            onClick={() => setEditingUser(emp)}
                            className="text-[#d90f0f] font-bold hover:underline"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(emp.userId)}
                            className="text-red-500 font-bold hover:underline"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : loadingLogs ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#999] uppercase tracking-wider text-[10px] font-bold">
                    <th className="px-4 py-3 pb-5">Người thực hiện</th>
                    <th className="px-4 py-3 pb-5">Hành động</th>
                    <th className="px-4 py-3 pb-5">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {auditLogs.map((log) => (
                    <tr
                      key={log.logId}
                      className="hover:bg-gray-50 transition text-xs"
                    >
                      <td className="px-4 py-4 font-bold text-[#222]">
                        {log.userName}
                      </td>
                      <td className="px-4 py-4 text-[#4f5562]">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-[#222] border border-gray-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-[#4f5562]">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolePermissionPage;

