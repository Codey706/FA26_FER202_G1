import { Fragment } from 'react';
import { FaCheck } from 'react-icons/fa';

const STEPS = ['Giỏ hàng', 'Thông tin', 'Xác nhận', 'Hoàn tất'];

/** current: 1 = giỏ hàng, 2 = nhập thông tin, 3 = xem lại và xác nhận, 4 = hoàn tất */
const CheckoutSteps = ({ current = 1 }) => (
  <div className="shop-steps" aria-label="Các bước đặt hàng">
    {STEPS.map((label, index) => {
      const number = index + 1;
      const state = number < current ? 'is-done' : number === current ? 'is-active' : '';
      return (
        <Fragment key={label}>
          {index > 0 && <span className="shop-step-line" />}
          <span className={`shop-step ${state}`}>
            <span className="shop-step-num">
              {number < current ? <FaCheck size={12} /> : number}
            </span>
            {label}
          </span>
        </Fragment>
      );
    })}
  </div>
);

export default CheckoutSteps;
