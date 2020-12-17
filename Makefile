.PHONY: start-localstack
start-localstack:
	./scripts/start_localstack.sh  
	
.PHONY: setup-and-send
setup-and-send:
	./scripts/setup_infra.sh && ./scripts/send_message.sh

.PHONY: send-message
send-message:
	./scripts/send_message.sh