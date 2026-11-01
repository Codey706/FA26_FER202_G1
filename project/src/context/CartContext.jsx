import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import cartService from '../services/cartService';
import productService from '../services/productService';
import { useAuth } from './AuthContext';
import {
  addItem,
  buildServerCart,
  calcCount,
  calcOrderSummary,
  calcTotal,
  fromServerCart,
  mergeCarts,
  normalizeCart,
  removeItem,
  setItemQuantity,
  syncItemsWithProducts,
} from '../utils/cartUtils';

const CART_STORAGE_KEY = 'pet-shop-cart';
const SERVER_CART_ID_KEY = 'pet-shop-server-cart-id';
// Giỏ trong localStorage đang thuộc về ai: 'guest' hoặc id của user.
const CART_OWNER_KEY = 'pet-shop-cart-owner';
const GUEST = 'guest';

const readStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* bỏ qua (private mode, đầy bộ nhớ...) */
  }
};
const removeStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* bỏ qua */
  }
};

const loadCart = () => {
  try {
    return normalizeCart(JSON.parse(readStorage(CART_STORAGE_KEY) || '[]'));
  } catch {
    return [];
  }
};

/**
 * Đẩy giỏ hàng lên JSON Server (best-effort, không làm hỏng UI nếu server tắt):
 *  - giỏ rỗng  -> DELETE /carts/:id
 *  - đã có id  -> PUT    /carts/:id (404 thì tạo lại)
 *  - chưa có   -> POST   /carts
 * Giỏ của người dùng đã đăng nhập mang `userId`, giỏ của khách có `userId = null`.
 */
async function pushCartToServer(items, userId) {
  const id = readStorage(SERVER_CART_ID_KEY);

  if (items.length === 0) {
    if (!id) return;
    try {
      await cartService.deleteCart(id);
    } catch (err) {
      if (err.status !== 404) return; // lỗi mạng: giữ id, lần sau thử lại
    }
    removeStorage(SERVER_CART_ID_KEY);
    return;
  }

  if (id) {
    try {
      await cartService.updateCart(id, buildServerCart(items, id, userId));
      return;
    } catch (err) {
      if (err.status !== 404) return;
    }
  }

  const prefix = userId ? `cart-${userId}` : 'cart-guest';
  const newId = `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const created = await cartService.createCart(buildServerCart(items, newId, userId));
  writeStorage(SERVER_CART_ID_KEY, String(created?.id ?? newId));
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [items, setItems] = useState(loadCart);
  const [syncing, setSyncing] = useState(false); // đang nạp giỏ của user từ server
  const itemsRef = useRef(items); // luôn là giá trị mới nhất, dùng để trả kết quả đồng bộ
  const userIdRef = useRef(userId);
  const hydratingRef = useRef(0);
  const syncChainRef = useRef(Promise.resolve());

  userIdRef.current = userId;

  const commit = useCallback((next) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  // Lưu localStorage ngay; đẩy lên server sau 500ms (gộp nhiều thao tác liên tiếp).
  useEffect(() => {
    writeStorage(CART_STORAGE_KEY, JSON.stringify(items));

    const timer = setTimeout(() => {
      // Đang nạp giỏ của user: tạm không đẩy để khỏi ghi đè giỏ trên server.
      if (hydratingRef.current > 0) return;
      syncChainRef.current = syncChainRef.current
        .then(() => pushCartToServer(items, userIdRef.current))
        .catch(() => { });
    }, 500);

    return () => clearTimeout(timer);
  }, [items]);

  // READ (khách): nếu localStorage trống nhưng còn giỏ trên server thì khôi phục.
  useEffect(() => {
    if (userId) return;
    const id = readStorage(SERVER_CART_ID_KEY);
    if (!id || itemsRef.current.length > 0) return;

    cartService
      .getCart(id)
      .then((cart) => {
        if (itemsRef.current.length > 0) return;
        const restored = fromServerCart(cart);
        if (restored.length > 0) commit(restored);
      })
      .catch(() => { });
  }, [userId, commit]);

  // READ (đã đăng nhập) / đăng xuất: gắn giỏ với tài khoản.
  useEffect(() => {
    let cancelled = false;
    const owner = readStorage(CART_OWNER_KEY) || GUEST;

    // Đăng xuất: dọn giỏ trên máy (giỏ vẫn còn trên server cho lần đăng nhập sau).
    if (!userId) {
      if (owner !== GUEST) {
        removeStorage(SERVER_CART_ID_KEY);
        writeStorage(CART_OWNER_KEY, GUEST);
        commit([]);
      }
      return undefined;
    }

    const hydrate = async () => {
      hydratingRef.current += 1;
      setSyncing(true);
      try {
        const sameOwner = owner === String(userId); // tải lại trang khi đã đăng nhập
        const guestCartId = owner === GUEST ? readStorage(SERVER_CART_ID_KEY) : null;
        const localItems = owner === GUEST || sameOwner ? itemsRef.current : [];

        const carts = await cartService.getCarts({ userId });
        if (cancelled) return;

        const own = Array.isArray(carts) && carts.length > 0 ? carts[0] : null;
        const serverItems = own ? fromServerCart(own) : [];

        // Cùng chủ: bản trên máy là mới nhất. Vừa đăng nhập: gộp giỏ khách vào giỏ của tài khoản.
        const next = sameOwner
          ? (localItems.length > 0 ? localItems : serverItems)
          : mergeCarts(serverItems, localItems);

        if (own) writeStorage(SERVER_CART_ID_KEY, String(own.id));
        else if (!sameOwner) removeStorage(SERVER_CART_ID_KEY);

        // Giỏ khách đã được gộp xong -> xóa bản ghi tạm trên server.
        if (guestCartId && String(guestCartId) !== String(own?.id)) {
          cartService.deleteCart(guestCartId).catch(() => { });
        }

        writeStorage(CART_OWNER_KEY, String(userId));
        commit(next);
      } catch {
        // Server không phản hồi: giữ giỏ hiện có, vẫn ghi nhận chủ sở hữu.
        if (!cancelled) writeStorage(CART_OWNER_KEY, String(userId));
      } finally {
        hydratingRef.current -= 1;
        if (hydratingRef.current === 0) setSyncing(false);
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [userId, commit]);

  // Đồng bộ giữa các tab trình duyệt.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== CART_STORAGE_KEY) return;
      try {
        commit(normalizeCart(JSON.parse(event.newValue || '[]')));
      } catch {
        /* bỏ qua dữ liệu hỏng */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [commit]);

  // CREATE
  const addToCart = useCallback(
    (product) => {
      const { items: next, result } = addItem(itemsRef.current, product);
      if (result.ok) commit(next);
      return result;
    },
    [commit]
  );

  // UPDATE
  const updateQuantity = useCallback(
    (id, quantity) => {
      const { items: next, result } = setItemQuantity(itemsRef.current, id, quantity);
      commit(next);
      return result;
    },
    [commit]
  );

  // DELETE (một sản phẩm)
  const removeFromCart = useCallback(
    (id) => commit(removeItem(itemsRef.current, id)),
    [commit]
  );

  // DELETE (toàn bộ giỏ)
  const clearCart = useCallback(() => commit([]), [commit]);

  // Làm mới giá / tồn kho từ server. Trả về { items, changes }.
  const refreshFromServer = useCallback(async () => {
    if (itemsRef.current.length === 0) return { items: [], changes: [] };

    const products = await productService.getProducts();
    const { items: next, changes } = syncItemsWithProducts(itemsRef.current, products);

    if (JSON.stringify(next) !== JSON.stringify(itemsRef.current)) {
      commit(next);
    }
    return { items: next, changes };
  }, [commit]);

  const value = useMemo(
    () => ({
      items,
      syncing,
      cartCount: calcCount(items),
      totalAmount: calcTotal(items),
      summary: calcOrderSummary(items),
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshFromServer,
    }),
    [items, syncing, addToCart, updateQuantity, removeFromCart, clearCart, refreshFromServer]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải được dùng bên trong <CartProvider>.');
  return ctx;
}
