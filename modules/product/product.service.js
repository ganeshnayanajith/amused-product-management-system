const Product = require('./product.model');
const { dynamoDB } = require('../../config/aws-config');
const { PutCommand, ScanCommand, DeleteCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const logger = require('../../lib/logger');
const CustomHttpError = require('../../lib/custom-http-error');
const { HTTP_CODES, ERRORS } = require('../../lib/constants');
const TABLE_NAME = 'Products';
const AwsSnsService = require('../../lib/services/aws-sns-service');
const { LOW_STOCK_THRESHOLD } = require('../../secret-configs');

class ProductService {

  static async createProduct(sellerId, productData) {

    const existingProduct = await this.getProductByName(sellerId, productData.productName);
    if (existingProduct) {
      throw new CustomHttpError(HTTP_CODES.BAD_REQUEST, ERRORS.VALIDATION_ERROR, 'Product already exists');
    }

    const id = crypto.randomUUID();
    const product = new Product(
      id,
      sellerId,
      productData.productName,
      productData.description,
      productData.price,
      productData.quantity,
      productData.category
    );

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: product
    });

    await dynamoDB.send(command);

    // Publish SNS event for product creation
    await AwsSnsService.publishProductEvent(id, sellerId, 'product_created', product);

    return product;
  }

  static async getAllProducts(sellerId) {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'sellerId = :sellerId',
      ExpressionAttributeValues: {
        ':sellerId': sellerId
      }
    });

    const result = await dynamoDB.send(command);
    logger.info(result);
    return result.Items;
  }

  static async getProduct(sellerId, id) {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'id = :id AND sellerId = :sellerId',
      ExpressionAttributeValues: {
        ':id': id,
        ':sellerId': sellerId
      }
    });

    const result = await dynamoDB.send(command);
    logger.info(result);
    return result.Items[0];
  }

  static async getProductByName(sellerId, productName) {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'productName = :productName AND sellerId = :sellerId',
      ExpressionAttributeValues: {
        ':productName': productName,
        ':sellerId': sellerId
      }
    });

    const result = await dynamoDB.send(command);
    logger.info(result);
    return result.Items[0];
  }

  static async deleteProduct(sellerId, id) {
    try {

      const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id },
        ConditionExpression: 'sellerId = :sellerId',
        ExpressionAttributeValues: {
          ':sellerId': sellerId
        }
      });

      await dynamoDB.send(command);
      logger.info('Product deleted successfully');
      return true;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        logger.info('Product not found');
        throw new CustomHttpError(HTTP_CODES.NOT_FOUND, ERRORS.NOT_FOUND_ERROR, 'Product not found');
      }
      throw error;
    }
  }

  static async updateProduct(sellerId, id, updates) {
    const existingProduct = await this.getProductByName(sellerId, updates.productName);
    if (existingProduct) {
      throw new CustomHttpError(HTTP_CODES.BAD_REQUEST, ERRORS.VALIDATION_ERROR, 'Product already exists');
    }
    let updateExpression = 'SET updatedAt = :updatedAt';
    const expressionAttributeNames = {};
    const expressionAttributeValues = {
      ':sellerId': sellerId,
      ':updatedAt': new Date().toISOString()
    };

    if (updates.productName) {
      updateExpression += ', #productName = :productName';
      expressionAttributeNames['#productName'] = 'productName';
      expressionAttributeValues[':productName'] = updates.productName;
    }

    if (updates.description) {
      updateExpression += ', description = :description';
      expressionAttributeValues[':description'] = updates.description;
    }

    if (updates.price) {
      updateExpression += ', price = :price';
      expressionAttributeValues[':price'] = updates.price;
    }

    if (updates.quantity) {
      updateExpression += ', quantity = :quantity';
      expressionAttributeValues[':quantity'] = updates.quantity;
    }

    if (updates.category) {
      updateExpression += ', category = :category';
      expressionAttributeValues[':category'] = updates.category;
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      ConditionExpression: 'sellerId = :sellerId',
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    try {
      const result = await dynamoDB.send(command);

      // Publish SNS event for product update
      await AwsSnsService.publishProductEvent(id, sellerId, 'product_updated', updates);

      if (result.Attributes.quantity <= LOW_STOCK_THRESHOLD) {
        await AwsSnsService.publishProductEvent(id, sellerId, 'low_stock', result.Attributes);
      }

      return result.Attributes;

    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        return null;
      }
      throw error;
    }
  }
}

module.exports = ProductService;
