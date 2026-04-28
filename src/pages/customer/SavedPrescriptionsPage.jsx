import {
  FileText,
  Calendar,
  User,
  Eye,
  Download,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/ConfirmModal';

const SavedPrescriptionsPage = () => {
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const [prescriptions, setPrescriptions] = useState([
    {
      id: 'RX12345',
      date: '2026-03-01',
      patientName: 'Nguyễn Văn A',
      sphOd: -2.25,
      cylOd: -0.75,
      axisOd: 175,
      addOd: null,
      sphOs: -2.5,
      cylOs: -0.5,
      axisOs: 180,
      addOs: null,
      pd: 64,
      notes: 'Đơn từ bệnh viện Mắt TW',
    },
    {
      id: 'RX09876',
      date: '2025-08-15',
      patientName: 'Nguyễn Văn A',
      sphOd: -2.0,
      cylOd: 0,
      axisOd: 0,
      addOd: null,
      sphOs: -2.0,
      cylOs: 0,
      axisOs: 0,
      addOs: null,
      pd: 63,
      notes: 'Đơn cũ năm ngoái',
    },
  ]);

  const handleDelete = (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = () => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== confirmModal.id));
    toast.success('Đã xóa đơn kính đã lưu');
    setConfirmModal({ isOpen: false, id: null });
  };

  return (
    <div className="bg-[#ececec] min-h-screen py-10">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#222] tracking-[-0.02em]">
              Đơn kính đã lưu
            </h1>
            <p className="text-[#4f5562] mt-2">
              Lưu trữ và tái sử dụng các đơn kính của bạn
            </p>
          </div>
          <button className="bg-[#361414] text-white px-6 py-3 rounded-full font-bold hover:bg-black transition flex items-center gap-2">
            <Plus className="w-5 h-5" /> Thêm đơn kính mới
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {prescriptions.map((px) => (
            <div
              key={px.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 text-[#d90f0f] rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-[#222]">{px.id}</p>
                      <p className="text-xs text-[#4f5562] flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Ngày đo:{' '}
                        {new Date(px.date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 text-gray-400 hover:text-[#d90f0f] transition"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-500 transition"
                      title="Xóa"
                      onClick={() => handleDelete(px.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#fcfcfc] p-3 rounded-xl border border-gray-50">
                    <p className="text-[10px] uppercase font-bold text-[#999] tracking-wider mb-2">
                      Mắt Phải (OD)
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <p className="text-[#4f5562]">
                        SPH:{' '}
                        <span className="text-[#222] font-bold">
                          {px.sphOd}
                        </span>
                      </p>
                      <p className="text-[#4f5562]">
                        CYL:{' '}
                        <span className="text-[#222] font-bold">
                          {px.cylOd}
                        </span>
                      </p>
                      <p className="text-[#4f5562]">
                        AXS:{' '}
                        <span className="text-[#222] font-bold">
                          {px.axisOd}°
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#fcfcfc] p-3 rounded-xl border border-gray-50">
                    <p className="text-[10px] uppercase font-bold text-[#999] tracking-wider mb-2">
                      Mắt Trái (OS)
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <p className="text-[#4f5562]">
                        SPH:{' '}
                        <span className="text-[#222] font-bold">
                          {px.sphOs}
                        </span>
                      </p>
                      <p className="text-[#4f5562]">
                        CYL:{' '}
                        <span className="text-[#222] font-bold">
                          {px.cylOs}
                        </span>
                      </p>
                      <p className="text-[#4f5562]">
                        AXS:{' '}
                        <span className="text-[#222] font-bold">
                          {px.axisOs}°
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-medium text-[#222]">
                      {px.patientName}
                    </p>
                  </div>
                  <button className="text-[11px] font-bold text-[#d90f0f] flex items-center gap-1 hover:underline uppercase tracking-wider">
                    <Download className="w-3 h-3" /> Tải về PDF
                  </button>
                </div>
              </div>
            </div>
          ))}

          {prescriptions.length === 0 && (
            <div className="col-span-2 text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[#4f5562]">
                Bạn chưa có đơn kính nào được lưu.
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        type="danger"
        title="Xóa đơn kính"
        message="Bạn có chắc chắn muốn xóa đơn kính này khỏi danh sách đã lưu? Thao tác này không thể hoàn tác."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default SavedPrescriptionsPage;

