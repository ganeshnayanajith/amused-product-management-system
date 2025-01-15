class Seller {
  constructor(id, name, email, password) {
    if (!id || !name || !email || !password) {
      throw new CustomHttpError(HTTP_CODES.BAD_REQUEST, ERRORS.BAD_REQUEST_ERROR, 'All fields are mandatory');
    }
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = 'seller';
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Seller;