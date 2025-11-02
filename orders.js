// Orders data (will be loaded from API)
let orders = [];

// DOM elements
const ordersList = document.getElementById('orders-list');
const noOrders = document.getElementById('no-orders');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');
const cancelLogin = document.getElementById('cancel-login');
const cancelRegister = document.getElementById('cancel-register');

// Prevent double-initialization when the script is loaded multiple times
if (window._ordersInit) {
    // Re-render orders if needed
    displayOrders();
} else {
    window._ordersInit = true;

// Display orders
function displayOrders() {
    ordersList.innerHTML = '';

    if (orders.length === 0) {
        noOrders.classList.remove('hidden');
        ordersList.classList.add('hidden');
        return;
    }

    noOrders.classList.add('hidden');
    ordersList.classList.remove('hidden');

    // Sort orders by date (most recent first)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    orders.forEach((order, orderIndex) => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-card';
        orderDiv.innerHTML = `
            <div class="order-header">
                <h3>Order #${order.id}</h3>
                <div class="order-date">${formatDate(order.date)}</div>
                <div class="order-status status-${order.status.toLowerCase()}">${order.status}</div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <div class="order-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="order-item-details">
                            <h4>${item.name}</h4>
                            <p>Quantity: ${item.quantity}</p>
                            <p>Price: Ksh ${item.price} each</p>
                        </div>
                        <div class="order-item-total">
                            <p>Ksh ${item.price * item.quantity}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div class="order-total">
                    <p><strong>Total: Ksh ${order.total}</strong></p>
                </div>
                <div class="order-actions">
                    <button class="reorder-btn" data-order-id="${order.id}">Reorder</button>
                    ${order.status === 'Processing' ? '<button class="cancel-order-btn" data-order-id="' + order.id + '">Cancel Order</button>' : ''}
                </div>
            </div>
        `;
        ordersList.appendChild(orderDiv);
    });
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}



// Reorder functionality
async function reorder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        try {
            // Add items to cart
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            order.items.forEach(item => {
                const existingItem = cart.find(cartItem => cartItem.id === item.id);
                if (existingItem) {
                    existingItem.quantity += item.quantity;
                } else {
                    cart.push({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.image
                    });
                }
            });

            // Save cart to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            showFloatingMessage(`Items added to cart successfully!`);
            // Navigate to cart page
            loadCartPage();
        } catch (error) {
            showFloatingMessage(error.message || 'Reorder failed');
        }
    }
}

// Cancel order functionality
async function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
        try {
            await api.updateOrder(orderId, { status: 'Cancelled' });
            showFloatingMessage('Order cancelled successfully.');
            loadOrders(); // Refresh orders from API
        } catch (error) {
            showFloatingMessage(error.message || 'Cancel failed');
        }
    }
}

// Event listeners
ordersList.addEventListener('click', (e) => {
    if (e.target.classList.contains('reorder-btn')) {
        const orderId = parseInt(e.target.dataset.orderId);
        reorder(orderId);
    } else if (e.target.classList.contains('cancel-order-btn')) {
        const orderId = parseInt(e.target.dataset.orderId);
        cancelOrder(orderId);
    }
});

// Navigation buttons
document.addEventListener('click', (e) => {
    if (e.target.id === 'back-home-content-btn') {
        // Load home page content
        history.pushState({ page: 'home' }, 'UJI Kenya', '/');
        location.reload();
    } else if (e.target.id === 'start-shopping-btn') {
        // Load home page content
        history.pushState({ page: 'home' }, 'UJI Kenya', '/');
        location.reload();
    }
});

// Update cart count on orders page
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

// Initialize cart count
updateCartCount();

// Update cart count periodically
setInterval(updateCartCount, 1000);



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
        loadOrders(); // Load orders after login
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
        loadOrders(); // Load orders after registration
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

// Load orders from API
async function loadOrders() {
    if (!api.isLoggedIn()) {
        orders = [];
        displayOrders();
        return;
    }

    try {
        const response = await api.getOrders();
        orders = response.orders;
        displayOrders();
    } catch (error) {
        console.error('Failed to load orders:', error);
        orders = [];
        displayOrders();
    }
}

// Initialize orders page
loadOrders();
updateAuthUI(api.isLoggedIn());

} // end of _ordersInit guard
