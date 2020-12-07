import {SQSEvent} from "aws-lambda";
import axios from 'axios';

/**
 * A Lambda function that logs the payload received from SQS.
 */
export const pushMessageToMq = async (event: SQSEvent): Promise<void> => {
    const record = event.Records[0];
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
    )
}
