const Seller = require('./seller.model');
const { dynamoDB } = require('../../config/aws-config');
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const TABLE_NAME = 'Sellers';
const Utils = require('../../lib/utils');
const CustomHttpError = require('../../lib/custom-http-error');
const { HTTP_CODES, ERRORS } = require('../../lib/constants');
const { ScanCommand } = require('@aws-sdk/client-dynamodb');

class SellerService {

  static async getSellerByEmail(email) {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': { S: email } }
    });
    const result = await dynamoDB.send(command);

    return result.Items[0];
  }

  static async register(sellerData) {

    const existingSeller = await this.getSellerByEmail(sellerData.email);

    if (existingSeller) {
      throw new CustomHttpError(HTTP_CODES.BAD_REQUEST, ERRORS.BAD_REQUEST_ERROR, 'Email already exists');
    }

    const id = crypto.randomUUID();
    const hashedPassword = await Utils.hashPassword(sellerData.password);
    const seller = new Seller(
      id,
      sellerData.name,
      sellerData.email,
      hashedPassword
    );

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: seller,
    });

    await dynamoDB.send(command);

    const accessToken = await Utils.generateToken({ userId: seller.id, email: seller.email, role: seller.role });

    delete seller.password;

    return { seller, accessToken };
  }

  static async login(payload) {

    const { email, password } = payload;

    const seller = await this.getSellerByEmail(email);

    if (!seller) {
      throw new CustomHttpError(HTTP_CODES.BAD_REQUEST, ERRORS.BAD_REQUEST_ERROR, 'Invalid credentials!');
    }

    const isPasswordCorrect = await Utils.comparePasswords(password, seller.password.S);

    if (!isPasswordCorrect) {
      throw new CustomHttpError(HTTP_CODES.BAD_REQUEST, ERRORS.BAD_REQUEST_ERROR, 'Invalid credentials!');
    }

    const accessToken = await Utils.generateToken({ userId: seller.id.S, email: seller.email.S, role: seller.role.S });

    return accessToken;
  }

  static async getSellerByIdAndEmail(id, email) {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'id = :id AND email = :email',
      ExpressionAttributeValues: {
        ':id': { S: id },
        ':email': { S: email }
      }
    });
    const result = await dynamoDB.send(command);

    return result.Items[0];
  }
}

module.exports = SellerService;
