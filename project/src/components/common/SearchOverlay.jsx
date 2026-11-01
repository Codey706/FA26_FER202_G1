import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaFire } from 'react-icons/fa';
import { POPULAR_SEARCHES } from '../../utils/search';

/**
 * Hộp tìm kiếm nổi ở giữa màn hình, nền phía sau bị làm mờ.
 * - Nhập từ khóa + Enter  -> /search?q=...
 * - Bấm gợi ý "Mọi người hay tìm" -> /search?q=...
 * - Esc / bấm nền / nút X -> đóng
 */
const SearchOverlay = ({ show, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [term, setTerm] = useState('');

  // Focus ô nhập, khóa cuộn trang nền và lắng nghe phím Esc khi đang mở.
  useEffect(() => {
    if (!show) return undefined;

    setTerm('');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = setTimeout(() => inputRef.current?.focus(), 30);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, onClose]);

  if (!show) return null;

  const goToResults = (keyword) => {
    const value = keyword.trim();
    if (!value) return;
    onClose();
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    goToResults(term);
  };

  return createPortal(
    <div
      className="search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Tìm kiếm"
      onMouseDown={(e) => {
        // Chỉ đóng khi bấm đúng vào lớp nền, không phải vào hộp tìm kiếm.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="search-overlay-box">
        <form className="search-overlay-form" onSubmit={handleSubmit}>
          <FaSearch className="search-overlay-icon" />
          <input
            ref={inputRef}
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Tìm cún cưng, mèo, phụ kiện..."
            className="search-overlay-input"
            aria-label="Từ khóa tìm kiếm"
            autoComplete="off"
          />
          <button
            type="button"
            className="search-overlay-close"
            onClick={onClose}
            title="Đóng (Esc)"
            aria-label="Đóng tìm kiếm"
          >
            <FaTimes />
          </button>
        </form>

        <div className="search-overlay-suggest">
          <div className="search-overlay-heading">
            <FaFire className="text-warning" /> Mọi người hay tìm
          </div>
          <div className="search-chip-list">
            {POPULAR_SEARCHES.map((item) => (
              <button
                key={item.label}
                type="button"
                className="search-chip"
                onClick={() => goToResults(item.label)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SearchOverlay;
