#!/bin/bash

if [ "$1" = "dev" ]
then
dropdb 'phonebook-api-test-dev'
createdb 'phonebook-api-test-dev'
npm run test:db:setup
else
  NODE_ENV=ci npm run test:db:setup
fi
