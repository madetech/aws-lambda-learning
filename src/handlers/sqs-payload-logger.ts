import {SQSEvent} from "aws-lambda";
import axios from 'axios';
import * as aws from 'aws-sdk';

/**
 * A Lambda function that logs the payload received from SQS.
 */
export const pushMessageToMq = async (event: SQSEvent): Promise<void> => {
    event.Records.forEach((record) => {
        axios.post(
            `https://${process.env.MQ_HOST}:${process.env.MQ_PORT}/ibmmq/rest/v1/messaging/qmgr/QM1/queue/${process.env.MQ_QUEUE}/message`,
            record,
            {
                headers: {
                    "ibm-mq-rest-csrf-token": "blank",
                    "Content-Type": "text/plain;charset=utf-8",
                    "Authorization": `Basic ${process.env.MQ_USER}:${process.env.MQ_PASSWORD}`
                },
            }
        ).catch(() => {
            const SQS = new aws.SQS();
            console.log(SQS);
            const params = {
                // Remove DelaySeconds parameter and value for FIFO queues
               DelaySeconds: 10,
               MessageAttributes: {
                 "Title": {
                   DataType: "String",
                   StringValue: "The Whistler"
                 },
                 "Author": {
                   DataType: "String",
                   StringValue: "John Grisham"
                 },
                 "WeeksOn": {
                   DataType: "Number",
                   StringValue: "6"
                 }
               },
               MessageBody: "Information about current NY Times fiction bestseller for week of 12/11/2016.",
               // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
               // MessageGroupId: "Group1",  // Required for FIFO queues
               QueueUrl: "SQS_QUEUE_URL"
             };
             console.log(SQS.sendMessage(params))
             SQS.sendMessage(params)
        });
    });
}
