#!/bin/bash

dropdb 'phonebook-api'
createdb 'phonebook-api'
npm run start:dev
