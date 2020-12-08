import {SQSEvent} from "aws-lambda";
import axios from 'axios';
import * as aws from 'aws-sdk';

/**
 * A Lambda function that logs the payload received from SQS.
 */
export const pushMessageToMq = async (event: SQSEvent): Promise<void> => {
    console.info(`Received ${event.Records.length} records`);
    await Promise.all(event.Records.map(async (record) => {
        console.info("Posting record to MQ");
        await axios.post(
            `https://${process.env.MQ_HOST}:${process.env.MQ_PORT}/ibmmq/rest/v1/messaging/qmgr/QM1/queue/${process.env.MQ_QUEUE}/message`,
            record,
            {
                headers: {
                    "ibm-mq-rest-csrf-token": "blank",
                    "Content-Type": "text/plain;charset=utf-8",
                    "Authorization": `Basic ${process.env.MQ_USER}:${process.env.MQ_PASSWORD}`
                },
            }
        ).catch(async () => {
            console.info("Failed to post to MQ");
            console.info(`Pushing to ${process.env.DEAD_LETTER_QUEUE}`)
            const SQS = new aws.SQS();
            const params = {
                // Remove DelaySeconds parameter and value for FIFO queues
               DelaySeconds: 10,
               MessageBody: JSON.stringify(record),
               QueueUrl: process.env.DEAD_LETTER_QUEUE
             };

            await SQS.sendMessage(params).promise()
        });
    }));
}
