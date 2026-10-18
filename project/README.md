# PET SHOP – DỰ ÁN HOMEPAGE & JSON DATABASE

Hệ thống Website kinh doanh thú cưng và phụ kiện thú cưng cao cấp, lấy cảm hứng từ giao diện hiện đại và chuyên nghiệp của matpet.vn. Dự án được xây dựng với **ReactJS (Vite)**, **React Bootstrap 5**, **Fetch API** và **JSON Server**.

---

## 1. Công nghệ sử dụng

- **Frontend Core:** ReactJS 19 / Vite.
- **Ngôn ngữ:** JavaScript (JSX).
- **UI Framework:** React Bootstrap & Bootstrap 5.
- **Routing:** React Router DOM v7.
- **Icon:** React Icons (`fa` - FontAwesome 5).
- **Styling:** CSS3 tùy chỉnh với bảng màu cam (`#FF7A00`), trắng và kem (`#FFF9F2`), hiệu ứng hover, transition, shadow mềm mại.
- **API Communication:** **Fetch API** nguyên bản (Tuyệt đối không sử dụng Axios).
- **Mock Database:** **JSON Server** chạy trên cổng `3001`.
- **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`).

---

## 2. Cấu trúc thư mục dự án

```text
pet-shop/
├── public/
│   ├── images/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx           # Top Bar, Sticky Navbar, Tìm kiếm, Giỏ hàng, Tài khoản
│   │   │   ├── Footer.jsx           # Giới thiệu, Chính sách, Thông tin liên hệ, Mạng xã hội
│   │   │   └── Loading.jsx          # Animation loading hình chân thú cưng
│   │   ├── home/
│   │   │   ├── HeroBanner.jsx       # Carousel banner giới thiệu thú cưng nổi bật
│   │   │   ├── CategorySection.jsx  # Danh mục chó cảnh, mèo cảnh, thức ăn, phụ kiện
│   │   │   ├── FeaturedPets.jsx     # 8 thú cưng nổi bật, lọc chó/mèo, tìm kiếm
│   │   │   ├── WhyChooseUs.jsx      # 4 lợi ích khi mua hàng tại Pet Shop
│   │   │   ├── PopularBreeds.jsx    # Các giống chó mèo phổ biến thế giới
│   │   │   ├── AccessoriesSection.jsx # Danh sách phụ kiện, thức ăn & chuồng nệm
│   │   │   ├── ShoppingProcess.jsx  # Quy trình 4 bước đón thú cưng an toàn
│   │   │   ├── Testimonials.jsx     # Đánh giá thực tế từ khách hàng
│   │   │   └── CTASection.jsx       # Banner kêu gọi hành động & hotline tư vấn
│   │   └── product/
│   │       ├── PetCard.jsx          # Card hiển thị thú cưng (giống, tuổi, tiêm chủng, giá)
│   │       └── ProductCard.jsx      # Card hiển thị phụ kiện & thức ăn (thêm vào giỏ)
│   ├── pages/
│   │   └── HomePage.jsx             # Trang chủ kết hợp toàn bộ 9 sections
│   ├── services/
│   │   ├── api.js                   # Client Fetch API wrapper xử lý query & error
│   │   ├── productService.js        # API service cho thú cưng & phụ kiện
│   │   ├── categoryService.js       # API service cho danh mục
│   │   ├── breedService.js          # API service cho các giống thú cưng
│   │   ├── reviewService.js         # API service cho đánh giá khách hàng
│   │   └── bannerService.js         # API service cho hero banners
│   ├── hooks/
│   │   └── useFetch.js              # Custom hook hỗ trợ fetch dữ liệu
│   ├── utils/
│   │   └── formatters.js            # Định dạng tiền tệ VND, ngày tháng
│   ├── styles/
│   │   └── custom.css               # Hệ thống design tokens, màu sắc, animation
│   ├── App.jsx                      # App root với React Router
│   └── main.jsx                     # Entry point Vite, import Bootstrap 5 & CSS
├── db.json                          # Cơ sở dữ liệu JSON Server
├── .env.example                     # Mẫu biến môi trường
├── .env                             # Cấu hình VITE_API_URL
├── vite.config.js                   # Cấu hình Vite dev server
├── index.html                       # HTML gốc với Google Fonts Be Vietnam Pro & Nunito
├── package.json                     # Quản lý dependencies & scripts
└── README.md                        # Tài liệu hướng dẫn dự án
```

---

## 3. Cơ sở dữ liệu Mock (`db.json`)

File `db.json` được thiết kế chuẩn quan hệ để phục vụ CRUD ở các giai đoạn sau:

| Collection | Số lượng | Mô tả chi tiết |
|------------|----------|----------------|
| `users` | 5 bản ghi | Tài khoản người dùng (Admin, Staff, Customer), trạng thái hoạt động |
| `categories` | 5 bản ghi | Chó cảnh, Mèo cảnh, Thức ăn dinh dưỡng, Phụ kiện, Chuồng nệm |
| `products` | 24 bản ghi | **16 Thú cưng** (8 chó, 8 mèo) + **8 Phụ kiện/Thức ăn** |
| `breeds` | 8 bản ghi | Corgi, Poodle, Golden, Husky, Mèo Aln, Ba Tư, Munchkin, Ragdoll |
| `reviews` | 3 bản ghi | Đánh giá 5 sao từ khách hàng thực tế kèm ảnh và tên thú cưng |
| `banners` | 2 bản ghi | Banner khuyến mãi, chỉ số thống kê uy tín |
| `carts` | 2 bản ghi | Giỏ hàng của khách hàng với danh sách mặt hàng |
| `orders` | 5 bản ghi | Đơn hàng với các trạng thái: pending, processing, shipping, delivered |

---

## 4. API Endpoints (JSON Server - Cổng 3001)

Base URL: `http://localhost:3001` (qua biến môi trường `VITE_API_URL`)

- `GET /products`: Lấy toàn bộ danh sách sản phẩm (hỗ trợ lọc theo `petType`, `isFeatured`, v.v.).
- `GET /products/:id`: Lấy chi tiết một thú cưng hoặc phụ kiện.
- `GET /categories`: Lấy danh sách danh mục sản phẩm.
- `GET /breeds`: Lấy thông tin các giống chó mèo phổ biến.
- `GET /reviews`: Lấy danh sách đánh giá của khách hàng.
- `GET /banners`: Lấy danh sách banner khuyến mãi trang chủ.
- `GET /users`, `GET /carts`, `GET /orders`: Sẵn sàng cho các module tiếp theo.

---

## 5. Hướng dẫn cài đặt và chạy dự án

### Bước 1: Cài đặt dependencies

Mở terminal tại thư mục dự án và chạy:

```bash
npm install
```

### Bước 2: Chạy JSON Server (Cổng 3001)

Mở terminal thứ nhất và khởi động JSON Server:

```bash
npm run server
```

Server sẽ chạy tại địa chỉ: `http://localhost:3001`

### Bước 3: Chạy React Vite (Cổng 3000)

Mở terminal thứ hai và khởi động ứng dụng React:

```bash
npm run dev
```

Mở trình duyệt truy cập: `http://localhost:3000`

---

## 6. Kế hoạch mở rộng CRUD cho nhóm 5 thành viên

Cấu trúc dự án và database đã được thiết kế sẵn sàng để nhóm 5 thành viên chia việc phát triển:

1. **Thành viên 1 - Module User & Auth:** Đăng ký, đăng nhập, phân quyền Role (Admin/Customer), cập nhật hồ sơ cá nhân (`/users`).
2. **Thành viên 2 - Module Quản lý Thú cưng & Sản phẩm:** CRUD sản phẩm, upload ảnh, quản lý tình trạng tiêm chủng, phân loại giống (`/products`, `/breeds`).
3. **Thành viên 3 - Module Quản lý Danh mục & Banner:** CRUD danh mục thú cưng, banner sự kiện (`/categories`, `/banners`).
4. **Thành viên 4 - Module Giỏ hàng & Đặt hàng:** Quản lý giỏ hàng, đặt cọc/mua thú cưng, checkout, tính toán chi phí vận chuyển (`/carts`, `/orders`).
5. **Thành viên 5 - Module Đơn hàng & Đánh giá:** Quản lý vòng đời đơn hàng, xác nhận tiêm chủng giao thú cưng, đánh giá & phản hồi (`/orders`, `/reviews`).
