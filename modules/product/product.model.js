class Product {
  constructor(id, sellerId, productName, description, price, quantity, category) {
    this.id = id;
    this.productName = productName;
    this.description = description;
    this.price = price;
    this.quantity = quantity;
    this.category = category;
    this.sellerId = sellerId;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Product;
