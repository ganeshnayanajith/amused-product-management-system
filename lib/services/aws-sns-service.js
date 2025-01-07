const { PublishCommand } = require("@aws-sdk/client-sns");
const { sns } = require('../../config/aws-config');
const logger = require('../logger');
const { SNS_PRODUCT_EVENTS_TOPIC_ARN } = require('../../secret-configs');

class AwsSnsService {
  static async publishProductEvent(productId, sellerId, event, details) {
    const message = {
      event,
      productId,
      sellerId, 
      details,
      timestamp: new Date().toISOString(),
    };

    const params = new PublishCommand({
      TopicArn: SNS_PRODUCT_EVENTS_TOPIC_ARN,
      Message: JSON.stringify(message),
      Subject: event,
      MessageGroupId: productId,
      MessageDeduplicationId: productId
    });

    try {
      await sns.send(params);
      logger.info(`Published ${event} event to SNS. ${JSON.stringify(message)}`);
    } catch (error) {
      logger.error(`Failed to publish ${event} event: ${error}`);
    }
  }
}

module.exports = AwsSnsService;