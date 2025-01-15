const supertest = require('supertest');
const { HTTP_CODES } = require('../lib/constants');
const server = supertest.agent("http://localhost:4000");

describe('Product module integration tests', () => {
  let sellerAccessToken;
  let sellerId;
  let createdProductId;

  const sellerName = 'Test Seller123';
  const sellerEmail = 'seller123@test.com';
  const productName = 'Test Product 123';

  before((done) => {
    const seller = {
      name: sellerName,
      email: sellerEmail,
      password: 'password123',
    };

    server
      .post('/api/sellers/register')
      .send(seller)
      .expect(HTTP_CODES.CREATED)
      .end((err, res) => {
        if (!err) {
          sellerId = res.body.data.seller.id;
          
          server
            .post('/api/sellers/login')
            .send({
              email: seller.email,
              password: seller.password
            })
            .expect(HTTP_CODES.OK)
            .end((loginErr, loginRes) => {
              if (!loginErr) {
                sellerAccessToken = loginRes.body.data;
              }
              done(loginErr);
            });
        } else {
          done(err);
        }
      });
  }).timeout(50000);

  describe('POST /api/products', () => {
    it('should create a new product successfully', (done) => {
      const newProduct = {
        productName,
        description: 'A test product description',
        price: 99.99,
        quantity: 100,
        category: 'Electronics'
      };

      server
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .send(newProduct)
        .expect(HTTP_CODES.CREATED)
        .end((err, res) => {
          if (!err) {
            createdProductId = res.body.data.id;
          }
          done(err);
        });
    }).timeout(50000);

    it('should fail to create product without authentication', (done) => {
      const newProduct = {
        productName,
        description: 'A test product description',
        price: 99.99,
        quantity: 100,
        category: 'Electronics'
      };

      server
        .post('/api/products')
        .send(newProduct)
        .expect(HTTP_CODES.UNAUTHORIZED)
        .end((err) => {
          done(err);
        });
    }).timeout(50000);

    it('should fail to create product with invalid data', (done) => {
      const invalidProduct = {
        productName: '',
        description: 'A test product description',
        price: -10,
        quantity: 'invalid',
        category: 'Electronics'
      };

      server
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .send(invalidProduct)
        .expect(HTTP_CODES.BAD_REQUEST)
        .end((err) => {
          done(err);
        });
    }).timeout(50000);
  });

  describe('GET /api/products', () => {
    it('should get all products for seller', (done) => {
      server
        .get('/api/products')
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .expect(HTTP_CODES.OK)
        .end((err) => {
          done(err);
        });
    }).timeout(50000);
  });

  describe('GET /api/products/:id', () => {
    it('should get a specific product', (done) => {
      server
        .get(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .expect(HTTP_CODES.OK)
        .end((err) => {
          done(err);
        });
    }).timeout(50000);
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product successfully', (done) => {
      const updates = {
        productName: 'Updated Product',
        description: 'Updated description',
        price: 199.99
      };

      server
        .patch(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .send(updates)
        .expect(HTTP_CODES.OK)
        .end((err) => {
          done(err);
        });
    }).timeout(50000);
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product successfully', (done) => {
      server
        .delete(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .expect(HTTP_CODES.OK)
        .end((err) => {
          done(err);
        });
    }).timeout(50000);
  });

  after((done) => {
    if (createdProductId) {
      server
        .delete(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .end((err) => {
          done(err);
        });
    } else {
      done();
    }
  }).timeout(50000);
});
