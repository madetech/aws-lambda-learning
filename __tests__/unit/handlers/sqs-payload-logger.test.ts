import { pushMessageToMq } from "../../../src/handlers/sqs-payload-logger";
describe('Test for sqs-payload-logger', function () {
  // Example curl post message
  // curl -i -k https://localhost:9443/ibmmq/rest/v1/messaging/qmgr/QM1/queue/DEV.QUEUE.1/message -X POST -u user:password -H "ibm-mq-rest-csrf-token: blank" -H "Content-Type: text/plain;charset=utf-8" -d "Hello World!"
  it('a test', () => {
    process.env.MQ_HOST = 'a-host';
    process.env.MQ_PORT = '1999';
    process.env.MQ_QUEUE = 'my-fake-queue';
    pushMessageToMq(null);
    expect(axios.post).toBeCalledWith({
      url: `http://${env.MQ_HOST}:${env.MQ_PORT}....`
    });
  });
});
