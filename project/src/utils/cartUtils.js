/**
 * Logic thuần (pure functions) cho giỏ hàng: thêm / sửa / xóa / tính tiền.
 * Không phụ thuộc React nên dễ test.
 *
 * Dạng một item trong giỏ:
 * { id, name, price, image, petType, inStock, quantity }
 */
import { formatCurrency } from './formatters';

export const MAX_QUANTITY_PER_ITEM = 99;

export const isPet = (item) => item?.petType === 'dog' || item?.petType === 'cat';

// Tồn kho hiệu lực: sản phẩm không còn "available" coi như hết hàng.
const effectiveStock = (product) => {
  if (product?.status && product.status !== 'available') return 0;
  const raw = product?.inStock;
  if (raw === undefined || raw === null || raw === '') return null; // không rõ
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null;
};

/** Số lượng tối đa được phép mua: thú cưng = 1, phụ kiện = min(99, tồn kho). */
export const getMaxQuantity = (item) => {
  const cap = isPet(item) ? 1 : MAX_QUANTITY_PER_ITEM;
  const stock = effectiveStock(item);
  return stock === null ? cap : Math.min(cap, stock);
};

const clampQuantity = (item) =>
  Math.max(1, Math.min(item.quantity, getMaxQuantity(item)));

/** Chỉ giữ các trường cần thiết từ product để lưu vào giỏ. */
export const toCartItem = (product, quantity = 1) => ({
  id: product.id,
  name: product.name,
  price: Number(product.price),
  image: product.image || '',
  petType: product.petType || null,
  inStock: effectiveStock(product),
  quantity,
});

const isValidItem = (item) =>
  item &&
  item.id !== undefined &&
  item.id !== null &&
  typeof item.name === 'string' &&
  Number.isFinite(Number(item.price)) &&
  Number(item.price) >= 0;

/** Làm sạch dữ liệu đọc từ localStorage / server: bỏ item hỏng, gộp trùng, ép số lượng hợp lệ. */
export const normalizeCart = (raw) => {
  if (!Array.isArray(raw)) return [];
  const map = new Map();
  for (const entry of raw) {
    if (!isValidItem(entry)) continue;
    const parsed = Math.floor(Number(entry.quantity));
    const qty = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    const key = String(entry.id);
    if (map.has(key)) {
      map.get(key).quantity += qty;
    } else {
      map.set(key, toCartItem(entry, qty));
    }
  }
  return [...map.values()].map((item) => ({ ...item, quantity: clampQuantity(item) }));
};

/** Thêm sản phẩm. Trả về { items, result: { ok, message } }. */
export const addItem = (items, product) => {
  if (!product || product.id === undefined || product.id === null || !isValidItem(product)) {
    return { items, result: { ok: false, message: 'Sản phẩm không hợp lệ.' } };
  }

  const candidate = toCartItem(product, 1);
  const max = getMaxQuantity(candidate);

  if (max < 1) {
    return { items, result: { ok: false, message: `"${product.name}" hiện đã hết hàng.` } };
  }

  const existing = items.find((item) => String(item.id) === String(product.id));

  if (!existing) {
    return {
      items: [...items, candidate],
      result: { ok: true, message: `Đã thêm "${product.name}" vào giỏ hàng!` },
    };
  }

  if (isPet(existing)) {
    return {
      items,
      result: { ok: false, message: `"${product.name}" đã có trong giỏ hàng (mỗi bé chỉ có 1).` },
    };
  }

  const limit = getMaxQuantity({ ...existing, inStock: candidate.inStock });
  if (existing.quantity + 1 > limit) {
    return {
      items,
      result: { ok: false, message: `"${product.name}" chỉ còn tối đa ${limit} sản phẩm.` },
    };
  }

  return {
    items: items.map((item) =>
      String(item.id) === String(product.id)
        ? { ...item, quantity: item.quantity + 1, inStock: candidate.inStock }
        : item
    ),
    result: { ok: true, message: `Đã thêm "${product.name}" vào giỏ hàng!` },
  };
};

/** Đặt số lượng (1..max). Trả về { items, result }. */
export const setItemQuantity = (items, id, quantity) => {
  const target = items.find((item) => String(item.id) === String(id));
  if (!target) return { items, result: { ok: false, message: 'Sản phẩm không có trong giỏ hàng.' } };

  const parsed = Math.floor(Number(quantity));
  if (!Number.isFinite(parsed) || parsed < 1) {
    return { items, result: { ok: false, message: 'Số lượng phải từ 1 trở lên.' } };
  }

  const max = getMaxQuantity(target);
  if (max < 1) {
    return { items, result: { ok: false, message: `"${target.name}" hiện đã hết hàng.` } };
  }

  const next = Math.min(parsed, max);
  const clamped = next !== parsed;

  return {
    items: items.map((item) => (String(item.id) === String(id) ? { ...item, quantity: next } : item)),
    result: {
      ok: !clamped,
      message: clamped ? `"${target.name}" chỉ còn tối đa ${max} sản phẩm.` : '',
    },
  };
};

export const removeItem = (items, id) =>
  items.filter((item) => String(item.id) !== String(id));

export const calcTotal = (items) =>
  items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

export const calcCount = (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0);

/**
 * Đồng bộ giỏ với dữ liệu mới nhất từ server (giá, tồn kho, sản phẩm bị xóa).
 * Trả về { items, changes } - changes là danh sách thông báo cho người dùng.
 */
export const syncItemsWithProducts = (items, products) => {
  const byId = new Map(products.map((p) => [String(p.id), p]));
  const changes = [];
  const next = [];

  for (const item of items) {
    const product = byId.get(String(item.id));

    if (!product) {
      changes.push(`"${item.name}" không còn được bán nên đã bị xóa khỏi giỏ hàng.`);
      continue;
    }

    const fresh = toCartItem(product, item.quantity);

    if (fresh.price !== item.price) {
      changes.push(
        `Giá của "${fresh.name}" đã thay đổi: ${formatCurrency(item.price)} → ${formatCurrency(fresh.price)}.`
      );
    }

    let quantity = item.quantity;
    const max = getMaxQuantity(fresh);
    if (max >= 1 && quantity > max) {
      quantity = max;
      changes.push(`"${fresh.name}" chỉ còn ${max} sản phẩm, số lượng đã được điều chỉnh.`);
    }

    next.push({ ...fresh, quantity });
  }

  return { items: next, changes };
};

/** Chuyển giỏ sang định dạng của collection `carts` trong db.json. */
export const buildServerCart = (items, id) => ({
  ...(id ? { id } : {}),
  userId: null,
  items: items.map((item) => ({
    productId: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
    petType: item.petType,
    inStock: item.inStock,
  })),
  totalPrice: calcTotal(items),
  updatedAt: new Date().toISOString(),
});

export const fromServerCart = (cart) =>
  normalizeCart(
    (cart?.items || []).map((item) => ({ ...item, id: item.productId ?? item.id }))
  );
