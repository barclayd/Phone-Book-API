#!/bin/bash

dropdb 'phonebook-api-dev'
createdb 'phonebook-api-dev'
npm run start:dev
