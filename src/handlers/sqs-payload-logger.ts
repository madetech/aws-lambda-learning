import {SQSEvent} from "aws-lambda";
import axios from 'axios';

/**
 * A Lambda function that logs the payload received from SQS.
 */
export const pushMessageToMq = async (event: SQSEvent): Promise<void> => {
    const record = event.Records[0];
}
