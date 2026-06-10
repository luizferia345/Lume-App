// Inicialização da Página de Vendas

// DOM Elements
let productsGrid;
let cartBtn;
let cartModal;
let cartClose;
let cartItems;
let cartEmpty;
let cartContent;
let subtotalEl;
let taxEl;
let shippingEl;
let totalEl;
let checkoutBtn;
let checkoutModal;
let checkoutClose;
let checkoutForm;
let cartBadge;
let successModal;
let successClose;
let orderIdEl;
let successOrderDetails;

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  renderProducts();
  updateCartUI();
  setupEventListeners();
});

// Inicializar elementos do DOM
function initializeElements() {
  productsGrid = document.getElementById('products-grid');
  cartBtn = document.getElementById('cart-btn');
  cartModal = document.getElementById('cart-modal');
  cartClose = document.querySelector('.cart-modal .close');
  cartItems = document.getElementById('cart-items');
  cartEmpty = document.getElementById('cart-empty');
  cartContent = document.getElementById('cart-content');
  subtotalEl = document.getElementById('subtotal');
  taxEl = document.getElementById('tax');
  shippingEl = document.getElementById('shipping');
  totalEl = document.getElementById('total');
  checkoutBtn = document.getElementById('checkout-btn');
  checkoutModal = document.getElementById('checkout-modal');
  checkoutClose = document.querySelector('.checkout-modal .close');
  checkoutForm = document.getElementById('checkout-form');
  cartBadge = document.getElementById('cart-badge');
  successModal = document.getElementById('success-modal');
  successClose = document.querySelector('.success-modal .close');
  orderIdEl = document.getElementById('order-id');
  successOrderDetails = document.getElementById('success-order-details');
}

// Renderizar produtos
function renderProducts() {
  productsGrid.innerHTML = products.map(product => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">$${product.price.toFixed(2)}</span>
          <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

// Atualizar UI do carrinho
function updateCartUI() {
  const itemCount = cart.getItemCount();
  
  // Atualizar badge
  if (itemCount > 0) {
    cartBadge.style.display = 'flex';
    cartBadge.textContent = itemCount;
  } else {
    cartBadge.style.display = 'none';
  }

  // Atualizar conteúdo do carrinho
  if (cart.items.length === 0) {
    cartEmpty.style.display = 'block';
    cartContent.style.display = 'none';
  } else {
    cartEmpty.style.display = 'none';
    cartContent.style.display = 'block';

    // Renderizar itens
    cartItems.innerHTML = cart.items.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>$${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-quantity">
          <button class="qty-btn qty-decrease" data-id="${item.id}">-</button>
          <input type="number" class="qty-input" min="1" value="${item.quantity}" data-id="${item.id}">
          <button class="qty-btn qty-increase" data-id="${item.id}">+</button>
        </div>
        <span class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</span>
        <button class="cart-item-remove" data-id="${item.id}">✕</button>
      </div>
    `).join('');

    // Atualizar totais
    subtotalEl.textContent = `$${cart.getSubtotal().toFixed(2)}`;
    taxEl.textContent = `$${cart.getTax().toFixed(2)}`;
    shippingEl.textContent = `$${cart.getShipping().toFixed(2)}`;
    totalEl.textContent = `$${cart.getTotal().toFixed(2)}`;
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Abrir/Fechar modal do carrinho
  cartBtn.addEventListener('click', () => cartModal.style.display = 'flex');
  cartClose.addEventListener('click', () => cartModal.style.display = 'none');

  // Fechar checkout
  checkoutClose.addEventListener('click', () => checkoutModal.style.display = 'none');
  successClose.addEventListener('click', () => successModal.style.display = 'none');

  // Fechar modals ao clicar fora
  window.addEventListener('click', (e) => {
    if (e.target === cartModal) cartModal.style.display = 'none';
    if (e.target === checkoutModal) checkoutModal.style.display = 'none';
    if (e.target === successModal) successModal.style.display = 'none';
  });

  // Adicionar ao carrinho
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-btn')) {
      const productId = parseInt(e.target.dataset.id);
      const product = products.find(p => p.id === productId);
      if (product) {
        cart.addItem(product);
        showNotification('Produto adicionado ao carrinho!');
      }
    }

    // Remover do carrinho
    if (e.target.classList.contains('cart-item-remove')) {
      const productId = parseInt(e.target.dataset.id);
      cart.removeItem(productId);
    }

    // Aumentar quantidade
    if (e.target.classList.contains('qty-increase')) {
      const productId = parseInt(e.target.dataset.id);
      const item = cart.items.find(i => i.id === productId);
      if (item) cart.updateQuantity(productId, item.quantity + 1);
    }

    // Diminuir quantidade
    if (e.target.classList.contains('qty-decrease')) {
      const productId = parseInt(e.target.dataset.id);
      const item = cart.items.find(i => i.id === productId);
      if (item) cart.updateQuantity(productId, item.quantity - 1);
    }
  });

  // Atualizar quantidade via input
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('qty-input')) {
      const productId = parseInt(e.target.dataset.id);
      const quantity = parseInt(e.target.value) || 1;
      if (quantity > 0) {
        cart.updateQuantity(productId, quantity);
      } else {
        e.target.value = 1;
      }
    }
  });

  // Abrir checkout
  checkoutBtn.addEventListener('click', () => {
    if (cart.items.length === 0) {
      showNotification('Carrinho vazio!');
      return;
    }
    cartModal.style.display = 'none';
    checkoutModal.style.display = 'flex';
  });

  // Enviar formulário de checkout
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      postalCode: document.getElementById('postalCode').value,
      cardName: document.getElementById('cardName').value,
      cardNumber: document.getElementById('cardNumber').value,
      expiryDate: document.getElementById('expiryDate').value,
      cvv: document.getElementById('cvv').value
    };

    const result = checkout.processCheckout(formData);

    if (result.success) {
      showSuccessOrder(result.orderId);
      checkoutForm.reset();
      cart.clear();
      checkoutModal.style.display = 'none';
    } else {
      showNotification(result.errors.join('\n'), 'error');
    }
  });

  // Atualizar UI quando carrinho mudar
  window.addEventListener('cartUpdated', updateCartUI);
}

// Mostrar notificação
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
}

// Mostrar pedido bem-sucedido
function showSuccessOrder(orderId) {
  const order = checkout.getLastOrder();
  
  orderIdEl.textContent = orderId;
  
  successOrderDetails.innerHTML = `
    <div class="order-summary">
      <h3>Resumo do Pedido</h3>
      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <span>${item.name} x${item.quantity}</span>
            <span class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
      <div class="order-totals">
        <div class="order-line">
          <span>Subtotal:</span>
          <span>$${order.subtotal.toFixed(2)}</span>
        </div>
        <div class="order-line">
          <span>Impostos (10%):</span>
          <span>$${order.tax.toFixed(2)}</span>
        </div>
        <div class="order-line">
          <span>Frete:</span>
          <span>$${order.shipping.toFixed(2)}</span>
        </div>
        <div class="order-line total">
          <span>Total:</span>
          <span>$${order.total.toFixed(2)}</span>
        </div>
      </div>
      <div class="order-customer">
        <h4>Dados de Entrega</h4>
        <p><strong>Nome:</strong> ${order.customer.fullName}</p>
        <p><strong>Email:</strong> ${order.customer.email}</p>
        <p><strong>Endereço:</strong> ${order.customer.address}, ${order.customer.city} ${order.customer.postalCode}</p>
      </div>
    </div>
  `;

  successModal.style.display = 'flex';
}
