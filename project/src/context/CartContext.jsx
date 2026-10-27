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
import {
  addItem,
  buildServerCart,
  calcCount,
  calcTotal,
  fromServerCart,
  normalizeCart,
  removeItem,
  setItemQuantity,
  syncItemsWithProducts,
} from '../utils/cartUtils';

const CART_STORAGE_KEY = 'pet-shop-cart';
const SERVER_CART_ID_KEY = 'pet-shop-server-cart-id';

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
 */
async function pushCartToServer(items) {
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
      await cartService.updateCart(id, buildServerCart(items, id));
      return;
    } catch (err) {
      if (err.status !== 404) return;
    }
  }

  const newId = `cart-guest-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const created = await cartService.createCart(buildServerCart(items, newId));
  writeStorage(SERVER_CART_ID_KEY, String(created?.id ?? newId));
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const itemsRef = useRef(items); // luôn là giá trị mới nhất, dùng để trả kết quả đồng bộ
  const syncChainRef = useRef(Promise.resolve());

  const commit = useCallback((next) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  // Lưu localStorage ngay; đẩy lên server sau 500ms (gộp nhiều thao tác liên tiếp).
  useEffect(() => {
    writeStorage(CART_STORAGE_KEY, JSON.stringify(items));

    const timer = setTimeout(() => {
      syncChainRef.current = syncChainRef.current
        .then(() => pushCartToServer(items))
        .catch(() => {});
    }, 500);

    return () => clearTimeout(timer);
  }, [items]);

  // READ: nếu localStorage trống nhưng còn giỏ trên server thì khôi phục.
  useEffect(() => {
    const id = readStorage(SERVER_CART_ID_KEY);
    if (!id || itemsRef.current.length > 0) return;

    cartService
      .getCart(id)
      .then((cart) => {
        if (itemsRef.current.length > 0) return;
        const restored = fromServerCart(cart);
        if (restored.length > 0) commit(restored);
      })
      .catch(() => {});
  }, [commit]);

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
      cartCount: calcCount(items),
      totalAmount: calcTotal(items),
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshFromServer,
    }),
    [items, addToCart, updateQuantity, removeFromCart, clearCart, refreshFromServer]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải được dùng bên trong <CartProvider>.');
  return ctx;
}
