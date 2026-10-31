import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Form,
    Modal,
    InputGroup,
    Badge,
    Alert,
    Spinner,
} from 'react-bootstrap';
import {
    FaPaw,
    FaPlus,
    FaSearch,
    FaArrowLeft,
    FaEdit,
    FaTrash,
    FaImage,
    FaBoxOpen,
    FaDog,
    FaCat,
    FaSyncAlt,
} from 'react-icons/fa';

import categoryService from '../services/categoryService';
import productService from '../services/productService';

import "../styles/CategoryManagementPage.css";

const INITIAL_FORM = {
    name: '',
    slug: '',
    description: '',
    petType: '',
    categoryType: '',
    image: '',
};

const CategoryManagementPage = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [formError, setFormError] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState(null);

    // Tạo slug từ tên danh mục.
    const createSlug = (value) => {
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    // Tải danh mục và sản phẩm.
    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            const [categoryData, productData] = await Promise.all([
                categoryService.getCategories(),
                productService.getProducts(),
            ]);

            setCategories(categoryData);
            setProducts(productData);
        } catch (err) {
            console.error('Failed to load category data:', err);
            setError(err.message || 'Không thể tải dữ liệu danh mục.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Đếm số sản phẩm thuộc một danh mục.
    const getProductCount = (categoryId) => {
        return products.filter(
            (product) =>
                String(product.categoryId) === String(categoryId)
        ).length;
    };



    // Tìm kiếm danh mục.
    const filteredCategories = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) {
            return categories;
        }

        return categories.filter((category) =>
            `${category.name || ''} ${category.slug || ''}`
                .toLowerCase()
                .includes(keyword)
        );
    }, [categories, searchTerm]);

    // Mở form thêm mới.
    const handleOpenCreate = () => {
        setEditingCategory(null);
        setFormData(INITIAL_FORM);
        setFormError('');
        setShowModal(true);
    };

    // Mở form chỉnh sửa.
    const handleOpenEdit = (category) => {
        setEditingCategory(category);

        setFormData({
            name: category.name || '',
            slug: category.slug || '',
            description: category.description || '',
            petType: category.petType || 'accessory',
            categoryType:
                category.categoryType ||
                (category.petType === 'accessory' ? 'supply' : 'pet'),
            image:
                category.image ||
                category.imageUrl ||
                category.imageURL ||
                '',
        });

        setFormError('');
        setShowModal(true);
    };

    // Cập nhật dữ liệu trong form.
    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
            ...(name === 'name' && !editingCategory
                ? { slug: createSlug(value) }
                : {}),
        }));
    };

    // Thêm mới hoặc cập nhật danh mục.
    const handleSubmit = async (event) => {
        event.preventDefault();

        const name = formData.name.trim();
        const slug = createSlug(name);

        if (!name) {
            setFormError('Vui lòng nhập tên danh mục.');
            return;
        }

        if (!slug) {
            setFormError('Vui lòng nhập slug hợp lệ.');
            return;
        }

        const duplicatedSlug = categories.some(
            (category) =>
                category.slug?.toLowerCase() === slug.toLowerCase() &&
                String(category.id) !== String(editingCategory?.id)
        );

        if (duplicatedSlug) {
            setFormError('Tên danh mục đã được sử dụng!');
            return;
        }

        const categoryData = {
            name,
            slug,
            description: formData.description.trim(),
            petType: formData.petType,
            categoryType: formData.categoryType,
            image: formData.image.trim(),
        };

        try {
            setSaving(true);
            setFormError('');

            if (editingCategory) {
                await categoryService.updateCategory(
                    editingCategory.id,
                    categoryData
                );
            } else {
                // Tạo ID dạng cat-ten-danh-muc.
                const newId = `cat-${slug}`;

                const duplicatedId = categories.some(
                    (category) => String(category.id) === newId
                );

                if (duplicatedId) {
                    setFormError('Mã danh mục đã tồn tại. Hãy đổi tên hoặc slug.');
                    setSaving(false);
                    return;
                }

                await categoryService.createCategory({
                    id: newId,
                    ...categoryData,
                });
            }

            setShowModal(false);
            await fetchData();
        } catch (err) {
            console.error('Failed to save category:', err);
            setFormError(err.message || 'Không thể lưu danh mục.');
        } finally {
            setSaving(false);
        }
    };

    // Mở hộp thoại xác nhận xóa.
    const handleOpenDelete = (category) => {
        setDeletingCategory(category);
        setShowDeleteModal(true);
    };

    // Xác nhận xóa danh mục.
    const confirmDelete = async () => {
        if (!deletingCategory) return;

        try {
            await categoryService.deleteCategory(deletingCategory.id);

            // Xóa danh mục khỏi danh sách hiển thị ngay lập tức.
            setCategories(prev =>
                prev.filter(item =>
                    String(item.id) !== String(deletingCategory.id)
                )
            );

            setShowDeleteModal(false);
            setDeletingCategory(null);

        } catch (err) {
            console.error('Lỗi xóa danh mục:', err);

            // Tải lại dữ liệu để đồng bộ với server.
            await fetchData();

            setShowDeleteModal(false);
            setDeletingCategory(null);
        }
    };

    // Hiển thị tên loại danh mục.
    const getTypeLabel = (petType) => {
        if (petType === 'dog') return 'Chó';
        if (petType === 'cat') return 'Mèo';
        if (petType === 'accessory') return 'Phụ kiện';

        return petType || 'Khác';
    };

    const getTypeClass = (petType) => {
        if (petType === 'dog') return 'category-type-dog';
        if (petType === 'cat') return 'category-type-cat';
        return 'category-type-accessory';
    };

    return (
        <main className="category-management-page">
            <Container>
                {/* Tiêu đề trang */}
                <div className="category-management-heading">
                    <div>
                        <Button
                            variant="light"
                            className="product-back-btn-1"
                            onClick={() => navigate('/home')}
                        >
                            <FaArrowLeft className="me-2" />
                            Quay lại Trang Chủ
                        </Button>
                        <br /><br />
                        <div className="category-management-badge">
                            <FaPaw /> QUẢN TRỊ HỆ THỐNG
                        </div>

                        <h1>
                            Quản lý <span>Danh mục</span>
                        </h1>

                        <p>
                            Quản lý danh mục thú cưng và phụ kiện trong cửa hàng.
                        </p>
                    </div>

                    <Button
                        className="btn-primary-orange category-add-btn"
                        onClick={handleOpenCreate}
                    >
                        <FaPlus /> Thêm danh mục
                    </Button>
                </div>

                {error && (
                    <Alert
                        variant="danger"
                        dismissible
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}



                {/* Danh sách danh mục */}
                <Card className="category-management-card">
                    <Card.Body>
                        <div className="category-list-heading">
                            <div className="category-list-title">
                                <h4>Danh sách danh mục (Tổng {categories.length} danh mục)</h4>
                                <p>Quản lý thông tin các danh mục hiện có.</p>
                            </div>

                            <Button
                                variant="light"
                                className="category-refresh-btn"
                                onClick={fetchData}
                                disabled={loading}
                                title="Tải lại danh sách"
                            >
                                <FaSyncAlt />
                            </Button>
                        </div>

                        <InputGroup className="category-search-box">
                            <InputGroup.Text>
                                <FaSearch />
                            </InputGroup.Text>

                            <Form.Control
                                placeholder="Tìm theo tên danh mục..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                            />
                        </InputGroup>

                        {loading ? (
                            <div className="category-loading">
                                <Spinner animation="border" />
                                <p>Đang tải danh mục...</p>
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="category-empty">
                                <FaPaw />
                                <h5>Không tìm thấy danh mục</h5>
                                <p>Thử tìm kiếm bằng từ khóa khác.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table category-management-table align-middle">
                                    <thead>
                                        <tr>
                                            <th>Danh mục</th>
                                            <th>Mô tả</th>
                                            <th>Sản phẩm</th>
                                            <th className="text-center">Thao tác</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredCategories.map((category) => {
                                            const image =
                                                category.image ||
                                                category.imageUrl ||
                                                category.imageURL;

                                            return (
                                                <tr key={category.id}>
                                                    <td>
                                                        <div className="category-table-info">
                                                            <div className="category-table-image">
                                                                {image ? (
                                                                    <img
                                                                        src={image}
                                                                        alt={category.name}
                                                                        onError={(event) => {
                                                                            event.currentTarget.style.display = 'none';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <FaImage />
                                                                )}
                                                            </div>

                                                            <div>
                                                                <strong>{category.name}</strong>
                                                                <small>{category.id}</small>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="category-description-cell">
                                                        {category.description || 'Chưa có mô tả'}
                                                    </td>

                                                    <td>
                                                        <span className="category-product-count">
                                                            {getProductCount(category.id)} sản phẩm
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="category-action-buttons">
                                                            <Button
                                                                className="category-detail-btn"
                                                                onClick={() =>
                                                                    navigate(`/admin/categories/${category.id}/products`)
                                                                }
                                                            >
                                                                Xem chi tiết
                                                            </Button>

                                                            <Button
                                                                className="category-edit-btn"
                                                                onClick={() => handleOpenEdit(category)}
                                                                title="Chỉnh sửa"
                                                            >
                                                                <FaEdit />
                                                            </Button>

                                                            <Button
                                                                className="category-delete-btn"
                                                                onClick={() => handleOpenDelete(category)}
                                                                title="Xóa danh mục"
                                                            >
                                                                <FaTrash />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Nút quay lại */}
                <Button
                    variant="light"
                    className="product-back-btn"
                    onClick={() => navigate('/home')}
                >
                    <FaArrowLeft className="me-2" />
                    Quay lại Trang Chủ
                </Button>
            </Container>

            {/* Modal thêm / chỉnh sửa */}
            <Modal
                show={showModal}
                onHide={() => !saving && setShowModal(false)}
                centered
                className="category-form-modal"
            >
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {formError && (
                            <Alert variant="danger">{formError}</Alert>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Tên danh mục *</Form.Label>
                            <Form.Control
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                placeholder="Nhập tên danh mục..."
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Phân loại danh mục *</Form.Label>
                            <Form.Select
                                name="categoryType"
                                value={formData.categoryType}
                                onChange={handleFormChange}
                                required
                            >
                                <option value="">-- Chọn phân loại --</option>
                                <option value="pet">Thú cưng</option>
                                <option value="supply">Đồ dùng</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                                placeholder="Nhập mô tả danh mục..."
                                required
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Đường dẫn hình ảnh</Form.Label>
                            <Form.Control
                                name="image"
                                value={formData.image}
                                onChange={handleFormChange}
                                placeholder="/images/categories/dogs.jpg"
                            />
                        </Form.Group>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="light"
                            onClick={() => setShowModal(false)}
                            disabled={saving}
                        >
                            Hủy
                        </Button>

                        <Button
                            type="submit"
                            className="btn-primary-orange"
                            disabled={saving}
                        >
                            {saving ? 'Đang lưu...' : 'Lưu danh mục'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal xác nhận xóa */}
            <Modal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    Bạn có chắc chắn muốn xóa danh mục{' '}
                    <strong>{deletingCategory?.name}</strong> không?
                    <p className="text-muted mb-0 mt-2">
                        Hành động này không thể hoàn tác.
                    </p>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="light"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        Hủy
                    </Button>

                    <Button
                        variant="danger"
                        onClick={confirmDelete}
                    >
                        <FaTrash className="me-2" />
                        Xóa danh mục
                    </Button>
                </Modal.Footer>
            </Modal>
        </main>
    );
};

export default CategoryManagementPage;