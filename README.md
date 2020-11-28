# PhoneBook API Server

![Server CI](https://github.com/barclayd/Phone-Book-API/workflows/Server%20CI/badge.svg?branch=main)

Server for PhoneBook api. Built using Typescript, typeorm, type-graphql and Apollo Server.

### Features

* Node.js server that offers a GraphQL api to add users, contacts, addresses and phone numbers
* [CI](https://github.com/barclayd/Phone-Book-API/actions) using GitHub Actions
* GraphQL playground to interact with API
* Full JWT token authentication with ``refresh_token`` and ``access_tokens`` issued to clients
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

### How to seed database with mock data via GraphQL playground

Once the development server is running and launched, run the following command in GraphQL playground

```graphql
mutation {
  mockData
}
```

Then login to the server in order to retrieve an ``access_token``:

```graphql
mutation {
  login(email: "test@phonebookapi.com", password: "test") {
    accessToken
  }
}
```

In the response you will find ``accessToken: "some.value"``. Copy the access token returned to use as a header for the contacts query:

Under ``HTTP Headers`` section in the bottom left of the GraphQL playground, add the following object, replacing ``<accessToken>`` with your copied token:

```
{
  "authorization": "Bearer <accessToken>"
}
```
You can now execute the following query to view contacts within the database

```graphql
query ContactsQuery {
  contacts(sortOrder: DESC, take: 5, skip: 1) {
    count
    contacts {
      id
      firstName
      lastName
      address {
        streetAddress
      }
    }
  }
}
```

You should now receive mock contacts retrieved from the database.

### How to seed database with mock data via terminal

Once the development server is running and launched, run the following command in your ``command prompt`` or ``terminal``

```shell script
curl 'http://localhost:4000/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:4000' --data-binary '{"query":"mutation {\n  mockData\n}\n"}' --compressed
```

Then login to the server in order to retrieve an ``access_token``:

```shell script
curl 'http://localhost:4000/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:4000' --data-binary '{"query":"mutation {\n  login(email: \"test@phonebookapi.com\", password: \"test\") {\n    accessToken\n  }\n}\n"}' --compressed
```

In the response you will find ``accessToken: "some.value"``. Copy the access token returned to use as a header for the contacts query and replace ``<accessToken>`` with the token copied in the curl command below:

```shell script
curl 'http://localhost:4000/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:4000' -H 'authorization: Bearer <accessToken>' --data-binary '{"query":"query ContactsQuery {\n  contacts(sortOrder: DESC, take: 5, skip: 2) {\n    count\n    contacts {\n      id\n      firstName\n      lastName\n      address {\n        streetAddress\n      }\n    }\n  }\n}\n"}' --compressed
```

You should now receive mock contacts retrieved from the database.

### How to run tests

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

### How to close Docker Compose

```shell script
docker-compose down
```

### CI

* GitHub Actions is in operation as a CI pipeline to verify the passing of unit and integration tests on each push in a PR branch to ``main``

### Future Improvements

If I had more time, I would implement the following:

* Improved authorisation for all API calls
* Improve range of testing for unhappy path
* Implement a CD solution using GitHub actions to deploy server to production
* Improve validation and sanitization of user input
