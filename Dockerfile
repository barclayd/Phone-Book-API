# build and complie typescript code
FROM node:12.16.0-slim as build
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# only install non-dev dependencies
FROM node:12.16.0-slim
WORKDIR /usr/app
COPY package*.json ./
RUN npm install --production
ENV NODE_ENV production

COPY --from=build /usr/app/dist ./dist

COPY ormconfig.js .
COPY ./scripts/generateEnv.sh .
COPY ./scripts/setupDev.sh .
RUN apt-get update
RUN apt-get -y install curl
ARG ACCESS_TOKEN_SECRET
ARG REFRESH_TOKEN_SECRET
RUN /usr/app/generateEnv.sh $ACCESS_TOKEN_SECRET $REFRESH_TOKEN_SECRET
EXPOSE 4000
CMD npm run start:production
