module.exports = {
  PORT: process.env.PORT || 4000,
  LOW_STOCK_THRESHOLD: process.env.LOW_STOCK_THRESHOLD || 10,
  JWT_SECRET: process.env.JWT_SECRET || 'test',
  PINO_LOG_LEVEL: process.env.PINO_LOG_LEVEL || 'trace',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  SNS_PRODUCT_EVENTS_TOPIC_ARN: process.env.SNS_PRODUCT_EVENTS_TOPIC_ARN,
};
