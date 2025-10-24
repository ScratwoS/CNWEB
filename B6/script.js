(function () {
    // Thu thap cac phan tu DOM can dung
    const header = document.querySelector('.site-header');
    const nav = document.querySelector('#primary-nav');
    const navToggle = document.querySelector('#navToggle');
    const searchInput = document.querySelector('#searchInput');
    const searchBtn = document.querySelector('#searchBtn');
    const priceFilter = document.querySelector('#priceFilter');
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
        !priceFilter ||
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

    const STORAGE_KEY = 'quangBookstoreProducts';

    // Du lieu mau ban dau (su dung khi localStorage chua co gi)
    const defaultProducts = [
        {
            name: 'Ke chuyen dem khuya',
            description: 'Bo truyen ngan giup ban thu gian truoc khi ngu voi nhung cau chuyen nhe nhang va nhan van.',
            price: 95000,
        },
        {
            name: 'Dau an lich su Viet',
            description: 'Tong hop cac su kien quan trong cua lich su Viet Nam, duoc trinh bay sinh dong va de hieu.',
            price: 120000,
        },
        {
            name: 'Cam nang lam vuon xanh',
            description: 'Huong dan chi tiet tu chon giong cay den cham soc khu vuon nho tai nha.',
            price: 88000,
        },
    ];

    let products = [];
    let activeKeyword = '';
    let activePriceFilter = 'all';

    // Chuan hoa chuoi de so sanh khong phan biet dau va chu hoa
    const normalize = (value) =>
        value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

    // Hien thi hoac an thong bao loi o form
    const setError = (message) => {
        errorMsg.textContent = message;
        errorMsg.hidden = !message;
    };

    // Luu danh sach san pham vao localStorage
    const saveProducts = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        } catch (error) {
            console.error('Khong the luu san pham vao localStorage:', error);
        }
    };

    // Tai san pham tu localStorage, neu khong co thi dung du lieu mau
    const loadProducts = () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    products = parsed;
                    return;
                }
            }
        } catch (error) {
            console.warn('Khong the doc du lieu san pham, se dung du lieu mau.', error);
        }

        products = [...defaultProducts];
        saveProducts();
    };

    // Ap dung dieu kien loc theo gia
    const matchPriceFilter = (price) => {
        switch (activePriceFilter) {
            case 'under-100':
                return price < 100000;
            case '100-150':
                return price >= 100000 && price <= 150000;
            case 'over-150':
                return price > 150000;
            default:
                return true;
        }
    };

    // Ve lai danh sach san pham dua tren mang du lieu va tu khoa
    const renderProducts = () => {
        productList.querySelectorAll('.product-item').forEach((item) => item.remove());
        productList.querySelector('.empty-state')?.remove();

        const normalizedKeyword = normalize(activeKeyword.trim());
        const filtered = products.filter((product) => {
            const nameMatch = !normalizedKeyword || normalize(product.name).includes(normalizedKeyword);
            const priceMatch = matchPriceFilter(Number(product.price));
            return nameMatch && priceMatch;
        });

        if (filtered.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-state';
            emptyMessage.textContent = 'Khong tim thay san pham phu hop. Ban co the them san pham moi o phia tren.';
            productList.appendChild(emptyMessage);
            return;
        }

        filtered.forEach((product) => {
            const article = document.createElement('article');
            article.className = 'product-item card fade-enter';

            const image = document.createElement('img');
            image.src = 'https://via.placeholder.com/320x200';
            image.alt = `Bia sach ${product.name}`;

            const content = document.createElement('div');
            content.className = 'product-content';

            const title = document.createElement('h3');
            title.className = 'product-name';
            title.textContent = product.name;

            const desc = document.createElement('p');
            desc.textContent = product.description;

            const price = document.createElement('p');
            price.className = 'product-price';
            price.textContent = `Gia: ${Number(product.price).toLocaleString('vi-VN')} VND`;

            content.append(title, desc, price);
            article.append(image, content);
            productList.appendChild(article);

            requestAnimationFrame(() => {
                article.classList.add('fade-enter-active');
                setTimeout(() => {
                    article.classList.remove('fade-enter', 'fade-enter-active');
                }, 400);
            });
        });
    };

    // Dong menu dieu huong tren thiet bi nho
    const closeNav = () => {
        if (header.classList.contains('nav-open')) {
            header.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    };

    // Toggle menu khi nhan nut hamburger
    navToggle.addEventListener('click', () => {
        const isOpen = header.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
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

    // Hien thi hoac an form them san pham voi animation
    const toggleForm = (shouldShow) => {
        const isOpen = addProductForm.classList.contains('is-open');
        const targetState = typeof shouldShow === 'boolean' ? shouldShow : !isOpen;

        if (targetState) {
            addProductForm.classList.add('is-open');
            const targetHeight = addProductForm.scrollHeight;
            addProductForm.style.maxHeight = `${targetHeight}px`;
            requestAnimationFrame(() => {
                addProductForm.style.maxHeight = `${addProductForm.scrollHeight}px`;
            });
            nameInput.focus();
        } else {
            const currentHeight = addProductForm.scrollHeight;
            addProductForm.style.maxHeight = `${currentHeight}px`;
            requestAnimationFrame(() => {
                addProductForm.style.maxHeight = '0px';
                addProductForm.classList.remove('is-open');
            });
        }
    };

    // Dua form ve trang thai ban dau
    const resetFormState = () => {
        addProductForm.reset();
        setError('');
        toggleForm(false);
    };

    // Xy ly submit: kiem tra hop le, luu localStorage, render lai
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

        const newProduct = {
            name: nameValue,
            description: descValue,
            price: priceValue,
        };

        products.unshift(newProduct);
        saveProducts();
        renderProducts();
        resetFormState();
    };

    // Cap nhat tu khoa tim kiem va render lai
    const triggerSearch = () => {
        activeKeyword = searchInput.value;
        renderProducts();
    };

    searchBtn.addEventListener('click', triggerSearch);

    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            triggerSearch();
        }
    });

    searchInput.addEventListener('input', triggerSearch);

    // Cap nhat bo loc gia
    priceFilter.addEventListener('change', () => {
        activePriceFilter = priceFilter.value;
        renderProducts();
    });

    addProductBtn.addEventListener('click', () => {
        toggleForm();
    });

    cancelBtn.addEventListener('click', () => {
        resetFormState();
    });

    addProductForm.addEventListener('submit', handleSubmit);

    // Khoi dong: tai du lieu va ve danh sach
    loadProducts();
    renderProducts();
})();
