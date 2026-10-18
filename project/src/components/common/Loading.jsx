import React from 'react';
import { Spinner } from 'react-bootstrap';
import { FaPaw } from 'react-icons/fa';

const Loading = ({ message = 'Đang tải dữ liệu thú cưng...' }) => {
  return (
    <div className="loading-wrapper">
      <div className="loading-spinner-paw"></div>
      <div className="d-flex align-items-center justify-content-center gap-2 text-muted fw-bold">
        <FaPaw className="text-warning" />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Loading;
