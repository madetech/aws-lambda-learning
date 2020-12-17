import { SQSEvent } from "aws-lambda"
import { sendMessage } from "../../src";
import * as mqGateway from "../../src/gateways/mq-gateway"

jest.mock('../../src/gateways/mq-gateway', () => {
  return {
    pushMessageToMq: jest.fn(() => { return 200 })
  }
});


describe('Test for sendMessage', function () {
  process.env.MQ_HOST = 'a-host';
  process.env.MQ_PORT = '1999';
  process.env.MQ_QUEUE_MANAGER = 'QMGR';
  process.env.MQ_QUEUE = 'my-fake-queue';
  process.env.MQ_USER = 'a-user';
  process.env.MQ_PASSWORD = 'a-password';

  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should call the MQ gateway with a record when a message event is triggered', async () => {
    const event : SQSEvent = {
      Records: [
        {
          "messageId": "059f36b4-87a3-44ab-83d2-661975830a7d",
          "receiptHandle": "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...",
          "body": "Test message.",
          "attributes": {
            "ApproximateReceiveCount": "1",
            "SentTimestamp": "1545082649183",
            "SenderId": "AIDAIENQZJOLO23YVJ4VO",
            "ApproximateFirstReceiveTimestamp": "1545082649185"
          },
          "messageAttributes": {},
          "md5OfBody": "e4e68fb7bd0e697a0ae8f1bb342846b3",
          "eventSource": "aws:sqs",
          "eventSourceARN": "arn:aws:sqs:us-east-2:123456789012:my-queue",
          "awsRegion": "us-east-2"
        },
      ]
    };
    
    await sendMessage(event);

    expect(mqGateway.pushMessageToMq).toBeCalledWith(event.Records[0])
  });
  
  it('should call the MQ gateway multiple times when a message event with multiple records is triggered', async () => {
    const event : SQSEvent = {
      Records: [
        {
          "messageId": "059f36b4-87a3-44ab-83d2-661975830a7d",
          "receiptHandle": "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...",
          "body": "Test message.",
          "attributes": {
            "ApproximateReceiveCount": "1",
            "SentTimestamp": "1545082649183",
            "SenderId": "AIDAIENQZJOLO23YVJ4VO",
            "ApproximateFirstReceiveTimestamp": "1545082649185"
          },
          "messageAttributes": {},
          "md5OfBody": "e4e68fb7bd0e697a0ae8f1bb342846b3",
          "eventSource": "aws:sqs",
          "eventSourceARN": "arn:aws:sqs:us-east-2:123456789012:my-queue",
          "awsRegion": "us-east-2"
        },
        {
          "messageId": "2e1424d4-f796-459a-8184-9c92662be6da",
          "receiptHandle": "AQEBzWwaftRI0KuVm4tP+/7q1rGgNqicHq...",
          "body": "Test message.",
          "attributes": {
            "ApproximateReceiveCount": "1",
            "SentTimestamp": "1545082650636",
            "SenderId": "AIDAIENQZJOLO23YVJ4VO",
            "ApproximateFirstReceiveTimestamp": "1545082650649"
          },
          "messageAttributes": {},
          "md5OfBody": "e4e68fb7bd0e697a0ae8f1bb342846b3",
          "eventSource": "aws:sqs",
          "eventSourceARN": "arn:aws:sqs:us-east-2:123456789012:my-queue",
          "awsRegion": "us-east-2"
        }
      ]
    };
    
    await sendMessage(event);

    expect(mqGateway.pushMessageToMq).toBeCalledTimes(2);
    event.Records.forEach((record) => {
      expect(mqGateway.pushMessageToMq).toBeCalledWith(record)
    })
  });
});
