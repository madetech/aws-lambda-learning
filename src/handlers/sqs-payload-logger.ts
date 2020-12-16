import { SQSEvent } from "aws-lambda";
import * as https from 'https';
import axios, { AxiosInstance } from 'axios';

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  })
});

export const pushMessageToMq = async (event: SQSEvent, instance: AxiosInstance = axiosInstance ): Promise<void> => {
  console.info(`Received ${event.Records.length} records`);
  await Promise.all(event.Records.map(async (record) => {
  console.info("Posting record to MQ");
  const URL = `https://${process.env.MQ_USER}:${process.env.MQ_PASSWORD}@${process.env.MQ_HOST}:${process.env.MQ_PORT}/ibmmq/rest/v2/messaging/qmgr/${process.env.MQ_QUEUE_MANAGER}/queue/${process.env.MQ_QUEUE}/message`;
  console.log(`Posting to: ${URL}`);
  await instance.post(
    URL,
    record,
    {
    headers: {
      "ibm-mq-rest-csrf-token": "blank",
      "Content-Type": "text/plain;charset=utf-8"
    },
    }
  )
  }));
}
