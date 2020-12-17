import { SQSRecord } from "aws-lambda";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import * as https from "https";

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  })
});

export async function pushMessageToMq(record: SQSRecord, instance: AxiosInstance = axiosInstance ): Promise<AxiosResponse> {
  const URL = `https://${process.env.MQ_USER}:${process.env.MQ_PASSWORD}@${process.env.MQ_HOST}:${process.env.MQ_PORT}/ibmmq/rest/v2/messaging/qmgr/${process.env.MQ_QUEUE_MANAGER}/queue/${process.env.MQ_QUEUE}/message`;
  console.log(`Posting to: ${URL}`);
  const response = await instance.post(
    URL,
    record,
    {
      headers: {
        "ibm-mq-rest-csrf-token": "blank",
        "Content-Type": "text/plain;charset=utf-8"
      }
    }
  )
  return response;
}