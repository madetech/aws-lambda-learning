import {SQSEvent} from "aws-lambda";
import axios, { AxiosInstance } from 'axios';
import * as moxios from 'moxios';
import { pushMessageToMq } from "../../../src/handlers/sqs-payload-logger";

describe('Test for sqs-payload-logger', function () {
  let axiosInstance: AxiosInstance;

    beforeEach(() => {
        axiosInstance = axios.create();
        moxios.install(axiosInstance);
    });

    afterEach(() => {
        moxios.uninstall(axiosInstance);
    });

    process.env.MQ_HOST = 'a-host';
    process.env.MQ_PORT = '1999';
    process.env.MQ_QUEUE_MANAGER = 'QMGR';
    process.env.MQ_QUEUE = 'my-fake-queue';
    process.env.MQ_USER = 'a-user';
    process.env.MQ_PASSWORD = 'a-password';

    const URL = `https://${process.env.MQ_USER}:${process.env.MQ_PASSWORD}@${process.env.MQ_HOST}:${process.env.MQ_PORT}/ibmmq/rest/v2/messaging/qmgr/${process.env.MQ_QUEUE_MANAGER}/queue/${process.env.MQ_QUEUE}/message`;
  
    it('should call the MQ API when a message event is triggered', async () => {
    
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
      URL,
      {
        status: 200,
      }
    );
    await pushMessageToMq(event, axiosInstance);

    const request = moxios.requests.mostRecent();
    expect(request.config.method).toEqual("post");
    expect(request.url)
        .toEqual(URL);
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
          URL,
          {
              status: 200,
          }
      );
      await pushMessageToMq(event, axiosInstance);

      event.Records.forEach((record, index) => {
          const request = moxios.requests.at(index);
          expect(request).toBeDefined();
          expect(request.config.method).toEqual("post");
          expect(request.url)
              .toEqual(URL);
      });
  });
});
