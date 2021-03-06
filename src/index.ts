import { SQSEvent } from "aws-lambda";
import MqGateway from "./gateways/mq-gateway"

export const sendMessage = async (event: SQSEvent ): Promise<void> => {
  console.info(`Received ${event.Records.length} records`);
  
  const env = {
    MQ_USER: process.env.MQ_USER,
    MQ_PASSWORD: process.env.MQ_PASSWORD,
    MQ_HOST: process.env.MQ_HOST,
    MQ_PORT: process.env.MQ_PORT,
    MQ_QUEUE_MANAGER: process.env.MQ_QUEUE_MANAGER,
    MQ_QUEUE: process.env.MQ_QUEUE
  }

  await Promise.all(event.Records.map(async (record) => {
    const mqGateway = new MqGateway(JSON.stringify(record), env);
    await mqGateway.execute();
  }));
}
