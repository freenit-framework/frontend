#!/bin/sh

BIN_DIR=`dirname $0`
PROJECT_ROOT=`readlink -f "${BIN_DIR}/.."`

cd ${PROJECT_ROOT}
yarn install
echo "Frontend"
echo "========"
yarn start
sleep 10
