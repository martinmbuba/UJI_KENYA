// Products will be loaded from API
let products = [];

// Use global cart from window object
let cart = window.cart || [];

// DOM elements
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const emptyCart = document.getElementById('empty-cart');
const cartContent = document.getElementById('cart-content');
const checkoutBtn = document.getElementById('checkout-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');
const cancelLogin = document.getElementById('cancel-login');
const cancelRegister = document.getElementById('cancel-register');

// Display cart items
function displayCart() {
    cartItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        emptyCart.classList.remove('hidden');
        cartContent.classList.add('hidden');
        return;
    }

    emptyCart.classList.add('hidden');
    cartContent.classList.remove('hidden');

    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="item-price">Ksh ${item.price}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <div class="cart-item-total">
                <p>Ksh ${item.price * item.quantity}</p>
                <button class="remove-item" data-id="${item.id}">Remove</button>
            </div>
        `;
        cartItems.appendChild(itemDiv);
        total += item.price * item.quantity;
    });

    cartTotal.textContent = total;
    updateCartCount();
}

// Update cart count (no longer needed since header is removed)
function updateCartCount() {
    // Cart count is no longer displayed on this page
}

// Increase quantity
function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity++;
        window.cart = cart; // Update global cart
        saveCart();
        displayCart();
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
            window.cart = cart; // Update global cart
            saveCart();
            displayCart();
        }
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    window.cart = cart; // Update global cart
    saveCart();
    displayCart();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Event listeners
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

checkoutBtn.addEventListener('click', async () => {
    if (cart.length === 0) {
        showFloatingMessage('Your cart is empty. Add some products first!');
        return;
    }

    if (!api.isLoggedIn()) {
        showFloatingMessage('Please login to checkout');
        loginModal.classList.remove('hidden');
        return;
    }

    try {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderData = {
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            total
        };

        const response = await api.createOrder(orderData);
        showFloatingMessage(`Checkout successful! Order #${response.order.id} placed. Total: Ksh ${total}`);
        cart = [];
        window.cart = cart; // Update global cart
        saveCart();
        displayCart();
    } catch (error) {
        showFloatingMessage(error.message || 'Checkout failed');
    }
});

// Navigation buttons
document.addEventListener('click', (e) => {
    if (e.target.id === 'back-home-btn') {
        // Load home page content
        window.location.href = '/';
    } else if (e.target.id === 'continue-shopping-btn') {
        // Load home page content
        window.location.href = '/';
    }
});

// Auth button functionality (removed since header is gone)

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
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await api.login({ email, password });
        showFloatingMessage(response.message);
        loginModal.classList.add('hidden');
        loginForm.reset();
        updateAuthUI(true);
    } catch (error) {
        showFloatingMessage(error.message || 'Login failed');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await api.register({ name, email, password });
        showFloatingMessage(response.message);
        registerModal.classList.add('hidden');
        registerForm.reset();
        updateAuthUI(true);
    } catch (error) {
        showFloatingMessage(error.message || 'Registration failed');
    }
});

// Floating message function
function showFloatingMessage(message) {
    const floatingMessage = document.getElementById('floating-message');
    floatingMessage.textContent = message;
    floatingMessage.classList.remove('hidden');
    setTimeout(() => {
        floatingMessage.classList.add('hidden');
    }, 3000);
}

// Update auth UI function (removed since header is gone)
function updateAuthUI(isLoggedIn) {
    // Auth UI is no longer displayed on this page
}

// Load products from API
async function loadProducts() {
    try {
        const response = await api.getProducts();
        products = response.products;
    } catch (error) {
        console.error('Failed to load products:', error);
        // Fallback to local products if API fails
        products = [
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
    }
}

// Initialize (called from script.js after page load)
