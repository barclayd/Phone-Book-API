#!/bin/bash

dropdb 'phonebook-api-dev'
createdb 'phonebook-api-dev'
rm -rf .env
./scripts/generateEnv.sh yourFavouritePrivateAccessToken yourFavouriteRefreshToken
