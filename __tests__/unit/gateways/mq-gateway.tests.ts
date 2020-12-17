import axios from "axios";
import * as moxios from "moxios";
import { pushMessageToMq } from "../../../src/gateways/mq-gateway";

process.env.MQ_HOST = 'a-host';
process.env.MQ_PORT = '1999';
process.env.MQ_QUEUE_MANAGER = 'QMGR';
process.env.MQ_QUEUE = 'my-fake-queue';
process.env.MQ_USER = 'a-user';
process.env.MQ_PASSWORD = 'a-password';

const URL = `https://${process.env.MQ_USER}:${process.env.MQ_PASSWORD}@${process.env.MQ_HOST}:${process.env.MQ_PORT}/ibmmq/rest/v2/messaging/qmgr/${process.env.MQ_QUEUE_MANAGER}/queue/${process.env.MQ_QUEUE}/message`;
const axiosInstance = axios.create();
const record = {
    "messageId": "059f36b4-87a3-44ab-832-661975830a7d",
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
};

describe('Mq-gateway', function () {
  beforeEach(() => {
    moxios.install(axiosInstance);
  });

  afterEach(() => {
    moxios.uninstall(axiosInstance);
  });
  
  it('makes correct call to the MQ API returns the response', async () => {
    moxios.stubRequest(
      URL,
      {
      status: 200,
      }
    );
    
    const response = await pushMessageToMq(record, axiosInstance);

    const request = moxios.requests.mostRecent();
    expect(request.config.method).toEqual("post");
    expect(request.url)
      .toEqual(URL);
    expect(JSON.parse(request.config.data)).toEqual(record);
    expect(response.status).toEqual(200)
  });
});

