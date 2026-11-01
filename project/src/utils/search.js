/**
 * Tiện ích tìm kiếm dùng chung cho hộp tìm kiếm (SearchOverlay)
 * và trang kết quả (SearchPage).
 */

// Bỏ dấu tiếng Việt + chữ thường để "meo anh long ngan" vẫn khớp "Mèo Anh Lông Ngắn".
export const normalize = (text = '') =>
  String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Gợi ý "Mọi người hay tìm".
 * `aliases`: các từ khóa tương đương, dùng cho gợi ý không có tên sản phẩm
 * tương ứng trực tiếp (ví dụ "Spa & grooming" -> sữa tắm, lược chải...).
 */
export const POPULAR_SEARCHES = [
  { label: 'Poodle' },
  { label: 'Golden Retriever' },
  { label: 'Corgi' },
  { label: 'Mèo Anh lông ngắn' },
  {
    label: 'Spa & grooming',
    aliases: ['sữa tắm', 'lược chải', 'chải lông', 'găng tay tắm']
  }
];

// Trả về danh sách các cụm cần thử cho một từ khóa (chính nó + alias nếu có).
export const expandQuery = (query) => {
  const key = normalize(query);
  const preset = POPULAR_SEARCHES.find((s) => normalize(s.label) === key);
  return [query, ...(preset?.aliases || [])];
};

// Gộp các trường văn bản của sản phẩm thành danh sách "từ" đã chuẩn hóa.
const buildFields = (product) => {
  const name = normalize(product.name);
  const meta = normalize(
    [
      product.breedName,
      product.color,
      product.origin,
      product.brand,
      product.typeLabel,
      ...(product.tags || [])
    ]
      .filter(Boolean)
      .join(' ')
  );
  const desc = normalize(product.description);
  return { name, meta, desc };
};

// Mọi từ trong cụm tìm kiếm phải xuất hiện (khớp đầu từ) trong văn bản.
const matchesAllTokens = (text, tokens) => {
  const words = text.split(' ');
  return tokens.every((t) => words.some((w) => w.startsWith(t)));
};

/**
 * Điểm khớp của một sản phẩm với từ khóa (0 = không khớp).
 * Khớp tên > khớp giống/màu/tag > khớp mô tả.
 */
export const scoreProduct = (product, query) => {
  let best = 0;

  expandQuery(query).forEach((phrase, index) => {
    const tokens = normalize(phrase).split(' ').filter(Boolean);
    if (tokens.length === 0) return;

    const { name, meta, desc } = buildFields(product);
    const joined = tokens.join(' ');

    let score = 0;
    if (name.includes(joined)) score = 100;
    else if (matchesAllTokens(name, tokens)) score = 80;
    else if (matchesAllTokens(`${name} ${meta}`, tokens)) score = 60;
    // Alias (index > 0) không dò trong mô tả để tránh khớp nhầm thú cưng "cần chải lông".
    else if (index === 0 && matchesAllTokens(desc, tokens)) score = 30;

    best = Math.max(best, score);
  });

  return best;
};

// Lọc + sắp xếp sản phẩm theo độ liên quan.
export const searchProducts = (products = [], query = '') => {
  if (!normalize(query)) return [];

  return products
    .map((product) => ({ product, score: scoreProduct(product, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);
};
