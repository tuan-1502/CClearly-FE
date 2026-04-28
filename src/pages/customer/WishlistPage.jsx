// Wishlist Page
import { Lock, Heart, Glasses, Scan } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { wishlist, products } from '@/mocks/data';

const WishlistPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const wishlistProducts = wishlist
    .map((w) => products.find((p) => p.id === w.productId))
    .filter(Boolean);

  if (!isAuthenticated) {
    return (
      <div className="bg-[#ececec] min-h-screen py-10">
        <div className="max-w-[1180px] mx-auto px-4 text-center py-20">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-12 h-12 text-gray-500" />
          </div>
          <h2 className="text-3xl font-bold text-[#222] mb-4">
            Vui lòng đăng nhập
          </h2>
          <p className="text-[#4f5562] mb-8">
            Đăng nhập để xem danh sách yêu thích
          </p>
          <button
            onClick={() => navigate('/login', { state: { from: location.pathname } })}
            className="bg-[#361414] text-white px-10 py-4 rounded-full font-medium hover:bg-[#0d1322]"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#ececec] min-h-screen py-10">
      <div className="max-w-[1180px] mx-auto px-4">
        <h1 className="text-4xl font-bold text-[#222] mb-8">
          Sản phẩm yêu thích
        </h1>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-[0_10px_30px_rgba(13,22,39,0.06)]">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#222] mb-4">
              Chưa có sản phẩm yêu thích
            </h2>
            <p className="text-[#4f5562] mb-8">
              Hãy thêm sản phẩm vào danh sách yêu thích
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <Link
                key={product?.id}
                to={`/products/${product?.id}`}
                className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(13,22,39,0.06)] overflow-hidden group"
              >
                <div className="aspect-square bg-[#f3f3f3] flex items-center justify-center group-hover:scale-105 transition-transform">
                  {product?.type === 'frame' ? (
                    <Glasses className="w-20 h-20 text-gray-400" />
                  ) : (
                    <Scan className="w-20 h-20 text-gray-400" />
                  )}
                </div>
                <div className="p-5">
                  <span className="text-xs text-[#d90f0f] bg-[#ececec] px-3 py-1 rounded-full">
                    {product?.type === 'frame' ? 'Gọng kính' : 'Tròng kính'}
                  </span>
                  <h3 className="font-semibold text-[#222] mt-2">
                    {product?.name}
                  </h3>
                  <p className="text-[#d90f0f] font-bold mt-1">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(product?.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;

