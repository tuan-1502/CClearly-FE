import { X, Upload } from 'lucide-react';

const PrescriptionModal = ({
  isOpen,
  order,
  onClose,
  onSave,
  form,
  setForm,
  options,
  handleImageUpload,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-[#222]">
              Sửa thông số kính thuốc
            </h2>
            <p className="text-sm text-[#4f5562]">Đơn hàng: {order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-[#222] mb-4">
              Thông số kính thuốc
            </h3>

            {/* Right Eye */}
            <div className="mb-4">
              <p className="text-sm font-medium text-[#222] mb-2">
                Mắt phải (OD)
              </p>
              <div className="grid grid-cols-4 gap-2">
                {['sph', 'cyl', 'axis', 'add'].map((field) => (
                  <div key={field}>
                    <label className="text-xs text-gray-500 uppercase">
                      {field}
                    </label>
                    <select
                      value={form.rightEye[field]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          rightEye: {
                            ...form.rightEye,
                            [field]: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2 py-2 border rounded-lg text-sm"
                    >
                      <option value="">
                        {field === 'axis' ? '0' : '0.00'}
                      </option>
                      {field === 'sph' &&
                        options.SPH.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      {field === 'cyl' &&
                        options.CYL.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      {field === 'axis' &&
                        options.AXIS.map((v) => (
                          <option key={v} value={v}>
                            {v}°
                          </option>
                        ))}
                      {field === 'add' &&
                        [
                          '0.75',
                          '1.00',
                          '1.25',
                          '1.50',
                          '1.75',
                          '2.00',
                          '2.25',
                          '2.50',
                          '2.75',
                          '3.00',
                        ].map((v) => (
                          <option key={v} value={v}>
                            +{v}
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Left Eye */}
            <div className="mb-4">
              <p className="text-sm font-medium text-[#222] mb-2">
                Mắt trái (OS)
              </p>
              <div className="grid grid-cols-4 gap-2">
                {['sph', 'cyl', 'axis', 'add'].map((field) => (
                  <div key={field}>
                    <label className="text-xs text-gray-500 uppercase">
                      {field}
                    </label>
                    <select
                      value={form.leftEye[field]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          leftEye: { ...form.leftEye, [field]: e.target.value },
                        })
                      }
                      className="w-full px-2 py-2 border rounded-lg text-sm"
                    >
                      <option value="">
                        {field === 'axis' ? '0' : '0.00'}
                      </option>
                      {field === 'sph' &&
                        options.SPH.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      {field === 'cyl' &&
                        options.CYL.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      {field === 'axis' &&
                        options.AXIS.map((v) => (
                          <option key={v} value={v}>
                            {v}°
                          </option>
                        ))}
                      {field === 'add' &&
                        [
                          '0.75',
                          '1.00',
                          '1.25',
                          '1.50',
                          '1.75',
                          '2.00',
                          '2.25',
                          '2.50',
                          '2.75',
                          '3.00',
                        ].map((v) => (
                          <option key={v} value={v}>
                            +{v}
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* PD */}
            <div className="mb-4">
              <label className="text-sm font-medium text-[#222] block mb-2">
                Khoảng cách đồng tử (PD)
              </label>
              <input
                type="number"
                value={form.pd}
                onChange={(e) => setForm({ ...form, pd: e.target.value })}
                placeholder="VD: 62"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            {/* Upload */}
            <div>
              <label className="text-sm font-medium text-[#222] block mb-2">
                Ảnh đơn kính (nếu có)
              </label>
              <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-gray-50">
                <input
                  type="file"
                  id="prescription-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="prescription-upload" className="cursor-pointer">
                  {form.prescriptionImage ? (
                    <div>
                      <img
                        src={form.prescriptionImage}
                        alt="Prescription"
                        className="max-h-40 mx-auto rounded-lg"
                      />
                      <p className="text-xs text-green-600 mt-2">
                        Nhấn để thay đổi ảnh
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Nhấn để tải ảnh đơn kính
                      </p>
                      <p className="text-xs text-gray-400">
                        JPG, PNG, PDF (tối đa 5MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-5 py-3 bg-[#d90f0f] text-white rounded-xl hover:bg-[#b00c0c] font-medium"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;

