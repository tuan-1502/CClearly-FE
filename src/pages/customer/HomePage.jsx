import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import heroWoman from '@/assets/homepage/hero_woman_v2.png';
import polarizedImg from '@/assets/homepage/polarized_lenses.png';
import { useProducts, useActiveBanners } from '@/hooks/useProduct';

const uspItems = [
  'Đổi trả 14 ngày',
  'Hỗ trợ 24/7',
  '184K+ Đánh giá',
  'Bảo hiểm thị giác',
];

const styleItems = [
  { name: 'Cổ điển', color: '#BBC0C9' },
  { name: 'Thân thiện môi trường', color: '#C79831' },
  { name: 'Nghệ thuật', color: '#8A1313' },
  { name: 'Retro', color: '#8B533D' },
  { name: 'Cá tính', color: '#B6461C' },
];

const reviews = [
  {
    quote: 'Tuyệt vời! Tôi cảm thấy tự tin hơn và mỏi mắt giảm đi rất nhiều.',
    author: 'PAWLO V.',
    note: 'Tuyệt vời!',
    score: '4.4',
    avatar: '#3C8AA9',
  },
  {
    quote: 'Kính này vừa khít hoàn hảo. Rất nhẹ và trông rất chắc chắn.',
    author: 'MICKAELA W.',
    note: 'Chất lượng tốt',
    score: '3.0',
    avatar: '#807D9D',
  },
  {
    quote:
      'Tôi rất thích cách sử dụng dễ dàng. Dịch vụ khách hàng hỗ trợ nhanh chóng và gọng kính rất sang trọng.',
    author: 'SAM A.',
    note: 'Tôi rất thích',
    score: '4.7',
    avatar: '#4C7BD4',
  },
  {
    quote:
      'Rất dễ sử dụng, kính được giao nhanh chóng, và tôi nhận được nhiều lời khen từ bạn bè.',
    author: 'CALEE A. B.',
    note: 'Vừa khít hoàn hảo',
    score: '4.2',
    avatar: '#6A8AB0',
  },
  {
    quote:
      'Đặt hàng rất dễ và giá cả hợp lý. Tôi cũng thích thương hiệu Oakley.',
    author: 'CARLEE A. B.',
    note: 'Vừa khít hoàn hảo',
    score: '4.3',
    avatar: '#6C90A5',
  },
  {
    quote:
      'Đây là website kính mắt dễ sử dụng nhất để so sánh các kiểu dáng. Tính năng thử kính rất hữu ích.',
    author: 'EMILY S.',
    note: 'Dịch vụ khách hàng tuyệt vời!',
    score: '4.8',
    avatar: '#D48B4B',
  },
];

const reviewsTopTrack = [...reviews, ...reviews];
const reviewsBottomSeed = [...reviews.slice(2), ...reviews.slice(0, 2)];
const reviewsBottomTrack = [...reviewsBottomSeed, ...reviewsBottomSeed];

const heroAvatars = [
  {
    src: heroWoman,
    objectPosition: '48% 24%',
    filter: 'hue-rotate(-6deg) saturate(1.05)',
  },
  {
    src: polarizedImg,
    objectPosition: '40% 35%',
    filter: 'hue-rotate(10deg) saturate(0.9)',
  },
  {
    src: heroWoman,
    objectPosition: '56% 28%',
    filter: 'hue-rotate(28deg) saturate(0.95)',
  },
];

const StarIcon = ({ className = 'h-3.5 w-3.5' }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M10 2.2l2.3 4.66 5.15.75-3.72 3.63.88 5.13L10 13.96 5.4 16.37l.88-5.13-3.72-3.63 5.15-.75L10 2.2z" />
  </svg>
);

const GlassesSketch = ({ stroke = '#702B2B', className = 'h-20 w-full' }) => (
  <svg viewBox="0 0 180 70" fill="none" className={className}>
    <path
      d="M12 24c10-7 42-8 58-1 0 0 3 23-24 23S26 29 24 28m144-4c-10-7-42-8-58-1 0 0-3 23 24 23s20-17 22-18m-86-4h40m-86 2c-2 8-7 18-12 22m144-22c2 8 7 18 12 22"
      stroke={stroke}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HomePage = () => {
  const { data: productData, isLoading } = useProducts({
    type: 'frame',
    limit: 4,
  });

  // Fetch active banners
  const { data: allBanners } = useActiveBanners();
  const headerBanners =
    allBanners?.filter((b) => b.position === 'HEADER') || [];
  const mainBanners =
    allBanners?.filter((b) => b.position === 'HOME_MAIN') || [];
  const promoBanners =
    allBanners?.filter((b) => b.position === 'HOME_PROMO') || [];

  // Carousel state for HOME_MAIN
  const [currentSlide, setCurrentSlide] = useState(0);
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % (mainBanners.length || 1));
  }, [mainBanners.length]);
  const prevSlide = () => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + (mainBanners.length || 1)) % (mainBanners.length || 1)
    );
  };

  // Auto-advance carousel
  useEffect(() => {
    if (mainBanners.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [mainBanners.length, nextSlide]);

  // Mapping mock products to bestSellingItems UI format
  const bestSellingItems =
    productData?.content?.map((product) => {
      // Determine a stroke color based on material or just a random nice blue/grey
      const strokeColors = ['#A82E2E', '#8C6842', '#2C4F5E', '#7F273A'];
      const randomStroke =
        strokeColors[Math.floor(Math.random() * strokeColors.length)];

      return {
        id: product.id,
        name: product.name,
        price: new Intl.NumberFormat('vi-VN').format(product.basePrice) + 'đ',
        rating: product.rating?.toString() || '0.0',
        size: product.frame?.lensWidthMm >= 52 ? 'L' : 'M',
        colors: ['#222', '#555', '#999'], // Mocking color swatches as they are not explicitly an array in mock data
        stroke: randomStroke,
      };
    }) || [];

  return (
    <div className="bg-white text-[#101010]">
      {/* ─── HEADER Banner (announcement bar) ─── */}
      {headerBanners.length > 0 && (
        <section className="bg-[#361414] text-white">
          <div className="mx-auto flex max-w-[1240px] items-center justify-center gap-4 px-4 py-2.5 text-center">
            {headerBanners[0].imageUrl && (
              <img
                src={headerBanners[0].imageUrl}
                alt={headerBanners[0].title}
                className="h-6 w-6 rounded object-cover"
              />
            )}
            <p className="text-sm font-medium tracking-wide">
              {headerBanners[0].title}
            </p>
            <Link
              to="/products"
              className="ml-2 rounded-full border border-white/40 px-4 py-0.5 text-xs font-medium transition hover:bg-white hover:text-[#361414]"
            >
              Xem ngay
            </Link>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden bg-[#efefef]">
        <div
          className="pointer-events-none absolute inset-0 opacity-95"
          style={{
            backgroundImage:
              'linear-gradient(164deg, rgba(255,255,255,0.76) 8%, transparent 26%), linear-gradient(9deg, rgba(255,255,255,0.52) 4%, transparent 24%), radial-gradient(120% 68% at 22% 24%, rgba(255,255,255,0.75) 0%, rgba(239,239,239,0) 48%)',
          }}
        />

        <div className="relative mx-auto grid max-w-[1240px] gap-12 px-4 pb-16 pt-14 sm:px-6 lg:min-h-[620px] lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:py-16">
          <div className="lg:pb-3">
            <h1 className="max-w-[650px] text-[54px] font-bold leading-[0.97] tracking-[-0.03em] text-[#06080d] sm:text-[64px] lg:text-[86px]">
              Tầm nhìn rõ ràng,
              <br />
              Phong cách tinh tế
            </h1>
            <p className="mt-7 max-w-[530px] text-[19px] leading-[1.52] text-[#4f5562]">
              Trải nghiệm sự rõ ràng và chính xác hoàn hảo của kính mắt thời
              trang, khám phá tầm nhìn hoàn hảo với những chiếc kính phản ánh
              phong cách độc đáo của bạn.
            </p>

            <Link
              to="/products"
              className="mt-9 inline-flex rounded-full bg-[#361414] px-11 py-4 text-xl font-medium !text-white transition hover:bg-[#0d1322]"
            >
              Khám phá ngay
            </Link>

            <div className="mt-11 flex flex-wrap items-center gap-5">
              <div className="flex -space-x-2">
                {heroAvatars.map((avatar, index) => (
                  <span
                    key={`${avatar.src}-${index}`}
                    className="h-11 w-11 overflow-hidden rounded-full border-2 border-[#efefef] shadow-[0_3px_8px_rgba(0,0,0,0.2)]"
                  >
                    <img
                      src={avatar.src}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: avatar.objectPosition,
                        filter: avatar.filter,
                      }}
                    />
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-[#efb120]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <StarIcon key={index} className="h-4 w-4" />
                  ))}
                </div>
                <p className="mt-1 text-[14px] text-[#4e5562]">
                  Được tin tưởng bởi 33.000+ khách hàng
                </p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <div
              className="absolute inset-0 z-0 bg-[#f2ca52]"
              style={{
                clipPath:
                  'polygon(23% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 20%)',
                borderRadius: '0 32px 32px 0',
              }}
            />
            <div className="pointer-events-none absolute -bottom-12 left-[-10%] z-0 h-[206px] w-[123%] rounded-[50%] border-[3px] border-[#98a0ad] rotate-[-11deg]" />
            <img
              src={heroWoman}
              alt="Woman smiling with glasses"
              className="relative z-10 w-full object-cover"
              style={{
                clipPath:
                  'polygon(23% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 20%)',
                borderRadius: '0 32px 32px 0',
              }}
            />

            <span className="absolute left-4 top-2 z-30 text-[#f4ba31]">
              <svg viewBox="0 0 20 20" className="h-6 w-6" fill="currentColor">
                <path d="M10 1.8l1.4 4.8 4.8 1.4-4.8 1.4-1.4 4.8-1.4-4.8L3.8 8l4.8-1.4L10 1.8z" />
              </svg>
            </span>
            <span className="absolute left-2 top-14 z-30 text-[#f4ba31]">
              <svg
                viewBox="0 0 20 20"
                className="h-3.5 w-3.5"
                fill="currentColor"
              >
                <path d="M10 1.8l1.4 4.8 4.8 1.4-4.8 1.4-1.4 4.8-1.4-4.8L3.8 8l4.8-1.4L10 1.8z" />
              </svg>
            </span>
          </div>
        </div>
      </section>

      <section className="bg-[#d90f0f] py-4 text-white">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-4 text-xs sm:px-6 sm:text-sm">
          {uspItems.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-white/95 whitespace-nowrap"
            >
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/60">
                <svg
                  className="h-2.5 w-2.5"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="M2.5 6.2l2.2 2.1L9.5 3.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOME_MAIN Banner Carousel ─── */}
      {mainBanners.length > 0 && (
        <section className="relative overflow-hidden bg-white">
          <div className="relative mx-auto max-w-[1240px]">
            <div className="relative overflow-hidden rounded-none sm:rounded-2xl sm:mx-4 sm:my-4">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {mainBanners.map((banner) => (
                  <Link
                    key={banner.bannerId}
                    to="/products"
                    className="relative w-full flex-shrink-0"
                  >
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="h-[200px] w-full object-cover sm:h-[300px] lg:h-[400px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white sm:bottom-10 sm:left-10">
                      <h3 className="text-xl font-bold drop-shadow-lg sm:text-3xl lg:text-4xl">
                        {banner.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>

              {mainBanners.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg transition hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5 text-[#222]" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg transition hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5 text-[#222]" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                    {mainBanners.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === currentSlide
                            ? 'w-6 bg-white'
                            : 'w-2 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#ececec] py-16">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-start">
          <div className="min-w-[220px] lg:pt-2">
            <h2 className="text-3xl font-bold leading-[1.12] tracking-[-0.02em] text-[#1a1a1a] sm:text-4xl">
              Sản phẩm
              <br />
              Bán chạy nhất
            </h2>
            <Link
              to="/best-sellers"
              className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#d90f0f] text-white transition hover:bg-[#b00c0c]"
              aria-label="Xem tất cả sản phẩm bán chạy"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M3 10h14" strokeLinecap="round" />
                <path
                  d="M11 5l5 5-5 5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <p className="mt-4 max-w-[210px] text-sm leading-relaxed text-[#5b5b5b]">
              Trải nghiệm sự rõ ràng và chính xác hoàn hảo của kính mắt thời
              trang.
            </p>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[280px] animate-pulse rounded-2xl bg-white p-4 shadow-sm"
                    >
                      <div className="h-4 w-2/3 rounded bg-gray-100" />
                      <div className="mt-8 h-24 w-full rounded bg-gray-50" />
                      <div className="mt-auto h-4 w-1/2 rounded bg-gray-100" />
                    </div>
                  ))
                : bestSellingItems.map((item) => (
                    <article
                      key={item.id || item.name}
                      className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(13,22,39,0.06)] transition hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {item.colors.map((tone) => (
                            <span
                              key={tone}
                              className="h-3 w-3 rounded-full border border-white shadow"
                              style={{ backgroundColor: tone }}
                            />
                          ))}
                        </div>

                        <span className="inline-flex items-center gap-1 text-[11px] text-[#3f3f3f]">
                          {item.rating}
                          <StarIcon className="h-3 w-3 text-[#f3b116]" />
                        </span>
                      </div>

                      <div className="mt-5">
                        <GlassesSketch stroke={item.stroke} />
                      </div>

                      <div className="mt-2 flex items-end justify-between">
                        <div>
                          <p className="text-[11px] text-[#868686]">
                            {item.name}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#222]">
                            {item.price}
                          </p>
                        </div>

                        <span className="rounded-md border border-[#d9d9d9] px-1.5 py-0.5 text-[10px] text-[#646464]">
                          {item.size}
                        </span>
                      </div>
                    </article>
                  ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <h2 className="text-center text-[40px] font-bold tracking-[-0.02em] text-[#222] sm:text-[46px]">
            MUA THEO PHONG CÁCH
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {styleItems.map((item) => (
              <article
                key={item.name}
                className="flex flex-col items-center gap-3 transition hover:scale-105"
              >
                <div className="flex h-[90px] w-[90px] items-center justify-center rounded-full bg-[#f3f3f3]">
                  <GlassesSketch stroke={item.color} className="h-8 w-16" />
                </div>

                <p className="text-sm font-medium text-[#2b2b2b]">
                  {item.name}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOME_PROMO Banner ─── */}
      {promoBanners.length > 0 && (
        <section className="bg-[#f8f8f8]">
          <div className="mx-auto grid max-w-[1240px] gap-4 px-4 py-6 sm:px-6 sm:grid-cols-2 lg:grid-cols-3">
            {promoBanners.map((banner) => (
              <Link
                key={banner.bannerId}
                to="/products"
                className="group relative overflow-hidden rounded-2xl shadow-md transition hover:shadow-xl"
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="h-[180px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-lg font-bold text-white drop-shadow-lg">
                    {banner.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="h-full w-full bg-[#ececec]" />
          <div className="absolute right-0 top-0 h-full w-[38%] bg-[#f3c954]" />
        </div>

        <div className="relative mx-auto grid min-h-[500px] max-w-[1240px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:py-0">
          <div className="max-w-[470px]">
            <p className="text-[14px] uppercase tracking-[0.05em] text-[#2f2f2f] sm:text-[17px]">
              LỰA CHỌN TRÒNG KÍNH
            </p>
            <h2 className="mt-3 text-[44px] font-semibold leading-[1.02] tracking-[-0.02em] text-[#111] sm:text-[52px] lg:text-[62px]">
              Tròng kính phân cực
            </h2>
            <p className="mt-4 max-w-[420px] text-[15px] leading-[1.45] text-[#3f3f3f] sm:text-[16px] lg:text-[19px]">
              Ánh sáng phản chiếu thường làm bạn khó chịu khi che khuất tầm
              nhìn. Tròng kính phân cực giúp bảo vệ đôi mắt của bạn.
            </p>
            <Link
              to="/lenses"
              className="mt-8 inline-flex rounded-full border-2 border-[#111] px-9 py-3 text-[18px] font-medium text-[#111] transition hover:bg-[#111] hover:text-white"
            >
              Khám phá ngay
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-[680px] lg:justify-self-center lg:-translate-x-12">
            <div className="relative z-10 overflow-hidden rounded-[999px] bg-[#d9d9d9]">
              <img
                src={polarizedImg}
                alt="Two people wearing polarized lens glasses"
                className="h-[280px] w-full object-cover sm:h-[320px] lg:h-[340px]"
                style={{ objectPosition: 'center 42%' }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#e7e7e7] py-16">
        {/* fade left */}
        <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-32 bg-gradient-to-r from-[#e7e7e7] to-transparent" />

        {/* fade right */}
        <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-32 bg-gradient-to-l from-[#e7e7e7] to-transparent" />

        <h2 className="mb-10 text-center text-4xl font-semibold tracking-[-0.02em] text-[#1c1c1c] sm:text-5xl">
          Đánh giá từ khách hàng!
        </h2>

        <div className="space-y-6">
          {/* ROW 1 */}
          <div className="reviews-marquee-row">
            <div className="reviews-marquee-track reviews-marquee-left">
              {reviewsTopTrack.map((review, index) => (
                <article
                  key={`top-${review.author}-${index}`}
                  className="reviews-card"
                >
                  <p className="text-sm leading-relaxed text-[#454545]">
                    {review.quote}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: review.avatar }}
                      >
                        {review.author[0]}
                      </span>

                      <div>
                        <p className="text-xs font-semibold uppercase text-[#1f1f1f]">
                          {review.author}
                        </p>
                        <p className="text-[11px] text-[#676767]">
                          {review.note}
                        </p>
                      </div>
                    </div>

                    <p className="inline-flex items-center gap-1 text-xs text-[#323232]">
                      {review.score}
                      <StarIcon className="h-3 w-3 text-[#f3b116]" />
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* ROW 2 */}
          <div className="reviews-marquee-row">
            <div className="reviews-marquee-track reviews-marquee-right">
              {reviewsBottomTrack.map((review, index) => (
                <article
                  key={`bottom-${review.author}-${index}`}
                  className="reviews-card"
                >
                  <p className="text-sm leading-relaxed text-[#454545]">
                    {review.quote}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: review.avatar }}
                      >
                        {review.author[0]}
                      </span>

                      <div>
                        <p className="text-xs font-semibold uppercase text-[#1f1f1f]">
                          {review.author}
                        </p>
                        <p className="text-[11px] text-[#676767]">
                          {review.note}
                        </p>
                      </div>
                    </div>

                    <p className="inline-flex items-center gap-1 text-xs text-[#323232]">
                      {review.score}
                      <StarIcon className="h-3 w-3 text-[#f3b116]" />
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f3f3f3] py-20">
        <div className="mx-auto max-w-[780px] px-4 text-center sm:px-6">
          <div className="mx-auto w-fit text-[#8b8b8b]">
            <svg viewBox="0 0 220 90" className="h-24 w-56" fill="none">
              <path
                d="M18 32c13-9 52-11 76-2 0 0 4 29-33 29S31 38 28 36m174-4c-13-9-52-11-76-2 0 0-4 29 33 29s30-21 33-23m-98-4h42m-108 2c-3 10-8 21-14 26m180-26c3 10 8 21 14 26"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="mt-2 text-4xl font-bold tracking-[-0.02em] text-[#161616] sm:text-5xl">
            Tham gia Câu lạc bộ Độc quyền
          </h2>
          <p className="mt-3 text-sm text-[#5b5b5b] sm:text-base">
            Xem bộ sưu tập mới nhất và ưu đãi độc quyền trước khi mọi người.
          </p>

          <form className="mx-auto mt-7 flex max-w-[540px] flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="email@cuaban.com"
              className="h-11 flex-1 rounded-full border border-[#e0e0e0] bg-white px-5 text-sm outline-none transition focus:border-[#d90f0f]"
            />
            <button
              type="submit"
              className="h-11 rounded-full bg-[#2f141c] px-8 text-sm font-medium text-white transition hover:bg-[#0d1322]"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

