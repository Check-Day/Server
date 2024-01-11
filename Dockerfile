FROM amazon/aws-cli as awscli

FROM node:current-alpine3.18

WORKDIR /app

COPY --from=awscli /usr/local/aws-cli /usr/local/aws-cli
COPY --from=awscli /usr/local/bin/aws /usr/local/bin/aws

RUN apk update && apk add --no-cache \
    groff \
    less \
    mailcap \
    python3 \
    py3-pip \
    mysql-client \
    && rm -rf /var/cache/apk/*

ENV PATH="/usr/local/aws-cli/v2/current/bin:$PATH"
ENV AWS_ACCESS_KEY_ID=NotSet
ENV AWS_SECRET_ACCESS_KEY=NotSet
ENV AWS_DEFAULT_REGION=us-east-1

COPY ["package.json", "./"]
RUN npm install
COPY . .

COPY aws-config.sh /usr/local/bin/aws-config.sh
RUN chmod +x /app/time/wait.sh
RUN chmod +x /usr/local/bin/aws-config.sh