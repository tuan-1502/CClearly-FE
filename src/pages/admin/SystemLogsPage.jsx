import {
  Search,
  Download,
  Eye,
  Calendar,
  User,
  X,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminLogs } from '@/hooks/useAdmin';

const ACTION_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'IMPORT_STOCK', label: 'Nhập kho' },
  { value: 'ADD_PRODUCT', label: 'Thêm sản phẩm' },
  { value: 'UPDATE_PRODUCT', label: 'Cập nhật sản phẩm' },
  { value: 'DELETE_PRODUCT', label: 'Xóa sản phẩm' },
  { value: 'ADD_VOUCHER', label: 'Thêm voucher' },
  { value: 'UPDATE_VOUCHER', label: 'Cập nhật voucher' },
  { value: 'DELETE_VOUCHER', label: 'Xóa voucher' },
  { value: 'CHANGE_BANNER', label: 'Đổi banner' },
  { value: 'CREATE_USER', label: 'Cấp tài khoản' },
  { value: 'UPDATE_USER', label: 'Cập nhật tài khoản' },
  { value: 'BAN_ACCOUNT', label: 'Ban tài khoản' },
  { value: 'UPDATE_SETTINGS', label: 'Cập nhật cấu hình' },
  { value: 'LOGIN', label: 'Đăng nhập' },
];

const ACTION_LABELS = {
  IMPORT_STOCK: 'Nhập kho',
  ADD_PRODUCT: 'Thêm sản phẩm',
  UPDATE_PRODUCT: 'Cập nhật SP',
  DELETE_PRODUCT: 'Xóa sản phẩm',
  ADD_VOUCHER: 'Thêm voucher',
  UPDATE_VOUCHER: 'Cập nhật voucher',
  DELETE_VOUCHER: 'Xóa voucher',
  CHANGE_BANNER: 'Đổi banner',
  CHANGE_EMAIL_TEMPLATE: 'Đổi email template',
  CREATE_USER: 'Cấp tài khoản',
  UPDATE_USER: 'Cập nhật TK',
  BAN_ACCOUNT: 'Ban tài khoản',
  RESET_PASSWORD: 'Reset mật khẩu',
  UPDATE_SETTINGS: 'Cập nhật cấu hình',
  LOGIN: 'Đăng nhập',
};

const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${hh}:${mm} ${dd}/${mo}/${yy}`;
};

const SystemLogsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);

  const { data: logsData, isLoading } = useAdminLogs({
    action: actionFilter || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    size: 20,
  });

  const logs = logsData?.items || [];
  const meta = logsData?.meta || {};

  // Client-side search filter
  const filteredLogs = searchTerm
    ? logs.filter(
        (log) =>
          (log.details || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : logs;

  const getActionBadge = (action) => {
    const badges = {
      IMPORT_STOCK: 'bg-red-100 text-red-700',
      ADD_PRODUCT: 'bg-green-100 text-green-700',
      UPDATE_PRODUCT: 'bg-red-100 text-red-700',
      DELETE_PRODUCT: 'bg-red-100 text-red-700',
      ADD_VOUCHER: 'bg-purple-100 text-purple-700',
      UPDATE_VOUCHER: 'bg-purple-100 text-purple-700',
      DELETE_VOUCHER: 'bg-red-100 text-red-700',
      CHANGE_BANNER: 'bg-orange-100 text-orange-700',
      CHANGE_EMAIL_TEMPLATE: 'bg-cyan-100 text-cyan-700',
      BAN_ACCOUNT: 'bg-red-100 text-red-700',
      CREATE_USER: 'bg-emerald-100 text-emerald-700',
      UPDATE_USER: 'bg-red-100 text-red-700',
      RESET_PASSWORD: 'bg-amber-100 text-amber-700',
      UPDATE_SETTINGS: 'bg-teal-100 text-teal-700',
      LOGIN: 'bg-violet-100 text-violet-700',
    };
    return badges[action] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#222]">Nhật ký hệ thống</h1>
          <p className="text-[#4f5562]">
            Theo dõi các hoạt động trong hệ thống
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#d90f0f] text-white rounded-xl font-medium hover:bg-[#b00c0c] transition-colors">
          <Download size={18} />
          Xuất log
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo người dùng hoặc nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]/20 focus:border-[#d90f0f]"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(0);
            }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]/20 focus:border-[#d90f0f] bg-white cursor-pointer"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(0);
                }}
                className="pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]/20 focus:border-[#d90f0f] bg-white text-sm"
              />
            </div>
            <span className="text-gray-400">-</span>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(0);
                }}
                className="pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d90f0f]/20 focus:border-[#d90f0f] bg-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Người thực hiện
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Chi tiết
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.logId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4f5562]">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-[#222]">
                          {log.userName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getActionBadge(log.action)}`}
                      >
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4f5562] max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4f5562] font-mono">
                      {log.ipAddress || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-2 text-gray-400 hover:text-[#d90f0f] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredLogs.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">
              Không tìm thấy kết quả nào khớp với bộ lọc
            </p>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Trang {(meta.page ?? 0) + 1} / {meta.totalPages} (
              {meta.totalElements} bản ghi)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (meta.totalPages ?? 1) - 1}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-[#222]">
                Chi tiết nhật ký hoạt động
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Thời gian
                  </p>
                  <p className="font-medium text-[#222]">
                    {formatDateTime(selectedLog.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    IP Address
                  </p>
                  <p className="font-mono text-[#222]">
                    {selectedLog.ipAddress || '—'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Hành động
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getActionBadge(selectedLog.action)}`}
                  >
                    {ACTION_LABELS[selectedLog.action] || selectedLog.action}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Người thực hiện
                  </p>
                  <p className="font-medium text-[#222]">
                    {selectedLog.userName}
                  </p>
                </div>
              </div>
              {(selectedLog.oldValue || selectedLog.newValue) && (
                <div className="grid grid-cols-2 gap-6">
                  {selectedLog.oldValue && (
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Giá trị cũ
                      </p>
                      <div className="text-[#4f5562] bg-red-50 p-3 rounded-xl border border-red-100 text-sm">
                        {selectedLog.oldValue}
                      </div>
                    </div>
                  )}
                  {selectedLog.newValue && (
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Giá trị mới
                      </p>
                      <div className="text-[#4f5562] bg-green-50 p-3 rounded-xl border border-green-100 text-sm">
                        {selectedLog.newValue}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="pt-4 border-t border-gray-50">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Chi tiết
                </p>
                <div className="text-[#4f5562] bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">
                  {selectedLog.details}
                </div>
              </div>
            </div>
            <div className="p-5 bg-gray-50 border-t flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2 bg-white border border-gray-200 text-[#222] rounded-xl hover:bg-gray-100 font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemLogsPage;

