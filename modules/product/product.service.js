const Product = require('./product.model');
const { dynamoDB } = require('../../config/aws-config');
const { PutCommand, GetCommand, ScanCommand, DeleteCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const logger = require('../../lib/logger');
const CustomHttpError = require('../../lib/custom-http-error');
const { HTTP_CODES, ERRORS } = require('../../lib/constants');
const TABLE_NAME = 'Products';
const AwsSnsService = require('../../lib/services/aws-sns-service');
const { LOW_STOCK_THRESHOLD } = require('../../secret-configs');

class ProductService {

  static async createProduct(sellerId, productData) {
    const id = crypto.randomUUID();
    const product = new Product(
      id,
      sellerId,
      productData.name,
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

  static async getAllProducts() {
    const command = new ScanCommand({
      TableName: TABLE_NAME
    });

    const result = await dynamoDB.send(command);
    logger.info(result);
    return result.Items;
  }

  static async getProduct(id) {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    });

    const result = await dynamoDB.send(command);
    logger.info(result);
    return result.Item;
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
    let updateExpression = 'SET updatedAt = :updatedAt';
    const expressionAttributeNames = {};
    const expressionAttributeValues = {
      ':sellerId': sellerId,
      ':updatedAt': new Date().toISOString()
    };

    if (updates.name) {
      updateExpression += ', #name = :name';
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = updates.name;
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
