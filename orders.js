// Load orders from localStorage
let orders = JSON.parse(localStorage.getItem('orders')) || [];

// DOM elements
const ordersList = document.getElementById('orders-list');
const noOrders = document.getElementById('no-orders');
const ceoImage = document.querySelector('.ceo-image');
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const backHomeContentBtn = document.getElementById('back-home-content-btn');
const cartBtn = document.getElementById('cart-btn');
const ordersBtn = document.getElementById('orders-btn');
const cartCount = document.getElementById('cart-count');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');
const cancelLogin = document.getElementById('cancel-login');
const cancelRegister = document.getElementById('cancel-register');

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

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Reorder functionality
function reorder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        // Create a new order with the same items
        const newOrder = {
            id: Date.now(), // Generate new order ID
            items: [...order.items], // Copy items
            total: order.total,
            date: new Date().toISOString(),
            status: 'Pending'
        };
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        displayOrders(); // Refresh the orders display
        showFloatingMessage(`Order reordered successfully! New order #${newOrder.id} placed.`);
    }
}

// Cancel order functionality
function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex].status = 'Cancelled';
            localStorage.setItem('orders', JSON.stringify(orders));
            displayOrders();
            showFloatingMessage('Order cancelled successfully.');
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

// CEO image click functionality
ceoImage.addEventListener('click', () => {
    window.open('ceo.html', '_blank');
});

// Auth button functionality
registerBtn.addEventListener('click', () => {
    registerModal.classList.remove('hidden');
});

loginBtn.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
});

// Navigation buttons
backHomeContentBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

cartBtn.addEventListener('click', () => {
    window.open('cart.html', '_blank');
});

ordersBtn.addEventListener('click', () => {
    // Already on orders page, could refresh or do nothing
    displayOrders();
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

    if (name && email && password) {
        showFloatingMessage('Registration successful! Welcome to UJI Kenya.');
        registerModal.classList.add('hidden');
        registerForm.reset();
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

// Initialize
displayOrders();
updateCartCount();
