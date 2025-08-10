const { Producer } = require('sqs-producer');
const { getRandomString } = require('../utils/Helper');
const Logger = require('../utils/Logger');

const producer = Producer.create({
  queueUrl: process.env.EMAIL_QUEUE_URL,
  region: process.env.SQS_AWS_REGION,
  accessKeyId: process.env.SQS_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.SQS_AWS_SECRET_ACCESS_KEY,
});

const sendProducer = async function (event) {
  try {
    const id = getRandomString();
    const obj = {
      id,
      body: JSON.stringify(event),
    };
    await producer.send([obj]);
  } catch (error) {
    Logger.error('Error ', { error: error.stack });
  }
};

module.exports = {
  sendProducer,
};
