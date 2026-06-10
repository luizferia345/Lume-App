// Validação e Processamento do Checkout
class Checkout {
  constructor() {
    this.formData = {};
  }

  // Validar email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar formulário
  validateForm(formData) {
    const errors = [];

    if (!formData.fullName || formData.fullName.trim().length < 3) {
      errors.push('Nome deve ter pelo menos 3 caracteres');
    }

    if (!this.validateEmail(formData.email)) {
      errors.push('Email inválido');
    }

    if (!formData.phone || formData.phone.trim().length < 10) {
      errors.push('Telefone inválido');
    }

    if (!formData.address || formData.address.trim().length < 5) {
      errors.push('Endereço inválido');
    }

    if (!formData.city || formData.city.trim().length < 2) {
      errors.push('Cidade inválida');
    }

    if (!formData.postalCode || formData.postalCode.trim().length < 5) {
      errors.push('CEP inválido');
    }

    if (!formData.cardName || formData.cardName.trim().length < 3) {
      errors.push('Nome do titular inválido');
    }

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) {
      errors.push('Número do cartão inválido (16 dígitos)');
    }

    if (!formData.cvv || formData.cvv.trim().length !== 3) {
      errors.push('CVV inválido (3 dígitos)');
    }

    return errors;
  }

  // Processar checkout
  processCheckout(formData) {
    const errors = this.validateForm(formData);

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Simular processamento de pagamento
    const orderId = 'ORD-' + Date.now();
    const orderData = {
      orderId,
      date: new Date().toLocaleString('pt-BR'),
      customer: formData,
      items: cart.getItems(),
      subtotal: cart.getSubtotal(),
      tax: cart.getTax(),
      shipping: cart.getShipping(),
      total: cart.getTotal()
    };

    // Salvar pedido no localStorage
    localStorage.setItem('lastOrder', JSON.stringify(orderData));

    return {
      success: true,
      orderId,
      message: 'Pedido realizado com sucesso!'
    };
  }

  // Obter último pedido
  getLastOrder() {
    const orderData = localStorage.getItem('lastOrder');
    return orderData ? JSON.parse(orderData) : null;
  }
}

// Instância global do checkout
const checkout = new Checkout();
