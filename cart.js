// cart.js - UJI KENYA Cart Page Logic
(function () {
  if (window._cartInit) {
    window._cartDisplay?.();
    return;
  }
  window._cartInit = true;

  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  const emptyCartEl = document.getElementById('empty-cart');
  const cartContentEl = document.getElementById('cart-content');
  const checkoutBtnEl = document.getElementById('checkout-btn');
  const floatingMsgEl = document.getElementById('floating-message');

  // Helper: show messages
  function showFloatingMessage(msg) {
    if (!floatingMsgEl) return;
    floatingMsgEl.textContent = msg;
    floatingMsgEl.classList.remove('hidden');
    clearTimeout(showFloatingMessage._t);
    showFloatingMessage._t = setTimeout(() => floatingMsgEl.classList.add('hidden'), 3000);
  }

  // Cart storage
  function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }
  function saveCart(c) {
    localStorage.setItem('cart', JSON.stringify(c));
  }
  function updateCartCount() {
    const cnt = document.getElementById('cart-count');
    if (!cnt) return;
    cnt.textContent = getCart().reduce((s, it) => s + (it.quantity || 0), 0);
  }

  // Render Cart
  function renderCart() {
    const cart = getCart();
    if (!cartItemsEl) return;
    cartItemsEl.innerHTML = '';
    if (!cart.length) {
      emptyCartEl?.classList.remove('hidden');
      cartContentEl?.classList.add('hidden');
      cartTotalEl.textContent = 0;
      updateCartCount();
      return;
    }

    emptyCartEl?.classList.add('hidden');
    cartContentEl?.classList.remove('hidden');

    let total = 0;
    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="cart-item-image"><img src="${item.image}" alt="${item.name}" /></div>
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
        </div>`;
      cartItemsEl.appendChild(div);
      total += item.price * item.quantity;
    });

    cartTotalEl.textContent = total;
    updateCartCount();
  }

  // Cart item actions
  cartItemsEl?.addEventListener('click', e => {
    const btn = e.target;
    const id = parseInt(btn.dataset.id);
    let cart = getCart();

    if (btn.classList.contains('remove-item')) {
      cart = cart.filter(i => i.id !== id);
      saveCart(cart);
      renderCart();
    }

    if (btn.classList.contains('increase')) {
      const it = cart.find(x => x.id === id);
      if (it) it.quantity++;
      saveCart(cart);
      renderCart();
    }

    if (btn.classList.contains('decrease')) {
      const it = cart.find(x => x.id === id);
      if (it) {
        it.quantity--;
        if (it.quantity <= 0) cart = cart.filter(x => x.id !== id);
      }
      saveCart(cart);
      renderCart();
    }
  });

  // Checkout
  checkoutBtnEl?.addEventListener('click', async () => {
    const cart = getCart();
    if (!cart.length) return showFloatingMessage('Your cart is empty');
    if (!window.api?.isLoggedIn()) {
      showFloatingMessage('Please login to checkout');
      document.getElementById('login-modal')?.classList.remove('hidden');
      return;
    }

    try {
      const total = cart.reduce((s, it) => s + it.price * it.quantity, 0);
      const orderData = {
        items: cart.map(it => ({
          id: it.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity
        })),
        total
      };
      await window.api.createOrder(orderData);
      showFloatingMessage('Checkout successful');
      saveCart([]);
      renderCart();
    } catch (err) {
      showFloatingMessage(err.message || 'Checkout failed');
    }
  });

  // Continue shopping buttons
  document.getElementById('continue-shopping-btn')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
  document.getElementById('continue-shopping-btn-2')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
  document.getElementById('back-home-btn')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // Initial render
  renderCart();
  updateCartCount();
  window._cartDisplay = renderCart;
})();
