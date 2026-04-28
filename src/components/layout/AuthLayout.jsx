import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const banners = [
  {
    url: '/assets/auth/banner1.png',
    title: 'CClearly',
    description: 'Hệ thống bán kính mắt trực tuyến',
    subtext:
      'Mua kính thuận tiện tại nhà với đa dạng sản phẩm và dịch vụ chất lượng',
  },
  {
    url: '/assets/auth/banner2.png',
    title: 'Phong cách & Hiện đại',
    description: 'Bản sắc riêng qua từng gọng kính',
    subtext: 'Khám phá bộ sưu tập mới nhất với thiết kế dẫn đầu xu hướng',
  },
  {
    url: '/assets/auth/banner3.png',
    title: 'Tầm nhìn chuyên nghiệp',
    description: 'Sự kết hợp hoàn hảo giữa công nghệ và thời trang',
    subtext:
      'Chúng tôi cam kết mang lại sự hài lòng tuyệt đối cho đôi mắt của bạn',
  },
];

export const AuthLayout = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex relative">
      {/* Back Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full transition-all group bg-white shadow-md border border-gray-100 text-[#222] hover:bg-gray-50 lg:bg-white/10 lg:backdrop-blur-md lg:border-white/20 lg:text-white lg:hover:bg-white/20 lg:shadow-none"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-semibold tracking-wide">TRANG CHỦ</span>
      </Link>
      {/* Left Side - Branding with Carousel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-center items-center p-12">
        {/* Background Images */}
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={banner.url}
              alt={`Banner ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Dark Overlay for Readability */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        {/* Content Over Carousel */}
        <div className="relative z-10 text-center text-white">
          <Link
            to="/"
            className="inline-block hover:opacity-80 transition-opacity"
          >
            <svg
              viewBox="0 0 120 40"
              className="h-16 w-32 mx-auto mb-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="34" cy="20" r="12" />
              <circle cx="66" cy="20" r="12" />
              <path d="M46 20h8" strokeLinecap="round" />
            </svg>
          </Link>
          <h1 className="text-5xl font-extrabold tracking-[-0.03em] mb-4 drop-shadow-lg transition-all duration-500">
            {banners[currentSlide].title}
          </h1>
          <p className="text-2xl text-white/90 text-center max-w-md mx-auto font-medium drop-shadow-md transition-all duration-500">
            {banners[currentSlide].description}
          </p>
          <p className="mt-6 text-lg text-white/80 max-w-sm mx-auto drop-shadow-md transition-all duration-500">
            {banners[currentSlide].subtext}
          </p>

          {/* Carousel Indicators */}
          <div className="flex gap-2 justify-center mt-12">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link
            to="/"
            className="lg:hidden flex items-center justify-center gap-2 text-2xl font-extrabold text-[#222] text-center block mb-8"
          >
            <svg
              viewBox="0 0 120 40"
              className="h-8 w-20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="34" cy="20" r="12" />
              <circle cx="66" cy="20" r="12" />
              <path d="M46 20h8" strokeLinecap="round" />
            </svg>
            <span>CClearly</span>
          </Link>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

