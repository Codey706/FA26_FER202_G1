import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Alert,
  Spinner,
  Breadcrumb
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaPaw,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaMinus,
  FaPlus,
  FaCheck
} from "react-icons/fa";

import productService from "../services/productService";
import categoryService from "../services/categoryService";
import reviewService from "../services/reviewService";
import PetCard from "../components/product/PetCard";
import ProductCard from "../components/product/ProductCard";
import { formatCurrency } from "../utils/formatters";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80";

const isPetProduct = (p) => p?.petType === "dog" || p?.petType === "cat";

const FOR_PETS_LABEL = { dog: "Chó", cat: "Mèo" };

// Một dòng thông tin trong bảng thông số.
const InfoRow = ({ label, children }) => (
  <div className="d-flex justify-content-between border-bottom py-2 gap-3">
    <span className="text-muted">{label}</span>
    <strong className="text-end">{children}</strong>
  </div>
);

function ProductDetailPage({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [relatedToast, setRelatedToast] = useState("");
  const toastTimerRef = useRef(null);

  // Tải sản phẩm, danh mục, đánh giá và sản phẩm liên quan.
  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");
    setProduct(null);
    setCategory(null);
    setReviews([]);
    setRelated([]);
    setQuantity(1);
    setAdded(false);
    setCartMessage("");
    window.scrollTo({ top: 0 });

    const load = async () => {
      try {
        const data = await productService.getProductById(id);
        if (!active) return;
        setProduct(data);

        // Phần phụ: lỗi ở đây không làm hỏng trang chi tiết.
        const [categories, productReviews, allProducts] = await Promise.all([
          categoryService.getCategories().catch(() => []),
          reviewService.getReviews({ productId: id }).catch(() => []),
          productService.getProducts({ categoryId: data.categoryId }).catch(() => [])
        ]);

        if (!active) return;

        setCategory(
          categories.find((c) => String(c.id) === String(data.categoryId)) || null
        );
        setReviews(Array.isArray(productReviews) ? productReviews : []);
        setRelated(
          (Array.isArray(allProducts) ? allProducts : [])
            .filter((p) => String(p.id) !== String(data.id))
            .slice(0, 4)
        );
      } catch (err) {
        if (active) {
          // 404 -> hiển thị "Không tìm thấy sản phẩm".
          setError(err.status === 404 ? "" : err.message || "Không thể tải sản phẩm.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const stock = Number(product?.inStock ?? 0);
  const outOfStock = !!product && (stock <= 0 || product.status === "sold");
  const isPet = isPetProduct(product);
  // Thú cưng chỉ có 1 bé/sản phẩm; phụ kiện tối đa bằng tồn kho.
  const maxQuantity = isPet ? 1 : Math.max(stock, 0);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return sum / reviews.length;
  }, [reviews]);

  const changeQuantity = (next) => {
    setQuantity(Math.min(Math.max(1, next), Math.max(maxQuantity, 1)));
  };

  const handleAddToCart = () => {
    if (!product || outOfStock || typeof onAddToCart !== "function") return;

    let lastResult = null;
    let addedCount = 0;

    for (let i = 0; i < quantity; i += 1) {
      const result = onAddToCart(product);
      lastResult = result;
      if (result?.ok === false) break;
      addedCount += 1;
    }

    if (addedCount === 0) {
      setAdded(false);
      setCartMessage(lastResult?.message || "Không thể thêm sản phẩm vào giỏ hàng.");
      return;
    }

    setAdded(true);
    setCartMessage(
      addedCount < quantity
        ? `Đã thêm ${addedCount}/${quantity} sản phẩm. ${lastResult?.message || ""}`
        : isPet
        ? lastResult?.message || "Đã thêm sản phẩm vào giỏ hàng."
        : `Đã thêm ${addedCount} sản phẩm vào giỏ hàng.`
    );
  };

  // Thêm sản phẩm liên quan vào giỏ.
  const handleRelatedAdd = (item) => {
    const result = onAddToCart?.(item);
    setRelatedToast(
      result?.message ||
        (result?.ok === false
          ? "Không thể thêm sản phẩm vào giỏ hàng."
          : `Đã thêm "${item.name}" vào giỏ hàng!`)
    );
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setRelatedToast(""), 3000);
    return result;
  };

  const handleBack = () => {
    // Quay lại trang trước nếu có, nếu không về trang danh sách.
    if (window.history.length > 1) navigate(-1);
    else navigate("/products");
  };

  const typeLabel =
    product?.petType === "dog"
      ? "Thú cưng - Chó"
      : product?.petType === "cat"
      ? "Thú cưng - Mèo"
      : product?.typeLabel || "Phụ kiện";

  const hasDiscount =
    product &&
    Number(product.originalPrice) > Number(product.price) &&
    Number(product.discount) > 0;

  return (
    <main className="py-5">
      <Container>
        <Button
          variant="outline-secondary"
          className="rounded-pill mb-3"
          onClick={handleBack}
        >
          <FaArrowLeft className="me-2" />
          Quay lại
        </Button>

        {product && (
          <Breadcrumb className="mb-4">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
              Trang chủ
            </Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/products" }}>
              Sản phẩm
            </Breadcrumb.Item>
            {category && (
              <Breadcrumb.Item
                linkAs={Link}
                linkProps={{ to: `/products?category=${category.id}` }}
              >
                {category.name}
              </Breadcrumb.Item>
            )}
            <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
          </Breadcrumb>
        )}

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-2">Đang tải sản phẩm...</p>
          </div>
        )}

        {!loading && error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && !product && (
          <Alert variant="warning">
            Không tìm thấy sản phẩm. <Link to="/products">Xem tất cả sản phẩm</Link>
          </Alert>
        )}

        {!loading && product && (
          <>
            <Row className="g-4 align-items-start">
              <Col md={6}>
                <div className="position-relative">
                  <img
                    src={product.image || FALLBACK_IMAGE}
                    alt={product.imageAlt || product.name}
                    className="img-fluid rounded-4 shadow-sm w-100"
                    style={{
                      maxHeight: "520px",
                      objectFit: "cover",
                      opacity: outOfStock ? 0.6 : 1
                    }}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                  {outOfStock && (
                    <Badge bg="danger" className="position-absolute top-0 start-0 m-3 fs-6">
                      Hết hàng
                    </Badge>
                  )}
                  {hasDiscount && !outOfStock && (
                    <Badge bg="danger" className="position-absolute top-0 start-0 m-3 fs-6">
                      -{product.discount}%
                    </Badge>
                  )}
                </div>
              </Col>

              <Col md={6}>
                <Badge bg="warning" text="dark" className="mb-3">
                  {typeLabel}
                </Badge>

                <h1 className="fw-bold">{product.name}</h1>

                <div className="d-flex align-items-center gap-2 text-warning mb-2">
                  <FaStar />
                  <strong className="text-dark">
                    {avgRating !== null
                      ? avgRating.toFixed(1)
                      : product.rating || "Chưa có"}
                  </strong>
                  <span className="text-muted small">
                    (
                    {reviews.length > 0
                      ? `${reviews.length} đánh giá`
                      : "chưa có đánh giá"}
                    )
                  </span>
                </div>

                <div className="my-3">
                  <span className="fs-3 fw-bold text-danger">
                    {formatCurrency(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="ms-3 text-muted text-decoration-line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>

                <p className="text-secondary">
                  {product.description || "Chưa có mô tả sản phẩm."}
                </p>

                <div className="bg-light rounded-3 p-3 mb-3">
                  {product.breedName && <InfoRow label="Giống">{product.breedName}</InfoRow>}
                  {product.gender && <InfoRow label="Giới tính">{product.gender}</InfoRow>}
                  {product.age && <InfoRow label="Độ tuổi">{product.age}</InfoRow>}
                  {product.color && <InfoRow label="Màu sắc">{product.color}</InfoRow>}
                  {product.origin && <InfoRow label="Xuất xứ">{product.origin}</InfoRow>}
                  {product.brand && <InfoRow label="Thương hiệu">{product.brand}</InfoRow>}
                  {product.weight && <InfoRow label="Khối lượng">{product.weight}</InfoRow>}
                  {Array.isArray(product.forPets) && product.forPets.length > 0 && (
                    <InfoRow label="Phù hợp cho">
                      {product.forPets.map((p) => FOR_PETS_LABEL[p] || p).join(", ")}
                    </InfoRow>
                  )}
                  {isPet && product.vaccinated && (
                    <InfoRow label="Tiêm phòng">{product.vaccinated}</InfoRow>
                  )}
                  {isPet && (
                    <>
                      <InfoRow label="Tẩy giun">
                        {product.dewormed ? (
                          <span className="text-success">
                            <FaCheckCircle className="me-1" />
                            Đã tẩy giun
                          </span>
                        ) : (
                          <span className="text-muted">
                            <FaTimesCircle className="me-1" />
                            Chưa
                          </span>
                        )}
                      </InfoRow>
                      <InfoRow label="Khám sức khỏe">
                        {product.healthCheck ? (
                          <span className="text-success">
                            <FaCheckCircle className="me-1" />
                            Đã khám
                          </span>
                        ) : (
                          <span className="text-muted">
                            <FaTimesCircle className="me-1" />
                            Chưa
                          </span>
                        )}
                      </InfoRow>
                    </>
                  )}
                  <InfoRow label="Tình trạng">
                    {outOfStock ? (
                      <span className="text-danger">Hết hàng</span>
                    ) : isPet ? (
                      <span className="text-success">Còn bé</span>
                    ) : (
                      <span className="text-success">Còn {stock} sản phẩm</span>
                    )}
                  </InfoRow>
                </div>

                {Array.isArray(product.tags) && product.tags.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {product.tags.map((tag) => (
                      <Badge key={tag} bg="light" text="dark" className="border">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Chọn số lượng (chỉ cho phụ kiện) */}
                {!isPet && !outOfStock && (
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span className="fw-semibold">Số lượng:</span>
                    <div className="d-flex align-items-center gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => changeQuantity(quantity - 1)}
                        disabled={quantity <= 1}
                        aria-label="Giảm số lượng"
                      >
                        <FaMinus />
                      </Button>
                      <span className="fw-bold text-center" style={{ minWidth: 32 }}>
                        {quantity}
                      </span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => changeQuantity(quantity + 1)}
                        disabled={quantity >= maxQuantity}
                        aria-label="Tăng số lượng"
                      >
                        <FaPlus />
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  variant={outOfStock ? "secondary" : "warning"}
                  className="text-white fw-bold rounded-pill px-4"
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                >
                  {added && !outOfStock ? (
                    <FaCheck className="me-2" />
                  ) : (
                    <FaShoppingCart className="me-2" />
                  )}
                  {outOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
                </Button>

                {cartMessage && (
                  <Alert variant={added ? "success" : "warning"} className="mt-3">
                    <FaPaw className="me-2" />
                    {cartMessage} {added && <Link to="/cart">Xem giỏ hàng</Link>}
                  </Alert>
                )}
              </Col>
            </Row>

            {/* Đánh giá */}
            <section className="mt-5">
              <h3 className="fw-bold mb-3">Đánh giá từ khách hàng</h3>

              {reviews.length === 0 ? (
                <Alert variant="light" className="border">
                  Sản phẩm này chưa có đánh giá nào.
                </Alert>
              ) : (
                <Row className="g-3">
                  {reviews.map((review) => (
                    <Col md={6} key={review.id}>
                      <div className="border rounded-4 p-3 h-100 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>{review.userName || "Khách hàng"}</strong>
                          <span className="text-warning">
                            {Array.from({ length: 5 }, (_, i) => (
                              <FaStar
                                key={i}
                                style={{ opacity: i < Number(review.rating) ? 1 : 0.25 }}
                              />
                            ))}
                          </span>
                        </div>
                        <p className="mb-2 text-secondary">{review.comment}</p>
                        <small className="text-muted">
                          {review.date}
                          {review.verified && (
                            <span className="ms-2 text-success">
                              <FaCheckCircle className="me-1" />
                              Đã mua hàng
                            </span>
                          )}
                        </small>
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
            </section>

            {/* Sản phẩm liên quan */}
            {related.length > 0 && (
              <section className="mt-5">
                <h3 className="fw-bold mb-3">Sản phẩm liên quan</h3>
                <Row xs={1} sm={2} lg={4} className="g-4">
                  {related.map((item) => (
                    <Col key={item.id}>
                      {isPetProduct(item) ? (
                        <PetCard pet={item} onAddToCart={handleRelatedAdd} />
                      ) : (
                        <ProductCard product={item} onAddToCart={handleRelatedAdd} />
                      )}
                    </Col>
                  ))}
                </Row>
              </section>
            )}
          </>
        )}
      </Container>

      {relatedToast && (
        <div className="toast-notice" role="status" aria-live="polite">
          <FaCheckCircle className="text-success fs-5" />
          <span>{relatedToast}</span>
        </div>
      )}
    </main>
  );
}

export default ProductDetailPage;
