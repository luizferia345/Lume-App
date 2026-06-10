// Sistema de Carrinho de Compras
class Cart {
  constructor() {
    this.items = this.loadCart();
  }

  // Carregar carrinho do localStorage
  loadCart() {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  }

  // Salvar carrinho no localStorage
  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  // Adicionar item ao carrinho
  addItem(product) {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        ...product,
        quantity: 1
      });
    }
    
    this.saveCart();
    this.notifyUpdate();
  }

  // Remover item do carrinho
  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
    this.notifyUpdate();
  }

  // Atualizar quantidade
  updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
      this.notifyUpdate();
    }
  }

  // Obter subtotal
  getSubtotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Obter impostos (10%)
  getTax() {
    return this.getSubtotal() * 0.1;
  }

  // Obter frete (R$ 15 fixo, ou grátis acima de R$ 200)
  getShipping() {
    const subtotal = this.getSubtotal();
    return subtotal > 200 ? 0 : 15;
  }

  // Obter total
  getTotal() {
    return this.getSubtotal() + this.getTax() + this.getShipping();
  }

  // Obter quantidade de itens
  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  // Limpar carrinho
  clear() {
    this.items = [];
    this.saveCart();
    this.notifyUpdate();
  }

  // Notificar atualização
  notifyUpdate() {
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: this }));
  }

  // Obter itens
  getItems() {
    return this.items;
  }
}

// Instância global do carrinho
const cart = new Cart();
