(function () {
    // Lấy các phần tử cần thao tác từ DOM
    const searchInput = document.querySelector('#searchInput');
    const searchBtn = document.querySelector('#searchBtn');
    const addProductBtn = document.querySelector('#addProductBtn');
    const addProductForm = document.querySelector('#addProductForm');
    const productList = document.querySelector('#product-list');

    if (!searchInput || !searchBtn || !addProductBtn || !addProductForm || !productList) {
        return;
    }

    // Biến lưu lại từ khóa cuối cùng để áp dụng lại sau khi thêm sản phẩm
    let lastKeyword = '';

    // Chuẩn hóa chuỗi để so sánh không phân biệt hoa/thường và dấu
    const normalizeText = (value) =>
        value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

    // Hàm lọc sản phẩm theo từ khóa
    const filterProducts = (keyword) => {
        lastKeyword = keyword;
        const normalizedKeyword = normalizeText(keyword.trim());
        const items = productList.querySelectorAll('.product-item');

        items.forEach((item) => {
            const nameElement = item.querySelector('.product-name');
            const normalizedName = normalizeText(nameElement?.textContent ?? '');
            const shouldShow = !normalizedKeyword || normalizedName.includes(normalizedKeyword);
            item.classList.toggle('hidden', !shouldShow);
        });
    };

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
        addProductForm.classList.toggle('hidden');
        if (!addProductForm.classList.contains('hidden')) {
            addProductForm.querySelector('#productName')?.focus();
        }
    });

    addProductForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Lấy dữ liệu người dùng nhập từ form
        const name = addProductForm.productName.value.trim();
        const description = addProductForm.productDescription.value.trim();
        const priceValue = Number(addProductForm.productPrice.value);

        // Bỏ qua nếu người dùng chưa nhập đủ dữ liệu
        if (!name || !description || Number.isNaN(priceValue)) {
            return;
        }

        // Tạo phần tử article mới đại diện cho sản phẩm
        const article = document.createElement('article');
        article.className = 'product-item card';
        article.innerHTML = `
            <img src="https://via.placeholder.com/320x200" alt="Bia sach ${name}">
            <div class="product-content">
                <h3 class="product-name">${name}</h3>
                <p>${description}</p>
                <p class="product-price">Gia: ${priceValue.toLocaleString('vi-VN')} VND</p>
            </div>
        `;

        productList.appendChild(article);

        // Reset form và ẩn lại sau khi thêm thành công
        addProductForm.reset();
        addProductForm.classList.add('hidden');

        if (lastKeyword) {
            filterProducts(lastKeyword);
        }
    });
})();
