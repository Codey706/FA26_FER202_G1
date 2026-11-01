import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addItem,
  setItemQuantity,
  removeItem,
  calcTotal,
  calcCount,
  calcShippingFee,
  calcDeposit,
  calcOrderSummary,
  mergeCarts,
  buildServerCart,
  fromServerCart,
  syncItemsWithProducts,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
} from '../src/utils/cartUtils.js';

const acc = (over = {}) => ({ id: 'acc-1', name: 'Bánh thưởng', price: 100000, petType: 'accessory', inStock: 5, status: 'available', ...over });
const pet = (over = {}) => ({ id: 'pet-1', name: 'Corgi', price: 6000000, petType: 'dog', inStock: 1, status: 'available', ...over });

test('thêm sản phẩm mới và cộng dồn số lượng', () => {
  let { items, result } = addItem([], acc());
  assert.equal(result.ok, true);
  ({ items } = addItem(items, acc()));
  assert.equal(items[0].quantity, 2);
});

test('không vượt quá tồn kho', () => {
  let items = [];
  for (let i = 0; i < 5; i++) ({ items } = addItem(items, acc()));
  const { result } = addItem(items, acc());
  assert.equal(result.ok, false);
  assert.equal(items[0].quantity, 5);
});

test('thú cưng chỉ mua được 1 và hết hàng thì từ chối', () => {
  let { items } = addItem([], pet());
  assert.equal(addItem(items, pet()).result.ok, false);
  assert.equal(addItem([], pet({ inStock: 0 })).result.ok, false);
});

test('cập nhật số lượng: hợp lệ, vượt tồn kho, giá trị sai', () => {
  const { items } = addItem([], acc());
  assert.equal(setItemQuantity(items, 'acc-1', 3).items[0].quantity, 3);
  const over = setItemQuantity(items, 'acc-1', 50);
  assert.equal(over.items[0].quantity, 5);
  assert.equal(over.result.ok, false);
  assert.equal(setItemQuantity(items, 'acc-1', 0).result.ok, false);
});

test('xóa sản phẩm và tính tổng', () => {
  let items = addItem([], acc()).items;
  items = addItem(items, acc({ id: 'acc-2', price: 50000 })).items;
  assert.equal(calcTotal(items), 150000);
  assert.equal(calcCount(items), 2);
  assert.equal(removeItem(items, 'acc-1').length, 1);
});

test('phí vận chuyển: phụ kiện dưới/trên ngưỡng, có thú cưng, giỏ rỗng', () => {
  const small = addItem([], acc()).items;
  assert.equal(calcShippingFee(small), SHIPPING_FEE);
  const big = [{ ...small[0], quantity: 5, price: FREE_SHIPPING_THRESHOLD / 5 }];
  assert.equal(calcShippingFee(big), 0);
  assert.equal(calcShippingFee(addItem([], pet()).items), 0);
  assert.equal(calcShippingFee([]), 0);
});

test('đặt cọc 30% chỉ tính trên thú cưng', () => {
  let items = addItem([], pet()).items;
  items = addItem(items, acc()).items;
  assert.equal(calcDeposit(items), 1800000);
  const s = calcOrderSummary(items);
  assert.equal(s.total, 6100000);
  assert.equal(s.remaining, 4300000);
  assert.equal(calcDeposit(addItem([], acc()).items), 0);
});

test('gợi ý còn thiếu bao nhiêu để miễn phí ship', () => {
  const s = calcOrderSummary(addItem([], acc()).items);
  assert.equal(s.freeShippingGap, FREE_SHIPPING_THRESHOLD - 100000);
});

test('gộp giỏ khách vào giỏ tài khoản', () => {
  const a = [{ ...acc(), quantity: 2 }];
  const b = [{ ...acc(), quantity: 2 }, { ...acc({ id: 'acc-2' }), quantity: 1 }];
  const merged = mergeCarts(a, b);
  assert.equal(merged.find((i) => i.id === 'acc-1').quantity, 4);
  assert.equal(merged.length, 2);
});

test('chuyển đổi giỏ <-> server giữ nguyên dữ liệu và userId', () => {
  const items = addItem([], acc()).items;
  const server = buildServerCart(items, 'cart-u3-x', 'u3');
  assert.equal(server.userId, 'u3');
  assert.equal(server.totalPrice, 100000);
  assert.equal(fromServerCart(server)[0].id, 'acc-1');
  assert.equal(buildServerCart(items, 'c').userId, null);
});

test('đồng bộ với server: xóa sản phẩm đã gỡ, báo đổi giá, giảm số lượng theo tồn kho', () => {
  const items = [{ ...acc(), quantity: 5 }, { ...acc({ id: 'gone' }), quantity: 1 }];
  const { items: next, changes } = syncItemsWithProducts(items, [acc({ price: 120000, inStock: 2 })]);
  assert.equal(next.length, 1);
  assert.equal(next[0].quantity, 2);
  assert.equal(next[0].price, 120000);
  assert.equal(changes.length, 3);
});
