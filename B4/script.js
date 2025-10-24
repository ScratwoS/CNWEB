(function () {
    // Thu thập các phần tử cần thao tác để đảm bảo script chạy sau khi HTML tải xong
    const header = document.querySelector('.site-header');
    const nav = document.querySelector('#primary-nav');
    const navToggle = document.querySelector('#navToggle');
    const searchInput = document.querySelector('#searchInput');
    const searchBtn = document.querySelector('#searchBtn');
    const addProductBtn = document.querySelector('#addProductBtn');
    const addProductForm = document.querySelector('#addProductForm');
    const cancelBtn = document.querySelector('#cancelBtn');
    const errorMsg = document.querySelector('#errorMsg');
    const productList = document.querySelector('#product-list');
    const nameInput = document.getElementById('newName');
    const priceInput = document.getElementById('newPrice');
    const descInput = document.getElementById('newDesc');

    if (
        !header ||
        !nav ||
        !navToggle ||
        !searchInput ||
        !searchBtn ||
        !addProductBtn ||
        !addProductForm ||
        !cancelBtn ||
        !errorMsg ||
        !productList ||
        !nameInput ||
        !priceInput ||
        !descInput
    ) {
        return;
    }

    // Dùng để đóng menu sau khi chọn mục
    const navLinks = nav.querySelectorAll('a');
    let activeKeyword = '';

    // Hàm chuẩn hóa chuỗi để so sánh không phân biệt dấu
    const normalize = (value) =>
        value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

    // Hiển thị hoặc ẩn thông báo lỗi
    const setError = (message) => {
        errorMsg.textContent = message;
        errorMsg.hidden = !message;
    };

    // Lọc danh sách sản phẩm theo từ khóa hiện tại
    const filterProducts = (keyword) => {
        activeKeyword = keyword;
        const normalizedKeyword = normalize(keyword.trim());

        productList.querySelectorAll('.product-item').forEach((item) => {
            const name = item.querySelector('.product-name')?.textContent ?? '';
            const match = !normalizedKeyword || normalize(name).includes(normalizedKeyword);
            item.classList.toggle('hidden', !match);
        });
    };

    // Đóng menu điều hướng trên thiết bị nhỏ
    const closeNav = () => {
        if (header.classList.contains('nav-open')) {
            header.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    };

    // Toggle menu khi nhấn nút hamburger
    navToggle.addEventListener('click', () => {
        const isOpen = header.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeNav();
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeNav();
        }
    });

    // Hiển thị/ẩn form thêm sản phẩm
    const toggleForm = (shouldShow) => {
        const isHidden = addProductForm.classList.contains('hidden');
        const show = typeof shouldShow === 'boolean' ? shouldShow : isHidden;

        addProductForm.classList.toggle('hidden', !show);

        if (show) {
            nameInput.focus();
        }
    };

    // Đưa form về trạng thái ban đầu
    const resetFormState = () => {
        addProductForm.reset();
        setError('');
        toggleForm(false);
    };

    // Tạo phần tử sản phẩm mới bằng DOM API để hạn chế lỗi nhập liệu
    const buildProductItem = ({ name, description, price }) => {
        const article = document.createElement('article');
        article.className = 'product-item card';

        const image = document.createElement('img');
        image.src = 'https://via.placeholder.com/320x200';
        image.alt = `Bia sach ${name}`;

        const content = document.createElement('div');
        content.className = 'product-content';

        const title = document.createElement('h3');
        title.className = 'product-name';
        title.textContent = name;

        const desc = document.createElement('p');
        desc.textContent = description;

        const priceEl = document.createElement('p');
        priceEl.className = 'product-price';
        priceEl.textContent = `Gia: ${price.toLocaleString('vi-VN')} VND`;

        content.append(title, desc, priceEl);
        article.append(image, content);

        return article;
    };

    // Chèn sản phẩm mới vào đầu danh sách
    const insertProductItem = (item) => {
        const firstProduct = productList.querySelector('.product-item');
        if (firstProduct) {
            productList.insertBefore(item, firstProduct);
        } else {
            productList.appendChild(item);
        }
    };

    // Xử lý submit form: validate và thêm sản phẩm
    const handleSubmit = (event) => {
        event.preventDefault();

        const nameValue = nameInput.value.trim();
        const priceValue = Number(priceInput.value);
        const descValue = descInput.value.trim();

        if (!nameValue) {
            setError('Vui long nhap ten san pham.');
            nameInput.focus();
            return;
        }

        if (!Number.isFinite(priceValue) || priceValue <= 0) {
            setError('Gia san pham can lon hon 0.');
            priceInput.focus();
            return;
        }

        if (!descValue || descValue.length < 10) {
            setError('Mo ta can it nhat 10 ky tu de khach hang nam ro san pham.');
            descInput.focus();
            return;
        }

        setError('');

        const newItem = buildProductItem({
            name: nameValue,
            description: descValue,
            price: priceValue,
        });

        insertProductItem(newItem);
        resetFormState();
        filterProducts(activeKeyword);
    };

    // Các sự kiện lọc sản phẩm theo keyword
    searchBtn.addEventListener('click', () => {
        filterProducts(searchInput.value);
    });

    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            filterProducts(searchInput.value);
        }
    });

    searchInput.addEventListener('input', () => {
        filterProducts(searchInput.value);
    });

    addProductBtn.addEventListener('click', () => {
        toggleForm();
    });

    cancelBtn.addEventListener('click', () => {
        resetFormState();
    });

    addProductForm.addEventListener('submit', handleSubmit);
})();
