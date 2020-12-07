"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A Lambda function that logs the payload received from SQS.
 */
exports.sqsPayloadLoggerHandler = async (event) => {
    // All log statements are written to CloudWatch by default. For more information, see
    // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
    console.info(JSON.stringify(event));
};
//# sourceMappingURL=sqs-payload-logger.js.map