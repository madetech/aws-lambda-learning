import { SQSEvent } from "aws-lambda";
import { pushMessageToMq } from "./gateways/mq-gateway"

export const sendMessage = async (event: SQSEvent ): Promise<void> => {
  console.info(`Received ${event.Records.length} records`);
  await Promise.all(event.Records.map(async (record) => {
    await pushMessageToMq(record);
  }));
}
