#!/bin/bash

touch .env
{
  echo "ACCESS_TOKEN_SECRET=$1"
  echo "REFRESH_TOKEN_SECRET=$2"
} >> .env
