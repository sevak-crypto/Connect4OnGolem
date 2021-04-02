@ -1,14 +1,20 @@
FROM node:12-alpine
# The instructions for the first stage
FROM node:10-alpine as builder

VOLUME /golem/work /golem/output /golem/resources /golem/code
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /golem/work
RUN apk --no-cache add python make g++

COPY package*.json ./
RUN npm install

RUN chmod -R 777 /golem/work
# The instructions for second stage
FROM node:10-alpine

RUN mkdir /golem/code2
ADD ./chess_engine /golem/code2/Connect4_Engine
ADD ./input.txt /golem/code2/input.txt
RUN chmod -R 777 /golem/code2
RUN chmod -R 777 /golem/work
WORKDIR /usr/src/app
COPY --from=builder node_modules node_modules

COPY . .

CMD [ "npm", “run”, "start:prod" ]
