
# Dependencies

### [localstack](https://github.com/localstack/localstack#requirements):

`pip install localstock`

### [awslocal](https://github.com/localstack/localstack#requirements):

`pip install awslocal`

# Run locally
Make sure you've compiled the project with `npm run build`.

## Set environment variables
Environment variables are passed in from `/scripts/environment.json` (specified in `scripts/setup_infra.sh`).

There's a `scripts/environment.json.example` that can be copied, which needs some values added
 - User and Password can be found in `mqwebuser.xml` in MQ.

## To start localstack, run:

`make start-localstack`

## Once the console shows it's ready (it will print out 'Ready.'), in another terminal run:

`make setup-and-send`

This will set up the infrastructure as well as send the message in `/scripts/message.txt` (as specified in `scripts/send_message.sh`) to the SQS queue.


## If you want to send another message after running `setup-and-send` you can also just run:

`make send-message`

## Notes
- Sending to the dead letter queue doesn't seem to work
  - We think this could be a localstack issue
  - We tested the lambda in AWS and the dead letter queue worked
