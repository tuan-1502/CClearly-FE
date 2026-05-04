import { Scan, Upload, ArrowRight, Info, Loader2, MessageSquare, Send, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { uploadRequest } from '@/api/upload';
import { aiRequest } from '@/api/ai';
import { useAddToCart } from '@/hooks/useCart';
import { useProductDetail } from '@/hooks/useProduct';

const PrescriptionFormPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('productId');
  const variantId = searchParams.get('variantId');
  const quantity = parseInt(searchParams.get('quantity')) || 1;

  const addToCart = useAddToCart();
  const { data: product } = useProductDetail(productId);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    if (variantId)
      return (
        product.variants.find((v) => v.variantId === variantId) ||
        product.variants[0]
      );
    return product.variants[0];
  }, [product, variantId]);

  const displayPrice =
    selectedVariant?.salePrice || product?.salePrice || product?.basePrice || 0;
  const displayImage =
    selectedVariant?.images?.[0] || product?.images?.[0] || '';

  const [prescription, setPrescription] = useState({
    od_sph: '',
    od_cyl: '',
    od_axs: '',
    od_add: '',
    os_sph: '',
    os_cyl: '',
    os_axs: '',
    os_add: '',
    pd: '',
    note: '',
  });

  const [uploadFile, setUploadFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleScanWithAI = async () => {
    if (!uploadFile) {
      toast.error('Vui lòng chọn ảnh trước khi quét!');
      return;
    }

    setIsScanning(true);
    try {
      const response = await aiRequest.extractPrescription(uploadFile);
      console.log('AI Response:', response);

      // Mở hộp ApiResponse để lấy data thực sự bên trong
      if (response && response.success && response.data) {
        const data = response.data;
        console.log('--- RAW AI DATA ---', data);

        const normalize = (val) => {
          if (val === undefined || val === null || val === "") return "";
          const num = parseFloat(val.toString().replace('+', ''));
          return isNaN(num) ? "" : num.toFixed(2);
        };

        const normalizeAxis = (val) => {
          if (!val) return "";
          const num = parseInt(val.toString());
          return isNaN(num) ? "" : num.toString();
        };

        setPrescription((prev) => ({
          ...prev,
          od_sph: normalize(data.od_sph || data.odSph),
          od_cyl: normalize(data.od_cyl || data.odCyl),
          od_axs: normalizeAxis(data.od_axs || data.odAxs),
          od_add: normalize(data.od_add || data.odAdd),
          os_sph: normalize(data.os_sph || data.osSph),
          os_cyl: normalize(data.os_cyl || data.osCyl),
          os_axs: normalizeAxis(data.os_axs || data.osAxs),
          os_add: normalize(data.os_add || data.osAdd),
          pd: data.pd ? data.pd.toString().split('/')[0].trim() : prev.pd,
          note: data.note || prev.note,
        }));
        toast.success('Đã tự động điền thông số từ ảnh!');
      } else {
        toast.warn('AI không trả về dữ liệu hoặc dữ liệu không hợp lệ.');
      }
    } catch (err) {
      console.error('AI Scan Error:', err);
      toast.error('Lỗi khi quét ảnh bằng AI');
    } finally {
      setIsScanning(false);
    }
  };

  const handleChatWithAI = async () => {
    if (!chatMessage.trim()) return;
    setIsChatLoading(true);
    try {
      const response = await aiRequest.chatPrescription(chatMessage);
      if (response && response.success && response.data) {
        const data = response.data;
        const normalize = (val) => {
          if (val === undefined || val === null || val === "") return "";
          const num = parseFloat(val.toString().replace('+', ''));
          return isNaN(num) ? "" : num.toFixed(2);
        };
        const normalizeAxis = (val) => {
          if (!val) return "";
          const num = parseInt(val.toString());
          return isNaN(num) ? "" : num.toString();
        };

        setPrescription((prev) => ({
          ...prev,
          od_sph: normalize(data.od_sph || data.odSph),
          od_cyl: normalize(data.od_cyl || data.odCyl),
          od_axs: normalizeAxis(data.od_axs || data.odAxs),
          od_add: normalize(data.od_add || data.odAdd),
          os_sph: normalize(data.os_sph || data.osSph),
          os_cyl: normalize(data.os_cyl || data.osCyl),
          os_axs: normalizeAxis(data.os_axs || data.osAxs),
          os_add: normalize(data.os_add || data.osAdd),
          pd: data.pd ? data.pd.toString() : prev.pd,
          note: data.note || prev.note,
        }));
        toast.success('Trợ lý AI đã gợi ý thông số cho bạn!');
        setIsChatModalOpen(false);
        setChatMessage('');
      }
    } catch (err) {
      toast.error('Lỗi khi trò chuyện với AI');
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPrescription((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Vui lòng tải ảnh đơn kính lên!');
      return;
    }
    try {
      // 1. Upload prescription image
      let imageUrl = '';
      try {
        imageUrl = await uploadRequest.uploadImage(uploadFile, 'prescriptions');
      } catch {
        toast.error('Lỗi tải ảnh lên, vui lòng thử lại');
        return;
      }

      // 2. Add product to cart
      await addToCart.mutateAsync({
        variantId,
        quantity,
        productName: product?.name || '',
        price: displayPrice,
        imageUrl: displayImage,
        colorName: selectedVariant?.colorName || '',
        productType: product?.type || '',
        variantSku: selectedVariant?.sku || '',
        isPreorder: selectedVariant?.isPreorder || false,
      });

      // 3. Save prescription data to sessionStorage (keyed by variantId)
      const prescriptionData = {
        ...prescription,
        imageUrl,
        productName: product?.name || '',
        variantId,
      };
      const saved = JSON.parse(
        sessionStorage.getItem('cartPrescriptions') || '{}'
      );
      saved[variantId] = prescriptionData;
      sessionStorage.setItem('cartPrescriptions', JSON.stringify(saved));

      toast.success('Đã lưu đơn kính và thêm vào giỏ hàng!');
      navigate(-1);
    } catch (err) {
      toast.error('Không thể thêm vào giỏ hàng, vui lòng thử lại');
    }
  };

  const SPH_VALUES = Array.from({ length: 81 }, (_, i) =>
    (i * 0.25 - 10).toFixed(2)
  );
  const CYL_VALUES = Array.from({ length: 25 }, (_, i) =>
    (i * 0.25 - 3).toFixed(2)
  );
  const AXS_VALUES = Array.from({ length: 181 }, (_, i) => i.toString());
  const ADD_VALUES = Array.from({ length: 14 }, (_, i) =>
    (0.75 + i * 0.25).toFixed(2)
  );
  return (
    <>
      <div className="bg-[#ececec] min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* HEADER */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#222]">
                Nhập đơn kính (Rx)
              </h1>
              <p className="text-[#4f5562] mt-1">
                Vui lòng nhập chính xác các thông số từ bác sĩ
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsChatModalOpen(true)}
              className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow hover:bg-gray-50 transition-colors group"
              title="Chat với trợ lý AI"
            >
              <MessageSquare className="w-6 h-6 text-[#d90f0f] group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* MAIN GRID */}
            <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
              {/* LEFT SIDE - RX INPUT */}
              <div className="bg-white rounded-3xl shadow p-8">
                <div className="flex items-center gap-3 mb-8">
                  <Info className="w-4 h-4 text-[#d90f0f]" />
                  <p className="text-xs text-[#d90f0f] font-semibold uppercase">
                    Thông số kỹ thuật
                  </p>
                </div>

                {/* HEADER */}
                <div className="grid grid-cols-5 gap-4 mb-6 text-center">
                  <div></div>
                  <div className="text-xs font-bold text-gray-400">SPH</div>
                  <div className="text-xs font-bold text-gray-400">CYL</div>
                  <div className="text-xs font-bold text-gray-400">AXS</div>
                  <div className="text-xs font-bold text-gray-400">ADD</div>
                </div>

                {/* RIGHT EYE */}
                <div className="grid grid-cols-5 gap-4 items-center mb-6">
                  <div className="font-semibold">Mắt phải (OD)</div>

                  {['od_sph', 'od_cyl', 'od_axs', 'od_add'].map((field) => (
                    <select
                      key={field}
                      value={prescription[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">0.00</option>

                      {(field.includes('sph')
                        ? SPH_VALUES
                        : field.includes('cyl')
                          ? CYL_VALUES
                          : field.includes('add')
                            ? ADD_VALUES
                            : AXS_VALUES
                      ).map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>

                {/* LEFT EYE */}
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="font-semibold">Mắt trái (OS)</div>

                  {['os_sph', 'os_cyl', 'os_axs', 'os_add'].map((field) => (
                    <select
                      key={field}
                      value={prescription[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">0.00</option>

                      {(field.includes('sph')
                        ? SPH_VALUES
                        : field.includes('cyl')
                          ? CYL_VALUES
                          : field.includes('add')
                            ? ADD_VALUES
                            : AXS_VALUES
                      ).map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex flex-col gap-6">
                {/* PD */}
                <div className="bg-white rounded-3xl shadow p-6">
                  <label className="font-semibold mb-2 block">
                    Khoảng cách đồng tử (PD)
                  </label>

                  <input
                    type="number"
                    value={prescription.pd}
                    onChange={(e) => handleInputChange('pd', e.target.value)}
                    placeholder="Ví dụ: 62"
                    className="w-full border rounded-lg px-4 py-2"
                  />

                  <p className="text-xs text-gray-500 mt-2">
                    * Nếu không có PD hãy liên hệ nhân viên hỗ trợ
                  </p>
                </div>

                {/* NOTE */}
                <div className="bg-white rounded-3xl shadow p-6">
                  <label className="font-semibold mb-2 block">Ghi chú thêm</label>

                  <textarea
                    rows={3}
                    value={prescription.note}
                    onChange={(e) => handleInputChange('note', e.target.value)}
                    placeholder="Lưu ý cho kỹ thuật viên..."
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                {/* UPLOAD */}
                <div className="bg-white rounded-3xl shadow p-6">
                  <h3 className="font-semibold mb-4">
                    Tải ảnh đơn kính <span className="text-red-500">*</span>
                  </h3>

                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center hover:bg-gray-50 ${!uploadFile ? 'border-red-300' : 'border-green-300'}`}
                  >
                    <input
                      type="file"
                      id="rx-upload"
                      className="hidden"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                    />

                    <label htmlFor="rx-upload" className="cursor-pointer">
                      <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />

                      <p className="text-sm font-medium">Nhấn để chọn ảnh</p>

                      <p className="text-xs text-gray-500 mt-1">
                        JPG / PNG / PDF (5MB)
                      </p>

                      {uploadFile ? (
                        <p className="text-xs text-green-600 mt-3">
                          ✓ {uploadFile.name}
                        </p>
                      ) : (
                        <p className="text-xs text-red-500 mt-3">Bắt buộc *</p>
                      )}
                    </label>
                  </div>

                  {uploadFile && (
                    <button
                      type="button"
                      onClick={handleScanWithAI}
                      disabled={isScanning}
                      className="w-full mt-4 py-3 bg-[#d90f0f] text-white rounded-xl flex items-center justify-center gap-2 hover:bg-[#b00d0d] transition-colors disabled:opacity-50"
                    >
                      {isScanning ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Scan className="w-5 h-5" />
                      )}
                      {isScanning ? 'Đang phân tích...' : 'Quét bằng AI (Tự điền)'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border rounded-full"
              >
                Quay lại
              </button>

              <button
                type="submit"
                disabled={addToCart.isPending}
                className="px-8 py-3 bg-[#361414] text-white rounded-full flex items-center gap-2 disabled:opacity-50"
              >
                {addToCart.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight size={18} />
                )}
                {addToCart.isPending ? 'Đang xử lý...' : 'Lưu & Thêm vào giỏ'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* AI CHAT ASSISTANT MODAL */}
      {isChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between bg-[#d90f0f] text-white">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6" />
                <h3 className="font-bold">Trợ lý AI CClearly</h3>
              </div>
              <button onClick={() => setIsChatModalOpen(false)} className="hover:rotate-90 transition-transform">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Bạn không có đơn kính? Hãy mô tả tình trạng mắt (VD: "Tôi cận 2 độ, mắt trái yếu hơn chút") để tôi hỗ trợ điền thông số gợi ý.
              </p>

              <div className="relative">
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Nhập tình trạng mắt của bạn..."
                  className="w-full border rounded-2xl p-4 pr-12 h-32 focus:ring-2 focus:ring-[#d90f0f] outline-none transition-all"
                />
                <button
                  onClick={handleChatWithAI}
                  disabled={isChatLoading || !chatMessage.trim()}
                  className="absolute bottom-4 right-4 p-2 bg-[#d90f0f] text-white rounded-xl disabled:opacity-50 hover:bg-[#b00d0d]"
                >
                  {isChatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400">
                <Info className="w-3 h-3" />
                <span>Lưu ý: Các thông số chỉ mang tính chất tham khảo dựa trên mô tả của bạn.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrescriptionFormPage;

