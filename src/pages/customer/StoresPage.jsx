import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { useState } from 'react';

const stores = [
  {
    name: 'CClearly FLAGSHIP - Quận 1',
    address: '123 Lê Lợi, Quận 1',
    phone: '028 1234 5678',
    hours: '09:00 - 21:00',
    lat: 10.772,
    lng: 106.698,
  },
  {
    name: 'CClearly STUDIO - Quận 7',
    address: '456 Nguyễn Lương Bằng, Quận 7',
    phone: '028 8765 4321',
    hours: '09:00 - 21:00',
    lat: 10.729,
    lng: 106.721,
  },
  {
    name: 'CClearly GALLERY - Hoàn Kiếm',
    address: '89 Tràng Tiền, Hoàn Kiếm',
    phone: '024 1122 3344',
    hours: '09:00 - 21:00',
    lat: 21.024,
    lng: 105.855,
  },
  {
    name: 'CClearly CENTER - Hải Châu',
    address: '78 Nguyễn Văn Linh, Hải Châu',
    phone: '0236 1234 567',
    hours: '09:00 - 21:00',
    lat: 16.054,
    lng: 108.202,
  },
];

const StoresPage = () => {
  const [selectedStore, setSelectedStore] = useState(stores[0]);

  return (
    <div className="bg-white min-h-screen">
      {/* HEADER */}

      <section className="py-16 bg-[#f3f3f3]">
        <div className="max-w-[1240px] mx-auto px-4">
          <h1 className="text-5xl font-bold text-[#222]">Hệ Thống Cửa Hàng</h1>

          <p className="mt-3 text-[#555]">Tìm cửa hàng CClearly gần bạn nhất</p>
        </div>
      </section>

      {/* STORE + MAP */}

      <section className="max-w-[1240px] mx-auto px-4 py-12 h-[650px]">
        <div className="grid lg:grid-cols-[420px_1fr] gap-8 h-full">
          {/* STORE LIST */}

          <div className="space-y-4 overflow-y-auto pr-2">
            {stores.map((store, index) => {
              const active = selectedStore.name === store.name;

              return (
                <div
                  key={index}
                  onClick={() => setSelectedStore(store)}
                  className={`p-5 rounded-xl border cursor-pointer transition
                  ${
                    active
                      ? 'border-[#d90f0f] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-bold text-[#222] mb-2">{store.name}</h3>

                  <div className="space-y-2 text-sm text-[#555]">
                    <div className="flex gap-2 items-start">
                      <MapPin size={16} className="text-[#d90f0f] mt-1" />
                      {store.address}
                    </div>

                    <div className="flex gap-2 items-center">
                      <Phone size={16} className="text-[#d90f0f]" />
                      {store.phone}
                    </div>

                    <div className="flex gap-2 items-center">
                      <Clock size={16} className="text-[#d90f0f]" />
                      {store.hours}
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center gap-2 text-sm font-medium text-[#d90f0f]"
                  >
                    <Navigation size={16} />
                    Chỉ đường
                  </a>
                </div>
              );
            })}
          </div>

          {/* MAP */}

          <div className="rounded-2xl overflow-hidden shadow-lg h-full">
            <iframe
              title="store-map"
              className="w-full h-full border-0"
              loading="lazy"
              src={`https://maps.google.com/maps?q=${selectedStore.lat},${selectedStore.lng}&z=15&output=embed`}
            />
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="py-20 bg-[#d90f0f] text-white text-center">
        <div className="max-w-[700px] mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">
            Không có cửa hàng gần bạn?
          </h2>

          <p className="text-white/80 mb-8">
            Liên hệ với chúng tôi để được tư vấn hoặc đặt lịch đo mắt.
          </p>

          <a
            href="tel:02812345678"
            className="bg-white text-[#d90f0f] px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            Gọi ngay: 028 1234 5678
          </a>
        </div>
      </section>
    </div>
  );
};

export default StoresPage;

