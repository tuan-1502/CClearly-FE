import { http, HttpResponse, delay } from 'msw';
import {
  users,
  products,
  orders,
  cart,
  categories,
  findUserByEmail,
  findUserById,
  findProductById,
  findOrderById,
  generateTokenForUser,
  dashboardStats,
  staff,
  stores,
  returns,
  revenueByDay,
  customers,
  coupons,
} from './data';

const BASE_URL = '/api';

export const handlers = [
  // ========== AUTH ==========
  // Login
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    await delay(500);
    const body = await request.json();
    const { email, password } = body;

    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
      return HttpResponse.json(
        { success: false, message: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    const accessToken = generateTokenForUser(user);
    const refreshToken = `refresh_${user.id}_${Date.now()}`;

    return HttpResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  }),

  // Register
  http.post(`${BASE_URL}/auth/register`, async ({ request }) => {
    await delay(500);
    const body = await request.json();
    const { email, password, name, phone } = body;

    if (findUserByEmail(email)) {
      return HttpResponse.json(
        { success: false, message: 'Email đã được sử dụng' },
        { status: 400 }
      );
    }

    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password,
      name,
      phone: phone || '',
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    const accessToken = generateTokenForUser(newUser);
    const refreshToken = `refresh_${newUser.id}_${Date.now()}`;

    return HttpResponse.json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
    });
  }),

  // Logout
  http.post(`${BASE_URL}/auth/logout`, async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      message: 'Đăng xuất thành công',
    });
  }),

  // Refresh Token
  http.post(`${BASE_URL}/auth/refresh-token`, async ({ request }) => {
    await delay(200);
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return HttpResponse.json(
        { success: false, message: 'Refresh token không hợp lệ' },
        { status: 401 }
      );
    }

    // Extract user ID from refresh token
    const userId = refreshToken.split('_')[1];
    const user = findUserById(userId);

    if (!user) {
      return HttpResponse.json(
        { success: false, message: 'User không tồn tại' },
        { status: 401 }
      );
    }

    const newAccessToken = generateTokenForUser(user);
    const newRefreshToken = `refresh_${user.id}_${Date.now()}`;

    return HttpResponse.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  }),

  // Forgot Password
  http.post(`${BASE_URL}/auth/forgot-password`, async ({ request }) => {
    await delay(500);
    const body = await request.json();
    const { email } = body;

    const user = findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return HttpResponse.json({
        success: true,
        message: 'Nếu email tồn tại, chúng tôi đã gửi link khôi phục mật khẩu',
      });
    }

    return HttpResponse.json({
      success: true,
      message: 'Nếu email tồn tại, chúng tôi đã gửi link khôi phục mật khẩu',
    });
  }),

  // Reset Password
  http.post(`${BASE_URL}/auth/reset-password`, async ({ request }) => {
    await delay(500);
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return HttpResponse.json(
        { success: false, message: 'Token hoặc mật khẩu không hợp lệ' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công',
    });
  }),

  // Verify Email
  http.post(`${BASE_URL}/auth/verify-email`, async ({ request }) => {
    await delay(500);
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return HttpResponse.json(
        { success: false, message: 'Token không hợp lệ' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Xác thực email thành công',
    });
  }),

  // Resend Verification
  http.post(`${BASE_URL}/auth/resend-verification`, async ({ request }) => {
    await delay(500);
    const body = await request.json();
    const { email } = body;

    return HttpResponse.json({
      success: true,
      message: 'Email xác thực đã được gửi lại',
    });
  }),

  // Login with Google
  http.post(`${BASE_URL}/auth/google`, async ({ request }) => {
    await delay(500);
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return HttpResponse.json(
        { success: false, message: 'Google ID token không hợp lệ' },
        { status: 400 }
      );
    }

    // Mock Google login - create or get user
    const mockGoogleUser = {
      id: 'google_123',
      email: 'google.user@gmail.com',
      name: 'Google User',
      role: 'customer',
      phone: '',
      createdAt: new Date().toISOString(),
    };

    const accessToken = generateTokenForUser(mockGoogleUser);
    const refreshToken = `refresh_${mockGoogleUser.id}_${Date.now()}`;

    return HttpResponse.json({
      success: true,
      message: 'Đăng nhập Google thành công',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: mockGoogleUser.id,
          email: mockGoogleUser.email,
          name: mockGoogleUser.name,
          role: mockGoogleUser.role,
        },
      },
    });
  }),

  // Get Profile
  http.get(`${BASE_URL}/auth/me`, async ({ request }) => {
    await delay(300);
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: 'Chưa đăng nhập' },
        { status: 401 }
      );
    }

    // Mock profile - in real app, decode JWT and get user
    const mockUser = {
      id: '5',
      email: 'customer@gmail.com',
      name: 'Customer User',
      role: 'customer',
      phone: '0912345682',
      avatar: null,
    };

    return HttpResponse.json({
      success: true,
      data: mockUser,
    });
  }),

  // ========== PRODUCTS ==========
  // Get Products
  http.get(`${BASE_URL}/products`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const type = url.searchParams.get('type');
    const categoryId = url.searchParams.get('categoryId');
    const search = url.searchParams.get('search');

    let filteredProducts = [...products];

    if (type) {
      filteredProducts = filteredProducts.filter((p) => p.type === type);
    }

    if (categoryId) {
      filteredProducts = filteredProducts.filter(
        (p) => p.categoryId === categoryId
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const total = filteredProducts.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = filteredProducts.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        items,
        meta: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  }),

  // Get Product Detail
  http.get(`${BASE_URL}/products/:id`, async ({ params }) => {
    await delay(300);
    const product = findProductById(params.id);

    if (!product) {
      return HttpResponse.json(
        { success: false, message: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: product,
    });
  }),

  // Get Categories
  http.get(`${BASE_URL}/categories`, async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: categories,
    });
  }),

  // Get Frames
  http.get(`${BASE_URL}/products/frames`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let filteredProducts = products.filter((p) => p.type === 'frame');

    const total = filteredProducts.length;
    const start = (page - 1) * limit;
    const items = filteredProducts.slice(start, start + limit);

    return HttpResponse.json({
      success: true,
      data: {
        items,
        meta: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  }),

  // Get Lenses
  http.get(`${BASE_URL}/products/lenses`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let filteredProducts = products.filter((p) => p.type === 'lens');

    const total = filteredProducts.length;
    const start = (page - 1) * limit;
    const items = filteredProducts.slice(start, start + limit);

    return HttpResponse.json({
      success: true,
      data: {
        items,
        meta: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  }),

  // ========== ORDERS ==========
  // Get Orders
  http.get(`${BASE_URL}/orders`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');

    let filteredOrders = [...orders];

    if (status) {
      filteredOrders = filteredOrders.filter((o) => o.status === status);
    }

    if (type) {
      filteredOrders = filteredOrders.filter((o) => o.type === type);
    }

    const total = filteredOrders.length;
    const start = (page - 1) * limit;
    const items = filteredOrders.slice(start, start + limit);

    return HttpResponse.json({
      success: true,
      data: {
        items,
        meta: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  }),

  // Get Order Detail
  http.get(`${BASE_URL}/orders/:id`, async ({ params }) => {
    await delay(300);
    const order = findOrderById(params.id);

    if (!order) {
      return HttpResponse.json(
        { success: false, message: 'Đơn hàng không tồn tại' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: order,
    });
  }),

  // Create Order
  http.post(`${BASE_URL}/orders`, async ({ request }) => {
    await delay(500);
    const body = await request.json();

    const newOrder = {
      id: `ORD${Date.now()}`,
      userId: body.userId || '5',
      type: body.type || 'regular',
      status: 'pending',
      items: body.items || [],
      totalAmount: body.totalAmount || 0,
      shippingAddress: body.shippingAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);

    return HttpResponse.json({
      success: true,
      message: 'Tạo đơn hàng thành công',
      data: newOrder,
    });
  }),

  // Update Order Status
  http.patch(`${BASE_URL}/orders/:id/status`, async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const { status } = body;

    const order = findOrderById(params.id);
    if (!order) {
      return HttpResponse.json(
        { success: false, message: 'Đơn hàng không tồn tại' },
        { status: 404 }
      );
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    return HttpResponse.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: order,
    });
  }),

  // Cancel Order
  http.post(`${BASE_URL}/orders/:id/cancel`, async ({ params }) => {
    await delay(300);
    const order = findOrderById(params.id);

    if (!order) {
      return HttpResponse.json(
        { success: false, message: 'Đơn hàng không tồn tại' },
        { status: 404 }
      );
    }

    order.status = 'cancelled';
    order.updatedAt = new Date().toISOString();

    return HttpResponse.json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      data: order,
    });
  }),

  // ========== CART ==========
  // Get Cart
  http.get(`${BASE_URL}/cart`, async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: cart,
    });
  }),

  // Add to Cart
  http.post(`${BASE_URL}/cart/items`, async ({ request }) => {
    await delay(300);
    const body = await request.json();
    const { productId, quantity = 1, options = {} } = body;

    const product = findProductById(productId);
    if (!product) {
      return HttpResponse.json(
        { success: false, message: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    // Check if item already in cart
    const existingItem = cart.items.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        id: `cart_${Date.now()}`,
        productId,
        name: product.name,
        price: product.basePrice || product.price,
        image: product.images[0],
        quantity,
        options,
      });
    }

    return HttpResponse.json({
      success: true,
      message: 'Thêm vào giỏ hàng thành công',
      data: cart,
    });
  }),

  // Update Cart Item
  http.patch(`${BASE_URL}/cart/items/:itemId`, async ({ params, request }) => {
    await delay(200);
    const body = await request.json();
    const { quantity } = body;

    const item = cart.items.find((item) => item.id === params.itemId);
    if (!item) {
      return HttpResponse.json(
        { success: false, message: 'Sản phẩm không có trong giỏ' },
        { status: 404 }
      );
    }

    item.quantity = quantity;

    return HttpResponse.json({
      success: true,
      message: 'Cập nhật giỏ hàng thành công',
      data: cart,
    });
  }),

  // Remove Cart Item
  http.delete(`${BASE_URL}/cart/items/:itemId`, async ({ params }) => {
    await delay(200);
    const index = cart.items.findIndex((item) => item.id === params.itemId);

    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Sản phẩm không có trong giỏ' },
        { status: 404 }
      );
    }

    cart.items.splice(index, 1);

    return HttpResponse.json({
      success: true,
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
      data: cart,
    });
  }),

  // Clear Cart
  http.delete(`${BASE_URL}/cart/clear`, async () => {
    await delay(200);
    cart.items = [];

    return HttpResponse.json({
      success: true,
      message: 'Xóa giỏ hàng thành công',
      data: cart,
    });
  }),

  // ========== USER ==========
  // Get Users (Admin)
  http.get(`${BASE_URL}/admin/users`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const size = parseInt(url.searchParams.get('size')) || 10;
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role') || '';

    // Filter by role (exclude CUSTOMER by default if on staff management)
    let filteredUsers = users.filter((u) => {
      const uRole = u.role?.toUpperCase() || '';
      if (role) {
        return uRole === role.toUpperCase();
      }
      // If no specific role is requested, return all non-customers
      return uRole !== 'CUSTOMER';
    });

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.includes(q)
      );
    }

    const total = filteredUsers.length;
    const start = (page - 1) * size;
    const end = start + size;
    const paginated = filteredUsers.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        content: paginated,
        totalElements: total,
        totalPages: Math.ceil(total / size),
        size,
        number: page,
      },
    });
  }),

  // Get User Profile
  http.get(`${BASE_URL}/users/profile`, async () => {
    await delay(300);
    const user = findUserById('5');

    return HttpResponse.json({
      success: true,
      data: user,
    });
  }),

  // Update User Profile
  http.patch(`${BASE_URL}/users/profile`, async ({ request }) => {
    await delay(300);
    const body = await request.json();

    const user = findUserById('5');
    if (user) {
      Object.assign(user, body);
    }

    return HttpResponse.json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: user,
    });
  }),

  // Get User Orders
  http.get(`${BASE_URL}/users/orders`, async () => {
    await delay(300);
    const userOrders = orders.filter((o) => o.userId === '5');

    return HttpResponse.json({
      success: true,
      data: userOrders,
    });
  }),

  // ========== DASHBOARD STATS ==========
  // Get Dashboard Stats
  http.get(`${BASE_URL}/dashboard/stats`, async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: dashboardStats,
    });
  }),

  // Get Revenue by Day
  http.get(`${BASE_URL}/dashboard/revenue`, async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: revenueByDay,
    });
  }),

  // ========== STAFF ==========
  // Get All Staff
  http.get(`${BASE_URL}/staff`, async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: staff,
    });
  }),

  // Get Staff by Role
  http.get(`${BASE_URL}/staff/role/:role`, async ({ params }) => {
    await delay(200);
    const filtered = staff.filter((s) => s.role === params.role);
    return HttpResponse.json({
      success: true,
      data: filtered,
    });
  }),

  // ========== STORES ==========
  // Get All Stores
  http.get(`${BASE_URL}/stores`, async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: stores,
    });
  }),

  // ========== RETURNS ==========
  // Get All Returns
  http.get(`${BASE_URL}/returns`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let filtered = [...returns];
    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }

    return HttpResponse.json({
      success: true,
      data: filtered,
    });
  }),

  // Update Return Status
  http.patch(`${BASE_URL}/returns/:id/status`, async ({ params, request }) => {
    await delay(300);
    const body = await request.json();
    const { status } = body;

    const returnItem = returns.find((r) => r.id === params.id);
    if (!returnItem) {
      return HttpResponse.json(
        { success: false, message: 'Không tìm thấy yêu cầu đổi trả' },
        { status: 404 }
      );
    }

    returnItem.status = status;
    returnItem.processedDate = new Date().toISOString();

    return HttpResponse.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: returnItem,
    });
  }),

  // ========== CUSTOMERS ==========
  // Get All Customers
  http.get(`${BASE_URL}/customers`, async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: customers,
    });
  }),

  // ========== PROMOTIONS ==========
  // Get All Promotions
  http.get(`${BASE_URL}/promotions`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const size = parseInt(url.searchParams.get('size')) || 10;
    const search = url.searchParams.get('search') || '';

    let filtered = [...coupons];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.code?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const start = (page - 1) * size;
    const end = start + size;
    const paginated = filtered.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        content: paginated,
        totalElements: total,
        totalPages: Math.ceil(total / size),
        size,
        number: page,
      },
    });
  }),

  // Get Active Coupons
  http.get(`${BASE_URL}/coupons/active`, async () => {
    await delay(200);
    const active = coupons.filter(
      (c) => c.isActive && new Date(c.validTo) > new Date()
    );
    return HttpResponse.json({
      success: true,
      data: active,
    });
  }),
];
