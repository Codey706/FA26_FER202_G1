
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Alert,
  Spinner
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaPaw
} from "react-icons/fa";

import productService from "../services/productService";
import { formatCurrency } from "../utils/formatters";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80";

function ProductDetailPage({ onAddToCart }) {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    productService.getProductById(id)
      .then((data) => {
        if (active) {
          setProduct(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Không thể tải sản phẩm.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!product || typeof onAddToCart !== "function") return;

    const result = onAddToCart(product);
    if (result?.ok === false) {
      setAdded(false);
      setCartMessage(result.message || "Không thể thêm sản phẩm vào giỏ hàng.");
      return;
    }

    setCartMessage(result?.message || "Đã thêm sản phẩm vào giỏ hàng.");
    setAdded(true);
  };

  return (
    <main className="py-5">
      <Container>
        <Link
          to="/"
          className="btn btn-outline-secondary rounded-pill mb-4"
        >
          <FaArrowLeft className="me-2" />
          Quay lại cửa hàng
        </Link>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-2">Đang tải sản phẩm...</p>
          </div>
        )}

        {!loading && error && (
          <Alert variant="danger">{error}</Alert>
        )}

        {!loading && !error && !product && (
          <Alert variant="warning">
            Không tìm thấy sản phẩm.
          </Alert>
        )}

        {!loading && product && (
          <Row className="g-4 align-items-start">
            <Col md={6}>
              <img
                src={product.image || FALLBACK_IMAGE}
                alt={product.name}
                className="img-fluid rounded-4 shadow-sm w-100"
                style={{
                  maxHeight: "520px",
                  objectFit: "cover"
                }}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            </Col>

            <Col md={6}>
              <Badge bg="warning" text="dark" className="mb-3">
                {product.petType === "dog"
                  ? "Thú cưng - Chó"
                  : product.petType === "cat"
                  ? "Thú cưng - Mèo"
                  : "Phụ kiện"}
              </Badge>

              <h1 className="fw-bold">
                {product.name}
              </h1>

              <div className="fs-3 fw-bold text-danger my-3">
                {formatCurrency(product.price)}
              </div>

              <p className="text-secondary">
                {product.description || "Chưa có mô tả sản phẩm."}
              </p>

              <div className="bg-light rounded-3 p-3 mb-4">
                {product.breedName && (
                  <p><strong>Giống:</strong> {product.breedName}</p>
                )}

                {product.gender && (
                  <p><strong>Giới tính:</strong> {product.gender}</p>
                )}

                {product.age && (
                  <p><strong>Độ tuổi:</strong> {product.age}</p>
                )}

                {product.color && (
                  <p><strong>Màu sắc:</strong> {product.color}</p>
                )}

                {product.origin && (
                  <p><strong>Xuất xứ:</strong> {product.origin}</p>
                )}

                {product.brand && (
                  <p><strong>Thương hiệu:</strong> {product.brand}</p>
                )}

                {product.inStock !== undefined && (
                  <p><strong>Tồn kho:</strong> {product.inStock}</p>
                )}
              </div>

              <Button
                variant="warning"
                className="text-white fw-bold rounded-pill px-4"
                onClick={handleAddToCart}
              >
                <FaShoppingCart className="me-2" />
                Thêm vào giỏ hàng
              </Button>

              {cartMessage && (
                <Alert variant={added ? "success" : "warning"} className="mt-3">
                  <FaPaw className="me-2" />
                  {cartMessage}
                </Alert>
              )}
            </Col>
          </Row>
        )}
      </Container>
    </main>
  );
}

export default ProductDetailPage;
