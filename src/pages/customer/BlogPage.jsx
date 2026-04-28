// Blog Page - Góc CClearly
import { Calendar, User, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogPage = () => {
  const posts = [
    {
      id: 1,
      title: 'Xu hướng kính mắt 2024: Tối giản lên ngôi',
      excerpt:
        'Năm nay, các thiết kế thanh mảnh với chất liệu titan và nhựa trong suốt đang trở thành tâm điểm của giới mộ điệu...',
      image:
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
      category: 'Xu hướng',
      date: '04 Tháng 3, 2024',
      author: 'Admin',
    },
    {
      id: 2,
      title: 'Cách chọn gọng kính phù hợp với khuôn mặt',
      excerpt:
        'Mỗi khuôn mặt có những đặc điểm riêng, việc chọn đúng gọng kính không chỉ giúp bạn nhìn rõ mà còn tôn lên vẻ đẹp...',
      image:
        'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800',
      category: 'Hướng dẫn',
      date: '01 Tháng 3, 2024',
      author: 'Stylist',
    },
    {
      id: 3,
      title: 'Bảo vệ mắt trong kỷ nguyên số',
      excerpt:
        'Ánh sáng xanh từ màn hình thiết bị điện tử đang âm thầm gây hại cho mắt. Hãy cùng CClearly tìm giải pháp tối ưu...',
      image:
        'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800',
      category: 'Sức khỏe',
      date: '25 Tháng 2, 2024',
      author: 'Bác sĩ quang học',
    },
  ];

  const featuredPost = posts[0];
  const recentPosts = posts.slice(1);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="py-20 border-b border-[#efefef]">
        <div className="max-w-[1180px] mx-auto px-4 text-center">
          <h2 className="text-xs font-bold text-[#d90f0f] uppercase tracking-widest mb-4">
            Journal & Stories
          </h2>
          <h1 className="text-5xl md:text-7xl font-bold text-[#222] mb-8 uppercase tracking-tight">
            Góc CClearly
          </h1>
          <p className="text-[#666] max-w-xl mx-auto text-lg">
            Nơi chia sẻ cảm hứng về phong cách, kiến thức quang học và những câu
            chuyện đằng sau mỗi thiết kế.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="max-w-[1180px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="aspect-[4/3] bg-[#f3f3f3] rounded-2xl overflow-hidden">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-[#d90f0f] text-white text-xs font-bold uppercase rounded-full">
                  {featuredPost.category}
                </span>
                <span className="flex items-center gap-1 text-[#666] text-sm">
                  <Calendar className="w-4 h-4" />
                  {featuredPost.date}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-[#222] mb-4">
                {featuredPost.title}
              </h2>
              <p className="text-[#666] mb-6 text-lg">{featuredPost.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#666]">
                  <User className="w-4 h-4" />
                  {featuredPost.author}
                </span>
                <Link
                  to="/blog/1"
                  className="flex items-center gap-2 text-[#d90f0f] font-bold hover:underline"
                >
                  Đọc tiếp <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="py-16 bg-[#f9f9f9]">
        <div className="max-w-[1180px] mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#222]">
              Bài viết mới nhất
            </h2>
            <Link
              to="/blog"
              className="flex items-center gap-2 text-[#d90f0f] font-medium hover:underline"
            >
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(13,22,39,0.06)] overflow-hidden group"
              >
                {/* Image */}
                <div className="aspect-[16/10] bg-[#f3f3f3] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 bg-[#f3f3f3] text-[#666] text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                    <span className="text-[#999] text-xs">{post.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#222] mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-[#666] text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <Link
                    to={`/blog/${post.id}`}
                    className="flex items-center gap-2 text-[#d90f0f] font-medium group-hover:underline"
                  >
                    Đọc tiếp <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-[#d90f0f] text-white">
        <div className="max-w-[1180px] mx-auto px-4 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Đăng ký nhận tin tức mới nhất
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Nhận thông tin về xu hướng kính mắt mới nhất và ưu đãi đặc biệt từ
            CClearly.
          </p>
          <form className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className="flex-1 px-5 py-3 rounded-lg text-[#222] focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#222] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#111] transition"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;

