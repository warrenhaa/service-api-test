const { Producer } = require('sqs-producer');
const { v4: uuidV4 } = require('uuid');

let producer = null;
if (process.env.SQS_SAFE_4_CAMERA_QUEUE_URL) {
    producer = Producer.create({
        queueUrl: process.env.SQS_SAFE_4_CAMERA_QUEUE_URL,
        region: process.env.SQS_AWS_REGION,
        accessKeyId: process.env.SQS_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.SQS_AWS_SECRET_ACCESS_KEY,
    });
}

const getRandomString = function () {
    const uid = uuidV4();
    const rval = uid.toString();
    return rval;
};
const sendProducer = async function (event) {
    if (process.env.SQS_SAFE_4_CAMERA_QUEUE_URL && producer) {
        try {
            const id = getRandomString();
            const obj = {
                id,
                body: JSON.stringify(event),
            };
            await producer.send([obj]);
        } catch (error) {
            console.log(error);
        }
    }
};

module.exports = {
    sendProducer,
};