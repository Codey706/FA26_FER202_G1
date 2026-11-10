/**
 * Địa chỉ Việt Nam: danh sách đơn vị hành chính cấp tỉnh + hàm ghép/tách địa chỉ.
 *
 * Việt Nam hiện có 34 đơn vị cấp tỉnh (6 thành phố trực thuộc trung ương + 28 tỉnh)
 * sau đợt sắp xếp năm 2025. Nếu Nhà nước thay đổi lần nữa, chỉ cần sửa hai mảng dưới đây.
 */

export const CITIES = ['Hà Nội', 'Hải Phòng', 'Huế', 'Đà Nẵng', 'Hồ Chí Minh', 'Cần Thơ'];

export const PROVINCE_ONLY = [
  'An Giang',
  'Bắc Ninh',
  'Cao Bằng',
  'Cà Mau',
  'Gia Lai',
  'Hà Tĩnh',
  'Hưng Yên',
  'Khánh Hòa',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Nghệ An',
  'Ninh Bình',
  'Phú Thọ',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sơn La',
  'Thanh Hóa',
  'Thái Nguyên',
  'Tuyên Quang',
  'Tây Ninh',
  'Vĩnh Long',
  'Điện Biên',
  'Đắk Lắk',
  'Đồng Nai',
  'Đồng Tháp'
];

const sortVi = (list) => [...list].sort((a, b) => a.localeCompare(b, 'vi'));

/** Dùng cho <optgroup>: thành phố trước, tỉnh sau, mỗi nhóm sắp theo bảng chữ cái tiếng Việt. */
export const PROVINCE_GROUPS = [
  { label: 'Thành phố trực thuộc trung ương', options: sortVi(CITIES) },
  { label: 'Tỉnh', options: sortVi(PROVINCE_ONLY) }
];

export const PROVINCES = PROVINCE_GROUPS.flatMap((group) => group.options);

export const isValidProvince = (value) => PROVINCES.includes(value);

/** Bỏ dấu, bỏ chữ "tỉnh/thành phố/tp" ở đầu để so khớp "TP. Hồ Chí Minh" với "Hồ Chí Minh". */
const normalize = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/^(tinh|thanh pho|tp)\s+/, '');

const PROVINCE_BY_KEY = new Map(PROVINCES.map((name) => [normalize(name), name]));

// Cách viết tắt/thường gặp khác.
const ALIASES = new Map([
  ['hcm', 'Hồ Chí Minh'],
  ['tphcm', 'Hồ Chí Minh'],
  ['sai gon', 'Hồ Chí Minh'],
  ['thua thien hue', 'Huế']
]);

/** Trả về tên tỉnh/thành chuẩn nếu `text` khớp một đơn vị trong danh sách, ngược lại ''. */
export const findProvince = (text) => {
  const key = normalize(text);
  if (!key) return '';
  return PROVINCE_BY_KEY.get(key) || ALIASES.get(key) || '';
};

/** Ghép thành một chuỗi để lưu vào `shippingAddress` (các trang đơn hàng đang đọc trường này). */
export const composeAddress = (detail, province) =>
  [String(detail ?? '').trim(), String(province ?? '').trim()].filter(Boolean).join(', ');

/**
 * Tách chuỗi địa chỉ cũ (ví dụ trong hồ sơ người dùng) thành { province, detail }.
 * Chỉ tách khi phần cuối (sau dấu phẩy cuối cùng) là một tỉnh/thành hợp lệ;
 * nếu không, giữ nguyên toàn bộ chuỗi làm địa chỉ cụ thể để người dùng tự chọn tỉnh/thành.
 */
export const splitAddress = (address) => {
  const raw = String(address ?? '').trim();
  if (!raw) return { province: '', detail: '' };

  const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);
  const province = findProvince(parts[parts.length - 1]);
  if (!province) return { province: '', detail: raw };

  return { province, detail: parts.slice(0, -1).join(', ') };
};
