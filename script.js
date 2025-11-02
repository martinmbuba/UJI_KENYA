// Mock product data
const products = [
    { id: 1, name: "UJI BOWL", price: 150, image: "src/images/WhatsApp%20Image%202025-11-01%20at%2023.09.12.jpeg", category: "Uji" },
    { id: 2, name: "Sweet Uji Powder", price: 320, image: "src/images/WhatsApp%20Image%202025-11-01%20at%2023.09.36.jpeg", category: "Uji" },
    { id: 3, name: "Uji Bowl Set", price: 650, image: "src/images/WhatsApp%20Image%202025-11-01%20at%2023.09.59.jpeg", category: "Accessories" },
    { id: 4, name: "Maize Flour for Uji", price: 220, image: "src/images/WhatsApp%20Image%202025-11-01%20at%2023.10.32.jpeg", category: "Ingredients" },
    { id: 5, name: "Uji Stirring Stick", price: 100, image: "src/images/WhatsApp%20Image%202025-11-01%20at%2023.11.05.jpeg", category: "Tools" },
    { id: 6, name: "Flavored Uji Sachets", price: 390, image: "src/images/WhatsApp%20Image%202025-11-01%20at%2023.11.21.jpeg", category: "Uji" },
    { id: 7, name: "Uji Milk Additive", price: 120, image: "src/images/WhatsApp%20Image%202025-11-01%20at%2023.12.04.jpeg", category: "Ingredients" },
    { id: 8, name: "Traditional Uji Pot", price: 780, image: "src/images/WhatsApp%20Image%202025-11-01%20at%2023.13.55.jpeg", category: "Tools" },
    { id: 9, name: "Uji Recipe Book", price: 250, image: "src/images/tradi.jpeg", category: "Books" }
];

let cart = [];
let currentPage = parseInt(localStorage.getItem('currentPage')) || 1;
const itemsPerPage = 6;
const productQuantities = new Map();

// DOM elements
const productGrid = document.getElementById('products');
const searchInput = document.getElementById('search');
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.getElementById('cart-count');
const cartDiv = document.getElementById('cart');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const closeCartBtn = document.getElementById('close-cart');
const ceoImage = document.querySelector('.ceo-image');
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const nextBtn = document.getElementById('next-btn');
const backHomeBtn = document.getElementById('back-home-btn');
const ceoMessage = document.getElementById('ceo-message');
const ordersBtn = document.getElementById('orders-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');
const cancelLogin = document.getElementById('cancel-login');
const cancelRegister = document.getElementById('cancel-register');

// Display products
function displayProducts(productsToShow) {
    productGrid.innerHTML = '';
    const maxPage = Math.ceil(productsToShow.length / itemsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
        currentPage = maxPage;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToDisplay = productsToShow.slice(startIndex, endIndex);

    productsToDisplay.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Ksh ${product.price}</p>
            <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
        `;
        productGrid.appendChild(productDiv);
    });

    updatePagination(productsToShow.length);
    updateCEOMessageVisibility();
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCart();
    showFloatingMessage();
}

// Increase quantity
function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity++;
        updateCart();
    }
}

// Decrease quantity
function decreaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity--;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
        }
    }
}

// Show floating message
function showFloatingMessage() {
    const message = document.getElementById('floating-message');
    message.classList.remove('hidden');
    setTimeout(() => {
        message.classList.add('hidden');
    }, 3000);
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Update cart display
function updateCart() {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            <div class="cart-item-info">
                <span>${item.name} - Ksh ${item.price * item.quantity}</span>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-item" data-id="${item.id}">Remove</button>
        `;
        cartItems.appendChild(li);
        total += item.price * item.quantity;
    });

    cartTotal.textContent = total;

    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update pagination
function updatePagination(totalProducts) {
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    if (currentPage >= totalPages) {
        nextBtn.style.display = 'none';
    } else {
        nextBtn.style.display = 'block';
    }
    // Show back home button only on pages after the first
    if (currentPage > 1) {
        backHomeBtn.classList.remove('hidden');
    } else {
        backHomeBtn.classList.add('hidden');
    }
    localStorage.setItem('currentPage', currentPage);
}

// Update CEO message visibility
function updateCEOMessageVisibility() {
    if (currentPage === 1) {
        ceoMessage.style.display = 'block';
    } else {
        ceoMessage.style.display = 'none';
    }
}

// Search products
function searchProducts(query) {
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );
    if (query === '') {
        // If search is cleared, keep current page
        displayProducts(products);
    } else {
        currentPage = 1; // Reset to first page when searching
        displayProducts(filteredProducts);
    }
}

// Event listeners
productGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
        const productId = parseInt(e.target.dataset.id);
        addToCart(productId);
    }
});

cartItems.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item')) {
        const productId = parseInt(e.target.dataset.id);
        removeFromCart(productId);
    } else if (e.target.classList.contains('quantity-btn')) {
        const productId = parseInt(e.target.dataset.id);
        if (e.target.classList.contains('increase')) {
            increaseQuantity(productId);
        } else if (e.target.classList.contains('decrease')) {
            decreaseQuantity(productId);
        }
    }
});

searchInput.addEventListener('input', (e) => {
    searchProducts(e.target.value);
});

cartBtn.addEventListener('click', () => {
    window.open('cart.html', '_blank');
});

closeCartBtn.addEventListener('click', () => {
    cartDiv.classList.remove('show');
});

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
    showFloatingMessage('Your cart is empty. Add some products first!');
        return;
    }
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showFloatingMessage(`Checkout successful! Total amount: Ksh ${total}. Thank you for shopping with UJI Kenya!`);
    cart = [];
    updateCart();
});

registerBtn.addEventListener('click', () => {
    registerModal.classList.remove('hidden');
});

loginBtn.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
});

nextBtn.addEventListener('click', () => {
    currentPage++;
    displayProducts(products);
});

backHomeBtn.addEventListener('click', () => {
    currentPage = 1;
    displayProducts(products);
});

ordersBtn.addEventListener('click', () => {
    window.open('orders.html', '_blank');
});

// CEO image click functionality
ceoImage.addEventListener('click', () => {
    window.open('ceo.html', '_blank');
});

// Modal close functionality
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-modal')) {
        const modalId = e.target.getAttribute('data-modal');
        if (modalId) {
            document.getElementById(modalId).classList.add('hidden');
        }
    }
});

// Close modal when clicking outside
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.add('hidden');
    }
});

registerModal.addEventListener('click', (e) => {
    if (e.target === registerModal) {
        registerModal.classList.add('hidden');
    }
});

// Cancel buttons
cancelLogin.addEventListener('click', () => {
    loginModal.classList.add('hidden');
    loginForm.reset();
});

cancelRegister.addEventListener('click', () => {
    registerModal.classList.add('hidden');
    registerForm.reset();
});

// Switch between login and register
switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.classList.add('hidden');
    registerModal.classList.remove('hidden');
});

switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.classList.add('hidden');
    loginModal.classList.remove('hidden');
});

// Form submissions
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Simple validation (in a real app, this would be server-side)
    if (email && password) {
        showFloatingMessage('Login successful! Welcome back.');
        loginModal.classList.add('hidden');
        loginForm.reset();
    }
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    // Simple validation (in a real app, this would be server-side)
    if (name && email && password) {
        showFloatingMessage('Registration successful! Welcome to UJI Kenya.');
        registerModal.classList.add('hidden');
        registerForm.reset();
    }
});



// Initialize
displayProducts(products);
cartDiv.classList.add('hidden');
