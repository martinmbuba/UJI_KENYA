// Products will be loaded from API
let products = [];

// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM elements
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const emptyCart = document.getElementById('empty-cart');
const cartContent = document.getElementById('cart-content');
const checkoutBtn = document.getElementById('checkout-btn');
const ceoImage = document.querySelector('.ceo-image');
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const backHomeBtn = document.getElementById('back-home-btn');
const cartBtn = document.getElementById('cart-btn');
const ordersBtn = document.getElementById('orders-btn');
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

// Update cart count in header
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Increase quantity
function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity++;
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
            saveCart();
            displayCart();
        }
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
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
        saveCart();
        displayCart();
    } catch (error) {
        showFloatingMessage(error.message || 'Checkout failed');
    }
});

// CEO image click functionality
ceoImage.addEventListener('click', () => {
    window.open('ceo.html', '_blank');
});

// Navigation buttons
document.addEventListener('click', (e) => {
    if (e.target.id === 'back-home-btn') {
        window.location.href = 'index.html';
    } else if (e.target.id === 'cart-btn') {
        // Already on cart page, could refresh or do nothing
        displayCart();
    } else if (e.target.id === 'orders-btn') {
        window.open('orders.html', '_blank');
    } else if (e.target.id === 'continue-shopping-btn') {
        window.location.href = 'index.html';
    }
});

// Auth button functionality
registerBtn.addEventListener('click', () => {
    registerModal.classList.remove('hidden');
});

loginBtn.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
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

// Update auth UI function
function updateAuthUI(isLoggedIn) {
    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');

    if (isLoggedIn) {
        registerBtn.style.display = 'none';
        loginBtn.textContent = 'Logout';
        loginBtn.onclick = () => {
            api.logout();
            updateAuthUI(false);
            showFloatingMessage('Logged out successfully');
        };
    } else {
        registerBtn.style.display = 'block';
        loginBtn.textContent = 'Login';
        loginBtn.onclick = () => {
            loginModal.classList.remove('hidden');
        };
    }
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

// Initialize
loadProducts();
displayCart();
updateAuthUI(api.isLoggedIn());
