#!/bin/bash

docker build --build-arg ACCESS_TOKEN_SECRET="$1" --build-arg REFRESH_TOKEN_SECRET="$2" -t phonebook-api-test -f Dockerfile.test .
docker tag phonebook-api-test phonebook-api-test:latest
docker-compose up -d

