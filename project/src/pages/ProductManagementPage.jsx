
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    Card,
    Button,
    Table,
    Modal,
    Form,
    Row,
    Col,
    Badge,
    Alert,
    Spinner,
    InputGroup
} from 'react-bootstrap';
import {
    FaArrowLeft,
    FaPlus,
    FaEdit,
    FaTrash,
    FaSyncAlt,
    FaPaw,
    FaBox,
    FaSearch
} from 'react-icons/fa';

import categoryService from '../services/categoryService';
import productService from '../services/productService';
import breedService from '../services/breedService';

import '../styles/ProductManagementPage.css';

const initialForm = {
    name: '',
    breedId: '',
    breedName: '',
    origin: '',
    price: '',
    age: '',
    gender: '',
    color: '',
    description: '',
    image: '',
    inStock: 1,
    brand: '',
    type: '',
    typeLabel: '',
    weight: '',
    forPets: []
};

function ProductManagementPage() {
    const { categoryId } = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [breeds, setBreeds] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState(initialForm);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState(null);

    // Từ khóa tìm kiếm.
    const [searchTerm, setSearchTerm] = useState('');

    // Xác định nhóm danh mục và loại thú cưng.
    const petType = category?.petType ||
        (categoryId === 'cat-dogs'
            ? 'dog'
            : categoryId === 'cat-cats'
                ? 'cat'
                : 'accessory');

    const categoryType = category?.categoryType ||
        (petType === 'accessory' ? 'supply' : 'pet');

    const isPet = categoryType === 'pet';

    // Lấy dữ liệu danh mục, sản phẩm và giống.
    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            const [categoryData, productData, breedData] = await Promise.all([
                categoryService.getCategories(),
                productService.getProducts(),
                breedService.getBreeds()
            ]);

            const selectedCategory = categoryData.find(
                item => String(item.id) === String(categoryId)
            );

            setCategory(selectedCategory || null);

            const filteredProducts = productData.filter(
                item => String(item.categoryId) === String(categoryId)
            );

            setProducts(filteredProducts);
            setBreeds(breedData);
        } catch (err) {
            console.error(err);
            setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [categoryId]);

    // Lọc sản phẩm theo từ khóa tìm kiếm.
    const filteredProducts = products.filter(product => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) return true;

        return [
            product.id,
            product.name,
            product.breedName,
            product.origin,
            product.brand,
            product.type,
            product.typeLabel
        ].some(value =>
            String(value || '').toLowerCase().includes(keyword)
        );
    });

    // Lấy tên giống theo breedId.
    const getBreed = (breedId) => {
        return breeds.find(
            item => String(item.id) === String(breedId)
        );
    };

    // Mở form thêm sản phẩm.
    const handleAdd = () => {
        setEditingProduct(null);
        setFormError('');

        setFormData({
            ...initialForm,
            forPets: petType === 'dog'
                ? ['dog']
                : petType === 'cat'
                    ? ['cat']
                    : []
        });

        setShowModal(true);
    };

    // Mở form sửa sản phẩm.
    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormError('');

        const currentBreed = getBreed(product.breedId);

        setFormData({
            ...initialForm,
            ...product,
            price: product.price ?? '',
            inStock: product.inStock ?? 0,
            breedId: product.breedId || '',
            breedName: product.breedName || currentBreed?.name || '',
            gender: product.gender || '',
            forPets: product.forPets || []
        });

        setShowModal(true);
    };

    // Đóng form.
    const handleClose = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData(initialForm);
        setFormError('');
    };

    // Cập nhật dữ liệu form.
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Cập nhật đối tượng sử dụng của vật dụng.
    const handleForPetsChange = (petType, checked) => {
        setFormData(prev => ({
            ...prev,
            forPets: checked
                ? [...prev.forPets, petType]
                : prev.forPets.filter(item => item !== petType)
        }));
    };

    // Tìm giống đã có hoặc tạo giống mới.

    const getOrCreateBreed = async () => {
        const breedName = formData.breedName.trim();
        const personality = formData.description.trim();

        if (!breedName) return null;

        const existingBreed = breeds.find(item =>
            item.petType === petType &&
            String(item.name || '').trim().toLowerCase() === breedName.toLowerCase()
        );

        if (existingBreed) {
            const updatedBreed = {
                ...existingBreed,
                personality: personality
            };

            await breedService.updateBreed(existingBreed.id, updatedBreed);

            return updatedBreed;
        }

        const newBreed = {
            id: `breed-${Date.now()}`,
            name: breedName,
            petType: petType,
            personality: personality
        };

        return await breedService.createBreed(newBreed);
    };



    // Thêm hoặc cập nhật sản phẩm.
    const handleSubmit = async (e) => {
        e.preventDefault();

        const productName = formData.name.trim();

        if (!productName) {
            setFormError('Vui lòng nhập tên sản phẩm.');
            return;
        }

        // Kiểm tra tên sản phẩm đã tồn tại trong danh mục.
        const duplicatedName = products.some(product =>
            String(product.name || '').trim().toLowerCase() === productName.toLowerCase() &&
            String(product.id) !== String(editingProduct?.id)
        );

        if (duplicatedName) {
            setFormError('Tên sản phẩm đã tồn tại trong danh mục này!');
            return;
        }

        if (
            formData.price === '' ||
            Number(formData.price) < 0 ||
            !Number.isFinite(Number(formData.price))
        ) {
            setFormError('Vui lòng nhập giá bán hợp lệ.');
            return;
        }

        try {
            setSaving(true);
            setFormError('');

            let productData;

            if (isPet) {
                // Lấy giống đã chọn hoặc tạo giống mới.
                const selectedBreed = await getOrCreateBreed();

                productData = {
                    ...(editingProduct || {}),
                    name: formData.name.trim(),
                    categoryId,
                    breedId: selectedBreed?.id || '',
                    breedName: selectedBreed?.name || '',
                    petType: petType,
                    price: Number(formData.price),
                    age: formData.age,
                    gender: formData.gender.trim(),
                    origin: formData.origin,
                    color: formData.color,
                    description: formData.description,
                    image: formData.image,
                    inStock: Number(formData.inStock),
                    status: editingProduct?.status || 'available',
                    originalPrice: editingProduct?.originalPrice ?? Number(formData.price),
                    discount: editingProduct?.discount ?? 0,
                    vaccinated: editingProduct?.vaccinated || '',
                    dewormed: editingProduct?.dewormed ?? false,
                    healthCheck: editingProduct?.healthCheck ?? false,
                    rating: editingProduct?.rating ?? 0,
                    reviewCount: editingProduct?.reviewCount ?? 0,
                    isFeatured: editingProduct?.isFeatured ?? false
                };
            } else {
                productData = {
                    ...(editingProduct || {}),
                    name: formData.name.trim(),
                    categoryId,
                    breedId: null,
                    petType: 'accessory',
                    price: Number(formData.price),
                    brand: formData.brand || null,
                    type: formData.type,
                    typeLabel: formData.typeLabel,
                    weight: formData.weight || null,
                    forPets: formData.forPets,
                    description: formData.description,
                    image: formData.image,
                    inStock: Number(formData.inStock),
                    status: editingProduct?.status || 'available',
                    originalPrice: editingProduct?.originalPrice ?? Number(formData.price),
                    discount: editingProduct?.discount ?? 0,
                    rating: editingProduct?.rating ?? 0,
                    reviewCount: editingProduct?.reviewCount ?? 0,
                    isFeatured: editingProduct?.isFeatured ?? false
                };
            }

            if (editingProduct) {
                await productService.updateProduct(
                    editingProduct.id,
                    productData
                );
            } else {
                const prefix = isPet ? 'pet' : 'acc';

                productData.id = `${prefix}-${Date.now()}`;

                await productService.createProduct(productData);
            }

            handleClose();
            await loadData();
        } catch (err) {
            console.error(err);
            alert('Không thể lưu sản phẩm. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    // Mở hộp thoại xác nhận xóa.
    const handleDelete = (product) => {
        setDeletingProduct(product);
        setShowDeleteModal(true);
    };

    // Xác nhận xóa sản phẩm.
    const confirmDelete = async () => {
        if (!deletingProduct) return;

        try {
            await productService.deleteProduct(deletingProduct.id);

            setProducts(prev =>
                prev.filter(item =>
                    String(item.id) !== String(deletingProduct.id)
                )
            );

            setShowDeleteModal(false);
            setDeletingProduct(null);

        } catch (err) {
            console.error('Lỗi xóa sản phẩm:', err);

            // Tải lại để đồng bộ dữ liệu nếu server đã xóa.
            await loadData();

            setShowDeleteModal(false);
            setDeletingProduct(null);
        }
    };

    // Định dạng giá tiền.
    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString('vi-VN') + ' đ';
    };

    // Tiêu đề trang.
    const pageTitle = isPet
        ? petType === 'dog' ? 'Chó' : 'Mèo'
        : 'Vật dụng';

    // Hiển thị đối tượng sử dụng.
    const renderForPets = (forPets) => {
        if (!forPets || forPets.length === 0) return '—';

        return forPets.map(item =>
            item === 'dog' ? 'Chó' : item === 'cat' ? 'Mèo' : item
        ).join(', ');
    };

    return (
        <main className="product-management-page">
            <Container>
                {/* Tiêu đề trang */}
                <div className="product-management-heading">
                    <div>
                        <Button
                            variant="light"
                            className="product-back-btn-1"
                            onClick={() => navigate('/admin/categories')}
                        >
                            <FaArrowLeft className="me-2" />
                            Quay lại danh sách danh mục
                        </Button>
                        <br /><br />
                        <div className="product-management-badge">
                            {isPet ? <FaPaw /> : <FaBox />}
                            QUẢN TRỊ HỆ THỐNG
                        </div>

                        <h1>
                            Quản lý <span>Danh mục</span>
                        </h1>

                        <p>
                            Danh mục: <strong>{category?.name || 'Đang tải...'}</strong>
                        </p>
                    </div>

                    <Button
                        className="btn-primary-orange product-add-btn"
                        onClick={handleAdd}
                    >
                        <FaPlus /> Thêm sản phẩm
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

                {/* Danh sách sản phẩm */}
                <Card className="product-management-card">
                    <Card.Body>
                        <div className="product-list-heading">
                            <div>
                                <div className="product-list-title">
                                    <h4>
                                        Danh sách sản phẩm
                                        (Tổng {products.length} sản phẩm)
                                    </h4>
                                </div>

                                <p>Quản lý sản phẩm thuộc danh mục này.</p>
                            </div>

                            <Button
                                className="product-refresh-btn"
                                variant="light"
                                onClick={loadData}
                                disabled={loading}
                                title="Làm mới"
                            >
                                <FaSyncAlt />
                            </Button>
                        </div>

                        {/* Ô tìm kiếm sản phẩm */}
                        <div className="product-search-wrapper">
                            <InputGroup className="product-search">
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>

                                <Form.Control
                                    type="text"
                                    placeholder="Tìm theo tên sản phẩm..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />

                                {searchTerm && (
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        Xóa
                                    </Button>
                                )}
                            </InputGroup>
                        </div>

                        {loading ? (
                            <div className="product-loading">
                                <Spinner animation="border" />
                                <p>Đang tải danh sách sản phẩm...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="product-empty">
                                <FaBox />
                                <h5>Chưa có sản phẩm nào</h5>
                                <p>Hãy thêm sản phẩm đầu tiên cho danh mục này.</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="product-empty">
                                <FaSearch />
                                <h5>Không tìm thấy sản phẩm</h5>
                                <p>Không có sản phẩm phù hợp với từ khóa "{searchTerm}".</p>
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setSearchTerm('')}
                                >
                                    Xóa tìm kiếm
                                </Button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table className="product-management-table align-middle">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>Tên sản phẩm</th>
                                            <th>Mô tả</th>
                                            <th>Giá bán</th>
                                            <th>Tồn kho</th>
                                            <th className="text-center">Thao tác</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredProducts.map(product => (
                                            <tr key={product.id}>
                                                {/* Ảnh sản phẩm */}
                                                <td>
                                                    {product.image ? (
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="product-table-image"
                                                        />
                                                    ) : (
                                                        <span>Chưa có ảnh</span>
                                                    )}
                                                </td>

                                                {/* Tên sản phẩm */}
                                                <td>
                                                    <strong className="product-name">
                                                        {product.name}
                                                    </strong>
                                                </td>

                                                {/* Mô tả */}
                                                <td className="product-personality">
                                                    {product.description || '—'}
                                                </td>

                                                {/* Giá bán */}
                                                <td className="product-price">
                                                    {formatPrice(product.price)}
                                                </td>

                                                {/* Tồn kho */}
                                                <td>
                                                    <Badge bg={Number(product.inStock) > 0 ? 'success' : 'danger'}>
                                                        {product.inStock ?? 0}
                                                    </Badge>
                                                </td>

                                                {/* Thao tác */}
                                                <td>
                                                    <div className="product-action-buttons">
                                                        <Button
                                                            className="product-edit-btn"
                                                            onClick={() => handleEdit(product)}
                                                            title="Chỉnh sửa"
                                                        >
                                                            <FaEdit />
                                                        </Button>

                                                        <Button
                                                            className="product-delete-btn"
                                                            onClick={() => handleDelete(product)}
                                                            title="Xóa"
                                                        >
                                                            <FaTrash />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Nút quay lại */}
                <Button
                    variant="light"
                    className="product-back-btn"
                    onClick={() => navigate('/admin/categories')}
                >

                    Quay lại danh sách danh mục
                </Button>
            </Container>

            {/* Modal thêm và sửa sản phẩm */}
            <Modal
                show={showModal}
                onHide={handleClose}
                centered
                size="lg"
                className="product-form-modal"
            >
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {formError && (
                            <Alert variant="danger">
                                {formError}
                            </Alert>
                        )}

                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tên sản phẩm *</Form.Label>
                                    <Form.Control
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Nhập tên sản phẩm..."
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            {isPet ? (
                                <>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Giống *
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                name="breedName"
                                                list="breed-options"
                                                value={formData.breedName}
                                                onChange={handleChange}
                                                placeholder="Nhập giống..."
                                                required
                                            />

                                            <datalist id="breed-options">
                                                {breeds
                                                    .filter(item => item.petType === petType)
                                                    .map(item => (
                                                        <option
                                                            key={item.id}
                                                            value={item.name}
                                                        />
                                                    ))}
                                            </datalist>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Xuất xứ *</Form.Label>
                                            <Form.Control
                                                name="origin"
                                                value={formData.origin}
                                                onChange={handleChange}
                                                placeholder="Ví dụ: Trong nước"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Tuổi *</Form.Label>
                                            <Form.Control
                                                name="age"
                                                value={formData.age}
                                                onChange={handleChange}
                                                placeholder="Ví dụ: 3 tháng tuổi"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Giới tính *</Form.Label>

                                            <Form.Control
                                                type="text"
                                                name="gender"
                                                list="gender-options"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                placeholder="Nhập giới tính..."
                                                required
                                            />

                                            <datalist id="gender-options">
                                                <option value="Đực" />
                                                <option value="Cái" />
                                            </datalist>
                                        </Form.Group>
                                    </Col>

                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Màu lông *</Form.Label>
                                            <Form.Control
                                                name="color"
                                                value={formData.color}
                                                onChange={handleChange}
                                                placeholder="Ví dụ: Trắng kem"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </>
                            ) : (
                                <>
                                </>
                            )}

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Giá bán *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="Nhập giá bán"
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số lượng tồn kho *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        name="inStock"
                                        value={formData.inStock}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Đường dẫn hình ảnh</Form.Label>
                                    <Form.Control
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        placeholder="/images/..."
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Mô tả sản phẩm *</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Nhập mô tả sản phẩm..."
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="light"
                            onClick={handleClose}
                            disabled={saving}
                        >
                            Hủy
                        </Button>

                        <Button
                            type="submit"
                            className="btn-primary-orange"
                            disabled={saving}
                        >
                            {saving
                                ? 'Đang lưu...'
                                : editingProduct
                                    ? 'Cập nhật'
                                    : 'Thêm sản phẩm'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal xác nhận xóa sản phẩm */}
            <Modal
                show={showDeleteModal}
                onHide={() => {
                    setShowDeleteModal(false);
                    setDeletingProduct(null);
                }}
                centered
                className="product-delete-modal"
            >
                <Modal.Body className="text-center p-4">
                    <div className="delete-modal-icon mb-3">
                        <FaTrash />
                    </div>

                    <h4 className="mb-2">Xác nhận xóa?</h4>

                    <p className="text-muted mb-4">
                        Bạn có chắc chắn muốn xóa sản phẩm
                        {' '}
                        <strong>{deletingProduct?.name}</strong> không?
                        <br />
                        Hành động này không thể hoàn tác.
                    </p>

                    <div className="d-flex justify-content-center gap-2">
                        <Button
                            variant="light"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDeletingProduct(null);
                            }}
                        >
                            Hủy
                        </Button>

                        <Button
                            variant="danger"
                            onClick={confirmDelete}
                        >
                            <FaTrash className="me-2" />
                            Xóa sản phẩm
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </main>
    );
}

export default ProductManagementPage;