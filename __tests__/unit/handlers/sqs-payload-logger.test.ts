import {SQSEvent} from "aws-lambda";
import * as moxios from 'moxios';
import { pushMessageToMq } from "../../../src/handlers/sqs-payload-logger";
import * as aws from 'aws-sdk';

const SQSMocked = {
  sendMessage: jest.fn(),
  promise: jest.fn(),
};

jest.mock('aws-sdk', () => {
  return {
    SQS: jest.fn(() => SQSMocked)
  };
});



describe('Test for sqs-payload-logger', function () {
    beforeEach(() => {
        moxios.install();
    });

    afterEach(() => {
        moxios.uninstall();
    });

  // Example curl post message
  // curl -i -k https://localhost:9443/ibmmq/rest/v1/messaging/qmgr/QM1/queue/DEV.QUEUE.1/message -X POST -u user:password -H "ibm-mq-rest-csrf-token: blank" -H "Content-Type: text/plain;charset=utf-8" -d "Hello World!"
  it('should call the MQ API when a message event is triggered', async () => {
    process.env.MQ_HOST = 'a-host';
    process.env.MQ_PORT = '1999';
    process.env.MQ_QUEUE = 'my-fake-queue';
    process.env.MQ_USER = 'a-user';
    process.env.MQ_PASSWORD = 'a-password';

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
    moxios.stubRequest(
     `https://${process.env.MQ_HOST}:${process.env.MQ_PORT}/ibmmq/rest/v1/messaging/qmgr/QM1/queue/${process.env.MQ_QUEUE}/message`,
     {
        status: 200,
     }
    );
    await pushMessageToMq(event);

    const request = moxios.requests.mostRecent();
    expect(request.config.method).toEqual("post");
    expect(request.url)
        .toEqual(`https://${process.env.MQ_HOST}:${process.env.MQ_PORT}/ibmmq/rest/v1/messaging/qmgr/QM1/queue/${process.env.MQ_QUEUE}/message`);
    expect(JSON.parse(request.config.data)).toEqual(event.Records[0]);
  });
  it('should call the MQ endpoint for each record supplied by the event', async () => {
      process.env.MQ_HOST = 'a-host';
      process.env.MQ_PORT = '1999';
      process.env.MQ_QUEUE = 'my-fake-queue';
      process.env.MQ_USER = 'a-user';
      process.env.MQ_PASSWORD = 'a-password';

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
      moxios.stubRequest(
          `https://${process.env.MQ_HOST}:${process.env.MQ_PORT}/ibmmq/rest/v1/messaging/qmgr/QM1/queue/${process.env.MQ_QUEUE}/message`,
          {
              status: 200,
          }
      );
      await pushMessageToMq(event);

      event.Records.forEach((record, index) => {
          const request = moxios.requests.at(index);
          expect(request).toBeDefined();
          expect(request.config.method).toEqual("post");
          expect(request.url)
              .toEqual(`https://${process.env.MQ_HOST}:${process.env.MQ_PORT}/ibmmq/rest/v1/messaging/qmgr/QM1/queue/${process.env.MQ_QUEUE}/message`);
      });
  });
  it('should push message to SQS dead letter queue when pushing to MQ errors', (done) => {
    process.env.MQ_HOST = 'a-host';
    process.env.MQ_PORT = '1999';
    process.env.MQ_QUEUE = 'my-fake-queue';
    process.env.MQ_USER = 'a-user';
    process.env.MQ_PASSWORD = 'a-password';
    process.env.DEAD_LETTER_QUEUE = 'dead-letter-queue';
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
            }
        ]
    };
    moxios.stubRequest(
        `https://${process.env.MQ_HOST}:${process.env.MQ_PORT}/ibmmq/rest/v1/messaging/qmgr/QM1/queue/${process.env.MQ_QUEUE}/message`,
        {
          status: 500
        }
    );
    pushMessageToMq(event);
    moxios.wait(() => {
      expect(SQSMocked.sendMessage).toBeCalledWith({
        DelaySeconds: 10,
        MessageBody: JSON.stringify(event.Records[0]),
        QueueUrl: 'dead-letter-queue'
      });
      done();
    });
  });
});
