# myFridge Server

![Server CI](https://github.com/barclayd/Phone-Book-API/workflows/Server%20CI/badge.svg?branch=main)

Server for PhoneBook api. Built using Typescript, typeorm, type-graphql and Apollo Server.

### Features

* Node.js server that offers a GraphQL api to add users, contacts, addresses and phone numbers
* [CI](https://github.com/barclayd/Phone-Book-API/actions) using GitHub Actions
* GraphQL playground to interact with API
* Runnable locally and within Docker and Docker Compose

### Decisions behind Tech Stack

* TypeORM used to provide rich, object oriented business model to reflect the business domain. Reduced time to generate code to run against relational database
* GraphQL used to abstract complexity from traditional REST APIs. Provides a schema that can be consumed by a client to provide rich typings. Gives flexibility to frontend to consume as much data as it requires for business logic, preventing over-fetching and under-fetching
* Type-graphql used to allow seamless schema definition via rich decorators in entities
* Postgres used due to its excellent open source, object relational database system that suits the problem at hand

### How to set up project locally

```shell script
git clone https://github.com/barclayd/Phone-Book-API.git
cd phone-book-api
npm install
npm run setup:dev
```

### How to run in development mode

```shell script
npm run start:dev
```

Once the development server is up and running, you can navigate to `localhost:4000/graphql` to interact with a GraphQL playground.
This allows you to execute queries and mutations to read and update data in the database.

### How to run test

##### Unit tests

```shell script
npm run test:unit
```

##### Integration tests

```shell script
npm run test:integration
```

### How to build for production

```shell script
npm run build
```

### How to generate GraphQL schema for client

```shell script
npm run generate:schema
```

### How to run in Docker using DockerCompose

```shell script
npm run start:docker
```

### CI

* GitHub Actions is in operation as a CI pipeline to verify the passing of unit and integration tests on each push in a PR branch to ``main``
